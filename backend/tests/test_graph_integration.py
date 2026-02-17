"""Integration tests for graph API endpoints.

These tests verify the graph API works correctly with demo data,
testing actual business logic rather than just parameter validation.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestGraphExplore:
    """Integration tests for /api/graph/explore endpoint."""

    def test_explore_returns_nodes_and_relationships(self, client):
        """Explore should return both nodes and relationships."""
        response = client.get("/api/graph/explore?limit=50")
        assert response.status_code == 200

        data = response.json()
        assert "nodes" in data
        assert "relationships" in data
        assert "query_time_ms" in data

        # Should return some data in demo mode
        assert len(data["nodes"]) > 0

    def test_explore_nodes_have_required_fields(self, client):
        """Each node should have id, title, and type."""
        response = client.get("/api/graph/explore?limit=10")
        data = response.json()

        for node in data["nodes"]:
            assert "id" in node, "Node missing 'id' field"
            assert "title" in node, "Node missing 'title' field"
            assert "type" in node, "Node missing 'type' field"

    def test_explore_relationships_have_required_fields(self, client):
        """Each relationship should have source, target, and type."""
        response = client.get("/api/graph/explore?limit=50")
        data = response.json()

        for rel in data["relationships"]:
            assert "source" in rel, "Relationship missing 'source' field"
            assert "target" in rel, "Relationship missing 'target' field"
            assert "type" in rel, "Relationship missing 'type' field"

    def test_explore_respects_limit(self, client):
        """Should not return more nodes than the limit."""
        response = client.get("/api/graph/explore?limit=5")
        data = response.json()

        assert len(data["nodes"]) <= 5

    def test_explore_returns_timing_info(self, client):
        """Should include query timing for performance monitoring."""
        response = client.get("/api/graph/explore?limit=10")
        data = response.json()

        assert "query_time_ms" in data
        assert isinstance(data["query_time_ms"], (int, float))
        assert data["query_time_ms"] >= 0


class TestListNodes:
    """Integration tests for /api/graph/nodes endpoint."""

    def test_list_nodes_returns_array(self, client):
        """Should return an array of nodes."""
        response = client.get("/api/graph/nodes?limit=10")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)

    def test_list_nodes_respects_limit(self, client):
        """Should not return more nodes than the limit."""
        response = client.get("/api/graph/nodes?limit=5")
        data = response.json()

        assert len(data) <= 5

    def test_list_nodes_filter_by_type(self, client):
        """Should filter nodes by type when specified."""
        response = client.get("/api/graph/nodes?node_type=Statute&limit=50")
        assert response.status_code == 200

        data = response.json()
        for node in data:
            assert node["node_type"] == "Statute"

    def test_list_nodes_response_schema(self, client):
        """Each node should match LegalNodeResponse schema."""
        response = client.get("/api/graph/nodes?limit=5")
        data = response.json()

        required_fields = ["id", "node_type", "title", "jurisdiction"]
        for node in data:
            for field in required_fields:
                assert field in node, f"Node missing required field: {field}"


class TestGetNode:
    """Integration tests for /api/graph/nodes/{node_id} endpoint."""

    def test_get_existing_node(self, client):
        """Should return a node when it exists."""
        # First get a node ID from the list
        list_response = client.get("/api/graph/nodes?limit=1")
        nodes = list_response.json()

        if len(nodes) > 0:
            node_id = nodes[0]["id"]
            response = client.get(f"/api/graph/nodes/{node_id}")
            assert response.status_code == 200

            data = response.json()
            assert data["id"] == node_id

    def test_get_nonexistent_node_returns_404(self, client):
        """Should return 404 for non-existent node."""
        response = client.get("/api/graph/nodes/nonexistent-node-id-12345")
        assert response.status_code == 404


class TestAuthorityChain:
    """Integration tests for /api/graph/authority-chain endpoint."""

    def test_authority_chain_returns_expected_structure(self, client):
        """Should return regulation, chain, depth, and explanation."""
        # First get a regulation node
        list_response = client.get("/api/graph/nodes?node_type=Regulation&limit=1")
        nodes = list_response.json()

        if len(nodes) > 0:
            node_id = nodes[0]["id"]
            response = client.get(f"/api/graph/authority-chain/{node_id}")
            assert response.status_code == 200

            data = response.json()
            assert "regulation" in data
            assert "authority_chain" in data
            assert "depth" in data
            assert "explanation" in data

    def test_authority_chain_nonexistent_node_returns_404(self, client):
        """Should return 404 for non-existent node."""
        response = client.get("/api/graph/authority-chain/nonexistent-id")
        assert response.status_code == 404


class TestNodeDetails:
    """Integration tests for /api/graph/nodes/{node_id}/details endpoint."""

    def test_node_details_returns_full_info(self, client):
        """Should return detailed node info including relationships."""
        # First get a node ID
        list_response = client.get("/api/graph/nodes?limit=1")
        nodes = list_response.json()

        if len(nodes) > 0:
            node_id = nodes[0]["id"]
            response = client.get(f"/api/graph/nodes/{node_id}/details")
            assert response.status_code == 200

            data = response.json()
            assert "id" in data
            assert "title" in data
            assert "type" in data
            assert "relationships" in data
            assert isinstance(data["relationships"], list)
