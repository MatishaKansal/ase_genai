from typing import List, Optional
import google.generativeai as genai

try:
    from ..config import GEMINI_API_KEY
except ImportError:
    from config import GEMINI_API_KEY

def generate_summary(text: str, anomalies: Optional[List[str]] = None) -> str:
    """Generate a summary of the document using Google Gemini"""
    if not GEMINI_API_KEY:
        return "Summary unavailable - Gemini API key not configured"
    
    prompt = f"""
    Summarize this document in 200-300 words, focusing on key points and legal implications:
    
    {text[:2000]}
    """
    
    if anomalies:
        prompt += f"\n\nNote: These sections may be concerning: {', '.join(anomalies[:3])}"
    
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text.strip() if response and response.text else "Summary generation failed"
    except Exception:
        return "Summary generation failed"
