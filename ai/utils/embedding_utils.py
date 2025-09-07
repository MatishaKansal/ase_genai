from typing import List
from google.cloud import aiplatform

try:
    from ..config import PROJECT_ID, LOCATION, EMBEDDING_MODEL, CHUNK_SIZE
except ImportError:
    from config import PROJECT_ID, LOCATION, EMBEDDING_MODEL, CHUNK_SIZE

def chunk_text(text: str, chunk_size: int = None) -> List[str]:
    """Split text into chunks of specified size"""
    if chunk_size is None:
        chunk_size = CHUNK_SIZE
    
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def get_embeddings(chunks: List[str]) -> List[List[float]]:
    """Generate embeddings for text chunks using Vertex AI"""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    embed_model = aiplatform.TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    
    embeddings = []
    for chunk in chunks:
        result = embed_model.get_embeddings([chunk])
        embeddings.append(result[0].values)
    
    return embeddings
