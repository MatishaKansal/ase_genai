import faiss
import numpy as np

def create_vector_store(embeddings: list[list[float]], chunks: list[str]):
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))
    return index, chunks

def search_vector_store(index, chunks, query_embedding, top_k=3):
    distances, indices = index.search(np.array([query_embedding]).astype("float32"), top_k)
    return [chunks[i] for i in indices[0]]
