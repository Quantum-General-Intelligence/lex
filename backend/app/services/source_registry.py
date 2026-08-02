"""Registry of legal data sources.

Loads ``app/data/legal_sources.yaml`` — the curated catalogue of free and
self-serve legal, court, banking and property-record sources — and exposes it
as validated objects with filtering.

The registry is deliberately data-first. Most entries have no HTTP client and
several never will: county recorder indexes, DRE and NMLS licence lookups and
the California codes are browser-only, yet they carry some of the most
decisive records in a foreclosure matter. Cataloguing them keeps the research
surface honest rather than implying everything is automatable.

Sources with a working client in ``legal_apis`` carry ``implemented: true``;
:func:`SourceRegistry.implemented` is the join between the two.
"""

from __future__ import annotations

import logging
from collections import Counter
from functools import lru_cache
from pathlib import Path

import yaml

from app.schemas.sources import (
    AccessMode,
    Caveat,
    CostTier,
    ExcludedSource,
    KeyAuthority,
    LegalSource,
    RegistryMetadata,
    SourceCategory,
    StateForeclosure,
)

logger = logging.getLogger(__name__)

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "data" / "legal_sources.yaml"


class SourceRegistryError(RuntimeError):
    """Raised when the registry file is missing or malformed."""


class SourceRegistry:
    """Queryable view over the legal data source catalogue."""

    def __init__(self, path: Path | None = None):
        self.path = path or REGISTRY_PATH
        raw = self._load(self.path)

        self.version: int = raw.get("version", 1)
        self.compiled: str = str(raw.get("compiled", ""))

        self.sources: list[LegalSource] = [
            LegalSource(**entry) for entry in raw.get("sources", [])
        ]
        self.key_authorities: list[KeyAuthority] = [
            KeyAuthority(**entry) for entry in raw.get("key_authorities", [])
        ]
        self.state_foreclosure: list[StateForeclosure] = [
            StateForeclosure(**entry) for entry in raw.get("state_foreclosure", [])
        ]
        self.excluded: list[ExcludedSource] = [
            ExcludedSource(**entry) for entry in raw.get("excluded", [])
        ]
        self.caveats: list[Caveat] = [
            Caveat(**entry) for entry in raw.get("caveats", [])
        ]

        self._by_slug = {source.slug: source for source in self.sources}
        self._validate()

    @staticmethod
    def _load(path: Path) -> dict:
        if not path.exists():
            raise SourceRegistryError(f"Source registry not found at {path}")
        try:
            with path.open(encoding="utf-8") as handle:
                data = yaml.safe_load(handle)
        except yaml.YAMLError as exc:
            raise SourceRegistryError(f"Source registry is not valid YAML: {exc}") from exc
        if not isinstance(data, dict):
            raise SourceRegistryError("Source registry must be a YAML mapping")
        return data

    def _validate(self) -> None:
        """Catch the mistakes that silently corrupt a catalogue."""
        slugs = [source.slug for source in self.sources]
        duplicates = [slug for slug, count in Counter(slugs).items() if count > 1]
        if duplicates:
            raise SourceRegistryError(f"Duplicate source slugs: {sorted(duplicates)}")

        # A key authority pointing at a source that does not exist would send a
        # reader to a dead end, so fail loudly at load rather than at request time.
        dangling = sorted(
            {a.source for a in self.key_authorities if a.source not in self._by_slug}
        )
        if dangling:
            raise SourceRegistryError(
                f"key_authorities reference unknown source slugs: {dangling}"
            )

    # ---- lookups ---------------------------------------------------------- #

    def get(self, slug: str) -> LegalSource | None:
        """Return a single source by slug."""
        return self._by_slug.get(slug)

    def all(self) -> list[LegalSource]:
        """Every source in the registry."""
        return list(self.sources)

    def filter(
        self,
        *,
        category: SourceCategory | str | None = None,
        jurisdiction: str | None = None,
        access: AccessMode | str | None = None,
        cost: CostTier | str | None = None,
        tag: str | None = None,
        implemented: bool | None = None,
        machine_readable: bool | None = None,
    ) -> list[LegalSource]:
        """Filter sources. Every criterion is ANDed; None means "don't care"."""
        results = self.sources

        if category is not None:
            value = SourceCategory(category)
            results = [s for s in results if s.category == value]
        if jurisdiction is not None:
            wanted = jurisdiction.lower()
            results = [s for s in results if s.jurisdiction.lower() == wanted]
        if access is not None:
            value = AccessMode(access)
            results = [s for s in results if value in s.access]
        if cost is not None:
            value = CostTier(cost)
            results = [s for s in results if s.cost == value]
        if tag is not None:
            wanted = tag.lower()
            results = [s for s in results if wanted in {t.lower() for t in s.tags}]
        if implemented is not None:
            results = [s for s in results if s.implemented is implemented]
        if machine_readable is not None:
            results = [s for s in results if s.is_machine_readable is machine_readable]

        return results

    def search(self, query: str) -> list[LegalSource]:
        """Substring search over name, description and tags."""
        needle = query.strip().lower()
        if not needle:
            return []
        return [
            source
            for source in self.sources
            if needle in source.name.lower()
            or needle in source.description.lower()
            or any(needle in tag.lower() for tag in source.tags)
        ]

    def mcp_connectors(self) -> list[LegalSource]:
        """Sources reachable as MCP servers."""
        return self.filter(access=AccessMode.MCP)

    def implemented(self) -> list[LegalSource]:
        """Sources this backend has a working client for."""
        return self.filter(implemented=True)

    def authorities_for(self, source_slug: str) -> list[KeyAuthority]:
        """Key authorities whose text lives at the given source."""
        return [a for a in self.key_authorities if a.source == source_slug]

    def foreclosure_for_state(self, state: str) -> StateForeclosure | None:
        """Foreclosure process summary for a two-letter state code."""
        wanted = state.strip().upper()
        return next((s for s in self.state_foreclosure if s.state == wanted), None)

    def scope_warnings(self) -> list[dict]:
        """Every source-level trap, flattened for display."""
        return [
            {"slug": s.slug, "name": s.name, "warning": s.scope_warning}
            for s in self.sources
            if s.scope_warning
        ]

    def metadata(self) -> RegistryMetadata:
        """Summary counts across the registry."""
        return RegistryMetadata(
            version=self.version,
            compiled=self.compiled,
            total_sources=len(self.sources),
            implemented_sources=len(self.implemented()),
            machine_readable_sources=len(
                [s for s in self.sources if s.is_machine_readable]
            ),
            categories=dict(
                Counter(source.category.value for source in self.sources)
            ),
            cost_breakdown=dict(Counter(source.cost.value for source in self.sources)),
            caveats=self.caveats,
        )


@lru_cache(maxsize=1)
def get_source_registry() -> SourceRegistry:
    """Get the process-wide registry, loading it on first use."""
    registry = SourceRegistry()
    logger.info(
        "Loaded legal source registry: %d sources (%d implemented), compiled %s",
        len(registry.sources),
        len(registry.implemented()),
        registry.compiled,
    )
    return registry
