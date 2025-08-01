/**
 * Enhanced React Hooks for CodeGuardian AI
 * Provides improved state management and API integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, securityApi, aiReviewApi, testGenerationApi, UploadProgress, ApiResponse } from '../config/api.refactored';

// Types for hook states
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UploadState<T> extends AsyncState<T> {
  progress: UploadProgress;
  uploading: boolean;
}

export interface BatchUploadState<T> extends AsyncState<T[]> {
  progress: UploadProgress;
  uploading: boolean;
  completed: number;
  total: number;
  currentFile: string | null;
}

/**
 * Enhanced async state hook with better error handling
 */
export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>,
  {
    setData: (data: T) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: boolean) => void;
    reset: () => void;
  }
] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false
  });

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null, success: true }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false, success: false }));
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, success }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false
    });
  }, [initialData]);

  return [state, { setData, setLoading, setError, setSuccess, reset }];
}

/**
 * Enhanced file upload hook with progress tracking
 */
export function useFileUpload<T>() {
  const [state, setState] = useState<UploadState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
    uploading: false
  });

  const upload = useCallback(async (
    uploadFunction: (file: File, options?: any, onProgress?: (progress: UploadProgress) => void) => Promise<ApiResponse<T>>,
    file: File,
    options?: any
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      uploading: true,
      error: null,
      success: false,
      progress: { loaded: 0, total: 0, percentage: 0 }
    }));

    try {
      const response = await uploadFunction(file, options, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });

      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        uploading: false,
        success: true,
        error: null
      }));

      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        uploading: false,
        error: error.message || 'Upload failed',
        success: false
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      progress: { loaded: 0, total: 0, percentage: 0 },
      uploading: false
    });
  }, []);

  return { state, upload, reset };
}

/**
 * Batch file upload hook
 */
export function useBatchFileUpload<T>() {
  const [state, setState] = useState<BatchUploadState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
    uploading: false,
    completed: 0,
    total: 0,
    currentFile: null
  });

  const uploadBatch = useCallback(async (
    uploadFunction: (files: File[], options?: any, onProgress?: (progress: UploadProgress) => void) => Promise<ApiResponse<T[]>>,
    files: File[],
    options?: any
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      uploading: true,
      error: null,
      success: false,
      progress: { loaded: 0, total: 0, percentage: 0 },
      completed: 0,
      total: files.length,
      currentFile: files[0]?.name || null
    }));

    try {
      const response = await uploadFunction(files, options, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });

      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        uploading: false,
        success: true,
        error: null,
        completed: files.length
      }));

      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        uploading: false,
        error: error.message || 'Batch upload failed',
        success: false
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      progress: { loaded: 0, total: 0, percentage: 0 },
      uploading: false,
      completed: 0,
      total: 0,
      currentFile: null
    });
  }, []);

  return { state, uploadBatch, reset };
}

/**
 * Security scanning hook
 */
export function useSecurityScan() {
  const { state, upload, reset } = useFileUpload();

  const scanFile = useCallback(async (file: File, options?: {
    includeContext?: boolean;
    severity?: string;
    categories?: string[];
    language?: string;
    framework?: string;
  }) => {
    return upload(securityApi.scan, file, options);
  }, [upload]);

  return { state, scanFile, reset };
}

/**
 * Batch security scanning hook
 */
export function useBatchSecurityScan() {
  const { state, uploadBatch, reset } = useBatchFileUpload();

  const scanFiles = useCallback(async (files: File[], options?: {
    includeContext?: boolean;
    severity?: string;
    language?: string;
    framework?: string;
  }) => {
    return uploadBatch(securityApi.batchScan, files, options);
  }, [uploadBatch]);

  return { state, scanFiles, reset };
}

/**
 * AI code review hook
 */
export function useAIReview() {
  const { state, upload, reset } = useFileUpload();

  const reviewFile = useCallback(async (file: File, options?: {
    type?: 'codeReview' | 'refactoring' | 'security' | 'performance';
    language?: string;
    framework?: string;
    focus?: string[];
    includeRefactoring?: boolean;
    includeSecurity?: boolean;
    includePerformance?: boolean;
  }) => {
    const reviewOptions = {
      type: 'codeReview',
      ...options
    };

    switch (reviewOptions.type) {
      case 'refactoring':
        return upload(aiReviewApi.refactor, file, reviewOptions);
      case 'security':
        return upload(aiReviewApi.securityAnalysis, file, reviewOptions);
      case 'performance':
        return upload(aiReviewApi.performanceAnalysis, file, reviewOptions);
      default:
        return upload(aiReviewApi.analyze, file, reviewOptions);
    }
  }, [upload]);

  return { state, reviewFile, reset };
}

/**
 * Batch AI review hook
 */
