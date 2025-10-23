// Performance monitoring utilities
export interface PerformanceMetrics {
  moduleId: string
  loadTime: number
  userId: string
  timestamp: Date
  deviceType: string
  connectionType?: string
}

export interface ErrorContext {
  userId: string
  module: string
  context: string
  userAgent: string
  url: string
  timestamp: Date
}

export interface UserJourneyData {
  modulesViewed: string[]
  timeSpent: number
  completionRate: number
  deviceType: string
  sessionId: string
  userId: string
}

// Analytics service
class AnalyticsService {
  private isEnabled = true
  private queue: any[] = []
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupBeforeUnload()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupBeforeUnload(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flushQueue()
      })
    }
  }

  track(event: string, properties: Record<string, any>): void {
    if (!this.isEnabled) return
    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
    }
    this.queue.push(eventData)
    // Auto-flush queue when it gets large
    if (this.queue.length >= 10) {
      this.flushQueue()
    }
  }

  private flushQueue(): void {
    if (this.queue.length === 0) return
    // Send to analytics service (example)
    if (typeof fetch !== "undefined") {
      fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: this.queue }),
      }).catch((error) => {
          // Silent error handling - Failed to send analytics
        })
    }
    this.queue = []
  }

  disable(): void {
    this.isEnabled = false
  }

  enable(): void {
    this.isEnabled = true
  }
}

// Error reporting service
class ErrorReportingService {
  private isEnabled = true

  captureException(error: Error, context: Partial<ErrorContext>): void {
    if (!this.isEnabled) return
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        url: typeof window !== "undefined" ? window.location.href : "",
      },
    }
    // Silent error handling - Error captured
    // Send to error reporting service (example)
    if (typeof fetch !== "undefined") {
      fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorData),
      }).catch((err) => {
        // Silent error handling - Failed to report error
      })
    }
  }

  disable(): void {
    this.isEnabled = false
  }

  enable(): void {
    this.isEnabled = true
  }
}

// Performance monitoring service
class PerformanceService {
  private metrics: Map<string, number> = new Map()

  startMeasure(name: string): void {
    if (typeof performance !== "undefined") {
      performance.mark(`${name}-start`)
    } else {
      this.metrics.set(`${name}-start`, Date.now())
    }
  }

  endMeasure(name: string): number {
    if (typeof performance !== "undefined") {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      const measure = performance.getEntriesByName(name)[0]
      return measure ? measure.duration : 0
    } else {
      const startTime = this.metrics.get(`${name}-start`)
      if (startTime) {
        const duration = Date.now() - startTime
        this.metrics.delete(`${name}-start`)
        return duration
      }
      return 0
    }
  }

  getNavigationTiming(): Record<string, number> {
    if (typeof performance === "undefined" || !performance.navigation) {
      return {}
    }
    const timing = performance.timing
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      firstPaint: timing.responseEnd - timing.navigationStart,
    }
  }
}

// Utility functions
export const getDeviceType = (): string => {
  if (typeof window === "undefined") return "unknown"
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

export const getConnectionType = (): string => {
  if (typeof navigator === "undefined" || !("connection" in navigator)) {
    return "unknown"
  }
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
  return connection?.effectiveType || "unknown"
}

export const calculateCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// Singleton instances
export const analytics = new AnalyticsService()
export const errorReporting = new ErrorReportingService()
export const performanceMonitor = new PerformanceService()

// Monitoring utility functions
export const trackModuleLoad = (moduleId: string, loadTime: number, userId: string): void => {
  analytics.track("module_loaded", {
    moduleId,
    loadTime,
    userId,
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
  })
}

export const setupErrorTracking = (userId: string, activeModule: string): void => {
  if (typeof window === "undefined") return
  // Global error handler
  window.addEventListener("error", (event) => {
    errorReporting.captureException(event.error || new Error(event.message), {
      userId,
      module: activeModule,
      context: "training-dashboard",
    })
  })
  // Unhandled promise rejection handler
  window.addEventListener("unhandledrejection", (event) => {
    errorReporting.captureException(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      userId,
      module: activeModule,
      context: "training-dashboard-promise",
    })
  })
}

export const trackUserJourney = (data: UserJourneyData): void => {
  analytics.track("training_journey", {
    modulesViewed: data.modulesViewed,
    timeSpent: data.timeSpent,
    completionRate: data.completionRate,
    deviceType: data.deviceType,
    sessionId: data.sessionId,
    userId: data.userId,
  })
}

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const startMeasure = (name: string) => {
    performanceMonitor.startMeasure(name)
  }
  const endMeasure = (name: string) => {
    const duration = performanceMonitor.endMeasure(name)
    analytics.track("performance_measure", {
      measureName: name,
      duration,
      deviceType: getDeviceType(),
    })
    return duration
  }
  return { startMeasure, endMeasure }
}

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private max: number

  constructor(options: { windowMs: number; max: number }) {
    this.windowMs = options.windowMs
    this.max = options.max
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs)
    if (validRequests.length >= this.max) {
      return false
    }
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter((time) => now - time < this.windowMs)
    return Math.max(0, this.max - validRequests.length)
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier)
    } else {
      this.requests.clear()
    }
  }
}
