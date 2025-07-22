/**
 * Token management utility
 * Handles JWT token storage, retrieval, and refresh
 */

import { AuthResponse } from '../types';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

class TokenManager {
  private refreshPromise: Promise<AuthResponse | null> | null = null;

  // Token storage operations with performance monitoring
  setTokens(tokens: AuthResponse): void {
    console.time('TokenManager-SetTokens');
    
    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      
      console.log('[TOKEN] Tokens stored successfully', {
        accessTokenLength: tokens.access_token.length,
        refreshTokenLength: tokens.refresh_token.length,
        tokenType: tokens.token_type,
      });
    } catch (error) {
      console.error('[TOKEN] Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    } finally {
      console.timeEnd('TokenManager-SetTokens');
    }
  }

  getAccessToken(): string | null {
    console.time('TokenManager-GetAccessToken');
    
    try {
      const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      console.timeEnd('TokenManager-GetAccessToken');
      
      if (token) {
        console.log('[TOKEN] Access token retrieved', {
          tokenLength: token.length,
          hasToken: !!token,
        });
      }
      
      return token;
    } catch (error) {
      console.error('[TOKEN] Failed to get access token:', error);
      console.timeEnd('TokenManager-GetAccessToken');
      return null;
    }
  }

  getRefreshToken(): string | null {
    console.time('TokenManager-GetRefreshToken');
    
    try {
      const token = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
      console.timeEnd('TokenManager-GetRefreshToken');
      
      if (token) {
        console.log('[TOKEN] Refresh token retrieved', {
          tokenLength: token.length,
          hasToken: !!token,
        });
      }
      
      return token;
    } catch (error) {
      console.error('[TOKEN] Failed to get refresh token:', error);
      console.timeEnd('TokenManager-GetRefreshToken');
      return null;
    }
  }

  clearTokens(): void {
    console.time('TokenManager-ClearTokens');
    
    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      
      console.log('[TOKEN] Tokens cleared successfully');
    } catch (error) {
      console.error('[TOKEN] Failed to clear tokens:', error);
    } finally {
      console.timeEnd('TokenManager-ClearTokens');
    }
  }

  // Check if access token exists and is valid format
  hasValidToken(): boolean {
    console.time('TokenManager-HasValidToken');
    
    const token = this.getAccessToken();
    const isValid = token !== null && token.length > 0;
    
    console.timeEnd('TokenManager-HasValidToken');
    
    console.log('[TOKEN] Token validation result:', {
      hasToken: !!token,
      isValid,
      tokenLength: token?.length || 0,
    });
    
    return isValid;
  }

  // Decode JWT token payload (without verification)
  decodeToken(token: string): any {
    console.time('TokenManager-DecodeToken');
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      console.timeEnd('TokenManager-DecodeToken');
      
      console.log('[TOKEN] Token decoded successfully:', {
        subject: payload.sub,
        expiration: payload.exp,
        issuedAt: payload.iat,
      });
      
      return payload;
    } catch (error) {
      console.error('[TOKEN] Failed to decode token:', error);
      console.timeEnd('TokenManager-DecodeToken');
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token?: string): boolean {
    console.time('TokenManager-IsTokenExpired');
    
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) {
      console.timeEnd('TokenManager-IsTokenExpired');
      return true;
    }

    try {
      const payload = this.decodeToken(tokenToCheck);
      if (!payload || !payload.exp) {
        console.timeEnd('TokenManager-IsTokenExpired');
        return true;
      }

      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      console.timeEnd('TokenManager-IsTokenExpired');
      
      console.log('[TOKEN] Token expiration check:', {
        currentTime,
        expiration: payload.exp,
        isExpired,
        timeUntilExpiry: isExpired ? 0 : payload.exp - currentTime,
      });
      
      return isExpired;
    } catch (error) {
      console.error('[TOKEN] Error checking token expiration:', error);
      console.timeEnd('TokenManager-IsTokenExpired');
      return true;
    }
  }

  // Refresh token with deduplication
  async refreshToken(): Promise<AuthResponse | null> {
    console.time('TokenManager-RefreshToken');
    
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      console.log('[TOKEN] Using existing refresh promise');
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.error('[TOKEN] No refresh token available');
      console.timeEnd('TokenManager-RefreshToken');
      return null;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      const result = await this.refreshPromise;
      console.timeEnd('TokenManager-RefreshToken');
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<AuthResponse | null> {
    console.time('TokenManager-PerformRefresh');
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
      }

      const tokens: AuthResponse = await response.json();
      this.setTokens(tokens);
      
      console.timeEnd('TokenManager-PerformRefresh');
      
      console.log('[TOKEN] Token refresh successful', {
        newAccessTokenLength: tokens.access_token.length,
        newRefreshTokenLength: tokens.refresh_token.length,
      });
      
      return tokens;
    } catch (error) {
      console.error('[TOKEN] Token refresh failed:', error);
      console.timeEnd('TokenManager-PerformRefresh');
      this.clearTokens();
      throw error;
    }
  }

  // Get token info for debugging
  getTokenInfo(): any {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpired: accessToken ? this.isTokenExpired(accessToken) : null,
      accessTokenPayload: accessToken ? this.decodeToken(accessToken) : null,
      refreshTokenPayload: refreshToken ? this.decodeToken(refreshToken) : null,
    };
  }
}

export const tokenManager = new TokenManager();
