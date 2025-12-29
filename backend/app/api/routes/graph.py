from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import time

from app.core.database import neo4j_conn
from app.core.demo_data import get_demo_store, is_demo_mode
from app.schemas.legal import (
    LegalNodeCreate,
    LegalNodeResponse,
    LegalRelationshipCreate,
    GraphQueryResponse,
    AuthorityChainResponse,
    LegalNodeType,
    RelationshipType,
)

router = APIRouter()


@router.post("/nodes", response_model=LegalNodeResponse)
async def create_node(node: LegalNodeCreate):
    """Create a new node in the legal knowledge graph."""
    import uuid

    node_id = str(uuid.uuid4())

    query = f"""
    CREATE (n:{node.node_type.value} {{
        id: $id,
        title: $title,
        citation: $citation,
        jurisdiction: $jurisdiction,
        agency: $agency,
        effective_date: $effective_date,
        text: $text,
        summary: $summary,
        source_url: $source_url,
        metadata: $metadata
    }})
    RETURN n
    """

    params = {
        "id": node_id,
        "title": node.title,
        "citation": node.citation,
        "jurisdiction": node.jurisdiction,
        "agency": node.agency,
        "effective_date": node.effective_date.isoformat() if node.effective_date else None,
        "text": node.text,
        "summary": node.summary,
        "source_url": node.source_url,
        "metadata": node.metadata,
    }

    result = await neo4j_conn.execute_query(query, params)

    return LegalNodeResponse(
        id=node_id,
        node_type=node.node_type,
        title=node.title,
        citation=node.citation,
        jurisdiction=node.jurisdiction,
        agency=node.agency,
        effective_date=node.effective_date,
        summary=node.summary,
        source_url=node.source_url,
        metadata=node.metadata,
        relationship_count=0,
    )


