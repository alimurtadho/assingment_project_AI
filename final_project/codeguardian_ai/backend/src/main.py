from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import logging
import os
from contextlib import asynccontextmanager

from .database import get_database, check_database_connection, create_tables
from .config import settings
from .auth import get_current_user
from .models import User, Project, Analysis, SecurityScan

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting CodeGuardian AI Platform...")
    
    # Create upload directory
    os.makedirs(settings.upload_dir, exist_ok=True)
    
    # Try database connection but don't fail if it doesn't work
    try:
        if check_database_connection():
            create_tables()
            logger.info("Database connection and tables ready")
        else:
            logger.warning("Database not available, API will work without persistence")
    except Exception as e:
        logger.warning(f"Database setup warning: {e}")
        logger.info("Continuing without database - API endpoints will still work")
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CodeGuardian AI Platform...")


# Create FastAPI application
app = FastAPI(
    title="CodeGuardian AI",
    description="AI-Enhanced DevSecOps Platform for automated security scanning, code quality analysis, and intelligent testing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CodeGuardian AI Platform",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_database)):
    """Health check endpoint"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0",
            "environment": settings.environment
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )


# Include routers
from .routers import auth, projects, security, analysis

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(security.router, prefix="/api/security", tags=["Security Analysis"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Code Analysis"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
