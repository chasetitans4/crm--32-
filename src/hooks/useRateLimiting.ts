'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RateLimiter,
  RequestThrottler,
  AdaptiveRateLimiter,
  CircuitBreaker,
  rateLimitConfigs,
  type RateLimitConfig,
  type ThrottleConfig
} from '@/utils/rateLimiting';

interface RateLimitState {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

interface ThrottleState {
  isThrottling: boolean;
  queueLength: number;
  activeRequests: number;
  totalProcessed: number;
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime: number;
  isAvailable: boolean;
}

// Hook for rate limiting
export function useRateLimit(config: RateLimitConfig) {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    remaining: config.maxRequests,
    resetTime: Date.now() + config.windowMs,
    retryAfter: 0
  });

  const rateLimiterRef = useRef<RateLimiter>();

  // Initialize rate limiter
  useEffect(() => {
    rateLimiterRef.current = new RateLimiter(config);
    
    return () => {
      rateLimiterRef.current?.destroy();
    };
  }, [config]);

  // Check rate limit
  const checkLimit = useCallback((request: any = { ip: 'default' }) => {
    if (!rateLimiterRef.current) return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() };
    
    const result = rateLimiterRef.current.check(request);
    
    setState({
      isLimited: !result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.allowed ? 0 : Math.ceil((result.resetTime - Date.now()) / 1000)
    });
    
    return result;
  }, [config.maxRequests]);

  // Reset rate limit for a specific request
  const resetLimit = useCallback((request: any = { ip: 'default' }) => {
    rateLimiterRef.current?.reset(request);
    setState(prev => ({
      ...prev,
      isLimited: false,
      remaining: config.maxRequests,
      retryAfter: 0
    }));
  }, [config.maxRequests]);

  // Get rate limiter stats
  const getStats = useCallback(() => {
    return rateLimiterRef.current?.getStats() || { totalKeys: 0, totalRequests: 0 };
  }, []);

  return {
    ...state,
    checkLimit,
    resetLimit,
    getStats
  };
}

// Hook for request throttling
export function useRequestThrottler(config: ThrottleConfig) {
  const [state, setState] = useState<ThrottleState>({
    isThrottling: false,
    queueLength: 0,
    activeRequests: 0,
    totalProcessed: 0
  });

  const throttlerRef = useRef<RequestThrottler>();
  const updateStatsInterval = useRef<NodeJS.Timeout>();

  // Initialize throttler
  useEffect(() => {
    throttlerRef.current = new RequestThrottler(config);
    
    // Update stats periodically
    updateStatsInterval.current = setInterval(() => {
      if (throttlerRef.current) {
        const stats = throttlerRef.current.getStats();
        setState({
          isThrottling: stats.queueLength > 0 || stats.activeRequests > 0,
          queueLength: stats.queueLength,
          activeRequests: stats.activeRequests,
          totalProcessed: stats.totalProcessed
        });
      }
    }, 1000);
    
    return () => {
      if (updateStatsInterval.current) {
        clearInterval(updateStatsInterval.current);
      }
      throttlerRef.current?.clear();
    };
  }, [config]);

  // Throttle a request
  const throttleRequest = useCallback(async <T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> => {
    if (!throttlerRef.current) {
      return request();
    }
    
    return throttlerRef.current.throttle(request, priority);
  }, []);

  // Clear throttle queue
  const clearQueue = useCallback(() => {
    throttlerRef.current?.clear();
    setState(prev => ({
      ...prev,
      queueLength: 0,
      isThrottling: false
    }));
  }, []);

  return {
    ...state,
    throttleRequest,
    clearQueue
  };
}

