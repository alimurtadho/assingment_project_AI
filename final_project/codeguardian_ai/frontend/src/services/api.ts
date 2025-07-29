import { ScanResult, ApiResponse, ScanResponse, DashboardMetrics, FilterOptions } from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Service Class for CodeGuardian AI
class ApiService {
  baseURL;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string; features: any }> {
    return this.request('/health');
  }

  // Get API info
  async getApiInfo(): Promise<any> {
    return this.request('/info');
  }

  // Scan operations
  async uploadAndScan(
    files: File[], 
    scanType: 'security' | 'ai-review' | 'test-generation' | 'performance',
    options: { includeDocumentation?: boolean; severity?: string } = {}
  ): Promise<ScanResponse> {
    const formData = new FormData();
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add scan type
    formData.append('scanType', scanType);
    
    // Add options
    if (options.includeDocumentation !== undefined) {
      formData.append('options[includeDocumentation]', options.includeDocumentation.toString());
    }
    if (options.severity) {
      formData.append('options[severity]', options.severity);
    }

    return this.request('/scan/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getScanResults(scanId: string): Promise<ScanResult[]> {
    return this.request(`/scan/results/${scanId}`);
  }

  async getAllScanResults(filters: FilterOptions = {}): Promise<ScanResult[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.scanType) queryParams.append('scanType', filters.scanType.join(','));
    if (filters.status) queryParams.append('status', filters.status.join(','));
    if (filters.severity) queryParams.append('severity', filters.severity.join(','));
    if (filters.language) queryParams.append('language', filters.language.join(','));
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const queryString = queryParams.toString();
    const endpoint = `/scan/results${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async deleteScanResult(scanId: string): Promise<{ message: string; scanId: string }> {
    return this.request(`/scan/results/${scanId}`, {
      method: 'DELETE',
    });
  }

  // Specific scan types
  async securityScan(files: File[], options: any = {}): Promise<ScanResponse> {
    return this.uploadAndScan(files, 'security', options);
  }

  async aiCodeReview(files: File[], options: any = {}): Promise<ScanResponse> {
    return this.uploadAndScan(files, 'ai-review', options);
  }

  async testGeneration(files: File[], options: any = {}): Promise<ScanResponse> {
    return this.uploadAndScan(files, 'test-generation', options);
  }

  async performanceAnalysis(files: File[], options: any = {}): Promise<ScanResponse> {
    return this.uploadAndScan(files, 'performance', options);
  }

  // Dashboard and Analytics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      return await this.request('/dashboard/metrics');
    } catch (error) {
      // Return mock data if API fails
      return this.getMockDashboardMetrics();
    }
  }

  async getAnalysisSummary(timeRange: string = '7d'): Promise<any> {
    return this.request(`/analysis/summary?timeRange=${timeRange}`);
  }

  // Mock data methods for development
  private getMockDashboardMetrics(): DashboardMetrics {
    return {
      totalScans: 156,
      vulnerabilitiesFound: 89,
      averageRiskScore: 65,
      testCoverageImprovement: 23,
      recentActivity: [
        {
          id: '1',
          type: 'scan',
          description: 'Security scan completed for auth.js',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          severity: 'high',
          filename: 'auth.js'
        },
        {
          id: '2',
          type: 'vulnerability',
          description: 'Critical SQL injection vulnerability detected',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          severity: 'critical',
          filename: 'database.js'
        },
        {
          id: '3',
          type: 'review',
          description: 'AI code review completed for utils.ts',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          severity: 'medium',
          filename: 'utils.ts'
        },
        {
          id: '4',
          type: 'fix',
          description: 'Hardcoded password vulnerability fixed',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          severity: 'high',
          filename: 'config.js'
        }
      ],
      trendData: [
        { date: '2025-07-23', scans: 12, vulnerabilities: 8, fixes: 5, riskScore: 70 },
        { date: '2025-07-24', scans: 15, vulnerabilities: 12, fixes: 7, riskScore: 68 },
        { date: '2025-07-25', scans: 18, vulnerabilities: 10, fixes: 9, riskScore: 65 },
        { date: '2025-07-26', scans: 22, vulnerabilities: 14, fixes: 11, riskScore: 63 },
        { date: '2025-07-27', scans: 20, vulnerabilities: 11, fixes: 13, riskScore: 60 },
        { date: '2025-07-28', scans: 25, vulnerabilities: 15, fixes: 16, riskScore: 58 },
        { date: '2025-07-29', scans: 28, vulnerabilities: 13, fixes: 18, riskScore: 55 }
      ],
      languageDistribution: [
        { language: 'JavaScript', count: 45, percentage: 35, vulnerabilities: 28, avgRiskScore: 65 },
        { language: 'TypeScript', count: 38, percentage: 30, vulnerabilities: 18, avgRiskScore: 52 },
        { language: 'Python', count: 25, percentage: 20, vulnerabilities: 15, avgRiskScore: 58 },
        { language: 'Java', count: 12, percentage: 10, vulnerabilities: 8, avgRiskScore: 62 },
        { language: 'Other', count: 6, percentage: 5, vulnerabilities: 3, avgRiskScore: 45 }
      ],
      securityTrends: [
        { category: 'SQL Injection', count: 15, trend: 'down', severity: 'critical' },
        { category: 'XSS', count: 23, trend: 'down', severity: 'high' },
        { category: 'Hardcoded Secrets', count: 18, trend: 'stable', severity: 'high' },
        { category: 'Weak Cryptography', count: 12, trend: 'down', severity: 'medium' },
        { category: 'Information Disclosure', count: 8, trend: 'up', severity: 'low' }
      ]
    };
  }

  // Mock scan result for development
  getMockScanResult(filename: string, scanType: 'security' | 'ai-review' | 'test-generation' | 'performance'): ScanResult {
    const baseResult: ScanResult = {
      id: `mock-${Date.now()}`,
      filename,
      scanType,
      status: 'completed',
      createdAt: new Date().toISOString(),
      language: filename.split('.').pop()?.toLowerCase() || 'unknown',
      fileSize: Math.floor(Math.random() * 50000) + 1000
    };

    switch (scanType) {
      case 'security':
        return {
          ...baseResult,
          riskScore: Math.floor(Math.random() * 40) + 30,
          vulnerabilities: [
            {
              id: 'vuln-1',
              title: 'SQL Injection Vulnerability',
              type: 'SQL Injection',
              severity: 'high',
              line: 45,
              code: 'SELECT * FROM users WHERE id = " + userId',
              description: 'Potential SQL injection vulnerability detected',
              recommendation: 'Use parameterized queries to prevent SQL injection',
              filename,
              confidence: 85,
              category: 'security'
            },
            {
              id: 'vuln-2',
              title: 'Hardcoded Credentials',
              type: 'Hardcoded Password',
              severity: 'critical',
              line: 12,
              code: 'const password = "admin123"',
              description: 'Hardcoded password found in source code',
              recommendation: 'Store passwords in environment variables',
              filename,
              confidence: 95,
              category: 'security'
            }
          ]
        };

      case 'ai-review':
        return {
          ...baseResult,
          codeReview: {
            overallScore: Math.floor(Math.random() * 30) + 70,
            summary: 'Code shows good structure with some improvement opportunities',
            suggestions: [
              {
                id: 'suggestion-1',
                type: 'code-quality',
                description: 'Consider adding explicit type annotations for better code clarity',
                impact: 'medium',
                expectedImprovement: '10% better maintainability',
                difficulty: 'easy'
              }
            ],
            categories: {
              codeQuality: [],
              performance: [],
              security: [],
              maintainability: []
            }
          }
        };

      case 'test-generation':
        return {
          ...baseResult,
          testCases: [
            {
              id: 'test-1',
              name: 'should handle valid input',
              description: 'Tests the function with valid input parameters',
              type: 'unit',
              framework: 'Jest',
              code: `test('should process valid data', () => {\n  const result = processData(validInput);\n  expect(result).toBeDefined();\n});`,
              coverage: 85,
              tags: ['unit', 'validation']
            }
          ]
        };

      case 'performance':
        return {
          ...baseResult,
          performanceMetrics: {
            complexity: {
              cyclomatic: Math.floor(Math.random() * 10) + 5,
              cognitive: Math.floor(Math.random() * 15) + 8,
              halstead: {
                volume: Math.random() * 1000 + 500,
                difficulty: Math.random() * 20 + 10,
                effort: Math.random() * 5000 + 2000
              }
            },
            suggestions: [
              {
                id: 'perf-1',
                type: 'optimization',
                description: 'Consider optimizing loop performance',
                impact: 'medium',
                effort: 'low',
                example: 'Use forEach() instead of traditional for loops'
              }
            ]
          }
        };

      default:
        return baseResult;
    }
  }
}

// Export singleton instance
const apiService = new ApiService();

export default apiService;

// Export individual methods for convenience
export const {
  healthCheck,
  uploadAndScan,
  getScanResults,
  getAllScanResults,
  deleteScanResult,
  securityScan,
  aiCodeReview,
  testGeneration,
  performanceAnalysis,
  getDashboardMetrics,
  getAnalysisSummary,
} = apiService;
