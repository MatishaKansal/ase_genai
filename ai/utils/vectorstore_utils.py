from typing import List, Tuple
import faiss
import numpy as np

def create_vector_store(embeddings: List[List[float]], chunks: List[str]) -> Tuple[faiss.Index, List[str]]:
    """Create a FAISS vector store from embeddings"""
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    
    embeddings_array = np.array(embeddings, dtype=np.float32)
    index.add(embeddings_array)
    
    return index, chunks

def search_vector_store(index: faiss.Index, chunks: List[str], query_embedding: List[float], top_k: int = 3) -> List[str]:
    """Search vector store for similar chunks"""
    query_array = np.array([query_embedding], dtype=np.float32)
    distances, indices = index.search(query_array, top_k)
    
    results = [chunks[i] for i in indices[0] if i < len(chunks)]
    return results
