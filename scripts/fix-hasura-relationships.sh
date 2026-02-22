#!/bin/bash
# Fix Hasura relationship names to match frontend GraphQL queries
# The auto-detected relationship names from FK constraints don't match
# what the frontend code expects.

HASURA_URL="http://localhost:8080/v1/metadata"
ADMIN_SECRET="myadminsecretkey"

call_hasura() {
  local payload="$1"
  local desc="$2"
  result=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$HASURA_URL" \
    -H "Content-Type: application/json" \
    -H "x-hasura-admin-secret: $ADMIN_SECRET" \
    -d "$payload")
  if [ "$result" = "200" ]; then
    echo "  ✅ $desc"
  else
    # Get the actual error
    error=$(curl -s \
      -X POST "$HASURA_URL" \
      -H "Content-Type: application/json" \
      -H "x-hasura-admin-secret: $ADMIN_SECRET" \
      -d "$payload")
    echo "  ❌ $desc (HTTP $result): $error"
  fi
}

echo "=== Fixing Hasura Relationship Names ==="
echo ""
echo "--- Renaming object relationships on 'cases' table ---"

# 1. prodtype → producttype
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "prodtype",
    "new_name": "producttype"
  }
}' "prodtype → producttype"

# 2. investtype → investmenttype
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "investtype",
    "new_name": "investmenttype"
  }
}' "investtype → investmenttype"

# 3. coponfreq → coponfrequency
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "coponfreq",
    "new_name": "coponfrequency"
  }
}' "coponfreq → coponfrequency"

# 4. coponpaymentschedule → coponpaymentscheduletype
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "coponpaymentschedule",
    "new_name": "coponpaymentscheduletype"
  }
}' "coponpaymentschedule → coponpaymentscheduletype"

# 5. agenttype → payagenttype
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "agenttype",
    "new_name": "payagenttype"
  }
}' "agenttype → payagenttype"

# 6. custodians → custodianByCustodian
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "custodians",
    "new_name": "custodianByCustodian"
  }
}' "custodians → custodianByCustodian"

# 7. underlyingcompany → companyByUnderlyingcompanyid
call_hasura '{
  "type": "pg_rename_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "underlyingcompany",
    "new_name": "companyByUnderlyingcompanyid"
  }
}' "underlyingcompany → companyByUnderlyingcompanyid"

echo ""
echo "--- Adding missing array relationships on 'cases' table ---"

# 8. casefee (casefees → cases via caseid)
call_hasura '{
  "type": "pg_create_array_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "casefee",
    "using": {
      "foreign_key_constraint_on": {
        "column": "caseid",
        "table": {"name": "casefees", "schema": "public"}
      }
    }
  }
}' "Add casefee relationship (casefees.caseid)"

# 9. casecost (casecosts → cases via caseid)
call_hasura '{
  "type": "pg_create_array_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "casecost",
    "using": {
      "foreign_key_constraint_on": {
        "column": "caseid",
        "table": {"name": "casecosts", "schema": "public"}
      }
    }
  }
}' "Add casecost relationship (casecosts.caseid)"

# 10. casesubscriptiondata (casesubscriptiondata → cases via caseid)
call_hasura '{
  "type": "pg_create_array_relationship",
  "args": {
    "source": "default",
    "table": {"name": "cases", "schema": "public"},
    "name": "casesubscriptiondata",
    "using": {
      "foreign_key_constraint_on": {
        "column": "caseid",
        "table": {"name": "casesubscriptiondata", "schema": "public"}
      }
    }
  }
}' "Add casesubscriptiondata relationship (casesubscriptiondata.caseid)"

echo ""
echo "--- Checking for other missing relationships ---"

# 11. Check if spvs table needs address relationship
call_hasura '{
  "type": "pg_create_object_relationship",
  "args": {
    "source": "default",
    "table": {"name": "spvs", "schema": "public"},
    "name": "address",
    "using": {
      "foreign_key_constraint_on": "addressid"
    }
  }
}' "Add spvs.address relationship"

echo ""
echo "=== Done! Reload the frontend to test. ==="
