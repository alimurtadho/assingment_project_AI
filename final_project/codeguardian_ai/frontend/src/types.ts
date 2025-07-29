// Type definitions for CodeGuardian AI Platform
export interface ScanResult {
  id: string;
  timestamp: string;
  scanType: 'security' | 'ai-review' | 'test-generation' | 'performance';
  status: 'pending' | 'running' | 'completed' | 'failed';
  files: string[];
  filename?: string;
  createdAt?: string;
  language?: string;
  fileSize?: number;
  riskScore?: number;
  vulnerabilities?: Vulnerability[];
  codeReview?: CodeReview;
  tests?: TestCase[];
  testCases?: TestCase[];
  performanceMetrics?: PerformanceMetrics;
  summary: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column?: number;
  code: string;
  description: string;
  recommendation: string;
  suggestion?: string;
  filename: string;
  confidence: number;
  category: string;
}

export interface CodeIssue {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error';
  line: number;
  column: number;
  message: string;
  description: string;
  suggestion: string;
}

export interface CodeSuggestion {
  id: string;
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  expectedImprovement: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CodeReview {
  id: string;
  timestamp: string;
  overallScore: number;
  maintainabilityScore: number;
  performanceScore: number;
  securityScore: number;
  issues: CodeIssue[];
  suggestions: (CodeSuggestion | string)[];
  complexity: number;
  linesOfCode: number;
  summary: string;
}

export interface CodeSuggestion {
  id: string;
  category: 'code-quality' | 'performance' | 'security' | 'maintainability' | 'architecture';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  line?: number;
  example?: string;
  priority: number;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e';
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  framework: string;
  code: string;
  coverage: number;
  filename: string;
  targetFunction?: string;
  expectedOutput?: string;
  tags: string[];
}

export interface Bottleneck {
  id: string;
  type: string;
  function: string;
  line: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Optimization {
  id: string;
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  expectedImprovement: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PerformanceMetrics {
  id: string;
  timestamp: string;
  executionTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  complexityScore: number;
  bottlenecks: Bottleneck[];
  optimizations: Optimization[];
  complexity: {
    cyclomatic: number;
    cognitive: number;
    nesting: number;
    halstead?: {
      difficulty: number;
      effort: number;
      volume: number;
    };
  };
  grade: string;
}

export interface PerformanceSuggestion {
  id: string;
  type: 'optimization' | 'refactoring' | 'caching' | 'algorithm';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  example?: string;
}

// Dashboard and Analytics Types
export interface DashboardMetrics {
  totalScans: number;
  vulnerabilitiesFound: number;
  averageRiskScore: number;
  testCoverageImprovement: number;
  recentActivity: ActivityItem[];
  trendData: TrendData[];
  languageDistribution: LanguageStats[];
  securityTrends: SecurityTrend[];
}

export interface ActivityItem {
  id: string;
  type: 'scan' | 'vulnerability' | 'fix' | 'review';
  description: string;
  timestamp: string;
  severity?: string;
  filename?: string;
}

export interface TrendData {
  date: string;
  scans: number;
  vulnerabilities: number;
  fixes: number;
  riskScore: number;
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
  vulnerabilities: number;
  avgRiskScore: number;
}

export interface SecurityTrend {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ScanResponse {
  scanId: string;
  message: string;
  results: Array<{
    id: string;
    filename: string;
    status: string;
    scanType: string;
  }>;
}

// User and Settings Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'engineer' | 'viewer';
  preferences: UserPreferences;
  lastLogin?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    severity: 'all' | 'high' | 'critical';
  };
  defaultScanType: 'security' | 'ai-review' | 'test-generation';
  autoRefresh: boolean;
  dashboardLayout: string[];
}

// Filter and Search Types
export interface FilterOptions {
  scanType?: string[];
  severity?: string[];
  status?: string[];
  language?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'date' | 'severity' | 'filename' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  filters: FilterOptions;
  page: number;
  limit: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}
