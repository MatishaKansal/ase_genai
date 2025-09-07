import tempfile
import time
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel

try:
    from .utils.ocr_utils import extract_text_from_document
    from .utils.embedding_utils import chunk_text, get_embeddings
    from .utils.vectorstore_utils import create_vector_store
    from .utils.anomaly_utils import detect_anomalies, risk_score
    from .utils.summarizer_utils import generate_summary
except ImportError:
    from utils.ocr_utils import extract_text_from_document
    from utils.embedding_utils import chunk_text, get_embeddings
    from utils.vectorstore_utils import create_vector_store
    from utils.anomaly_utils import detect_anomalies, risk_score
    from utils.summarizer_utils import generate_summary

app = FastAPI(title="AI Document Processor", version="1.0.0")

class ProcessResponse(BaseModel):
    summary: str
    risk_score: float
    anomalies: List[str]
    total_chunks: int
    processing_time: float

@app.get("/")
async def root():
    return {"message": "AI Document Processor is running"}

@app.post("/api/process-document", response_model=ProcessResponse)
async def process_document(file: UploadFile = File(...)):
    """Process uploaded PDF document through AI pipeline"""
    start_time = time.time()
    
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    temp_file_path = None
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            temp_file_path = tmp.name
        
        # Extract text
        text = extract_text_from_document(temp_file_path)
        
        # Generate chunks and embeddings
        chunks = chunk_text(text)
        embeddings = get_embeddings(chunks)
        
        # Create vector store
        index, stored_chunks = create_vector_store(embeddings, chunks)
        
        # Detect anomalies
        normal_embeddings = embeddings[:min(3, len(embeddings))]
        anomalies_idx = detect_anomalies(embeddings, normal_embeddings)
        anomalies_text = [chunks[i] for i in anomalies_idx] if anomalies_idx else []
        risk = risk_score(anomalies_idx, len(chunks)) if anomalies_idx else 0.0
        
        # Generate summary
        summary = generate_summary(text, anomalies_text)
        
        processing_time = round(time.time() - start_time, 2)
        
        return ProcessResponse(
            summary=summary,
            risk_score=risk,
            anomalies=anomalies_text,
            total_chunks=len(chunks),
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary file
        if temp_file_path:
            import os
            try:
                os.unlink(temp_file_path)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
