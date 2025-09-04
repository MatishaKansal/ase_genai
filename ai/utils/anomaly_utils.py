import numpy as np

def detect_anomalies(embeddings, normal_embeddings, threshold=0.3):
    anomalies = []
    for i, emb in enumerate(embeddings):
        sims = [cosine_similarity(emb, n_emb) for n_emb in normal_embeddings]
        if max(sims) < threshold:
            anomalies.append(i)
    return anomalies

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def risk_score(anomalies, total):
    return round((len(anomalies) / total) * 100, 2)
