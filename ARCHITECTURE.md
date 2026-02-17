# Lex Architecture

A legal intelligence platform combining modern full-stack web technologies with AI/ML and graph database capabilities for legal document analysis.

## Tech Stack Overview

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js (React) | 14.1.0 |
| **Backend** | FastAPI (Python) | 0.109.0 |
| **Primary Database** | PostgreSQL | 16 |
| **Graph Database** | Neo4j | 5.15.0 |
| **Vector Database** | ChromaDB | 0.5.23 |
| **Cache** | Redis | 7 |
| **LLM** | OpenAI / Ollama | gpt-4o-mini / llama3.1 |
| **Auth** | NextAuth.js | 4.24.13 |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         Next.js 14 + React 18                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard  │  │   Query     │  │   Graph     │  │ Compliance  │    │
│  │    Page     │  │  Interface  │  │  Explorer   │  │   Checker   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  NextAuth.js (JWT Sessions) │ React Query │ Axios │ D3.js        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                         FastAPI + Uvicorn                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         API Routes                               │    │
│  │  /query  │  /graph  │  /documents  │  /analysis  │  /health     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         Services                                 │    │
│  │    RAG Service    │   Graph Service   │   Ingestion Service     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
          │                    │                    │              │
          ▼                    ▼                    ▼              ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐    ┌──────────┐
    │PostgreSQL│        │  Neo4j   │        │ ChromaDB │    │  Redis   │
    │  (Meta)  │        │ (Graph)  │        │ (Vector) │    │ (Cache)  │
    └──────────┘        └──────────┘        └──────────┘    └──────────┘
                                                   │
                                                   ▼
                                            ┌──────────┐
                                            │  OpenAI  │
                                            │  Ollama  │
                                            └──────────┘
```

---

## Frontend Stack

### Core Framework
- **Next.js 14.1.0** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.3.3** - Type safety

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **Lucide React 0.312.0** - Icon library
- **clsx / tailwind-merge** - Class utilities

### Data & State
- **TanStack React Query 5.17.9** - Server state management
- **Axios 1.6.5** - HTTP client

### Visualization
- **D3.js 7.8.5** - Data visualization
- **React Force Graph 2D 1.25.0** - Graph rendering

### Authentication
- **NextAuth.js 4.24.13** - Auth with Credentials provider
- JWT session strategy (30-day duration)

---

## Backend Stack

### Core Framework
- **FastAPI 0.109.0** - Async Python web framework
- **Uvicorn 0.27.0** - ASGI server
- **Python 3.11+** - Runtime

### Database Drivers
- **SQLAlchemy 2.0.25** - ORM with async support
- **asyncpg 0.29.0** - PostgreSQL async driver
- **Alembic 1.13.1** - Database migrations
- **neo4j 5.16.0** - Neo4j driver
- **redis 5.0.1** - Redis client

### AI/ML
- **OpenAI 1.10.0** - LLM API client
- **LangChain 0.1.4** - RAG framework
- **spaCy 3.7.2** - NLP processing
- **sentence-transformers 2.3.1** - Embeddings

### Document Processing
- **pypdf 4.0.1** - PDF parsing
- **python-docx 1.1.0** - Word documents
- **beautifulsoup4 4.12.3** - HTML parsing

### Validation & Logging
- **Pydantic 2.5.3** - Data validation
- **structlog 24.1.0** - Structured logging

---

## Database Architecture

### PostgreSQL (Document Metadata)
```
documents
├── id (UUID)
├── title
├── citation
├── document_type
├── jurisdiction
├── agency
├── source_url
└── timestamps

document_chunks
├── id (UUID)
├── document_id (FK)
├── chunk_index
├── text_content
└── embedding_id

