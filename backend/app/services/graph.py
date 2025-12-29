"""Graph service for legal cartography operations."""

from typing import Optional
from app.core.database import neo4j_conn
from app.schemas.legal import LegalNodeType, RelationshipType


class GraphService:
    """Service for interacting with the legal knowledge graph."""

    @staticmethod
    async def create_node(
        node_type: LegalNodeType,
        title: str,
        citation: Optional[str] = None,
        jurisdiction: str = "federal",
        agency: Optional[str] = None,
        text: Optional[str] = None,
        summary: Optional[str] = None,
        source_url: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """Create a new node in the knowledge graph."""
        import uuid

        node_id = str(uuid.uuid4())

        query = f"""
        CREATE (n:{node_type.value} {{
            id: $id,
            title: $title,
            citation: $citation,
            jurisdiction: $jurisdiction,
            agency: $agency,
            text: $text,
            summary: $summary,
            source_url: $source_url,
            metadata: $metadata
        }})
        RETURN n
        """

        await neo4j_conn.execute_query(query, {
            "id": node_id,
            "title": title,
            "citation": citation,
            "jurisdiction": jurisdiction,
            "agency": agency,
            "text": text,
            "summary": summary,
            "source_url": source_url,
            "metadata": metadata or {},
        })

        return {"id": node_id, "title": title, "type": node_type.value}

    @staticmethod
    async def create_relationship(
        source_id: str,
        target_id: str,
        relationship_type: RelationshipType,
        properties: Optional[dict] = None,
    ) -> bool:
        """Create a relationship between two nodes."""
        query = f"""
        MATCH (source), (target)
        WHERE source.id = $source_id AND target.id = $target_id
        CREATE (source)-[r:{relationship_type.value} $properties]->(target)
        RETURN r
        """

        result = await neo4j_conn.execute_query(query, {
            "source_id": source_id,
            "target_id": target_id,
            "properties": properties or {},
        })

        return len(result) > 0

    @staticmethod
    async def find_authority_chain(node_id: str, max_depth: int = 5) -> list[dict]:
        """Find the authority chain for a given node."""
        query = """
        MATCH (start)
        WHERE start.id = $id
        MATCH path = (start)-[:IMPLEMENTS|AUTHORIZES*1..5]->(authority)
        RETURN nodes(path) as chain, length(path) as depth
        ORDER BY depth
        """

        result = await neo4j_conn.execute_query(query, {
            "id": node_id,
            "max_depth": max_depth,
        })

        chains = []
        for record in result:
            chain_nodes = record["chain"]
            chains.append({
                "nodes": [
                    {"id": n.get("id"), "title": n.get("title"), "citation": n.get("citation")}
                    for n in chain_nodes
                ],
                "depth": record["depth"],
            })

        return chains

    @staticmethod
    async def find_conflicts(node_id: str) -> list[dict]:
        """Find regulations that conflict with the given node."""
        query = """
        MATCH (n)-[:CONFLICTS_WITH]-(conflicting)
        WHERE n.id = $id
        RETURN conflicting
        """

        result = await neo4j_conn.execute_query(query, {"id": node_id})

        return [
            {
                "id": r["conflicting"].get("id"),
                "title": r["conflicting"].get("title"),
                "citation": r["conflicting"].get("citation"),
            }
            for r in result
        ]

    @staticmethod
    async def find_superseded(jurisdiction: str = "federal") -> list[dict]:
        """Find regulations that have been superseded but not yet repealed."""
        query = """
        MATCH (old:Regulation)<-[:SUPERSEDES]-(new:Regulation)
        WHERE old.jurisdiction = $jurisdiction
        AND NOT EXISTS((old)<-[:REPEALS]-())
        RETURN old, new
        """

        result = await neo4j_conn.execute_query(query, {"jurisdiction": jurisdiction})

        return [
            {
                "superseded": {
                    "id": r["old"].get("id"),
                    "title": r["old"].get("title"),
                    "citation": r["old"].get("citation"),
                },
                "superseded_by": {
                    "id": r["new"].get("id"),
                    "title": r["new"].get("title"),
                    "citation": r["new"].get("citation"),
                },
            }
            for r in result
        ]

    @staticmethod
    async def get_agency_regulations(agency: str) -> list[dict]:
        """Get all regulations for a specific agency."""
        query = """
        MATCH (a:Agency {name: $agency})-[:REGULATES]->(r:Regulation)
        OPTIONAL MATCH (r)-[:IMPLEMENTS]->(s:Statute)
        RETURN r, collect(s) as statutes
        """

        result = await neo4j_conn.execute_query(query, {"agency": agency})

        return [
            {
                "regulation": {
                    "id": r["r"].get("id"),
                    "title": r["r"].get("title"),
                    "citation": r["r"].get("citation"),
                },
                "authorizing_statutes": [
                    {"id": s.get("id"), "title": s.get("title"), "citation": s.get("citation")}
                    for s in r["statutes"]
                ],
            }
            for r in result
        ]
