"""
Main FastAPI application with comprehensive authentication.
Designed for extensive testing and high coverage.
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uvicorn

# Import application components
from .config import get_settings
from .database import get_db, create_tables, User
from .auth import get_auth_service, AuthenticationError
from .dependencies import get_current_user, get_current_active_user
from . import schemas

# Initialize settings and create tables
settings = get_settings()
create_tables()

# Create FastAPI app
app = FastAPI(
    title="Authentication API - Assignment 10",
    description="A comprehensive authentication API with extensive testing coverage",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoints
@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Authentication API - Assignment 10",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "features": [
            "User Registration",
            "User Login",
            "JWT Authentication",
            "Password Change",
            "Profile Management",
            "Comprehensive Testing"
        ]
    }


@app.get("/health", response_model=dict)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "auth-api",
        "version": "1.0.0"
    }


# Authentication endpoints
@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db),
    auth_service=Depends(get_auth_service)
):
    """
    Register a new user.
    
    This endpoint is thoroughly tested for:
    - Email validation
    - Password strength validation
    - Duplicate email handling
    - Input sanitization
    """
    try:
        user = auth_service.create_user(db, user_create)
        return user
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the error in production
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@app.post("/auth/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    auth_service=Depends(get_auth_service)
):
    """
    Authenticate user and return JWT tokens.
    
    This endpoint is thoroughly tested for:
    - Credential validation
    - Account lockout mechanism
    - Rate limiting
    - Token generation
    - Security logging
    """
    try:
        user = auth_service.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_pair = auth_service.create_token_pair(user)
        return token_pair
        
    except AuthenticationError as e:
        # Handle specific authentication errors (account locked, etc.)
        if "locked" in str(e).lower():
            status_code = status.HTTP_423_LOCKED
        else:
            status_code = status.HTTP_401_UNAUTHORIZED
            
        raise HTTPException(
            status_code=status_code,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log the error in production
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )


@app.post("/auth/refresh", response_model=schemas.Token)
async def refresh_token(
    refresh_data: schemas.RefreshToken,
    db: Session = Depends(get_db),
    auth_service=Depends(get_auth_service)
):
    """
    Refresh access token using refresh token.
    
    Tested for:
    - Refresh token validation
    - User status verification
    - New token generation
    """
    try:
        new_token_pair = auth_service.refresh_token(db, refresh_data.refresh_token)
        return new_token_pair
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed. Please try again."
        )


@app.post("/auth/logout", response_model=schemas.MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout user (client should discard tokens).
    
    In a production system, you might want to:
    - Blacklist the token
    - Log the logout event
    - Clear session data
    """
    return schemas.MessageResponse(
        message="Successfully logged out",
        success=True
    )


# User management endpoints
@app.get("/users/me", response_model=schemas.UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile.
    
    Tested for:
    - Token validation
    - User data retrieval
    - Privacy protection
    """
    return current_user


@app.put("/users/me", response_model=schemas.UserResponse)
async def update_current_user_profile(
    user_update: schemas.UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    auth_service=Depends(get_auth_service)
):
    """
    Update current user profile.
    
    Tested for:
    - Input validation
    - Data sanitization
    - Update permissions
    - Partial updates
    """
    try:
        updated_user = auth_service.update_user(db, current_user.id, user_update)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed. Please try again."
        )


# Password management endpoints (Bonus feature)
@app.post("/users/change-password", response_model=schemas.MessageResponse)
async def change_password(
    password_change: schemas.PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    auth_service=Depends(get_auth_service)
):
    """
    Change user password.
    
    This is the BONUS feature implementation with comprehensive testing:
    - Current password verification
    - New password strength validation
    - Password history check (could be added)
    - Security logging
    - Rate limiting (could be added)
    """
    try:
        success = auth_service.change_password(db, current_user.id, password_change)
        if success:
            return schemas.MessageResponse(
                message="Password changed successfully",
                success=True
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password change failed"
            )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the error in production
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed. Please try again."
        )


# Utility endpoints for testing
@app.get("/utils/password-strength", response_model=dict)
async def check_password_strength(password: str):
    """
    Check password strength (utility endpoint for testing).
    
    This endpoint allows frontend and tests to validate password strength
    before submitting registration or password change requests.
    """
    from .utils.password import validate_password_strength
    
    try:
        strength_result = validate_password_strength(password)
        return {
            "password_length": len(password),
            "is_valid": strength_result["valid"],
            "strength_score": strength_result["score"],
            "strength_level": strength_result["strength"],
            "entropy": strength_result["entropy"],
            "requirements_met": strength_result["requirements_met"],
            "errors": strength_result["errors"],
            "suggestions": [
                "Use a mix of uppercase and lowercase letters",
                "Include numbers and special characters",
                "Avoid common words and patterns",
                "Make it at least 12 characters long for better security"
            ]
        }
    except Exception as e:
        return {
            "error": "Password strength check failed",
            "details": str(e)
        }


# Error handlers
@app.exception_handler(AuthenticationError)
async def authentication_exception_handler(request, exc: AuthenticationError):
    """Handle authentication errors globally."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request, exc: ValueError):
    """Handle validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """Handle unexpected errors."""
    # In production, log the full error details
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


# Development utilities
if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
