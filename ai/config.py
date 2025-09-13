import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Cloud settings
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")
# Legacy Vertex AI region setting (no longer required for Gemini/Embeddings via API key)
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
# Document AI uses multi-regions like "us" or "eu"
DOCAI_LOCATION = os.getenv("DOCAI_LOCATION", "us")
PROCESSOR_ID = os.getenv("DOCAI_PROCESSOR_ID", "your-docai-processor-id")
BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "your-gcs-bucket-name")

# AI models
# Default to the current recommended Gemini embeddings model if not provided in .env
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-004")

# Processing settings
# Allow overrides from .env; fall back to sensible defaults
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))