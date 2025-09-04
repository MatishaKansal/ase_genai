import logging
from typing import Optional
from google.cloud import documentai_v1 as documentai
from google.api_core import exceptions as google_exceptions

try:
    from ..config import PROJECT_ID, LOCATION, PROCESSOR_ID
except ImportError:
    from config import PROJECT_ID, LOCATION, PROCESSOR_ID

logger = logging.getLogger(__name__)

def extract_text_from_document(file_path: str) -> str:
    """
    Extract text from a document using Google Cloud Document AI
    
    Args:
        file_path: Path to the document file
        
    Returns:
        Extracted text from the document
        
    Raises:
        ValueError: If file_path is invalid
        RuntimeError: If OCR processing fails
    """
    if not file_path or not isinstance(file_path, str):
        raise ValueError("Invalid file path provided")
    
    try:
        logger.info(f"Starting OCR processing for file: {file_path}")
        
        # Initialize Document AI client
        client = documentai.DocumentProcessorServiceClient()
        name = client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
        
        # Read and process the document
        with open(file_path, "rb") as f:
            raw_document = documentai.RawDocument(
                content=f.read(), 
                mime_type="application/pdf"
            )
        
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)
        result = client.process_document(request=request)
        
        if not result.document or not result.document.text:
            raise RuntimeError("No text extracted from document")
        
        extracted_text = result.document.text.strip()
        logger.info(f"Successfully extracted {len(extracted_text)} characters from document")
        
        return extracted_text
        
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        raise RuntimeError(f"File not found: {file_path}")
    except google_exceptions.PermissionDenied:
        logger.error("Permission denied accessing Google Cloud Document AI")
        raise RuntimeError("Permission denied accessing Google Cloud Document AI. Check your credentials.")
    except google_exceptions.InvalidArgument as e:
        logger.error(f"Invalid argument error: {e}")
        raise RuntimeError(f"Invalid argument error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during OCR processing: {str(e)}")
        raise RuntimeError(f"OCR processing failed: {str(e)}")
