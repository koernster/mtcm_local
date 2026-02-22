from fastapi import FastAPI
from .api.routes import router

app = FastAPI(root_path="/api")
#security = HTTPBearer()
#jwks_cache = {}

app.include_router(router)
