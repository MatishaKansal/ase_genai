import logging
from typing import List, Optional
from google.cloud import aiplatform
from google.api_core import exceptions as google_exceptions

try:
    from ..config import PROJECT_ID, LOCATION, EMBEDDING_MODEL, CHUNK_SIZE
except ImportError:
    from config import PROJECT_ID, LOCATION, EMBEDDING_MODEL, CHUNK_SIZE

logger = logging.getLogger(__name__)

# Vertex AI will be initialized when first needed
_vertex_ai_initialized = False

def _initialize_vertex_ai():
    """Initialize Vertex AI if not already done"""
    global _vertex_ai_initialized
    if not _vertex_ai_initialized:
        try:
            aiplatform.init(project=PROJECT_ID, location=LOCATION)
            logger.info("Vertex AI initialized successfully")
            _vertex_ai_initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
            raise

def chunk_text(text: str, chunk_size: Optional[int] = None) -> List[str]:
    """
    Split text into chunks of specified size
    
    Args:
        text: Input text to chunk
        chunk_size: Number of words per chunk (defaults to config value)
        
    Returns:
        List of text chunks
        
    Raises:
        ValueError: If text is empty or invalid
    """
    if not text or not isinstance(text, str):
        raise ValueError("Invalid text provided")
    
    if chunk_size is None:
        chunk_size = CHUNK_SIZE
    
    if chunk_size <= 0:
        raise ValueError("Chunk size must be positive")
    
    words = text.split()
    if not words:
        return []
    
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk)
    
    logger.info(f"Text chunked into {len(chunks)} chunks of size {chunk_size}")
    return chunks

def get_embeddings(chunks: List[str], batch_size: int = 5) -> List[List[float]]:
    """
    Generate embeddings for text chunks using Vertex AI
    
    Args:
        chunks: List of text chunks to embed
        batch_size: Number of chunks to process in each batch
        
    Returns:
        List of embedding vectors
        
    Raises:
        ValueError: If chunks list is empty or invalid
        RuntimeError: If embedding generation fails
    """
    if not chunks or not isinstance(chunks, list):
        raise ValueError("Invalid chunks list provided")
    
    if not all(isinstance(chunk, str) and chunk.strip() for chunk in chunks):
        raise ValueError("All chunks must be non-empty strings")
    
    try:
        # Initialize Vertex AI if needed
        _initialize_vertex_ai()
        
        logger.info(f"Generating embeddings for {len(chunks)} chunks")
        
        embed_model = aiplatform.TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
        embeddings = []
        
        # Process chunks in batches for better performance
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            logger.debug(f"Processing batch {i//batch_size + 1}: {len(batch)} chunks")
            
            try:
                batch_result = embed_model.get_embeddings(batch)
                batch_embeddings = [result.values for result in batch_result]
                embeddings.extend(batch_embeddings)
                
            except google_exceptions.QuotaExceeded:
                logger.error("API quota exceeded. Consider reducing batch size or waiting.")
                raise RuntimeError("API quota exceeded")
            except google_exceptions.PermissionDenied:
                logger.error("Permission denied accessing Vertex AI")
                raise RuntimeError("Permission denied accessing Vertex AI. Check your credentials.")
            except Exception as e:
                logger.error(f"Error processing batch {i//batch_size + 1}: {e}")
                raise RuntimeError(f"Embedding generation failed for batch: {e}")
        
        logger.info(f"Successfully generated {len(embeddings)} embeddings")
        return embeddings
        
    except Exception as e:
        logger.error(f"Unexpected error during embedding generation: {str(e)}")
        raise RuntimeError(f"Embedding generation failed: {str(e)}")

def get_single_embedding(text: str) -> List[float]:
    """
    Generate embedding for a single text string
    
    Args:
        text: Text to embed
        
    Returns:
        Embedding vector
        
    Raises:
        ValueError: If text is empty or invalid
        RuntimeError: If embedding generation fails
    """
    if not text or not isinstance(text, str):
        raise ValueError("Invalid text provided")
    
    try:
        # Initialize Vertex AI if needed
        _initialize_vertex_ai()
        
        embed_model = aiplatform.TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
        result = embed_model.get_embeddings([text])
        return result[0].values
    except Exception as e:
        logger.error(f"Error generating single embedding: {e}")
        raise RuntimeError(f"Single embedding generation failed: {e}")
