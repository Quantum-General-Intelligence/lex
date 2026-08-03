# Legal Data Sources

Lex catalogues the legal, court, banking and property-record sources it can
draw on in a single registry: `backend/app/data/legal_sources.yaml`.

The registry is **data, not code**. Adding a source is a YAML edit. Only the
subset with a working HTTP client carries `implemented: true`, and a test
asserts that every such entry names a class that actually exists in
`app/services/legal_apis.py`, so the flag cannot drift from reality.

## Why browser-only sources are catalogued

Most entries have no API and several never will. County recorder indexes, the
California DRE and DFPI licence lookups, NMLS Consumer Access and the
California codes are all browser-only — yet they hold some of the most
decisive records in a foreclosure matter (the recorded Notice of Default, a
broker's licence status as of the closing date).

Listing them keeps the research surface honest. Cataloguing only what is
automatable would misrepresent how much of this work a machine can do.

## Inclusion rule

Every source is free, has a real free tier, or can be subscribed to online
with a credit card. Nothing requires "book a demo" or "contact sales" —
anything gated that way sits under `excluded` **with its reason recorded**, so
the decision stays visible instead of being silently revisited.

## Structure

| Section | Contents |
|---|---|
| `sources` | The catalogue — 49 entries across 7 categories |
| `key_authorities` | California foreclosure statutory spine (19 sections) |
| `state_foreclosure` | Judicial vs. nonjudicial process for 12 states |
| `excluded` | Deliberately omitted, with reasons |
| `caveats` | Limitations that travel with the registry |

### Source fields

- `slug` — stable identifier; never reuse or rename without a migration
- `access` — `mcp` | `api` | `web` | `bulk`
- `cost` — `free` | `free_tier` | `paid`
- `auth` — `none` | `api_key` | `oauth` | `account`
- `scope_warning` — a trap worth surfacing before the source is relied on
- `implemented` / `client` — whether this backend can actually call it

## API

All routes are under `/api/sources`.

| Endpoint | Purpose |
|---|---|
| `GET /registry` | List/filter sources (`category`, `jurisdiction`, `access`, `cost`, `tag`, `implemented`, `machine_readable`, `q`) |
| `GET /registry/metadata` | Counts and caveats |
| `GET /registry/mcp` | MCP-connectable sources |
| `GET /registry/authorities` | Key statutory authorities |
| `GET /registry/foreclosure` | State foreclosure process (`?state=CA`) |
| `GET /registry/excluded` | Excluded sources and reasons |
| `GET /registry/warnings` | All scope traps |
| `GET /registry/{slug}` | One source |

Live search endpoints for implemented sources:

| Endpoint | Source | Key needed |
|---|---|---|
| `GET /federal-register/search` | Federal Register (`?mortgage_only=true` limits to CFPB, FHFA, HUD, OCC) | No |
| `GET /cfpb/complaints` | CFPB Consumer Complaint Database | No |
| `GET /fdic/institutions` | FDIC BankFind | No |
| `GET /courtlistener/search` | CourtListener | Optional |
| `GET /ecfr/*` | eCFR | No |

## Scope traps

Two are worth repeating because they cause wrong answers rather than missing
ones, and both are encoded in the registry:

**Consumer vs. commercial.** Federal consumer-mortgage rules — TILA, RESPA,
HMDA — generally do not reach business-purpose commercial loans. Reading a
consumer-protection statute and assuming it applies to a commercial deed of
trust is the most common self-research error. `/api/sources/cfpb/complaints`
returns this note on every response.

**As-of date.** Licensing status, statutory text and regulations all change.
What usually matters is the law and the licence as they stood on the closing
date, not today. eCFR supports point-in-time lookups; DRE and NMLS do not, so
licence status must be evidenced when checked.

## Adding a source

1. Add an entry to `legal_sources.yaml` with a unique `slug`.
2. If it has no client, stop — it is catalogued and queryable.
3. If you implement a client, add it to `legal_apis.py`, then set
   `implemented: true` and `client: YourClientClass`.

`test_source_registry.py` enforces unique slugs, resolvable locators, valid
`key_authorities` references, and that every MCP entry declares an endpoint.

## Known API quirks

Both were found by live-testing and are guarded by tests:

- **CFPB** — passing `format=json` switches the endpoint into export mode,
  which *ignores* `size` and returns every match (tens of thousands of records
  for a common term). The client omits it and reads the Elasticsearch
  envelope, reporting `total_matching` separately from `returned`.
- **FDIC BankFind** — `banks.data.fdic.gov/api` now 301-redirects to
  `api.fdic.gov/banks`. The client targets the live host directly.

## Portability

The registry is YAML by design. Sources, key authorities and citation
vocabulary are expressed as data so the catalogue can be consumed by
something other than this backend — including a document-intelligence
platform's authority-pack format — without rewriting it as Python.
