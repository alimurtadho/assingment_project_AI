import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db
from models import Base
import os

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def authenticated_client(client, test_user):
    # Register user
    client.post("/auth/register", json=test_user)
    
    # Login to get token
    response = client.post(
        "/auth/login",
        data={"username": test_user["username"], "password": test_user["password"]}
    )
    token = response.json()["access_token"]
    
    # Return client with auth headers
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client

def test_register_user(client, test_user):
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user["username"]
    assert data["email"] == test_user["email"]
    assert "id" in data

def test_login_user(client, test_user):
    # First register
    client.post("/auth/register", json=test_user)
    
    # Then login
    response = client.post(
        "/auth/login",
        data={"username": test_user["username"], "password": test_user["password"]}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_create_list(authenticated_client):
    list_data = {
        "title": "Test List",
        "description": "A test to-do list"
    }
    response = authenticated_client.post("/lists", json=list_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == list_data["title"]
    assert data["description"] == list_data["description"]
    assert "id" in data

def test_get_lists(authenticated_client):
    # Create a list first
    list_data = {"title": "Test List", "description": "A test list"}
    authenticated_client.post("/lists", json=list_data)
    
    # Get all lists
    response = authenticated_client.get("/lists")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test List"

def test_create_task(authenticated_client):
    # Create a list first
    list_response = authenticated_client.post("/lists", json={"title": "Test List"})
    list_id = list_response.json()["id"]
    
    # Create a task
    task_data = {
        "title": "Test Task",
        "description": "A test task",
        "priority": "high"
    }
    response = authenticated_client.post(f"/lists/{list_id}/tasks", json=task_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["priority"] == task_data["priority"]
    assert data["completed"] == False

def test_unauthorized_access(client):
    response = client.get("/lists")
    assert response.status_code == 401
