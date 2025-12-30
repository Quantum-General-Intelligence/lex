"""Demo data for showcasing the Lex platform without external databases."""

import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Load demo data from JSON file
_DATA_PATH = Path(__file__).parent.parent / "data" / "demo_data.json"


def _load_demo_data() -> dict:
    """Load demo data from JSON file."""
    try:
        with open(_DATA_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Demo data file not found: {_DATA_PATH}")
        return {"nodes": [], "relationships": []}
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse demo data JSON: {e}")
        return {"nodes": [], "relationships": []}


_demo_data = _load_demo_data()
DEMO_NODES = _demo_data.get("nodes", [])
DEMO_RELATIONSHIPS = _demo_data.get("relationships", [])


def _generate_chunks(nodes: list[dict]) -> list[dict]:
    """Generate document chunks from nodes for RAG simulation."""
    chunks = []
    for node in nodes:
        if node.get("text"):
            text = node["text"]
            chunk_size = 300
            for i in range(0, len(text), chunk_size - 50):
                chunk = text[i:i + chunk_size]
                if len(chunk) > 50:
                    chunks.append({
                        "id": f"{node['id']}_chunk_{i // (chunk_size - 50)}",
                        "document_id": node["id"],
                        "text": chunk,
                        "metadata": {
                            "document_id": node["id"],
                            "title": node["title"],
                            "citation": node.get("citation"),
                            "document_type": node["type"].lower(),
                            "jurisdiction": node.get("jurisdiction", "federal"),
                            "agency": node.get("agency"),
                        }
                    })
    return chunks


DEMO_CHUNKS = _generate_chunks(DEMO_NODES)


class DemoDataStore:
    """In-memory data store for demo mode."""

    def __init__(self):
        self.nodes = {node["id"]: node for node in DEMO_NODES}
        self.relationships = DEMO_RELATIONSHIPS
        self.chunks = DEMO_CHUNKS

    def get_nodes(
        self,
        node_type: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """Get nodes with optional filtering."""
        results = list(self.nodes.values())

        if node_type:
            results = [n for n in results if n["type"] == node_type]

        if jurisdiction:
            results = [n for n in results if n.get("jurisdiction") == jurisdiction]

        if search:
            search_lower = search.lower()
            results = [
                n for n in results
                if search_lower in n["title"].lower()
                or search_lower in (n.get("citation") or "").lower()
                or search_lower in (n.get("summary") or "").lower()
            ]

        return results[skip:skip + limit]

    def get_node(self, node_id: str) -> Optional[dict]:
        """Get a single node by ID."""
        return self.nodes.get(node_id)

    def get_node_relationships(self, node_id: str) -> list[dict]:
        """Get all relationships for a node."""
        results = []
        for rel in self.relationships:
            if rel["source"] == node_id:
                target = self.nodes.get(rel["target"])
                if target:
                    results.append({
                        "type": rel["type"],
                        "direction": "outgoing",
                        "node": {
                            "id": target["id"],
                            "title": target["title"],
                            "citation": target.get("citation"),
                            "type": target["type"],
                        }
                    })
            elif rel["target"] == node_id:
                source = self.nodes.get(rel["source"])
                if source:
                    results.append({
                        "type": rel["type"],
                        "direction": "incoming",
                        "node": {
                            "id": source["id"],
                            "title": source["title"],
                            "citation": source.get("citation"),
                            "type": source["type"],
                        }
                    })
        return results

    def get_authority_chain(self, node_id: str, max_depth: int = 5) -> list[dict]:
        """Trace the authority chain for a regulation."""
        chain = []
        visited = set()
        current_ids = [node_id]

        for depth in range(max_depth):
            next_ids = []
            for nid in current_ids:
                if nid in visited:
                    continue
                visited.add(nid)

                for rel in self.relationships:
                    if rel["source"] == nid and rel["type"] in ["IMPLEMENTS", "AUTHORIZES"]:
                        target = self.nodes.get(rel["target"])
                        if target and target["id"] not in visited:
                            chain.append(target)
                            next_ids.append(target["id"])

            if not next_ids:
                break
            current_ids = next_ids

        return chain

    def explore_graph(
        self,
        center_node_id: Optional[str] = None,
        limit: int = 100,
    ) -> dict:
        """Get nodes and relationships for visualization."""
        if center_node_id:
            center = self.nodes.get(center_node_id)
            if not center:
                return {"nodes": [], "relationships": []}

            # Get connected nodes
            connected_ids = set()
            relevant_rels = []
            for rel in self.relationships:
                if rel["source"] == center_node_id:
                    connected_ids.add(rel["target"])
                    relevant_rels.append(rel)
                elif rel["target"] == center_node_id:
                    connected_ids.add(rel["source"])
                    relevant_rels.append(rel)

            nodes = [center]
            for nid in list(connected_ids)[:limit - 1]:
                node = self.nodes.get(nid)
                if node:
                    nodes.append(node)

            return {
                "nodes": [
                    {
                        "id": n["id"],
                        "title": n["title"],
                        "citation": n.get("citation"),
                        "type": n["type"],
                        "jurisdiction": n.get("jurisdiction"),
                    }
                    for n in nodes
                ],
                "relationships": relevant_rels,
            }
        else:
            # Return all nodes up to limit
            nodes = list(self.nodes.values())[:limit]
            node_ids = {n["id"] for n in nodes}

            # Only include relationships between included nodes
            relevant_rels = [
                rel for rel in self.relationships
                if rel["source"] in node_ids and rel["target"] in node_ids
            ]

            return {
                "nodes": [
                    {
                        "id": n["id"],
                        "title": n["title"],
                        "citation": n.get("citation"),
                        "type": n["type"],
                        "jurisdiction": n.get("jurisdiction"),
                    }
                    for n in nodes
                ],
                "relationships": relevant_rels,
            }

    def search_chunks(
        self,
        query: str,
        top_k: int = 5,
        jurisdiction: Optional[str] = None,
        document_type: Optional[str] = None,
    ) -> list[dict]:
        """Simple keyword search over chunks (simulates vector search)."""
        query_terms = query.lower().split()

        scored_chunks = []
        for chunk in self.chunks:
            # Apply filters
            if jurisdiction and chunk["metadata"].get("jurisdiction") != jurisdiction:
                continue
            if document_type and chunk["metadata"].get("document_type") != document_type:
                continue

            # Score based on term overlap
            text_lower = chunk["text"].lower()
            title_lower = chunk["metadata"].get("title", "").lower()

            score = 0
            for term in query_terms:
                if term in text_lower:
                    score += text_lower.count(term) * 0.1
                if term in title_lower:
                    score += 0.3

            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "chunk_id": chunk["id"],
                "document_id": chunk["document_id"],
                "text": chunk["text"],
                "score": min(0.95, score),  # Cap at 0.95
                "metadata": chunk["metadata"],
            })

        return results


# Global demo data store instance
_demo_store: Optional[DemoDataStore] = None


def get_demo_store() -> DemoDataStore:
    """Get or create the demo data store."""
    global _demo_store
    if _demo_store is None:
        _demo_store = DemoDataStore()
    return _demo_store


def is_demo_mode() -> bool:
    """Check if we should use demo mode (when external DBs are unavailable)."""
    # Always use demo mode for now - can be made configurable
    return True
