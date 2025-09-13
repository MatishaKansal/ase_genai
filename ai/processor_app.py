import time
from typing import List, Dict, Any
import numpy as np
import faiss
from fastapi import UploadFile, File, HTTPException, Depends, Form
from pydantic import BaseModel

try:
    from .init import app as fastapi_app, app_state
    from .utils.ocr_utils import extract_text_from_document, extract_text_from_image
    from .utils.embedding_utils import chunk_text, get_embeddings, get_embedding_for_query
    from .utils.summarizer_utils import generate_summary, generate_grounded_answer
    from .utils.translation_utils import translate_text
    from .utils.tts_utils import generate_audio
    from .utils.vectorstore_utils import search_vector_store
except ImportError:
    from .init import app as fastapi_app, app_state
    from utils.ocr_utils import extract_text_from_document, extract_text_from_image
    from utils.embedding_utils import chunk_text, get_embeddings, get_embedding_for_query
    from utils.summarizer_utils import generate_summary, generate_grounded_answer
    from utils.translation_utils import translate_text
    from utils.tts_utils import generate_audio
    from utils.vectorstore_utils import search_vector_store

# --- Models and Dependencies ---

class ProcessResponse(BaseModel):
    summary: str
    total_chunks: int
    processing_time: float
    audio_url: str
    translated_summary: str

def get_app_state():
    """Dependency to access the shared application state."""
    return app_state

# --- API Endpoints ---

@fastapi_app.post("/api/process-document")
async def process_document(
    file: UploadFile = File(...),
    language: str = Form("en"),
    state: Dict = Depends(get_app_state)
):
    start_time = time.time()

    # 1. Determine file type and perform OCR
    mime_type = file.content_type

    if not mime_type or ('pdf' not in mime_type and 'image' not in mime_type):
        raise HTTPException(status_code=400, detail="Only PDF and image files are supported.")

    try:
        # Read file content directly into memory
        content = await file.read()

        if 'pdf' in mime_type:
            text = extract_text_from_document(content)
        else:  # Assumes image
            text = extract_text_from_image(content)

        if not text:
            raise HTTPException(status_code=500, detail="Text extraction failed.")

        # 2. RAG Pipeline
        chunks = chunk_text(text)
        embeddings = np.array(get_embeddings(chunks), dtype=np.float32)

        # Ensure vector store is initialized with correct dimension
        if not state.get("faiss_index"):
            dim = embeddings.shape[1]
            state["faiss_index"] = faiss.IndexFlatL2(dim)

        # Add document chunks to our persistent vector store
        state["faiss_index"].add(embeddings)  # type: ignore[arg-type]
        state["chunks"].extend(chunks)

        # 3. Generate Summary & Translate (no anomaly detection)
        relevant_chunks_for_summary = chunks
        summary = generate_summary(relevant_chunks=relevant_chunks_for_summary)
        translated_summary = translate_text(summary, language)

        # 4. Generate Audio
        audio_url = generate_audio(translated_summary, language=language)

        processing_time = round(time.time() - start_time, 2)

        return ProcessResponse(
            summary=summary,
            total_chunks=len(chunks),
            processing_time=processing_time,
            audio_url=audio_url,
            translated_summary=translated_summary,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    finally:
        # No need for file cleanup since we're not using a temporary file
        pass

@fastapi_app.post("/api/chat")
async def chat(
    query: str,
    language: str = "en",
    state: Dict = Depends(get_app_state)
):
    start_time = time.time()
    try:
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty.")
            
        # 1. Get embedding for the user's query
        query_embedding = get_embedding_for_query(query)
        
        # 0. Ensure vector store has content
        if not state.get("faiss_index") or not state.get("chunks"):
            return {
                "chatbot_response": "No document content is indexed yet. Please process a document first.",
                "audio_url": "",
                "translated_response": "No document content is indexed yet. Please process a document first."
            }

        # 2. Search our persistent vector store for the most relevant document chunks
        relevant_chunks = search_vector_store(
            state["faiss_index"],
            state["chunks"],
            query_embedding,
            top_k=3
        )
        
        if not relevant_chunks:
            return {
                "chatbot_response": "I couldn't find relevant information in the document.",
                "audio_url": "",
                "translated_response": "I couldn't find relevant information in the document."
            }

        # 3. Generate a grounded response using Gemini (with robust fallback)
        chatbot_response_text = generate_grounded_answer(relevant_chunks, query)
        translated_response = translate_text(chatbot_response_text, language)
        audio_url = generate_audio(translated_response, language=language)

        return {
            "chatbot_response": chatbot_response_text,
            "audio_url": audio_url,
            "translated_response": translated_response
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("__init__:app", host="0.0.0.0", port=8000, reload=True)