'use client';

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'api' | 'ui' | 'performance' | 'security';
  context?: Record<string, any>;
  breadcrumbs: Breadcrumb[];
  tags: string[];
  fingerprint: string;
  resolved: boolean;
  occurrences: number;
}

interface Breadcrumb {
  timestamp: number;
  message: string;
  category: 'navigation' | 'user' | 'console' | 'network' | 'dom' | 'http' | 'performance';
  level: 'info' | 'warning' | 'error' | 'debug';
  data?: Record<string, any>;
}

interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  topErrors: Array<{ fingerprint: string; count: number; message: string }>;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  averageResolutionTime: number;
  unresolvedErrors: number;
}

interface PerformanceIssue {
  id: string;
  type: 'slow_api' | 'memory_leak' | 'large_bundle' | 'slow_render' | 'network_timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics: Record<string, number>;
  threshold: number;
  actualValue: number;
  url: string;
  resolved: boolean;
}

class ErrorTracker {
  private errors: Map<string, ErrorInfo> = new Map();
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private userId?: string;
  private maxBreadcrumbs: number = 100;
  private maxErrors: number = 1000;
  private listeners: Array<(error: ErrorInfo) => void> = [];
  private performanceIssues: Map<string, PerformanceIssue> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(error: Error | string, context?: Record<string, any>): string {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' && error.stack ? error.stack : '';
    
    // Create a simple hash of the error message and first few stack frames
    const stackLines = stack.split('\n').slice(0, 3).join('\n');
    const combined = `${message}:${stackLines}`;
    
    return this.simpleHash(combined);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        type: 'unhandledrejection',
        reason: event.reason
      });
    });

    // Network error monitoring
    this.monitorNetworkErrors();

    // Performance monitoring
    this.monitorPerformance();

    // User interaction tracking
    this.trackUserInteractions();

    this.isInitialized = true;
  }

  private monitorNetworkErrors(): void {
    if (typeof window === 'undefined') return;

    // Monitor fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.addBreadcrumb({
          timestamp: Date.now(),
          message: `Fetch ${args[0]} - ${response.status}`,
          category: 'network',
          level: response.ok ? 'info' : 'error',
          data: {
            url: args[0],
            status: response.status,
            duration
          }
        });

        if (!response.ok) {
          this.captureError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
            url: args[0],
            status: response.status,
            duration,
            category: 'network'
          });
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.captureError(error as Error, {
          url: args[0],
          duration,
          category: 'network'
        });
        throw error;
      }
    };
  }

  private monitorPerformance(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.capturePerformanceIssue({
              type: 'slow_render',
              severity: entry.duration > 100 ? 'high' : 'medium',
              message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
              metrics: { duration: entry.duration },
              threshold: 50,
              actualValue: entry.duration
            });
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 80) {
          this.capturePerformanceIssue({
            type: 'memory_leak',
            severity: usedPercent > 90 ? 'critical' : 'high',
            message: `High memory usage: ${usedPercent.toFixed(1)}%`,
            metrics: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
              usedPercent
            },
            threshold: 80,
            actualValue: usedPercent
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private trackUserInteractions(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.addBreadcrumb({
        timestamp: Date.now(),
        message: `Clicked ${target.tagName}${target.id ? `#${target.id}` : ''}${target.className ? `.${target.className.split(' ')[0]}` : ''}`,
        category: 'user',
        level: 'info',
        data: {
          tagName: target.tagName,
          id: target.id,
          className: target.className,
          innerText: target.innerText?.substring(0, 50)
        }
      });
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        timestamp: Date.now(),
        message: `Navigation to ${window.location.pathname}`,
        category: 'navigation',
        level: 'info',
        data: {
          url: window.location.href,
          pathname: window.location.pathname
        }
      });
    });
  }

  public setUser(userId: string, userData?: Record<string, any>): void {
    this.userId = userId;
    this.addBreadcrumb({
      timestamp: Date.now(),
      message: `User identified: ${userId}`,
      category: 'user',
      level: 'info',
      data: userData
    });
  }

  public addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push(breadcrumb);
    
    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  public captureError(
    error: Error | string,
    context?: Record<string, any>,
    severity: ErrorInfo['severity'] = 'medium',
    category: ErrorInfo['category'] = 'javascript'
  ): string {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const fingerprint = this.generateFingerprint(errorObj, context);
    
    let errorInfo = this.errors.get(fingerprint);
    
    if (errorInfo) {
      // Update existing error
      errorInfo.occurrences++;
      errorInfo.timestamp = Date.now();
    } else {
      // Create new error
      errorInfo = {
        id: this.generateErrorId(),
        message: errorObj.message,
        stack: errorObj.stack,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        userId: this.userId,
        sessionId: this.sessionId,
        severity,
        category,
        context: context || {},
        breadcrumbs: [...this.breadcrumbs],
        tags: this.generateTags(errorObj, context),
        fingerprint,
        resolved: false,
        occurrences: 1
      };
      
      this.errors.set(fingerprint, errorInfo);
      
      // Notify listeners
      this.listeners.forEach(listener => {
        try {
          listener(errorInfo!);
        } catch (listenerError) {
          console.error('Error in error listener:', listenerError);
        }
      });
    }

    // Clean up old errors
    this.cleanupErrors();
    
    return errorInfo.id;
  }

  public capturePerformanceIssue(issue: Omit<PerformanceIssue, 'id' | 'timestamp' | 'url' | 'resolved'>): string {
    const performanceIssue: PerformanceIssue = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      resolved: false,
      ...issue
    };
    
    this.performanceIssues.set(performanceIssue.id, performanceIssue);
    
    // Also capture as regular error for unified tracking
    this.captureError(new Error(issue.message), {
      type: 'performance',
      performanceType: issue.type,
      metrics: issue.metrics,
      threshold: issue.threshold,
      actualValue: issue.actualValue
    }, issue.severity, 'performance');
    
    return performanceIssue.id;
  }

  private generateTags(error: Error, context?: Record<string, any>): string[] {
    const tags: string[] = [];
    
    // Add browser info
    if (typeof navigator !== 'undefined') {
      tags.push(`browser:${this.getBrowserName()}`);
    }
    
    // Add URL-based tags
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      tags.push(`page:${url.pathname}`);
    }
    
    // Add context-based tags
    if (context) {
      if (context.component) tags.push(`component:${context.component}`);
      if (context.feature) tags.push(`feature:${context.feature}`);
      if (context.api) tags.push(`api:${context.api}`);
    }
    
    return tags;
  }

  private getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'other';
  }

  private cleanupErrors(): void {
    if (this.errors.size <= this.maxErrors) return;
    
    // Remove oldest errors
    const sortedErrors = Array.from(this.errors.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = sortedErrors.slice(0, sortedErrors.length - this.maxErrors);
    toRemove.forEach(([fingerprint]) => {
      this.errors.delete(fingerprint);
    });
  }

  public resolveError(fingerprint: string): boolean {
    const error = this.errors.get(fingerprint);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  public getError(fingerprint: string): ErrorInfo | undefined {
    return this.errors.get(fingerprint);
  }

  public getAllErrors(): ErrorInfo[] {
    return Array.from(this.errors.values());
  }

  public getErrorsByCategory(category: ErrorInfo['category']): ErrorInfo[] {
    return this.getAllErrors().filter(error => error.category === category);
  }

  public getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  public getRecentErrors(limit: number = 10): ErrorInfo[] {
    return this.getAllErrors()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  public getMetrics(): ErrorMetrics {
    const errors = this.getAllErrors();
    const totalErrors = errors.length;
    const unresolvedErrors = errors.filter(e => !e.resolved).length;
    
    // Calculate error rate (errors per session)
    const errorRate = totalErrors;
    
    // Top errors by occurrence
    const errorCounts = new Map<string, { count: number; message: string }>();
    errors.forEach(error => {
      const existing = errorCounts.get(error.fingerprint);
      if (existing) {
        existing.count += error.occurrences;
      } else {
        errorCounts.set(error.fingerprint, {
          count: error.occurrences,
          message: error.message
        });
      }
    });
    
    const topErrors = Array.from(errorCounts.entries())
      .map(([fingerprint, data]) => ({ fingerprint, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Errors by category
    const errorsByCategory: Record<string, number> = {};
    errors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
    });
    
    // Errors by severity
    const errorsBySeverity: Record<string, number> = {};
    errors.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });
    
    // Average resolution time (mock calculation)
    const resolvedErrors = errors.filter(e => e.resolved);
    const averageResolutionTime = resolvedErrors.length > 0 ? 24 * 60 * 60 * 1000 : 0; // 24 hours mock
    
    return {
      totalErrors,
      errorRate,
      topErrors,
      errorsByCategory,
      errorsBySeverity,
      averageResolutionTime,
      unresolvedErrors
    };
  }

  public getPerformanceIssues(): PerformanceIssue[] {
    return Array.from(this.performanceIssues.values());
  }

  public onError(listener: (error: ErrorInfo) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public clearErrors(): void {
    this.errors.clear();
    this.performanceIssues.clear();
  }

  public exportErrors(): string {
    return JSON.stringify({
      errors: this.getAllErrors(),
      performanceIssues: this.getPerformanceIssues(),
      metrics: this.getMetrics(),
      sessionId: this.sessionId,
      exportTime: Date.now()
    }, null, 2);
  }
}

// Global error tracker instance
let globalErrorTracker: ErrorTracker | null = null;

// Get global error tracker
export function getErrorTracker(): ErrorTracker {
  if (!globalErrorTracker) {
    globalErrorTracker = new ErrorTracker();
  }
  return globalErrorTracker;
}

// Convenience functions
export function captureError(
  error: Error | string,
  context?: Record<string, any>,
  severity?: ErrorInfo['severity'],
  category?: ErrorInfo['category']
): string {
  return getErrorTracker().captureError(error, context, severity, category);
}

export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  getErrorTracker().addBreadcrumb(breadcrumb);
}

export function setUser(userId: string, userData?: Record<string, any>): void {
  getErrorTracker().setUser(userId, userData);
}

// Export types and classes
export {
  ErrorTracker
};

export type {
  ErrorInfo,
  Breadcrumb,
  ErrorMetrics,
  PerformanceIssue
};