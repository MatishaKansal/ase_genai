"""
Missing core clauses detection.

We check whether each expected "core clause" has a close match in the user's document
by comparing embeddings (numeric vectors) and a similarity threshold.
"""
from typing import List, Dict, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# Support both package and script execution imports
try:
    from ..config import ANOMALY_THRESHOLD  # We'll reuse this threshold
except ImportError:
    from config import ANOMALY_THRESHOLD

# ... (keep your existing detect_anomalies and risk_score functions for now, or remove them)

def find_missing_clauses(doc_embeddings: List[List[float]], core_clauses_embeddings: Dict[str, List[float]]) -> List[str]:
    """
    Identifies which core clauses are missing from a document.

    This function checks if each core clause has a semantically similar counterpart
    in the user's document.

    Args:
        doc_embeddings: A list of embeddings from the user's document.
        core_clauses_embeddings: A dictionary mapping clause names to their embeddings.

    Returns:
        A list of names of the core clauses that are considered missing.
    """
    if not doc_embeddings:
        return list(core_clauses_embeddings.keys()) # If the doc is empty, all clauses are missing

    missing_clauses = []
    doc_embeddings_array = np.array(doc_embeddings, dtype=np.float32)

    for clause_name, core_embedding in core_clauses_embeddings.items():
        # Compare this single core clause against ALL clauses in the user's document
        core_embedding_array = np.array([core_embedding], dtype=np.float32)
        similarity_scores = cosine_similarity(core_embedding_array, doc_embeddings_array)

        # Find the highest similarity score. This tells us if ANY clause in the document
        # is a good match for our current core clause.
        max_similarity = np.max(similarity_scores)

        # If the best match is below our threshold, we consider the clause to be missing.
        if max_similarity < ANOMALY_THRESHOLD:
            missing_clauses.append(clause_name)

    return missing_clauses