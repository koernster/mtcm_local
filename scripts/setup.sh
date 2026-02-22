#!/bin/bash
set -e

echo "╔══════════════════════════════════════╗"
echo "║     MTCM Local Setup                 ║"
echo "╚══════════════════════════════════════╝"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required. Install: https://docs.docker.com/get-docker/"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose required."; exit 1; }

# Create .env if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env from template"
    echo "   → Edit .env and add your HUBSPOT_API_KEY before continuing"
    echo "   → Then re-run: ./scripts/setup.sh"
    exit 0
fi

echo "🔨 Building services..."
docker compose build

echo "🚀 Starting all services..."
docker compose up -d

echo "⏳ Waiting for Hasura to be ready..."
until curl -sf http://localhost:8080/healthz > /dev/null 2>&1; do
    printf "."
    sleep 2
done
echo ""
echo "✅ Hasura is ready!"

# Apply metadata if hasura CLI is installed
if command -v hasura >/dev/null 2>&1; then
    echo "📊 Applying Hasura metadata..."
    cd hasura
    hasura metadata apply --admin-secret "$(grep HASURA_ADMIN_SECRET ../.env | cut -d= -f2)"
    cd ..
    echo "✅ Metadata applied!"
else
    echo ""
    echo "⚠️  Hasura CLI not found."
    echo "   Install: npm install -g hasura-cli"
    echo "   Then run: cd hasura && hasura metadata apply --admin-secret myadminsecretkey"
fi

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     All services running!            ║"
echo "╚══════════════════════════════════════╝"
echo ""
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 Frontend:       https://localhost:3000"
echo "📊 Hasura Console:  http://localhost:8080/console"
echo "🔗 HubSpot API:     http://localhost:8083/api/health"
echo "📋 Backend Jobs:    http://localhost:8084/api/ping"
echo "📄 Excel Upload:    http://localhost:8085/health"
echo "🗄️  DB API:          http://localhost:8100/health"
echo ""
