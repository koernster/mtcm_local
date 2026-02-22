import os
import logging
import redis
import functools
import requests
from typing import List, Dict
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

# ===================== Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== Doppler Integration
# Doppler CLI mounts secrets to /run/secrets/ when using --mount flag
SECRETS_PATH = "/run/secrets"

def get_secret(key: str, default=None):
    """
    Fetch secret from Doppler-mounted file or fall back to environment variable.
    Doppler mounts secrets as individual files in /run/secrets/
    """
    secret_file = os.path.join(SECRETS_PATH, key)
    if os.path.exists(secret_file):
        with open(secret_file, 'r') as f:
            value = f.read().strip()
            logger.info(f"Loaded {key} from Doppler secrets")
            return value
    
    # Fall back to environment variable for local development
    value = os.getenv(key, default)
    if value:
        logger.info(f"Loaded {key} from environment variable")
    return value

# ===================== Environment
HUBSPOT_API_KEY = get_secret("HUBSPOT_API_KEY")
HUBSPOT_CONTACTS_URL = get_secret("HUBSPOT_CONTACTS_URL", "https://api.hubapi.com/crm/v3/objects/contacts")
REDIS_PASSWORD = get_secret("REDIS_PASSWORD")
REDIS_CONTAINER_NAME = get_secret("REDIS_CONTAINER_NAME", "redis")
REDIS_URL = get_secret(
    "REDIS_URL",
    f"redis://default:{REDIS_PASSWORD}@{REDIS_CONTAINER_NAME}:6379"
)

API_AUTH_TOKEN = get_secret("API_AUTH_TOKEN")
DISABLE_TOKEN_VALIDATION = get_secret("DISABLE_TOKEN_VALIDATION", "false").lower() == "true"

# ===================== Sanity Checks
if not HUBSPOT_API_KEY:
    logger.error("HUBSPOT_API_KEY is not set")
    raise ValueError("HUBSPOT_API_KEY is required")

logger.info(f"Configuration loaded - Redis: {REDIS_CONTAINER_NAME}, HubSpot URL: {HUBSPOT_CONTACTS_URL}")

# ===================== Redis
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# ===================== App Setup
app = FastAPI(root_path="/api")
security = HTTPBearer()

origins = ["*"]  # Temporary: Allow all origins to test Cloudflare Worker issue

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for public APIs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log CORS configuration for debugging
logger.info(f"CORS origins configured: {origins}")
print(f"🔧 CORS DEBUG: Origins configured: {origins}")

# Add request logging middleware for debugging CORS issues
@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    logger.info(f"Request from origin: {origin}")
    print(f"🌐 CORS DEBUG: Request from origin: {origin}")
    response = await call_next(request)
    return response




# ===================== Auth
async def verify_api_token(token: HTTPAuthorizationCredentials = Depends(security)):
    if DISABLE_TOKEN_VALIDATION:
        logger.warning("API token validation is disabled")
        return {"authenticated": True, "validation": "disabled"}
    if not API_AUTH_TOKEN:
        logger.error("API_AUTH_TOKEN is not configured")
        raise HTTPException(status_code=500, detail="Authentication not configured")

    if token.credentials != API_AUTH_TOKEN:
        logger.warning("Invalid API token provided")
        raise HTTPException(status_code=401, detail="Invalid API token")

    logger.info("API token validated successfully")
    return {"authenticated": True}

# ===================== Health (Public)
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/contacts")
async def contacts(
    user=Depends(verify_api_token),
    first_name: str = Query(None),
    last_name: str = Query(None),
    email: str = Query(None)
):
    query_params = {}
    if first_name:
        query_params["properties.firstname"] = first_name
    if last_name:
        query_params["properties.lastname"] = last_name
    if email:
        query_params["properties.email"] = email

    return get_hubspot_contacts(query_params)

@app.get("/contacts/search")
async def search_contacts(query: str = Query(..., min_length=3), user=Depends(verify_api_token)):
    cached_contacts = redis_client.get("hubspot_contacts")
    if cached_contacts:
        contacts = eval(cached_contacts)
    else:
        contacts = get_cached_contacts()
        redis_client.setex("hubspot_contacts", 3600, str(contacts))

    filtered = [
        c for c in contacts if query.lower() in (c["properties"].get("firstname") or "").lower()
        or query.lower() in (c["properties"].get("lastname") or "").lower()
        or query.lower() in (c["properties"].get("email") or "").lower()
    ]
    return {"total": len(filtered), "results": filtered}

@app.post("/contacts/refresh")
async def refresh_contacts_cache(user=Depends(verify_api_token)):
    get_cached_contacts.cache_clear()
    redis_client.delete("hubspot_contacts")
    contacts = get_cached_contacts()
    redis_client.setex("hubspot_contacts", 3600, str(contacts))
    return {"message": "Cache refreshed"}

@app.get("/contacts/{contact_id}")
async def get_contact_by_id(contact_id: str, user=Depends(verify_api_token)):
    url = f"{HUBSPOT_CONTACTS_URL}/{contact_id}"
    headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    return response.json()

# ===================== Helpers
@functools.lru_cache(maxsize=1)
def get_cached_contacts() -> List[Dict]:
    logging.info("Fetching contacts from HubSpot...")
    url = HUBSPOT_CONTACTS_URL
    headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }
    contacts = []
    after = None
    while True:
        params = {"limit": 100}
        if after:
            params["after"] = after
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            logging.error(f"HubSpot error: {response.status_code} - {response.text}")
            return []
        data = response.json()
        contacts.extend(data.get("results", []))
        after = data.get("paging", {}).get("next", {}).get("after")
        if not after:
            break
    logging.info(f"Cached {len(contacts)} contacts")
    return contacts

def get_hubspot_contacts(query_params: Dict[str, str]) -> List[Dict]:
    logging.info("Querying HubSpot contacts...")
    url = HUBSPOT_CONTACTS_URL
    headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }
    logging.info(f"Request URL: {url}")
    logging.info(f"Headers: {headers}")
    logging.info(f"Query Params: {query_params}")

    try:
        response = requests.get(url, headers=headers, params=query_params)
        logging.info(f"HubSpot response status: {response.status_code}")
        if response.status_code != 200:
            logging.error(f"HubSpot API error: {response.text}")
            raise HTTPException(status_code=502, detail="Error fetching contacts from HubSpot")

        return response.json().get("results", [])

    except requests.exceptions.RequestException as e:
        logging.exception("Request to HubSpot API failed")
        raise HTTPException(status_code=502, detail="HubSpot request failed")

# ===================== Entrypoint
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8083)))