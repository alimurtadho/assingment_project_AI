"""
Comprehensive integration tests for the Login feature.
Tests the complete login flow with extensive coverage scenarios.

This test file focuses on the PRIMARY ASSIGNMENT REQUIREMENT:
- Login feature with minimum 90% test coverage
- Comprehensive testing of authentication logic
- Error handling and edge cases
- Security scenarios
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

from src.auth import hash_password
from src.database import User


class TestLoginFeatureIntegration:
    """
    Integration tests for login feature - PRIMARY ASSIGNMENT FOCUS.
    
    This class tests the complete login workflow from API endpoint
    to database interactions with comprehensive coverage.
    """
    
    def test_login_success_complete_flow(self, client, db_session, sample_user_data):
        """Test successful login with complete flow validation."""
        # Create user in database
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        created_user = auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Attempt login
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        
        # Validate response
        assert response.status_code == 200
        data = response.json()
        
        # Validate token structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["expires_in"] > 0
        
        # Validate tokens are different
        assert data["access_token"] != data["refresh_token"]
        assert len(data["access_token"]) > 50
        assert len(data["refresh_token"]) > 50
        
        # Verify user's last_login was updated
        db_session.refresh(created_user)
        assert created_user.last_login is not None
        assert created_user.failed_login_attempts == 0
    
    def test_login_with_uppercase_email(self, client, db_session, sample_user_data):
        """Test login with uppercase email (case insensitive)."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Login with uppercase email
        login_data = {
            "username": sample_user_data["email"].upper(),
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_login_invalid_email_format(self, client):
        """Test login with invalid email format."""
        login_data = {
            "username": "invalid-email-format",
            "password": "SomePassword123"
        }
        response = client.post("/auth/login", data=login_data)
        
        # Should still process but fail authentication
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "SomePassword123"
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_wrong_password(self, client, db_session, sample_user_data):
        """Test login with wrong password."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        created_user = auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Login with wrong password
        login_data = {
            "username": sample_user_data["email"],
            "password": "WrongPassword123"
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
        
        # Verify failed attempt was recorded
        db_session.refresh(created_user)
        assert created_user.failed_login_attempts == 1
    
    def test_login_multiple_failed_attempts(self, client, db_session, sample_user_data):
        """Test multiple failed login attempts and account lockout."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        created_user = auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        login_data = {
            "username": sample_user_data["email"],
            "password": "WrongPassword123"
        }
        
        # Make multiple failed attempts
        max_attempts = 5
        for attempt in range(max_attempts):
            response = client.post("/auth/login", data=login_data)
            assert response.status_code == 401
            
            # Check failed attempts count
            db_session.refresh(created_user)
            assert created_user.failed_login_attempts == attempt + 1
        
        # Next attempt should result in account lockout
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 423  # HTTP 423 Locked
        assert "locked" in response.json()["detail"].lower()
        
        # Verify account is locked
        db_session.refresh(created_user)
        assert created_user.locked_until is not None
        assert created_user.is_locked() is True
    
    def test_login_locked_account_with_correct_password(self, client, db_session, sample_user_data):
        """Test login attempt on locked account even with correct password."""
        # Create and lock user account
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        created_user = auth_service.create_user(db_session, user_create)
        
        # Manually lock the account
        created_user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db_session.commit()
        
        # Try to login with correct password
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 423
        assert "locked" in response.json()["detail"].lower()
    
    def test_login_inactive_user(self, client, db_session, sample_user_data):
        """Test login with inactive user account."""
        # Create user and deactivate
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        created_user = auth_service.create_user(db_session, user_create)
        created_user.is_active = False
        db_session.commit()
        
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "disabled" in response.json()["detail"].lower()
    
    def test_login_successful_after_failed_attempts(self, client, db_session, sample_user_data):
        """Test successful login resets failed attempts counter."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        created_user = auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Make some failed attempts
        wrong_login_data = {
            "username": sample_user_data["email"],
            "password": "WrongPassword123"
        }
        
        for _ in range(3):
            response = client.post("/auth/login", data=wrong_login_data)
            assert response.status_code == 401
        
        # Verify failed attempts were recorded
        db_session.refresh(created_user)
        assert created_user.failed_login_attempts == 3
        
        # Now login successfully
        correct_login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=correct_login_data)
        
        assert response.status_code == 200
        
        # Verify failed attempts counter was reset
        db_session.refresh(created_user)
        assert created_user.failed_login_attempts == 0
        assert created_user.locked_until is None
        assert created_user.last_login is not None
    
    def test_login_empty_credentials(self, client):
        """Test login with empty credentials."""
        # Empty email
        response = client.post("/auth/login", data={
            "username": "",
            "password": "SomePassword123"
        })
        assert response.status_code == 422  # Validation error
        
        # Empty password
        response = client.post("/auth/login", data={
            "username": "test@example.com",
            "password": ""
        })
        assert response.status_code == 422  # Validation error
        
        # Both empty
        response = client.post("/auth/login", data={
            "username": "",
            "password": ""
        })
        assert response.status_code == 422  # Validation error
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        # Missing username
        response = client.post("/auth/login", data={
            "password": "SomePassword123"
        })
        assert response.status_code == 422
        
        # Missing password
        response = client.post("/auth/login", data={
            "username": "test@example.com"
        })
        assert response.status_code == 422
        
        # No data at all
        response = client.post("/auth/login", data={})
        assert response.status_code == 422
    
    def test_login_sql_injection_attempt(self, client):
        """Test login with SQL injection attempts."""
        sql_injection_attempts = [
            "test@example.com'; DROP TABLE users; --",
            "test@example.com' OR '1'='1",
            "test@example.com' UNION SELECT * FROM users --",
            "'; DELETE FROM users WHERE '1'='1",
        ]
        
        for injection_attempt in sql_injection_attempts:
            login_data = {
                "username": injection_attempt,
                "password": "SomePassword123"
            }
            response = client.post("/auth/login", data=login_data)
            
            # Should safely handle and return 401, not crash
            assert response.status_code in [401, 422]
            # Server should still be responding
            health_response = client.get("/health")
            assert health_response.status_code == 200
    
    def test_login_very_long_input(self, client):
        """Test login with extremely long input values."""
        long_email = "a" * 1000 + "@example.com"
        long_password = "b" * 1000
        
        login_data = {
            "username": long_email,
            "password": long_password
        }
        response = client.post("/auth/login", data=login_data)
        
        # Should handle gracefully
        assert response.status_code in [401, 422]
    
    def test_login_unicode_characters(self, client):
        """Test login with unicode characters."""
        unicode_email = "tëst@éxàmplê.com"
        unicode_password = "Pässwörd123!αβγ"
        
        login_data = {
            "username": unicode_email,
            "password": unicode_password
        }
        response = client.post("/auth/login", data=login_data)
        
        # Should handle unicode gracefully
        assert response.status_code in [401, 422]
    
    def test_login_special_characters_in_password(self, client, db_session):
        """Test login with special characters in password."""
        # Create user with special character password
        special_password = "P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?"
        
        user = User(
            email="special@example.com",
            hashed_password=hash_password(special_password),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "special@example.com",
            "password": special_password
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_login_concurrent_requests(self, client, db_session, sample_user_data):
        """Test concurrent login requests."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        
        # Simulate concurrent requests
        import threading
        import time
        
        results = []
        
        def make_login_request():
            response = client.post("/auth/login", data=login_data)
            results.append(response.status_code)
        
        # Create multiple threads
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_login_request)
            threads.append(thread)
        
        # Start all threads
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert all(status_code == 200 for status_code in results)
        assert len(results) == 5


