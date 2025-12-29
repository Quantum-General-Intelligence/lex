from fastapi import APIRouter, HTTPException
import time
from typing import Optional

from app.schemas.rag import (
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    ComplianceIssue,
    CommentBatchAnalysisResponse,
    PublicCommentAnalysis,
)
from app.core.database import neo4j_conn, get_chroma_client

router = APIRouter()


@router.post("/compliance", response_model=ComplianceCheckResponse)
async def check_compliance(request: ComplianceCheckRequest):
    """
    Check a document for compliance against regulations.

    This performs "regulatory redlining" - identifying potential
    compliance issues in the submitted text.
    """
    start_time = time.time()

    # Step 1: Find relevant regulations
    try:
        chroma = get_chroma_client()
        collection = chroma.get_or_create_collection(name="legal_documents")

        # Search for regulations that might apply
        results = collection.query(
            query_texts=[request.document_text[:1000]],  # Use first 1000 chars as query
            n_results=10,
            where={"document_type": "regulation"} if request.target_regulations is None else None,
        )
    except Exception:
        results = {"ids": [[]], "documents": [[]], "metadatas": [[]]}

    # Step 2: Analyze for compliance issues (placeholder logic)
    issues = []

    # In production, this would use NLP/LLM to identify actual issues
    # For demo, we'll generate sample issues based on keyword matching

    sample_keywords = {
        "personal data": ("critical", "Data Protection", "GDPR Art. 5"),
        "retention": ("warning", "Records Management", "44 U.S.C. § 3101"),
        "disclosure": ("warning", "FOIA Compliance", "5 U.S.C. § 552"),
        "security": ("info", "Cybersecurity", "FISMA"),
    }

    doc_lower = request.document_text.lower()
    for keyword, (severity, category, citation) in sample_keywords.items():
        if keyword in doc_lower:
            # Find the excerpt
            idx = doc_lower.find(keyword)
            start = max(0, idx - 50)
            end = min(len(request.document_text), idx + len(keyword) + 50)
            excerpt = request.document_text[start:end]

            issues.append(
                ComplianceIssue(
                    severity=severity,
                    regulation_id=f"demo-{category.lower().replace(' ', '-')}",
                    regulation_citation=citation,
                    issue_description=f"Document references '{keyword}' - ensure compliance with {category} requirements.",
                    document_excerpt=f"...{excerpt}...",
                    suggested_fix=f"Review {category} requirements and ensure proper procedures are documented.",
                    confidence=0.75,
                )
            )

    # Determine overall status
    if any(i.severity == "critical" for i in issues):
        overall_status = "issues_found"
    elif any(i.severity == "warning" for i in issues):
        overall_status = "review_required"
    elif issues:
        overall_status = "review_required"
    else:
        overall_status = "compliant"

    elapsed = (time.time() - start_time) * 1000

    return ComplianceCheckResponse(
        document_summary=f"Analyzed document with {len(request.document_text)} characters.",
        overall_status=overall_status,
        issues=issues,
        checked_regulations=len(results["ids"][0]) if results["ids"][0] else 0,
        processing_time_ms=round(elapsed, 2),
    )


