"""
User Profile Tests - Comprehensive test suite for user profile management
"""
import pytest
from fastapi import status


class TestUserProfile:
    """Test user profile functionality."""

    def test_get_current_user_success(self, test_client, authenticated_user):
        """Test getting current user profile."""
        headers = authenticated_user["headers"]
        response = test_client.get("/users/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == authenticated_user["user_data"]["email"]
        assert "id" in data
        assert "is_active" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert "password" not in data
        assert "hashed_password" not in data

    def test_get_current_user_no_auth(self, test_client):
        """Test getting current user without authentication."""
        response = test_client.get("/users/me")
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_current_user_invalid_token(self, test_client):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = test_client.get("/users/me", headers=headers)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_malformed_header(self, test_client):
        """Test getting current user with malformed auth header."""
        headers = {"Authorization": "InvalidFormat token"}
        response = test_client.get("/users/me", headers=headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestUpdateProfile:
    """Test profile update functionality."""

    def test_update_profile_name_success(self, test_client, authenticated_user):
        """Test successful name update."""
        headers = authenticated_user["headers"]
        update_data = {"name": "John Doe"}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == authenticated_user["user_data"]["email"]

    def test_update_profile_bio_success(self, test_client, authenticated_user):
        """Test successful bio update."""
        headers = authenticated_user["headers"]
        update_data = {"bio": "Software developer passionate about testing"}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["bio"] == "Software developer passionate about testing"

    def test_update_profile_email_success(self, test_client, authenticated_user):
        """Test successful email update."""
        headers = authenticated_user["headers"]
        new_email = "newemail@example.com"
        update_data = {"email": new_email}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == new_email

    def test_update_profile_multiple_fields(self, test_client, authenticated_user):
        """Test updating multiple profile fields."""
        headers = authenticated_user["headers"]
        update_data = {
            "name": "Jane Smith",
            "bio": "QA Engineer specializing in automation",
            "email": "jane.smith@example.com"
        }
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Jane Smith"
        assert data["bio"] == "QA Engineer specializing in automation"
        assert data["email"] == "jane.smith@example.com"

    def test_update_profile_name_too_short(self, test_client, authenticated_user):
        """Test name validation - too short."""
        headers = authenticated_user["headers"]
        update_data = {"name": "A"}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least 2 characters" in str(response.json())

    def test_update_profile_name_too_long(self, test_client, authenticated_user):
        """Test name validation - too long."""
        headers = authenticated_user["headers"]
        update_data = {"name": "A" * 101}  # 101 characters
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "less than 100 characters" in str(response.json())

    def test_update_profile_bio_too_long(self, test_client, authenticated_user):
        """Test bio validation - too long."""
        headers = authenticated_user["headers"]
        update_data = {"bio": "A" * 501}  # 501 characters
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "less than 500 characters" in str(response.json())

    def test_update_profile_duplicate_email(self, test_client, authenticated_user, test_user_data_2):
        """Test email update with duplicate email."""
        # Register another user first
        test_client.post("/auth/register", json=test_user_data_2)
        
        headers = authenticated_user["headers"]
        update_data = {"email": test_user_data_2["email"]}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response.json()["detail"]

    def test_update_profile_invalid_email(self, test_client, authenticated_user):
        """Test email validation - invalid format."""
        headers = authenticated_user["headers"]
        update_data = {"email": "invalid-email-format"}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_update_profile_no_auth(self, test_client):
        """Test profile update without authentication."""
        update_data = {"name": "John Doe"}
        response = test_client.put("/users/me", json=update_data)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_profile_empty_data(self, test_client, authenticated_user):
        """Test profile update with empty data."""
        headers = authenticated_user["headers"]
        update_data = {}
        
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        # Should return unchanged profile
        data = response.json()
        assert data["email"] == authenticated_user["user_data"]["email"]


class TestChangePassword:
    """Test password change functionality."""

    def test_change_password_success(self, test_client, authenticated_user):
        """Test successful password change."""
        headers = authenticated_user["headers"]
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "newPassword123",
            "confirm_new_password": "newPassword123"
        }
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Password changed successfully"

    def test_change_password_verify_new_password_works(self, test_client, authenticated_user):
        """Test that new password works for login after change."""
        headers = authenticated_user["headers"]
        new_password = "newPassword123"
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": new_password,
            "confirm_new_password": new_password
        }
        
        # Change password
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Try to login with new password
        login_data = {
            "username": authenticated_user["user_data"]["email"],
            "password": new_password
        }
        login_response = test_client.post("/auth/login", data=login_data)
        assert login_response.status_code == status.HTTP_200_OK

    def test_change_password_wrong_current_password(self, test_client, authenticated_user):
        """Test password change with wrong current password."""
        headers = authenticated_user["headers"]
        password_data = {
            "current_password": "wrongCurrentPassword",
            "new_password": "newPassword123",
            "confirm_new_password": "newPassword123"
        }
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Current password is incorrect" in response.json()["detail"]

    def test_change_password_new_password_too_short(self, test_client, authenticated_user):
        """Test password change with new password too short."""
        headers = authenticated_user["headers"]
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "short",
            "confirm_new_password": "short"
        }
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least 8 characters" in str(response.json())

    def test_change_password_new_password_no_letters(self, test_client, authenticated_user):
        """Test password change with new password containing no letters."""
        headers = authenticated_user["headers"]
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "12345678",
            "confirm_new_password": "12345678"
        }
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least one letter" in str(response.json())

    def test_change_password_new_password_no_numbers(self, test_client, authenticated_user):
        """Test password change with new password containing no numbers."""
        headers = authenticated_user["headers"]
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "onlyletters",
            "confirm_new_password": "onlyletters"
        }
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "at least one number" in str(response.json())

    def test_change_password_mismatch(self, test_client, authenticated_user):
        """Test password change with new password mismatch."""
        headers = authenticated_user["headers"]
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "newPassword123",
            "confirm_new_password": "differentPassword123"
        }
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "do not match" in str(response.json())

    def test_change_password_no_auth(self, test_client):
        """Test password change without authentication."""
        password_data = {
            "current_password": "currentPassword123",
            "new_password": "newPassword123",
            "confirm_new_password": "newPassword123"
        }
        
        response = test_client.post("/users/change-password", json=password_data)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_change_password_missing_fields(self, test_client, authenticated_user):
        """Test password change with missing required fields."""
        headers = authenticated_user["headers"]
        password_data = {"current_password": "currentPassword123"}
        
        response = test_client.post("/users/change-password", json=password_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
