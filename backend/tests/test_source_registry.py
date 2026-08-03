"""Tests for the legal data source registry."""

import pytest

from app.schemas.sources import AccessMode, CostTier, SourceCategory
from app.services.source_registry import SourceRegistry, get_source_registry


@pytest.fixture(scope="module")
def registry() -> SourceRegistry:
    return get_source_registry()


# ---- loading & integrity -------------------------------------------------- #


def test_registry_loads(registry):
    """The registry file parses and yields sources."""
    assert len(registry.all()) > 0
    assert registry.version >= 1
    assert registry.compiled


def test_slugs_are_unique(registry):
    """Duplicate slugs would make lookups non-deterministic."""
    slugs = [s.slug for s in registry.all()]
    assert len(slugs) == len(set(slugs))


def test_every_source_is_reachable_somehow(registry):
    """A source with no access mode could never be used."""
    for source in registry.all():
        assert source.access, f"{source.slug} declares no access mode"


def test_every_source_has_a_locator(registry):
    """Each source needs a homepage, api_base, mcp_endpoint or sub-endpoints."""
    for source in registry.all():
        locators = [
            source.homepage,
            source.api_base,
            source.mcp_endpoint,
            source.portal,
            source.bulk_url,
        ]
        assert any(locators) or source.endpoints, (
            f"{source.slug} has no reachable location"
        )


def test_key_authorities_reference_known_sources(registry):
    """A dangling authority reference would send a reader to a dead end."""
    slugs = {s.slug for s in registry.all()}
    for authority in registry.key_authorities:
        assert authority.source in slugs


def test_implemented_sources_name_a_client(registry):
    """`implemented: true` must say which client backs it."""
    for source in registry.implemented():
        assert source.client, f"{source.slug} is implemented but names no client"


def test_implemented_clients_exist_on_the_service():
    """The registry's `client` names must match real classes in legal_apis."""
    from app.services import legal_apis

    for source in get_source_registry().implemented():
        assert hasattr(legal_apis, source.client), (
            f"{source.slug} names client {source.client}, which does not exist"
        )


# ---- lookups & filtering -------------------------------------------------- #


def test_get_by_slug(registry):
    source = registry.get("courtlistener")
    assert source is not None
    assert source.name == "CourtListener"
    assert AccessMode.MCP in source.access


def test_get_unknown_slug_returns_none(registry):
    assert registry.get("does-not-exist") is None


def test_filter_by_category(registry):
    california = registry.filter(category=SourceCategory.CALIFORNIA)
    assert len(california) > 0
    assert all(s.category == SourceCategory.CALIFORNIA for s in california)


def test_filter_by_cost(registry):
    free = registry.filter(cost=CostTier.FREE)
    assert len(free) > 0
    assert all(s.cost == CostTier.FREE for s in free)


def test_filter_by_jurisdiction_is_case_insensitive(registry):
    lower = registry.filter(jurisdiction="ca")
    upper = registry.filter(jurisdiction="CA")
    assert lower == upper
    assert len(lower) > 0


def test_filter_by_tag(registry):
    tagged = registry.filter(tag="foreclosure")
    assert len(tagged) > 0
    assert all("foreclosure" in [t.lower() for t in s.tags] for s in tagged)


def test_filter_combines_criteria(registry):
    results = registry.filter(
        category=SourceCategory.CALIFORNIA, access=AccessMode.WEB
    )
    for source in results:
        assert source.category == SourceCategory.CALIFORNIA
        assert AccessMode.WEB in source.access


def test_filter_with_no_criteria_returns_everything(registry):
    assert len(registry.filter()) == len(registry.all())


def test_search_matches_name_and_tags(registry):
    assert any(s.slug == "courtlistener" for s in registry.search("courtlistener"))
    assert len(registry.search("mortgage")) > 0


def test_search_empty_query_returns_nothing(registry):
    assert registry.search("   ") == []


# ---- domain views --------------------------------------------------------- #


def test_mcp_connectors_all_declare_an_endpoint(registry):
    connectors = registry.mcp_connectors()
    assert len(connectors) > 0
    for connector in connectors:
        assert AccessMode.MCP in connector.access
        assert connector.mcp_endpoint, f"{connector.slug} is MCP but has no endpoint"


def test_web_only_sources_are_not_machine_readable(registry):
    """Browser-only sources must not claim an automatable surface."""
    web_only = [s for s in registry.all() if s.access == [AccessMode.WEB]]
    assert len(web_only) > 0  # county recorders, DRE, NMLS, leginfo
    assert all(not s.is_machine_readable for s in web_only)


def test_california_foreclosure_spine_is_present(registry):
    """The sections that actually govern a California foreclosure."""
    citations = {a.citation for a in registry.key_authorities}
    for expected in (
        "Cal. Civ. Code § 2924",  # nonjudicial foreclosure procedure
        "Cal. Civ. Code § 2924c",  # reinstatement / cure rights
        "Cal. Civ. Code § 2943",  # payoff demand statements
        "Cal. Civ. Proc. Code § 726",  # one-action rule
    ):
        assert expected in citations


def test_authorities_for_source(registry):
    authorities = registry.authorities_for("ca-leginfo")
    assert len(authorities) > 0
    assert all(a.source == "ca-leginfo" for a in authorities)


def test_state_foreclosure_lookup(registry):
    california = registry.foreclosure_for_state("ca")
    assert california is not None
    assert california.process.value == "nonjudicial"

    new_york = registry.foreclosure_for_state("NY")
    assert new_york is not None
    assert new_york.process.value == "judicial"


def test_state_foreclosure_unknown_state(registry):
    assert registry.foreclosure_for_state("ZZ") is None


def test_excluded_sources_record_a_reason(registry):
    assert len(registry.excluded) > 0
    for entry in registry.excluded:
        assert entry.reason.strip()


def test_scope_warnings_are_surfaced(registry):
    warnings = registry.scope_warnings()
    assert len(warnings) > 0
    # The consumer-vs-commercial trap is the one most worth catching.
    assert any("commercial" in w["warning"].lower() for w in warnings)


def test_caveats_include_as_of_date(registry):
    """Statutory text and licence status must be checked as of the right date."""
    ids = {c.id for c in registry.caveats}
    assert "as_of_date" in ids
    assert "consumer_vs_commercial" in ids


def test_metadata_counts_are_consistent(registry):
    meta = registry.metadata()
    assert meta.total_sources == len(registry.all())
    assert meta.implemented_sources == len(registry.implemented())
    assert sum(meta.categories.values()) == meta.total_sources
    assert sum(meta.cost_breakdown.values()) == meta.total_sources
