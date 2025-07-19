"""
Password utilities with comprehensive validation and security.
Designed for extensive testing and security compliance.
"""
import re
import hashlib
from typing import List, Dict, Any
from passlib.context import CryptContext
from .config import get_settings

settings = get_settings()

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordStrengthChecker:
    """
    Comprehensive password strength checker.
    Designed for thorough testing of password validation logic.
    """
    
    def __init__(self):
        self.settings = settings
    
    def check_length(self, password: str) -> Dict[str, Any]:
        """Check password length requirements."""
        result = {
            "valid": True,
            "errors": [],
            "score": 0
        }
        
        if len(password) < self.settings.min_password_length:
            result["valid"] = False
            result["errors"].append(f"Password must be at least {self.settings.min_password_length} characters long")
        elif len(password) >= self.settings.min_password_length:
            result["score"] += 1
            
        if len(password) > self.settings.max_password_length:
            result["valid"] = False
            result["errors"].append(f"Password must not exceed {self.settings.max_password_length} characters")
            
        # Bonus points for longer passwords
        if len(password) >= 12:
            result["score"] += 1
        if len(password) >= 16:
            result["score"] += 1
            
        return result
    
    def check_complexity(self, password: str) -> Dict[str, Any]:
        """Check password complexity requirements."""
        result = {
            "valid": True,
            "errors": [],
            "score": 0,
            "requirements_met": {}
        }
        
        # Check uppercase
        has_uppercase = bool(re.search(r'[A-Z]', password))
        result["requirements_met"]["uppercase"] = has_uppercase
        if self.settings.require_uppercase and not has_uppercase:
            result["valid"] = False
            result["errors"].append("Password must contain at least one uppercase letter")
        elif has_uppercase:
            result["score"] += 1
        
        # Check lowercase
        has_lowercase = bool(re.search(r'[a-z]', password))
        result["requirements_met"]["lowercase"] = has_lowercase
        if self.settings.require_lowercase and not has_lowercase:
            result["valid"] = False
            result["errors"].append("Password must contain at least one lowercase letter")
        elif has_lowercase:
            result["score"] += 1
        
        # Check numbers
        has_numbers = bool(re.search(r'[0-9]', password))
        result["requirements_met"]["numbers"] = has_numbers
        if self.settings.require_numbers and not has_numbers:
            result["valid"] = False
            result["errors"].append("Password must contain at least one number")
        elif has_numbers:
            result["score"] += 1
        
        # Check special characters
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        result["requirements_met"]["special_chars"] = has_special
        if self.settings.require_special_chars and not has_special:
            result["valid"] = False
            result["errors"].append("Password must contain at least one special character")
        elif has_special:
            result["score"] += 1
        
        return result
    
    def check_common_patterns(self, password: str) -> Dict[str, Any]:
        """Check for common weak password patterns."""
        result = {
            "valid": True,
            "errors": [],
            "score": 0,
            "patterns_found": []
        }
        
        password_lower = password.lower()
        
        # Common weak passwords
        common_passwords = [
            '123456', 'password', 'qwerty', 'abc123', 'letmein',
            'welcome', 'monkey', '1234567890', 'admin', 'guest',
            '123456789', 'password123', 'qwerty123'
        ]
        
        for common in common_passwords:
            if common in password_lower:
                result["valid"] = False
                result["errors"].append(f"Password contains common weak pattern: {common}")
                result["patterns_found"].append(common)
        
        # Sequential patterns
        sequences = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde']
        for seq in sequences:
            if seq in password_lower:
                result["patterns_found"].append(f"sequence_{seq}")
                if len(seq) >= 3:  # Only penalize longer sequences
                    result["score"] -= 1
        
        # Repetitive patterns
        if re.search(r'(.)\1{2,}', password):  # Same character repeated 3+ times
            result["patterns_found"].append("repetitive_chars")
            result["score"] -= 1
        
        # Keyboard patterns
        keyboard_patterns = ['qwerty', 'asdf', 'zxcv', '1234', '4321']
        for pattern in keyboard_patterns:
            if pattern in password_lower:
                result["patterns_found"].append(f"keyboard_{pattern}")
                result["score"] -= 1
        
        # Award points for no common patterns
        if not result["patterns_found"]:
            result["score"] += 2
        
        return result
    
    def calculate_entropy(self, password: str) -> float:
        """Calculate password entropy (information theory)."""
        if not password:
            return 0.0
        
        # Character set size estimation
        charset_size = 0
        if re.search(r'[a-z]', password):
            charset_size += 26
        if re.search(r'[A-Z]', password):
            charset_size += 26
        if re.search(r'[0-9]', password):
            charset_size += 10
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            charset_size += 32
        
        # Basic entropy calculation
        import math
        entropy = len(password) * math.log2(charset_size) if charset_size > 0 else 0
        
        # Adjust for patterns and repetition
        unique_chars = len(set(password))
        repetition_factor = unique_chars / len(password)
        
        return entropy * repetition_factor
    
    def get_strength_score(self, password: str) -> Dict[str, Any]:
        """Get comprehensive password strength score."""
        length_check = self.check_length(password)
        complexity_check = self.check_complexity(password)
        pattern_check = self.check_common_patterns(password)
        entropy = self.calculate_entropy(password)
        
        total_score = (
            length_check["score"] + 
            complexity_check["score"] + 
            pattern_check["score"]
        )
        
        # Normalize score to 0-100
        max_possible_score = 8  # Adjust based on scoring system
        normalized_score = min(100, max(0, (total_score / max_possible_score) * 100))
        
        # Determine strength level
        if normalized_score >= 80:
            strength = "very_strong"
        elif normalized_score >= 60:
            strength = "strong"
        elif normalized_score >= 40:
            strength = "medium"
        elif normalized_score >= 20:
            strength = "weak"
        else:
            strength = "very_weak"
        
        all_errors = (
            length_check["errors"] + 
            complexity_check["errors"] + 
            pattern_check["errors"]
        )
        
        is_valid = (
            length_check["valid"] and 
            complexity_check["valid"] and 
            pattern_check["valid"]
        )
        
        return {
            "valid": is_valid,
            "score": normalized_score,
            "strength": strength,
            "entropy": entropy,
            "errors": all_errors,
            "requirements_met": complexity_check["requirements_met"],
            "patterns_found": pattern_check["patterns_found"],
            "details": {
                "length": length_check,
                "complexity": complexity_check,
                "patterns": pattern_check
            }
        }


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength using the comprehensive checker."""
    checker = PasswordStrengthChecker()
    return checker.get_strength_score(password)


def is_password_breached(password: str) -> bool:
    """
    Check if password appears in known breaches using k-anonymity.
    Uses SHA-1 hash prefix to check against HaveIBeenPwned API.
    """
    # This is a simplified version for testing
    # In production, you'd make an API call to HaveIBeenPwned
    sha1_hash = hashlib.sha1(password.encode()).hexdigest().upper()
    
    # For testing purposes, simulate some "breached" passwords
    test_breached_hashes = {
        # "password"
        "5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8",
        # "123456"
        "7C4A8D09CA3762AF61E59520943DC26494F8941B",
    }
    
    return sha1_hash in test_breached_hashes