// Hook for adaptive rate limiting
export function useAdaptiveRateLimit(config: RateLimitConfig) {
  const [systemLoad, setSystemLoad] = useState(0);
  const [adaptedConfig, setAdaptedConfig] = useState(config);
  
  const rateLimitState = useRateLimit(adaptedConfig);
  const adaptiveLimiterRef = useRef<AdaptiveRateLimiter>();

  // Initialize adaptive rate limiter
  useEffect(() => {
    adaptiveLimiterRef.current = new AdaptiveRateLimiter(config);
    
    // Monitor system load
    const loadInterval = setInterval(() => {
      if (adaptiveLimiterRef.current) {
        const load = adaptiveLimiterRef.current.getSystemLoad();
        setSystemLoad(load);
        
        // Update adapted config based on system load
        const loadFactor = 1 - (load * 0.5);
        setAdaptedConfig({
          ...config,
          maxRequests: Math.floor(config.maxRequests * loadFactor),
          windowMs: Math.floor(config.windowMs * (1 + load * 0.5))
        });
      }
    }, 30000);
    
    return () => {
      clearInterval(loadInterval);
      adaptiveLimiterRef.current?.destroy();
    };
  }, [config]);

  return {
    ...rateLimitState,
    systemLoad,
    adaptedConfig,
    originalConfig: config
  };
}

