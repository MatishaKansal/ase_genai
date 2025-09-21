"""
Helpers for our in-memory vector store (FAISS).

We add vectors (embeddings) for document chunks and search for the most similar chunks
for a given question.
"""
from typing import List, Tuple
import numpy as np
import faiss

def create_and_add_embeddings(embeddings: List[List[float]], index: faiss.Index, chunks: List[str], chunk_store: List[str]):
    """
    Adds new embeddings and chunks to the existing, persistent vector store.
    
    Args:
        embeddings (List[List[float]]): The list of embeddings to add.
        index (faiss.Index): The persistent Faiss index.
        chunks (List[str]): The text chunks corresponding to the embeddings.
        chunk_store (List[str]): The persistent list of all document chunks.
    """
    embeddings_array = np.array(embeddings, dtype=np.float32)
    
    # Normalize embeddings to use Inner Product for cosine similarity
    faiss.normalize_L2(embeddings_array)
    
    index.add(embeddings_array)  # type: ignore[arg-type]
    chunk_store.extend(chunks)

def search_vector_store(index: faiss.Index, chunk_store: List[str], query_embedding: List[float], top_k: int = 3) -> List[str]:
    """
    Searches the persistent vector store for the most relevant document chunks.
    
    Args:
        index (faiss.Index): The persistent Faiss index.
        chunk_store (List[str]): The persistent list of all document chunks.
        query_embedding (List[float]): The embedding of the user's query.
        top_k (int): The number of top results to retrieve.
    """
    query_array = np.array([query_embedding], dtype=np.float32)
    faiss.normalize_L2(query_array)
    
    distances, indices = index.search(query_array, top_k)  # type: ignore[misc]
    
    results = [chunk_store[i] for i in indices[0] if i < len(chunk_store)]
    return results