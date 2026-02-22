import os
import logging
import redis
import functools
import requests
from typing import List, Dict
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

from excel_provider import ExcelContactProvider

# ===================== Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== Doppler Integration
SECRETS_PATH = "/run/secrets"

def get_secret(key: str, default=None):
    """
    Fetch secret from Doppler-mounted file or fall back to environment variable.
    """
    secret_file = os.path.join(SECRETS_PATH, key)
    if os.path.exists(secret_file):
        with open(secret_file, 'r') as f:
            value = f.read().strip()
            logger.info(f"Loaded {key} from Doppler secrets")
            return value
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

# ===================== Data Source Selection
# Excel file path — mounted into the container or next to the script
EXCEL_CONTACTS_PATH = get_secret(
    "EXCEL_CONTACTS_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "contacts.xlsx")
)

USE_HUBSPOT_API = bool(HUBSPOT_API_KEY)
excel_provider: ExcelContactProvider | None = None

if USE_HUBSPOT_API:
    logger.info("✅ HUBSPOT_API_KEY set — using live HubSpot API")
else:
    logger.warning("⚠️  HUBSPOT_API_KEY not set — falling back to Excel file provider")
    excel_provider = ExcelContactProvider(EXCEL_CONTACTS_PATH)
    count = excel_provider.load()
    if count == 0:
        logger.error(f"Excel provider loaded 0 contacts from {EXCEL_CONTACTS_PATH}")
    else:
        logger.info(f"Excel provider ready with {count} contacts")

logger.info(f"Configuration loaded — Redis: {REDIS_CONTAINER_NAME}, Data source: {'HubSpot API' if USE_HUBSPOT_API else 'Excel file'}")

# ===================== Redis
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# ===================== App Setup
app = FastAPI(root_path="/api")
security = HTTPBearer()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    logger.info(f"Request from origin: {origin}")
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
    return {
        "status": "ok",
        "data_source": "hubspot_api" if USE_HUBSPOT_API else "excel_file",
        "excel_contacts": len(excel_provider.contacts) if excel_provider else None,
    }


# ===================== Contacts Endpoints

@app.get("/contacts")
async def contacts(
    user=Depends(verify_api_token),
    first_name: str = Query(None),
    last_name: str = Query(None),
    email: str = Query(None)
):
    if USE_HUBSPOT_API:
        query_params = {}
        if first_name:
            query_params["properties.firstname"] = first_name
        if last_name:
            query_params["properties.lastname"] = last_name
        if email:
            query_params["properties.email"] = email
        return get_hubspot_contacts(query_params)

    # Excel fallback
    results = excel_provider.get_all()
    # Apply optional filters
    if first_name:
        results = [c for c in results if first_name.lower() in (c["properties"].get("firstname") or "").lower()]
    if last_name:
        results = [c for c in results if last_name.lower() in (c["properties"].get("lastname") or "").lower()]
    if email:
        results = [c for c in results if email.lower() in (c["properties"].get("email") or "").lower()]
    return {"total": len(results), "results": results}


@app.get("/contacts/search")
async def search_contacts(query: str = Query(..., min_length=3), user=Depends(verify_api_token)):
    if USE_HUBSPOT_API:
        # Try Redis cache first
        cached_contacts = redis_client.get("hubspot_contacts")
        if cached_contacts:
            all_contacts = eval(cached_contacts)
        else:
            all_contacts = get_cached_contacts()
            redis_client.setex("hubspot_contacts", 3600, str(all_contacts))

        filtered = [
            c for c in all_contacts if query.lower() in (c["properties"].get("firstname") or "").lower()
            or query.lower() in (c["properties"].get("lastname") or "").lower()
            or query.lower() in (c["properties"].get("email") or "").lower()
        ]
        return {"total": len(filtered), "results": filtered}

    # Excel fallback
    filtered = excel_provider.search(query)
    return {"total": len(filtered), "results": filtered}


@app.post("/contacts/refresh")
async def refresh_contacts_cache(user=Depends(verify_api_token)):
    if USE_HUBSPOT_API:
        get_cached_contacts.cache_clear()
        redis_client.delete("hubspot_contacts")
        contacts = get_cached_contacts()
        redis_client.setex("hubspot_contacts", 3600, str(contacts))
        return {"message": "HubSpot cache refreshed", "total": len(contacts)}

    # Excel fallback — reload from disk
    count = excel_provider.reload()
    return {"message": "Excel contacts reloaded from disk", "total": count}


@app.get("/contacts/{contact_id}")
async def get_contact_by_id(contact_id: str, user=Depends(verify_api_token)):
    if USE_HUBSPOT_API:
        url = f"{HUBSPOT_CONTACTS_URL}/{contact_id}"
        headers = {
            "Authorization": f"Bearer {HUBSPOT_API_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers)
        return response.json()

    # Excel fallback
    contact = excel_provider.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail=f"Contact {contact_id} not found")
    return contact


# ===================== Excel Management Endpoints

@app.post("/contacts/upload-excel")
async def upload_contacts_excel(
    file: UploadFile = File(...),
    user=Depends(verify_api_token)
):
    """
    Upload a new Excel file to replace the current contacts data.
    The file must be a .xlsx HubSpot export.
    """
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="File must be .xlsx or .xls")

    # Save uploaded file
    os.makedirs(os.path.dirname(EXCEL_CONTACTS_PATH), exist_ok=True)
    contents = await file.read()
    with open(EXCEL_CONTACTS_PATH, "wb") as f:
        f.write(contents)
    logger.info(f"Uploaded new Excel file: {file.filename} ({len(contents)} bytes)")

    # Reload if we're using Excel provider
    if excel_provider:
        count = excel_provider.reload()
        return {"message": f"Uploaded and loaded {count} contacts", "filename": file.filename}

    return {"message": f"Uploaded {file.filename} — restart with no HUBSPOT_API_KEY to use it"}


@app.get("/contacts/excel/info")
async def excel_info(user=Depends(verify_api_token)):
    """Get info about the current Excel data source."""
    return {
        "active": not USE_HUBSPOT_API,
        "file_path": EXCEL_CONTACTS_PATH,
        "file_exists": os.path.exists(EXCEL_CONTACTS_PATH),
        "contacts_loaded": len(excel_provider.contacts) if excel_provider else 0,
        "data_source": "hubspot_api" if USE_HUBSPOT_API else "excel_file",
    }


# ===================== HubSpot API Helpers (only used when API key present)

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
