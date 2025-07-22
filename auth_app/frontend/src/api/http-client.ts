/**
 * Core HTTP client configuration and setup
 * Performance: Base setup with optimized defaults
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { performanceMonitor } from './performance';
import { tokenManager } from './token-manager';
import { errorHandler } from './error-handler';

class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.client = this.createClient();
    this.setupInterceptors();
  }

  private createClient(): AxiosInstance {
    console.time('HttpClient-Creation');
    
    const client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.timeEnd('HttpClient-Creation');
    return client;
  }

  private setupInterceptors(): void {
    console.time('HttpClient-Interceptors-Setup');

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const requestId = Math.random().toString(36).substr(2, 9);
        config.metadata = { 
          startTime: Date.now(),
          requestId,
          url: config.url 
        };
        
        // Add performance monitoring
        performanceMonitor.startRequest(requestId, config.url || 'unknown');
        
        // Add auth token
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          requestId,
          headers: config.headers,
        });

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const { config } = response;
        const duration = Date.now() - config.metadata.startTime;
        
        performanceMonitor.endRequest(
          config.metadata.requestId,
          response.status,
          duration
        );

        console.log(`[API Response] ${response.status} ${config.url}`, {
          requestId: config.metadata.requestId,
          duration: `${duration}ms`,
          status: response.status,
        });

        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (originalRequest?.metadata) {
          const duration = Date.now() - originalRequest.metadata.startTime;
          performanceMonitor.endRequest(
            originalRequest.metadata.requestId,
            error.response?.status || 0,
            duration,
            error.message
          );
        }

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            console.time('Token-Refresh');
            const newTokens = await tokenManager.refreshToken();
            console.timeEnd('Token-Refresh');
            
            if (newTokens) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('[Token Refresh Failed]', refreshError);
            tokenManager.clearTokens();
            window.location.href = '/login';
          }
        }

        return errorHandler.handleError(error);
      }
    );

    console.timeEnd('HttpClient-Interceptors-Setup');
  }

  // Generic HTTP methods with performance monitoring
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.time(`GET-${url}`);
    try {
      const response = await this.client.get<T>(url, config);
      console.timeEnd(`GET-${url}`);
      return response.data;
    } catch (error) {
      console.timeEnd(`GET-${url}`);
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.time(`POST-${url}`);
    try {
      const response = await this.client.post<T>(url, data, config);
      console.timeEnd(`POST-${url}`);
      return response.data;
    } catch (error) {
      console.timeEnd(`POST-${url}`);
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.time(`PUT-${url}`);
    try {
      const response = await this.client.put<T>(url, data, config);
      console.timeEnd(`PUT-${url}`);
      return response.data;
    } catch (error) {
      console.timeEnd(`PUT-${url}`);
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.time(`DELETE-${url}`);
    try {
      const response = await this.client.delete<T>(url, config);
      console.timeEnd(`DELETE-${url}`);
      return response.data;
    } catch (error) {
      console.timeEnd(`DELETE-${url}`);
      throw error;
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return performanceMonitor.getMetrics();
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
