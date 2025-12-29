# Lex - Legal Cartography Platform
## Architecture & Technology Diagrams

*Prepared for Vulcan Technologies Interview*

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                     Next.js 14 Frontend (Port 3000)                      │    │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────────────┐   │    │
│  │  │ QueryInterface│  │  GraphViewer    │  │  ComplianceChecker        │   │    │
│  │  │              │  │  (Force Graph)  │  │                           │   │    │
│  │  │ • NL Queries │  │ • Node Explorer │  │ • Document Analysis       │   │    │
│  │  │ • Citations  │  │ • Authority     │  │ • Issue Detection         │   │    │
│  │  │ • Confidence │  │   Chain Viz     │  │ • Severity Scoring        │   │    │
│  │  └──────────────┘  └─────────────────┘  └───────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST (Axios)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                   FastAPI Backend (Port 8080)                            │    │
│  │                                                                          │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │    │
│  │  │  /query    │ │  /graph    │ │ /analysis  │ │    /documents      │    │    │
│  │  │            │ │            │ │            │ │                    │    │    │
│  │  │ RAG Search │ │ Node CRUD  │ │ Compliance │ │ Upload & Parse     │    │    │
│  │  │ Generation │ │ Relations  │ │ Comments   │ │ Metadata           │    │    │
│  │  │ Citations  │ │ Authority  │ │ Repeal     │ │ Chunking           │    │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                         │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │   RAG Service    │  │  Graph Service   │  │    Ingestion Service         │   │
│  │                  │  │                  │  │                              │   │
│  │ • Semantic Search│  │ • Node Management│  │ • Text Chunking (1000/200)   │   │
│  │ • Chunk Retrieval│  │ • Relationships  │  │ • Citation Extraction        │   │
│  │ • LLM Generation │  │ • Authority Chain│  │ • Agency Name Extraction     │   │
│  │ • Confidence Calc│  │ • Conflict Detect│  │ • Date Parsing               │   │
│  │ • Explainability │  │ • Repeal Finder  │  │ • Metadata Enrichment        │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────┬───────────┼───────────┬───────────────┐
          │               │           │           │               │
          ▼               ▼           ▼           ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                            │
