from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# TodoList Schemas
class TodoListBase(BaseModel):
    title: str
    description: Optional[str] = None

class TodoListCreate(TodoListBase):
    pass

class TodoListUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class TodoList(TodoListBase):
    id: int
    created_at: datetime
    updated_at: datetime
    owner_id: int
    
    class Config:
        from_attributes = True

class TodoListWithTasks(TodoList):
    tasks: List["Task"] = []

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"  # low, medium, high
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    list_id: int
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Update forward references
TodoListWithTasks.model_rebuild()