@router.get("/nodes/{node_id}", response_model=LegalNodeResponse)
async def get_node(node_id: str):
    """Get a node by ID."""
    # Use demo data if in demo mode
    if is_demo_mode():
        demo_store = get_demo_store()
        node = demo_store.get_node(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node not found")
        return LegalNodeResponse(
            id=node["id"],
            node_type=LegalNodeType(node["type"]),
            title=node["title"],
            citation=node.get("citation"),
            jurisdiction=node.get("jurisdiction", "federal"),
            agency=node.get("agency"),
            effective_date=None,
            summary=node.get("summary"),
            source_url=node.get("source_url"),
            metadata={},
            relationship_count=len(demo_store.get_node_relationships(node_id)),
        )

    query = """
    MATCH (n)
    WHERE n.id = $id
    OPTIONAL MATCH (n)-[r]-()
    RETURN n, labels(n) as labels, count(r) as rel_count
    """

    result = await neo4j_conn.execute_query(query, {"id": node_id})

    if not result:
        raise HTTPException(status_code=404, detail="Node not found")

    node_data = result[0]["n"]
    labels = result[0]["labels"]
    rel_count = result[0]["rel_count"]

    # Determine node type from label
    node_type = LegalNodeType.STATUTE
    for label in labels:
        if label in [t.value for t in LegalNodeType]:
            node_type = LegalNodeType(label)
            break

    return LegalNodeResponse(
        id=node_data["id"],
        node_type=node_type,
        title=node_data.get("title", ""),
        citation=node_data.get("citation"),
        jurisdiction=node_data.get("jurisdiction", "federal"),
        agency=node_data.get("agency"),
        effective_date=None,  # Would need parsing
        summary=node_data.get("summary"),
        source_url=node_data.get("source_url"),
        metadata=node_data.get("metadata", {}),
        relationship_count=rel_count,
    )


@router.get("/nodes/{node_id}/details")
async def get_node_details(node_id: str):
    """Get detailed node information including text, summary, and relationships."""
    # Use demo data if in demo mode
    if is_demo_mode():
        demo_store = get_demo_store()
        node = demo_store.get_node(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node not found")
        relationships = demo_store.get_node_relationships(node_id)
        return {
            "id": node["id"],
            "type": node["type"],
            "title": node["title"],
            "citation": node.get("citation"),
            "jurisdiction": node.get("jurisdiction"),
            "agency": node.get("agency"),
            "year": node.get("year"),
            "court": node.get("court"),
            "summary": node.get("summary"),
            "text": node.get("text"),
            "abbreviation": node.get("abbreviation"),
            "relationships": relationships,
        }

    # Get the node with all its properties
    node_query = """
    MATCH (n)
    WHERE n.id = $id
    RETURN n, labels(n) as labels
    """
    node_result = await neo4j_conn.execute_query(node_query, {"id": node_id})

    if not node_result:
        raise HTTPException(status_code=404, detail="Node not found")

    node_data = node_result[0]["n"]
    labels = node_result[0]["labels"]

    # Determine node type from label
    node_type = "Unknown"
    for label in labels:
        if label in ["Statute", "Regulation", "CaseLaw", "ExecutiveOrder", "Agency"]:
            node_type = label
            break

    # Get relationships with connected node info
    rel_query = """
    MATCH (n)-[r]-(connected)
    WHERE n.id = $id
    RETURN type(r) as rel_type,
           startNode(r).id = n.id as is_outgoing,
           connected.id as connected_id,
           connected.title as connected_title,
           connected.citation as connected_citation,
           labels(connected) as connected_labels
    """
    rel_result = await neo4j_conn.execute_query(rel_query, {"id": node_id})

    # Build relationships list
    relationships = []
    for rel in rel_result:
        connected_type = "Unknown"
        for label in rel.get("connected_labels", []):
            if label in ["Statute", "Regulation", "CaseLaw", "ExecutiveOrder", "Agency"]:
                connected_type = label
                break

        relationships.append({
            "type": rel["rel_type"],
            "direction": "outgoing" if rel["is_outgoing"] else "incoming",
            "node": {
                "id": rel["connected_id"],
                "title": rel["connected_title"],
                "citation": rel.get("connected_citation"),
                "type": connected_type,
            }
        })

    return {
        "id": node_data.get("id"),
        "type": node_type,
        "title": node_data.get("title", ""),
        "citation": node_data.get("citation"),
        "jurisdiction": node_data.get("jurisdiction"),
        "agency": node_data.get("agency"),
        "year": node_data.get("year"),
        "court": node_data.get("court"),
        "summary": node_data.get("summary"),
        "text": node_data.get("text"),
        "abbreviation": node_data.get("abbreviation"),
        "relationships": relationships,
    }


@router.post("/relationships")
async def create_relationship(relationship: LegalRelationshipCreate):
    """Create a relationship between two nodes."""
    query = f"""
    MATCH (source), (target)
    WHERE source.id = $source_id AND target.id = $target_id
    CREATE (source)-[r:{relationship.relationship_type.value} $properties]->(target)
    RETURN source.id as source, type(r) as rel_type, target.id as target
    """

    params = {
        "source_id": relationship.source_id,
        "target_id": relationship.target_id,
        "properties": relationship.properties,
    }

    result = await neo4j_conn.execute_query(query, params)

    if not result:
        raise HTTPException(status_code=404, detail="One or both nodes not found")

    return {
        "status": "created",
        "source": relationship.source_id,
        "relationship": relationship.relationship_type.value,
        "target": relationship.target_id,
    }


@router.get("/nodes", response_model=list[LegalNodeResponse])
async def list_nodes(
    node_type: Optional[LegalNodeType] = None,
    jurisdiction: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    skip: int = 0,
):
    """List nodes with optional filters."""
    # Use demo data if in demo mode
    if is_demo_mode():
        demo_store = get_demo_store()
        demo_nodes = demo_store.get_nodes(
            node_type=node_type.value if node_type else None,
            jurisdiction=jurisdiction,
            search=search,
            limit=limit,
            skip=skip,
        )
        return [
            LegalNodeResponse(
                id=n["id"],
                node_type=LegalNodeType(n["type"]),
                title=n["title"],
                citation=n.get("citation"),
                jurisdiction=n.get("jurisdiction", "federal"),
                agency=n.get("agency"),
                effective_date=None,
                summary=n.get("summary"),
                source_url=n.get("source_url"),
                metadata={},
                relationship_count=len(demo_store.get_node_relationships(n["id"])),
            )
            for n in demo_nodes
        ]

    # Original Neo4j implementation
    conditions = []
    params = {"limit": limit, "skip": skip}

    if node_type:
        label_filter = f":{node_type.value}"
    else:
        label_filter = ""

    if jurisdiction:
        conditions.append("n.jurisdiction = $jurisdiction")
        params["jurisdiction"] = jurisdiction

    if search:
        conditions.append("(n.title CONTAINS $search OR n.citation CONTAINS $search)")
        params["search"] = search

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
    MATCH (n{label_filter})
    {where_clause}
    OPTIONAL MATCH (n)-[r]-()
    RETURN n, labels(n) as labels, count(DISTINCT r) as rel_count
    ORDER BY n.title
    SKIP $skip
    LIMIT $limit
    """

    result = await neo4j_conn.execute_query(query, params)

    nodes = []
    for record in result:
        node_data = record["n"]
        labels = record["labels"]

        detected_type = LegalNodeType.STATUTE
        for label in labels:
            if label in [t.value for t in LegalNodeType]:
                detected_type = LegalNodeType(label)
                break

        nodes.append(
            LegalNodeResponse(
                id=node_data["id"],
                node_type=detected_type,
                title=node_data.get("title", ""),
                citation=node_data.get("citation"),
                jurisdiction=node_data.get("jurisdiction", "federal"),
                agency=node_data.get("agency"),
                effective_date=None,
                summary=node_data.get("summary"),
                source_url=node_data.get("source_url"),
                metadata=node_data.get("metadata", {}),
                relationship_count=record["rel_count"],
            )
        )

    return nodes


@router.get("/authority-chain/{node_id}", response_model=AuthorityChainResponse)
async def get_authority_chain(node_id: str, max_depth: int = Query(default=5, le=10)):
    """
    Get the authority chain for a regulation.

    This traces back through IMPLEMENTS and AUTHORIZES relationships
    to show what legal authority enables a given regulation.
    """
    start_time = time.time()

    # Use demo data if in demo mode
    if is_demo_mode():
        demo_store = get_demo_store()
        node = demo_store.get_node(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node not found")

        regulation = LegalNodeResponse(
            id=node["id"],
            node_type=LegalNodeType(node["type"]),
            title=node["title"],
            citation=node.get("citation"),
            jurisdiction=node.get("jurisdiction", "federal"),
            agency=node.get("agency"),
            effective_date=None,
            summary=node.get("summary"),
            source_url=None,
            metadata={},
            relationship_count=len(demo_store.get_node_relationships(node_id)),
        )

        chain = demo_store.get_authority_chain(node_id, max_depth)
        authority_chain = [
            LegalNodeResponse(
                id=n["id"],
                node_type=LegalNodeType(n["type"]),
                title=n["title"],
                citation=n.get("citation"),
                jurisdiction=n.get("jurisdiction", "federal"),
                agency=n.get("agency"),
                effective_date=None,
                summary=n.get("summary"),
                source_url=None,
                metadata={},
                relationship_count=0,
            )
            for n in chain
        ]

        if authority_chain:
            explanation = f"The {node['type'].lower()} '{node['title']}' derives its authority from {len(authority_chain)} upstream legal source(s). "
            if authority_chain:
                explanation += f"The primary authority is '{authority_chain[-1].title}'"
                if authority_chain[-1].citation:
                    explanation += f" ({authority_chain[-1].citation})"
                explanation += "."
        else:
            explanation = "No authority chain found. This may be a primary source or its relationships haven't been mapped yet."

        return AuthorityChainResponse(
            regulation=regulation,
            authority_chain=authority_chain,
            depth=len(authority_chain),
            explanation=explanation,
        )

    # First get the regulation node
    node_query = """
    MATCH (n)
    WHERE n.id = $id
    RETURN n, labels(n) as labels
    """
    node_result = await neo4j_conn.execute_query(node_query, {"id": node_id})

    if not node_result:
        raise HTTPException(status_code=404, detail="Node not found")

    # Traverse authority chain
    chain_query = """
    MATCH (start)
    WHERE start.id = $id
    MATCH path = (start)-[:IMPLEMENTS|AUTHORIZES*1..{max_depth}]->(authority)
    RETURN path, nodes(path) as chain_nodes, length(path) as depth
    ORDER BY depth
    """.replace("{max_depth}", str(max_depth))

    chain_result = await neo4j_conn.execute_query(chain_query, {"id": node_id})

    # Build response
    node_data = node_result[0]["n"]
    labels = node_result[0]["labels"]

    detected_type = LegalNodeType.REGULATION
    for label in labels:
        if label in [t.value for t in LegalNodeType]:
            detected_type = LegalNodeType(label)
            break

    regulation = LegalNodeResponse(
        id=node_data["id"],
        node_type=detected_type,
        title=node_data.get("title", ""),
        citation=node_data.get("citation"),
        jurisdiction=node_data.get("jurisdiction", "federal"),
        agency=node_data.get("agency"),
        effective_date=None,
        summary=node_data.get("summary"),
        source_url=node_data.get("source_url"),
        metadata=node_data.get("metadata", {}),
        relationship_count=0,
    )

    authority_chain = []
    max_depth_found = 0

    for record in chain_result:
        chain_nodes = record["chain_nodes"]
        depth = record["depth"]
        max_depth_found = max(max_depth_found, depth)

        for chain_node in chain_nodes[1:]:  # Skip the start node
            if chain_node["id"] not in [n.id for n in authority_chain]:
                authority_chain.append(
                    LegalNodeResponse(
                        id=chain_node["id"],
                        node_type=LegalNodeType.STATUTE,  # Simplified
                        title=chain_node.get("title", ""),
                        citation=chain_node.get("citation"),
                        jurisdiction=chain_node.get("jurisdiction", "federal"),
                        agency=chain_node.get("agency"),
                        effective_date=None,
                        summary=chain_node.get("summary"),
                        source_url=chain_node.get("source_url"),
                        metadata=chain_node.get("metadata", {}),
                        relationship_count=0,
                    )
                )

    # Generate explanation
    if authority_chain:
        explanation = f"The regulation '{regulation.title}' derives its authority from {len(authority_chain)} upstream legal source(s). "
        if authority_chain:
            explanation += f"The primary authority is '{authority_chain[-1].title}'"
            if authority_chain[-1].citation:
                explanation += f" ({authority_chain[-1].citation})"
            explanation += "."
    else:
        explanation = "No authority chain found. This regulation may be a primary source or its relationships haven't been mapped yet."

    return AuthorityChainResponse(
        regulation=regulation,
        authority_chain=authority_chain,
        depth=max_depth_found,
        explanation=explanation,
    )


@router.get("/explore")
async def explore_graph(
    center_node_id: Optional[str] = None,
    depth: int = Query(default=2, le=4),
    limit: int = Query(default=100, le=500),
):
    """
    Explore the graph around a center node or get an overview.

    Returns nodes and relationships for visualization.
    """
    start_time = time.time()

    # Use demo data if in demo mode
    if is_demo_mode():
        demo_store = get_demo_store()
        result = demo_store.explore_graph(center_node_id=center_node_id, limit=limit)
        elapsed = (time.time() - start_time) * 1000
        return {
            "nodes": result["nodes"],
            "relationships": result["relationships"],
            "query_time_ms": elapsed,
        }

    if center_node_id:
        # Explore around a specific node - get nodes and relationships with explicit IDs
        query = """
        MATCH (center)
        WHERE center.id = $center_id
        OPTIONAL MATCH (center)-[r]-(connected)
        WITH center, collect(DISTINCT connected)[0..$limit] as connected_nodes,
             collect(DISTINCT {source: startNode(r).id, target: endNode(r).id, type: type(r)}) as rels
        RETURN [center] + connected_nodes as nodes, rels as relationships
        """
        params = {"center_id": center_node_id, "limit": limit}
    else:
        # Get overview of graph - explicitly extract relationship endpoints
        query = """
        MATCH (n)
        WITH collect(DISTINCT n)[0..$limit] as all_nodes
        UNWIND all_nodes as n
        OPTIONAL MATCH (n)-[r]->(m)
        WHERE m IN all_nodes
        WITH all_nodes, collect(DISTINCT {source: startNode(r).id, target: endNode(r).id, type: type(r)}) as rels
        UNWIND all_nodes as node
        RETURN collect(DISTINCT {node: node, labels: labels(node)}) as nodes, rels as relationships
        """
        params = {"limit": limit}

    try:
        result = await neo4j_conn.execute_query(query, params)
    except Exception as e:
        # Fallback with simpler query
        if center_node_id:
            query = """
            MATCH (center)
            WHERE center.id = $center_id
            OPTIONAL MATCH (center)-[r]-(connected)
            WITH center,
                 collect(DISTINCT {node: connected, labels: labels(connected)})[0..$limit] as connected_data,
                 collect(DISTINCT {source: startNode(r).id, target: endNode(r).id, type: type(r)}) as rels
            RETURN [{node: center, labels: labels(center)}] + connected_data as nodes, rels as relationships
            """
            params = {"center_id": center_node_id, "limit": limit}
        else:
            query = """
            MATCH (n)
            WITH collect(DISTINCT {node: n, labels: labels(n)})[0..$limit] as all_nodes
            UNWIND all_nodes as node_data
            WITH all_nodes, node_data.node as n
            OPTIONAL MATCH (n)-[r]->(m)
            WHERE m.id IN [nd IN all_nodes | nd.node.id]
            WITH all_nodes, collect(DISTINCT {source: n.id, target: m.id, type: type(r)}) as rels
            RETURN all_nodes as nodes, [rel IN rels WHERE rel.source IS NOT NULL AND rel.target IS NOT NULL] as relationships
            """
            params = {"limit": limit}

        result = await neo4j_conn.execute_query(query, params)

    elapsed = (time.time() - start_time) * 1000

    if not result:
        return {"nodes": [], "relationships": [], "query_time_ms": elapsed}

    # Transform nodes
    nodes = []
    for item in result[0].get("nodes", []):
        if item:
            node = item.get("node", item) if isinstance(item, dict) and "node" in item else item
            node_labels = item.get("labels", []) if isinstance(item, dict) else []
            if node:
                # Determine type from Neo4j labels
                node_type = "Unknown"
                for label in node_labels:
                    if label in ["Statute", "Regulation", "CaseLaw", "ExecutiveOrder", "Agency"]:
                        node_type = label
                        break
                node_id = node.get("id") if isinstance(node, dict) else None
                if node_id:
                    nodes.append({
                        "id": node_id,
                        "title": node.get("title") if isinstance(node, dict) else None,
                        "citation": node.get("citation") if isinstance(node, dict) else None,
                        "jurisdiction": node.get("jurisdiction") if isinstance(node, dict) else None,
                        "type": node_type,
                    })

    # Transform relationships - they're already in the right format from the query
    relationships = []
    for rel in result[0].get("relationships", []):
        if rel and isinstance(rel, dict):
            source = rel.get("source")
            target = rel.get("target")
            rel_type = rel.get("type")
            # Only include relationships where both source and target exist
            if source and target:
                relationships.append({
                    "source": source,
                    "target": target,
                    "type": rel_type or "RELATED",
                })

    return {
        "nodes": nodes,
        "relationships": relationships,
        "query_time_ms": elapsed,
    }
