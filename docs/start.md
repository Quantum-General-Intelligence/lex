docker-compose up

# 1. Start all services (databases + infrastructure)
make up

# 2. Seed the database with demo legal data
make seed

# 3. Run backend (in one terminal)
make dev-backend

# 4. Run frontend (in another terminal)
make dev-frontend


Service	URL
Frontend	http://localhost:3000
Backend API	http://localhost:8080
API Docs (Swagger)	http://localhost:8080/docs
Neo4j Browser	http://localhost:7474
