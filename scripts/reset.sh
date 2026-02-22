#!/bin/bash
set -e

echo "⚠️  This will destroy all local data (database, redis) and rebuild from scratch."
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo "🛑 Stopping all services..."
docker compose down -v

echo "🔨 Rebuilding without cache..."
docker compose build --no-cache

echo "🚀 Starting fresh..."
docker compose up -d

echo "⏳ Waiting for Hasura..."
until curl -sf http://localhost:8080/healthz > /dev/null 2>&1; do
    printf "."
    sleep 2
done
echo ""

# Apply metadata
if command -v hasura >/dev/null 2>&1; then
    echo "📊 Applying Hasura metadata..."
    cd hasura
    hasura metadata apply --admin-secret "$(grep HASURA_ADMIN_SECRET ../.env | cut -d= -f2)"
    cd ..
fi

echo ""
echo "✅ Full reset complete!"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
