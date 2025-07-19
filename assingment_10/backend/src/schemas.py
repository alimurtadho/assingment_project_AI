"""
Pydantic schemas for request/response validation.
Comprehensive validation with detailed error messages for testing.
"""
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
import re
from .config import get_settings

settings = get_settings()


class UserBase(BaseModel):
    """Base user schema with email validation."""
    email: EmailStr
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        """Enhanced email validation for testing purposes."""
        if not v:
            raise ValueError('Email is required')
        if len(v) > 254:
            raise ValueError('Email too long')
        # Additional business rules can be tested here
        if v.lower().endswith('.test') and 'production' in str(settings.database_url):
            raise ValueError('Test emails not allowed in production')
        return v.lower()


class UserCreate(UserBase):
    """User creation schema with comprehensive password validation."""
    password: str
    confirm_password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Comprehensive password validation for testing."""
        if not v:
            raise ValueError('Password is required')
        
        if len(v) < settings.min_password_length:
            raise ValueError(f'Password must be at least {settings.min_password_length} characters long')
        
        if len(v) > settings.max_password_length:
            raise ValueError(f'Password must not exceed {settings.max_password_length} characters')
        
        # Check complexity requirements
        errors = []
        
        if settings.require_uppercase and not re.search(r'[A-Z]', v):
            errors.append('at least one uppercase letter')
        
        if settings.require_lowercase and not re.search(r'[a-z]', v):
            errors.append('at least one lowercase letter')
        
        if settings.require_numbers and not re.search(r'[0-9]', v):
            errors.append('at least one number')
        
        if settings.require_special_chars and not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            errors.append('at least one special character')
        
        if errors:
            raise ValueError(f'Password must contain {", ".join(errors)}')
        
        # Check for common weak patterns
        common_patterns = ['123456', 'password', 'qwerty', 'abc123']
        if any(pattern in v.lower() for pattern in common_patterns):
            raise ValueError('Password contains common weak patterns')
        
        return v
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate name fields."""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 100:
                raise ValueError('Name too long (max 100 characters)')
            if not re.match(r'^[a-zA-Z\s\-\'\.]+$', v):
                raise ValueError('Name contains invalid characters')
        return v
    
    @field_validator('bio')
    @classmethod
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        """Validate bio field."""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 500:
                raise ValueError('Bio too long (max 500 characters)')
        return v
    
    @model_validator(mode='after')
    def validate_password_confirmation(self) -> 'UserCreate':
        """Validate password confirmation matches."""
        if self.password != self.confirm_password:
            raise ValueError('Password confirmation does not match')
        return self


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str
    
    @field_validator('email', 'password')
    @classmethod
    def validate_required_fields(cls, v: str) -> str:
        """Ensure fields are not empty."""
        if not v or not v.strip():
            raise ValueError('This field is required')
        return v.strip() if isinstance(v, str) else v


class UserResponse(UserBase):
    """User response schema."""
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    failed_login_attempts: int
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or ""
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update schema."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate name fields."""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 100:
                raise ValueError('Name too long (max 100 characters)')
            if not re.match(r'^[a-zA-Z\s\-\'\.]+$', v):
                raise ValueError('Name contains invalid characters')
        return v
    
    @field_validator('bio')
    @classmethod
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        """Validate bio field."""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 500:
                raise ValueError('Bio too long (max 500 characters)')
        return v


class PasswordChange(BaseModel):
    """Password change schema with validation."""
    current_password: str
    new_password: str
    confirm_new_password: str
    
    @field_validator('current_password', 'new_password')
    @classmethod
    def validate_required_fields(cls, v: str) -> str:
        """Ensure password fields are not empty."""
        if not v or not v.strip():
            raise ValueError('This field is required')
        return v
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Apply same validation as user creation password."""
        if not v:
            raise ValueError('New password is required')
        
        if len(v) < settings.min_password_length:
            raise ValueError(f'Password must be at least {settings.min_password_length} characters long')
        
        if len(v) > settings.max_password_length:
            raise ValueError(f'Password must not exceed {settings.max_password_length} characters')
        
        # Check complexity requirements
        errors = []
        
        if settings.require_uppercase and not re.search(r'[A-Z]', v):
            errors.append('at least one uppercase letter')
        
        if settings.require_lowercase and not re.search(r'[a-z]', v):
            errors.append('at least one lowercase letter')
        
        if settings.require_numbers and not re.search(r'[0-9]', v):
            errors.append('at least one number')
        
        if settings.require_special_chars and not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            errors.append('at least one special character')
        
        if errors:
            raise ValueError(f'Password must contain {", ".join(errors)}')
        
        return v
    
    @model_validator(mode='after')
    def validate_password_change(self) -> 'PasswordChange':
        """Validate password change rules."""
        if self.new_password == self.current_password:
            raise ValueError('New password must be different from current password')
        
        if self.new_password != self.confirm_new_password:
            raise ValueError('New password confirmation does not match')
        
        return self


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token data for internal use."""
    email: Optional[str] = None
    user_id: Optional[int] = None


class RefreshToken(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class MessageResponse(BaseModel):
    """Generic message response schema."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None
    field_errors: Optional[dict] = None
