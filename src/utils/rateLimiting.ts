'use client';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any) => void;
  message?: string;
  statusCode?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface ThrottleConfig {
  delay: number; // Delay between requests in milliseconds
  maxConcurrent?: number; // Maximum concurrent requests
  priority?: 'fifo' | 'lifo' | 'priority';
}

interface RequestInfo {
  id: string;
  timestamp: number;
  priority?: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  request: () => Promise<any>;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  protected config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => req.ip || 'default',
      message: 'Too many requests',
      statusCode: 429,
      ...config
    };

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.store.entries())) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  private getKey(req: any): string {
    return this.config.keyGenerator!(req);
  }

  public check(req: any): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let entry = this.store.get(key);

    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        firstRequest: now
      };
      this.store.set(key, entry);
    }

    // Check if within rate limit
    const allowed = entry.count < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count - 1);

    if (allowed) {
      entry.count++;
    } else if (this.config.onLimitReached) {
      this.config.onLimitReached(req);
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    };
  }

  public reset(req: any): void {
    const key = this.getKey(req);
    this.store.delete(key);
  }

  public getStats(): { totalKeys: number; totalRequests: number } {
    let totalRequests = 0;
    for (const entry of Array.from(this.store.values())) {
      totalRequests += entry.count;
    }
    return {
      totalKeys: this.store.size,
      totalRequests
    };
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

class RequestThrottler {
  private queue: RequestInfo[] = [];
  private activeRequests: Set<string> = new Set();
  private config: ThrottleConfig;
  private lastRequestTime: number = 0;
  private requestCounter: number = 0;

  constructor(config: ThrottleConfig) {
    this.config = {
      maxConcurrent: 5,
      priority: 'fifo',
      ...config
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    if (this.activeRequests.size >= this.config.maxConcurrent!) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.delay) {
      setTimeout(() => this.processQueue(), this.config.delay - timeSinceLastRequest);
      return;
    }

    // Sort queue based on priority strategy
    this.sortQueue();

    const requestInfo = this.queue.shift();
    if (!requestInfo) return;

    this.activeRequests.add(requestInfo.id);
    this.lastRequestTime = now;

    try {
      const result = await requestInfo.request();
      requestInfo.resolve(result);
    } catch (error) {
      requestInfo.reject(error);
    } finally {
      this.activeRequests.delete(requestInfo.id);
      // Process next request after a delay
      setTimeout(() => this.processQueue(), this.config.delay);
    }
  }

  private sortQueue(): void {
    switch (this.config.priority) {
      case 'lifo':
        // Last in, first out - reverse order
        this.queue.reverse();
        break;
      case 'priority':
        // Sort by priority (higher number = higher priority)
        this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
      case 'fifo':
      default:
        // First in, first out - maintain order
        break;
    }
  }

  public async throttle<T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestInfo: RequestInfo = {
        id: this.generateRequestId(),
        timestamp: Date.now(),
        priority,
        resolve,
        reject,
        request
      };

      this.queue.push(requestInfo);
      this.processQueue();
    });
  }

  public getStats(): {
    queueLength: number;
    activeRequests: number;
    totalProcessed: number;
  } {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests.size,
      totalProcessed: this.requestCounter
    };
  }

  public clear(): void {
    // Reject all pending requests
    this.queue.forEach(req => {
      req.reject(new Error('Request queue cleared'));
    });
    this.queue = [];
  }
}

// Adaptive rate limiter that adjusts based on system load
class AdaptiveRateLimiter extends RateLimiter {
  private systemLoad: number = 0;
  private loadCheckInterval: NodeJS.Timeout;
  private baseConfig: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    super(config);
    this.baseConfig = { ...config };
    
    // Monitor system load every 30 seconds
    this.loadCheckInterval = setInterval(() => {
      this.updateSystemLoad();
    }, 30000);
  }

  private async updateSystemLoad(): Promise<void> {
    try {
      // Simulate system load calculation
      // In a real implementation, this would check CPU, memory, etc.
      const stats = this.getStats();
      this.systemLoad = Math.min(stats.totalRequests / 1000, 1); // Normalize to 0-1
      
      // Adjust rate limit based on load
      this.adjustRateLimit();
    } catch (error) {
      console.warn('Failed to update system load:', error);
    }
  }

  private adjustRateLimit(): void {
    // Reduce rate limit when system load is high
    const loadFactor = 1 - (this.systemLoad * 0.5); // Reduce by up to 50%
    this.config.maxRequests = Math.floor(this.baseConfig.maxRequests * loadFactor);
    this.config.windowMs = Math.floor(this.baseConfig.windowMs * (1 + this.systemLoad * 0.5));
  }

  public getSystemLoad(): number {
    return this.systemLoad;
  }

  public destroy(): void {
    super.destroy();
    if (this.loadCheckInterval) {
      clearInterval(this.loadCheckInterval);
    }
  }
}

// Circuit breaker for API protection
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private successCount: number = 0;

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private successThreshold: number = 3
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  public getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }

  public reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
    this.successCount = 0;
  }
}

// Rate limiting middleware factory
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const rateLimiter = new RateLimiter(config);

  return (req: any, res: any, next: any) => {
    const result = rateLimiter.check(req);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      res.status(config.statusCode || 429).json({
        error: config.message || 'Too many requests',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
      return;
    }

    next();
  };
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  moderate: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500
  },
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  }
};

// Export classes and types
export {
  RateLimiter,
  RequestThrottler,
  AdaptiveRateLimiter,
  CircuitBreaker
};

export type {
  RateLimitConfig,
  RateLimitEntry,
  ThrottleConfig,
  RequestInfo
};