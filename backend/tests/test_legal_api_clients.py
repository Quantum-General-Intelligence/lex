"""Tests for the legal data source API clients.

Responses are mocked — these lock in the response-shape handling, which is
where these three APIs each surprised us:

* CFPB returns an Elasticsearch envelope whose ``total`` is a nested dict, and
  silently ignores ``size`` if ``format=json`` is passed.
* FDIC BankFind wraps every record in ``{"data": {...}, "score": n}``.
* Federal Register nests agency names as objects, not strings.
"""

import httpx
import pytest

from app.services.legal_apis import (
    CFPBComplaintsClient,
    FDICBankFindClient,
    FederalRegisterClient,
)


def _mock_client(handler) -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


# ---- CFPB ----------------------------------------------------------------- #


@pytest.mark.asyncio
async def test_cfpb_parses_envelope_and_total():
    def handler(request):
        return httpx.Response(
            200,
            json={
                "hits": {
                    "total": {"value": 31557, "relation": "eq"},
                    "hits": [
                        {"_source": {"company": "ACME BANK", "product": "Mortgage"}},
                        {"_source": {"company": "ACME BANK", "product": "Mortgage"}},
                    ],
                }
            },
        )

    client = CFPBComplaintsClient()
    client.client = _mock_client(handler)

    result = await client.search_complaints(search_term="foreclosure", limit=2)
    assert result["total"] == 31557
    assert len(result["complaints"]) == 2
    assert result["complaints"][0]["company"] == "ACME BANK"


@pytest.mark.asyncio
async def test_cfpb_handles_bare_int_total():
    """Older responses report total as a plain integer."""

    def handler(request):
        return httpx.Response(
            200, json={"hits": {"total": 7, "hits": [{"_source": {"id": 1}}]}}
        )

    client = CFPBComplaintsClient()
    client.client = _mock_client(handler)

    result = await client.search_complaints(search_term="x")
    assert result["total"] == 7


@pytest.mark.asyncio
async def test_cfpb_never_requests_export_mode():
    """`format=json` makes the endpoint ignore `size` and dump every match."""
    seen = {}

    def handler(request):
        seen["params"] = dict(request.url.params)
        return httpx.Response(200, json={"hits": {"total": 0, "hits": []}})

    client = CFPBComplaintsClient()
    client.client = _mock_client(handler)

    await client.search_complaints(search_term="foreclosure", limit=5)
    assert "format" not in seen["params"]
    assert seen["params"]["size"] == "5"


@pytest.mark.asyncio
async def test_cfpb_caps_page_size():
    seen = {}

    def handler(request):
        seen["params"] = dict(request.url.params)
        return httpx.Response(200, json={"hits": {"total": 0, "hits": []}})

    client = CFPBComplaintsClient()
    client.client = _mock_client(handler)

    await client.search_complaints(search_term="x", limit=5000)
    assert seen["params"]["size"] == "100"


@pytest.mark.asyncio
async def test_cfpb_returns_empty_on_error():
    def handler(request):
        return httpx.Response(500, text="boom")

    client = CFPBComplaintsClient()
    client.client = _mock_client(handler)

    result = await client.search_complaints(search_term="x")
    assert result == {"total": 0, "complaints": []}


@pytest.mark.asyncio
async def test_cfpb_defaults_to_mortgage_product():
    seen = {}

    def handler(request):
        seen["params"] = dict(request.url.params)
        return httpx.Response(200, json={"hits": {"total": 0, "hits": []}})

    client = CFPBComplaintsClient()
    client.client = _mock_client(handler)

    await client.search_complaints(company="ACME")
    assert seen["params"]["product"] == "Mortgage"


# ---- FDIC ----------------------------------------------------------------- #


@pytest.mark.asyncio
async def test_fdic_unwraps_nested_data_rows():
    def handler(request):
        return httpx.Response(
            200,
            json={
                "data": [
                    {"data": {"NAME": "ACME BANK", "STALP": "CA"}, "score": 10.0},
                    {"data": {"NAME": "ACME TRUST", "STALP": "NV"}, "score": 5.0},
                ]
            },
        )

    client = FDICBankFindClient()
    client.client = _mock_client(handler)

    institutions = await client.search_institutions("acme")
    assert [i["NAME"] for i in institutions] == ["ACME BANK", "ACME TRUST"]


@pytest.mark.asyncio
async def test_fdic_uses_live_host():
    """banks.data.fdic.gov/api 301-redirects; hit the live host directly."""
    assert FDICBankFindClient.BASE_URL == "https://api.fdic.gov/banks"


@pytest.mark.asyncio
async def test_fdic_returns_empty_on_error():
    def handler(request):
        return httpx.Response(503, text="unavailable")

    client = FDICBankFindClient()
    client.client = _mock_client(handler)

    assert await client.search_institutions("acme") == []


# ---- Federal Register ----------------------------------------------------- #


@pytest.mark.asyncio
async def test_federal_register_returns_results():
    def handler(request):
        return httpx.Response(
            200,
            json={
                "results": [
                    {
                        "title": "Mortgage Servicing Rule",
                        "document_number": "2024-12345",
                        "type": "Rule",
                        "agencies": [{"name": "Consumer Financial Protection Bureau"}],
                    }
                ]
            },
        )

    client = FederalRegisterClient()
    client.client = _mock_client(handler)

    results = await client.search_documents("servicing")
    assert len(results) == 1
    assert results[0]["title"] == "Mortgage Servicing Rule"


@pytest.mark.asyncio
async def test_federal_register_filters_to_mortgage_agencies():
    seen = {}

    def handler(request):
        seen["agencies"] = request.url.params.get_list("conditions[agencies][]")
        return httpx.Response(200, json={"results": []})

    client = FederalRegisterClient()
    client.client = _mock_client(handler)

    await client.search_mortgage_rulemaking("escrow")
    assert "consumer-financial-protection-bureau" in seen["agencies"]
    assert "federal-housing-finance-agency" in seen["agencies"]


@pytest.mark.asyncio
async def test_federal_register_returns_empty_on_error():
    def handler(request):
        return httpx.Response(500, text="boom")

    client = FederalRegisterClient()
    client.client = _mock_client(handler)

    assert await client.search_documents("x") == []