│                                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ PostgreSQL  │  │   Neo4j     │  │  ChromaDB   │  │        Redis            │ │
│  │  (5432)     │  │ (7474/7687) │  │   (8000)    │  │        (6379)           │ │
│  │             │  │             │  │             │  │                         │ │
│  │ • Documents │  │ • Statutes  │  │ • Embeddings│  │ • Session Cache         │ │
│  │ • Metadata  │  │ • Regulations│ │ • Chunks    │  │ • Rate Limiting         │ │
│  │ • Jobs      │  │ • Case Law  │  │ • Semantic  │  │ • Job Queue             │ │
│  │ • Users     │  │ • Agencies  │  │   Index     │  │                         │ │
│  │             │  │ • Relations │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI/ML LAYER                                           │
│                                                                                  │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────────┐   │
│  │         OpenAI API            │  │           Ollama (Local)              │   │
│  │                               │  │                                       │   │
│  │ • GPT-4o-mini (generation)    │  │ • Llama 3.1 (generation)              │   │
│  │ • text-embedding-3-small      │  │ • sentence-transformers (embeddings) │   │
│  │                               │  │ • Port 11434                          │   │
│  └───────────────────────────────┘  └───────────────────────────────────────┘   │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                        NLP Pipeline (spaCy + Transformers)                │  │
│  │  • Named Entity Recognition  • Citation Parsing  • Text Classification   │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                         L E X   T E C H   S T A C K                              │
│                                                                                  │
├──────────────────────────────┬───────────────────────────────────────────────────┤
│                              │                                                   │
│     F R O N T E N D          │           B A C K E N D                           │
│                              │                                                   │
│  ┌────────────────────────┐  │  ┌─────────────────────────────────────────────┐ │
│  │      Next.js 14        │  │  │              FastAPI                        │ │
│  │  (React 18 + TypeScript)│  │  │         (Python 3.11 + Async)              │ │
│  └────────────────────────┘  │  └─────────────────────────────────────────────┘ │
│              │               │                      │                            │
│  ┌───────────┴───────────┐   │  ┌───────────────────┴───────────────────────┐   │
│  │                       │   │  │                                           │   │
│  │  • Tailwind CSS       │   │  │  • SQLAlchemy 2.0 (async ORM)             │   │
│  │  • React Force Graph  │   │  │  • Pydantic (validation)                  │   │
│  │  • TanStack Query     │   │  │  • LangChain 0.1.4                        │   │
│  │  • Axios              │   │  │  • spaCy 3.7.2                            │   │
│  │  • Lucide Icons       │   │  │  • Transformers 4.37                      │   │
│  │                       │   │  │  • PyPDF / python-docx                    │   │
│  └───────────────────────┘   │  └───────────────────────────────────────────┘   │
│                              │                                                   │
├──────────────────────────────┴───────────────────────────────────────────────────┤
│                                                                                  │
│                          D A T A B A S E S                                       │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │              │  │              │  │              │  │                      │ │
│  │  PostgreSQL  │  │    Neo4j     │  │   ChromaDB   │  │       Redis 7        │ │
│  │              │  │    5.15.0    │  │    0.5.23    │  │                      │ │
│  │  Relational  │  │    Graph     │  │    Vector    │  │   Cache/Queue        │ │
│  │              │  │              │  │              │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                          A I  /  M L                                             │
│                                                                                  │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │         Cloud LLM               │  │          Local LLM                  │   │
│  │                                 │  │                                     │   │
│  │  OpenAI                         │  │  Ollama                             │   │
│  │  • GPT-4o-mini                  │  │  • Llama 3.1                        │   │
│  │  • text-embedding-3-small       │  │  • sentence-transformers           │   │
│  └─────────────────────────────────┘  └─────────────────────────────────────┘   │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                    I N F R A S T R U C T U R E                                   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Docker Compose                                   │   │
│  │                                                                           │   │
│  │   • Multi-service orchestration    • Health checks                       │   │
│  │   • Volume persistence             • Environment injection               │   │
│  │   • Service dependencies           • GPU support (Ollama)                │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Diagrams

### 3.1 RAG Query Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         RAG QUERY DATA FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

     USER
       │
       │ "What are the FOIA disclosure requirements?"
       ▼