ingestion_jobs
├── id (UUID)
├── status
├── document_count
└── timestamps
```

### Neo4j (Legal Knowledge Graph)

**Node Types:**
- `Statute` - Legislative laws
- `Regulation` - Agency rules (CFR)
- `CaseLaw` - Court decisions
- `ExecutiveOrder` - Presidential orders
- `Agency` - Government agencies

**Relationship Types:**
- `AUTHORIZES` - Statute → Regulation
- `IMPLEMENTS` - Regulation → Statute
- `CITES` - Any → Any
- `OVERTURNS` - CaseLaw → CaseLaw
- `SUPERSEDES` - Regulation → Regulation
- `AMENDS` - Any → Any
- `CONFLICTS_WITH` - Any → Any

### ChromaDB (Vector Store)
- Collection: `legal_documents`
- Metadata: jurisdiction, document_type, chunk_index
- Distance-based similarity search

### Redis (Cache)
- Session caching
- API response caching
- Async task queue

---

## Project Structure

```
/lex
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── query/              # Query interface
│   │   │   ├── graph/              # Graph explorer
│   │   │   ├── compliance/         # Compliance checker
│   │   │   ├── documents/          # Document library
│   │   │   ├── upload/             # Document upload
│   │   │   ├── login/              # Authentication
│   │   │   └── api/auth/           # NextAuth handlers
│   │   ├── components/             # React components
│   │   │   ├── GraphViewer.tsx
│   │   │   ├── QueryInterface.tsx
│   │   │   ├── ComplianceChecker.tsx
│   │   │   └── Navigation.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              # API client
│   │   │   └── auth.ts             # Auth config
│   │   └── middleware.ts           # Route protection
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry
│   │   ├── core/
│   │   │   ├── config.py           # Settings
│   │   │   └── database.py         # DB connections
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── api/routes/             # API endpoints
│   │   │   ├── query.py
│   │   │   ├── graph.py
│   │   │   ├── documents.py
│   │   │   └── analysis.py
│   │   └── services/               # Business logic
│   │       ├── rag.py
│   │       ├── graph.py
│   │       └── ingestion.py
│   └── requirements.txt
│
├── docker-compose.yml              # Development
├── docker-compose.prod.yml         # Production
└── render.yaml                     # Render deployment
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/query/` | RAG query with citations |
| `GET` | `/api/graph/nodes` | List legal entities |
| `GET` | `/api/graph/explore` | Graph visualization data |
| `GET` | `/api/graph/authority-chain/{id}` | Trace legal hierarchy |
| `POST` | `/api/documents/upload` | Ingest documents |
| `GET` | `/api/documents/` | List documents |
| `POST` | `/api/analysis/compliance` | Check document compliance |
| `POST` | `/api/analysis/comments` | Analyze public comments |
| `GET` | `/api/analysis/repeal-candidates` | Find outdated rules |
| `GET` | `/api/health` | Health check |

---

## RAG Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Document   │───▶│    Parse     │───▶│    Chunk     │
│    Upload    │    │  (PDF/DOCX)  │    │ (1000 chars) │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Response   │◀───│     LLM      │◀───│   Retrieve   │
│ + Citations  │    │  Generation  │    │  (ChromaDB)  │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Neo4j     │
                    │   Context    │
                    └──────────────┘
```

**Pipeline Steps:**
1. **Ingestion** - Parse documents (PDF, DOCX, HTML, TXT)
2. **Chunking** - Split into 1000-char chunks with 200-char overlap
3. **Embedding** - Store in ChromaDB with metadata
4. **Query** - Semantic search for relevant chunks
5. **Context** - Enrich with Neo4j graph relationships
6. **Generation** - LLM response with source citations

**LLM Configuration:**
- Primary: OpenAI `gpt-4o-mini` (temperature: 0.3)
- Fallback: Ollama `llama3.1` (local)
- Confidence threshold: 0.7

---

## Authentication Flow

```
┌─────────┐    ┌─────────────┐    ┌─────────────┐
│  Login  │───▶│  NextAuth   │───▶│    JWT      │
│  Form   │    │ Credentials │    │   Token     │
└─────────┘    └─────────────┘    └─────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Middleware  │
                                  │  (Routes)   │
                                  └─────────────┘
```

**Protected Routes:**
- `/query`, `/graph`, `/documents`, `/upload`
- `/compliance`, `/comments`, `/sources`, `/settings`

**Demo Users:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lex.dev | admin123 |
| Analyst | analyst@lex.dev | analyst123 |
| Viewer | demo@lex.dev | demo123 |

---

## Deployment

### Development
```bash
docker-compose up -d
```
Services: frontend, backend, postgres, neo4j, chromadb, redis

### Production Options

**Railway** (Recommended)
- Auto-detects services
- External Neo4j Aura + ChromaDB VPS

**Render**
- Blueprint deployment via `render.yaml`
- Managed PostgreSQL

**VPS** (Full control)
- Docker Compose on DigitalOcean/Linode/Vultr
- All services local

---

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secure-random-string>
```

### Backend (`.env`)
```
OPENAI_API_KEY=<your-key>
DATABASE_URL=postgresql://user:pass@localhost:5432/lex
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<password>
CHROMA_HOST=localhost
CHROMA_PORT=8001
REDIS_URL=redis://localhost:6379
OLLAMA_HOST=http://localhost:11434
ENVIRONMENT=development
```

---

## Key Architectural Decisions

1. **Async Throughout** - FastAPI + asyncpg + React Query for non-blocking I/O
2. **Graceful Degradation** - Demo mode when databases unavailable
3. **Multi-Model RAG** - Graph context enriches vector search results
4. **LLM Fallback** - Ollama backup when OpenAI unavailable
5. **Type Safety** - TypeScript frontend, Pydantic backend
6. **Structured Logging** - JSON logs via structlog for observability
