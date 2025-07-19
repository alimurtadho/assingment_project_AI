"""
Comprehensive test suite for password utilities.
Tests all password validation logic with extensive coverage.
"""
import pytest
from unittest.mock import patch
from src.utils.password import (
    PasswordStrengthChecker,
    hash_password,
    verify_password,
    validate_password_strength,
    is_password_breached
)
from src.config import Settings


class TestPasswordStrengthChecker:
    """Test the PasswordStrengthChecker class comprehensively."""
    
    def setup_method(self):
        """Set up test environment."""
        self.checker = PasswordStrengthChecker()
    
    def test_check_length_valid_password(self):
        """Test length validation with valid passwords."""
        result = self.checker.check_length("ValidPass123")
        assert result["valid"] is True
        assert len(result["errors"]) == 0
        assert result["score"] >= 1
    
    def test_check_length_too_short(self):
        """Test length validation with too short password."""
        result = self.checker.check_length("123")
        assert result["valid"] is False
        assert "at least 8 characters" in result["errors"][0]
        assert result["score"] == 0
    
    def test_check_length_too_long(self):
        """Test length validation with too long password."""
        long_password = "a" * 129  # Exceeds max length
        result = self.checker.check_length(long_password)
        assert result["valid"] is False
        assert "must not exceed 128 characters" in result["errors"][0]
    
    def test_check_length_bonus_points(self):
        """Test bonus points for longer passwords."""
        # 12+ characters
        result12 = self.checker.check_length("ValidPass1234")
        # 16+ characters
        result16 = self.checker.check_length("ValidPass1234567")
        
        assert result16["score"] > result12["score"]
    
    def test_check_complexity_all_requirements_met(self):
        """Test complexity check when all requirements are met."""
        result = self.checker.check_complexity("ValidPass123!")
        assert result["valid"] is True
        assert result["requirements_met"]["uppercase"] is True
        assert result["requirements_met"]["lowercase"] is True
        assert result["requirements_met"]["numbers"] is True
        assert result["score"] >= 3  # Should get points for each requirement
    
    def test_check_complexity_missing_uppercase(self):
        """Test complexity check missing uppercase."""
        with patch.object(self.checker.settings, 'require_uppercase', True):
            result = self.checker.check_complexity("validpass123")
            assert result["valid"] is False
            assert "uppercase letter" in result["errors"][0]
            assert result["requirements_met"]["uppercase"] is False
    
    def test_check_complexity_missing_lowercase(self):
        """Test complexity check missing lowercase."""
        with patch.object(self.checker.settings, 'require_lowercase', True):
            result = self.checker.check_complexity("VALIDPASS123")
            assert result["valid"] is False
            assert "lowercase letter" in result["errors"][0]
            assert result["requirements_met"]["lowercase"] is False
    
    def test_check_complexity_missing_numbers(self):
        """Test complexity check missing numbers."""
        with patch.object(self.checker.settings, 'require_numbers', True):
            result = self.checker.check_complexity("ValidPassword")
            assert result["valid"] is False
            assert "one number" in result["errors"][0]
            assert result["requirements_met"]["numbers"] is False
    
    def test_check_complexity_missing_special_chars(self):
        """Test complexity check missing special characters."""
        with patch.object(self.checker.settings, 'require_special_chars', True):
            result = self.checker.check_complexity("ValidPass123")
            assert result["valid"] is False
            assert "special character" in result["errors"][0]
            assert result["requirements_met"]["special_chars"] is False
    
    def test_check_common_patterns_weak_passwords(self):
        """Test detection of common weak passwords."""
        weak_passwords = ["password123", "123456789", "qwerty123"]
        
        for weak_pass in weak_passwords:
            result = self.checker.check_common_patterns(weak_pass)
            assert result["valid"] is False
            assert len(result["patterns_found"]) > 0
            assert len(result["errors"]) > 0
    
    def test_check_common_patterns_sequential(self):
        """Test detection of sequential patterns."""
        result = self.checker.check_common_patterns("abc123def")
        assert "sequence_abc" in result["patterns_found"]
        assert "sequence_123" in result["patterns_found"]
    
    def test_check_common_patterns_repetitive(self):
        """Test detection of repetitive patterns."""
        result = self.checker.check_common_patterns("aaabbbccc")
        assert "repetitive_chars" in result["patterns_found"]
        assert result["score"] < 0  # Should penalize repetitive patterns
    
    def test_check_common_patterns_keyboard_patterns(self):
        """Test detection of keyboard patterns."""
        result = self.checker.check_common_patterns("qwertypassword")
        assert any("keyboard_" in pattern for pattern in result["patterns_found"])
    
    def test_check_common_patterns_clean_password(self):
        """Test with password that has no common patterns."""
        result = self.checker.check_common_patterns("Tr0ub4dor&3")
        assert result["valid"] is True
        assert len(result["patterns_found"]) == 0
        assert result["score"] > 0  # Should get bonus points
    
    def test_calculate_entropy_empty_password(self):
        """Test entropy calculation with empty password."""
        entropy = self.checker.calculate_entropy("")
        assert entropy == 0.0
    
    def test_calculate_entropy_simple_password(self):
        """Test entropy calculation with simple password."""
        entropy = self.checker.calculate_entropy("abc")
        assert entropy > 0
    
    def test_calculate_entropy_complex_password(self):
        """Test entropy calculation with complex password."""
        simple_entropy = self.checker.calculate_entropy("abc")
        complex_entropy = self.checker.calculate_entropy("Tr0ub4dor&3")
        assert complex_entropy > simple_entropy
    
    def test_get_strength_score_very_weak(self):
        """Test strength scoring for very weak password."""
        result = self.checker.get_strength_score("123")
        assert result["strength"] == "very_weak"
        assert result["score"] < 20
        assert result["valid"] is False
    
    def test_get_strength_score_weak(self):
        """Test strength scoring for weak password."""
        result = self.checker.get_strength_score("password")
        assert result["strength"] in ["very_weak", "weak"]
        assert result["valid"] is False
    
    def test_get_strength_score_medium(self):
        """Test strength scoring for medium password."""
        result = self.checker.get_strength_score("Password123")
        assert result["strength"] in ["medium", "strong"]
        assert result["score"] >= 20
    
    def test_get_strength_score_strong(self):
        """Test strength scoring for strong password."""
        result = self.checker.get_strength_score("StrongPass123!")
        assert result["strength"] in ["strong", "very_strong"]
        assert result["score"] >= 60
        assert result["valid"] is True
    
    def test_get_strength_score_very_strong(self):
        """Test strength scoring for very strong password."""
        result = self.checker.get_strength_score("Tr0ub4dor&3ExtraLong!")
        assert result["strength"] == "very_strong"
        assert result["score"] >= 80
        assert result["valid"] is True
    
    def test_get_strength_score_comprehensive_data(self):
        """Test that strength score returns comprehensive data."""
        result = self.checker.get_strength_score("TestPass123!")
        
        # Check all required fields are present
        assert "valid" in result
        assert "score" in result
        assert "strength" in result
        assert "entropy" in result
        assert "errors" in result
        assert "requirements_met" in result
        assert "patterns_found" in result
        assert "details" in result
        
        # Check details structure
        assert "length" in result["details"]
        assert "complexity" in result["details"]
        assert "patterns" in result["details"]


