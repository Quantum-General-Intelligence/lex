# Vulcan Deployment Guide

Quick options for sharing with the team.

## Option 1: Railway (Easiest - ~5 min)

Railway offers a generous free tier and simple GitHub deployment.

1. Push code to GitHub (if not already)
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway will auto-detect the services

**Add services manually:**
- PostgreSQL (from Railway's database templates)
- Redis (from templates)

**For Neo4j and ChromaDB**, use external services:
- Neo4j Aura: https://neo4j.com/cloud/aura-free/ (free tier)
- ChromaDB: Run locally or use a VPS

**Environment Variables to set:**
```
DATABASE_URL=<from Railway PostgreSQL>
NEO4J_URI=<from Neo4j Aura>
NEO4J_USER=neo4j
NEO4J_PASSWORD=<your password>
OPENAI_API_KEY=<your key>
NEXT_PUBLIC_API_URL=<backend URL from Railway>
```

## Option 2: Single VPS with Docker (Most Complete)

Best for a full demo with all features working.

### Requirements
- VPS with 4GB+ RAM (DigitalOcean, Linode, Vultr ~$20/mo)
- Docker and Docker Compose installed

### Deploy

1. SSH into your server
2. Clone the repo:
```bash
git clone https://github.com/yourusername/lex.git
cd lex
```

3. Create `.env` file:
```bash
cat > .env << EOF
OPENAI_API_KEY=your-key-here
LLM_PROVIDER=openai
EOF
```

4. Start everything:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. Seed the database:
```bash
docker-compose exec backend python -m scripts.seed_data
```

6. Access at `http://your-server-ip`

### With a Domain (optional)

1. Point your domain to the server IP
2. Install Certbot for SSL:
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

## Option 3: Render (Good free tier)

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. New → Blueprint → Select repo
4. Render will use `render.yaml` to set up services

**Note:** Render's free tier spins down after inactivity, so first load may be slow.

## Option 4: Local Demo with ngrok

For a quick demo without deploying:

1. Start locally:
```bash
docker-compose up -d
cd frontend && npm run dev
```

2. Expose with ngrok:
```bash
ngrok http 3000
```

3. Share the ngrok URL (expires after 2 hours on free plan)

---

## Quick Sanity Check

After deployment, verify these endpoints work:

- Frontend: `https://your-url/` - Should show dashboard
- Backend health: `https://your-url/api/health` - Should return `{"status": "healthy"}`
- Query: `https://your-url/query` - Try "What is FERPA?"

## Sharing with Team

Once deployed, share:
1. The URL
2. A quick walkthrough:
   - **Dashboard** - Overview of the system
   - **Justinian** - Ask questions about regulations (try "What is HIPAA?")
   - **Minerva** - Explore the knowledge graph, click nodes to see details
   - **Solon** - Browse the legal document library
   - **Ingest** - Upload documents (PDF, DOCX, TXT, HTML)
   - **Compliance** - Check document compliance

## Need Help?

Common issues:
- **Backend not connecting to DB**: Check DATABASE_URL env var
- **Graph not loading**: Neo4j might need a minute to start
- **LLM not responding**: Check OPENAI_API_KEY is set
- **Upload failing**: Check ChromaDB is running
