from google.cloud import documentai_v1 as documentai
from google.cloud import vision

# Support running as a package (ai.utils) or directly from the ai/ folder
try:  # package import
    from ..config import PROJECT_ID, DOCAI_LOCATION, PROCESSOR_ID
except ImportError:  # direct script import fallback
    from config import PROJECT_ID, DOCAI_LOCATION, PROCESSOR_ID

def extract_text_from_document(file_bytes: bytes) -> str:
    """Extract text from a PDF (helper kept for backwards compatibility)."""
    # Document AI is used primarily for PDFs and similar docs
    return extract_text_from_pdf(file_bytes)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF using Google Cloud Document AI (server-side OCR)."""
    client = documentai.DocumentProcessorServiceClient()
    name = client.processor_path(PROJECT_ID, DOCAI_LOCATION, PROCESSOR_ID)
    
    raw_document = documentai.RawDocument(
        content=file_bytes, 
        mime_type="application/pdf"
    )
    
    request = documentai.ProcessRequest(name=name, raw_document=raw_document)
    result = client.process_document(request=request)
    
    return result.document.text.strip()

def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from an image using Google Cloud Vision API (good for photos/scans)."""
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=file_bytes)
    
    # Use DOCUMENT_TEXT_DETECTION for dense text, like in a document image
    response = client.document_text_detection(image=image)  # type: ignore[attr-defined]
    
    return response.full_text_annotation.text.strip()
