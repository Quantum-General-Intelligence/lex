from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    STATUTE = "statute"
    REGULATION = "regulation"
    CASE_LAW = "case_law"
    EXECUTIVE_ORDER = "executive_order"
    GUIDANCE = "guidance"
    PUBLIC_COMMENT = "public_comment"


class LegalNodeType(str, Enum):
    STATUTE = "Statute"
    REGULATION = "Regulation"
    CASE_LAW = "CaseLaw"
    EXECUTIVE_ORDER = "ExecutiveOrder"
    AGENCY = "Agency"


class RelationshipType(str, Enum):
    AUTHORIZES = "AUTHORIZES"  # Statute authorizes a regulation
    IMPLEMENTS = "IMPLEMENTS"  # Regulation implements a statute
    CITES = "CITES"  # Document cites another
    OVERTURNS = "OVERTURNS"  # Case law overturns a rule
    SUPERSEDES = "SUPERSEDES"  # Federal supersedes state
    AMENDS = "AMENDS"  # Document amends another
    REGULATES = "REGULATES"  # Agency regulates via document
    CONFLICTS_WITH = "CONFLICTS_WITH"  # Documents conflict


# Document Schemas
class DocumentCreate(BaseModel):
    title: str = Field(..., max_length=500)
    document_type: DocumentType
    citation: str | None = Field(None, max_length=200)
    jurisdiction: str | None = Field(None, max_length=100)
    agency: str | None = Field(None, max_length=200)
    effective_date: datetime | None = None
    source_url: str | None = None
    raw_text: str | None = None
    metadata: dict = Field(default_factory=dict)


class DocumentResponse(BaseModel):
    id: str
    title: str
    document_type: DocumentType
    citation: str | None
    jurisdiction: str | None
    agency: str | None
    effective_date: datetime | None
    source_url: str | None
    metadata: dict = Field(default_factory=dict, validation_alias="extra_data")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


# Graph Node Schemas
class LegalNodeCreate(BaseModel):
    """Create a node in the legal knowledge graph."""

    node_type: LegalNodeType
    title: str = Field(..., max_length=500)
    citation: str | None = Field(None, max_length=200)
    jurisdiction: str = Field(default="federal", max_length=100)
    agency: str | None = None
    effective_date: datetime | None = None
    text: str | None = None
    summary: str | None = None
    source_url: str | None = None
    metadata: dict = Field(default_factory=dict)


class LegalNodeResponse(BaseModel):
    """Response for a legal node."""

    id: str
    node_type: LegalNodeType
    title: str
    citation: str | None
    jurisdiction: str
    agency: str | None
    effective_date: datetime | None
    summary: str | None
    source_url: str | None
    metadata: dict
    relationship_count: int = 0


class LegalRelationshipCreate(BaseModel):
    """Create a relationship between legal nodes."""

    source_id: str = Field(..., min_length=1, max_length=100)
    target_id: str = Field(..., min_length=1, max_length=100)
    relationship_type: RelationshipType
    properties: dict = Field(default_factory=dict)


class GraphExploreRequest(BaseModel):
    """Request parameters for graph exploration."""

    center_node_id: str | None = Field(None, min_length=1, max_length=100)
    depth: int = Field(default=2, ge=1, le=4)
    limit: int = Field(default=100, ge=1, le=500)


class LegalRelationshipResponse(BaseModel):
    """Response for a legal relationship."""

    source: LegalNodeResponse
    relationship_type: RelationshipType
    target: LegalNodeResponse
    properties: dict


class GraphQueryResponse(BaseModel):
    """Response for graph queries."""

    nodes: list[LegalNodeResponse]
    relationships: list[LegalRelationshipResponse]
    query_time_ms: float


class AuthorityChainResponse(BaseModel):
    """Response showing the authority chain for a regulation."""

    regulation: LegalNodeResponse
    authority_chain: list[LegalNodeResponse]
    depth: int
    explanation: str
