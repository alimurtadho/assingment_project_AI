from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "postgresql://postgres:123qwe@localhost:5432/codeguardian_db"
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "codeguardian_db"
    database_user: str = "postgres"
    database_password: str = "123qwe"
    
    # Application Settings
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI/ML Configuration
    openai_api_key: Optional[str] = None
    langchain_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    
    # GitHub Integration
    github_token: Optional[str] = None
    github_copilot_api_key: Optional[str] = None
    github_copilot_model: str = "gpt-4"
    github_copilot_max_tokens: int = 4000
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # File Upload Settings
    max_upload_size: int = 52428800  # 50MB
    upload_dir: str = "./uploads"
    
    # Security Scanner Settings
    enable_bandit: bool = True
    enable_safety: bool = True
    enable_semgrep: bool = False
    
    # CORS Settings
    allowed_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    allowed_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: List[str] = ["*"]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    # Environment
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