class TestPasswordHashing:
    """Test password hashing and verification functions."""
    
    def test_hash_password_returns_different_hash(self):
        """Test that same password returns different hashes."""
        password = "TestPassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2  # bcrypt should produce different salts
        assert hash1 != password  # Hash should not equal original
        assert len(hash1) > 50  # Reasonable hash length
    
    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "TestPassword123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "TestPassword123"
        wrong_password = "WrongPassword123"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_empty_password(self):
        """Test password verification with empty password."""
        hashed = hash_password("TestPassword123")
        
        assert verify_password("", hashed) is False
    
    def test_verify_password_invalid_hash(self):
        """Test password verification with invalid hash."""
        password = "TestPassword123"
        invalid_hash = "invalid_hash_string"
        
        assert verify_password(password, invalid_hash) is False
    
    def test_verify_password_none_values(self):
        """Test password verification with None values."""
        # This should not raise an exception
        result = verify_password(None, None)
        assert result is False


class TestPasswordValidation:
    """Test the main password validation function."""
    
    def test_validate_password_strength_integration(self):
        """Test the integrated password strength validation."""
        # Test with strong password
        strong_result = validate_password_strength("StrongPass123!")
        assert strong_result["valid"] is True
        assert strong_result["strength"] in ["strong", "very_strong"]
        
        # Test with weak password
        weak_result = validate_password_strength("weak")
        assert weak_result["valid"] is False
        assert weak_result["strength"] in ["very_weak", "weak"]
    
    def test_validate_password_strength_edge_cases(self):
        """Test password validation with edge cases."""
        # Empty password
        empty_result = validate_password_strength("")
        assert empty_result["valid"] is False
        assert empty_result["score"] == 0
        
        # Very long password
        long_password = "a" * 200
        long_result = validate_password_strength(long_password)
        assert long_result["valid"] is False


