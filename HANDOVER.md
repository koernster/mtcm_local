# MTCM Local Development — Handover Notes

**Date:** 22 February 2026  
**Status:** Working — Product Setup form loads with live data

---

## What Was Done

### 1. Monorepo Assembly
All MTCM services consolidated from separate repos into a single `docker-compose.yml` orchestration at `/Users/steff/DEV/mtcm_local/`. Nine Docker containers run locally:

| Container | Status | Port | Notes |
|-----------|--------|------|-------|
| `mtcm-db-local` | ✅ Healthy | 5432 | PostgreSQL with 69 Flyway migrations |
| `mtcm-hasura-local` | ✅ Healthy | 8080 | GraphQL engine + console |
| `mtcm-frontend-local` | ✅ Running | 3000 | React 18 dev server (**HTTP**, not HTTPS) |
| `mtcm-hubspot-function-local` | ⚠️ Unhealthy | 8083 | Expected — no HubSpot API key |
| `mtcm-backendjobs-local` | ✅ Healthy | 8084 | Scheduled jobs |
| `mtcm-excelupload-local` | ✅ Healthy | 8085 | Excel parser |
| `mtcm-db-api-local` | ✅ Running | 8100 | Database API |
| `mtcm-redis-local` | ✅ Healthy | 6379 | Cache |
| `mtcm-flyway` | ✅ Exited | — | Runs once on startup |

### 2. Authentication Bypass (No Keycloak)
**File:** `services/frontend/src/context/AuthContext.tsx`

There is no Keycloak container. AuthContext does a pre-flight check against the Keycloak well-known endpoint. When it fails (404 from Hasura on port 8080), it activates a mock auth mode providing a `Local Developer` identity with SuperAdmin groups. The Apollo GraphQL client detects the `local-dev-token` and sends `x-hasura-admin-secret` instead of a JWT Bearer token.

**Groups provided:** `Operations, SuperAdmin, operations, default-roles-mtcm-test, admin, user`

### 3. HTTPS Disabled
**File:** `docker-compose.yml` → `command: ["npm", "run", "start:local"]`  
**File:** `services/frontend/package.json` → added `"start:local": "react-scripts start"`

The production start script uses `HTTPS=true` with self-signed certs. This caused mixed-content blocking (HTTPS page → HTTP APIs). Local dev now runs plain HTTP on port 3000.

### 4. HubSpot Contact Fallback
**File:** `services/hubspot-function/providers/csv_provider.py`

When no `HUBSPOT_API_KEY` is set, the contact search endpoint serves from a CSV file (`data/contacts.csv`) containing 6,379 real exported HubSpot contacts. The service reports unhealthy without an API key — this is expected.

### 5. Database Schema Patches
Two migrations were added to fill gaps between the frontend's GraphQL queries and the local database:

| Migration | What it adds | Why |
|-----------|-------------|-----|
| `V68__add_companyid_to_spvs.sql` | `spvs.companyid` (UUID FK → companies) | `getCaseById` query requests `spv { companyid }` |
| `V69__add_payment_detail_fields.sql` | `paymentdetails.bankname`, `.address`, `.beneficiary`, `.bicintermediary` | `getCaseById` and `getSpvs` queries request these fields |

**⚠️ These were applied directly to the running DB and via Hasura `reload_metadata`, but Flyway has NOT run them.** On a fresh `docker compose up`, Flyway should pick them up automatically since the SQL files are in `database/flyway/sql/`.

---

## Known Issues & Gaps

### Schema Mismatches (Frontend vs Database)
The frontend dev branch expects database columns/functions that don't exist locally. V68 and V69 fix the two blocking ones, but **more gaps likely exist** in less-tested flows:

- **`trades_history_by_days`** — DB function exists but is not tracked as a Hasura query root field. Affects: Coupon Payment loan balance overview.
- Other queries (trades, events, notifications, coupon interest) have not been fully tested against the local schema.

**Recommendation:** Systematically test each page/flow and add missing columns or Hasura tracking as needed. The pattern is always the same: intercept the GraphQL response body (HTTP 200 with `errors` array), add the missing column via `ALTER TABLE`, then `reload_metadata` in Hasura.

