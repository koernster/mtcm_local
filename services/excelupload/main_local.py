"""
Local FastAPI wrapper for Excel extractor.
Replaces functions-framework (GCP) for local Docker development.
"""
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from excel_extractor import process_excel

app = FastAPI(title="MTCM Excel Extractor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract")
async def extract_excel(file: UploadFile = File(...)):
    """Extract trade data from Excel file."""
    if not file.filename or not file.filename.endswith(('.xlsx', '.xlsm')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .xlsx and .xlsm accepted.")
    file_bytes = await file.read()
    try:
        result = process_excel(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


# Also support the GCF-style endpoint path for compatibility
@app.post("/extract-excel-gcf")
async def extract_excel_gcf(file: UploadFile = File(...)):
    """GCF-compatible endpoint (same as /extract)."""
    return await extract_excel(file)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8085")))
