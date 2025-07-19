from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str
    confirm_password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def validate_confirm_password(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class RefreshToken(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('New password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('New password must contain at least one number')
        return v
    
    @field_validator('confirm_new_password')
    @classmethod
    def validate_confirm_new_password(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('New passwords do not match')
        return v


class UpdateProfile(BaseModel):
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    name: Optional[str] = None
    
    @field_validator('bio')
    @classmethod
    def validate_bio(cls, v):
        if v and len(v) > 500:
            raise ValueError('Bio must be less than 500 characters')
        return v
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if v and len(v) > 100:
            raise ValueError('Name must be less than 100 characters')
        return v
