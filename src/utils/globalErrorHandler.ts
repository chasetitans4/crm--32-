import { ErrorTracker } from './errorTracking';

interface GlobalErrorHandlerConfig {
  enableConsoleCapture?: boolean;
  enableNetworkCapture?: boolean;
  enablePerformanceCapture?: boolean;
  enableUserInteractionCapture?: boolean;
  enableUnhandledRejectionCapture?: boolean;
  enableResourceErrorCapture?: boolean;
  maxBreadcrumbs?: number;
  enableAutoErrorResolution?: boolean;
  reportToConsole?: boolean;
  reportToServer?: boolean;
  serverEndpoint?: string;
  apiKey?: string;
  environment?: string;
  release?: string;
  userId?: string;
  sessionId?: string;
  beforeSend?: (error: any) => any | null;
  onError?: (error: any) => void;
}

class GlobalErrorHandler {
  private errorTracker: ErrorTracker;
  private config: Required<GlobalErrorHandlerConfig>;
  private isInitialized = false;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private sessionId: string;

  constructor(config: GlobalErrorHandlerConfig = {}) {
    this.config = {
      enableConsoleCapture: true,
      enableNetworkCapture: true,
      enablePerformanceCapture: true,
      enableUserInteractionCapture: true,
      enableUnhandledRejectionCapture: true,
      enableResourceErrorCapture: true,
      maxBreadcrumbs: 100,
      enableAutoErrorResolution: false,
      reportToConsole: process.env.NODE_ENV === 'development',
      reportToServer: process.env.NODE_ENV === 'production',
      serverEndpoint: '/api/errors',
      apiKey: '',
      environment: process.env.NODE_ENV || 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      userId: '',
      sessionId: '',
      beforeSend: (error) => error,
      onError: () => {},
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.config.sessionId = this.sessionId;

    this.errorTracker = new ErrorTracker();

    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.warn('GlobalErrorHandler is already initialized');
      return;
    }

    if (typeof window === 'undefined') {
      console.warn('GlobalErrorHandler can only be initialized in browser environment');
      return;
    }

    this.setupGlobalErrorHandlers();
    this.setupConsoleCapture();
    this.setupNetworkErrorCapture();
    this.setupResourceErrorCapture();
    this.setupPerformanceMonitoring();
    this.setupUserInteractionTracking();

    this.isInitialized = true;

    // Add breadcrumb for initialization
    this.errorTracker.addBreadcrumb({
      message: 'Global error handler initialized',
      category: 'console',
      level: 'info',
      timestamp: Date.now(),
      data: {
        sessionId: this.sessionId,
        environment: this.config.environment,
        release: this.config.release
      }
    });

    console.log('🛡️ Global Error Handler initialized');
  }

  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    // Remove event listeners
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);

    // Restore original console methods
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;

    this.isInitialized = false;
    console.log('🛡️ Global Error Handler destroyed');
  }

  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    window.addEventListener('error', this.handleGlobalError);

    // Handle unhandled promise rejections
    if (this.config.enableUnhandledRejectionCapture) {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  private handleGlobalError = (event: ErrorEvent): void => {
    const error = event.error || new Error(event.message);
    
    this.captureError(error, {
      category: 'javascript',
      severity: 'high',
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'global-error-handler',
        type: 'ErrorEvent'
      },
      tags: {
        source: 'window.onerror'
      }
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    this.captureError(error, {
      category: 'promise',
      severity: 'high',
      context: {
        reason: event.reason,
        source: 'global-error-handler',
        type: 'PromiseRejectionEvent'
      },
      tags: {
        source: 'unhandledrejection'
      }
    });

    // Prevent the default browser behavior
    event.preventDefault();
  };

  private setupConsoleCapture(): void {
    if (!this.config.enableConsoleCapture) return;

    // Capture console.error calls
    console.error = (...args: any[]) => {
      this.originalConsoleError.apply(console, args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.errorTracker.addBreadcrumb({
        message: `Console Error: ${message}`,
        category: 'console',
        level: 'error',
        timestamp: Date.now(),
        data: { args }
      });
    };

    // Capture console.warn calls
    console.warn = (...args: any[]) => {
      this.originalConsoleWarn.apply(console, args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.errorTracker.addBreadcrumb({
        message: `Console Warning: ${message}`,
        category: 'console',
        level: 'warning',
        timestamp: Date.now(),
        data: { args }
      });
    };
  }

  private setupNetworkErrorCapture(): void {
    if (!this.config.enableNetworkCapture) return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : 
                   args[0] instanceof Request ? args[0].url : 
                   args[0] instanceof URL ? args[0].href : 
                   String(args[0]);
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        // Log successful requests as breadcrumbs
        this.errorTracker.addBreadcrumb({
          message: `HTTP ${method} ${url}`,
          category: 'http',
          level: response.ok ? 'info' : 'warning',
          timestamp: Date.now(),
          data: {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            duration
          }
        });

        // Capture HTTP errors
        if (!response.ok) {
          this.captureError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
            category: 'network',
            severity: response.status >= 500 ? 'high' : 'medium',
            context: {
              url,
              method,
              status: response.status,
              statusText: response.statusText,
              duration,
              source: 'fetch-interceptor'
            },
            tags: {
              httpStatus: response.status.toString(),
              httpMethod: method
            }
          });
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.captureError(error as Error, {
          category: 'network',
          severity: 'high',
          context: {
            url,
            method,
            duration,
            source: 'fetch-interceptor',
            type: 'NetworkError'
          },
          tags: {
            httpMethod: method,
            networkError: true
          }
        });

        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      (this as any)._errorHandler = {
        method,
        url: url.toString(),
        startTime: Date.now()
      };
      return originalXHROpen.call(this, method, url, async ?? true, username, password);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const errorHandler = (this as any)._errorHandler;
      
      this.addEventListener('load', () => {
        if (errorHandler) {
          const duration = Date.now() - errorHandler.startTime;
          
          globalErrorHandler.errorTracker.addBreadcrumb({
            message: `XHR ${errorHandler.method} ${errorHandler.url}`,
            category: 'http',
            level: this.status >= 400 ? 'warning' : 'info',
            timestamp: Date.now(),
            data: {
              url: errorHandler.url,
              method: errorHandler.method,
              status: this.status,
              statusText: this.statusText,
              duration
            }
          });

          if (this.status >= 400) {
            globalErrorHandler.captureError(
              new Error(`XHR ${this.status}: ${this.statusText}`),
              {
                category: 'network',
                severity: this.status >= 500 ? 'high' : 'medium',
                context: {
                  url: errorHandler.url,
                  method: errorHandler.method,
                  status: this.status,
                  statusText: this.statusText,
                  duration,
                  source: 'xhr-interceptor'
                },
                tags: {
                  httpStatus: this.status.toString(),
                  httpMethod: errorHandler.method
                }
              }
            );
          }
        }
      });

      this.addEventListener('error', () => {
        if (errorHandler) {
          const duration = Date.now() - errorHandler.startTime;
          
          globalErrorHandler.captureError(
            new Error(`XHR Network Error: ${errorHandler.method} ${errorHandler.url}`),
            {
              category: 'network',
              severity: 'high',
              context: {
                url: errorHandler.url,
                method: errorHandler.method,
                duration,
                source: 'xhr-interceptor',
                type: 'NetworkError'
              },
              tags: {
                httpMethod: errorHandler.method,
                networkError: true
              }
            }
          );
        }
      });

      return originalXHRSend.call(this, body);
    };
  }

  private setupResourceErrorCapture(): void {
    if (!this.config.enableResourceErrorCapture) return;

    window.addEventListener('error', (event) => {
      // Handle resource loading errors (images, scripts, stylesheets, etc.)
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        const tagName = target.tagName?.toLowerCase();
        const src = (target as any).src || (target as any).href;

        if (src) {
          this.captureError(new Error(`Resource loading failed: ${src}`), {
            category: 'resource',
            severity: 'medium',
            context: {
              tagName,
              src,
              source: 'resource-error-handler',
              type: 'ResourceError'
            },
            tags: {
              resourceType: tagName,
              resourceError: true
            }
          });
        }
      }
    }, true); // Use capture phase
  }

  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceCapture) return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.errorTracker.addBreadcrumb({
                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                category: 'performance',
                level: 'warning',
                timestamp: Date.now(),
                data: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name
                }
              });
            }
          }
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        const usagePercent = (usedMB / limitMB) * 100;

        if (usagePercent > 80) {
          this.errorTracker.addBreadcrumb({
            message: `High memory usage: ${usagePercent.toFixed(1)}%`,
            category: 'performance',
            level: 'warning',
            timestamp: Date.now(),
            data: {
              usedMB: usedMB.toFixed(2),
              limitMB: limitMB.toFixed(2),
              usagePercent: usagePercent.toFixed(1)
            }
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private setupUserInteractionTracking(): void {
    if (!this.config.enableUserInteractionCapture) return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName?.toLowerCase();
      const id = target.id;
      const className = target.className;
      const text = target.textContent?.slice(0, 50);

      this.errorTracker.addBreadcrumb({
        message: `User clicked ${tagName}${id ? `#${id}` : ''}${className ? `.${className.split(' ')[0]}` : ''}`,
        category: 'user',
        level: 'info',
        timestamp: Date.now(),
        data: {
          tagName,
          id,
          className,
          text,
          x: event.clientX,
          y: event.clientY
        }
      });
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.errorTracker.addBreadcrumb({
        message: `Navigation to ${window.location.pathname}`,
        category: 'navigation',
        level: 'info',
        timestamp: Date.now(),
        data: {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        }
      });
    });
  }

  public captureError(error: Error, options: any = {}): string {
    // Apply beforeSend filter
    const processedError = this.config.beforeSend(error);
    if (!processedError) {
      return '';
    }

    // Add global context
    const enhancedOptions = {
      ...options,
      context: {
        ...options.context,
        sessionId: this.sessionId,
        userId: this.config.userId,
        environment: this.config.environment,
        release: this.config.release,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      },
      tags: {
        ...options.tags,
        environment: this.config.environment,
        release: this.config.release
      }
    };

    // Capture with error tracker
    const errorId = this.errorTracker.captureError(processedError, enhancedOptions);

    // Report to console if enabled
    if (this.config.reportToConsole) {
      console.group(`🚨 Error Captured [${errorId}]`);
      console.error('Error:', processedError);
      console.error('Options:', enhancedOptions);
      console.groupEnd();
    }

    // Report to server if enabled
    if (this.config.reportToServer && this.config.serverEndpoint) {
      this.reportToServer(errorId, processedError, enhancedOptions);
    }

    // Call custom error handler
    this.config.onError(processedError);

    return errorId;
  }

  private async reportToServer(errorId: string, error: Error, options: any): Promise<void> {
    try {
      const payload = {
        errorId,
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...options,
        timestamp: Date.now()
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch (reportError) {
      console.error('Failed to report error to server:', reportError);
    }
  }

  public setUser(userId: string, userData?: Record<string, any>): void {
    this.config.userId = userId;
    
    this.errorTracker.addBreadcrumb({
      message: `User identified: ${userId}`,
      category: 'user',
      level: 'info',
      timestamp: Date.now(),
      data: userData
    });
  }

  public setContext(key: string, value: any): void {
    this.errorTracker.addBreadcrumb({
      message: `Context updated: ${key}`,
      category: 'console',
      level: 'info',
      timestamp: Date.now(),
      data: { [key]: value }
    });
  }

  public addBreadcrumb(message: string, category: 'navigation' | 'user' | 'console' | 'network' | 'dom' | 'http' | 'performance' = 'console', level: 'info' | 'warning' | 'error' | 'debug' = 'info', data?: any): void {
    this.errorTracker.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now(),
      data
    });
  }

  public getMetrics() {
    return this.errorTracker.getMetrics();
  }

  public getRecentErrors() {
    return this.errorTracker.getRecentErrors();
  }

  public clearErrors(): void {
    this.errorTracker.clearErrors();
  }

  public exportErrors(): string {
    return this.errorTracker.exportErrors();
  }
}

// Global instance
let globalErrorHandler: GlobalErrorHandler;

export const initializeGlobalErrorHandler = (config?: GlobalErrorHandlerConfig): GlobalErrorHandler => {
  if (globalErrorHandler) {
    console.warn('Global error handler already initialized');
    return globalErrorHandler;
  }

  globalErrorHandler = new GlobalErrorHandler(config);
  globalErrorHandler.initialize();
  
  return globalErrorHandler;
};

export const getGlobalErrorHandler = (): GlobalErrorHandler | null => {
  return globalErrorHandler || null;
};

export const destroyGlobalErrorHandler = (): void => {
  if (globalErrorHandler) {
    globalErrorHandler.destroy();
    globalErrorHandler = null as any;
  }
};

export { GlobalErrorHandler };
export type { GlobalErrorHandlerConfig };