/**
 * Authentication API service - Modular auth operations
 * Performance: Optimized with request deduplication and caching
 */

import { httpClient } from './http-client';
import { tokenManager } from './token-manager';
import { AuthResponse, LoginData, RegisterData, User } from '../types';

interface LoginCache {
  email: string;
  timestamp: number;
  ttl: number;
}

class AuthService {
  private pendingLogin: Promise<AuthResponse> | null = null;
  private loginAttempts: Map<string, number> = new Map();
  private loginCache: LoginCache | null = null;
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  /**
   * Login with request deduplication and rate limiting
   */
  async login(data: LoginData): Promise<AuthResponse> {
    console.time('AuthService-Login');
    
    // Check rate limiting
    if (this.isRateLimited(data.email)) {
      const error = new Error('Too many login attempts. Please try again later.');
      console.timeEnd('AuthService-Login');
      throw error;
    }

    // Deduplicate concurrent login requests
    if (this.pendingLogin) {
      console.log('[AUTH] Using existing login request');
      return this.pendingLogin;
    }

    try {
      console.log('[AUTH] Starting login process', {
        email: data.email,
        hasPassword: !!data.password,
        attempts: this.loginAttempts.get(data.email) || 0,
      });

      this.pendingLogin = this.performLogin(data);
      const result = await this.pendingLogin;
      
      // Reset login attempts on success
      this.loginAttempts.delete(data.email);
      
      // Cache successful login
      this.cacheLogin(data.email);
      
      console.timeEnd('AuthService-Login');
      
      console.log('[AUTH] Login successful', {
        email: data.email,
        tokenType: result.token_type,
        hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
      });
      
      return result;
    } catch (error) {
      console.timeEnd('AuthService-Login');
      console.error('[AUTH] Login failed:', error);
      
      // Increment login attempts
      this.incrementLoginAttempts(data.email);
      
      throw error;
    } finally {
      this.pendingLogin = null;
    }
  }

  private async performLogin(data: LoginData): Promise<AuthResponse> {
    console.time('AuthService-PerformLogin');
    
    // Prepare form data for login
    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);

