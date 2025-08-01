/**
 * Enhanced API Configuration with improved error handling and retry logic
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Types for better TypeScript support
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  error?: {
    code: number;
    details?: any;
  };
}

export interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Extend Axios config to include custom properties
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  retryCount?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class ApiClient {
  private client: AxiosInstance;
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.timeout = 60000; // 60 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second

    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create axios instance with default configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        // Add authentication token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: Date.now() };

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params
        });

        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as ExtendedAxiosRequestConfig;
        const duration = config.metadata ? Date.now() - config.metadata.startTime : 0;
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url} - ${response.status} (${duration}ms)`);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as ExtendedAxiosRequestConfig;
        const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;
        console.error(`[API] ${config?.method?.toUpperCase()} ${config?.url} - ${error.response?.status} (${duration}ms)`, error);

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized();
        }

        // Retry logic for network errors
        if (this.shouldRetry(error) && error.config) {
          return this.retryRequest(error.config as ExtendedAxiosRequestConfig);
        }

        return Promise.reject(this.enhanceError(error));
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as ExtendedAxiosRequestConfig;
    if (!config || config.retry === false) {
      return false;
    }

    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'NETWORK_ERROR' ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  /**
   * Retry failed request with exponential backoff
   */
  private async retryRequest(config: ExtendedAxiosRequestConfig): Promise<AxiosResponse> {
    const retryAttempts = config.retryAttempts || this.maxRetries;
    const retryDelay = config.retryDelay || this.retryDelay;

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= retryAttempts) {
      throw new Error(`Max retry attempts (${retryAttempts}) exceeded`);
    }

    config.retryCount++;
    const delay = retryDelay * Math.pow(2, config.retryCount - 1); // Exponential backoff

    console.log(`[API] Retrying request (${config.retryCount}/${retryAttempts}) after ${delay}ms`);

    await this.delay(delay);
    return this.client(config);
  }

  /**
   * Handle unauthorized access
   */
  private handleUnauthorized(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Enhance error with additional information
   */
  private enhanceError(error: AxiosError): Error {
    const enhancedError = new Error();
    enhancedError.name = 'ApiError';
    
    // Safely access error response data
    const responseData = error.response?.data as any;
    enhancedError.message = responseData?.message || error.message || 'An error occurred';
    
    // Add additional properties
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).code = responseData?.error?.code;
    (enhancedError as any).details = responseData?.error?.details;
    (enhancedError as any).originalError = error;

    return enhancedError;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data to form
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const config: RequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100)
          };
          onProgress(progress);
        }
      }
    };

    const response = await this.client.post(url, formData, config);
    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles<T = any>(
    url: string,
    files: File[],
    additionalData?: Record<string, any>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    // Add additional data to form
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const config: RequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000, // 5 minutes for batch uploads
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100)
          };
          onProgress(progress);
        }
      }
    };

    const response = await this.client.post(url, formData, config);
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/health');
  }

  /**
   * Get service capabilities
   */
  async getCapabilities(service: string): Promise<ApiResponse> {
    return this.get(`/${service}/capabilities`);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience methods for specific API endpoints
export const securityApi = {
  scan: (file: File, options?: Record<string, any>, onProgress?: (progress: UploadProgress) => void) =>
    apiClient.uploadFile('/security/scan', file, options, onProgress),
  
  batchScan: (files: File[], options?: Record<string, any>, onProgress?: (progress: UploadProgress) => void) =>
    apiClient.uploadFiles('/security/batch-scan', files, options, onProgress),
  
  getPatterns: () =>
    apiClient.get('/security/patterns'),
  
  health: () =>
    apiClient.get('/security/health')
};

export const aiReviewApi = {
  analyze: (file: File, options?: Record<string, any>, onProgress?: (progress: UploadProgress) => void) =>
    apiClient.uploadFile('/ai-review/analyze', file, options, onProgress),
  
  batchAnalyze: (files: File[], options?: Record<string, any>, onProgress?: (progress: UploadProgress) => void) =>
    apiClient.uploadFiles('/ai-review/batch-analyze', files, options, onProgress),
  
  refactor: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/ai-review/refactor', file, options),
  
  securityAnalysis: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/ai-review/security-analysis', file, options),
  
  performanceAnalysis: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/ai-review/performance-analysis', file, options),
  
  capabilities: () =>
    apiClient.get('/ai-review/capabilities'),
  
  health: () =>
    apiClient.get('/ai-review/health')
};

export const testGenerationApi = {
  generate: (file: File, options?: Record<string, any>, onProgress?: (progress: UploadProgress) => void) =>
    apiClient.uploadFile('/test-generation/generate', file, options, onProgress),
  
  batchGenerate: (files: File[], options?: Record<string, any>, onProgress?: (progress: UploadProgress) => void) =>
    apiClient.uploadFiles('/test-generation/batch-generate', files, options, onProgress),
  
  unitTests: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/test-generation/unit-tests', file, options),
  
  integrationTests: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/test-generation/integration-tests', file, options),
  
  e2eTests: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/test-generation/e2e-tests', file, options),
  
  performanceTests: (file: File, options?: Record<string, any>) =>
    apiClient.uploadFile('/test-generation/performance-tests', file, options),
  
  frameworks: (language?: string) =>
    apiClient.get(`/test-generation/frameworks${language ? `?language=${language}` : ''}`),
  
  capabilities: () =>
    apiClient.get('/test-generation/capabilities'),
  
  health: () =>
    apiClient.get('/test-generation/health')
};

export default apiClient;