### Hasura Metadata
The local Hasura metadata was exported from the dev environment and applied via `tables.yaml` with 44 tracked tables. However:
- Some Hasura functions may not be tracked (e.g. `trades_history_by_days`)
- Relationships were bulk-configured but edge cases may be missing
- No role-based permissions are configured (everything uses admin-secret)

### Uncommitted Changes
There are **45 modified/untracked files** that need to be committed:
- Auth bypass (`AuthContext.tsx`, `client/index.ts`)
- HTTP mode (`docker-compose.yml`, `package.json`)
- Schema migrations (`V68`, `V69`)
- Frontend bug fixes from dev branch (BasicProductInfo imports, etc.)
- CSV provider for HubSpot contacts

### Frontend Dev Branch Delta
The `services/frontend/` code comes from the `dev` branch of `koernster/Frontend`. Many files were already modified compared to the original monorepo commit — these are **not our changes** but represent features/fixes that existed in the dev branch. The `git diff` mixes our local-dev patches with these pre-existing changes.

Modified frontend files include GraphQL queries/mutations for SPV, cases, coupon payments, company, and several UI components (DynamicForm, SPVFormModal, print components, etc.).

### No Doppler / Secrets Management
The README references `doppler setup --project paams-edge-server --config dev` but Doppler is not configured locally. All secrets are hardcoded in `.env` and `.env.example`. This is fine for local dev but means:
- No secret rotation
- Admin secret is `myadminsecretkey` everywhere
- No connection to the PAAMS edge server infrastructure

### Missing Scripts
`scripts/setup.sh` and `scripts/reset.sh` exist but may need updating to reflect:
- HTTP mode (not HTTPS)
- No Keycloak dependency
- CSV fallback for HubSpot
- Manual schema patches (V68/V69)

---

## How to Test a Fresh Setup

```bash
git clone https://github.com/koernster/mtcm_local.git
cd mtcm_local
cp .env.example .env
docker compose up -d
# Wait ~60s for Flyway migrations + Hasura metadata
open http://localhost:3000
open http://localhost:8080/console
```

If any page shows "Failed to load case data", check the browser DevTools Network tab → look for the GraphQL POST response body → it will contain the exact missing field/table. Fix pattern:

```bash
# 1. Add the column
docker exec mtcm-db-local psql -U postgres -d mtcm -c \
  "ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <col> <type>;"

# 2. Reload Hasura
curl -X POST http://localhost:8080/v1/metadata \
  -H 'x-hasura-admin-secret: myadminsecretkey' \
  -H 'Content-Type: application/json' \
  -d '{"type":"reload_metadata","args":{"reload_sources":true}}'

# 3. Reload the page
```

---

## File Inventory

| Path | Purpose |
|------|---------|
| `docker-compose.yml` | All 9 services orchestrated |
| `.env` / `.env.example` | Local secrets |
| `database/flyway/sql/V1-V69` | Database migrations |
| `hasura/metadata/` | Hasura table tracking, relationships |
| `services/frontend/` | React 18 SPA (dev branch) |
| `services/frontend/src/context/AuthContext.tsx` | Keycloak bypass + mock auth |
| `services/frontend/src/services/api/graphQL/client/index.ts` | Apollo client with admin-secret fallback |
| `services/frontend/package.json` | `start:local` script (no HTTPS) |
| `services/hubspot-function/` | FastAPI HubSpot proxy + CSV fallback |
| `services/backendjobs/` | Scheduled job executor |
| `services/excelupload/` | Excel file parser |
| `services/db-api/` | Database API layer |

---

## Architecture Notes

- **Doppler project:** `paams-edge-server` (referenced in `hasura/README.md`)
- **Production endpoints:** `https://mtcm.app/graphql` (prod), `https://test.mtcm.dev/graphql` (test)
- **Frontend repo:** `koernster/Frontend` (dev branch)
- **Original monorepo:** `koernster/MTCM_R1` (source for services)
- **Local repo:** `koernster/mtcm_local` (this repo)
