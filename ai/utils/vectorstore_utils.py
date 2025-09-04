import os
import logging
import pickle
from typing import List, Tuple, Optional
from pathlib import Path

import faiss
import numpy as np

try:
    from ..config import VECTOR_STORE_PATH
except ImportError:
    from config import VECTOR_STORE_PATH

logger = logging.getLogger(__name__)

def create_vector_store(
    embeddings: List[List[float]], 
    chunks: List[str],
    save_to_disk: bool = True
) -> Tuple[faiss.Index, List[str]]:
    """
    Create a FAISS vector store from embeddings
    
    Args:
        embeddings: List of embedding vectors
        chunks: List of corresponding text chunks
        save_to_disk: Whether to save the index to disk
        
    Returns:
        Tuple of (FAISS index, chunks list)
        
    Raises:
        ValueError: If inputs are invalid
        RuntimeError: If vector store creation fails
    """
    if not embeddings or not chunks:
        raise ValueError("Both embeddings and chunks must be provided")
    
    if len(embeddings) != len(chunks):
        raise ValueError("Number of embeddings must match number of chunks")
    
    if not all(isinstance(emb, list) and len(emb) > 0 for emb in embeddings):
        raise ValueError("All embeddings must be non-empty lists")
    
    try:
        logger.info(f"Creating vector store with {len(embeddings)} embeddings")
        
        # Get embedding dimension
        dim = len(embeddings[0])
        if not all(len(emb) == dim for emb in embeddings):
            raise ValueError("All embeddings must have the same dimension")
        
        # Create FAISS index
        index = faiss.IndexFlatL2(dim)
        
        # Convert embeddings to numpy array and add to index
        embeddings_array = np.array(embeddings, dtype=np.float32)
        index.add(embeddings_array)
        
        logger.info(f"Vector store created successfully with {index.ntotal} vectors")
        
        # Save to disk if requested
        if save_to_disk:
            save_vector_store(index, chunks)
        
        return index, chunks
        
    except Exception as e:
        logger.error(f"Failed to create vector store: {e}")
        raise RuntimeError(f"Vector store creation failed: {e}")

def save_vector_store(index: faiss.Index, chunks: List[str]) -> None:
    """
    Save vector store index and chunks to disk
    
    Args:
        index: FAISS index to save
        chunks: Text chunks to save
    """
    try:
        # Create directory if it doesn't exist
        vector_store_dir = Path(VECTOR_STORE_PATH).parent
        vector_store_dir.mkdir(parents=True, exist_ok=True)
        
        # Save FAISS index
        index_path = f"{VECTOR_STORE_PATH}.faiss"
        faiss.write_index(index, index_path)
        
        # Save chunks
        chunks_path = f"{VECTOR_STORE_PATH}.chunks"
        with open(chunks_path, 'wb') as f:
            pickle.dump(chunks, f)
        
        logger.info(f"Vector store saved to {index_path} and {chunks_path}")
        
    except Exception as e:
        logger.error(f"Failed to save vector store: {e}")
        raise RuntimeError(f"Failed to save vector store: {e}")

def load_vector_store() -> Tuple[Optional[faiss.Index], Optional[List[str]]]:
    """
    Load vector store index and chunks from disk
    
    Returns:
        Tuple of (FAISS index, chunks list) or (None, None) if not found
    """
    try:
        index_path = f"{VECTOR_STORE_PATH}.faiss"
        chunks_path = f"{VECTOR_STORE_PATH}.chunks"
        
        if not os.path.exists(index_path) or not os.path.exists(chunks_path):
            logger.info("No existing vector store found")
            return None, None
        
        # Load FAISS index
        index = faiss.read_index(index_path)
        
        # Load chunks
        with open(chunks_path, 'rb') as f:
            chunks = pickle.load(f)
        
        logger.info(f"Vector store loaded successfully with {index.ntotal} vectors")
        return index, chunks
        
    except Exception as e:
        logger.error(f"Failed to load vector store: {e}")
        return None, None

def search_vector_store(
    index: faiss.Index, 
    chunks: List[str], 
    query_embedding: List[float], 
    top_k: int = 3
) -> List[str]:
    """
    Search vector store for similar chunks
    
    Args:
        index: FAISS index to search
        chunks: Text chunks
        query_embedding: Query embedding vector
        top_k: Number of top results to return
        
    Returns:
        List of top-k most similar chunks
        
    Raises:
        ValueError: If inputs are invalid
        RuntimeError: If search fails
    """
    if not index or not chunks:
        raise ValueError("Both index and chunks must be provided")
    
    if not query_embedding:
        raise ValueError("Query embedding must be provided")
    
    if top_k <= 0:
        raise ValueError("top_k must be positive")
    
    if top_k > len(chunks):
        top_k = len(chunks)
        logger.warning(f"top_k reduced to {top_k} (available chunks)")
    
    try:
        # Convert query embedding to numpy array
        query_array = np.array([query_embedding], dtype=np.float32)
        
        # Search the index
        distances, indices = index.search(query_array, top_k)
        
        # Extract results
        results = [chunks[i] for i in indices[0] if i < len(chunks)]
        
        logger.info(f"Search completed, found {len(results)} results")
        return results
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise RuntimeError(f"Vector store search failed: {e}")

def get_vector_store_info(index: faiss.Index) -> dict:
    """
    Get information about the vector store
    
    Args:
        index: FAISS index
        
    Returns:
        Dictionary with vector store information
    """
    if not index:
        return {"error": "No index provided"}
    
    return {
        "total_vectors": index.ntotal,
        "dimension": index.d,
        "is_trained": index.is_trained,
        "metric_type": str(index.metric_type)
    }
