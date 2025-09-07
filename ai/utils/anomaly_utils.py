from typing import List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

try:
    from ..config import ANOMALY_THRESHOLD
except ImportError:
    from config import ANOMALY_THRESHOLD

def detect_anomalies(embeddings: List[List[float]], normal_embeddings: List[List[float]], threshold: float = None) -> List[int]:
    """Detect anomalies in embeddings using cosine similarity"""
    if threshold is None:
        threshold = ANOMALY_THRESHOLD
    
    embeddings_array = np.array(embeddings, dtype=np.float32)
    normal_array = np.array(normal_embeddings, dtype=np.float32)
    
    anomalies = []
    for i, emb in enumerate(embeddings_array):
        similarities = cosine_similarity([emb], normal_array)[0]
        max_similarity = np.max(similarities)
        
        if max_similarity < threshold:
            anomalies.append(i)
    
    return anomalies

def risk_score(anomalies: List[int], total: int) -> float:
    """Calculate risk score as percentage of anomalies"""
    if total <= 0 or not anomalies:
        return 0.0
    
    return round((len(anomalies) / total) * 100, 2)
