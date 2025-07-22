"""
Configuration settings for AI Document Assistant
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration class"""
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
    # Document Processing
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 200))
    
    # AI Model Parameters
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", 4000))
    TEMPERATURE = float(os.getenv("TEMPERATURE", 0.7))
    
    # File Paths
    VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
    DOCUMENTS_PATH = os.getenv("DOCUMENTS_PATH", "./data/documents")
    
    # Vector Store Settings
    SIMILARITY_THRESHOLD = 0.7
    TOP_K_RESULTS = 5
    
    # UI Settings
    APP_TITLE = "🤖 AI Document Assistant"
    APP_DESCRIPTION = "Tanya jawab cerdas dengan dokumen PDF menggunakan AI"
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        # Create directories if they don't exist
        os.makedirs(cls.VECTOR_DB_PATH, exist_ok=True)
        os.makedirs(cls.DOCUMENTS_PATH, exist_ok=True)
        
        return True
