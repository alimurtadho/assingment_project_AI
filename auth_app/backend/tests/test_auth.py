"""
Authentication Tests - Comprehensive test suite for authentication endpoints
"""
import pytest
from fastapi import status


class TestUserRegistration:
    """Test user registration functionality."""

    def test_register_user_success(self, test_client, test_user_data):
        """Test successful user registration."""
        response = test_client.post("/auth/register", json=test_user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert data["is_active"] is True
        assert "password" not in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, test_client, registered_user):
        """Test registration with duplicate email."""
        # Try to register with same email
        response = test_client.post("/auth/register", json=registered_user)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_email(self, test_client):
        """Test registration with invalid email format."""
        user_data = {
            "email": "invalid-email",
            "password": "testPassword123",
            "confirm_password": "testPassword123"
        }
        response = test_client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_password_too_short(self, test_client):
        """Test registration with password too short."""
        user_data = {
            "email": "test@example.com",
            "password": "short",
            "confirm_password": "short"
        }
        response = test_client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least 8 characters" in str(response.json())

    def test_register_password_no_letters(self, test_client):
        """Test registration with password containing no letters."""
        user_data = {
            "email": "test@example.com",
            "password": "12345678",
            "confirm_password": "12345678"
        }
        response = test_client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least one letter" in str(response.json())

    def test_register_password_no_numbers(self, test_client):
        """Test registration with password containing no numbers."""
        user_data = {
            "email": "test@example.com",
            "password": "onlyletters",
            "confirm_password": "onlyletters"
        }
        response = test_client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least one number" in str(response.json())

    def test_register_password_mismatch(self, test_client):
        """Test registration with password mismatch."""
        user_data = {
            "email": "test@example.com",
            "password": "testPassword123",
            "confirm_password": "differentPassword123"
        }
        response = test_client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "do not match" in str(response.json())

    def test_register_missing_required_fields(self, test_client):
        """Test registration with missing required fields."""
        incomplete_data = {"email": "test@example.com"}
        response = test_client.post("/auth/register", json=incomplete_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestUserLogin:
    """Test user login functionality."""

    def test_login_success(self, test_client, registered_user):
        """Test successful login."""
        login_data = {
            "username": registered_user["email"],
            "password": registered_user["password"]
        }
        response = test_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert isinstance(data["refresh_token"], str)
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

    def test_login_invalid_email(self, test_client):
        """Test login with non-existent email."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "somepassword123"
        }
        response = test_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_invalid_password(self, test_client, registered_user):
        """Test login with incorrect password."""
        login_data = {
            "username": registered_user["email"],
            "password": "wrongpassword123"
        }
        response = test_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_empty_credentials(self, test_client):
        """Test login with empty credentials."""
        login_data = {"username": "", "password": ""}
        response = test_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_missing_password(self, test_client):
        """Test login with missing password."""
        login_data = {"username": "test@example.com"}
        response = test_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestTokenRefresh:
    """Test token refresh functionality."""

    def test_refresh_token_success(self, test_client, authenticated_user):
        """Test successful token refresh."""
        refresh_token = authenticated_user["tokens"]["refresh_token"]
        response = test_client.post("/auth/refresh", json={"refresh_token": refresh_token})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        # New tokens should be different from original
        assert data["access_token"] != authenticated_user["tokens"]["access_token"]
        assert data["refresh_token"] != authenticated_user["tokens"]["refresh_token"]

    def test_refresh_token_invalid(self, test_client):
        """Test refresh with invalid token."""
        response = test_client.post("/auth/refresh", json={"refresh_token": "invalid_token"})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid refresh token" in response.json()["detail"]

    def test_refresh_token_empty(self, test_client):
        """Test refresh with empty token."""
        response = test_client.post("/auth/refresh", json={"refresh_token": ""})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token_missing(self, test_client):
        """Test refresh with missing token."""
        response = test_client.post("/auth/refresh", json={})
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLogout:
    """Test logout functionality."""

    def test_logout_success(self, test_client):
        """Test successful logout."""
        response = test_client.post("/auth/logout")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Successfully logged out"

    def test_logout_no_auth_required(self, test_client):
        """Test that logout doesn't require authentication."""
        # Should work even without authentication
        response = test_client.post("/auth/logout")
        
        assert response.status_code == status.HTTP_200_OK
