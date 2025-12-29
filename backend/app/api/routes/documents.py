from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from app.core.database import get_db
from app.models.legal import Document, DocumentType, DocumentChunk, IngestionJob, IngestionStatus
from app.schemas.legal import DocumentCreate, DocumentResponse
from app.services.ingestion import get_ingestion_service

router = APIRouter()


@router.post("/", response_model=DocumentResponse)
async def create_document(
    document: DocumentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new legal document."""
    db_document = Document(
        title=document.title,
        document_type=document.document_type,
        citation=document.citation,
        jurisdiction=document.jurisdiction,
        agency=document.agency,
        effective_date=document.effective_date,
        source_url=document.source_url,
        raw_text=document.raw_text,
        extra_data=document.metadata,
    )
    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)
    return db_document


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    skip: int = 0,
    limit: int = 50,
    document_type: Optional[DocumentType] = None,
    jurisdiction: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List documents with optional filters."""
    query = select(Document)

    if document_type:
        query = query.where(Document.document_type == document_type)
    if jurisdiction:
        query = query.where(Document.jurisdiction == jurisdiction)

    query = query.offset(skip).limit(limit).order_by(Document.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific document by ID."""
    result = await db.execute(
        select(Document).where(Document.id == document_id)
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a document."""
    result = await db.execute(
        select(Document).where(Document.id == document_id)
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    await db.delete(document)
    await db.commit()
    return {"status": "deleted", "id": document_id}


@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    jurisdiction: str = Form("federal"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload and fully process a document.

    This endpoint:
    1. Parses the file (PDF, DOCX, HTML, TXT)
    2. Extracts text and metadata
    3. Chunks the text for RAG
    4. Stores chunks in ChromaDB with embeddings
    5. Creates a node in the Neo4j knowledge graph

    Returns processing results including extracted citations and entities.
    """
    # Validate file type
    allowed_extensions = {'.pdf', '.docx', '.doc', '.txt', '.html', '.htm'}
    filename = file.filename or "document"
    extension = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

    if extension and extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}. Allowed: {', '.join(allowed_extensions)}"
        )

    # Read file content
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    if len(content) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")

    try:
        # Run the full ingestion pipeline
        result = await get_ingestion_service().ingest_file(
            content=content,
            filename=filename,
            content_type=file.content_type or "",
            document_type=document_type,
            jurisdiction=jurisdiction,
            title=title,
        )

        # Also store in PostgreSQL for persistence
        doc_type_enum = {
            'statute': DocumentType.STATUTE,
            'regulation': DocumentType.REGULATION,
            'case_law': DocumentType.CASE_LAW,
            'executive_order': DocumentType.EXECUTIVE_ORDER,
            'guidance': DocumentType.GUIDANCE,
        }.get(result.get('document_type', 'regulation'), DocumentType.REGULATION)

        db_document = Document(
            id=result['document_id'],
            title=result['title'],
            document_type=doc_type_enum,
            jurisdiction=jurisdiction,
            raw_text=None,  # Don't store full text in DB to save space
            extra_data={
                "filename": filename,
                "content_type": file.content_type,
                "text_length": result.get('text_length', 0),
                "chunks_created": result.get('chunks_created', 0),
                "citations_found": result.get('citations_found', 0),
            },
        )
        db.add(db_document)
        await db.commit()

        return {
            "status": "success",
            "message": "Document processed and indexed successfully",
            **result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: DocumentType = DocumentType.REGULATION,
    jurisdiction: str = "federal",
    db: AsyncSession = Depends(get_db),
):
    """
    Simple upload endpoint (legacy).
    For full processing, use POST /ingest instead.
    """
    # Read file content
    content = await file.read()

    # Try to parse and extract text
    try:
        raw_text = get_ingestion_service().parser.parse(
            content,
            file.content_type or "",
            file.filename or ""
        )
    except Exception:
        raw_text = content.decode("utf-8", errors="ignore")

    document = Document(
        title=file.filename or "Uploaded Document",
        document_type=document_type,
        jurisdiction=jurisdiction,
        raw_text=raw_text,
        extra_data={"original_filename": file.filename, "content_type": file.content_type},
    )

    db.add(document)
    await db.commit()
    await db.refresh(document)

    return {
        "status": "uploaded",
        "document_id": document.id,
        "title": document.title,
        "message": "Document uploaded. Use POST /ingest for full processing.",
    }


@router.get("/jobs/{job_id}")
async def get_ingestion_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the status of an ingestion job."""
    result = await db.execute(
        select(IngestionJob).where(IngestionJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": job.id,
        "status": job.status.value,
        "source_type": job.source_type,
        "document_count": job.document_count,
        "processed_count": job.processed_count,
        "error_message": job.error_message,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "completed_at": job.completed_at,
    }
