from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional


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
    citation: Optional[str] = Field(None, max_length=200)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    agency: Optional[str] = Field(None, max_length=200)
    effective_date: Optional[datetime] = None
    source_url: Optional[str] = None
    raw_text: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class DocumentResponse(BaseModel):
    id: str
    title: str
    document_type: DocumentType
    citation: Optional[str]
    jurisdiction: Optional[str]
    agency: Optional[str]
    effective_date: Optional[datetime]
    source_url: Optional[str]
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
    citation: Optional[str] = Field(None, max_length=200)
    jurisdiction: str = Field(default="federal", max_length=100)
    agency: Optional[str] = None
    effective_date: Optional[datetime] = None
    text: Optional[str] = None
    summary: Optional[str] = None
    source_url: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class LegalNodeResponse(BaseModel):
    """Response for a legal node."""

    id: str
    node_type: LegalNodeType
    title: str
    citation: Optional[str]
    jurisdiction: str
    agency: Optional[str]
    effective_date: Optional[datetime]
    summary: Optional[str]
    source_url: Optional[str]
    metadata: dict
    relationship_count: int = 0


class LegalRelationshipCreate(BaseModel):
    """Create a relationship between legal nodes."""

    source_id: str
    target_id: str
    relationship_type: RelationshipType
    properties: dict = Field(default_factory=dict)


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
