import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "confirm_password": "testpassword123"
    }


def test_register_user(test_user):
    """Test user registration."""
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user["email"]
    assert "id" in data
    assert "created_at" in data


def test_register_duplicate_email(test_user):
    """Test registration with duplicate email."""
    # Register first user
    client.post("/auth/register", json=test_user)
    
    # Try to register with same email
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_invalid_password():
    """Test registration with invalid password."""
    user_data = {
        "email": "test2@example.com",
        "password": "short",
        "confirm_password": "short"
    }
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 422


def test_register_password_mismatch():
    """Test registration with password mismatch."""
    user_data = {
        "email": "test3@example.com",
        "password": "testpassword123",
        "confirm_password": "differentpassword123"
    }
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 422


def test_login_success(test_user):
    """Test successful login."""
    # Register user first
    client.post("/auth/register", json=test_user)
    
    # Login
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    """Test login with invalid credentials."""
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 401


def test_get_current_user(test_user):
    """Test getting current user profile."""
    # Register and login
    client.post("/auth/register", json=test_user)
    login_response = client.post("/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    token = login_response.json()["access_token"]
    
    # Get current user
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]


def test_get_current_user_invalid_token():
    """Test getting current user with invalid token."""
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 401


def test_refresh_token(test_user):
    """Test token refresh."""
    # Register and login
    client.post("/auth/register", json=test_user)
    login_response = client.post("/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh token
    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_logout():
    """Test logout endpoint."""
    response = client.post("/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
