from typing import List, Optional
from ..config import PROJECT_ID, LOCATION
import vertexai
from vertexai.generative_models import GenerativeModel

def _generate_with_gemini_models(prompt: str) -> Optional[str]:
    """Generate text using Vertex AI SDK (ADC)."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    candidate_models = [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ]
    for model_name in candidate_models:
        try:
            model = GenerativeModel(model_name)
            resp = model.generate_content(prompt, generation_config={"temperature": 0.2})
            text = getattr(resp, "text", "").strip()
            if text:
                return text
        except Exception as e:
            print(f"Gemini attempt with {model_name} failed: {e}")
    return None


def generate_summary(relevant_chunks: List[str]) -> str:
    """Generate a summary of the document using Gemini (Vertex AI or API fallback)."""

    # Join the relevant chunks to form the context for the prompt (limit size defensively)
    max_chars = 8000
    joined = "\n\n".join(relevant_chunks)
    document_context = joined[:max_chars]

    prompt = f"""
    You are an expert legal document analyst. Summarize the following document excerpts in a clear, accessible manner. Focus on key points, important conditions, and legal implications for a non-expert.

    Document Excerpts:
    {document_context}
    """

    text = _generate_with_gemini_models(prompt)
    if text:
        return text

    # Final fallback: provide a simple heuristic summary if all model calls fail
    try:
        first_part = document_context.split(". ")[:3]
        fallback = ". ".join(first_part).strip()
        return fallback if fallback else "Summary generation failed."
    except Exception:
        return "Summary generation failed."


def generate_grounded_answer(relevant_chunks: List[str], question: str) -> str:
    """Answer a question grounded strictly in the provided document excerpts using Gemini."""
    max_chars = 8000
    context = "\n\n".join(relevant_chunks)[:max_chars]
    prompt = f"""
    You are an expert legal assistant. Answer the user's question based ONLY on the provided document excerpts.
    If the answer is not present in the text, reply exactly: "I cannot answer this question based on the document.".

    User question: {question}

    Document excerpts:
    {context}
    """

    text = _generate_with_gemini_models(prompt)
    if text:
        return text
    # Minimal fallback if all attempts fail
    return "I cannot answer this question based on the document."