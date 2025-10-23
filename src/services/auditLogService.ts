// Audit logging service for tracking user actions and system events
import { configService } from "./configService"
import { secureStorage } from "../utils/secureStorage"

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId?: string
  userEmail?: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  severity: "low" | "medium" | "high" | "critical"
  category: "auth" | "data" | "system" | "security" | "user" | "api"
  success: boolean
  errorMessage?: string
  metadata?: Record<string, unknown>
}

export interface AuditLogFilter {
  userId?: string
  action?: string
  resource?: string
  category?: string
  severity?: string
  startDate?: Date
  endDate?: Date
  success?: boolean
  limit?: number
  offset?: number
}

export interface AuditLogStats {
  totalEntries: number
  entriesByCategory: Record<string, number>
  entriesBySeverity: Record<string, number>
  failureRate: number
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ userId: string; userEmail: string; count: number }>
  recentActivity: AuditLogEntry[]
}

class AuditLogService {
  private logs: AuditLogEntry[] = []
  private maxLocalLogs = 1000
  private batchSize = 50
  private pendingLogs: AuditLogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private initialized = false

  async initialize(): Promise<void> {
    try {
      // Load existing logs from localStorage
      await this.loadFromStorage()

      // Start periodic flush to remote storage
      this.startPeriodicFlush()

      this.initialized = true

      // Log the initialization
      await this.log({
        action: "audit_service_initialized",
        resource: "system",
        details: { service: "AuditLogService" },
        severity: "low",
        category: "system",
        success: true,
      })

      // Silent logging - Audit log service initialized
    } catch (error) {
      // Silent error handling - Failed to initialize audit log service
      throw error
    }
  }

  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    if (!configService.getFeature("enableAuditLog")) {
      return
    }

