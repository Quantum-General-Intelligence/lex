"""Legal API integrations for fetching data from public sources."""

import logging
import re
from typing import Optional
from datetime import datetime
import httpx

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class ECFRClient:
    """Client for the eCFR (electronic Code of Federal Regulations) API."""

    BASE_URL = "https://www.ecfr.gov/api/versioner/v1"
    SEARCH_URL = "https://www.ecfr.gov/api/search/v1/results"

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_titles(self) -> list[dict]:
        """Get list of all CFR titles."""
        try:
            response = await self.client.get(f"{self.BASE_URL}/titles.json")
            response.raise_for_status()
            data = response.json()
            return data.get("titles", [])
        except Exception as e:
            logger.error(f"Failed to fetch eCFR titles: {e}")
            return []

    async def get_structure(self, title: int, date: Optional[str] = None) -> dict:
        """Get the structure (table of contents) for a CFR title."""
        try:
            date_param = date or datetime.now().strftime("%Y-%m-%d")
            response = await self.client.get(
                f"{self.BASE_URL}/structure/{date_param}/title-{title}.json"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch eCFR structure for title {title}: {e}")
            return {}

    async def get_full_text(
        self, title: int, part: Optional[int] = None, section: Optional[str] = None
    ) -> dict:
        """Get full text of a CFR section or part."""
        try:
            date = datetime.now().strftime("%Y-%m-%d")
            url = f"{self.BASE_URL}/full/{date}/title-{title}"
            if part:
                url += f"/part-{part}"
            if section:
                url += f"/section-{section}"
            url += ".json"

            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch eCFR text: {e}")
            return {}

    async def search(
        self,
        query: str,
        title: Optional[int] = None,
        per_page: int = 20,
        page: int = 1,
    ) -> dict:
        """Search the eCFR."""
        try:
            params = {
                "query": query,
                "per_page": per_page,
                "page": page,
            }
            if title:
                params["title"] = title

            response = await self.client.get(self.SEARCH_URL, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"eCFR search failed: {e}")
            return {"results": []}

    def parse_citation(self, title: int, part: int, section: Optional[str] = None) -> str:
        """Generate a CFR citation string."""
        if section:
            return f"{title} CFR {part}.{section}"
        return f"{title} CFR Part {part}"


class CongressClient:
    """Client for the Congress.gov API."""

    BASE_URL = "https://api.congress.gov/v3"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.openai_api_key  # Reuse or set dedicated key
        self.client = httpx.AsyncClient(timeout=30.0)

    async def _make_request(self, endpoint: str, params: dict = None) -> dict:
        """Make an authenticated request to Congress.gov API."""
        params = params or {}
        # Note: Congress.gov API requires an API key
        # For demo, we'll handle gracefully if not available
        if self.api_key:
            params["api_key"] = self.api_key

        try:
            response = await self.client.get(
                f"{self.BASE_URL}{endpoint}",
                params=params,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.warning("Congress.gov API key not configured or invalid")
            else:
                logger.error(f"Congress.gov API error: {e}")
            return {}
        except Exception as e:
            logger.error(f"Congress.gov request failed: {e}")
            return {}

    async def get_bills(
        self,
        congress: int = 118,
        bill_type: str = "hr",
        limit: int = 20,
        offset: int = 0,
    ) -> list[dict]:
        """Get list of bills from a specific congress."""
        data = await self._make_request(
            f"/bill/{congress}/{bill_type}",
            {"limit": limit, "offset": offset},
        )
        return data.get("bills", [])

    async def get_bill(self, congress: int, bill_type: str, bill_number: int) -> dict:
        """Get details of a specific bill."""
        data = await self._make_request(f"/bill/{congress}/{bill_type}/{bill_number}")
        return data.get("bill", {})

    async def search_bills(
        self,
        query: str,
        congress: Optional[int] = None,
        limit: int = 20,
    ) -> list[dict]:
        """Search for bills by keyword."""
        params = {"query": query, "limit": limit}
        if congress:
            params["congress"] = congress
        data = await self._make_request("/bill", params)
        return data.get("bills", [])

    async def get_public_laws(
        self,
        congress: int = 118,
        limit: int = 20,
    ) -> list[dict]:
        """Get public laws from a specific congress."""
        data = await self._make_request(
            f"/law/{congress}/pub",
            {"limit": limit},
        )
        return data.get("laws", [])

    def parse_bill_citation(self, congress: int, bill_type: str, number: int) -> str:
        """Generate a bill citation string."""
        type_labels = {
            "hr": "H.R.",
            "s": "S.",
            "hjres": "H.J.Res.",
            "sjres": "S.J.Res.",
        }
        return f"{type_labels.get(bill_type, bill_type.upper())} {number} ({congress}th Cong.)"


class CourtListenerClient:
    """Client for the CourtListener API (free.law)."""

    BASE_URL = "https://www.courtlistener.com/api/rest/v3"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)

    def _get_headers(self) -> dict:
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Token {self.api_key}"
        return headers

    async def search_opinions(
        self,
        query: str,
        court: Optional[str] = None,
        limit: int = 20,
    ) -> list[dict]:
        """Search court opinions."""
        try:
            params = {
                "q": query,
                "type": "o",  # opinions
                "page_size": limit,
            }
            if court:
                params["court"] = court

            response = await self.client.get(
                f"{self.BASE_URL}/search/",
                params=params,
                headers=self._get_headers(),
            )
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.error(f"CourtListener search failed: {e}")
            return []

    async def get_opinion(self, opinion_id: int) -> dict:
        """Get a specific court opinion."""
        try:
            response = await self.client.get(
                f"{self.BASE_URL}/opinions/{opinion_id}/",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch opinion {opinion_id}: {e}")
            return {}

    async def get_courts(self) -> list[dict]:
        """Get list of courts."""
        try:
            response = await self.client.get(
                f"{self.BASE_URL}/courts/",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.error(f"Failed to fetch courts: {e}")
            return []

    def parse_case_citation(
        self, case_name: str, volume: Optional[str] = None, reporter: Optional[str] = None, page: Optional[str] = None
    ) -> str:
        """Generate a case citation string."""
        if volume and reporter and page:
            return f"{case_name}, {volume} {reporter} {page}"
        return case_name


class LegalDataService:
    """Unified service for fetching legal data from multiple sources."""

    def __init__(self):
        self.ecfr = ECFRClient()
        self.congress = CongressClient()
        self.courtlistener = CourtListenerClient()

    async def search_regulations(
        self,
        query: str,
        title: Optional[int] = None,
        limit: int = 20,
    ) -> list[dict]:
        """Search for federal regulations."""
        results = await self.ecfr.search(query, title=title, per_page=limit)
        return [
            {
                "source": "ecfr",
                "type": "Regulation",
                "title": r.get("hierarchy_headings", {}).get("section", ""),
                "citation": f"{r.get('title')} CFR {r.get('part')}.{r.get('section', '')}",
                "text": r.get("full_text_excerpt", ""),
                "url": r.get("structure", {}).get("url"),
                "metadata": {
                    "cfr_title": r.get("title"),
                    "cfr_part": r.get("part"),
                    "cfr_section": r.get("section"),
                },
            }
            for r in results.get("results", [])
        ]

    async def search_statutes(
        self,
        query: str,
        congress: Optional[int] = None,
        limit: int = 20,
    ) -> list[dict]:
        """Search for federal statutes and bills."""
        bills = await self.congress.search_bills(query, congress=congress, limit=limit)
        return [
            {
                "source": "congress",
                "type": "Statute",
                "title": b.get("title", ""),
                "citation": self.congress.parse_bill_citation(
                    b.get("congress", 118),
                    b.get("type", "").lower(),
                    b.get("number", 0),
                ),
                "text": b.get("latestAction", {}).get("text", ""),
                "url": b.get("url"),
                "metadata": {
                    "congress": b.get("congress"),
                    "bill_type": b.get("type"),
                    "bill_number": b.get("number"),
                    "origin_chamber": b.get("originChamber"),
                },
            }
            for b in bills
        ]

    async def search_case_law(
        self,
        query: str,
        court: Optional[str] = None,
        limit: int = 20,
    ) -> list[dict]:
        """Search for court opinions."""
        opinions = await self.courtlistener.search_opinions(query, court=court, limit=limit)
        return [
            {
                "source": "courtlistener",
                "type": "CaseLaw",
                "title": o.get("caseName", ""),
                "citation": o.get("citation", [""])[0] if o.get("citation") else "",
                "text": o.get("snippet", ""),
                "url": f"https://www.courtlistener.com{o.get('absolute_url', '')}",
                "metadata": {
                    "court": o.get("court"),
                    "date_filed": o.get("dateFiled"),
                    "docket_number": o.get("docketNumber"),
                },
            }
            for o in opinions
        ]

    async def search_all(
        self,
        query: str,
        limit_per_source: int = 10,
    ) -> dict:
        """Search across all legal data sources."""
        import asyncio

        results = await asyncio.gather(
            self.search_regulations(query, limit=limit_per_source),
            self.search_statutes(query, limit=limit_per_source),
            self.search_case_law(query, limit=limit_per_source),
            return_exceptions=True,
        )

        return {
            "regulations": results[0] if not isinstance(results[0], Exception) else [],
            "statutes": results[1] if not isinstance(results[1], Exception) else [],
            "case_law": results[2] if not isinstance(results[2], Exception) else [],
        }

    async def import_regulation(self, title: int, part: int, section: Optional[str] = None) -> dict:
        """Import a specific CFR regulation for ingestion."""
        full_text = await self.ecfr.get_full_text(title, part, section)
        if not full_text:
            return {"error": "Failed to fetch regulation"}

        return {
            "source": "ecfr",
            "type": "regulation",
            "title": full_text.get("title", f"{title} CFR {part}"),
            "citation": self.ecfr.parse_citation(title, part, section),
            "text": full_text.get("content", ""),
            "jurisdiction": "federal",
            "agency": full_text.get("agency", ""),
        }


# Singleton instance
_legal_data_service = None


def get_legal_data_service() -> LegalDataService:
    """Get or create the legal data service."""
    global _legal_data_service
    if _legal_data_service is None:
        _legal_data_service = LegalDataService()
    return _legal_data_service
