"""Tests for graph API request validation."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestExploreEndpointValidation:
    """Test /api/graph/explore parameter validation."""

    def test_explore_valid_params(self, client):
        """Valid parameters should work."""
        response = client.get("/api/graph/explore?limit=50&depth=2")
        assert response.status_code == 200

    def test_explore_limit_too_high(self, client):
        """Limit > 500 should be rejected."""
        response = client.get("/api/graph/explore?limit=1000")
        assert response.status_code == 422
        assert "limit" in response.text.lower()

    def test_explore_limit_zero(self, client):
        """Limit = 0 should be rejected."""
        response = client.get("/api/graph/explore?limit=0")
        assert response.status_code == 422

    def test_explore_limit_negative(self, client):
        """Negative limit should be rejected."""
        response = client.get("/api/graph/explore?limit=-1")
        assert response.status_code == 422

    def test_explore_depth_too_high(self, client):
        """Depth > 4 should be rejected."""
        response = client.get("/api/graph/explore?depth=10")
        assert response.status_code == 422
        assert "depth" in response.text.lower()

    def test_explore_depth_zero(self, client):
        """Depth = 0 should be rejected."""
        response = client.get("/api/graph/explore?depth=0")
        assert response.status_code == 422


class TestListNodesValidation:
    """Test /api/graph/nodes parameter validation."""

    def test_list_nodes_valid_params(self, client):
        """Valid parameters should work."""
        response = client.get("/api/graph/nodes?limit=50&skip=0")
        assert response.status_code == 200

    def test_list_nodes_limit_too_high(self, client):
        """Limit > 200 should be rejected."""
        response = client.get("/api/graph/nodes?limit=500")
        assert response.status_code == 422

    def test_list_nodes_skip_negative(self, client):
        """Negative skip should be rejected."""
        response = client.get("/api/graph/nodes?skip=-1")
        assert response.status_code == 422

    def test_list_nodes_search_too_long(self, client):
        """Search string > 200 chars should be rejected."""
        long_search = "a" * 250
        response = client.get(f"/api/graph/nodes?search={long_search}")
        assert response.status_code == 422


class TestAuthorityChainValidation:
    """Test /api/graph/authority-chain parameter validation."""

    def test_authority_chain_max_depth_too_high(self, client):
        """max_depth > 10 should be rejected."""
        response = client.get("/api/graph/authority-chain/test-id?max_depth=20")
        assert response.status_code == 422

    def test_authority_chain_max_depth_zero(self, client):
        """max_depth = 0 should be rejected."""
        response = client.get("/api/graph/authority-chain/test-id?max_depth=0")
        assert response.status_code == 422
