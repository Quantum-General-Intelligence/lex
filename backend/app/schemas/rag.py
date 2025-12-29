from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Citation(BaseModel):
    """A citation to a source document."""

    document_id: str
    document_title: str
    citation: Optional[str]  # Legal citation format
    chunk_text: str
    relevance_score: float
    page_or_section: Optional[str] = None


class SearchResult(BaseModel):
    """A single search result from the vector store."""

    chunk_id: str
    document_id: str
    text: str
    score: float
    metadata: dict


class QueryRequest(BaseModel):
    """Request for RAG query."""

    query: str = Field(..., min_length=3, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)
    jurisdiction_filter: Optional[str] = None
    document_type_filter: Optional[str] = None
    include_graph_context: bool = Field(default=True)
    explain: bool = Field(default=True)  # Include chain-of-thought


class QueryResponse(BaseModel):
    """Response for RAG query with full explainability."""

    query: str
    answer: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    citations: list[Citation]
    chain_of_thought: Optional[str] = None  # Explainability
    related_nodes: list[str] = Field(default_factory=list)  # Graph node IDs
    ambiguity_flags: list[str] = Field(default_factory=list)  # Areas needing human review
    processing_time_ms: float


class ComplianceCheckRequest(BaseModel):
    """Request for compliance checking against regulations."""

    document_text: str = Field(..., min_length=10)
    target_regulations: Optional[list[str]] = None  # Specific regulation IDs
    jurisdiction: str = Field(default="federal")
    check_type: str = Field(default="full")  # "full", "quick", "specific"


class ComplianceIssue(BaseModel):
    """A compliance issue found in the document."""

    severity: str  # "critical", "warning", "info"
    regulation_id: str
    regulation_citation: str
    issue_description: str
    document_excerpt: str
    suggested_fix: Optional[str] = None
    confidence: float


class ComplianceCheckResponse(BaseModel):
    """Response for compliance check."""

    document_summary: str
    overall_status: str  # "compliant", "issues_found", "review_required"
    issues: list[ComplianceIssue]
    checked_regulations: int
    processing_time_ms: float


class PublicCommentAnalysis(BaseModel):
    """Analysis of a public comment."""

    comment_id: str
    sentiment: str  # "positive", "negative", "neutral"
    sentiment_score: float
    topics: list[str]
    key_concerns: list[str]
    suggested_response_points: list[str]


class CommentBatchAnalysisResponse(BaseModel):
    """Response for batch comment analysis."""

    total_comments: int
    sentiment_distribution: dict[str, int]
    top_topics: list[tuple[str, int]]
    top_concerns: list[tuple[str, int]]
    sample_analyses: list[PublicCommentAnalysis]
    processing_time_ms: float
