from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.core.config import get_settings
from app.core.database import init_databases, close_databases
from app.api.routes import api_router

settings = get_settings()

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting Lex application", environment=settings.environment)

    try:
        await init_databases()
        logger.info("Database connections established")
    except Exception as e:
        logger.error("Failed to initialize databases", error=str(e))
        # Continue anyway for development - some services might not be up

    yield

    # Shutdown
    logger.info("Shutting down Lex application")
    await close_databases()


app = FastAPI(
    title=settings.app_name,
    description="""
    # Lex - Legal Cartography Platform

    An AI-powered legal intelligence platform that maps relationships between
    laws, regulations, and case law to enable:

    - **Regulatory Analysis**: Understand the authority chain behind any regulation
    - **Compliance Checking**: Identify potential compliance issues in documents
    - **Public Comment Analysis**: Process and analyze public feedback at scale
    - **Repeal Candidate Discovery**: Find outdated or conflicting regulations

    ## Core Concepts

    ### Legal Cartography
    Like geographic cartography maps physical terrain, legal cartography maps
    the legal landscape - showing how statutes authorize regulations, how case
    law interprets rules, and how different legal authorities relate.

    ### Knowledge Graph
    The platform maintains a graph database of legal entities and their
    relationships:
    - **Nodes**: Statutes, Regulations, Case Law, Executive Orders, Agencies
    - **Relationships**: AUTHORIZES, IMPLEMENTS, CITES, OVERTURNS, SUPERSEDES, AMENDS

    ### RAG Pipeline
    Retrieval-Augmented Generation enables natural language queries over the
    legal corpus with:
    - Semantic search across all documents
    - Source citations for every answer
    - Confidence scores and explainability
    - Human-in-the-loop flagging for ambiguous cases
    """,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware - allow all origins in production for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": "Legal Cartography Platform",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    """Simple health check endpoint for Railway."""
    return {"status": "healthy"}
