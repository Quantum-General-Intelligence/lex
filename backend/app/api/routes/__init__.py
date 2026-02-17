from fastapi import APIRouter

from app.api.routes import analysis, documents, graph, health, query, sources

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
