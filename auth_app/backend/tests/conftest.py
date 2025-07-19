import pytest
import os
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app
from database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db, Base

# Test database configuration
TEST_DATABASE_URL = "sqlite:///./test_auth.db"
from main import app

# Test database configuration
TEST_DATABASE_URL = "sqlite:///./test_auth.db"

@pytest.fixture(scope="session")
def test_db():
    """Create test database engine and session."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield TestingSessionLocal
    
    # Clean up
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_auth.db"):
        os.remove("./test_auth.db")


@pytest.fixture(scope="function")
def db_session(test_db):
    """Create a database session for each test."""
    session = test_db()
    yield session
    session.close()


@pytest.fixture(scope="function")
def test_client(test_db):
    """Create test client with dependency override."""
    def override_get_db():
        try:
            db = test_db()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    
    # Ensure fresh database for each test
    with test_db() as db:
        # Clear all data but keep tables
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Test user data fixture."""
    return {
        "email": "test@example.com",
        "password": "testPassword123",
        "confirm_password": "testPassword123"
    }


@pytest.fixture
def test_user_data_2():
    """Second test user data fixture."""
    return {
        "email": "test2@example.com",
        "password": "testPassword456",
        "confirm_password": "testPassword456"
    }


@pytest.fixture
def registered_user(test_client, test_user_data):
    """Register a user and return user data."""
    response = test_client.post("/auth/register", json=test_user_data)
    assert response.status_code == 201
    return test_user_data


@pytest.fixture
def authenticated_user(test_client, registered_user):
    """Register and authenticate a user, return tokens."""
    login_data = {
        "username": registered_user["email"],
        "password": registered_user["password"]
    }
    response = test_client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    tokens = response.json()
    return {
        "user_data": registered_user,
        "tokens": tokens,
        "headers": {"Authorization": f"Bearer {tokens['access_token']}"}
    }


@pytest.fixture
def invalid_password_data():
    """Invalid password test data."""
    return [
        {
            "email": "test@example.com",
            "password": "short",  # Too short
            "confirm_password": "short"
        },
        {
            "email": "test@example.com",
            "password": "onlyletters",  # No numbers
            "confirm_password": "onlyletters"
        },
        {
            "email": "test@example.com",
            "password": "12345678",  # No letters
            "confirm_password": "12345678"
        }
    ]


@pytest.fixture
def password_mismatch_data():
    """Password mismatch test data."""
    return {
        "email": "test@example.com",
        "password": "testPassword123",
        "confirm_password": "differentPassword123"
    }