    try {
      const response = await httpClient.post<AuthResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Store tokens
      tokenManager.setTokens(response);
      
      console.timeEnd('AuthService-PerformLogin');
      return response;
    } catch (error) {
      console.timeEnd('AuthService-PerformLogin');
      throw error;
    }
  }

  /**
   * Register new user with validation
   */
  async register(data: RegisterData): Promise<User> {
    console.time('AuthService-Register');
    
    try {
      console.log('[AUTH] Starting registration process', {
        email: data.email,
        hasPassword: !!data.password,
        hasConfirmPassword: !!data.confirm_password,
        passwordsMatch: data.password === data.confirm_password,
      });

      // Validate registration data
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const user = await httpClient.post<User>('/auth/register', data);
      
      console.timeEnd('AuthService-Register');
      
      console.log('[AUTH] Registration successful', {
        userId: user.id,
        email: user.email,
        isActive: user.is_active,
      });
      
      return user;
    } catch (error) {
      console.timeEnd('AuthService-Register');
      console.error('[AUTH] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Logout with token cleanup
   */
  async logout(): Promise<void> {
    console.time('AuthService-Logout');
    
    try {
      console.log('[AUTH] Starting logout process');
      
      // Call logout endpoint (optional, for server-side cleanup)
      await httpClient.post('/auth/logout');
      
      console.log('[AUTH] Server logout successful');
    } catch (error) {
      console.warn('[AUTH] Server logout failed, proceeding with local cleanup:', error);
    } finally {
      // Always clear local tokens
      tokenManager.clearTokens();
      this.clearLoginCache();
      
      console.timeEnd('AuthService-Logout');
      console.log('[AUTH] Logout completed');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshAuth(): Promise<AuthResponse | null> {
    console.time('AuthService-RefreshAuth');
    
    try {
      console.log('[AUTH] Refreshing authentication');
      
      const tokens = await tokenManager.refreshToken();
      
      console.timeEnd('AuthService-RefreshAuth');
      
      if (tokens) {
        console.log('[AUTH] Token refresh successful');
      } else {
        console.log('[AUTH] Token refresh failed - no refresh token');
      }
      
      return tokens;
    } catch (error) {
      console.timeEnd('AuthService-RefreshAuth');
      console.error('[AUTH] Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    console.time('AuthService-CheckAuthStatus');
    
    try {
      // Check if we have valid tokens
      if (!tokenManager.hasValidToken()) {
        console.timeEnd('AuthService-CheckAuthStatus');
        return { isAuthenticated: false };
      }

      // Check if token is expired
      if (tokenManager.isTokenExpired()) {
        console.log('[AUTH] Token expired, attempting refresh');
        
        try {
          await this.refreshAuth();
        } catch (error) {
          console.log('[AUTH] Refresh failed, user not authenticated');
          console.timeEnd('AuthService-CheckAuthStatus');
          return { isAuthenticated: false };
        }
      }

      // Get current user to verify token validity
      const user = await httpClient.get<User>('/users/me');
      
      console.timeEnd('AuthService-CheckAuthStatus');
      
      console.log('[AUTH] Authentication status verified', {
        isAuthenticated: true,
        userId: user.id,
        email: user.email,
      });
      
      return { isAuthenticated: true, user };
    } catch (error) {
      console.timeEnd('AuthService-CheckAuthStatus');
      console.error('[AUTH] Auth status check failed:', error);
      
      // Clear invalid tokens
      tokenManager.clearTokens();
      return { isAuthenticated: false };
    }
  }

  // Validation methods
  private validateRegistrationData(data: RegisterData): { isValid: boolean; errors: string[] } {
    console.time('AuthService-ValidateRegistration');
    
    const errors: string[] = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Za-z]/.test(data.password)) {
      errors.push('Password must contain at least one letter');
    }
    if (!/[0-9]/.test(data.password)) {
      errors.push('Password must contain at least one number');
    }

    // Confirm password validation
    if (data.password !== data.confirm_password) {
      errors.push('Passwords do not match');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
    };

    console.timeEnd('AuthService-ValidateRegistration');
    
    console.log('[AUTH] Registration validation result', {
      isValid: result.isValid,
      errorCount: errors.length,
    });

    return result;
  }

  // Rate limiting methods
  private isRateLimited(email: string): boolean {
    const attempts = this.loginAttempts.get(email) || 0;
    return attempts >= this.maxLoginAttempts;
  }

  private incrementLoginAttempts(email: string): void {
    const attempts = this.loginAttempts.get(email) || 0;
    this.loginAttempts.set(email, attempts + 1);
    
    console.log('[AUTH] Login attempt recorded', {
      email,
      attempts: attempts + 1,
      maxAttempts: this.maxLoginAttempts,
    });

    // Set timeout to reset attempts
    if (attempts + 1 >= this.maxLoginAttempts) {
      setTimeout(() => {
        this.loginAttempts.delete(email);
        console.log('[AUTH] Login attempts reset for', email);
      }, this.lockoutDuration);
    }
  }

  // Login cache methods
  private cacheLogin(email: string): void {
    this.loginCache = {
      email,
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    };
    
    console.log('[AUTH] Login cached', { email });
  }

  private clearLoginCache(): void {
    this.loginCache = null;
    console.log('[AUTH] Login cache cleared');
  }

  // Public utility methods
  public getAuthInfo(): any {
    return {
      hasToken: tokenManager.hasValidToken(),
      tokenInfo: tokenManager.getTokenInfo(),
      loginAttempts: Object.fromEntries(this.loginAttempts),
      loginCache: this.loginCache,
    };
  }

  public clearLoginAttempts(): void {
    this.loginAttempts.clear();
    console.log('[AUTH] All login attempts cleared');
  }
}

export const authService = new AuthService();
