from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid

from app.core.database import Base


class DocumentType(str, enum.Enum):
    STATUTE = "statute"
    REGULATION = "regulation"
    CASE_LAW = "case_law"
    EXECUTIVE_ORDER = "executive_order"
    GUIDANCE = "guidance"
    PUBLIC_COMMENT = "public_comment"


class IngestionStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(Base):
    """Represents a legal document in the system."""

    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    citation = Column(String(200), nullable=True)  # e.g., "42 U.S.C. § 1983"
    jurisdiction = Column(String(100), nullable=True)  # e.g., "federal", "virginia"
    agency = Column(String(200), nullable=True)
    effective_date = Column(DateTime, nullable=True)
    source_url = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    extra_data = Column("metadata", JSON, default=dict)  # 'metadata' is reserved in SQLAlchemy

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title[:50]}, type={self.document_type})>"


class DocumentChunk(Base):
    """Represents a chunk of a document for RAG."""

    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    start_char = Column(Integer, nullable=True)
    end_char = Column(Integer, nullable=True)
    embedding_id = Column(String(100), nullable=True)  # ChromaDB ID
    extra_data = Column("metadata", JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    document = relationship("Document", back_populates="chunks")

    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, doc={self.document_id}, index={self.chunk_index})>"


class IngestionJob(Base):
    """Tracks document ingestion jobs."""

    __tablename__ = "ingestion_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(Enum(IngestionStatus), default=IngestionStatus.PENDING)
    source_type = Column(String(50), nullable=False)  # "file", "url", "api"
    source_path = Column(Text, nullable=True)
    document_count = Column(Integer, default=0)
    processed_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    extra_data = Column("metadata", JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<IngestionJob(id={self.id}, status={self.status})>"
