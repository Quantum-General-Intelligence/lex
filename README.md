# Lex - Legal Cartography Platform

An AI-powered legal intelligence platform that maps relationships between laws, regulations, and case law.

## Features

- **Legal Knowledge Graph**: Neo4j-powered graph database mapping relationships between statutes, regulations, case law, and agencies
- **RAG-Powered Q&A**: Ask natural language questions about regulations and get cited answers with confidence scores
- **Compliance Checking**: Upload documents to check for regulatory compliance issues
- **Authority Chain Visualization**: Trace the legal authority behind any regulation
- **Public Comment Analysis**: Analyze and categorize public feedback on proposed rules

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                              │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Graph Explorer │  │ Regulation Chat │  │ Compliance View  │ │
│  └────────────────┘  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Ingestion│  │ Cartography  │  │ RAG Engine │  │ Analysis  │ │
│  └──────────┘  └──────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │              │                │              │
┌────────┴──────┐ ┌────┴─────┐  ┌───────┴───────┐ ┌───┴────┐
│  PostgreSQL   │ │  Neo4j   │  │   ChromaDB    │ │ Ollama │
│  (metadata)   │ │  (graph) │  │   (vectors)   │ │ (LLM)  │
└───────────────┘ └──────────┘  └───────────────┘ └────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Force Graph
- **Backend**: FastAPI, Python 3.11
- **Databases**:
  - PostgreSQL (document metadata)
  - Neo4j (legal knowledge graph)
  - ChromaDB (vector embeddings)
  - Redis (caching)
- **LLM**: OpenAI API or Ollama (local)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Run with Docker Compose

```bash
# Clone and navigate to project
cd lex

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/docs
- Neo4j Browser: http://localhost:7474

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Query
- `POST /api/query/` - Query the legal corpus with RAG

### Graph
- `GET /api/graph/nodes` - List legal nodes
- `POST /api/graph/nodes` - Create a legal node
- `POST /api/graph/relationships` - Create relationships
- `GET /api/graph/authority-chain/{node_id}` - Get authority chain
- `GET /api/graph/explore` - Explore graph for visualization

### Analysis
- `POST /api/analysis/compliance` - Check document compliance
- `POST /api/analysis/comments` - Analyze public comments
- `GET /api/analysis/repeal-candidates` - Find repeal candidates

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Create document
- `POST /api/documents/upload` - Upload document file

## Knowledge Graph Schema

### Node Types
- **Statute**: Federal or state laws (e.g., "5 U.S.C. § 552")
- **Regulation**: Agency rules (e.g., "34 CFR Part 99")
- **CaseLaw**: Court decisions
- **ExecutiveOrder**: Presidential orders
- **Agency**: Government agencies

### Relationship Types
- `AUTHORIZES`: Statute authorizes a regulation
- `IMPLEMENTS`: Regulation implements a statute
- `CITES`: Document cites another
- `OVERTURNS`: Case law overturns a rule
- `SUPERSEDES`: Newer law supersedes older
- `AMENDS`: Document amends another
- `CONFLICTS_WITH`: Documents conflict

## Demo Data

The project includes sample data representing:
- Administrative Procedure Act and related regulations
- FERPA (student privacy) framework
- FOIA disclosure requirements
- Sample regulatory relationships

## Concepts Demonstrated

This project demonstrates key regulatory technology concepts:

1. **Legal Cartography**: Mapping relationships between legal documents
2. **Authority Chain Analysis**: Tracing regulatory authority back to statutes
3. **RAG with Citations**: Answering questions with verifiable sources
4. **Compliance Checking**: Identifying regulatory issues in documents
5. **Human-in-the-Loop**: Confidence scores and ambiguity flagging

## License

MIT
