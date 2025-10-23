'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getErrorTracker,
  captureError,
  addBreadcrumb,
  setUser,
  type ErrorInfo,
  type Breadcrumb,
  type ErrorMetrics,
  type PerformanceIssue
} from '../utils/errorTracking';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

interface ErrorTrackingOptions {
  enableAutoCapture?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableUserTracking?: boolean;
  context?: Record<string, any>;
  tags?: string[];
}

// Hook for error tracking
export function useErrorTracking(options: ErrorTrackingOptions = {}) {
  const {
    enableAutoCapture = true,
    enablePerformanceMonitoring = true,
    enableUserTracking = true,
    context = {},
    tags = []
  } = options;

  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorInfo[]>([]);
  const errorTracker = useRef(getErrorTracker());

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = errorTracker.current.getMetrics();
      setMetrics(currentMetrics);
      
      const errors = errorTracker.current.getAllErrors()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setRecentErrors(errors);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Capture error manually
  const trackError = useCallback((
    error: Error | string,
    additionalContext?: Record<string, any>,
    severity: ErrorInfo['severity'] = 'medium',
    category: ErrorInfo['category'] = 'javascript'
  ) => {
    const fullContext = {
      ...context,
      ...additionalContext,
      tags: [...tags, ...(additionalContext?.tags || [])]
    };
    
    return captureError(error, fullContext, severity, category);
  }, [context, tags]);

  // Add breadcrumb
  const trackBreadcrumb = useCallback((breadcrumb: Omit<Breadcrumb, 'timestamp'>) => {
    addBreadcrumb({
      timestamp: Date.now(),
      ...breadcrumb
    });
  }, []);

  // Track user
  const trackUser = useCallback((userId: string, userData?: Record<string, any>) => {
    if (enableUserTracking) {
      setUser(userId, userData);
    }
  }, [enableUserTracking]);

  // Get error by ID
  const getError = useCallback((errorId: string) => {
    return errorTracker.current.getError(errorId);
  }, []);

  // Resolve error
  const resolveError = useCallback((fingerprint: string) => {
    return errorTracker.current.resolveError(fingerprint);
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    errorTracker.current.clearErrors();
    setMetrics(null);
    setRecentErrors([]);
  }, []);

  // Export errors
  const exportErrors = useCallback(() => {
    return errorTracker.current.exportErrors();
  }, []);

  return {
    trackError,
    trackBreadcrumb,
    trackUser,
    getError,
    resolveError,
    clearErrors,
    exportErrors,
    metrics,
    recentErrors
  };
}

// Hook for error boundary functionality
export function useErrorBoundary() {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null
  });

  const { trackError } = useErrorTracking();

  // Capture error in boundary
  const captureErrorBoundary = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    const errorId = trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    }, 'high', 'ui');

    setState({
      hasError: true,
      error,
      errorInfo,
      errorId
    });
  }, [trackError]);

  // Reset error boundary
  const resetErrorBoundary = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  }, []);

  return {
    ...state,
    captureErrorBoundary,
    resetErrorBoundary
  };
}

// Hook for performance monitoring
export function usePerformanceTracking() {
  const [performanceIssues, setPerformanceIssues] = useState<PerformanceIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const errorTracker = useRef(getErrorTracker());
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring || typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      performanceObserver.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Monitor navigation timing
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            if (navEntry.loadEventEnd - navEntry.fetchStart > 3000) {
              errorTracker.current.capturePerformanceIssue({
                type: 'slow_render',
                severity: 'medium',
                message: `Slow page load: ${(navEntry.loadEventEnd - navEntry.fetchStart).toFixed(0)}ms`,
                metrics: {
                  loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                  firstPaint: navEntry.loadEventStart - navEntry.fetchStart
                },
                threshold: 3000,
                actualValue: navEntry.loadEventEnd - navEntry.fetchStart
              });
            }
          }

          // Monitor resource timing
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.duration > 2000) {
              errorTracker.current.capturePerformanceIssue({
                type: 'slow_api',
                severity: 'medium',
                message: `Slow resource load: ${resourceEntry.name} (${resourceEntry.duration.toFixed(0)}ms)`,
                metrics: {
                  duration: resourceEntry.duration,
                  transferSize: resourceEntry.transferSize || 0,
                  encodedBodySize: resourceEntry.encodedBodySize || 0
                },
                threshold: 2000,
                actualValue: resourceEntry.duration
              });
            }
          }
        }
      });

      performanceObserver.current.observe({
        entryTypes: ['navigation', 'resource', 'measure']
      });

      setIsMonitoring(true);
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }, [isMonitoring]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (performanceObserver.current) {
      performanceObserver.current.disconnect();
      performanceObserver.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Get performance issues
  const updatePerformanceIssues = useCallback(() => {
    const issues = errorTracker.current.getPerformanceIssues()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
    setPerformanceIssues(issues);
  }, []);

  // Auto-start monitoring and update issues
  useEffect(() => {
    startMonitoring();
    updatePerformanceIssues();

    const interval = setInterval(updatePerformanceIssues, 10000);

    return () => {
      stopMonitoring();
      clearInterval(interval);
    };
  }, [startMonitoring, stopMonitoring, updatePerformanceIssues]);

  return {
    performanceIssues,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updatePerformanceIssues
  };
}

