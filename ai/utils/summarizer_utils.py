import logging
from typing import List, Optional, Dict, Any
import google.generativeai as genai

try:
    from ..config import GEMINI_API_KEY
except ImportError:
    from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

def generate_summary(
    text: str, 
    anomalies: Optional[List[str]] = None,
    max_length: int = 500,
    style: str = "professional"
) -> str:
    """
    Generate a summary of the document using Google Gemini
    
    Args:
        text: Document text to summarize
        anomalies: List of anomalous text chunks (optional)
        max_length: Maximum length of summary
        style: Summary style ('professional', 'casual', 'technical')
        
    Returns:
        Generated summary text
        
    Raises:
        ValueError: If text is invalid
        RuntimeError: If summarization fails
    """
    if not text or not isinstance(text, str):
        raise ValueError("Valid text must be provided")
    
    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key not configured")
    
    if max_length <= 0:
        raise ValueError("Max length must be positive")
    
    if style not in ["professional", "casual", "technical"]:
        style = "professional"
    
    try:
        logger.info(f"Generating {style} summary with max length {max_length}")
        
        # Build the prompt based on style and content
        prompt = build_summary_prompt(text, anomalies, max_length, style)
        
        # Generate content using Gemini
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise RuntimeError("No response generated from Gemini")
        
        summary = response.text.strip()
        
        # Truncate if too long
        if len(summary) > max_length:
            summary = summary[:max_length].rsplit(' ', 1)[0] + "..."
        
        logger.info(f"Summary generated successfully, length: {len(summary)}")
        return summary
        
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise RuntimeError(f"Summarization failed: {e}")

def build_summary_prompt(
    text: str, 
    anomalies: Optional[List[str]] = None,
    max_length: int = 500,
    style: str = "professional"
) -> str:
    """
    Build a prompt for the summarization model
    
    Args:
        text: Document text
        anomalies: List of anomalies
        max_length: Maximum summary length
        style: Summary style
        
    Returns:
        Formatted prompt string
    """
    style_instructions = {
        "professional": "Write a clear, professional summary suitable for business or legal contexts.",
        "casual": "Write a conversational, easy-to-understand summary.",
        "technical": "Write a technical summary with specific details and terminology."
    }
    
    prompt = f"""
    You are a legal document analysis assistant. {style_instructions.get(style, style_instructions['professional'])}
    
    Please summarize the following document in no more than {max_length} characters.
    Focus on the key points, main clauses, and any important legal implications.
    
    """
    
    if anomalies:
        prompt += f"""
        IMPORTANT: The following text chunks have been identified as potentially risky or unusual:
        {chr(10).join(f"- {anomaly[:100]}..." for anomaly in anomalies[:5])}
        
        Please highlight these areas in your summary and explain why they might be concerning.
        """
    
    prompt += f"""
    
    Document content:
    {text[:2000]}...  # Truncated for prompt length
    
    Summary:
    """
    
    return prompt

def generate_structured_summary(
    text: str,
    anomalies: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generate a structured summary with different sections
    
    Args:
        text: Document text
        anomalies: List of anomalies
        
    Returns:
        Dictionary with structured summary sections
    """
    try:
        logger.info("Generating structured summary")
        
        # Generate different types of summaries
        executive_summary = generate_summary(text, anomalies, 200, "professional")
        detailed_summary = generate_summary(text, anomalies, 800, "technical")
        
        # Extract key information
        key_points = extract_key_points(text)
        risk_assessment = assess_risks(anomalies) if anomalies else "No anomalies detected"
        
        structured_summary = {
            "executive_summary": executive_summary,
            "detailed_summary": detailed_summary,
            "key_points": key_points,
            "risk_assessment": risk_assessment,
            "document_length": len(text),
            "anomaly_count": len(anomalies) if anomalies else 0
        }
        
        logger.info("Structured summary generated successfully")
        return structured_summary
        
    except Exception as e:
        logger.error(f"Structured summary generation failed: {e}")
        return {"error": str(e)}

def extract_key_points(text: str, max_points: int = 5) -> List[str]:
    """
    Extract key points from the document
    
    Args:
        text: Document text
        max_points: Maximum number of key points
        
    Returns:
        List of key points
    """
    try:
        prompt = f"""
        Extract the {max_points} most important points from this document:
        
        {text[:1500]}...
        
        Return only the key points, one per line, without numbering or bullet points.
        """
        
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        if response and response.text:
            points = [point.strip() for point in response.text.split('\n') if point.strip()]
            return points[:max_points]
        
        return []
        
    except Exception as e:
        logger.error(f"Key points extraction failed: {e}")
        return []

def assess_risks(anomalies: List[str]) -> str:
    """
    Assess the overall risk level based on anomalies
    
    Args:
        anomalies: List of anomalous text chunks
        
    Returns:
        Risk assessment string
    """
    if not anomalies:
        return "Low risk - no anomalies detected"
    
    try:
        prompt = f"""
        Assess the risk level of these potentially concerning document sections:
        
        {chr(10).join(f"- {anomaly[:200]}..." for anomaly in anomalies[:3])}
        
        Provide a brief risk assessment (low/medium/high) with a one-sentence explanation.
        """
        
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        if response and response.text:
            return response.text.strip()
        
        return f"Medium risk - {len(anomalies)} anomalies detected"
        
    except Exception as e:
        logger.error(f"Risk assessment failed: {e}")
        return f"Risk assessment unavailable - {len(anomalies)} anomalies detected"