@router.post("/comments", response_model=CommentBatchAnalysisResponse)
async def analyze_public_comments(
    comments: list[str],
    regulation_id: Optional[str] = None,
):
    """
    Analyze a batch of public comments for sentiment, topics, and concerns.

    This helps agencies process and respond to public feedback on proposed rules.
    """
    start_time = time.time()

    if not comments:
        raise HTTPException(status_code=400, detail="No comments provided")

    # Analyze each comment (placeholder - would use NLP in production)
    analyses = []
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
    topic_counts: dict[str, int] = {}
    concern_counts: dict[str, int] = {}

    for i, comment in enumerate(comments[:100]):  # Limit to 100 for demo
        # Simple sentiment analysis (placeholder)
        comment_lower = comment.lower()

        if any(w in comment_lower for w in ["support", "agree", "good", "beneficial"]):
            sentiment = "positive"
        elif any(w in comment_lower for w in ["oppose", "disagree", "bad", "harmful", "concern"]):
            sentiment = "negative"
        else:
            sentiment = "neutral"

        sentiment_counts[sentiment] += 1

        # Topic extraction (placeholder)
        topics = []
        topic_keywords = {
            "environmental": "Environmental Impact",
            "cost": "Economic Impact",
            "safety": "Safety Concerns",
            "privacy": "Privacy Rights",
            "business": "Business Impact",
            "health": "Public Health",
        }

        for keyword, topic in topic_keywords.items():
            if keyword in comment_lower:
                topics.append(topic)
                topic_counts[topic] = topic_counts.get(topic, 0) + 1

        # Extract concerns (placeholder)
        concerns = []
        if "cost" in comment_lower or "expensive" in comment_lower:
            concern = "Implementation costs"
            concerns.append(concern)
            concern_counts[concern] = concern_counts.get(concern, 0) + 1
        if "time" in comment_lower or "deadline" in comment_lower:
            concern = "Timeline concerns"
            concerns.append(concern)
            concern_counts[concern] = concern_counts.get(concern, 0) + 1
        if "unclear" in comment_lower or "confusing" in comment_lower:
            concern = "Clarity of requirements"
            concerns.append(concern)
            concern_counts[concern] = concern_counts.get(concern, 0) + 1

        analysis = PublicCommentAnalysis(
            comment_id=f"comment-{i+1}",
            sentiment=sentiment,
            sentiment_score=0.8 if sentiment != "neutral" else 0.5,
            topics=topics or ["General Feedback"],
            key_concerns=concerns or [],
            suggested_response_points=[
                f"Address {concern}" for concern in concerns
            ] if concerns else ["Acknowledge feedback"],
        )
        analyses.append(analysis)

    # Sort topics and concerns by frequency
    top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_concerns = sorted(concern_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    elapsed = (time.time() - start_time) * 1000

    return CommentBatchAnalysisResponse(
        total_comments=len(comments),
        sentiment_distribution=sentiment_counts,
        top_topics=top_topics,
        top_concerns=top_concerns,
        sample_analyses=analyses[:10],  # Return first 10 as samples
        processing_time_ms=round(elapsed, 2),
    )


@router.get("/repeal-candidates")
async def find_repeal_candidates(
    jurisdiction: str = "federal",
    agency: Optional[str] = None,
    limit: int = 20,
):
    """
    Find regulations that are candidates for repeal or reform.

    Identifies:
    - Regulations with no clear statutory authority
    - Regulations that conflict with newer rules
    - Regulations that have been superseded
    - Regulations with expired provisions
    """
    # Query graph for potential repeal candidates
    query = """
    MATCH (r:Regulation)
    WHERE r.jurisdiction = $jurisdiction
    AND ($agency IS NULL OR r.agency = $agency)

    // Find regulations without clear authority
    OPTIONAL MATCH (r)-[:IMPLEMENTS]->(statute:Statute)

    // Find regulations that might be superseded
    OPTIONAL MATCH (r)<-[:SUPERSEDES]-(newer:Regulation)

    // Find conflicting regulations
    OPTIONAL MATCH (r)-[:CONFLICTS_WITH]-(conflicting:Regulation)

    WITH r, statute, newer, conflicting
    WHERE statute IS NULL OR newer IS NOT NULL OR conflicting IS NOT NULL

    RETURN r,
           CASE WHEN statute IS NULL THEN 'no_authority' ELSE null END as issue_no_authority,
           CASE WHEN newer IS NOT NULL THEN 'superseded' ELSE null END as issue_superseded,
           CASE WHEN conflicting IS NOT NULL THEN 'conflicts' ELSE null END as issue_conflicts,
           newer, conflicting
    LIMIT $limit
    """

    try:
        result = await neo4j_conn.execute_query(
            query,
            {"jurisdiction": jurisdiction, "agency": agency, "limit": limit}
        )
    except Exception:
        result = []

    candidates = []
    for record in result:
        reg = record["r"]
        issues = []

        if record.get("issue_no_authority"):
            issues.append({
                "type": "no_authority",
                "description": "No clear statutory authority found in knowledge graph",
                "severity": "high",
            })
        if record.get("issue_superseded"):
            issues.append({
                "type": "superseded",
                "description": f"Superseded by newer regulation",
                "severity": "medium",
                "superseded_by": record["newer"].get("citation") if record.get("newer") else None,
            })
        if record.get("issue_conflicts"):
            issues.append({
                "type": "conflicts",
                "description": "Conflicts with other regulation",
                "severity": "medium",
                "conflicts_with": record["conflicting"].get("citation") if record.get("conflicting") else None,
            })

        if issues:  # Only include if there are actual issues
            candidates.append({
                "regulation_id": reg.get("id"),
                "title": reg.get("title"),
                "citation": reg.get("citation"),
                "agency": reg.get("agency"),
                "issues": issues,
                "recommendation": "Review for potential repeal or amendment",
            })

    return {
        "jurisdiction": jurisdiction,
        "agency": agency,
        "candidates": candidates,
        "total_found": len(candidates),
        "note": "These are candidates identified by graph analysis. Human review is required.",
    }