class TestLoginTokenValidation:
    """Test login response token validation."""
    
    def test_access_token_structure(self, client, db_session, sample_user_data):
        """Test that access token has correct structure."""
        # Create and login user
        from src.auth import auth_service, token_manager
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Decode and validate access token
        access_token = data["access_token"]
        payload = token_manager.get_token_payload(access_token)
        
        assert payload["sub"] == sample_user_data["email"]
        assert payload["type"] == "access"
        assert "exp" in payload
        assert "iat" in payload
        assert "user_id" in payload
        
        # Verify expiration is reasonable
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        iat_time = datetime.utcfromtimestamp(payload["iat"])
        time_diff = exp_time - iat_time
        assert 25 <= time_diff.total_seconds() / 60 <= 35  # Around 30 minutes
    
    def test_refresh_token_structure(self, client, db_session, sample_user_data):
        """Test that refresh token has correct structure."""
        # Create and login user
        from src.auth import auth_service, token_manager
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Decode and validate refresh token
        refresh_token = data["refresh_token"]
        payload = token_manager.get_token_payload(refresh_token)
        
        assert payload["sub"] == sample_user_data["email"]
        assert payload["type"] == "refresh"
        assert "exp" in payload
        assert "iat" in payload
        
        # Verify expiration is reasonable (7 days)
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        iat_time = datetime.utcfromtimestamp(payload["iat"])
        time_diff = exp_time - iat_time
        assert 6.9 <= time_diff.days <= 7.1
    
    def test_tokens_are_unique(self, client, db_session, sample_user_data):
        """Test that each login generates unique tokens."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        
        # Login multiple times
        tokens = []
        for _ in range(3):
            response = client.post("/auth/login", data=login_data)
            assert response.status_code == 200
            data = response.json()
            tokens.append({
                "access": data["access_token"],
                "refresh": data["refresh_token"]
            })
            
            # Small delay to ensure different timestamps
            import time
            time.sleep(0.1)
        
        # Verify all tokens are unique
        access_tokens = [token["access"] for token in tokens]
        refresh_tokens = [token["refresh"] for token in tokens]
        
        assert len(set(access_tokens)) == 3  # All unique
        assert len(set(refresh_tokens)) == 3  # All unique
        
        # Verify access and refresh tokens are different from each other
        for token_pair in tokens:
            assert token_pair["access"] != token_pair["refresh"]


class TestLoginErrorHandling:
    """Test login error handling and edge cases."""
    
    def test_login_database_error_simulation(self, client, monkeypatch):
        """Test login behavior when database errors occur."""
        # Mock database session to raise an error
        def mock_get_db():
            raise Exception("Database connection failed")
        
        from src.main import app
        from src.database import get_db
        
        app.dependency_overrides[get_db] = mock_get_db
        
        login_data = {
            "username": "test@example.com",
            "password": "SomePassword123"
        }
        
        try:
            response = client.post("/auth/login", data=login_data)
            # Should handle database error gracefully
            assert response.status_code == 500
            assert "Login failed" in response.json()["detail"]
        finally:
            # Clean up override
            if get_db in app.dependency_overrides:
                del app.dependency_overrides[get_db]
    
    def test_login_password_verification_error(self, client, db_session, sample_user_data):
        """Test login when password verification fails with exception."""
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Mock password verification to raise exception
        with patch('src.auth.verify_password') as mock_verify:
            mock_verify.side_effect = Exception("Password verification error")
            
            login_data = {
                "username": sample_user_data["email"],
                "password": sample_user_data["password"]
            }
            response = client.post("/auth/login", data=login_data)
            
            # Should handle error gracefully
            assert response.status_code == 500
            assert "Login failed" in response.json()["detail"]


class TestLoginSecurityFeatures:
    """Test security features of the login endpoint."""
    
    def test_login_response_doesnt_leak_user_existence(self, client, db_session, sample_user_data):
        """Test that login response doesn't reveal if user exists."""
        # Create one user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Login with existing user but wrong password
        response1 = client.post("/auth/login", data={
            "username": sample_user_data["email"],
            "password": "WrongPassword123"
        })
        
        # Login with non-existing user
        response2 = client.post("/auth/login", data={
            "username": "nonexistent@example.com",
            "password": "SomePassword123"
        })
        
        # Both should return the same error message
        assert response1.status_code == 401
        assert response2.status_code == 401
        assert response1.json()["detail"] == response2.json()["detail"]
        assert "Incorrect email or password" in response1.json()["detail"]
    
    def test_login_timing_attack_protection(self, client, db_session, sample_user_data):
        """Test that login timing doesn't reveal user existence."""
        import time
        
        # Create user
        from src.auth import auth_service
        from src import schemas
        
        user_create = schemas.UserCreate(**sample_user_data)
        auth_service.create_user(db_session, user_create)
        db_session.commit()
        
        # Time login attempt with existing user
        start_time = time.time()
        response1 = client.post("/auth/login", data={
            "username": sample_user_data["email"],
            "password": "WrongPassword123"
        })
        existing_user_time = time.time() - start_time
        
        # Time login attempt with non-existing user
        start_time = time.time()
        response2 = client.post("/auth/login", data={
            "username": "nonexistent@example.com",
            "password": "SomePassword123"
        })
        nonexistent_user_time = time.time() - start_time
        
        # Both should fail
        assert response1.status_code == 401
        assert response2.status_code == 401
        
        # Time difference should be minimal (basic timing attack protection)
        time_difference = abs(existing_user_time - nonexistent_user_time)
        assert time_difference < 1.0  # Less than 1 second difference
    
    def test_login_password_not_logged_in_response(self, client):
        """Test that password is never included in any response."""
        login_data = {
            "username": "test@example.com",
            "password": "SomePassword123"
        }
        response = client.post("/auth/login", data=login_data)
        
        # Check that password doesn't appear anywhere in response
        response_text = response.text.lower()
        assert "somepassword123" not in response_text
        assert "password" not in response.json().get("detail", "").lower() or \
               "incorrect" in response.json().get("detail", "").lower()  # Except in error message