class TestPasswordBreach:
    """Test password breach detection."""
    
    def test_is_password_breached_known_password(self):
        """Test breach detection with known breached password."""
        # These are test cases that should be detected as breached
        assert is_password_breached("password") is True
        assert is_password_breached("123456") is True
    
    def test_is_password_breached_safe_password(self):
        """Test breach detection with safe password."""
        assert is_password_breached("Tr0ub4dor&3") is False
        assert is_password_breached("UniqueSecurePass123!") is False
    
    def test_is_password_breached_empty_password(self):
        """Test breach detection with empty password."""
        assert is_password_breached("") is False


# Parametrized tests for comprehensive coverage
class TestPasswordParametrized:
    """Parametrized tests for comprehensive coverage."""
    
    @pytest.mark.parametrize("password,expected_valid", [
        ("ValidPass123", True),
        ("short", False),
        ("nouppercase123", False),
        ("NOLOWERCASE123", False),
        ("NoNumbers", False),
        ("Tr0ub4dor&3", True),
        ("", False),
        ("a" * 129, False),
    ])
    def test_password_validation_parametrized(self, password, expected_valid):
        """Test password validation with various inputs."""
        result = validate_password_strength(password)
        assert result["valid"] == expected_valid
    
    @pytest.mark.parametrize("password", [
        "password123",
        "123456789",
        "qwerty",
        "abc123",
        "letmein",
        "welcome",
        "admin123"
    ])
    def test_common_weak_passwords(self, password):
        """Test that common weak passwords are detected."""
        checker = PasswordStrengthChecker()
        result = checker.check_common_patterns(password)
        assert result["valid"] is False
        assert len(result["patterns_found"]) > 0
    
    @pytest.mark.parametrize("complexity_setting,password,should_pass", [
        ("require_uppercase", "lowercase123", False),
        ("require_uppercase", "UPPERCASE123", True),
        ("require_lowercase", "UPPERCASE123", False),
        ("require_lowercase", "lowercase123", True),
        ("require_numbers", "NoNumbers", False),
        ("require_numbers", "WithNumbers123", True),
        ("require_special_chars", "NoSpecial123", False),
        ("require_special_chars", "WithSpecial123!", True),
    ])
    def test_complexity_requirements(self, complexity_setting, password, should_pass):
        """Test individual complexity requirements."""
        checker = PasswordStrengthChecker()
        
        # Mock the specific setting
        with patch.object(checker.settings, complexity_setting, True):
            result = checker.check_complexity(password)
            if should_pass:
                # Requirement should be met
                req_key = complexity_setting.replace("require_", "")
                if req_key == "special_chars":
                    req_key = "special_chars"
                assert result["requirements_met"].get(req_key, False) is True
            else:
                # Should have errors
                assert result["valid"] is False or len(result["errors"]) > 0


# Configuration-based tests
class TestPasswordWithDifferentConfigs:
    """Test password validation with different configuration settings."""
    
    def test_with_relaxed_requirements(self):
        """Test password validation with relaxed requirements."""
        checker = PasswordStrengthChecker()
        
        # Mock relaxed settings
        with patch.object(checker.settings, 'min_password_length', 4):
            with patch.object(checker.settings, 'require_uppercase', False):
                with patch.object(checker.settings, 'require_numbers', False):
                    result = checker.get_strength_score("simple")
                    # Should pass with relaxed requirements
                    assert result["valid"] is True
    
    def test_with_strict_requirements(self):
        """Test password validation with strict requirements."""
        checker = PasswordStrengthChecker()
        
        # Mock strict settings
        with patch.object(checker.settings, 'min_password_length', 12):
            with patch.object(checker.settings, 'require_special_chars', True):
                result = checker.get_strength_score("ValidPass123")
                # Should fail with strict requirements
                assert result["valid"] is False


# Performance and edge case tests
class TestPasswordEdgeCases:
    """Test password validation edge cases and performance."""
    
    def test_unicode_password(self):
        """Test password validation with unicode characters."""
        unicode_password = "Pássw0rd123!αβγ"
        result = validate_password_strength(unicode_password)
        # Should handle unicode gracefully
        assert isinstance(result, dict)
        assert "valid" in result
    
    def test_very_long_password_performance(self):
        """Test performance with very long passwords."""
        import time
        
        long_password = "a" * 1000
        start_time = time.time()
        result = validate_password_strength(long_password)
        end_time = time.time()
        
        # Should complete within reasonable time
        assert (end_time - start_time) < 1.0  # Less than 1 second
        assert isinstance(result, dict)
    
    def test_special_characters_comprehensive(self):
        """Test with comprehensive special character set."""
        special_chars = "!@#$%^&*(),.?\":{}|<>"
        for char in special_chars:
            password = f"ValidPass123{char}"
            result = validate_password_strength(password)
            # Should recognize the special character
            assert result["requirements_met"]["special_chars"] is True
