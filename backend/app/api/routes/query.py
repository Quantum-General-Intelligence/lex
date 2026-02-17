import time

import structlog
from fastapi import APIRouter, HTTPException

from app.core.audit import AuditTrail
from app.core.config import get_settings
from app.core.database import get_chroma_client, neo4j_conn
from app.core.demo_data import get_demo_store, is_demo_mode
from app.schemas.rag import Citation, QueryRequest, QueryResponse
from app.services.rag import RAGService

logger = structlog.get_logger()
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

    # Use demo data if in demo mode
    if is_demo_mode():
        demo_store = get_demo_store()
        search_results = demo_store.search_chunks(
            query=request.query,
            top_k=request.top_k,
            jurisdiction=request.jurisdiction_filter,
            document_type=request.document_type_filter,
        )

        # Build citations from demo results
        citations = []
        for result in search_results:
            citations.append(
                Citation(
                    document_id=result["document_id"],
                    document_title=result["metadata"].get("title", "Unknown Document"),
                    citation=result["metadata"].get("citation"),
                    chunk_text=result["text"][:500] + "..." if len(result["text"]) > 500 else result["text"],
                    relevance_score=round(result["score"], 3),
                    page_or_section=None,
                )
            )

        # Get graph context for cited documents
        graph_context = []
        if request.include_graph_context and citations:
            doc_ids = list(set(c.document_id for c in citations[:3]))
            for doc_id in doc_ids:
                node = demo_store.get_node(doc_id)
                if node:
                    rels = demo_store.get_node_relationships(doc_id)
                    graph_context.append({
                        "id": node["id"],
                        "title": node["title"],
                        "citation": node.get("citation"),
                        "related": [{"id": r["node"]["id"], "title": r["node"]["title"], "relationship": r["type"]} for r in rels[:3]],
                    })

        # Generate answer from demo data
        answer, confidence, chain_of_thought, ambiguity_flags = _generate_demo_answer(
            query=request.query,
            citations=citations,
            graph_context=graph_context,
            explain=request.explain,
        )

        elapsed = (time.time() - start_time) * 1000

        # Record audit trail
        AuditTrail.record(
            query=request.query,
            answer=answer,
            confidence_score=confidence,
            citations=citations,
            chain_of_thought=chain_of_thought,
            ambiguity_flags=ambiguity_flags,
            processing_time_ms=round(elapsed, 2),
            filters={
                "jurisdiction": request.jurisdiction_filter,
                "document_type": request.document_type_filter,
            },
            graph_context=graph_context,
            demo_mode=True,
        )

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
    except Exception:
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

    # Record audit trail
    AuditTrail.record(
        query=request.query,
        answer=answer,
        confidence_score=confidence,
        citations=citations,
        chain_of_thought=chain_of_thought,
        ambiguity_flags=ambiguity_flags,
        processing_time_ms=round(elapsed, 2),
        filters={
            "jurisdiction": request.jurisdiction_filter,
            "document_type": request.document_type_filter,
        },
        graph_context=graph_context,
        demo_mode=False,
    )

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
    jurisdiction: str | None, document_type: str | None
) -> dict | None:
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
) -> tuple[str, float, str | None, list[str]]:
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


def _generate_demo_answer(
    query: str,
    citations: list[Citation],
    graph_context: list[dict],
    explain: bool,
) -> tuple[str, float, str | None, list[str]]:
    """Generate a demo answer based on matched citations."""
    if not citations:
        return (
            "I couldn't find relevant information in the demo legal corpus for this query. "
            "Try searching for topics like 'FOIA', 'FERPA', 'rulemaking', 'environmental', or 'agency'.",
            0.0,
            "No matching documents found in demo data." if explain else None,
            ["No source documents matched the query"],
        )

    # Build an answer from the top citations
    top_citation = citations[0]
    related_docs = [c.document_title for c in citations[1:4]]

    answer = "Based on the legal corpus, here's what I found regarding your query:\n\n"
    answer += f"**Primary Source: {top_citation.document_title}**"
    if top_citation.citation:
        answer += f" ({top_citation.citation})"
    answer += f"\n\n{top_citation.chunk_text}\n\n"

    if related_docs:
        answer += f"**Related Sources:** {', '.join(related_docs)}\n\n"

    if graph_context:
        answer += "**Knowledge Graph Context:**\n"
        for ctx in graph_context[:2]:
            if ctx.get("related"):
                related_titles = [r["title"] for r in ctx["related"][:2]]
                answer += f"- {ctx['title']} relates to: {', '.join(related_titles)}\n"

    # Calculate confidence based on match quality
    confidence = min(0.85, 0.5 + (len(citations) * 0.1))

    # Chain of thought
    chain_of_thought = None
    if explain:
        chain_of_thought = (
            f"Query Analysis (Demo Mode):\n"
            f"1. Parsed query: '{query}'\n"
            f"2. Searched demo corpus using keyword matching\n"
            f"3. Found {len(citations)} relevant document chunks\n"
            f"4. Retrieved {len(graph_context)} related nodes from knowledge graph\n"
            f"5. Generated answer from top matching sources\n"
            f"6. Confidence based on match count and relevance: {confidence:.0%}\n\n"
            f"Note: This is demo mode with sample legal data. In production, "
            f"this would use semantic vector search and LLM-generated responses."
        )

    # Flags
    ambiguity_flags = ["Demo mode - using sample data"]
    if len(citations) < 3:
        ambiguity_flags.append("Limited matches found")

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


@router.get("/audit")
async def get_audit_records(limit: int = 50):
    """Get recent AI query audit records.

    Returns audit trail of queries for compliance and debugging.
    """
    records = AuditTrail.get_recent(limit=limit)
    return {
        "records": [r.model_dump() for r in records],
        "stats": AuditTrail.get_stats(),
    }


@router.get("/audit/{audit_id}")
async def get_audit_record(audit_id: str):
    """Get a specific audit record by ID.

    Useful for investigating specific queries.
    """
    record = AuditTrail.get_by_id(audit_id)
    if not record:
        raise HTTPException(status_code=404, detail="Audit record not found")
    return record.model_dump()