┌──────────────┐
│   Frontend   │
│ QueryInterface│
└──────┬───────┘
       │ POST /api/query
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FastAPI Backend                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           RAG Service                                    │ │
│  │                                                                          │ │
│  │   ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐   │ │
│  │   │ 1. Embed │ ───▶ │ 2. Search│ ───▶ │ 3. Graph │ ───▶ │4.Generate│   │ │
│  │   │   Query  │      │ ChromaDB │      │  Context │      │  Answer  │   │ │
│  │   └──────────┘      └──────────┘      └──────────┘      └──────────┘   │ │
│  │        │                 │                 │                 │         │ │
│  │        ▼                 ▼                 ▼                 ▼         │ │
│  │   ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐   │ │
│  │   │ OpenAI / │      │ Top-K    │      │ Neo4j    │      │ GPT-4o   │   │ │
│  │   │ Ollama   │      │ Chunks   │      │ Nodes    │      │ + Context│   │ │
│  │   └──────────┘      └──────────┘      └──────────┘      └──────────┘   │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Response Assembly                                │ │
│  │                                                                          │ │
│  │   • Answer text                    • Confidence score (0.0-1.0)         │ │
│  │   • Citations with relevance       • Chain-of-thought explanation       │ │
│  │   • Source documents               • Ambiguity flags                    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Response to User                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Answer: "FOIA requires federal agencies to disclose records upon       │ │
│  │          request, with 9 exemptions including..."                       │ │
│  │                                                                          │ │
│  │  Citations:                                                              │ │
│  │  ├── 5 U.S.C. § 552 (FOIA Statute) ────────────── Relevance: 0.95      │ │
│  │  ├── 28 CFR Part 16 (DOJ FOIA Regulations) ────── Relevance: 0.87      │ │
│  │  └── Executive Order 13392 ────────────────────── Relevance: 0.72      │ │
│  │                                                                          │ │
│  │  Confidence: 0.91  │  Processing: 1.2s  │  ⚠ No ambiguity flags        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Document Ingestion Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      DOCUMENT INGESTION FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

     DOCUMENT UPLOAD
          │
          │  PDF / DOCX / HTML / TXT
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INGESTION SERVICE                                      │
│                                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   1. Parse  │───▶│  2. Chunk   │───▶│ 3. Extract  │───▶│ 4. Enrich   │       │
│  │   Document  │    │    Text     │    │   Metadata  │    │   Entities  │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│        │                  │                  │                  │               │
│        ▼                  ▼                  ▼                  ▼               │
│   ┌─────────┐       ┌─────────┐       ┌──────────────┐   ┌──────────────┐       │
│   │ PyPDF   │       │ 1000    │       │ Citations:   │   │ spaCy NER:   │       │
│   │ docx    │       │ chars   │       │ • USC refs   │   │ • Agencies   │       │
│   │ BS4     │       │ 200     │       │ • CFR refs   │   │ • Dates      │       │
│   │         │       │ overlap │       │ • Pub. Law   │   │ • Names      │       │
│   └─────────┘       └─────────┘       └──────────────┘   └──────────────┘       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │    ChromaDB     │  │     Neo4j       │
│                 │  │                 │  │                 │
│ • Document meta │  │ • Chunk vectors │  │ • Legal nodes   │
│ • Ingestion job │  │ • Embeddings    │  │ • Relationships │
│ • Source info   │  │ • Semantic idx  │  │ • Citations     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 3.3 Compliance Check Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       COMPLIANCE CHECK FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

     USER DOCUMENT
          │
          │  "Our data retention policy states..."
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ANALYSIS SERVICE                                         │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                      Regulatory Redlining Engine                          │  │
│  │                                                                           │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐  │  │
│  │   │ 1. Semantic │───▶│ 2. Keyword  │───▶│ 3. Issue Classification    │  │  │
│  │   │    Search   │    │   Matching  │    │    & Severity Scoring      │  │  │
│  │   └─────────────┘    └─────────────┘    └─────────────────────────────┘  │  │
│  │         │                  │                        │                     │  │
│  │         ▼                  ▼                        ▼                     │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐  │  │
│  │   │ ChromaDB    │    │ Triggers:   │    │ Severity Levels:            │  │  │
│  │   │ Find related│    │ • retention │    │ • HIGH: Non-compliance      │  │  │
│  │   │ regulations │    │ • disclosure│    │ • MEDIUM: Gaps              │  │  │
│  │   │             │    │ • consent   │    │ • LOW: Recommendations      │  │  │
│  │   └─────────────┘    └─────────────┘    └─────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMPLIANCE REPORT                                      │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  Status: ⚠️  ISSUES FOUND                                                 │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  🔴 HIGH: Missing data retention limits                             │ │  │
│  │  │     Regulation: 34 CFR § 99.35                                      │ │  │
│  │  │     Excerpt: "...retain indefinitely..."                            │ │  │
│  │  │     Fix: Specify maximum retention period per FERPA requirements    │ │  │
│  │  │     Confidence: 0.89                                                │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  🟡 MEDIUM: Consent procedures not specified                        │ │  │
│  │  │     Regulation: Privacy Act, 5 U.S.C. § 552a                        │ │  │
│  │  │     Fix: Add explicit consent collection procedures                 │ │  │
│  │  │     Confidence: 0.76                                                │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Legal Knowledge Graph Schema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NEO4J LEGAL KNOWLEDGE GRAPH                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                              NODE TYPES
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│   │    STATUTE      │  │   REGULATION    │  │    CASE_LAW     │                 │
│   │    (Navy)       │  │    (Gold)       │  │    (Crimson)    │                 │
│   │                 │  │                 │  │                 │                 │
│   │ • title         │  │ • title         │  │ • case_name     │                 │
│   │ • citation      │  │ • cfr_citation  │  │ • citation      │                 │
│   │ • usc_title     │  │ • agency        │  │ • court         │                 │
│   │ • section       │  │ • effective_date│  │ • decision_date │                 │
│   │ • enacted_date  │  │ • status        │  │ • holding       │                 │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                  │
│   ┌─────────────────┐  ┌─────────────────┐                                      │
│   │ EXECUTIVE_ORDER │  │     AGENCY      │                                      │
│   │    (Purple)     │  │    (Green)      │                                      │
│   │                 │  │                 │                                      │
│   │ • order_number  │  │ • name          │                                      │
│   │ • title         │  │ • abbreviation  │                                      │
│   │ • signed_date   │  │ • parent_agency │                                      │
│   │ • president     │  │ • jurisdiction  │                                      │
│   └─────────────────┘  └─────────────────┘                                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

                           RELATIONSHIP TYPES
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                        ┌─────────────┐                                          │
│                        │   STATUTE   │                                          │
│                        │  (5 U.S.C.  │                                          │
│                        │   § 552)    │                                          │
│                        └──────┬──────┘                                          │
│                               │                                                  │
│              ┌────────────────┼────────────────┐                                │
│              │ AUTHORIZES     │                │ CITES                          │
│              ▼                ▼                ▼                                │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                          │
│     │ REGULATION  │  │   AGENCY    │  │  CASE_LAW   │                          │
│     │ (28 CFR 16) │  │   (DOJ)     │  │             │                          │
│     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                          │
│            │                │                │                                   │
│            │ IMPLEMENTS     │ REGULATES      │ INTERPRETS                       │
│            ▼                ▼                ▼                                   │
│     ┌─────────────────────────────────────────────┐                             │
│     │              LEGAL LANDSCAPE                 │                             │
│     └─────────────────────────────────────────────┘                             │
│                                                                                  │
│   RELATIONSHIP TYPES:                                                           │
│   ───────────────────                                                           │
│   AUTHORIZES ────────▶  Statute grants regulatory authority                     │
│   IMPLEMENTS ────────▶  Regulation implements statute                           │
│   CITES ─────────────▶  Document references another                             │
│   INTERPRETS ────────▶  Case law interprets statute/regulation                  │
│   OVERTURNS ─────────▶  Later authority overturns earlier                       │
│   SUPERSEDES ────────▶  Newer version replaces older                            │
│   AMENDS ────────────▶  Modifies existing authority                             │
│   CONFLICTS_WITH ────▶  Documents have conflicting requirements                 │
│   REGULATES ─────────▶  Agency issues regulation                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

                         EXAMPLE AUTHORITY CHAIN
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────┐ │
│   │                                                                           │ │
│   │  FERPA AUTHORITY CHAIN                                                    │ │
│   │                                                                           │ │
│   │  ┌─────────────────────┐                                                  │ │
│   │  │ Family Educational  │                                                  │ │
│   │  │ Rights and Privacy  │◀─────── Pub. L. 93-380                          │ │
│   │  │ Act (FERPA)         │                                                  │ │
│   │  │ 20 U.S.C. § 1232g   │                                                  │ │
│   │  └──────────┬──────────┘                                                  │ │
│   │             │                                                              │ │
│   │             │ AUTHORIZES                                                   │ │
│   │             ▼                                                              │ │
│   │  ┌─────────────────────┐         ┌─────────────────────┐                  │ │
│   │  │ Dept. of Education  │────────▶│  34 CFR Part 99     │                  │ │
│   │  │                     │REGULATES│  (FERPA Regulations)│                  │ │
│   │  └─────────────────────┘         └──────────┬──────────┘                  │ │
│   │                                             │                              │ │
│   │                                             │ IMPLEMENTS                   │ │
│   │                                             ▼                              │ │
│   │                                  ┌─────────────────────┐                  │ │
│   │                                  │ 20 U.S.C. § 1232g   │                  │ │
│   │                                  │ (Original Statute)  │                  │ │
│   │                                  └─────────────────────┘                  │ │
│   │                                                                           │ │
│   └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE DEPLOYMENT                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              docker-compose.yml                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         FRONTEND CONTAINER                               │    │
│  │                                                                          │    │
│  │   Image: node:18-alpine                                                  │    │
│  │   Port:  3000:3000                                                       │    │
│  │   Deps:  backend                                                         │    │
│  │   Build: ./frontend                                                      │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      │ depends_on                                │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          BACKEND CONTAINER                               │    │
│  │                                                                          │    │
│  │   Image: python:3.11-slim                                                │    │
│  │   Port:  8080:8080                                                       │    │
│  │   Deps:  postgres, neo4j, redis, chromadb                                │    │
│  │   Build: ./backend                                                       │    │
│  │   Env:   DATABASE_URL, NEO4J_URI, REDIS_URL, OPENAI_API_KEY             │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│            │              │              │              │                        │
│            │              │              │              │                        │
│            ▼              ▼              ▼              ▼                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  PostgreSQL  │ │    Neo4j     │ │    Redis     │ │   ChromaDB   │            │
│  │              │ │              │ │              │ │              │            │
│  │ Port: 5432   │ │ Port: 7474   │ │ Port: 6379   │ │ Port: 8000   │            │
│  │              │ │       7687   │ │              │ │              │            │
│  │ Vol: pgdata  │ │ Vol: neo4j   │ │ Vol: redis   │ │ Vol: chroma  │            │
│  │              │ │      data    │ │      data    │ │      data    │            │
│  │ Health:      │ │ Health:      │ │ Health:      │ │ Health:      │            │
│  │  pg_isready  │ │  cypher test │ │  redis-cli   │ │  HTTP check  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         OLLAMA (Optional)                                │    │
│  │                                                                          │    │
│  │   Image: ollama/ollama:latest                                            │    │
│  │   Port:  11434:11434                                                     │    │
│  │   Vol:   ollama_data                                                     │    │
│  │   GPU:   NVIDIA runtime (commented out by default)                       │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                            VOLUMES                                       │    │
│  │                                                                          │    │
│  │   • postgres_data    - Persistent database storage                       │    │
│  │   • neo4j_data       - Graph database storage                            │    │
│  │   • redis_data       - Cache persistence                                 │    │
│  │   • chroma_data      - Vector embeddings storage                         │    │
│  │   • ollama_data      - LLM model storage                                 │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Interview Talking Points

