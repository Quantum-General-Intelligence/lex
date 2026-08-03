"""API routes for legal data source integrations."""


from fastapi import APIRouter, HTTPException, Query

from app.schemas.sources import AccessMode, CostTier, SourceCategory
from app.services.ingestion import get_ingestion_service
from app.services.legal_apis import get_legal_data_service
from app.services.source_registry import get_source_registry

router = APIRouter()


@router.get("/search")
async def search_sources(
    query: str = Query(..., min_length=2, description="Search query"),
    source: str | None = Query(
        None,
        description="Limit to specific source: ecfr, congress, courtlistener, federal_register",
    ),
    limit: int = Query(10, le=50, description="Results per source"),
):
    """
    Search across legal data sources.

    Returns results from eCFR (regulations), Congress.gov (statutes),
    CourtListener (case law), and the Federal Register (agency rulemaking).
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
    elif source == "federal_register":
        results = await service.search_rulemaking(query, limit=limit)
        return {"rulemaking": results}
    else:
        return await service.search_all(query, limit_per_source=limit)


# ---------------------------------------------------------------------------
# Source registry — the catalogue of available legal data sources
# ---------------------------------------------------------------------------


@router.get("/registry")
async def list_registry_sources(
    category: SourceCategory | None = Query(None, description="Filter by category"),
    jurisdiction: str | None = Query(
        None, description="Filter by jurisdiction (federal, us, CA, TX, ...)"
    ),
    access: AccessMode | None = Query(
        None, description="Filter by access mode: mcp, api, web, bulk"
    ),
    cost: CostTier | None = Query(
        None, description="Filter by cost tier: free, free_tier, paid"
    ),
    tag: str | None = Query(None, description="Filter by tag, e.g. foreclosure"),
    implemented: bool | None = Query(
        None, description="Only sources this backend has a client for"
    ),
    machine_readable: bool | None = Query(
        None, description="Only sources exposing an api, bulk or mcp surface"
    ),
    q: str | None = Query(None, description="Substring search over name/description/tags"),
):
    """
    List catalogued legal data sources.

    The registry covers free and self-serve sources across federal law,
    California, state foreclosure law, courts and case law, banking data and
    property records. Browser-only sources are included deliberately — several
    decisive records (county recorder instruments, DRE and NMLS licence
    status) have no API at all.
    """
    registry = get_source_registry()

    if q:
        sources = registry.search(q)
    else:
        sources = registry.filter(
            category=category,
            jurisdiction=jurisdiction,
            access=access,
            cost=cost,
            tag=tag,
            implemented=implemented,
            machine_readable=machine_readable,
        )

    return {"count": len(sources), "sources": sources}


@router.get("/registry/metadata")
async def get_registry_metadata():
    """Summary counts and the caveats that travel with the registry."""
    return get_source_registry().metadata()


@router.get("/registry/mcp")
async def list_mcp_connectors():
    """Sources reachable as MCP servers, for wiring into an AI client."""
    connectors = get_source_registry().mcp_connectors()
    return {"count": len(connectors), "connectors": connectors}


@router.get("/registry/authorities")
async def list_key_authorities(
    source: str | None = Query(None, description="Filter by source slug"),
):
    """
    Key statutory authorities — currently the California foreclosure spine.

    Structured so it can seed an authority corpus and be resolved against
    citations extracted from documents.
    """
    registry = get_source_registry()
    authorities = (
        registry.authorities_for(source) if source else registry.key_authorities
    )
    return {"count": len(authorities), "authorities": authorities}


@router.get("/registry/foreclosure")
async def list_state_foreclosure(
    state: str | None = Query(None, description="Two-letter state code, e.g. CA"),
):
    """State foreclosure process — judicial vs. nonjudicial, with statute links."""
    registry = get_source_registry()

    if state:
        entry = registry.foreclosure_for_state(state)
        if entry is None:
            raise HTTPException(
                status_code=404, detail=f"No foreclosure entry for state '{state}'"
            )
        return entry

    return {
        "count": len(registry.state_foreclosure),
        "states": registry.state_foreclosure,
    }


@router.get("/registry/excluded")
async def list_excluded_sources():
    """Sources deliberately excluded, with the reason recorded."""
    excluded = get_source_registry().excluded
    return {"count": len(excluded), "excluded": excluded}


@router.get("/registry/warnings")
async def list_scope_warnings():
    """Source-level scope traps worth surfacing before relying on a source."""
    warnings = get_source_registry().scope_warnings()
    return {"count": len(warnings), "warnings": warnings}


@router.get("/registry/{slug}")
async def get_registry_source(slug: str):
    """Get a single catalogued source by slug."""
    source = get_source_registry().get(slug)
    if source is None:
        raise HTTPException(status_code=404, detail=f"Unknown source '{slug}'")
    return source


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


@router.get("/federal-register/search")
async def search_federal_register(
    query: str = Query(..., min_length=2),
    mortgage_only: bool = Query(
        False,
        description="Limit to CFPB, FHFA, HUD and OCC rulemaking",
    ),
    limit: int = Query(20, le=100),
):
    """Search agency rulemaking in the Federal Register. No API key required."""
    service = get_legal_data_service()
    results = await service.search_rulemaking(
        query, mortgage_only=mortgage_only, limit=limit
    )
    return {"rulemaking": results}


@router.get("/cfpb/complaints")
async def search_cfpb_complaints(
    company: str | None = Query(None, description="Company name to search"),
    search_term: str | None = Query(None, description="Free-text search"),
    product: str | None = Query("Mortgage", description="CFPB product category"),
    state: str | None = Query(None, description="Two-letter state code"),
    limit: int = Query(20, le=100),
):
    """
    Search the CFPB Consumer Complaint Database. No API key required.

    Scope note: HMDA and most CFPB consumer rules cover *consumer* mortgages.
    A business-purpose commercial loan generally falls outside them.
    """
    if not company and not search_term:
        raise HTTPException(
            status_code=400, detail="Provide either 'company' or 'search_term'"
        )

    service = get_legal_data_service()
    result = await service.cfpb.search_complaints(
        company=company,
        search_term=search_term,
        product=product,
        state=state,
        limit=limit,
    )
    return {
        "total_matching": result["total"],
        "returned": len(result["complaints"]),
        "complaints": result["complaints"],
        "scope_note": (
            "CFPB consumer rules generally do not reach business-purpose "
            "commercial loans."
        ),
    }


@router.get("/fdic/institutions")
async def search_fdic_institutions(
    name: str = Query(..., min_length=2, description="Institution name"),
    limit: int = Query(20, le=100),
):
    """Search FDIC-insured institutions by name. No API key required."""
    service = get_legal_data_service()
    institutions = await service.fdic.search_institutions(name, limit=limit)
    return {"count": len(institutions), "institutions": institutions}


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

    federal_register_status = "unknown"
    try:
        docs = await service.federal_register.search_documents("mortgage", per_page=1)
        federal_register_status = "available" if docs else "error"
    except Exception:
        federal_register_status = "error"

    registry = get_source_registry()

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
            "federal_register": {
                "name": "Federal Register",
                "status": federal_register_status,
                "base_url": "https://www.federalregister.gov",
            },
        },
        "registry": {
            "total_catalogued": len(registry.all()),
            "with_client": len(registry.implemented()),
            "note": "See /api/sources/registry for the full source catalogue.",
        },
    }
