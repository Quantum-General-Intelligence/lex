.PHONY: help up down logs seed dev-backend dev-frontend clean

help:
	@echo "Lex - Legal Cartography Platform"
	@echo ""
	@echo "Commands:"
	@echo "  make up           - Start all services with Docker Compose"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make seed         - Seed the database with demo data"
	@echo "  make dev-backend  - Run backend in development mode (local)"
	@echo "  make dev-frontend - Run frontend in development mode (local)"
	@echo "  make clean        - Remove all containers and volumes"

up:
	docker-compose up -d
	@echo ""
	@echo "Services starting..."
	@echo "  Frontend:   http://localhost:3000"
	@echo "  Backend:    http://localhost:8080"
	@echo "  API Docs:   http://localhost:8080/docs"
	@echo "  Neo4j:      http://localhost:7474"

down:
	docker-compose down

logs:
	docker-compose logs -f

seed:
	@echo "Waiting for services to be ready..."
	sleep 5
	cd backend && python3 -m scripts.seed_data

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8080

dev-frontend:
	cd frontend && npm run dev

clean:
	docker-compose down -v --remove-orphans
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -rf frontend/.next frontend/node_modules

# Build commands
build:
	docker-compose build

build-backend:
	docker-compose build backend

build-frontend:
	docker-compose build frontend

# Database commands
db-shell:
	docker-compose exec postgres psql -U lex -d lex

neo4j-shell:
	docker-compose exec neo4j cypher-shell -u neo4j -p lex_graph_password

# Testing
test-backend:
	cd backend && python3 -m pytest

# Ollama model setup
ollama-pull:
	docker-compose exec ollama ollama pull llama3.1
