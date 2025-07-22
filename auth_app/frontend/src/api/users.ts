/**
 * User API service - Modular user management operations
 * Performance: Optimized with caching and batch operations
 */

import { httpClient } from './http-client';
import { User, UpdateProfileData, ChangePasswordData } from '../types';

interface UserCache {
  data: User | null;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class UserService {
  private cache: UserCache = {
    data: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000, // 5 minutes
  };

  /**
   * Get current user profile with caching
   */
  async getCurrentUser(forceRefresh: boolean = false): Promise<User> {
    console.time('UserService-GetCurrentUser');
    
    // Check cache first
    if (!forceRefresh && this.isCacheValid()) {
      console.timeEnd('UserService-GetCurrentUser');
      console.log('[USER] Using cached user data', {
        cacheAge: Date.now() - this.cache.timestamp,
        user: this.cache.data?.email,
      });
      return this.cache.data!;
    }

    try {
      console.log('[USER] Fetching user from API', { forceRefresh });
      
      const user = await httpClient.get<User>('/users/me');
      
      // Update cache
      this.updateCache(user);
      
      console.timeEnd('UserService-GetCurrentUser');
      
      console.log('[USER] User fetched successfully', {
        userId: user.id,
        email: user.email,
        isActive: user.is_active,
      });
      
      return user;
    } catch (error) {
      console.timeEnd('UserService-GetCurrentUser');
      console.error('[USER] Failed to fetch current user:', error);
      
      // Clear invalid cache on error
      this.clearCache();
      throw error;
    }
  }

  /**
   * Update user profile with optimistic updates
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    console.time('UserService-UpdateProfile');
    
    // Optimistic update
    const originalUser = this.cache.data;
    if (originalUser) {
      this.updateCache({ ...originalUser, ...data });
      console.log('[USER] Applied optimistic update', data);
    }

    try {
      console.log('[USER] Updating profile', {
        fields: Object.keys(data),
        hasName: !!data.name,
        hasEmail: !!data.email,
        hasBio: !!data.bio,
      });
      
      const updatedUser = await httpClient.put<User>('/users/me', data);
      
      // Update cache with server response
      this.updateCache(updatedUser);
      
      console.timeEnd('UserService-UpdateProfile');
      
      console.log('[USER] Profile updated successfully', {
        userId: updatedUser.id,
        updatedFields: Object.keys(data),
        updatedAt: updatedUser.updated_at,
      });
      
      return updatedUser;
    } catch (error) {
      console.timeEnd('UserService-UpdateProfile');
      console.error('[USER] Failed to update profile:', error);
      
      // Revert optimistic update on error
      if (originalUser) {
        this.updateCache(originalUser);
        console.log('[USER] Reverted optimistic update');
      }
      
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    console.time('UserService-ChangePassword');
    
    try {
      console.log('[USER] Changing password', {
        hasCurrentPassword: !!data.current_password,
        hasNewPassword: !!data.new_password,
        passwordsMatch: data.new_password === data.confirm_new_password,
      });
      
      const result = await httpClient.post<{ message: string }>('/users/change-password', data);
      
      console.timeEnd('UserService-ChangePassword');
      
      console.log('[USER] Password changed successfully', {
        message: result.message,
      });
      
      return result;
    } catch (error) {
      console.timeEnd('UserService-ChangePassword');
      console.error('[USER] Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Validate profile data before sending
   */
  validateProfileData(data: UpdateProfileData): { isValid: boolean; errors: string[] } {
    console.time('UserService-ValidateProfileData');
    
    const errors: string[] = [];

    // Name validation
    if (data.name !== undefined) {
      if (data.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (data.name.length > 100) {
        errors.push('Name must be less than 100 characters');
      }
    }

    // Bio validation
    if (data.bio !== undefined) {
      if (data.bio.length > 500) {
        errors.push('Bio must be less than 500 characters');
      }
    }

    // Email validation (basic)
    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    const result = {
      isValid: errors.length === 0,
      errors,
    };

    console.timeEnd('UserService-ValidateProfileData');
    
    console.log('[USER] Profile validation result', {
      isValid: result.isValid,
      errorCount: errors.length,
      fields: Object.keys(data),
    });

    return result;
  }

  /**
   * Validate password data before sending
   */
  validatePasswordData(data: ChangePasswordData): { isValid: boolean; errors: string[] } {
    console.time('UserService-ValidatePasswordData');
    
    const errors: string[] = [];

    // Current password validation
    if (!data.current_password) {
      errors.push('Current password is required');
    }

    // New password validation
    if (!data.new_password) {
      errors.push('New password is required');
    } else {
      if (data.new_password.length < 8) {
        errors.push('New password must be at least 8 characters long');
      }
      if (!/[A-Za-z]/.test(data.new_password)) {
        errors.push('New password must contain at least one letter');
      }
      if (!/[0-9]/.test(data.new_password)) {
        errors.push('New password must contain at least one number');
      }
    }

    // Confirm password validation
    if (data.new_password !== data.confirm_new_password) {
      errors.push('New passwords do not match');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
    };

    console.timeEnd('UserService-ValidatePasswordData');
    
    console.log('[USER] Password validation result', {
      isValid: result.isValid,
      errorCount: errors.length,
    });

    return result;
  }

  // Cache management methods
  private isCacheValid(): boolean {
    return (
      this.cache.data !== null &&
      Date.now() - this.cache.timestamp < this.cache.ttl
    );
  }

  private updateCache(user: User): void {
    console.time('UserService-UpdateCache');
    
    this.cache = {
      data: user,
      timestamp: Date.now(),
      ttl: this.cache.ttl,
    };
    
    console.timeEnd('UserService-UpdateCache');
    
    console.log('[USER] Cache updated', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(this.cache.timestamp).toISOString(),
    });
  }

  private clearCache(): void {
    console.time('UserService-ClearCache');
    
    this.cache = {
      data: null,
      timestamp: 0,
      ttl: this.cache.ttl,
    };
    
    console.timeEnd('UserService-ClearCache');
    console.log('[USER] Cache cleared');
  }

  // Public cache management
  public invalidateCache(): void {
    this.clearCache();
    console.log('[USER] Cache invalidated manually');
  }

  public getCacheInfo(): any {
    return {
      hasCache: this.cache.data !== null,
      cacheAge: this.cache.data ? Date.now() - this.cache.timestamp : 0,
      isValid: this.isCacheValid(),
      ttl: this.cache.ttl,
      user: this.cache.data ? {
        id: this.cache.data.id,
        email: this.cache.data.email,
      } : null,
    };
  }
}

export const userService = new UserService();
