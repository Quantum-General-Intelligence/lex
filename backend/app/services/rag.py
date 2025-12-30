"""RAG service for semantic search and question answering."""

import logging
from typing import Optional
import httpx

from app.core.config import get_settings
from app.core.database import get_chroma_client, neo4j_conn

settings = get_settings()
logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG operations over the legal corpus."""

    def __init__(self):
        self._chroma = None
        self._collection = None
        self._available = None

    @property
    def chroma(self):
        if self._chroma is None:
            self._chroma = get_chroma_client()
        return self._chroma

    @property
    def collection(self):
        if self._collection is None and self.chroma is not None:
            try:
                self._collection = self.chroma.get_or_create_collection(
                    name="legal_documents",
                    metadata={"description": "Legal document chunks for RAG"},
                )
            except Exception as e:
                logger.warning(f"Failed to get ChromaDB collection: {e}")
        return self._collection

    @property
    def available(self):
        """Check if RAG service is available."""
        if self._available is None:
            self._available = self.collection is not None
        return self._available

    async def search(
        self,
        query: str,
        top_k: int = 5,
        jurisdiction: Optional[str] = None,
        document_type: Optional[str] = None,
    ) -> list[dict]:
        """Perform semantic search over the legal corpus."""
        if not self.available:
            return []

        where_filter = None
        conditions = []

        if jurisdiction:
            conditions.append({"jurisdiction": jurisdiction})
        if document_type:
            conditions.append({"document_type": document_type})

        if len(conditions) == 1:
            where_filter = conditions[0]
        elif len(conditions) > 1:
            where_filter = {"$and": conditions}

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_filter,
            )

            search_results = []
            for i, (chunk_id, doc, metadata, distance) in enumerate(
                zip(
                    results["ids"][0],
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0],
                )
            ):
                search_results.append({
                    "chunk_id": chunk_id,
                    "document_id": metadata.get("document_id"),
                    "text": doc,
                    "score": 1 - (distance / 2),  # Convert distance to similarity
                    "metadata": metadata,
                })

            return search_results
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    async def add_document(
        self,
        document_id: str,
        chunks: list[str],
        metadata: dict,
    ) -> int:
        """Add document chunks to the vector store."""
        if not self.available:
            return 0

        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {**metadata, "chunk_index": i, "document_id": document_id}
            for i in range(len(chunks))
        ]

        try:
            self.collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas,
            )
            return len(chunks)
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return 0

    async def generate_answer(
        self,
        query: str,
        context_chunks: list[str],
        graph_context: Optional[list[dict]] = None,
    ) -> dict:
        """Generate an answer using the LLM."""
        # Build context
        context = "\n\n---\n\n".join(context_chunks[:5])

        graph_info = ""
        if graph_context:
            graph_info = "\n\nRelated legal entities:\n"
            for node in graph_context[:3]:
                graph_info += f"- {node.get('title')} ({node.get('citation', 'N/A')})\n"

        # Try OpenAI first, fall back to Ollama
        if settings.openai_api_key:
            return await self._generate_with_openai(query, context, graph_info)
        else:
            return await self._generate_with_ollama(query, context, graph_info)

    async def _generate_with_openai(
        self, query: str, context: str, graph_info: str
    ) -> dict:
        """Generate answer using OpenAI."""
        try:
            import openai

            client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

            system_prompt = """You are a legal research assistant specializing in regulatory law.
            Answer questions based on the provided legal context. Always cite specific sources.
            If the answer is uncertain, say so and explain what additional information would help.
            Be precise and use proper legal terminology."""

            user_prompt = f"""Based on the following legal documents, answer this question:

Question: {query}

Legal Context:
{context}
{graph_info}

Provide a clear, well-cited answer. If you cannot answer based on the provided context, explain why."""

            response = await client.chat.completions.create(
                model=settings.default_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=1000,
            )

            return {
                "answer": response.choices[0].message.content,
                "model": settings.default_model,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
            }
        except Exception as e:
            return {
                "answer": f"Error generating answer: {str(e)}",
                "model": "error",
                "tokens_used": 0,
            }

    async def _generate_with_ollama(
        self, query: str, context: str, graph_info: str
    ) -> dict:
        """Generate answer using Ollama."""
        try:
            prompt = f"""You are a legal research assistant. Answer based on the provided context.

Question: {query}

Legal Context:
{context}
{graph_info}

Answer:"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.ollama_host}/api/generate",
                    json={
                        "model": "llama3.1",
                        "prompt": prompt,
                        "stream": False,
                    },
                    timeout=60.0,
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "answer": data.get("response", ""),
                        "model": "llama3.1",
                        "tokens_used": data.get("eval_count", 0),
                    }
                else:
                    raise Exception(f"Ollama error: {response.status_code}")

        except Exception as e:
            # Return a placeholder if LLM is unavailable
            return {
                "answer": f"Based on the provided legal documents: {context[:500]}...\n\n[Note: Full LLM analysis unavailable. Please configure OpenAI API key or run Ollama.]",
                "model": "fallback",
                "tokens_used": 0,
            }

    async def get_graph_context(self, document_ids: list[str]) -> list[dict]:
        """Get related nodes from the knowledge graph for context."""
        if not document_ids:
            return []

        try:
            query = """
            MATCH (d)
            WHERE d.id IN $doc_ids
            OPTIONAL MATCH (d)-[r]-(related)
            RETURN d.id as doc_id, d.title as doc_title,
                   collect(DISTINCT {
                       id: related.id,
                       title: related.title,
                       citation: related.citation,
                       type: labels(related)[0],
                       relationship: type(r)
                   })[0..3] as related_nodes
            """

            result = await neo4j_conn.execute_query(query, {"doc_ids": document_ids})

            context = []
            for record in result:
                context.append({
                    "id": record["doc_id"],
                    "title": record["doc_title"],
                    "related": record["related_nodes"],
                })

            return context
        except Exception:
            return []
