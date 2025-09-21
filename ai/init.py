"""
App startup and health checks.

What this does in simple terms:
- Prepares the AI system when the app starts (loads standard/core clauses and turns them into vectors).
- Keeps a small in-memory store for text pieces and their vectors so we can search quickly.
- Exposes a /healthz endpoint to show if the app is ready.
"""
import faiss
import os
import time
try:
    from .normal_data import CORE_CLAUSES  # package import
    from .utils.embedding_utils import get_embeddings
except Exception:
    from normal_data import CORE_CLAUSES  # local import when run as module from ai/
    from utils.embedding_utils import get_embeddings

from fastapi import FastAPI
from contextlib import asynccontextmanager

# Utility modules are imported by processor_app where needed; keep init lean

from typing import Dict, Any

# A dictionary to hold our application state, including the vector store
app_state: Dict[str, Any] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once when the server starts, then once again on shutdown.
    Here we compute embeddings (numeric vectors) for the known core clauses
    and set up a shared state dictionary (app_state) that other endpoints use.
    """
    print("AI Backend starting up...")
    # 1. Generate and store embeddings for the core clauses
    print(f"Generating embeddings for {len(CORE_CLAUSES)} core clauses...")
    try:
        if CORE_CLAUSES:
            # Get the text of all core clauses
            core_clause_texts = list(CORE_CLAUSES.values())
            # Get the embeddings for all of them in a single API call
            embeddings = get_embeddings(core_clause_texts)
            # Create a dictionary that maps each clause name to its corresponding embedding
            app_state["core_embeddings"] = {name: emb for name, emb in zip(CORE_CLAUSES.keys(), embeddings)}
            print("Core clause embeddings are ready!")
        else:
            app_state["core_embeddings"] = {}
            print("No core clauses found. Skipping core embeddings generation.")
    except Exception as e:
        # Start in degraded mode if credentials/APIs are not configured yet
        app_state["core_embeddings"] = {}
        print(f"Warning: Failed to generate core embeddings at startup: {e}")
    
    # Record startup time for health checks
    app_state["startup_time"] = time.time()

    # Initialize app state. Vector store is created later when the first document is processed.
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

    # If we haven't built the index yet, we report "degraded" (still fine to accept uploads)
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
try:
    from . import processor_app  # noqa: F401
except Exception:
    import processor_app  # type: ignore  # noqa: F401