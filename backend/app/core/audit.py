"""AI Audit Trail for legal query transparency and compliance.

In legal AI applications, audit trails are critical for:
1. Regulatory compliance - showing how decisions were made
2. Debugging - understanding why the AI gave a certain answer
3. Improvement - identifying patterns in queries and responses
4. Liability - documenting the AI's reasoning process

Each query creates an AuditRecord that captures the full context
of the AI's decision-making process.
"""

import uuid
from datetime import datetime

import structlog
from pydantic import BaseModel, Field

from app.core.feature_flags import FeatureFlag, is_enabled

logger = structlog.get_logger()


class AuditRecord(BaseModel):
    """A complete audit record for an AI query."""

    # Identifiers
    audit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: str | None = None  # Links to HTTP request

    # Input
    query: str
    filters: dict = Field(default_factory=dict)  # jurisdiction, doc_type, etc.

    # Retrieval
    sources_retrieved: int = 0
    top_source_ids: list[str] = Field(default_factory=list)
    top_source_scores: list[float] = Field(default_factory=list)
    graph_nodes_retrieved: int = 0

    # Reasoning
    chain_of_thought: str | None = None
    model_used: str | None = None
    tokens_used: int = 0

    # Output
    answer_length: int = 0
    confidence_score: float = 0.0
    ambiguity_flags: list[str] = Field(default_factory=list)

    # Metadata
    processing_time_ms: float = 0.0
    demo_mode: bool = False
    user_id: str | None = None  # If authenticated


# In-memory store for demo (production would use a database)
_audit_store: list[AuditRecord] = []
_MAX_STORE_SIZE = 1000  # Prevent memory bloat in demo


class AuditTrail:
    """Service for recording and querying AI audit records."""

    @staticmethod
    def record(
        query: str,
        answer: str,
        confidence_score: float,
        citations: list,
        chain_of_thought: str | None = None,
        ambiguity_flags: list[str] | None = None,
        processing_time_ms: float = 0.0,
        filters: dict | None = None,
        graph_context: list | None = None,
        model_used: str | None = None,
        tokens_used: int = 0,
        demo_mode: bool = False,
        request_id: str | None = None,
        user_id: str | None = None,
    ) -> AuditRecord | None:
        """
        Record an AI query for audit purposes.

        Returns the AuditRecord if audit logging is enabled, None otherwise.
        """
        if not is_enabled(FeatureFlag.AUDIT_LOGGING):
            return None

        record = AuditRecord(
            request_id=request_id,
            query=query,
            filters=filters or {},
            sources_retrieved=len(citations),
            top_source_ids=[c.document_id for c in citations[:5]] if citations else [],
            top_source_scores=[c.relevance_score for c in citations[:5]] if citations else [],
            graph_nodes_retrieved=len(graph_context) if graph_context else 0,
            chain_of_thought=chain_of_thought,
            model_used=model_used,
            tokens_used=tokens_used,
            answer_length=len(answer),
            confidence_score=confidence_score,
            ambiguity_flags=ambiguity_flags or [],
            processing_time_ms=processing_time_ms,
            demo_mode=demo_mode,
            user_id=user_id,
        )

        # Store the record
        _store_record(record)

        # Log a summary
        logger.info(
            "ai_query_audited",
            audit_id=record.audit_id,
            query_length=len(query),
            sources_retrieved=record.sources_retrieved,
            confidence_score=record.confidence_score,
            has_ambiguity_flags=len(record.ambiguity_flags) > 0,
            processing_time_ms=record.processing_time_ms,
        )

        return record

    @staticmethod
    def get_recent(limit: int = 50) -> list[AuditRecord]:
        """Get recent audit records (most recent first)."""
        return list(reversed(_audit_store[-limit:]))

    @staticmethod
    def get_by_id(audit_id: str) -> AuditRecord | None:
        """Get a specific audit record by ID."""
        for record in _audit_store:
            if record.audit_id == audit_id:
                return record
        return None

    @staticmethod
    def get_stats() -> dict:
        """Get summary statistics of audit records."""
        if not _audit_store:
            return {
                "total_queries": 0,
                "avg_confidence": 0.0,
                "avg_sources": 0.0,
                "avg_processing_time_ms": 0.0,
                "queries_with_flags": 0,
            }

        total = len(_audit_store)
        return {
            "total_queries": total,
            "avg_confidence": sum(r.confidence_score for r in _audit_store) / total,
            "avg_sources": sum(r.sources_retrieved for r in _audit_store) / total,
            "avg_processing_time_ms": sum(r.processing_time_ms for r in _audit_store) / total,
            "queries_with_flags": sum(1 for r in _audit_store if r.ambiguity_flags),
        }


def _store_record(record: AuditRecord) -> None:
    """Store an audit record (with size limit for demo)."""
    global _audit_store

    _audit_store.append(record)

    # Trim if over limit
    if len(_audit_store) > _MAX_STORE_SIZE:
        _audit_store = _audit_store[-_MAX_STORE_SIZE:]