// Hook for circuit breaker
export function useCircuitBreaker(
  failureThreshold: number = 5,
  recoveryTimeout: number = 60000,
  successThreshold: number = 3
) {
  const [state, setState] = useState<CircuitBreakerState>({
    state: 'closed',
    failures: 0,
    lastFailureTime: 0,
    isAvailable: true
  });

  const circuitBreakerRef = useRef<CircuitBreaker>();

  // Initialize circuit breaker
  useEffect(() => {
    circuitBreakerRef.current = new CircuitBreaker(
      failureThreshold,
      recoveryTimeout,
      successThreshold
    );
  }, [failureThreshold, recoveryTimeout, successThreshold]);

  // Execute operation with circuit breaker
  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    if (!circuitBreakerRef.current) {
      return operation();
    }
    
    try {
      const result = await circuitBreakerRef.current.execute(operation);
      
      // Update state after successful execution
      const breakerState = circuitBreakerRef.current.getState();
      setState({
        state: breakerState.state as 'closed' | 'open' | 'half-open',
        failures: breakerState.failures,
        lastFailureTime: breakerState.lastFailureTime,
        isAvailable: breakerState.state !== 'open'
      });
      
      return result;
    } catch (error) {
      // Update state after failure
      const breakerState = circuitBreakerRef.current.getState();
      setState({
        state: breakerState.state as 'closed' | 'open' | 'half-open',
        failures: breakerState.failures,
        lastFailureTime: breakerState.lastFailureTime,
        isAvailable: breakerState.state !== 'open'
      });
      
      throw error;
    }
  }, []);

  // Reset circuit breaker
  const reset = useCallback(() => {
    circuitBreakerRef.current?.reset();
    setState({
      state: 'closed',
      failures: 0,
      lastFailureTime: 0,
      isAvailable: true
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook for API request management with rate limiting and throttling
export function useApiRequestManager({
  rateLimitConfig = rateLimitConfigs.api,
  throttleConfig = { delay: 100, maxConcurrent: 5 },
  useCircuitBreaker: enableCircuitBreaker = true,
  circuitBreakerConfig = {}
}: {
  rateLimitConfig?: RateLimitConfig;
  throttleConfig?: ThrottleConfig;
  useCircuitBreaker?: boolean;
  circuitBreakerConfig?: {
    failureThreshold?: number;
    recoveryTimeout?: number;
    successThreshold?: number;
  };
} = {}) {
  const rateLimit = useRateLimit(rateLimitConfig);
  const throttler = useRequestThrottler(throttleConfig);
  const circuitBreaker = useCircuitBreaker(
    circuitBreakerConfig.failureThreshold,
    circuitBreakerConfig.recoveryTimeout,
    circuitBreakerConfig.successThreshold
  );

  // Make API request with all protections
  const makeRequest = useCallback(async <T>(
    request: () => Promise<T>,
    options: {
      priority?: number;
      bypassRateLimit?: boolean;
      bypassThrottle?: boolean;
      bypassCircuitBreaker?: boolean;
    } = {}
  ): Promise<T> => {
    const {
      priority = 0,
      bypassRateLimit = false,
      bypassThrottle = false,
      bypassCircuitBreaker = false
    } = options;

    // Check rate limit
    if (!bypassRateLimit) {
      const limitResult = rateLimit.checkLimit();
      if (!limitResult.allowed) {
        throw new Error(`Rate limit exceeded. Retry after ${rateLimit.retryAfter} seconds.`);
      }
    }

    // Check circuit breaker
    if (!bypassCircuitBreaker && enableCircuitBreaker && !circuitBreaker.isAvailable) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    // Execute request with throttling and circuit breaker
    const executeRequest = async () => {
      if (bypassThrottle) {
        return request();
      }
      return throttler.throttleRequest(request, priority);
    };

    if (bypassCircuitBreaker || !enableCircuitBreaker) {
      return executeRequest();
    }

    return circuitBreaker.execute(executeRequest);
  }, [rateLimit, throttler, circuitBreaker, enableCircuitBreaker]);

  // Get comprehensive stats
  const getStats = useCallback(() => {
    return {
      rateLimit: {
        ...rateLimit,
        stats: rateLimit.getStats()
      },
      throttler: {
        isThrottling: throttler.isThrottling,
        queueLength: throttler.queueLength,
        activeRequests: throttler.activeRequests,
        totalProcessed: throttler.totalProcessed
      },
      circuitBreaker: {
        state: circuitBreaker.state,
        failures: circuitBreaker.failures,
        isAvailable: circuitBreaker.isAvailable
      }
    };
  }, [rateLimit, throttler, circuitBreaker]);

  return {
    makeRequest,
    getStats,
    rateLimit,
    throttler,
    circuitBreaker
  };
}

// Hook for monitoring rate limiting metrics
export function useRateLimitMetrics() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    averageResponseTime: 0,
    peakRequestsPerMinute: 0,
    currentRequestsPerMinute: 0
  });

  const requestTimes = useRef<number[]>([]);
  const requestTimestamps = useRef<number[]>([]);
  const blockedCount = useRef(0);
  const totalCount = useRef(0);

  // Record request
  const recordRequest = useCallback((responseTime: number, wasBlocked: boolean = false) => {
    const now = Date.now();
    
    totalCount.current++;
    if (wasBlocked) {
      blockedCount.current++;
    } else {
      requestTimes.current.push(responseTime);
      requestTimestamps.current.push(now);
    }

    // Keep only last 1000 requests for performance
    if (requestTimes.current.length > 1000) {
      requestTimes.current = requestTimes.current.slice(-1000);
    }
    if (requestTimestamps.current.length > 1000) {
      requestTimestamps.current = requestTimestamps.current.slice(-1000);
    }

    // Calculate metrics
    const averageResponseTime = requestTimes.current.length > 0
      ? requestTimes.current.reduce((a, b) => a + b, 0) / requestTimes.current.length
      : 0;

    // Calculate requests per minute
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestTimestamps.current.filter(timestamp => timestamp > oneMinuteAgo);
    const currentRequestsPerMinute = recentRequests.length;

    setMetrics(prev => ({
      totalRequests: totalCount.current,
      blockedRequests: blockedCount.current,
      averageResponseTime,
      peakRequestsPerMinute: Math.max(prev.peakRequestsPerMinute, currentRequestsPerMinute),
      currentRequestsPerMinute
    }));
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    requestTimes.current = [];
    requestTimestamps.current = [];
    blockedCount.current = 0;
    totalCount.current = 0;
    setMetrics({
      totalRequests: 0,
      blockedRequests: 0,
      averageResponseTime: 0,
      peakRequestsPerMinute: 0,
      currentRequestsPerMinute: 0
    });
  }, []);

  return {
    metrics,
    recordRequest,
    resetMetrics
  };
}

// Export types
export type {
  RateLimitState,
  ThrottleState,
  CircuitBreakerState
};