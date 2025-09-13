from typing import List
from ..config import EMBEDDING_MODEL, CHUNK_SIZE, PROJECT_ID, LOCATION
import vertexai
from vertexai.language_models import TextEmbeddingModel

def chunk_text(text: str, chunk_size: int = 0) -> List[str]:
    """Split text into chunks of specified size"""
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
    """Generate embeddings via Vertex AI SDK using ADC (service account)."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    # Filter out empty strings to avoid unnecessary calls
    inputs = [c if c is not None else "" for c in chunks]
    results = model.get_embeddings(texts=inputs)  # type: ignore[arg-type]
    return [r.values for r in results]

def get_embedding_for_query(text: str) -> List[float]:
    """Generate a single embedding via Vertex AI SDK using ADC."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    result = model.get_embeddings(texts=[text or ""])  # type: ignore[arg-type]
    return result[0].values