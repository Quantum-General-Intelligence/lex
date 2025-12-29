from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from neo4j import AsyncGraphDatabase
import chromadb
from chromadb.config import Settings as ChromaSettings
import redis.asyncio as redis
from contextlib import asynccontextmanager

from app.core.config import get_settings

settings = get_settings()


# SQLAlchemy Base
class Base(DeclarativeBase):
    pass


# PostgreSQL Async Engine
engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.debug,
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """Dependency for getting async database sessions."""
    async with AsyncSessionLocal() as session:
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

    async def connect(self):
        self._driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )

    async def close(self):
        if self._driver:
            await self._driver.close()

    @asynccontextmanager
    async def session(self):
        if not self._driver:
            await self.connect()
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
    return chromadb.HttpClient(
        host=settings.chroma_host,
        port=settings.chroma_port,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


# Redis Client
redis_client = None


async def get_redis():
    """Get Redis client."""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    return redis_client


async def init_databases():
    """Initialize all database connections."""
    # Create PostgreSQL tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Connect to Neo4j
    await neo4j_conn.connect()

    # Initialize Neo4j schema
    await init_neo4j_schema()


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
    await engine.dispose()
