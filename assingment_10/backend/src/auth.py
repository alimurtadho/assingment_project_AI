"""
Authentication utilities and JWT token management.
Comprehensive implementation for thorough testing.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from .config import get_settings
from .database import User
from .utils.password import verify_password, hash_password
from . import schemas

settings = get_settings()


class AuthenticationError(Exception):
    """Custom authentication error for better error handling."""
    pass


class TokenManager:
    """
    JWT token management with comprehensive functionality.
    Designed for extensive testing scenarios.
    """
    
    def __init__(self):
        self.settings = settings
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create an access token with optional custom expiration."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.settings.access_token_expire_minutes)
        
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.utcnow()
        })
        
        encoded_jwt = jwt.encode(to_encode, self.settings.secret_key, algorithm=self.settings.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a refresh token with optional custom expiration."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=self.settings.refresh_token_expire_days)
        
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "iat": datetime.utcnow()
        })
        
        encoded_jwt = jwt.encode(to_encode, self.settings.secret_key, algorithm=self.settings.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> schemas.TokenData:
        """Verify and decode a token with comprehensive error handling."""
        try:
            payload = jwt.decode(token, self.settings.secret_key, algorithms=[self.settings.algorithm])
            
            # Check token type
            token_type_claim = payload.get("type")
            if token_type_claim != token_type:
                raise AuthenticationError(f"Invalid token type. Expected {token_type}, got {token_type_claim}")
            
            # Extract user information
            email: str = payload.get("sub")
            user_id: int = payload.get("user_id")
            
            if email is None:
                raise AuthenticationError("Token missing user information")
            
            # Check expiration (jwt.decode already handles this, but explicit check for testing)
            exp = payload.get("exp")
            if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
                raise AuthenticationError("Token has expired")
            
            token_data = schemas.TokenData(email=email, user_id=user_id)
            return token_data
            
        except JWTError as e:
            raise AuthenticationError(f"Token validation failed: {str(e)}")
    
    def get_token_payload(self, token: str) -> Dict[str, Any]:
        """Get token payload without verification (for testing purposes)."""
        try:
            return jwt.decode(token, options={"verify_signature": False})
        except JWTError:
            return {}
    
    def is_token_expired(self, token: str) -> bool:
        """Check if token is expired without full verification."""
        try:
            payload = self.get_token_payload(token)
            exp = payload.get("exp")
            if exp:
                return datetime.utcfromtimestamp(exp) < datetime.utcnow()
            return True
        except Exception:
            return True


class AuthService:
    """
    Authentication service with comprehensive user management.
    Includes rate limiting, account locking, and security features.
    """
    
    def __init__(self):
        self.settings = settings
        self.token_manager = TokenManager()
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with comprehensive security checks.
        Includes rate limiting and account locking.
        """
        user = self.get_user_by_email(db, email)
        if not user:
            return None
        
        # Check if account is locked
        if user.is_locked():
            raise AuthenticationError("Account is temporarily locked due to too many failed attempts")
        
        # Check if account is active
        if not user.is_active:
            raise AuthenticationError("Account is disabled")
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            # Increment failed attempts
            user.failed_login_attempts += 1
            
            # Lock account if too many failures
            if user.failed_login_attempts >= self.settings.max_login_attempts:
                user.locked_until = datetime.utcnow() + timedelta(minutes=self.settings.lockout_duration_minutes)
            
            db.commit()
            return None
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email address."""
        return db.query(User).filter(User.email == email.lower()).first()
    
    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, db: Session, user_create: schemas.UserCreate) -> User:
        """
        Create a new user with comprehensive validation.
        """
        # Check if user already exists
        existing_user = self.get_user_by_email(db, user_create.email)
        if existing_user:
            raise AuthenticationError("Email already registered")
        
        # Hash password
        hashed_password = hash_password(user_create.password)
        
        # Create user
        db_user = User(
            email=user_create.email.lower(),
            hashed_password=hashed_password,
            first_name=user_create.first_name,
            last_name=user_create.last_name,
            bio=user_create.bio
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    def update_user(self, db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[User]:
        """Update user profile information."""
        user = self.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Update fields that are provided
        if user_update.first_name is not None:
            user.first_name = user_update.first_name
        if user_update.last_name is not None:
            user.last_name = user_update.last_name
        if user_update.bio is not None:
            user.bio = user_update.bio
        
        db.commit()
        db.refresh(user)
        
        return user
    
    def change_password(self, db: Session, user_id: int, password_change: schemas.PasswordChange) -> bool:
        """
        Change user password with comprehensive validation.
        """
        user = self.get_user_by_id(db, user_id)
        if not user:
            raise AuthenticationError("User not found")
        
        # Verify current password
        if not verify_password(password_change.current_password, user.hashed_password):
            raise AuthenticationError("Current password is incorrect")
        
        # Check if new password is different
        if verify_password(password_change.new_password, user.hashed_password):
            raise AuthenticationError("New password must be different from current password")
        
        # Hash new password
        new_hashed_password = hash_password(password_change.new_password)
        
        # Update password
        user.hashed_password = new_hashed_password
        db.commit()
        
        return True
    
    def create_token_pair(self, user: User) -> schemas.Token:
        """Create access and refresh token pair."""
        access_token = self.token_manager.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        refresh_token = self.token_manager.create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        return schemas.Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=self.settings.access_token_expire_minutes * 60
        )
    
    def refresh_token(self, db: Session, refresh_token: str) -> schemas.Token:
        """Refresh access token using refresh token."""
        try:
            token_data = self.token_manager.verify_token(refresh_token, token_type="refresh")
            user = self.get_user_by_email(db, token_data.email)
            
            if not user or not user.is_active:
                raise AuthenticationError("Invalid refresh token")
            
            return self.create_token_pair(user)
            
        except AuthenticationError:
            raise
        except Exception as e:
            raise AuthenticationError(f"Token refresh failed: {str(e)}")


# Global instances
auth_service = AuthService()
token_manager = TokenManager()


def get_auth_service() -> AuthService:
    """Dependency for getting auth service (useful for testing)."""
    return auth_service


def get_token_manager() -> TokenManager:
    """Dependency for getting token manager (useful for testing).""" 
    return token_manager
