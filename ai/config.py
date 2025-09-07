import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Cloud settings
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
PROCESSOR_ID = os.getenv("DOCAI_PROCESSOR_ID", "your-docai-processor-id")

# AI models
EMBEDDING_MODEL = "textembedding-gecko@latest"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Processing settings
CHUNK_SIZE = 500
ANOMALY_THRESHOLD = 0.3
