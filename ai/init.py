import faiss
import os
import time

from fastapi import FastAPI
from contextlib import asynccontextmanager

# Utility modules are imported by processor_app where needed; keep init lean

from typing import Dict, Any

# A dictionary to hold our application state, including the vector store
app_state: Dict[str, Any] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initializes the vector store and normal embeddings on startup.
    """
    print("AI Backend starting up...")

    # Record startup time for health checks
    app_state["startup_time"] = time.time()

    # 1. Initialize app state. Vector store will be created lazily on first document.
    app_state["faiss_index"] = None
    app_state["chunks"] = []
    
     # Placeholder for a bucket name for audio files
    app_state["bucket_name"] = os.getenv("GCS_BUCKET_NAME", "your-gcs-bucket-name")
    
    print("AI Backend is ready to process documents!")
    yield
    print("AI Backend is shutting down...")

# Main FastAPI application instance
app = FastAPI(title="LegalSense AI Backend", lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "LegalSense AI Backend is running"}

@app.get("/healthz")
def healthz():
    """Lightweight health check with no external calls."""
    now = time.time()
    startup = app_state.get("startup_time", now)
    uptime_seconds = round(max(0.0, now - startup), 2)

    faiss_ok = app_state.get("faiss_index") is not None
    doc_chunks = app_state.get("chunks", []) or []

    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    creds_set = bool(creds_path)
    creds_exists = bool(creds_path and os.path.isfile(creds_path))

    status = "ok" if faiss_ok else "degraded"

    return {
        "status": status,
        "uptime_seconds": uptime_seconds,
        "vector_store": {
            "faiss_index_initialized": faiss_ok,
            "document_chunks_count": len(doc_chunks),
        },
        "env": {
            "GOOGLE_APPLICATION_CREDENTIALS_set": creds_set,
            "GOOGLE_APPLICATION_CREDENTIALS_exists": creds_exists,
        },
    }

# Import API endpoints so they attach to this app instance
# Place after `app` is defined to avoid circular import issues
from . import processor_app  # noqa: F401