/**
 * Error handling utility
 * Centralized error handling with performance monitoring
 */

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

class ErrorHandler {
  private errorHistory: ApiError[] = [];
  private readonly maxHistorySize = 100;

  handleError(error: any): Promise<never> {
    console.time('ErrorHandler-HandleError');
    
    const apiError = this.processError(error);
    this.logError(apiError);
    this.storeError(apiError);
    
    console.timeEnd('ErrorHandler-HandleError');
    
    return Promise.reject(apiError);
  }

  private processError(error: any): ApiError {
    console.time('ErrorHandler-ProcessError');
    
    const timestamp = new Date().toISOString();
    const requestId = error.config?.metadata?.requestId;
    
    let apiError: ApiError = {
      message: 'An unexpected error occurred',
      timestamp,
      requestId,
    };

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      apiError = {
        message: this.getErrorMessage(error.response),
        status: error.response.status,
        code: error.response.data?.code || `HTTP_${error.response.status}`,
        details: error.response.data,
        timestamp,
        requestId,
      };
    } else if (error.request) {
      // Request was made but no response received
      apiError = {
        message: 'Network error: No response from server',
        code: 'NETWORK_ERROR',
        details: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.code === 'ECONNABORTED',
        },
        timestamp,
        requestId,
      };
    } else if (error.message) {
      // Something else happened
      apiError = {
        message: error.message,
        code: 'CLIENT_ERROR',
        timestamp,
        requestId,
      };
    }

    console.timeEnd('ErrorHandler-ProcessError');
    return apiError;
  }

  private getErrorMessage(response: any): string {
    console.time('ErrorHandler-GetErrorMessage');
    
    let message = 'An error occurred';
    
    try {
      if (response.data?.detail) {
        message = response.data.detail;
      } else if (response.data?.message) {
        message = response.data.message;
      } else if (response.data?.error) {
        message = response.data.error;
      } else if (response.statusText) {
        message = response.statusText;
      }
      
      // Handle specific status codes
      switch (response.status) {
        case 400:
          message = response.data?.detail || 'Bad request';
          break;
        case 401:
          message = 'Authentication required';
          break;
        case 403:
          message = 'Access forbidden';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 422:
          message = this.formatValidationError(response.data);
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Internal server error';
          break;
        case 502:
          message = 'Bad gateway';
          break;
        case 503:
          message = 'Service unavailable';
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('[ERROR] Failed to parse error message:', error);
    } finally {
      console.timeEnd('ErrorHandler-GetErrorMessage');
    }
    
    return message;
  }

  private formatValidationError(data: any): string {
    console.time('ErrorHandler-FormatValidationError');
    
    try {
      if (data?.detail && Array.isArray(data.detail)) {
        const errors = data.detail.map((error: any) => {
          if (error.loc && error.msg) {
            const field = error.loc.join('.');
            return `${field}: ${error.msg}`;
          }
          return error.msg || error;
        });
        console.timeEnd('ErrorHandler-FormatValidationError');
        return errors.join(', ');
      }
      
      if (data?.detail) {
        console.timeEnd('ErrorHandler-FormatValidationError');
        return data.detail;
      }
    } catch (error) {
      console.error('[ERROR] Failed to format validation error:', error);
    }
    
    console.timeEnd('ErrorHandler-FormatValidationError');
    return 'Validation error';
  }

  private logError(error: ApiError): void {
    console.time('ErrorHandler-LogError');
    
    const logLevel = this.getLogLevel(error.status);
    const logMessage = `[API ${logLevel}] ${error.message}`;
    
    const logData = {
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      timestamp: error.timestamp,
      details: error.details,
    };

    switch (logLevel) {
      case 'ERROR':
        console.error(logMessage, logData);
        break;
      case 'WARN':
        console.warn(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
        break;
    }
    
    console.timeEnd('ErrorHandler-LogError');
  }

  private getLogLevel(status?: number): string {
    if (!status) return 'ERROR';
    
    if (status >= 500) return 'ERROR';
    if (status >= 400) return 'WARN';
    return 'INFO';
  }

  private storeError(error: ApiError): void {
    console.time('ErrorHandler-StoreError');
    
    this.errorHistory.push(error);
    
    // Limit history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
    
    console.timeEnd('ErrorHandler-StoreError');
  }

  // Get error statistics
  getErrorStats(): any {
    console.time('ErrorHandler-GetErrorStats');
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentErrors = this.errorHistory.filter(
      error => new Date(error.timestamp) > oneHourAgo
    );

    const errorsByStatus = this.errorHistory.reduce((acc, error) => {
      const status = error.status || 0;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const errorsByCode = this.errorHistory.reduce((acc, error) => {
      const code = error.code || 'UNKNOWN';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      errorsByStatus,
      errorsByCode,
      lastError: this.errorHistory[this.errorHistory.length - 1] || null,
    };
    
    console.timeEnd('ErrorHandler-GetErrorStats');
    
    console.log('[ERROR] Error statistics:', stats);
    
    return stats;
  }

  // Get recent errors
  getRecentErrors(count: number = 10): ApiError[] {
    return this.errorHistory.slice(-count);
  }

  // Clear error history
  clearHistory(): void {
    console.log('[ERROR] Clearing error history');
    this.errorHistory = [];
  }

  // Check if there are critical errors
  hasCriticalErrors(): boolean {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    return this.errorHistory.some(error => {
      const errorTime = new Date(error.timestamp);
      return errorTime > oneMinuteAgo && 
             error.status && 
             error.status >= 500;
    });
  }
}

export const errorHandler = new ErrorHandler();
