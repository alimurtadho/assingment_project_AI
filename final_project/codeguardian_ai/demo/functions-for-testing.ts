// Demo file 3: Functions that need comprehensive testing
// This file contains various functions that would benefit from automated test generation

interface DiscountConfig {
  minPercent: number;
  maxPercent: number;
}

class PriceCalculator {
  private config: DiscountConfig = { minPercent: 0, maxPercent: 100 };
  
  calculateDiscount(price: number, discountPercent: number): number {
    if (discountPercent < this.config.minPercent || discountPercent > this.config.maxPercent) {
      throw new Error("Invalid discount percentage");
    }
    
    if (price <= 0) {
      throw new Error("Price must be positive");
    }
    
    return price * (1 - discountPercent / 100);
  }
  
  calculateBulkDiscount(items: Array<{price: number, quantity: number}>): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  applyTierDiscount(totalAmount: number): number {
    if (totalAmount >= 1000) return totalAmount * 0.85; // 15% discount
    if (totalAmount >= 500) return totalAmount * 0.9;   // 10% discount
    if (totalAmount >= 100) return totalAmount * 0.95;  // 5% discount
    return totalAmount;
  }
}

class UserValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  static validateAge(age: number): boolean {
    return age >= 0 && age <= 150 && Number.isInteger(age);
  }
}

function fibonacci(n: number): number {
  if (n < 0) throw new Error("Input must be non-negative");
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error("Max retries exceeded");
}

export { PriceCalculator, UserValidator, fibonacci, isPalindrome, fetchWithRetry };
