"""
Test configuration and fixtures.
Provides common test setup and utilities.
"""
import pytest
import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

# Import application components
from src.database import Base, get_db, User
from src.config import Settings, get_settings
from src.auth import get_auth_service, get_token_manager


class TestSettings(Settings):
    """Test-specific settings."""
    secret_key: str = "test-secret-key-for-testing-only"
    database_url: str = "sqlite:///./test.db"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    min_password_length: int = 8
    max_password_length: int = 128
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = False
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15


@pytest.fixture(scope="session")
def test_settings():
    """Provide test settings."""
    return TestSettings()


@pytest.fixture(scope="session")
def test_engine(test_settings):
    """Create test database engine."""
    # Use in-memory SQLite for faster tests
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        echo=False
    )
    return engine


@pytest.fixture(scope="session")
def test_session_factory(test_engine):
    """Create test session factory."""
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    return TestingSessionLocal


@pytest.fixture
def db_session(test_session_factory):
    """Provide database session for tests."""
    session = test_session_factory()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def override_get_db(db_session):
    """Override database dependency for testing."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass
    return _override_get_db


@pytest.fixture
def override_get_settings(test_settings):
    """Override settings dependency for testing."""
    def _override_get_settings():
        return test_settings
    return _override_get_settings


@pytest.fixture
def app(override_get_db, override_get_settings):
    """Create FastAPI test app with overridden dependencies."""
    from src.main import app
    
    # Override dependencies
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = override_get_settings
    
    yield app
    
    # Clean up overrides
    app.dependency_overrides.clear()


@pytest.fixture
def client(app):
    """Provide test client."""
    return TestClient(app)


@pytest.fixture
def sample_user_data():
    """Provide sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "ValidPass123",
        "confirm_password": "ValidPass123",
        "first_name": "John",
        "last_name": "Doe",
        "bio": "Test user bio"
    }


@pytest.fixture
def sample_user(db_session, sample_user_data):
    """Create a sample user in the database."""
    from src.auth import auth_service
    from src import schemas
    
    user_create = schemas.UserCreate(**sample_user_data)
    user = auth_service.create_user(db_session, user_create)
    db_session.commit()
    return user


@pytest.fixture
def authenticated_user_tokens(sample_user):
    """Provide tokens for authenticated user."""
    from src.auth import auth_service
    
    token_pair = auth_service.create_token_pair(sample_user)
    return {
        "access_token": token_pair.access_token,
        "refresh_token": token_pair.refresh_token,
        "user": sample_user
    }


@pytest.fixture
def auth_headers(authenticated_user_tokens):
    """Provide authentication headers for requests."""
    return {
        "Authorization": f"Bearer {authenticated_user_tokens['access_token']}"
    }


@pytest.fixture
def mock_user():
    """Provide mock user for unit tests."""
    user = MagicMock(spec=User)
    user.id = 1
    user.email = "test@example.com"
    user.hashed_password = "$2b$12$hash"
    user.first_name = "John"
    user.last_name = "Doe"
    user.bio = "Test bio"
    user.is_active = True
    user.is_verified = False
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = None
    user.is_locked.return_value = False
    user.full_name = "John Doe"
    return user


@pytest.fixture
def password_test_cases():
    """Provide various password test cases."""
    return {
        "valid_passwords": [
            "ValidPass123",
            "StrongP@ss1",
            "Tr0ub4dor&3",
            "MySecure123!",
            "ComplexP@ssw0rd"
        ],
        "invalid_passwords": {
            "too_short": "123",
            "no_uppercase": "validpass123",
            "no_lowercase": "VALIDPASS123",
            "no_numbers": "ValidPassword",
            "too_long": "a" * 129,
            "common_pattern": "password123",
            "sequential": "abc123def",
            "repetitive": "aaabbbccc"
        }
    }


@pytest.fixture
def login_test_cases():
    """Provide login test scenarios."""
    return {
        "valid_login": {
            "email": "test@example.com",
            "password": "ValidPass123"
        },
        "invalid_email": {
            "email": "invalid-email",
            "password": "ValidPass123"
        },
        "empty_email": {
            "email": "",
            "password": "ValidPass123"
        },
        "empty_password": {
            "email": "test@example.com",
            "password": ""
        },
        "wrong_password": {
            "email": "test@example.com",
            "password": "WrongPassword123"
        },
        "nonexistent_user": {
            "email": "nonexistent@example.com",
            "password": "ValidPass123"
        }
    }


