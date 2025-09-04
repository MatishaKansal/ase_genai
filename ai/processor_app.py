from fastapi import FastAPI, UploadFile, File
import tempfile
from utils.ocr_utils import extract_text_from_document
from utils.embedding_utils import chunk_text, get_embeddings
from utils.vectorstore_utils import create_vector_store
from utils.anomaly_utils import detect_anomalies, risk_score
from utils.summarizer_utils import generate_summary

app = FastAPI()

@app.post("/api/process-document")
async def process_document(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        file_path = tmp.name

    # Step 1 – OCR
    text = extract_text_from_document(file_path)

    # Step 2 – Chunk + Embeddings
    chunks = chunk_text(text)
    embeddings = get_embeddings(chunks)

    # Step 3 – Vector Store
    index, stored_chunks = create_vector_store(embeddings, chunks)

    # Step 4 – Anomaly Detection (dummy normal embeddings for now)
    normal_embeddings = [embeddings[0]]  # placeholder
    anomalies_idx = detect_anomalies(embeddings, normal_embeddings)
    anomalies_text = [chunks[i] for i in anomalies_idx]
    risk = risk_score(anomalies_idx, len(chunks))

    # Step 5 – Summarization
    summary = generate_summary(text, anomalies_text)

    return {
        "summary": summary,
        "risk_score": risk,
        "anomalies": anomalies_text
    }
