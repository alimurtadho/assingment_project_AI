from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

import models
import schemas
import crud
import auth
from database import get_db
from dependencies import get_current_user

# Create FastAPI app
app = FastAPI(
    title="To-Do List API",
    description="A comprehensive RESTful API for managing to-do lists and tasks with secure authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to To-Do List API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Authentication endpoints
@app.post("/auth/register", response_model=schemas.User, tags=["Authentication"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    return crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.Token, tags=["Authentication"])
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# List endpoints
@app.get("/lists", response_model=List[schemas.TodoList], tags=["Lists"])
def get_lists(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all lists for the current user."""
    lists = crud.get_lists(db, user_id=current_user.id, skip=skip, limit=limit)
    return lists

@app.post("/lists", response_model=schemas.TodoList, tags=["Lists"])
def create_list(
    list_data: schemas.TodoListCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new list for the current user."""
    return crud.create_list(db=db, list_data=list_data, user_id=current_user.id)

@app.get("/lists/{list_id}", response_model=schemas.TodoListWithTasks, tags=["Lists"])
def get_list(
    list_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific list with its tasks."""
    db_list = crud.get_list(db, list_id=list_id, user_id=current_user.id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    return db_list

@app.put("/lists/{list_id}", response_model=schemas.TodoList, tags=["Lists"])
def update_list(
    list_id: int,
    list_data: schemas.TodoListUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific list."""
    db_list = crud.update_list(db, list_id=list_id, list_data=list_data, user_id=current_user.id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    return db_list

@app.delete("/lists/{list_id}", tags=["Lists"])
def delete_list(
    list_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific list and all its tasks."""
    success = crud.delete_list(db, list_id=list_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="List not found")
    return {"message": "List deleted successfully"}

# Task endpoints
@app.get("/lists/{list_id}/tasks", response_model=List[schemas.Task], tags=["Tasks"])
def get_tasks(
    list_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks in a specific list."""
    tasks = crud.get_tasks_by_list(db, list_id=list_id, user_id=current_user.id, skip=skip, limit=limit)
    return tasks

@app.post("/lists/{list_id}/tasks", response_model=schemas.Task, tags=["Tasks"])
def create_task(
    list_id: int,
    task_data: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task in a specific list."""
    db_task = crud.create_task(db=db, task_data=task_data, list_id=list_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="List not found")
    return db_task

@app.get("/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def get_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task."""
    db_task = crud.get_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.put("/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific task."""
    db_task = crud.update_task(db, task_id=task_id, task_data=task_data, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.delete("/tasks/{task_id}", tags=["Tasks"])
def delete_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific task."""
    success = crud.delete_task(db, task_id=task_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