@pytest.fixture
def registration_test_cases():
    """Provide registration test scenarios."""
    return {
        "valid_registration": {
            "email": "newuser@example.com",
            "password": "ValidPass123",
            "confirm_password": "ValidPass123",
            "first_name": "Jane",
            "last_name": "Smith"
        },
        "password_mismatch": {
            "email": "newuser@example.com",
            "password": "ValidPass123",
            "confirm_password": "DifferentPass123"
        },
        "invalid_email": {
            "email": "invalid-email",
            "password": "ValidPass123",
            "confirm_password": "ValidPass123"
        },
        "weak_password": {
            "email": "newuser@example.com",
            "password": "weak",
            "confirm_password": "weak"
        },
        "duplicate_email": {
            "email": "test@example.com",  # Same as sample_user
            "password": "ValidPass123",
            "confirm_password": "ValidPass123"
        }
    }


@pytest.fixture
def change_password_test_cases():
    """Provide change password test scenarios."""
    return {
        "valid_change": {
            "current_password": "ValidPass123",
            "new_password": "NewValidPass456",
            "confirm_new_password": "NewValidPass456"
        },
        "wrong_current": {
            "current_password": "WrongPassword",
            "new_password": "NewValidPass456",
            "confirm_new_password": "NewValidPass456"
        },
        "same_password": {
            "current_password": "ValidPass123",
            "new_password": "ValidPass123",
            "confirm_new_password": "ValidPass123"
        },
        "password_mismatch": {
            "current_password": "ValidPass123",
            "new_password": "NewValidPass456",
            "confirm_new_password": "DifferentPass789"
        },
        "weak_new_password": {
            "current_password": "ValidPass123",
            "new_password": "weak",
            "confirm_new_password": "weak"
        }
    }


# Test utilities
class TestUtils:
    """Utility functions for testing."""
    
    @staticmethod
    def create_test_user(db_session, **kwargs):
        """Create a test user with custom attributes."""
        from src.auth import hash_password
        
        defaults = {
            "email": "testuser@example.com",
            "hashed_password": hash_password("ValidPass123"),
            "first_name": "Test",
            "last_name": "User",
            "is_active": True
        }
        defaults.update(kwargs)
        
        user = User(**defaults)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    
    @staticmethod
    def create_expired_token():
        """Create an expired token for testing."""
        from src.auth import token_manager
        from datetime import timedelta
        
        expired_delta = timedelta(seconds=-1)
        return token_manager.create_access_token(
            {"sub": "test@example.com", "user_id": 1},
            expires_delta=expired_delta
        )
    
    @staticmethod
    def assert_password_error(result, expected_error_substring):
        """Assert that password validation contains expected error."""
        assert result["valid"] is False
        assert any(expected_error_substring in error for error in result["errors"])
    
    @staticmethod
    def assert_api_error(response, status_code, error_substring=None):
        """Assert API response contains expected error."""
        assert response.status_code == status_code
        if error_substring:
            response_data = response.json()
            assert error_substring in response_data.get("detail", "")


@pytest.fixture
def test_utils():
    """Provide test utilities."""
    return TestUtils


# Markers for test organization
pytestmark = [
    pytest.mark.asyncio,  # Mark all tests as async-compatible
]


# Auto-use fixtures for common setup
@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch):
    """Set up test environment variables."""
    monkeypatch.setenv("TESTING", "true")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")


# Custom pytest hooks
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "auth: mark test as authentication-related"
    )
    config.addinivalue_line(
        "markers", "password: mark test as password-related"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow-running"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names."""
    for item in items:
        # Add markers based on test file names
        if "test_auth" in item.nodeid:
            item.add_marker(pytest.mark.auth)
        if "test_password" in item.nodeid:
            item.add_marker(pytest.mark.password)
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        
        # Mark slow tests
        if "slow" in item.name or "performance" in item.name:
            item.add_marker(pytest.mark.slow)
