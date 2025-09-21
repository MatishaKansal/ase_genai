"""
Summarization and Q&A helpers using Gemini (Vertex AI).

Non-technical summary:
- We build clear prompts and ask the model to summarize or answer questions.
- Answers are grounded in the provided text only; we also add a disclaimer.
- If the model is temporarily unavailable, we return simple fallback text instead.
"""
from typing import List, Optional
# Support both package and script execution imports
try:
    from ..config import (
        PROJECT_ID,
        LOCATION,
        DISCLAIMER_TEXT,
        SUMMARY_PROMPT_TEMPLATE,
        QA_PROMPT_TEMPLATE,
    )
except ImportError:
    from config import (
        PROJECT_ID,
        LOCATION,
        DISCLAIMER_TEXT,
        SUMMARY_PROMPT_TEMPLATE,
        QA_PROMPT_TEMPLATE,
    )
import vertexai
from vertexai.generative_models import GenerativeModel

def _generate_with_gemini_models(prompt: str) -> Optional[str]:
    """Generate text using Gemini models via Vertex AI (tries a few model sizes)."""
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
    """Create a plain-language summary from document excerpts.

    We insert up to ~8k characters of context into the prompt template and
    append a disclaimer to the result. If anything fails, we return a minimal
    fallback so the user still gets a response.
    """

    # Join the relevant chunks to form the context for the prompt (limit size defensively)
    max_chars = 8000
    joined = "\n\n".join(relevant_chunks)
    document_context = joined[:max_chars]

    # Build prompt via configurable template
    try:
        prompt = SUMMARY_PROMPT_TEMPLATE.format(context=document_context)
    except Exception:
        # Fallback to a minimal prompt if formatting fails due to bad template
        prompt = f"Summarize the following excerpts for a non-expert.\n\n{document_context}"

    text = _generate_with_gemini_models(prompt)
    if text:
        return f"{text}\n\n{DISCLAIMER_TEXT}"

    # Final fallback: provide a simple heuristic summary if all model calls fail
    try:
        first_part = document_context.split(". ")[:3]
        fallback = ". ".join(first_part).strip()
        final = fallback if fallback else "Summary generation failed."
        return f"{final}\n\n{DISCLAIMER_TEXT}"
    except Exception:
        return "Summary generation failed."


def generate_grounded_answer(relevant_chunks: List[str], question: str) -> str:
    """Answer a question using only the provided document excerpts (no outside info)."""
    max_chars = 8000
    context = "\n\n".join(relevant_chunks)[:max_chars]
    try:
        prompt = QA_PROMPT_TEMPLATE.format(question=question, context=context)
    except Exception:
        prompt = (
            f"Answer the question using ONLY these excerpts. If unknown, say: I cannot answer this question based on the document.\n\n"
            f"Question: {question}\n\n"
            f"Excerpts:\n{context}"
        )

    text = _generate_with_gemini_models(prompt)
    if text:
        return f"{text}\n\n{DISCLAIMER_TEXT}"
    # Minimal fallback if all attempts fail
    return f"I cannot answer this question based on the document.\n\n{DISCLAIMER_TEXT}"