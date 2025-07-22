/**
 * Performance monitoring utility
 * Tracks API request performance and provides metrics
 */

interface RequestMetric {
  requestId: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: string;
}

interface PerformanceMetrics {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  slowestRequest: RequestMetric | null;
  fastestRequest: RequestMetric | null;
  requestsPerMinute: number;
  errorRate: number;
}

class PerformanceMonitor {
  private requests: Map<string, RequestMetric> = new Map();
  private completedRequests: RequestMetric[] = [];
  private readonly maxHistorySize = 1000;

  startRequest(requestId: string, url: string): void {
    console.time(`Request-${requestId}`);
    
    const metric: RequestMetric = {
      requestId,
      url,
      startTime: Date.now(),
    };
    
    this.requests.set(requestId, metric);
    
    // Log performance start
    console.log(`[PERF] Started: ${url}`, {
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  endRequest(
    requestId: string, 
    status: number, 
    duration: number, 
    error?: string
  ): void {
    console.timeEnd(`Request-${requestId}`);
    
    const metric = this.requests.get(requestId);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.duration = duration;
    metric.status = status;
    metric.error = error;

    // Move to completed requests
    this.completedRequests.push(metric);
    this.requests.delete(requestId);

    // Limit history size
    if (this.completedRequests.length > this.maxHistorySize) {
      this.completedRequests = this.completedRequests.slice(-this.maxHistorySize);
    }

    // Log performance end
    const statusCategory = status >= 200 && status < 300 ? 'SUCCESS' : 'ERROR';
    console.log(`[PERF] ${statusCategory}: ${metric.url}`, {
      requestId,
      duration: `${duration}ms`,
      status,
      error,
      timestamp: new Date().toISOString(),
    });

    // Log slow requests
    if (duration > 2000) {
      console.warn(`[PERF] SLOW REQUEST: ${metric.url}`, {
        duration: `${duration}ms`,
        requestId,
      });
    }
  }

  getMetrics(): PerformanceMetrics {
    console.time('Performance-Metrics-Calculation');
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentRequests = this.completedRequests.filter(
      req => req.endTime && req.endTime > oneMinuteAgo
    );

    const successRequests = this.completedRequests.filter(
      req => req.status && req.status >= 200 && req.status < 300
    );

    const errorRequests = this.completedRequests.filter(
      req => req.status && (req.status < 200 || req.status >= 300)
    );

    const durations = this.completedRequests
      .filter(req => req.duration !== undefined)
      .map(req => req.duration!);

    const averageResponseTime = durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0;

    const slowestRequest = durations.length > 0
      ? this.completedRequests.find(req => req.duration === Math.max(...durations)) || null
      : null;

    const fastestRequest = durations.length > 0
      ? this.completedRequests.find(req => req.duration === Math.min(...durations)) || null
      : null;

    const metrics: PerformanceMetrics = {
      totalRequests: this.completedRequests.length,
      successRequests: successRequests.length,
      errorRequests: errorRequests.length,
      averageResponseTime: Math.round(averageResponseTime),
      slowestRequest,
      fastestRequest,
      requestsPerMinute: recentRequests.length,
      errorRate: this.completedRequests.length > 0
        ? Math.round((errorRequests.length / this.completedRequests.length) * 100)
        : 0,
    };

    console.timeEnd('Performance-Metrics-Calculation');
    
    console.log('[PERF] Current Metrics:', metrics);
    
    return metrics;
  }

  getSlowRequests(threshold: number = 1000): RequestMetric[] {
    return this.completedRequests.filter(
      req => req.duration && req.duration > threshold
    );
  }

  getErrorRequests(): RequestMetric[] {
    return this.completedRequests.filter(
      req => req.status && (req.status < 200 || req.status >= 300)
    );
  }

  clearHistory(): void {
    console.log('[PERF] Clearing performance history');
    this.completedRequests = [];
    this.requests.clear();
  }

  // Export performance data for analysis
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      requests: this.completedRequests,
    };
    
    return JSON.stringify(data, null, 2);
  }
}

export const performanceMonitor = new PerformanceMonitor();
