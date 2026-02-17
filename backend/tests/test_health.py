"""Basic health check tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_health_endpoint(client):
    """Test that health endpoint returns 200."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_health_detailed_endpoint(client):
    """Test detailed health endpoint."""
    response = client.get("/api/health/detailed")
    assert response.status_code == 200
    data = response.json()
    assert "overall" in data
    assert "services" in data
