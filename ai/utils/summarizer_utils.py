import google.generativeai as genai

def generate_summary(text: str, anomalies: list[str]) -> str:
    prompt = f"""
    You are a legal assistant. Summarize the document clearly.
    Highlight any risky or unusual clauses explicitly:
    {anomalies}
    Document content:
    {text}
    """
    response = genai.GenerativeModel("gemini-pro").generate_content(prompt)
    return response.text
