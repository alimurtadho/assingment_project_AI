from sqlalchemy.orm import Session
from models import User, TodoList, Task
from schemas import UserCreate, TodoListCreate, TaskCreate, TodoListUpdate, TaskUpdate
from auth import get_password_hash, verify_password
from typing import Optional

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# TodoList CRUD operations
def get_lists(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(TodoList).filter(TodoList.owner_id == user_id).offset(skip).limit(limit).all()

def get_list(db: Session, list_id: int, user_id: int):
    return db.query(TodoList).filter(TodoList.id == list_id, TodoList.owner_id == user_id).first()

def create_list(db: Session, list_data: TodoListCreate, user_id: int):
    db_list = TodoList(**list_data.dict(), owner_id=user_id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

def update_list(db: Session, list_id: int, list_data: TodoListUpdate, user_id: int):
    db_list = db.query(TodoList).filter(TodoList.id == list_id, TodoList.owner_id == user_id).first()
    if db_list:
        update_data = list_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_list, key, value)
        db.commit()
        db.refresh(db_list)
    return db_list

def delete_list(db: Session, list_id: int, user_id: int):
    db_list = db.query(TodoList).filter(TodoList.id == list_id, TodoList.owner_id == user_id).first()
    if db_list:
        db.delete(db_list)
        db.commit()
        return True
    return False

# Task CRUD operations
def get_tasks_by_list(db: Session, list_id: int, user_id: int, skip: int = 0, limit: int = 100):
    # First verify the list belongs to the user
    list_exists = db.query(TodoList).filter(TodoList.id == list_id, TodoList.owner_id == user_id).first()
    if not list_exists:
        return []
    return db.query(Task).filter(Task.list_id == list_id).offset(skip).limit(limit).all()

def get_task(db: Session, task_id: int, user_id: int):
    return db.query(Task).join(TodoList).filter(
        Task.id == task_id, 
        TodoList.owner_id == user_id
    ).first()

def create_task(db: Session, task_data: TaskCreate, list_id: int, user_id: int):
    # First verify the list belongs to the user
    list_exists = db.query(TodoList).filter(TodoList.id == list_id, TodoList.owner_id == user_id).first()
    if not list_exists:
        return None
    
    db_task = Task(**task_data.dict(), list_id=list_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_data: TaskUpdate, user_id: int):
    db_task = db.query(Task).join(TodoList).filter(
        Task.id == task_id, 
        TodoList.owner_id == user_id
    ).first()
    
    if db_task:
        update_data = task_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int):
    db_task = db.query(Task).join(TodoList).filter(
        Task.id == task_id, 
        TodoList.owner_id == user_id
    ).first()
    
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False