// Hook for API error tracking
export function useApiErrorTracking() {
  const { trackError, trackBreadcrumb } = useErrorTracking();
  const [apiErrors, setApiErrors] = useState<ErrorInfo[]>([]);
  const errorTracker = useRef(getErrorTracker());

  // Track API error
  const trackApiError = useCallback((
    error: Error | string,
    request: {
      url: string;
      method: string;
      status?: number;
      duration?: number;
      requestId?: string;
    }
  ) => {
    const errorId = trackError(error, {
      api: true,
      url: request.url,
      method: request.method,
      status: request.status,
      duration: request.duration,
      requestId: request.requestId
    }, 'medium', 'api');

    // Add breadcrumb for API call
    trackBreadcrumb({
      message: `API ${request.method} ${request.url} - ${request.status || 'Failed'}`,
      category: 'http',
      level: 'error',
      data: request
    });

    return errorId;
  }, [trackError, trackBreadcrumb]);

  // Track successful API call
  const trackApiSuccess = useCallback((request: {
    url: string;
    method: string;
    status: number;
    duration: number;
    requestId?: string;
  }) => {
    trackBreadcrumb({
      message: `API ${request.method} ${request.url} - ${request.status}`,
      category: 'http',
      level: 'info',
      data: request
    });
  }, [trackBreadcrumb]);

  // Get API errors
  useEffect(() => {
    const updateApiErrors = () => {
      const errors = errorTracker.current.getErrorsByCategory('api')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setApiErrors(errors);
    };

    updateApiErrors();
    const interval = setInterval(updateApiErrors, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    trackApiError,
    trackApiSuccess,
    apiErrors
  };
}

// Hook for user interaction tracking
export function useUserInteractionTracking() {
  const { trackBreadcrumb } = useErrorTracking();

  // Track click
  const trackClick = useCallback((element: string, data?: Record<string, any>) => {
    trackBreadcrumb({
      message: `Clicked ${element}`,
      category: 'user',
      level: 'info',
      data: {
        element,
        ...data
      }
    });
  }, [trackBreadcrumb]);

  // Track navigation
  const trackNavigation = useCallback((from: string, to: string) => {
    trackBreadcrumb({
      message: `Navigation from ${from} to ${to}`,
      category: 'navigation',
      level: 'info',
      data: {
        from,
        to
      }
    });
  }, [trackBreadcrumb]);

  // Track form submission
  const trackFormSubmission = useCallback((formName: string, success: boolean, data?: Record<string, any>) => {
    trackBreadcrumb({
      message: `Form ${formName} ${success ? 'submitted' : 'failed'}`,
      category: 'user',
      level: success ? 'info' : 'warning',
      data: {
        formName,
        success,
        ...data
      }
    });
  }, [trackBreadcrumb]);

  return {
    trackClick,
    trackNavigation,
    trackFormSubmission
  };
}

// Hook for error analytics
export function useErrorAnalytics() {
  const [analytics, setAnalytics] = useState({
    errorTrends: [] as Array<{ date: string; count: number }>,
    topErrorMessages: [] as Array<{ message: string; count: number }>,
    errorsByBrowser: {} as Record<string, number>,
    errorsByPage: {} as Record<string, number>
  });

  const errorTracker = useRef(getErrorTracker());

  // Calculate analytics
  const calculateAnalytics = useCallback(() => {
    const errors = errorTracker.current.getAllErrors();
    
    // Error trends (last 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const recentErrors = errors.filter(error => error.timestamp > sevenDaysAgo);
    
    const errorTrends: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      
      const dayErrors = recentErrors.filter(error => 
        error.timestamp >= dayStart && error.timestamp < dayEnd
      );
      
      errorTrends.push({
        date: date.toISOString().split('T')[0],
        count: dayErrors.length
      });
    }
    
    // Top error messages
    const messageCounts = new Map<string, number>();
    errors.forEach(error => {
      const count = messageCounts.get(error.message) || 0;
      messageCounts.set(error.message, count + error.occurrences);
    });
    
    const topErrorMessages = Array.from(messageCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Errors by browser
    const errorsByBrowser: Record<string, number> = {};
    errors.forEach(error => {
      const browser = error.tags.find(tag => tag.startsWith('browser:'))?.split(':')[1] || 'unknown';
      errorsByBrowser[browser] = (errorsByBrowser[browser] || 0) + 1;
    });
    
    // Errors by page
    const errorsByPage: Record<string, number> = {};
    errors.forEach(error => {
      const page = error.tags.find(tag => tag.startsWith('page:'))?.split(':')[1] || 'unknown';
      errorsByPage[page] = (errorsByPage[page] || 0) + 1;
    });
    
    setAnalytics({
      errorTrends,
      topErrorMessages,
      errorsByBrowser,
      errorsByPage
    });
  }, []);

  // Update analytics periodically
  useEffect(() => {
    calculateAnalytics();
    const interval = setInterval(calculateAnalytics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [calculateAnalytics]);

  return {
    analytics,
    calculateAnalytics
  };
}

// Export types
export type {
  ErrorBoundaryState,
  ErrorTrackingOptions
};