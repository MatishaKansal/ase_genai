import os
import logging
import tempfile
from typing import List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Document Processor",
    description="AI-powered document processing with OCR, embeddings, and anomaly detection",
    version="1.0.0"
)

class ProcessResponse(BaseModel):
    summary: str
    risk_score: float
    anomalies: List[str]
    total_chunks: int
    processing_time: float

class ErrorResponse(BaseModel):
    error: str
    detail: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Document Processor is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "ocr": "available",
            "embeddings": "available",
            "vector_store": "available",
            "anomaly_detection": "available",
            "summarization": "available"
        }
    }

@app.post("/api/process-document", response_model=ProcessResponse)
async def process_document(file: UploadFile = File(...)):
    """
    Process uploaded document through the AI pipeline:
    1. OCR text extraction
    2. Text chunking and embedding generation
    3. Vector store creation
    4. Anomaly detection
    5. Document summarization
    """
    import time
    start_time = time.time()
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum size is 10MB"
        )
    
    temp_file_path = None
    
    try:
        logger.info(f"Processing document: {file.filename}")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            temp_file_path = tmp.name
        
        # Step 1: OCR
        logger.info("Starting OCR processing...")
        try:
            text = extract_text_from_document(temp_file_path)
            if not text or len(text.strip()) < 10:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Document text extraction failed or document is too short"
                )
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR processing failed: {str(e)}"
            )
        
        # Step 2: Chunk + Embeddings
        logger.info("Generating text chunks and embeddings...")
        try:
            chunks = chunk_text(text)
            if not chunks:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Text chunking failed"
                )
            
            embeddings = get_embeddings(chunks)
            if not embeddings or len(embeddings) != len(chunks):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Embedding generation failed"
                )
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Embedding generation failed: {str(e)}"
            )
        
        # Step 3: Vector Store
        logger.info("Creating vector store...")
        try:
            index, stored_chunks = create_vector_store(embeddings, chunks)
        except Exception as e:
            logger.error(f"Vector store creation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Vector store creation failed: {str(e)}"
            )
        
        # Step 4: Anomaly Detection
        logger.info("Performing anomaly detection...")
        try:
            # Use first few chunks as "normal" baseline (improve this in production)
            normal_count = min(3, len(embeddings))
            normal_embeddings = embeddings[:normal_count]
            
            anomalies_idx = detect_anomalies(embeddings, normal_embeddings)
            anomalies_text = [chunks[i] for i in anomalies_idx] if anomalies_idx else []
            risk = risk_score(anomalies_idx, len(chunks)) if anomalies_idx else 0.0
        except Exception as e:
            logger.error(f"Anomaly detection failed: {str(e)}")
            # Don't fail the entire process for anomaly detection
            anomalies_text = []
            risk = 0.0
        
        # Step 5: Summarization
        logger.info("Generating document summary...")
        try:
            summary = generate_summary(text, anomalies_text)
            if not summary:
                summary = "Summary generation failed. Please review the document manually."
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            summary = "Summary generation failed. Please review the document manually."
        
        processing_time = round(time.time() - start_time, 2)
        
        logger.info(f"Document processing completed in {processing_time}s")
        
        return ProcessResponse(
            summary=summary,
            risk_score=risk,
            anomalies=anomalies_text,
            total_chunks=len(chunks),
            processing_time=processing_time
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error during document processing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info("Temporary file cleaned up")
            except Exception as e:
                logger.warning(f"Failed to clean up temporary file: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
