/**
 * Main API module - Centralized API exports with performance monitoring
 * This replaces the old monolithic api.ts file
 */

// Core HTTP client
export { httpClient } from './http-client';

// Services
export { authService } from './auth';
export { userService } from './users';

// Utilities
export { performanceMonitor } from './performance';
export { tokenManager } from './token-manager';
export { errorHandler } from './error-handler';

// Legacy compatibility - maintain backward compatibility
import { authService } from './auth';
import { userService } from './users';
import { httpClient } from './http-client';
import { performanceMonitor } from './performance';
import { tokenManager } from './token-manager';
import { errorHandler } from './error-handler';

/**
 * Legacy API object for backward compatibility
 * @deprecated Use individual services instead
 */
export const authAPI = {
  async login(data: import('../types').LoginData) {
    console.time('Legacy-API-Login');
    console.warn('[DEPRECATED] Using legacy authAPI.login, consider using authService.login');
    try {
      const result = await authService.login(data);
      console.timeEnd('Legacy-API-Login');
      return result;
    } catch (error) {
      console.timeEnd('Legacy-API-Login');
      throw error;
    }
  },

  async register(data: import('../types').RegisterData) {
    console.time('Legacy-API-Register');
    console.warn('[DEPRECATED] Using legacy authAPI.register, consider using authService.register');
    try {
      const result = await authService.register(data);
      console.timeEnd('Legacy-API-Register');
      return result;
    } catch (error) {
      console.timeEnd('Legacy-API-Register');
      throw error;
    }
  },

  async getCurrentUser() {
    console.time('Legacy-API-GetCurrentUser');
    console.warn('[DEPRECATED] Using legacy authAPI.getCurrentUser, consider using userService.getCurrentUser');
    try {
      const result = await userService.getCurrentUser();
      console.timeEnd('Legacy-API-GetCurrentUser');
      return result;
    } catch (error) {
      console.timeEnd('Legacy-API-GetCurrentUser');
      throw error;
    }
  },

  async logout() {
    console.time('Legacy-API-Logout');
    console.warn('[DEPRECATED] Using legacy authAPI.logout, consider using authService.logout');
    try {
      await authService.logout();
      console.timeEnd('Legacy-API-Logout');
    } catch (error) {
      console.timeEnd('Legacy-API-Logout');
      throw error;
    }
  },

  async refreshToken(refreshToken: string) {
    console.time('Legacy-API-RefreshToken');
    console.warn('[DEPRECATED] Using legacy authAPI.refreshToken, consider using authService.refreshAuth');
    try {
      const result = await authService.refreshAuth();
      console.timeEnd('Legacy-API-RefreshToken');
      return result;
    } catch (error) {
      console.timeEnd('Legacy-API-RefreshToken');
      throw error;
    }
  },
};

// Default export for backward compatibility
export default httpClient;

// Performance monitoring utility for debugging
export const apiDebug = {
  getPerformanceMetrics() {
    console.time('API-Debug-GetMetrics');
    
    const metrics = {
      http: httpClient.getPerformanceMetrics(),
      auth: authService.getAuthInfo(),
      user: userService.getCacheInfo(),
      errors: errorHandler.getErrorStats(),
    };
    
    console.timeEnd('API-Debug-GetMetrics');
    console.log('[API DEBUG] Complete metrics:', metrics);
    
    return metrics;
  },

  clearAllCaches() {
    console.time('API-Debug-ClearCaches');
    
    userService.invalidateCache();
    authService.clearLoginAttempts();
    performanceMonitor.clearHistory();
    errorHandler.clearHistory();
    
    console.timeEnd('API-Debug-ClearCaches');
    console.log('[API DEBUG] All caches cleared');
  },

  exportPerformanceData() {
    console.time('API-Debug-ExportData');
    
    const data = performanceMonitor.exportMetrics();
    
    console.timeEnd('API-Debug-ExportData');
    console.log('[API DEBUG] Performance data exported');
    
    return data;
  },

  logSystemHealth() {
    console.time('API-Debug-SystemHealth');
    
    const health = {
      hasValidToken: tokenManager.hasValidToken(),
      hasCriticalErrors: errorHandler.hasCriticalErrors(),
      cacheStatus: userService.getCacheInfo(),
      performanceMetrics: performanceMonitor.getMetrics(),
    };
    
    console.timeEnd('API-Debug-SystemHealth');
    console.log('[API DEBUG] System health check:', health);
    
    return health;
  },
};