    const logEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      ...entry,
    }

    // Add to local storage immediately
    this.logs.push(logEntry)
    this.pendingLogs.push(logEntry)

    // Maintain local log size limit
    if (this.logs.length > this.maxLocalLogs) {
      this.logs = this.logs.slice(-this.maxLocalLogs)
    }

    // Save to localStorage
    this.saveToStorage()

    // Flush if batch is full
    if (this.pendingLogs.length >= this.batchSize) {
      await this.flush()
    }

    // Log critical events immediately
    if (entry.severity === "critical") {
      await this.flush()
      await this.sendAlert(logEntry)
    }
  }

  // Convenience methods for common log types
  async logAuth(
    action: string,
    details: Record<string, any>,
    success: boolean,
    userId?: string,
    userEmail?: string,
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      action,
      resource: "authentication",
      details,
      severity: success ? "low" : "high",
      category: "auth",
      success,
    })
  }

  async logDataAccess(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    userEmail: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      severity: "medium",
      category: "data",
      success: true,
    })
  }

  async logDataModification(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    userEmail: string,
    oldData: any,
    newData: any,
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details: {
        oldData: this.sanitizeData(oldData),
        newData: this.sanitizeData(newData),
        changes: this.getChanges(oldData, newData),
      },
      severity: "medium",
      category: "data",
      success: true,
    })
  }

  async logSecurityEvent(
    action: string,
    details: Record<string, any>,
    severity: "medium" | "high" | "critical" = "high",
    userId?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: "security",
      details,
      severity,
      category: "security",
      success: false,
    })
  }

  async logSystemEvent(action: string, details: Record<string, any>, success = true): Promise<void> {
    await this.log({
      action,
      resource: "system",
      details,
      severity: success ? "low" : "medium",
      category: "system",
      success,
    })
  }

  async logApiCall(
    method: string,
    endpoint: string,
    statusCode: number,
    userId?: string,
    duration?: number,
  ): Promise<void> {
    await this.log({
      userId,
      action: `api_${method.toLowerCase()}`,
      resource: "api",
      resourceId: endpoint,
      details: {
        method,
        endpoint,
        statusCode,
        duration,
      },
      severity: statusCode >= 400 ? "medium" : "low",
      category: "api",
      success: statusCode < 400,
    })
  }

  async logError(error: Error, context: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.log({
      userId,
      action: "error_occurred",
      resource: "system",
      details: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        context,
      },
      severity: "high",
      category: "system",
      success: false,
      errorMessage: error.message,
    })
  }

  // Query methods
  async getLogs(filter: AuditLogFilter = {}): Promise<AuditLogEntry[]> {
    let filteredLogs = [...this.logs]

    if (filter.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filter.userId)
    }
    if (filter.action) {
      filteredLogs = filteredLogs.filter((log) => log.action.includes(filter.action!))
    }
    if (filter.resource) {
      filteredLogs = filteredLogs.filter((log) => log.resource === filter.resource)
    }
    if (filter.category) {
      filteredLogs = filteredLogs.filter((log) => log.category === filter.category)
    }
    if (filter.severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === filter.severity)
    }
    if (filter.success !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.success === filter.success)
    }
    if (filter.startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= filter.startDate!)
    }
    if (filter.endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= filter.endDate!)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    const offset = filter.offset || 0
    const limit = filter.limit || 100
    return filteredLogs.slice(offset, offset + limit)
  }

  async getStats(timeRange: { start: Date; end: Date }): Promise<AuditLogStats> {
    const logs = await this.getLogs({
      startDate: timeRange.start,
      endDate: timeRange.end,
    })

    const entriesByCategory: Record<string, number> = {}
    const entriesBySeverity: Record<string, number> = {}
    const actionCounts: Record<string, number> = {}
    const userCounts: Record<string, { email: string; count: number }> = {}
    let failureCount = 0

    logs.forEach((log) => {
      // Category stats
      entriesByCategory[log.category] = (entriesByCategory[log.category] || 0) + 1

      // Severity stats
      entriesBySeverity[log.severity] = (entriesBySeverity[log.severity] || 0) + 1

      // Action stats
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

      // User stats
      if (log.userId) {
        if (!userCounts[log.userId]) {
          userCounts[log.userId] = { email: log.userEmail || "", count: 0 }
        }
        userCounts[log.userId].count++
      }

      // Failure stats
      if (!log.success) {
        failureCount++
      }
    })

    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }))

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([userId, data]) => ({ userId, userEmail: data.email, count: data.count }))

    return {
      totalEntries: logs.length,
      entriesByCategory,
      entriesBySeverity,
      failureRate: logs.length > 0 ? (failureCount / logs.length) * 100 : 0,
      topActions,
      topUsers,
      recentActivity: logs.slice(0, 20),
    }
  }

  async exportLogs(filter: AuditLogFilter = {}, format: "json" | "csv" = "json"): Promise<string> {
    const logs = await this.getLogs(filter)

    if (format === "csv") {
      return this.convertToCSV(logs)
    }

    return JSON.stringify(logs, null, 2)
  }

  // Private methods
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getClientIP(): Promise<string> {
    try {
      // In a real application, this would get the actual client IP
      // For now, return a placeholder
      return "localhost"
    } catch {
      return "unknown"
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem("audit_session_id")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("audit_session_id", sessionId)
    }
    return sessionId
  }

  private sanitizeData(data: any): any {
    if (!data) return data

    const sensitiveFields = ["password", "token", "secret", "key", "auth"]
    const sanitized = JSON.parse(JSON.stringify(data))

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) return obj

      for (const key in obj) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
          obj[key] = "[REDACTED]"
        } else if (typeof obj[key] === "object") {
          obj[key] = sanitizeObject(obj[key])
        }
      }

      return obj
    }

    return sanitizeObject(sanitized)
  }

  private getChanges(oldData: any, newData: any): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {}

    if (!oldData || !newData) return changes

    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

    allKeys.forEach((key) => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        }
      }
    })

    return changes
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const logs = secureStorage.getJSON("audit_logs")
      if (logs && Array.isArray(logs)) {
        this.logs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }))
      }
    } catch (error) {
      // Silent error handling - Failed to load audit logs from storage
    }
  }

  private saveToStorage(): void {
    try {
      secureStorage.setJSON("audit_logs", this.logs.slice(-this.maxLocalLogs))
    } catch (error) {
      // Silent error handling - Failed to save audit logs to storage
    }
  }

  private startPeriodicFlush(): void {
    // Flush pending logs every 30 seconds
    this.flushTimer = setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.flush().catch((error) => {
          // Silent error handling - Failed to flush audit logs
        })
      }
    }, 30000)
  }

  private async flush(): Promise<void> {
    if (this.pendingLogs.length === 0) return

    const logsToFlush = [...this.pendingLogs]
    this.pendingLogs = []

    try {
      // In a real application, this would send logs to a remote service
      // For now, we'll just log to console in development
      if (configService.isDevelopment()) {
        // Silent handling - Flushing audit logs
      }

      // Send logs to remote service
      await this.sendToRemoteService(logsToFlush)
    } catch (error) {
      // If flush fails, add logs back to pending
      this.pendingLogs.unshift(...logsToFlush)
      throw error
    }
  }

  private async sendAlert(entry: AuditLogEntry): Promise<void> {
    try {
      // In a real application, this would send alerts for critical events
      // Silent handling - CRITICAL AUDIT EVENT

      // Implement actual alerting
      await this.sendEmailAlert(entry)
      await this.sendSlackAlert(entry)
    } catch (error) {
      // Silent error handling - Failed to send audit alert
    }
  }

  private convertToCSV(logs: AuditLogEntry[]): string {
    if (logs.length === 0) return ""

    const headers = [
      "ID",
      "Timestamp",
      "User ID",
      "User Email",
      "Action",
      "Resource",
      "Resource ID",
      "Category",
      "Severity",
      "Success",
      "IP Address",
      "User Agent",
      "Session ID",
      "Details",
    ]

    const rows = logs.map((log) => [
      log.id,
      log.timestamp.toISOString(),
      log.userId || "",
      log.userEmail || "",
      log.action,
      log.resource,
      log.resourceId || "",
      log.category,
      log.severity,
      log.success.toString(),
      log.ipAddress || "",
      log.userAgent || "",
      log.sessionId || "",
      JSON.stringify(log.details),
    ])

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
      .join("\n")
  }

  private async sendToRemoteService(logs: AuditLogEntry[]): Promise<void> {
    try {
      // In a production environment, this would send logs to a service like:
      // - AWS CloudWatch
      // - Elasticsearch
      // - Splunk
      // - Custom logging API
      
      const payload = {
        timestamp: new Date().toISOString(),
        source: 'crm-application',
        logs: logs.map(log => ({
          ...log,
          timestamp: log.timestamp.toISOString()
        }))
      }

      // Simulate API call to remote logging service
      if (configService.isDevelopment()) {
        // Silent handling - Sending logs to remote service
      } else {
        // In production, make actual HTTP request
        // const response = await fetch('/api/audit-logs', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // })
        // if (!response.ok) throw new Error('Failed to send logs')
      }
    } catch (error) {
      // Silent error handling - Failed to send logs to remote service
      throw error
    }
  }

  private async sendEmailAlert(entry: AuditLogEntry): Promise<void> {
    try {
      // In production, integrate with email service like SendGrid, AWS SES, etc.
      const alertData = {
        to: 'admin@company.com',
        subject: `CRITICAL AUDIT ALERT: ${entry.action}`,
        body: `
          Critical audit event detected:
          
          Action: ${entry.action}
          Resource: ${entry.resource}
          User: ${entry.userEmail || 'Unknown'}
          Timestamp: ${entry.timestamp.toISOString()}
          Details: ${JSON.stringify(entry.details, null, 2)}
          
          Please investigate immediately.
        `
      }

      if (configService.isDevelopment()) {
        // Silent logging - Email alert would be sent
      } else {
        // In production, send actual email
        // await emailService.sendAlert(alertData)
      }
    } catch (error) {
      // Silent error handling - Failed to send email alert
    }
  }

  private async sendSlackAlert(entry: AuditLogEntry): Promise<void> {
    try {
      // In production, integrate with Slack webhook
      const slackMessage = {
        text: `🚨 CRITICAL AUDIT ALERT`,
        attachments: [
          {
            color: 'danger',
            fields: [
              { title: 'Action', value: entry.action, short: true },
              { title: 'Resource', value: entry.resource, short: true },
              { title: 'User', value: entry.userEmail || 'Unknown', short: true },
              { title: 'Timestamp', value: entry.timestamp.toISOString(), short: true },
              { title: 'Details', value: JSON.stringify(entry.details), short: false }
            ]
          }
        ]
      }

      if (configService.isDevelopment()) {
        // Silent logging - Slack alert would be sent
      } else {
        // In production, send to Slack webhook
        // const webhookUrl = process.env.SLACK_WEBHOOK_URL
        // await fetch(webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(slackMessage)
        // })
      }
    } catch (error) {
      // Silent error handling - Failed to send Slack alert
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }
}

// Create and export singleton instance
export const auditLogService = new AuditLogService()
export default auditLogService