### Why This Architecture?

| Decision | Rationale |
|----------|-----------|
| **Neo4j for legal relationships** | Natural fit for "A AUTHORIZES B" relationship traversal; Cypher queries for authority chains |
| **ChromaDB for RAG** | Purpose-built for embeddings; fast similarity search; easy Python integration |
| **PostgreSQL for metadata** | ACID compliance for document tracking; mature ecosystem |
| **FastAPI async** | Non-blocking I/O for concurrent LLM calls; automatic OpenAPI docs |
| **Next.js 14** | Server components reduce client bundle; built-in API routes if needed |
| **Dual LLM support** | OpenAI for quality; Ollama for cost/privacy-sensitive deployments |

### Scalability Considerations

1. **Horizontal scaling**: Stateless backend allows multiple instances behind load balancer
2. **Vector DB scaling**: ChromaDB can be replaced with Pinecone/Weaviate for larger scale
3. **Graph partitioning**: Neo4j clustering for multi-region deployment
4. **Caching strategy**: Redis for frequently accessed authority chains

### Security & Compliance

- Environment-based secrets (no hardcoded credentials)
- Pydantic validation on all inputs
- CORS configuration for API access control
- Audit logging ready (just needs implementation)

---

*Diagram created for Vulcan Technologies interview preparation*
*Last updated: December 2024*
