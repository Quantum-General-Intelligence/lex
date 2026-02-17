import logging
from contextlib import asynccontextmanager

import chromadb
import redis.asyncio as redis
from chromadb.config import Settings as ChromaSettings
from neo4j import AsyncGraphDatabase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


# SQLAlchemy Base
class Base(DeclarativeBase):
    pass


# PostgreSQL Async Engine - created lazily to avoid startup failures
_engine = None
_async_session_local = None


def get_engine():
    """Get or create the database engine lazily."""
    global _engine
    if _engine is None:
        try:
            _engine = create_async_engine(
                settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
                echo=settings.debug,
                pool_size=5,
                max_overflow=10,
            )
        except Exception as e:
            logger.warning(f"Failed to create database engine: {e}")
            return None
    return _engine


def get_async_session_local():
    """Get or create the async session factory lazily."""
    global _async_session_local
    engine = get_engine()
    if engine is None:
        return None
    if _async_session_local is None:
        _async_session_local = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session_local


async def get_db() -> AsyncSession:
    """Dependency for getting async database sessions."""
    session_local = get_async_session_local()
    if session_local is None:
        raise Exception("Database not available")
    async with session_local() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Neo4j Driver
class Neo4jConnection:
    """Neo4j async connection manager."""

    def __init__(self):
        self._driver = None
        self._connected = False

    async def connect(self):
        try:
            self._driver = AsyncGraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
            )
            self._connected = True
        except Exception as e:
            logger.warning(f"Neo4j connection failed: {e}")
            self._connected = False

    async def close(self):
        if self._driver:
            await self._driver.close()

    @asynccontextmanager
    async def session(self):
        if not self._driver:
            await self.connect()
        if not self._connected or not self._driver:
            raise Exception("Neo4j not available")
        async with self._driver.session() as session:
            yield session

    async def execute_query(self, query: str, parameters: dict = None):
        """Execute a Cypher query and return results."""
        async with self.session() as session:
            result = await session.run(query, parameters or {})
            return [record.data() async for record in result]


neo4j_conn = Neo4jConnection()


async def get_neo4j():
    """Dependency for getting Neo4j sessions."""
    async with neo4j_conn.session() as session:
        yield session


# ChromaDB Client
def get_chroma_client():
    """Get ChromaDB client."""
    try:
        return chromadb.HttpClient(
            host=settings.chroma_host,
            port=settings.chroma_port,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    except Exception as e:
        logger.warning(f"ChromaDB connection failed: {e}")
        return None


# Redis Client
redis_client = None


async def get_redis():
    """Get Redis client."""
    global redis_client
    if redis_client is None:
        try:
            redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            return None
    return redis_client


async def init_databases():
    """Initialize all database connections. Fails gracefully if databases unavailable."""
    # Create PostgreSQL tables
    engine = get_engine()
    if engine:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("PostgreSQL connected successfully")
        except Exception as e:
            logger.warning(f"PostgreSQL connection failed (ok for demo): {e}")

    # Connect to Neo4j
    try:
        await neo4j_conn.connect()
        if neo4j_conn._connected:
            # Initialize Neo4j schema
            await init_neo4j_schema()
            logger.info("Neo4j connected successfully")
    except Exception as e:
        logger.warning(f"Neo4j connection failed (ok for demo): {e}")


async def init_neo4j_schema():
    """Create Neo4j indexes and constraints for legal cartography."""
    constraints = [
        # Unique constraints
        "CREATE CONSTRAINT statute_id IF NOT EXISTS FOR (s:Statute) REQUIRE s.id IS UNIQUE",
        "CREATE CONSTRAINT regulation_id IF NOT EXISTS FOR (r:Regulation) REQUIRE r.id IS UNIQUE",
        "CREATE CONSTRAINT case_id IF NOT EXISTS FOR (c:CaseLaw) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT executive_order_id IF NOT EXISTS FOR (e:ExecutiveOrder) REQUIRE e.id IS UNIQUE",
        "CREATE CONSTRAINT agency_id IF NOT EXISTS FOR (a:Agency) REQUIRE a.id IS UNIQUE",
    ]

    indexes = [
        # Full-text search indexes
        "CREATE FULLTEXT INDEX statute_text IF NOT EXISTS FOR (s:Statute) ON EACH [s.title, s.text]",
        "CREATE FULLTEXT INDEX regulation_text IF NOT EXISTS FOR (r:Regulation) ON EACH [r.title, r.text]",
        "CREATE FULLTEXT INDEX case_text IF NOT EXISTS FOR (c:CaseLaw) ON EACH [c.title, c.summary]",
    ]

    async with neo4j_conn.session() as session:
        for constraint in constraints:
            try:
                await session.run(constraint)
            except Exception:
                pass  # Constraint may already exist

        for index in indexes:
            try:
                await session.run(index)
            except Exception:
                pass  # Index may already exist


async def close_databases():
    """Close all database connections."""
    await neo4j_conn.close()
    if redis_client:
        await redis_client.close()
    engine = get_engine()
    if engine:
        await engine.dispose()
