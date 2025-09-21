from typing import List
# Support both package and script execution imports
try:
    from ..config import EMBEDDING_MODEL, CHUNK_SIZE, PROJECT_ID, LOCATION
except ImportError:
    from config import EMBEDDING_MODEL, CHUNK_SIZE, PROJECT_ID, LOCATION
import time
import vertexai
from vertexai.language_models import TextEmbeddingModel

def chunk_text(text: str, chunk_size: int = 0) -> List[str]:
    """Split long text into smaller pieces (chunks) for better search and processing."""
    if chunk_size == 0:
        chunk_size = CHUNK_SIZE
    
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def get_embeddings(chunks: List[str]) -> List[List[float]]:
    """Turn text chunks into numeric vectors (embeddings) using Google Vertex AI.

    We send data in batches (max 250 each) and retry automatically on temporary errors.
    """
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    # Filter out empty strings to avoid unnecessary calls
    inputs = [c if c is not None else "" for c in chunks]

    MAX_PER_REQUEST = 250
    all_results = []
    for i in range(0, len(inputs), MAX_PER_REQUEST):
        batch = inputs[i : i + MAX_PER_REQUEST]
        # Retry loop with exponential backoff for transient errors
        attempts = 0
        while True:
            try:
                batch_results = model.get_embeddings(texts=batch)  # type: ignore[arg-type]
                all_results.extend(batch_results)
                break
            except Exception as e:
                attempts += 1
                if attempts >= 5:
                    raise
                # Backoff: 1s, 2s, 4s, 8s
                sleep_s = min(8, 2 ** (attempts - 1))
                # Optional: log the transient error
                print(f"Embedding batch failed (attempt {attempts}) due to {e}. Retrying in {sleep_s}s...")
                time.sleep(sleep_s)

    return [r.values for r in all_results]

def get_embedding_for_query(text: str) -> List[float]:
    """Turn a single question into a numeric vector so we can find matching text."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    result = model.get_embeddings(texts=[text or ""])  # type: ignore[arg-type]
    return result[0].values