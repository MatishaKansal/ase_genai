import logging
from typing import List, Optional, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

try:
    from ..config import ANOMALY_THRESHOLD
except ImportError:
    from config import ANOMALY_THRESHOLD

logger = logging.getLogger(__name__)

def detect_anomalies(
    embeddings: List[List[float]], 
    normal_embeddings: List[List[float]], 
    threshold: Optional[float] = None,
    method: str = "cosine"
) -> List[int]:
    """
    Detect anomalies in embeddings using similarity-based approach
    
    Args:
        embeddings: List of embeddings to check for anomalies
        normal_embeddings: List of normal/reference embeddings
        threshold: Similarity threshold (defaults to config value)
        method: Detection method ('cosine' or 'euclidean')
        
    Returns:
        List of indices of anomalous embeddings
        
    Raises:
        ValueError: If inputs are invalid
        RuntimeError: If anomaly detection fails
    """
    if not embeddings or not normal_embeddings:
        raise ValueError("Both embeddings and normal_embeddings must be provided")
    
    if threshold is None:
        threshold = ANOMALY_THRESHOLD
    
    if not (0 <= threshold <= 1):
        raise ValueError("Threshold must be between 0 and 1")
    
    if method not in ["cosine", "euclidean"]:
        raise ValueError("Method must be 'cosine' or 'euclidean'")
    
    try:
        logger.info(f"Detecting anomalies using {method} method with threshold {threshold}")
        
        # Convert to numpy arrays
        embeddings_array = np.array(embeddings, dtype=np.float32)
        normal_array = np.array(normal_embeddings, dtype=np.float32)
        
        anomalies = []
        
        for i, emb in enumerate(embeddings_array):
            if method == "cosine":
                # Calculate cosine similarities with all normal embeddings
                similarities = cosine_similarity([emb], normal_array)[0]
                max_similarity = np.max(similarities)
                
                if max_similarity < threshold:
                    anomalies.append(i)
                    logger.debug(f"Anomaly detected at index {i}, max similarity: {max_similarity:.3f}")
                    
            elif method == "euclidean":
                # Calculate Euclidean distances
                distances = np.linalg.norm(normal_array - emb, axis=1)
                min_distance = np.min(distances)
                
                # Normalize distance (assuming embeddings are normalized)
                normalized_distance = min_distance / np.linalg.norm(emb)
                
                if normalized_distance > (1 - threshold):
                    anomalies.append(i)
                    logger.debug(f"Anomaly detected at index {i}, min distance: {min_distance:.3f}")
        
        logger.info(f"Anomaly detection completed. Found {len(anomalies)} anomalies")
        return anomalies
        
    except Exception as e:
        logger.error(f"Anomaly detection failed: {e}")
        raise RuntimeError(f"Anomaly detection failed: {e}")

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors
    
    Args:
        a: First vector
        b: Second vector
        
    Returns:
        Cosine similarity score between -1 and 1
        
    Raises:
        ValueError: If vectors are invalid
    """
    if not a or not b:
        raise ValueError("Both vectors must be provided")
    
    if len(a) != len(b):
        raise ValueError("Vectors must have the same length")
    
    try:
        # Convert to numpy arrays
        a_array = np.array(a, dtype=np.float32)
        b_array = np.array(b, dtype=np.float32)
        
        # Calculate cosine similarity
        dot_product = np.dot(a_array, b_array)
        norm_a = np.linalg.norm(a_array)
        norm_b = np.linalg.norm(b_array)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        similarity = dot_product / (norm_a * norm_b)
        
        # Ensure result is within valid range
        return np.clip(similarity, -1.0, 1.0)
        
    except Exception as e:
        logger.error(f"Cosine similarity calculation failed: {e}")
        raise RuntimeError(f"Cosine similarity calculation failed: {e}")

def risk_score(anomalies: List[int], total: int) -> float:
    """
    Calculate risk score based on anomaly ratio
    
    Args:
        anomalies: List of anomaly indices
        total: Total number of items
        
    Returns:
        Risk score as percentage (0.0 to 100.0)
        
    Raises:
        ValueError: If inputs are invalid
    """
    if total <= 0:
        raise ValueError("Total must be positive")
    
    if not anomalies:
        return 0.0
    
    try:
        # Calculate risk as percentage of anomalies
        risk_percentage = (len(anomalies) / total) * 100
        
        # Round to 2 decimal places
        return round(risk_percentage, 2)
        
    except Exception as e:
        logger.error(f"Risk score calculation failed: {e}")
        raise RuntimeError(f"Risk score calculation failed: {e}")

def get_anomaly_statistics(
    embeddings: List[List[float]], 
    normal_embeddings: List[List[float]]
) -> dict:
    """
    Get comprehensive statistics about anomalies
    
    Args:
        embeddings: List of embeddings to analyze
        normal_embeddings: List of normal/reference embeddings
        
    Returns:
        Dictionary with anomaly statistics
    """
    try:
        # Detect anomalies with different thresholds
        thresholds = [0.1, 0.3, 0.5, 0.7, 0.9]
        stats = {}
        
        for threshold in thresholds:
            anomalies = detect_anomalies(embeddings, normal_embeddings, threshold)
            stats[f"threshold_{threshold}"] = {
                "count": len(anomalies),
                "percentage": risk_score(anomalies, len(embeddings)),
                "indices": anomalies
            }
        
        # Add overall statistics
        stats["total_embeddings"] = len(embeddings)
        stats["normal_embeddings"] = len(normal_embeddings)
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get anomaly statistics: {e}")
        return {"error": str(e)}
