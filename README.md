# MTCM Local Development

Self-contained local development environment for the MTCM (Multi-Transaction Case Management) platform. All services run in Docker — no external dependencies except a HubSpot API key.

## Prerequisites

- **Docker Desktop** (with Docker Compose v2)
- **Node.js 18+** (optional, for running frontend outside Docker)
- **Hasura CLI** (optional, for metadata management): `npm install -g hasura-cli`

## Quick Start

```bash
# 1. Clone
git clone https://github.com/koernster/mtcm_local.git
cd mtcm_local

# 2. Create env file
cp .env.example .env
# Edit .env → add your HUBSPOT_API_KEY

# 3. Start everything
chmod +x scripts/*.sh
./scripts/setup.sh

# 4. Open the app
open https://localhost:3000        # Frontend
open http://localhost:8080/console  # Hasura Console
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                           │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐ │
│  │PostgreSQL │  │  Redis   │  │     Hasura GraphQL        │ │
│  │  :5432    │  │  :6379   │  │     :8080                 │ │
│  └─────┬─────┘  └────┬─────┘  └─────────┬─────────────────┘ │
│        │              │                   │                   │
│  ┌─────┴──────┐  ┌───┴──────────┐  ┌────┴───────┐          │
│  │  Flyway    │  │ HubSpot Fn   │  │Backend Jobs│          │
│  │ (migrate)  │  │ :8083        │  │ :8084      │          │
│  └────────────┘  └──────────────┘  └────────────┘          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Excel Upload │  │   DB API     │  │  Frontend    │      │
│  │ :8085        │  │   :8100      │  │  :3000       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | https://localhost:3000 | React 18 SPA |
| Hasura | 8080 | http://localhost:8080/console | GraphQL Engine + Console |
| HubSpot Function | 8083 | http://localhost:8083/api/health | Contact search proxy |
| Backend Jobs | 8084 | http://localhost:8084/api/ping | Scheduled job executor |
| Excel Upload | 8085 | http://localhost:8085/health | Excel file parser |
| DB API | 8100 | http://localhost:8100/health | Database API layer |
| PostgreSQL | 5432 | `psql -h localhost` | Database |
| Redis | 6379 | `redis-cli` | Cache |

## Authentication

Local development **bypasses Keycloak** entirely:

- Frontend uses `REACT_APP_AUTH_BYPASS=true` → MockAuthProvider with a dev user
- Apollo Client sends `x-hasura-admin-secret` header instead of JWT
- HubSpot Function uses `DISABLE_TOKEN_VALIDATION=true`
- Backend Jobs uses internal cron token auth

## Common Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f                    # All services
docker compose logs -f frontend           # Single service

# Rebuild a single service after code changes
docker compose build frontend && docker compose up -d frontend

# Stop everything (keeps data)
docker compose down

# Full reset (destroys data)
./scripts/reset.sh

# Apply Hasura metadata
cd hasura && hasura metadata apply --admin-secret myadminsecretkey

# Connect to database
psql -h localhost -p 5432 -U postgres -d mtcm
```

## Project Structure

```
mtcm_local/
├── docker-compose.yml          # All service orchestration
├── .env                        # Local secrets (git-ignored)
├── .env.example                # Template
│
├── services/
│   ├── frontend/               # React 18 SPA (TypeScript)
│   ├── hubspot-function/       # FastAPI — HubSpot contacts proxy
│   ├── backendjobs/            # FastAPI — Scheduled job executors
│   ├── excelupload/            # FastAPI — Excel file parser
│   └── db-api/                 # FastAPI — Database API layer
│
├── database/
│   └── flyway/sql/             # V1–V67 migration scripts
│
├── hasura/
│   ├── config.yaml             # Hasura CLI config
│   └── metadata/               # Tracked tables, permissions, relationships
│
└── scripts/
    ├── setup.sh                # First-time setup
    └── reset.sh                # Full reset
```

## Frontend Development

The frontend runs with hot-reload via volume mounts. Edit files in `services/frontend/src/` and changes appear immediately.

To run outside Docker (faster hot-reload):
```bash
cd services/frontend
npm install
npm start
```

## Differences from Production

| Aspect | Production | Local |
|--------|-----------|-------|
| Auth | Keycloak JWT | Bypassed (mock) |
| Reverse Proxy | Caddy + Traefik | Direct port access |
| Secrets | Self-signed certs |
| Database | persistent | Docker volume |
| Excel Upload | GCF functions-framework | FastAPI wrapper |
