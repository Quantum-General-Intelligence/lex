from fastapi import APIRouter, HTTPException
import time
from typing import Optional

from app.core.config import get_settings
from app.core.database import neo4j_conn, get_chroma_client
from app.schemas.rag import QueryRequest, QueryResponse, Citation
from app.services.rag import RAGService

router = APIRouter()
settings = get_settings()
rag_service = RAGService()


@router.post("/", response_model=QueryResponse)
async def query_legal_corpus(request: QueryRequest):
    """
    Query the legal corpus using RAG with full explainability.

    This endpoint:
    1. Performs semantic search on the vector store
    2. Retrieves relevant graph context
    3. Generates an answer with citations
    4. Provides confidence scores and chain-of-thought
    """
    start_time = time.time()

    # Step 1: Vector search in ChromaDB
    try:
        chroma = get_chroma_client()
        collection = chroma.get_or_create_collection(
            name="legal_documents",
            metadata={"description": "Legal document chunks for RAG"},
        )

        # Search for relevant chunks
        results = collection.query(
            query_texts=[request.query],
            n_results=request.top_k,
            where=_build_where_filter(request.jurisdiction_filter, request.document_type_filter),
        )
    except Exception as e:
        # If ChromaDB is empty or unavailable, return a helpful message
        results = {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

    # Step 2: Get graph context if requested
    graph_context = []
    if request.include_graph_context and results["ids"][0]:
        try:
            # Find related nodes in the knowledge graph
            doc_ids = [m.get("document_id") for m in results["metadatas"][0] if m.get("document_id")]
            if doc_ids:
                graph_context = await _get_graph_context(doc_ids[:3])
        except Exception:
            pass

    # Step 3: Build citations from results
    citations = []
    for i, (chunk_id, doc, metadata, distance) in enumerate(
        zip(
            results["ids"][0],
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        )
    ):
        relevance_score = 1 - (distance / 2)  # Convert distance to similarity
        citations.append(
            Citation(
                document_id=metadata.get("document_id", chunk_id),
                document_title=metadata.get("title", "Unknown Document"),
                citation=metadata.get("citation"),
                chunk_text=doc[:500] + "..." if len(doc) > 500 else doc,
                relevance_score=round(relevance_score, 3),
                page_or_section=metadata.get("section"),
            )
        )

    # Step 4: Generate answer (placeholder - would use LLM in production)
    answer, confidence, chain_of_thought, ambiguity_flags = await _generate_answer(
        query=request.query,
        context_chunks=[c.chunk_text for c in citations],
        graph_context=graph_context,
        explain=request.explain,
    )

    elapsed = (time.time() - start_time) * 1000

    return QueryResponse(
        query=request.query,
        answer=answer,
        confidence_score=confidence,
        citations=citations,
        chain_of_thought=chain_of_thought if request.explain else None,
        related_nodes=[n["id"] for n in graph_context] if graph_context else [],
        ambiguity_flags=ambiguity_flags,
        processing_time_ms=round(elapsed, 2),
    )


def _build_where_filter(
    jurisdiction: Optional[str], document_type: Optional[str]
) -> Optional[dict]:
    """Build ChromaDB where filter from query parameters."""
    conditions = []

    if jurisdiction:
        conditions.append({"jurisdiction": jurisdiction})
    if document_type:
        conditions.append({"document_type": document_type})

    if not conditions:
        return None
    elif len(conditions) == 1:
        return conditions[0]
    else:
        return {"$and": conditions}


async def _get_graph_context(document_ids: list[str]) -> list[dict]:
    """Get related nodes from the knowledge graph."""
    query = """
    MATCH (d)
    WHERE d.id IN $doc_ids
    OPTIONAL MATCH (d)-[r]-(related)
    RETURN d, collect(DISTINCT {
        id: related.id,
        title: related.title,
        citation: related.citation,
        relationship: type(r)
    })[0..5] as related_nodes
    """

    result = await neo4j_conn.execute_query(query, {"doc_ids": document_ids})

    context = []
    for record in result:
        node = record["d"]
        context.append({
            "id": node.get("id"),
            "title": node.get("title"),
            "citation": node.get("citation"),
            "related": record["related_nodes"],
        })

    return context


async def _generate_answer(
    query: str,
    context_chunks: list[str],
    graph_context: list[dict],
    explain: bool,
) -> tuple[str, float, Optional[str], list[str]]:
    """
    Generate an answer using the LLM (OpenAI or Ollama).
    """
    # Check if we have context
    if not context_chunks:
        return (
            "I don't have enough information in the legal corpus to answer this question. "
            "Please ensure relevant documents have been ingested into the system.",
            0.0,
            "No relevant documents found in vector store." if explain else None,
            ["No source documents available"],
        )

    # Call the real RAG service for LLM generation
    llm_result = await rag_service.generate_answer(
        query=query,
        context_chunks=context_chunks,
        graph_context=graph_context,
    )

    answer = llm_result.get("answer", "Unable to generate answer.")
    model_used = llm_result.get("model", "unknown")
    tokens_used = llm_result.get("tokens_used", 0)

    # Calculate confidence based on number of sources and model success
    if model_used == "error" or model_used == "fallback":
        confidence = 0.3
    else:
        confidence = min(0.95, 0.6 + (len(context_chunks) * 0.07))

    # Chain of thought for explainability
    chain_of_thought = None
    if explain:
        chain_of_thought = (
            f"Query Analysis:\n"
            f"1. Parsed query: '{query}'\n"
            f"2. Searched vector store for semantic matches\n"
            f"3. Found {len(context_chunks)} relevant document chunks\n"
            f"4. Retrieved graph context for {len(graph_context)} related nodes\n"
            f"5. Generated answer using {model_used} ({tokens_used} tokens)\n"
            f"6. Confidence based on source relevance and model: {confidence:.0%}"
        )

    # Identify ambiguities
    ambiguity_flags = []
    if len(context_chunks) < 3:
        ambiguity_flags.append("Limited source coverage - human review recommended")
    if confidence < 0.7:
        ambiguity_flags.append("Low confidence score - verify with primary sources")
    if model_used == "fallback":
        ambiguity_flags.append("LLM unavailable - showing raw context only")

    return answer, confidence, chain_of_thought, ambiguity_flags


@router.get("/suggest")
async def suggest_queries(partial: str, limit: int = 5):
    """Suggest query completions based on common legal queries."""
    # In production, this would use historical queries and legal terminology
    suggestions = [
        f"{partial} requirements for federal agencies",
        f"{partial} compliance obligations",
        f"{partial} enforcement mechanisms",
        f"{partial} exemptions and exceptions",
        f"{partial} reporting requirements",
    ]
    return {"suggestions": suggestions[:limit]}
