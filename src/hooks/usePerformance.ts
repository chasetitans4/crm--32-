// React hooks for performance monitoring and Web Vitals tracking
import { useState, useEffect, useCallback, useRef } from 'react';
import * as React from 'react';
import { webVitalsTracker, WebVitalsMetrics, CustomPerformanceMetrics } from '../utils/performance';

interface PerformanceState {
  webVitals: WebVitalsMetrics;
  customMetrics: CustomPerformanceMetrics;
  score: { overall: number; breakdown: Record<string, { score: number; rating: string }> };
  isLoading: boolean;
}

// Hook for Web Vitals monitoring
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>(webVitalsTracker.getMetrics());
  const [score, setScore] = useState(webVitalsTracker.getScore());

  useEffect(() => {
    const unsubscribe = webVitalsTracker.onUpdate((newMetrics) => {
      setMetrics(newMetrics);
      setScore(webVitalsTracker.getScore());
    });

    return unsubscribe;
  }, []);

  return {
    metrics,
    score,
    refresh: () => {
      setMetrics(webVitalsTracker.getMetrics());
      setScore(webVitalsTracker.getScore());
    }
  };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const [renderTimes, setRenderTimes] = useState<number[]>([]);

  useEffect(() => {
    renderCountRef.current++;
    const endTime = performance.now();
    
    if (startTimeRef.current > 0) {
      const renderTime = endTime - startTimeRef.current;
      setRenderTimes(prev => [...prev.slice(-9), renderTime]); // Keep last 10 renders
      
      // Mark performance for debugging
      performance.mark(`${componentName}-render-${renderCountRef.current}`);
    }
    
    startTimeRef.current = endTime;
  }, [componentName]);

  const averageRenderTime = renderTimes.length > 0 
    ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
    : 0;

  return {
    renderCount: renderCountRef.current,
    renderTimes,
    averageRenderTime,
    lastRenderTime: renderTimes[renderTimes.length - 1] || 0
  };
}

// Hook for measuring API call performance
export function useApiPerformance() {
  const [apiMetrics, setApiMetrics] = useState<{
    calls: Array<{ endpoint: string; duration: number; timestamp: number; status: 'success' | 'error' }>;
    averageResponseTime: number;
    errorRate: number;
  }>({
    calls: [],
    averageResponseTime: 0,
    errorRate: 0
  });

  const measureApiCall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    const startMark = `api-${endpoint}-start-${Date.now()}`;
    const endMark = `api-${endpoint}-end-${Date.now()}`;
    
    performance.mark(startMark);
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performance.mark(endMark);
      performance.measure(`api-${endpoint}`, startMark, endMark);
      
      setApiMetrics(prev => {
        const newCalls = [...prev.calls.slice(-19), { // Keep last 20 calls
          endpoint,
          duration,
          timestamp: Date.now(),
          status: 'success' as const
        }];
        
        const avgResponseTime = newCalls.reduce((sum, call) => sum + call.duration, 0) / newCalls.length;
        const errorCount = newCalls.filter(call => call.status === 'error').length;
        const errorRate = (errorCount / newCalls.length) * 100;
        
        return {
          calls: newCalls,
          averageResponseTime: avgResponseTime,
          errorRate
        };
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performance.mark(endMark);
      performance.measure(`api-${endpoint}-error`, startMark, endMark);
      
      setApiMetrics(prev => {
        const newCalls = [...prev.calls.slice(-19), {
          endpoint,
          duration,
          timestamp: Date.now(),
          status: 'error' as const
        }];
        
        const avgResponseTime = newCalls.reduce((sum, call) => sum + call.duration, 0) / newCalls.length;
        const errorCount = newCalls.filter(call => call.status === 'error').length;
        const errorRate = (errorCount / newCalls.length) * 100;
        
        return {
          calls: newCalls,
          averageResponseTime: avgResponseTime,
          errorRate
        };
      });
      
      throw error;
    }
  }, []);

  return {
    ...apiMetrics,
    measureApiCall
  };
}

