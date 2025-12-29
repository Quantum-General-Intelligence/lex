from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db, neo4j_conn, get_redis, get_chroma_client
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@router.get("/health/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with all service statuses."""
    health_status = {
        "app": {
            "status": "healthy",
            "name": settings.app_name,
            "version": settings.app_version,
        },
        "services": {},
    }

    # Check PostgreSQL
    try:
        await db.execute(text("SELECT 1"))
        health_status["services"]["postgres"] = {"status": "healthy"}
    except Exception as e:
        health_status["services"]["postgres"] = {"status": "unhealthy", "error": str(e)}

    # Check Neo4j
    try:
        result = await neo4j_conn.execute_query("RETURN 1 as n")
        health_status["services"]["neo4j"] = {"status": "healthy"}
    except Exception as e:
        health_status["services"]["neo4j"] = {"status": "unhealthy", "error": str(e)}

    # Check Redis
    try:
        redis = await get_redis()
        await redis.ping()
        health_status["services"]["redis"] = {"status": "healthy"}
    except Exception as e:
        health_status["services"]["redis"] = {"status": "unhealthy", "error": str(e)}

    # Check ChromaDB
    try:
        client = get_chroma_client()
        client.heartbeat()
        health_status["services"]["chromadb"] = {"status": "healthy"}
    except Exception as e:
        health_status["services"]["chromadb"] = {"status": "unhealthy", "error": str(e)}

    # Overall status
    all_healthy = all(
        svc.get("status") == "healthy"
        for svc in health_status["services"].values()
    )
    health_status["overall"] = "healthy" if all_healthy else "degraded"

    return health_status
