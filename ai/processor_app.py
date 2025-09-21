"""
HTTP API for processing documents and chatting about their contents.

Plain-language overview:
- /api/process-document: You upload a PDF or an image. We extract text (OCR), split into pieces,
  turn them into vectors, search/summarize with AI, detect missing standard clauses, translate, and produce audio.
- /api/chat: Ask questions about the uploaded document. Answers come only from the document text.
"""
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
    from .utils.anomaly_utils import find_missing_clauses
except ImportError:
    from init import app as fastapi_app, app_state  # type: ignore
    from utils.ocr_utils import extract_text_from_document, extract_text_from_image  # type: ignore
    from utils.embedding_utils import chunk_text, get_embeddings, get_embedding_for_query  # type: ignore
    from utils.summarizer_utils import generate_summary, generate_grounded_answer  # type: ignore
    from utils.translation_utils import translate_text  # type: ignore
    from utils.tts_utils import generate_audio  # type: ignore
    from utils.vectorstore_utils import search_vector_store  # type: ignore
    from utils.anomaly_utils import find_missing_clauses  # type: ignore

# --- Models and Dependencies ---

class ProcessResponse(BaseModel):
    """Response schema for /api/process-document."""
    summary: str
    total_chunks: int
    processing_time: float
    audio_url: str
    translated_summary: str
    is_suspicious: bool
    suspicion_note: str
    
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

    # 1) OCR: figure out file type and extract text from PDF/image
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

    # 2) RAG pipeline: split text → embed → (later) search
        chunks = chunk_text(text)
        embeddings = np.array(get_embeddings(chunks), dtype=np.float32)

    # 3) Missing clause detection: compare document vs. standard/core clauses
        core_map = state.get("core_embeddings", {}) or {}
        if core_map:
            # Convert ndarray to list of lists for typing
            missing = find_missing_clauses(embeddings.tolist(), core_map)
        else:
            missing = []

        is_suspicious = len(missing) > 0
        suspicion_note = ""
        if is_suspicious:
            # Keep the note concise: show up to 5 items, then "+N more"
            display_limit = 5
            shown = missing[:display_limit]
            remaining = max(0, len(missing) - len(shown))
            missing_list = ", ".join(shown)
            if remaining > 0:
                missing_list = f"{missing_list} +{remaining} more"
            suspicion_note = (
                f"The following standard clauses appear to be missing from your agreement: {missing_list}. "
                f"It is advised to consult with a professional legal advisor."
            )

        # 4) Build or update our in-memory vector store for later chat/search
        if not state.get("faiss_index"):
            dim = embeddings.shape[1]
            state["faiss_index"] = faiss.IndexFlatL2(dim)

        # Add document chunks to our persistent vector store
        state["faiss_index"].add(embeddings)  # type: ignore[arg-type]
        state["chunks"].extend(chunks)

    # 5) Generate a summary and translate it if requested
        relevant_chunks_for_summary = chunks
        summary = generate_summary(relevant_chunks=relevant_chunks_for_summary)
        translated_summary = translate_text(summary, language)

        # Translate suspicion note to match translated summary language
        if suspicion_note:
            suspicion_note = translate_text(suspicion_note, language)

    # 6) Generate audio (Text-to-Speech) for accessibility
        audio_url = generate_audio(translated_summary, language=language)

        processing_time = round(time.time() - start_time, 2)

        return ProcessResponse(
            summary=summary,
            total_chunks=len(chunks),
            processing_time=processing_time,
            audio_url=audio_url,
            translated_summary=translated_summary,
            is_suspicious=is_suspicious,
            suspicion_note=suspicion_note,
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
            
    # 1) Turn the user's question into a vector
        query_embedding = get_embedding_for_query(query)
        
        # 0. Ensure vector store has content
        if not state.get("faiss_index") or not state.get("chunks"):
            return {
                "chatbot_response": "No document content is indexed yet. Please process a document first.",
                "audio_url": "",
                "translated_response": "No document content is indexed yet. Please process a document first."
            }

        # 2) Find the most relevant document chunks for this question
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

    # 3) Ask the AI to answer based ONLY on those chunks
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

    