// Hook for measuring route change performance
export function useRoutePerformance() {
  const [routeMetrics, setRouteMetrics] = useState<{
    changes: Array<{ from: string; to: string; duration: number; timestamp: number }>;
    averageChangeTime: number;
  }>({
    changes: [],
    averageChangeTime: 0
  });

  const measureRouteChange = useCallback((from: string, to: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performance.mark(`route-change-${to}`);
    performance.measure(`route-change-${from}-to-${to}`, `route-change-${from}`, `route-change-${to}`);
    
    setRouteMetrics(prev => {
      const newChanges = [...prev.changes.slice(-9), { // Keep last 10 route changes
        from,
        to,
        duration,
        timestamp: Date.now()
      }];
      
      const avgChangeTime = newChanges.reduce((sum, change) => sum + change.duration, 0) / newChanges.length;
      
      return {
        changes: newChanges,
        averageChangeTime: avgChangeTime
      };
    });
  }, []);

  const startRouteChange = useCallback((routeName: string) => {
    performance.mark(`route-change-${routeName}`);
    return performance.now();
  }, []);

  return {
    ...routeMetrics,
    measureRouteChange,
    startRouteChange
  };
}

// Hook for memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null>(null);

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const percentage = Math.round((used / limit) * 100);
      
      setMemoryInfo({ used, total, limit, percentage });
    }
  }, []);

  useEffect(() => {
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  return {
    memoryInfo,
    updateMemoryInfo,
    isMemorySupported: 'memory' in performance
  };
}

// Hook for comprehensive performance monitoring
export function usePerformanceMonitoring() {
  const webVitals = useWebVitals();
  const memory = useMemoryMonitoring();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [performanceAlerts, setPerformanceAlerts] = useState<Array<{
    type: 'warning' | 'error';
    message: string;
    timestamp: number;
    metric: string;
  }>>([]);

  // Monitor for performance issues
  useEffect(() => {
    if (!isMonitoring) return;

    const checkPerformance = () => {
      const alerts: typeof performanceAlerts = [];
      
      // Check Web Vitals
      if (webVitals.metrics.lcp && webVitals.metrics.lcp > 4000) {
        alerts.push({
          type: 'error',
          message: `Poor LCP: ${webVitals.metrics.lcp}ms (should be < 2500ms)`,
          timestamp: Date.now(),
          metric: 'lcp'
        });
      }
      
      if (webVitals.metrics.inp && webVitals.metrics.inp > 300) {
        alerts.push({
          type: 'error',
          message: `Poor INP: ${webVitals.metrics.inp}ms (should be < 200ms)`,
          timestamp: Date.now(),
          metric: 'inp'
        });
      }
      
      if (webVitals.metrics.cls && webVitals.metrics.cls > 0.25) {
        alerts.push({
          type: 'error',
          message: `Poor CLS: ${webVitals.metrics.cls} (should be < 0.1)`,
          timestamp: Date.now(),
          metric: 'cls'
        });
      }
      
      // Check memory usage
      if (memory.memoryInfo && memory.memoryInfo.percentage > 80) {
        alerts.push({
          type: 'warning',
          message: `High memory usage: ${memory.memoryInfo.percentage}% (${memory.memoryInfo.used}MB)`,
          timestamp: Date.now(),
          metric: 'memory'
        });
      }
      
      if (alerts.length > 0) {
        setPerformanceAlerts(prev => [...prev.slice(-9), ...alerts]); // Keep last 10 alerts
      }
    };

    const interval = setInterval(checkPerformance, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isMonitoring, webVitals.metrics, memory.memoryInfo]);

  const generateReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      webVitals: webVitals.metrics,
      score: webVitals.score,
      memory: memory.memoryInfo,
      alerts: performanceAlerts,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };
  }, [webVitals, memory.memoryInfo, performanceAlerts]);

  const clearAlerts = useCallback(() => {
    setPerformanceAlerts([]);
  }, []);

  return {
    webVitals: webVitals.metrics,
    score: webVitals.score,
    memory: memory.memoryInfo,
    alerts: performanceAlerts,
    isMonitoring,
    setIsMonitoring,
    generateReport,
    clearAlerts,
    refresh: webVitals.refresh
  };
}

// Performance measurement decorators for React components
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const renderPerf = useRenderPerformance(componentName);
    
    useEffect(() => {
      if (renderPerf.averageRenderTime > 16) { // 60fps threshold
        console.warn(`Component ${componentName} average render time: ${renderPerf.averageRenderTime.toFixed(2)}ms`);
      }
    }, [renderPerf.averageRenderTime]);
    
    return React.createElement(WrappedComponent, props);
  };
}