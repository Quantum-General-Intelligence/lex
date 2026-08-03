"""Schemas for the legal data source registry."""

from enum import Enum

from pydantic import BaseModel, Field


class AccessMode(str, Enum):
    """How a source can be reached."""

    MCP = "mcp"  # Connectable to an MCP client
    API = "api"  # Programmatic HTTP access
    WEB = "web"  # Browser only — no machine interface
    BULK = "bulk"  # Downloadable dataset


class CostTier(str, Enum):
    FREE = "free"
    FREE_TIER = "free_tier"  # Real free tier with a self-serve paid upgrade
    PAID = "paid"  # Self-serve checkout — never "contact sales"


class AuthMode(str, Enum):
    NONE = "none"
    API_KEY = "api_key"
    OAUTH = "oauth"
    ACCOUNT = "account"


class SourceCategory(str, Enum):
    FEDERAL_LAW = "federal_law"
    CALIFORNIA = "california"
    STATE_LAW = "state_law"
    NONPROFIT = "nonprofit"
    COURTS_CASELAW = "courts_caselaw"
    BANKING_FINANCE = "banking_finance"
    PROPERTY_TITLE = "property_title"


class ForeclosureProcess(str, Enum):
    JUDICIAL = "judicial"
    NONJUDICIAL = "nonjudicial"


class SourceEndpoint(BaseModel):
    """A named sub-endpoint — county recorders, court portals, and the like."""

    name: str
    url: str


class LegalSource(BaseModel):
    """One entry in the legal data source registry."""

    slug: str = Field(..., description="Stable identifier")
    name: str
    category: SourceCategory
    jurisdiction: str = Field(..., description="federal | us | CA | TX | international")
    access: list[AccessMode]
    cost: CostTier
    auth: AuthMode
    description: str

    homepage: str | None = None
    api_base: str | None = None
    api_docs: str | None = None
    mcp_endpoint: str | None = None
    portal: str | None = None
    bulk_url: str | None = None
    phone: str | None = None

    tags: list[str] = Field(default_factory=list)
    endpoints: list[SourceEndpoint] = Field(default_factory=list)
    key_citations: list[str] = Field(default_factory=list)
    series_of_interest: list[str] = Field(default_factory=list)

    notes: str | None = None
    auth_note: str | None = None
    rate_limits: str | None = None
    scope_warning: str | None = Field(
        None,
        description="A trap worth surfacing before the source is relied on.",
    )

    implemented: bool = Field(
        False,
        description="True when this backend has a working client for the source.",
    )
    client: str | None = Field(
        None, description="Class name of the client, when implemented."
    )

    @property
    def is_machine_readable(self) -> bool:
        """Whether the source exposes anything beyond a browser interface."""
        return any(
            mode in self.access
            for mode in (AccessMode.API, AccessMode.BULK, AccessMode.MCP)
        )


class KeyAuthority(BaseModel):
    """A statutory section that anchors a practice area."""

    citation: str
    subject: str
    source: str = Field(..., description="Slug of the source holding the text")


class StateForeclosure(BaseModel):
    """State-level foreclosure process summary."""

    state: str
    name: str
    process: ForeclosureProcess
    statutes_url: str
    notes: str | None = None


class ExcludedSource(BaseModel):
    """A source deliberately left out, with the reason recorded."""

    name: str
    reason: str


class Caveat(BaseModel):
    """A limitation that travels with the registry."""

    id: str
    text: str


class SourceRegistryResponse(BaseModel):
    """Registry listing response."""

    count: int
    sources: list[LegalSource]


class RegistryMetadata(BaseModel):
    """Summary of the registry as a whole."""

    version: int
    compiled: str
    total_sources: int
    implemented_sources: int
    machine_readable_sources: int
    categories: dict[str, int]
    cost_breakdown: dict[str, int]
    caveats: list[Caveat]
