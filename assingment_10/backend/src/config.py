"""
Configuration settings for the application.
Designed with testability in mind.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Security settings
    secret_key: str = "test-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Database settings
    database_url: str = "sqlite:///./test_app.db"
    
    # CORS settings
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Password settings
    min_password_length: int = 8
    max_password_length: int = 128
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = False
    
    # Rate limiting
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Dependency for getting settings (useful for testing)."""
    return settings
