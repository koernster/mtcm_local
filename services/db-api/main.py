from fastapi import FastAPI, Request, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import httpx
import os
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(root_path="/api")
security = HTTPBearer()

# Load environment
HASURA_URL = os.getenv("HASURA_URL")

# --- Dummy Auth for Testing ---
async def get_dummy_user():
    return {
        "username": "test_user",
        "roles": ["admin", "operations"],
        "token": "dummy-token"
    }

# --- Health ---
@app.get("/health")
def health():
    return {"status": "ok"}

# --- Dynamic Hasura GraphQL Query ---
class GraphQLQuery(BaseModel):
    query: str
    variables: dict = {}

@app.post("/graphql")
async def graphql_post(payload: GraphQLQuery, user=Depends(get_dummy_user)):
    return await execute_graphql(payload.query, payload.variables, user)

@app.get("/graphql")
async def graphql_get(
    query: str = Query(..., description="GraphQL query string"),
    variables: str = Query("{}", description="Optional JSON string for variables"),
    user=Depends(get_dummy_user)
):
    try:
        parsed_vars = json.loads(variables)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in 'variables'")
    return await execute_graphql(query, parsed_vars, user)

# --- Shared Execution Logic ---
async def execute_graphql(query: str, variables: dict, user: dict):
    headers = {
        "Authorization": f"Bearer {user['token']}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            HASURA_URL,
            headers=headers,
            json={"query": query, "variables": variables}
        )

    result = response.json()
    if "errors" in result:
        raise HTTPException(status_code=500, detail=result["errors"])
    return result.get("data", {})