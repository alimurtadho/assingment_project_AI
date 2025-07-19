"""
FastAPI dependencies for authentication and authorization.
Comprehensive implementation for testing scenarios.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from .database import get_db, User
from .auth import get_auth_service, get_token_manager, AuthenticationError
from . import schemas

# Security scheme for bearer token
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
    token_manager=Depends(get_token_manager),
    auth_service=Depends(get_auth_service)
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    This dependency is thoroughly tested for:
    - Token validation
    - Token expiration
    - User existence
    - Token malformation
    - Missing credentials
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify token
        token_data = token_manager.verify_token(credentials.credentials, token_type="access")
        
        # Get user from database
        user = auth_service.get_user_by_email(db, email=token_data.email)
        if user is None:
            raise credentials_exception
        
        return user
        
    except AuthenticationError:
        raise credentials_exception
    except Exception:
        raise credentials_exception


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get the current active user.
    
    Tested for:
    - User active status
    - Account deactivation scenarios
    - Proper error responses
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return current_user


async def get_current_verified_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get the current verified user (for future email verification feature).
    
    This dependency can be used for endpoints that require email verification.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
    token_manager=Depends(get_token_manager),
    auth_service=Depends(get_auth_service)
) -> Optional[User]:
    """
    Get the current user if authenticated, None otherwise.
    
    Useful for endpoints that work with both authenticated and anonymous users.
    """
    if not credentials:
        return None
    
    try:
        token_data = token_manager.verify_token(credentials.credentials, token_type="access")
        user = auth_service.get_user_by_email(db, email=token_data.email)
        
        if user and user.is_active:
            return user
        return None
        
    except Exception:
        return None


# Rate limiting dependency (for future implementation)
class RateLimiter:
    """Rate limiting utility for authentication endpoints."""
    
    def __init__(self, max_attempts: int = 5, window_minutes: int = 15):
        self.max_attempts = max_attempts
        self.window_minutes = window_minutes
        self._attempts = {}  # In production, use Redis or database
    
    def check_rate_limit(self, identifier: str) -> bool:
        """Check if identifier is within rate limits."""
        import time
        current_time = time.time()
        window_start = current_time - (self.window_minutes * 60)
        
        # Clean old attempts
        if identifier in self._attempts:
            self._attempts[identifier] = [
                attempt_time for attempt_time in self._attempts[identifier]
                if attempt_time > window_start
            ]
        
        # Check current attempts
        attempts = self._attempts.get(identifier, [])
        return len(attempts) < self.max_attempts
    
    def record_attempt(self, identifier: str):
        """Record an attempt for the identifier."""
        import time
        if identifier not in self._attempts:
            self._attempts[identifier] = []
        self._attempts[identifier].append(time.time())


# Global rate limiter instance
login_rate_limiter = RateLimiter(max_attempts=5, window_minutes=15)


async def check_login_rate_limit(
    request,
    rate_limiter: RateLimiter = Depends(lambda: login_rate_limiter)
):
    """
    Dependency to check login rate limiting.
    
    This can be added to login endpoints to prevent brute force attacks.
    """
    # Get client IP address
    client_ip = request.client.host
    
    if not rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    return rate_limiter


def require_permissions(permissions: list):
    """
    Dependency factory for role-based access control.
    
    This is a template for future permission-based access control.
    """
    def permission_checker(current_user: User = Depends(get_current_active_user)):
        # In a real system, check user permissions/roles
        # For now, all active users have all permissions
        return current_user
    
    return permission_checker


# Validation dependencies
async def validate_user_ownership(
    user_id: int,
    current_user: User = Depends(get_current_active_user)
) -> bool:
    """
    Validate that the current user owns the specified resource.
    
    Useful for endpoints that modify user-specific data.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: insufficient permissions"
        )
    return True


# Admin dependencies (for future admin features)
async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current user if they have admin privileges.
    
    Template for future admin functionality.
    """
    # In a real system, check if user has admin role
    # For now, assume no admin users
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required"
    )


# Database transaction dependency
class DatabaseTransaction:
    """Context manager for database transactions in dependencies."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def __enter__(self):
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.db.commit()
        else:
            self.db.rollback()


async def get_db_transaction(db: Session = Depends(get_db)) -> DatabaseTransaction:
    """
    Get database session wrapped in transaction context.
    
    Useful for endpoints that need transaction guarantees.
    """
    return DatabaseTransaction(db)
