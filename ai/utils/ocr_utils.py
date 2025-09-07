from google.cloud import documentai_v1 as documentai

try:
    from ..config import PROJECT_ID, LOCATION, PROCESSOR_ID
except ImportError:
    from config import PROJECT_ID, LOCATION, PROCESSOR_ID

def extract_text_from_document(file_path: str) -> str:
    """Extract text from a PDF document using Google Cloud Document AI"""
    client = documentai.DocumentProcessorServiceClient()
    name = client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
    
    with open(file_path, "rb") as f:
        raw_document = documentai.RawDocument(
            content=f.read(), 
            mime_type="application/pdf"
        )
    
    request = documentai.ProcessRequest(name=name, raw_document=raw_document)
    result = client.process_document(request=request)
    
    return result.document.text.strip()
