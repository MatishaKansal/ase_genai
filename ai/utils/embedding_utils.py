from google.cloud import aiplatform
from config import PROJECT_ID, LOCATION, EMBEDDING_MODEL

aiplatform.init(project=PROJECT_ID, location=LOCATION)

def chunk_text(text: str, chunk_size: int = 500):
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

def get_embeddings(chunks: list[str]) -> list[list[float]]:
    embed_model = aiplatform.TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    embeddings = []
    for chunk in chunks:
        res = embed_model.get_embeddings([chunk])
        embeddings.append(res[0].values)
    return embeddings
