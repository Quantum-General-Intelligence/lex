from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Lex"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    # PostgreSQL
    database_url: str = "postgresql://lex:lex_dev_password@localhost:5432/lex"

    # Neo4j
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "lex_graph_password"

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8000

    # Redis
    redis_url: str = "redis://localhost:6379"

    # LLM Configuration
    ollama_host: str = "http://localhost:11434"
    openai_api_key: str | None = None
    default_model: str = "gpt-4o-mini"  # or "llama3.1" for Ollama
    embedding_model: str = "text-embedding-3-small"

    # RAG Configuration
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 5
    confidence_threshold: float = 0.7

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache
def get_settings() -> Settings:
    return Settings()
