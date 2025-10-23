import { NextRequest, NextResponse } from 'next/server';
import {
  RateLimiter,
  AdaptiveRateLimiter,
  CircuitBreaker,
  rateLimitConfigs,
  type RateLimitConfig
} from '@/utils/rateLimiting';

interface MiddlewareConfig {
  rateLimitConfig?: RateLimitConfig;
  enableAdaptiveRateLimit?: boolean;
  enableCircuitBreaker?: boolean;
  circuitBreakerConfig?: {
    failureThreshold?: number;
    recoveryTimeout?: number;
    successThreshold?: number;
  };
  excludePaths?: string[];
  includePaths?: string[];
  customKeyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest) => void;
  enableMetrics?: boolean;
}

interface RequestMetrics {
  totalRequests: number;
  blockedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastResetTime: number;
}

class RateLimitMiddleware {
  private rateLimiter: RateLimiter | AdaptiveRateLimiter;
  private circuitBreaker?: CircuitBreaker;
  private config: Required<MiddlewareConfig>;
  private metrics: RequestMetrics;
  private responseTimes: number[] = [];
  private errorCount: number = 0;

  constructor(config: MiddlewareConfig = {}) {
    this.config = {
      rateLimitConfig: rateLimitConfigs.api,
      enableAdaptiveRateLimit: false,
      enableCircuitBreaker: true,
      circuitBreakerConfig: {
        failureThreshold: 5,
        recoveryTimeout: 60000,
        successThreshold: 3
      },
      excludePaths: ['/api/health', '/api/metrics'],
      includePaths: [],
      customKeyGenerator: (req) => this.getClientIdentifier(req),
      onLimitReached: () => {},
      enableMetrics: true,
      ...config
    };

    // Initialize rate limiter
    if (this.config.enableAdaptiveRateLimit) {
      this.rateLimiter = new AdaptiveRateLimiter({
        ...this.config.rateLimitConfig,
        keyGenerator: this.config.customKeyGenerator,
        onLimitReached: this.config.onLimitReached
      });
    } else {
      this.rateLimiter = new RateLimiter({
        ...this.config.rateLimitConfig,
        keyGenerator: this.config.customKeyGenerator,
        onLimitReached: this.config.onLimitReached
      });
    }

    // Initialize circuit breaker
    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(
        this.config.circuitBreakerConfig.failureThreshold,
        this.config.circuitBreakerConfig.recoveryTimeout,
        this.config.circuitBreakerConfig.successThreshold
      );
    }

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastResetTime: Date.now()
    };
  }

  private getClientIdentifier(req: NextRequest): string {
    // Try to get real IP from various headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    let ip = forwarded?.split(',')[0] || realIp || cfConnectingIp;
    
    // Final fallback
    if (!ip) {
      ip = 'unknown';
    }

    // Include user agent for more specific identification
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const userAgentHash = this.simpleHash(userAgent);
    
    return `${ip}:${userAgentHash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private shouldApplyRateLimit(pathname: string): boolean {
    // Check exclude paths
    if (this.config.excludePaths.some(path => pathname.startsWith(path))) {
      return false;
    }

    // Check include paths (if specified, only apply to these paths)
    if (this.config.includePaths.length > 0) {
      return this.config.includePaths.some(path => pathname.startsWith(path));
    }

    // Default: apply to all API routes
    return pathname.startsWith('/api/');
  }

  private updateMetrics(responseTime: number, wasBlocked: boolean, wasError: boolean): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalRequests++;
    
    if (wasBlocked) {
      this.metrics.blockedRequests++;
    } else {
      this.responseTimes.push(responseTime);
      
      // Keep only last 1000 response times
      if (this.responseTimes.length > 1000) {
        this.responseTimes = this.responseTimes.slice(-1000);
      }
      
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }

    if (wasError) {
      this.errorCount++;
    }

    this.metrics.errorRate = (this.errorCount / this.metrics.totalRequests) * 100;
  }

  private createRateLimitResponse(remaining: number, resetTime: number): NextResponse {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      },
      { status: 429 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', this.config.rateLimitConfig.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
    response.headers.set('Retry-After', retryAfter.toString());

    return response;
  }

  private createCircuitBreakerResponse(): NextResponse {
    return NextResponse.json(
      {
        error: 'Service Unavailable',
        message: 'Service is temporarily unavailable. Please try again later.'
      },
      { status: 503 }
    );
  }

  public async handle(req: NextRequest): Promise<NextResponse | null> {
    const startTime = Date.now();
    const pathname = req.nextUrl.pathname;

    // Skip rate limiting for excluded paths
    if (!this.shouldApplyRateLimit(pathname)) {
      return null;
    }

    try {
      // Check circuit breaker
      if (this.circuitBreaker) {
        const breakerState = this.circuitBreaker.getState();
        if (breakerState.state === 'open') {
          this.updateMetrics(Date.now() - startTime, false, true);
          return this.createCircuitBreakerResponse();
        }
      }

      // Check rate limit
      const rateLimitResult = this.rateLimiter.check(req);
      
      if (!rateLimitResult.allowed) {
        this.updateMetrics(Date.now() - startTime, true, false);
        return this.createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime);
      }

      // Request is allowed, continue processing
      return null;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      this.updateMetrics(Date.now() - startTime, false, true);
      
      // Fail open - allow request to continue
      return null;
    }
  }

  public getMetrics(): RequestMetrics & {
    rateLimiterStats: any;
    circuitBreakerState?: any;
    systemLoad?: number;
  } {
    const result: any = {
      ...this.metrics,
      rateLimiterStats: this.rateLimiter.getStats()
    };

    if (this.circuitBreaker) {
      result.circuitBreakerState = this.circuitBreaker.getState();
    }

    if (this.rateLimiter instanceof AdaptiveRateLimiter) {
      result.systemLoad = this.rateLimiter.getSystemLoad();
    }

    return result;
  }

  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastResetTime: Date.now()
    };
    this.responseTimes = [];
    this.errorCount = 0;
  }

  public destroy(): void {
    if (this.rateLimiter instanceof AdaptiveRateLimiter) {
      this.rateLimiter.destroy();
    } else {
      this.rateLimiter.destroy();
    }
  }
}

// Global middleware instance
let globalMiddleware: RateLimitMiddleware | null = null;

// Initialize global middleware
export function initializeRateLimitMiddleware(config: MiddlewareConfig = {}): void {
  if (globalMiddleware) {
    globalMiddleware.destroy();
  }
  globalMiddleware = new RateLimitMiddleware(config);
}

// Get global middleware instance
export function getRateLimitMiddleware(): RateLimitMiddleware {
  if (!globalMiddleware) {
    globalMiddleware = new RateLimitMiddleware();
  }
  return globalMiddleware;
}

// Middleware function for Next.js
export async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const middleware = getRateLimitMiddleware();
  return middleware.handle(req);
}

// API route wrapper for rate limiting
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: MiddlewareConfig
) {
  const middleware = new RateLimitMiddleware(config);
  
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await middleware.handle(req);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    try {
      const response = await handler(req);
      
      // Add rate limit headers to successful responses
      const rateLimitResult = middleware.getMetrics().rateLimiterStats;
      if (rateLimitResult) {
        response.headers.set('X-RateLimit-Limit', config?.rateLimitConfig?.maxRequests?.toString() || '60');
        response.headers.set('X-RateLimit-Remaining', '0'); // Would need to track this properly
      }
      
      return response;
    } catch (error) {
      // Handle circuit breaker for failed requests
      throw error;
    }
  };
}

// Predefined middleware configurations
export const middlewareConfigs = {
  strict: {
    rateLimitConfig: rateLimitConfigs.strict,
    enableAdaptiveRateLimit: true,
    enableCircuitBreaker: true
  },
  moderate: {
    rateLimitConfig: rateLimitConfigs.moderate,
    enableAdaptiveRateLimit: false,
    enableCircuitBreaker: true
  },
  lenient: {
    rateLimitConfig: rateLimitConfigs.lenient,
    enableAdaptiveRateLimit: false,
    enableCircuitBreaker: false
  },
  api: {
    rateLimitConfig: rateLimitConfigs.api,
    enableAdaptiveRateLimit: true,
    enableCircuitBreaker: true,
    includePaths: ['/api/']
  },
  auth: {
    rateLimitConfig: rateLimitConfigs.auth,
    enableAdaptiveRateLimit: false,
    enableCircuitBreaker: true,
    includePaths: ['/api/auth/', '/api/login', '/api/register']
  }
};

export { RateLimitMiddleware };
export type { MiddlewareConfig, RequestMetrics };