"""API routes for legal data source integrations."""


from fastapi import APIRouter, HTTPException, Query

from app.services.ingestion import get_ingestion_service
from app.services.legal_apis import get_legal_data_service

router = APIRouter()


@router.get("/search")
async def search_sources(
    query: str = Query(..., min_length=2, description="Search query"),
    source: str | None = Query(None, description="Limit to specific source: ecfr, congress, courtlistener"),
    limit: int = Query(10, le=50, description="Results per source"),
):
    """
    Search across legal data sources.

    Returns results from eCFR (regulations), Congress.gov (statutes), and CourtListener (case law).
    """
    service = get_legal_data_service()

    if source == "ecfr":
        results = await service.search_regulations(query, limit=limit)
        return {"regulations": results}
    elif source == "congress":
        results = await service.search_statutes(query, limit=limit)
        return {"statutes": results}
    elif source == "courtlistener":
        results = await service.search_case_law(query, limit=limit)
        return {"case_law": results}
    else:
        return await service.search_all(query, limit_per_source=limit)


@router.get("/ecfr/titles")
async def get_cfr_titles():
    """Get list of all CFR titles."""
    service = get_legal_data_service()
    titles = await service.ecfr.get_titles()
    return {"titles": titles}


@router.get("/ecfr/structure/{title}")
async def get_cfr_structure(title: int):
    """Get the table of contents for a CFR title."""
    service = get_legal_data_service()
    structure = await service.ecfr.get_structure(title)
    return structure


@router.post("/ecfr/import")
async def import_cfr_regulation(
    title: int = Query(..., description="CFR title number"),
    part: int = Query(..., description="CFR part number"),
    section: str | None = Query(None, description="Specific section (e.g., '1.1')"),
):
    """
    Import a CFR regulation into the knowledge base.

    This fetches the regulation text from eCFR, processes it, and adds it to the
    vector store and knowledge graph.
    """
    legal_service = get_legal_data_service()
    ingestion_service = get_ingestion_service()

    # Fetch the regulation
    reg_data = await legal_service.import_regulation(title, part, section)

    if "error" in reg_data:
        raise HTTPException(status_code=404, detail=reg_data["error"])

    if not reg_data.get("text"):
        raise HTTPException(status_code=404, detail="Regulation text not found")

    # Process and ingest
    import uuid
    document_id = f"ecfr-{title}-{part}" + (f"-{section}" if section else "") + f"-{uuid.uuid4().hex[:8]}"

    result = await ingestion_service.process_document(
        document_id=document_id,
        raw_text=reg_data["text"],
        title=reg_data["title"],
        document_type="regulation",
        jurisdiction="federal",
        agency=reg_data.get("agency"),
        citation=reg_data["citation"],
    )

    return {
        "status": "success",
        "message": f"Imported {reg_data['citation']}",
        **result,
    }


@router.get("/congress/bills")
async def get_bills(
    congress: int = Query(118, description="Congress number"),
    bill_type: str = Query("hr", description="Bill type: hr, s, hjres, sjres"),
    limit: int = Query(20, le=100),
):
    """Get list of bills from Congress."""
    service = get_legal_data_service()
    bills = await service.congress.get_bills(congress, bill_type, limit)
    return {"bills": bills}


@router.get("/congress/laws")
async def get_public_laws(
    congress: int = Query(118, description="Congress number"),
    limit: int = Query(20, le=100),
):
    """Get public laws from Congress."""
    service = get_legal_data_service()
    laws = await service.congress.get_public_laws(congress, limit)
    return {"laws": laws}


@router.get("/courtlistener/search")
async def search_court_opinions(
    query: str = Query(..., min_length=2),
    court: str | None = Query(None, description="Court ID to filter by"),
    limit: int = Query(20, le=100),
):
    """Search court opinions from CourtListener."""
    service = get_legal_data_service()
    opinions = await service.courtlistener.search_opinions(query, court=court, limit=limit)
    return {"opinions": opinions}


@router.get("/courtlistener/courts")
async def get_courts():
    """Get list of available courts."""
    service = get_legal_data_service()
    courts = await service.courtlistener.get_courts()
    return {"courts": courts}


@router.get("/status")
async def get_sources_status():
    """Check the status of each data source."""
    service = get_legal_data_service()

    # Test each source
    ecfr_status = "unknown"
    congress_status = "unknown"
    courtlistener_status = "unknown"

    try:
        titles = await service.ecfr.get_titles()
        ecfr_status = "available" if titles else "error"
    except Exception:
        ecfr_status = "error"

    try:
        # Congress.gov requires API key
        congress_status = "requires_api_key"
    except Exception:
        congress_status = "error"

    try:
        courts = await service.courtlistener.get_courts()
        courtlistener_status = "available" if courts else "error"
    except Exception:
        courtlistener_status = "error"

    return {
        "sources": {
            "ecfr": {
                "name": "eCFR (Code of Federal Regulations)",
                "status": ecfr_status,
                "base_url": "https://www.ecfr.gov",
            },
            "congress": {
                "name": "Congress.gov",
                "status": congress_status,
                "base_url": "https://api.congress.gov",
                "note": "Requires API key from api.congress.gov",
            },
            "courtlistener": {
                "name": "CourtListener (Free.Law)",
                "status": courtlistener_status,
                "base_url": "https://www.courtlistener.com",
            },
        }
    }