export function useBatchAIReview() {
  const { state, uploadBatch, reset } = useBatchFileUpload();

  const reviewFiles = useCallback(async (files: File[], options?: {
    type?: 'codeReview' | 'refactoring' | 'security' | 'performance';
    language?: string;
    framework?: string;
    focus?: string[];
  }) => {
    return uploadBatch(aiReviewApi.batchAnalyze, files, options);
  }, [uploadBatch]);

  return { state, reviewFiles, reset };
}

/**
 * Test generation hook
 */
export function useTestGeneration() {
  const { state, upload, reset } = useFileUpload();

  const generateTests = useCallback(async (file: File, options?: {
    type?: 'unitTests' | 'integrationTests' | 'e2eTests' | 'performanceTests' | 'securityTests';
    language?: string;
    framework?: string;
    testFramework?: string;
    coverage?: string;
    includeEdgeCases?: boolean;
    includeMocking?: boolean;
    includeIntegration?: boolean;
    includePerformance?: boolean;
  }) => {
    const testOptions = {
      type: 'unitTests',
      ...options
    };

    switch (testOptions.type) {
      case 'unitTests':
        return upload(testGenerationApi.unitTests, file, testOptions);
      case 'integrationTests':
        return upload(testGenerationApi.integrationTests, file, testOptions);
      case 'e2eTests':
        return upload(testGenerationApi.e2eTests, file, testOptions);
      case 'performanceTests':
        return upload(testGenerationApi.performanceTests, file, testOptions);
      default:
        return upload(testGenerationApi.generate, file, testOptions);
    }
  }, [upload]);

  return { state, generateTests, reset };
}

/**
 * Batch test generation hook
 */
export function useBatchTestGeneration() {
  const { state, uploadBatch, reset } = useBatchFileUpload();

  const generateTestsForFiles = useCallback(async (files: File[], options?: {
    type?: 'unitTests' | 'integrationTests' | 'e2eTests' | 'performanceTests' | 'securityTests';
    language?: string;
    framework?: string;
    testFramework?: string;
    coverage?: string;
    includeEdgeCases?: boolean;
    includeMocking?: boolean;
  }) => {
    return uploadBatch(testGenerationApi.batchGenerate, files, options);
  }, [uploadBatch]);

  return { state, generateTestsForFiles, reset };
}

/**
 * Service capabilities hook
 */
export function useServiceCapabilities(service: 'security' | 'ai-review' | 'test-generation') {
  const [capabilities, capabilitiesActions] = useAsyncState(null);

  const fetchCapabilities = useCallback(async () => {
    capabilitiesActions.setLoading(true);
    try {
      let response;
      switch (service) {
        case 'security':
          response = await securityApi.health();
          break;
        case 'ai-review':
          response = await aiReviewApi.capabilities();
          break;
        case 'test-generation':
          response = await testGenerationApi.capabilities();
          break;
        default:
          throw new Error(`Unknown service: ${service}`);
      }
      capabilitiesActions.setData(response.data);
    } catch (error: any) {
      capabilitiesActions.setError(error.message);
    }
  }, [service, capabilitiesActions]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  return { ...capabilities, refetch: fetchCapabilities };
}

/**
 * System health hook
 */
export function useSystemHealth() {
  const [health, healthActions] = useAsyncState(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await apiClient.healthCheck();
      healthActions.setData(response.data);
    } catch (error: any) {
      healthActions.setError(error.message);
    }
  }, [healthActions]);

  const startHealthCheck = useCallback((interval: number = 30000) => {
    checkHealth();
    intervalRef.current = setInterval(checkHealth, interval);
  }, [checkHealth]);

  const stopHealthCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopHealthCheck();
  }, [stopHealthCheck]);

  return {
    ...health,
    checkHealth,
    startHealthCheck,
    stopHealthCheck
  };
}

/**
 * Local storage hook with JSON serialization
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * File validation hook
 */
export function useFileValidation() {
  const validateFile = useCallback((file: File, options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }) => {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB default
      allowedTypes = ['text/plain', 'text/javascript', 'text/x-python', 'application/json'],
      allowedExtensions = ['.js', '.ts', '.py', '.json', '.jsx', '.tsx', '.java', '.cpp', '.c', '.go', '.php', '.rb']
    } = options || {};

    const errors: string[] = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type) && file.type !== '') {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        errors.push(`File type not supported. Allowed types: ${allowedExtensions.join(', ')}`);
      }
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return { validateFile };
}

export default {
  useAsyncState,
  useFileUpload,
  useBatchFileUpload,
  useSecurityScan,
  useBatchSecurityScan,
  useAIReview,
  useBatchAIReview,
  useTestGeneration,
  useBatchTestGeneration,
  useServiceCapabilities,
  useSystemHealth,
  useLocalStorage,
  useDebounce,
  useFileValidation
};
