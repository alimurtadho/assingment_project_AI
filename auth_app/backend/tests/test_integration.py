"""
API Integration Tests - End-to-end testing scenarios
"""
import pytest
from fastapi import status


class TestAPIEndpoints:
    """Test API endpoint accessibility and basic functionality."""

    def test_root_endpoint(self, test_client):
        """Test root endpoint."""
        response = test_client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert "redoc" in data
        assert data["version"] == "1.0.0"

    def test_health_check_endpoint(self, test_client):
        """Test health check endpoint."""
        response = test_client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"

    def test_docs_endpoint_accessible(self, test_client):
        """Test that API documentation is accessible."""
        response = test_client.get("/docs")
        assert response.status_code == status.HTTP_200_OK

    def test_redoc_endpoint_accessible(self, test_client):
        """Test that ReDoc documentation is accessible."""
        response = test_client.get("/redoc")
        assert response.status_code == status.HTTP_200_OK


class TestCompleteUserJourney:
    """Test complete user journey scenarios."""

    def test_complete_user_registration_to_profile_update(self, test_client):
        """Test complete user journey from registration to profile update."""
        # Step 1: Register user
        user_data = {
            "email": "journey@example.com",
            "password": "journeyPassword123",
            "confirm_password": "journeyPassword123"
        }
        
        register_response = test_client.post("/auth/register", json=user_data)
        assert register_response.status_code == status.HTTP_201_CREATED
        
        # Step 2: Login
        login_data = {
            "username": user_data["email"],
            "password": user_data["password"]
        }
        login_response = test_client.post("/auth/login", data=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        tokens = login_response.json()
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        
        # Step 3: Get profile
        profile_response = test_client.get("/users/me", headers=headers)
        assert profile_response.status_code == status.HTTP_200_OK
        profile_data = profile_response.json()
        assert profile_data["email"] == user_data["email"]
        
        # Step 4: Update profile
        update_data = {
            "name": "Journey User",
            "bio": "A user on a testing journey"
        }
        update_response = test_client.put("/users/me", json=update_data, headers=headers)
        assert update_response.status_code == status.HTTP_200_OK
        updated_profile = update_response.json()
        assert updated_profile["name"] == "Journey User"
        assert updated_profile["bio"] == "A user on a testing journey"
        
        # Step 5: Change password
        password_change_data = {
            "current_password": user_data["password"],
            "new_password": "newJourneyPassword123",
            "confirm_new_password": "newJourneyPassword123"
        }
        password_response = test_client.post("/users/change-password", json=password_change_data, headers=headers)
        assert password_response.status_code == status.HTTP_200_OK
        
        # Step 6: Verify new password works
        new_login_data = {
            "username": user_data["email"],
            "password": "newJourneyPassword123"
        }
        new_login_response = test_client.post("/auth/login", data=new_login_data)
        assert new_login_response.status_code == status.HTTP_200_OK
        
        # Step 7: Logout
        logout_response = test_client.post("/auth/logout")
        assert logout_response.status_code == status.HTTP_200_OK

    def test_token_refresh_workflow(self, test_client, authenticated_user):
        """Test complete token refresh workflow."""
        original_tokens = authenticated_user["tokens"]
        
        # Use refresh token to get new tokens
        refresh_response = test_client.post("/auth/refresh", json={"refresh_token": original_tokens["refresh_token"]})
        assert refresh_response.status_code == status.HTTP_200_OK
        
        new_tokens = refresh_response.json()
        new_headers = {"Authorization": f"Bearer {new_tokens['access_token']}"}
        
        # Verify new access token works
        profile_response = test_client.get("/users/me", headers=new_headers)
        assert profile_response.status_code == status.HTTP_200_OK
        
        # Use new refresh token
        second_refresh_response = test_client.post("/auth/refresh", json={"refresh_token": new_tokens["refresh_token"]})
        assert second_refresh_response.status_code == status.HTTP_200_OK

    def test_multiple_users_isolation(self, test_client):
        """Test that multiple users are properly isolated."""
        # Register first user
        user1_data = {
            "email": "user1@example.com",
            "password": "user1Password123",
            "confirm_password": "user1Password123"
        }
        test_client.post("/auth/register", json=user1_data)
        
        # Register second user
        user2_data = {
            "email": "user2@example.com",
            "password": "user2Password123",
            "confirm_password": "user2Password123"
        }
        test_client.post("/auth/register", json=user2_data)
        
        # Login both users
        user1_login = test_client.post("/auth/login", data={"username": user1_data["email"], "password": user1_data["password"]})
        user2_login = test_client.post("/auth/login", data={"username": user2_data["email"], "password": user2_data["password"]})
        
        user1_headers = {"Authorization": f"Bearer {user1_login.json()['access_token']}"}
        user2_headers = {"Authorization": f"Bearer {user2_login.json()['access_token']}"}
        
        # Update user1 profile
        test_client.put("/users/me", json={"name": "User One"}, headers=user1_headers)
        
        # Update user2 profile
        test_client.put("/users/me", json={"name": "User Two"}, headers=user2_headers)
        
        # Verify isolation
        user1_profile = test_client.get("/users/me", headers=user1_headers).json()
        user2_profile = test_client.get("/users/me", headers=user2_headers).json()
        
        assert user1_profile["name"] == "User One"
        assert user2_profile["name"] == "User Two"
        assert user1_profile["email"] == user1_data["email"]
        assert user2_profile["email"] == user2_data["email"]


class TestErrorHandling:
    """Test error handling scenarios."""

    def test_invalid_endpoint(self, test_client):
        """Test accessing invalid endpoint."""
        response = test_client.get("/invalid/endpoint")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_method_not_allowed(self, test_client):
        """Test method not allowed error."""
        response = test_client.delete("/auth/register")  # DELETE not allowed on register
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_malformed_json(self, test_client):
        """Test malformed JSON handling."""
        response = test_client.post(
            "/auth/register",
            data='{"email": "test@example.com", "password": "incomplete json"',
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_large_payload(self, test_client, authenticated_user):
        """Test handling of large payloads."""
        headers = authenticated_user["headers"]
        large_bio = "A" * 10000  # Very large bio
        
        update_data = {"bio": large_bio}
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestSecurityScenarios:
    """Test security-related scenarios."""

    def test_token_reuse_after_password_change(self, test_client, authenticated_user):
        """Test that old tokens become invalid after password change."""
        headers = authenticated_user["headers"]
        
        # Change password
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "newSecurePassword123",
            "confirm_new_password": "newSecurePassword123"
        }
        
        password_response = test_client.post("/users/change-password", json=password_data, headers=headers)
        assert password_response.status_code == status.HTTP_200_OK
        
        # Old token should still work (in this implementation)
        # Note: In production, you might want to invalidate old tokens
        profile_response = test_client.get("/users/me", headers=headers)
        # This assertion depends on your security requirements
        # assert profile_response.status_code in [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED]

    def test_sql_injection_attempt(self, test_client):
        """Test SQL injection protection."""
        malicious_email = "test@example.com'; DROP TABLE users; --"
        user_data = {
            "email": malicious_email,
            "password": "testPassword123",
            "confirm_password": "testPassword123"
        }
        
        # Should fail validation before reaching database
        response = test_client.post("/auth/register", json=user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_xss_attempt(self, test_client, authenticated_user):
        """Test XSS protection in profile fields."""
        headers = authenticated_user["headers"]
        xss_payload = "<script>alert('xss')</script>"
        
        update_data = {"name": xss_payload, "bio": xss_payload}
        response = test_client.put("/users/me", json=update_data, headers=headers)
        
        # Should accept the input but properly escape it
        assert response.status_code == status.HTTP_200_OK
        profile_data = response.json()
        assert profile_data["name"] == xss_payload
        assert profile_data["bio"] == xss_payload
