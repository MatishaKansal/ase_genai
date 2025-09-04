import os

# Google Cloud project settings
PROJECT_ID = "your-gcp-project-id"
LOCATION = "us"  # Document AI location
PROCESSOR_ID = "your-docai-processor-id"  # Document AI OCR processor

# Vertex AI
EMBEDDING_MODEL = "textembedding-gecko@latest"

# Gemini
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Paths
VECTOR_STORE_PATH = "vector_store/faiss_index"
