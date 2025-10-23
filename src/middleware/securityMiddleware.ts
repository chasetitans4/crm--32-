import { securityService } from "../utils/security"
import { auditLogService } from "../services/auditLogService"

export interface SecurityMiddlewareConfig {
  enableCSRF: boolean
  enableRateLimit: boolean
  enableInputSanitization: boolean
  enableSessionValidation: boolean
  enableAuditLogging: boolean
  maxRequestsPerMinute: number
  sessionTimeoutMinutes: number
}

export interface SecurityContext {
  userId?: string
  userRole?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export interface SecurityResult {
  allowed: boolean
  reason?: string
  action?: "block" | "warn" | "log"
  metadata?: Record<string, any>
}

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(config: Partial<SecurityMiddlewareConfig> = {}) {
    this.config = {
      enableCSRF: true,
      enableRateLimit: true,
      enableInputSanitization: true,
      enableSessionValidation: true,
      enableAuditLogging: true,
      maxRequestsPerMinute: 60,
      sessionTimeoutMinutes: 30,
      ...config,
    }
  }

  async validateRequest(context: SecurityContext, requestData?: Record<string, unknown>, csrfToken?: string): Promise<SecurityResult> {
    const results: SecurityResult[] = []

    // Rate limiting check
    if (this.config.enableRateLimit) {
      const rateLimitResult = this.checkRateLimit(context)
      if (!rateLimitResult.allowed) {
        return rateLimitResult
      }
      results.push(rateLimitResult)
    }

    // CSRF token validation
    if (this.config.enableCSRF && csrfToken) {
      const csrfResult = await this.validateCSRF(csrfToken, context)
      if (!csrfResult.allowed) {
        return csrfResult
      }
      results.push(csrfResult)
    }

    // Session validation
    if (this.config.enableSessionValidation && context.sessionId) {
      const sessionResult = await this.validateSession(context)
      if (!sessionResult.allowed) {
        return sessionResult
      }
      results.push(sessionResult)
    }

    // Input sanitization
    if (this.config.enableInputSanitization && requestData) {
      const sanitizationResult = this.sanitizeInput(requestData)
      results.push(sanitizationResult)
    }

    // Audit logging
    if (this.config.enableAuditLogging) {
      await this.logSecurityEvent(context, "request_validated", {
        checks: results.map((r) => ({ allowed: r.allowed, reason: r.reason })),
      })
    }

    return {
      allowed: true,
      action: "log",
      metadata: { checks: results },
    }
  }

  private checkRateLimit(context: SecurityContext): SecurityResult {
    const key = context.ipAddress || context.userId || "anonymous"
    const now = Date.now()
    const windowStart = now - 60 * 1000 // 1 minute window

    const current = this.requestCounts.get(key)
    if (!current || current.resetTime < now) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60 * 1000 })
      return { allowed: true, action: "log" }
    }

    if (current.count >= this.config.maxRequestsPerMinute) {
      return {
        allowed: false,
        reason: "Rate limit exceeded",
        action: "block",
        metadata: { limit: this.config.maxRequestsPerMinute, current: current.count },
      }
    }

    current.count++
    return { allowed: true, action: "log" }
  }

  private async validateCSRF(token: string, context: SecurityContext): Promise<SecurityResult> {
    const isValid = securityService.validateCSRFToken(token)

    if (!isValid) {
      await this.logSecurityEvent(context, "csrf_validation_failed", { token })
      return {
        allowed: false,
        reason: "Invalid CSRF token",
        action: "block",
      }
    }

    return { allowed: true, action: "log" }
  }

  private async validateSession(context: SecurityContext): Promise<SecurityResult> {
    if (!context.sessionId) {
      return {
        allowed: false,
        reason: "No session ID provided",
        action: "block",
      }
    }

    const isValid = securityService.validateSession(context.sessionId)

    if (!isValid) {
      await this.logSecurityEvent(context, "session_validation_failed", {
        sessionId: context.sessionId,
      })
      return {
        allowed: false,
        reason: "Invalid or expired session",
        action: "block",
      }
    }

    return { allowed: true, action: "log" }
  }

  private sanitizeInput(data: Record<string, unknown>): SecurityResult {
    try {
      const sanitized = securityService.sanitizeInput(JSON.stringify(data))
      const hasChanges = sanitized !== JSON.stringify(data)

      return {
        allowed: true,
        action: hasChanges ? "warn" : "log",
        reason: hasChanges ? "Input was sanitized" : undefined,
        metadata: { sanitized: hasChanges },
      }
    } catch (error) {
      return {
        allowed: false,
        reason: "Input sanitization failed",
        action: "block",
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      }
    }
  }

  private async logSecurityEvent(
    context: SecurityContext,
    event: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await auditLogService.log({
        userId: context.userId || "anonymous",
        action: `security.${event}`,
        resource: "security_middleware",
        details: {
          ...metadata,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
        },
        severity: (metadata.severity as "low" | "medium" | "high" | "critical") || "low",
        category: "security",
        success: true,
      })
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  // Security headers for HTTP responses
  getSecurityHeaders(): Record<string, string> {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": securityService.generateCSPHeader(),
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    }
  }

  // Clean up expired rate limit entries
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    this.requestCounts.forEach((value, key) => {
      if (value.resetTime < now) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.requestCounts.delete(key))
  }

  // Get security metrics
  getMetrics(): Record<string, any> {
    return {
      activeRateLimits: this.requestCounts.size,
      config: this.config,
      timestamp: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const securityMiddleware = new SecurityMiddleware()

// Auto-cleanup every 5 minutes
setInterval(
  () => {
    securityMiddleware.cleanup()
  },
  5 * 60 * 1000,
)
