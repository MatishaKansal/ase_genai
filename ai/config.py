import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for AI application"""
    
    # Google Cloud project settings
    PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")
    LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")  # Changed to supported region
    PROCESSOR_ID: str = os.getenv("DOCAI_PROCESSOR_ID", "your-docai-processor-id")
    
    # Vertex AI
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "textembedding-gecko@latest")
    
    # Gemini
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    
    # Paths
    VECTOR_STORE_PATH: str = os.getenv("VECTOR_STORE_PATH", "vector_store/faiss_index")
    
    # Processing settings
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
    ANOMALY_THRESHOLD: float = float(os.getenv("ANOMALY_THRESHOLD", "0.3"))
    
    @classmethod
    def validate(cls) -> bool:
        """Validate required configuration"""
        required_vars = [
            "GCP_PROJECT_ID",
            "DOCAI_PROCESSOR_ID", 
            "GEMINI_API_KEY"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"Warning: Missing required environment variables: {missing_vars}")
            print("Please set these in your .env file or environment")
            return False
        
        return True
    
    @classmethod
    def print_config(cls):
        """Print current configuration (without sensitive data)"""
        print("Current Configuration:")
        print(f"  Project ID: {cls.PROJECT_ID}")
        print(f"  Location: {cls.LOCATION}")
        print(f"  Processor ID: {cls.PROCESSOR_ID}")
        print(f"  Embedding Model: {cls.EMBEDDING_MODEL}")
        print(f"  Vector Store Path: {cls.VECTOR_STORE_PATH}")
        print(f"  Max File Size: {cls.MAX_FILE_SIZE_MB}MB")
        print(f"  Chunk Size: {cls.CHUNK_SIZE}")
        print(f"  Anomaly Threshold: {cls.ANOMALY_THRESHOLD}")
        print(f"  Gemini API Key: {'Set' if cls.GEMINI_API_KEY else 'Not Set'}")

# Initialize Gemini if API key is available
if Config.GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=Config.GEMINI_API_KEY)

# Export configuration
PROJECT_ID = Config.PROJECT_ID
LOCATION = Config.LOCATION
PROCESSOR_ID = Config.PROCESSOR_ID
EMBEDDING_MODEL = Config.EMBEDDING_MODEL
GEMINI_API_KEY = Config.GEMINI_API_KEY
VECTOR_STORE_PATH = Config.VECTOR_STORE_PATH
MAX_FILE_SIZE_MB = Config.MAX_FILE_SIZE_MB
CHUNK_SIZE = Config.CHUNK_SIZE
ANOMALY_THRESHOLD = Config.ANOMALY_THRESHOLD

# Validate configuration on import
if __name__ == "__main__":
    Config.validate()
    Config.print_config()
