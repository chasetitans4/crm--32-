// Security Types and Interfaces
// Comprehensive type definitions for the security system

// Security Levels
export type SecurityLevel = "public" | "user" | "admin" | "critical"

// Security Event Types
export type SecurityEventType =
  | "login"
  | "logout"
  | "failed_login"
  | "account_locked"
  | "password_change"
  | "data_access"
  | "data_modification"
  | "security_violation"
  | "permission_denied"
  | "system_event"

// Security Severities
export type SecuritySeverity = "critical" | "high" | "medium" | "low" | "info"

// Security Configuration Interface
export interface SecurityConfig {
  // Password Policy
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  passwordRequireNumbers: boolean
  passwordRequireUppercase: boolean
  passwordExpirationDays: number

  // Session Management
  sessionTimeoutMinutes: number
  maxConcurrentSessions: number
  rememberMeDays: number

  // Login Security
  maxLoginAttempts: number
  lockoutDurationMinutes: number
  requireTwoFactor: boolean
  twoFactorForAdmins: boolean

  // Rate Limiting
  enableRateLimit: boolean
  maxRequestsPerMinute: number
  maxRequestsPerHour: number

  // Security Features
  enableCSRFProtection: boolean
  enableInputSanitization: boolean
  enableAuditLogging: boolean
  enableSecurityHeaders: boolean

  // Domain Security
  allowedDomains: string[]
  blockSuspiciousIPs: boolean
  enableGeoBlocking: boolean

  // Data Protection
  encryptSensitiveData: boolean
  enableDataMasking: boolean
  autoLogoutOnInactivity: boolean
}

// Security Check Interface
export interface SecurityCheck {
  id: string
  name: string
  description: string
  status: "passed" | "failed" | "warning" | "pending"
  severity: SecuritySeverity
  lastChecked: Date
  details?: string
  recommendation?: string
}

// Security Metrics Interface
export interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  warningEvents: number
  infoEvents: number
  uniqueUsers: number
  uniqueIPs: number
  failedLogins: number
  successfulLogins: number
  blockedRequests: number
  suspiciousActivity: number
  activeSessions: number
  passwordStrengthAverage: number
  lastSecurityScan?: Date
}

// Security Event Interface
export interface SecurityEvent {
  id: string
  timestamp: Date
  eventType: SecurityEventType
  severity: SecuritySeverity
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  action: string
  resource: string
  details: Record<string, unknown>
  success: boolean
  location?: {
    country?: string
    city?: string
    coordinates?: [number, number]
  }
  riskScore?: number
}

// Security Vulnerability Interface
export interface SecurityVulnerability {
  id: string
  title: string
  description: string
  severity: SecuritySeverity
  category: "authentication" | "authorization" | "data_protection" | "network" | "application" | "configuration"
  status: "open" | "in_progress" | "resolved" | "false_positive"
  discoveredAt: Date
  resolvedAt?: Date
  affectedComponents: string[]
  cveId?: string
  cvssScore?: number
  recommendation: string
  references?: string[]
}

// Security Alert Interface
export interface SecurityAlert {
  id: string
  title: string
  message: string
  severity: SecuritySeverity
  type: "security_breach" | "suspicious_activity" | "policy_violation" | "system_alert"
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  actions?: SecurityAlertAction[]
}

// Security Alert Action Interface
export interface SecurityAlertAction {
  id: string
  label: string
  action: string
  parameters?: Record<string, unknown>
  dangerous?: boolean
}

// Authentication Context Interface
export interface AuthenticationContext {
  userId: string
  userEmail: string
  roles: string[]
  permissions: string[]
  sessionId: string
  ipAddress: string
  userAgent: string
  loginTime: Date
  lastActivity: Date
  mfaVerified: boolean
  riskScore: number
}

// Security Validation Result Interface
export interface SecurityValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  score?: number
  suggestions?: string[]
}

// Rate Limit Configuration Interface
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: unknown) => string
  onLimitReached?: (req: unknown, res: unknown) => void
}

// CSRF Configuration Interface
export interface CSRFConfig {
  enabled: boolean
  secret: string
  cookieName: string
  headerName: string
  ignoreMethods: string[]
  sameSite: "strict" | "lax" | "none"
}

// Security Headers Configuration Interface
export interface SecurityHeadersConfig {
  contentSecurityPolicy: string
  strictTransportSecurity: string
  xFrameOptions: string
  xContentTypeOptions: string
  referrerPolicy: string
  permissionsPolicy: string
}

// Audit Log Filter Interface
export interface AuditLogFilter {
  dateFrom?: Date
  dateTo?: Date
  eventTypes?: SecurityEventType[]
  severities?: SecuritySeverity[]
  userIds?: string[]
  ipAddresses?: string[]
  resources?: string[]
  success?: boolean
  limit?: number
  offset?: number
  sortBy?: "timestamp" | "severity" | "eventType"
  sortOrder?: "asc" | "desc"
}

// Security Dashboard Widget Interface
export interface SecurityDashboardWidget {
  id: string
  title: string
  type: "metric" | "chart" | "list" | "alert"
  size: "small" | "medium" | "large"
  position: { x: number; y: number }
  config: Record<string, any>
  refreshInterval?: number
}

// Security Policy Interface
export interface SecurityPolicy {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  rules: SecurityPolicyRule[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  version: string
}

// Security Policy Rule Interface
export interface SecurityPolicyRule {
  id: string
  condition: string
  action: "allow" | "deny" | "warn" | "log"
  parameters: Record<string, any>
  enabled: boolean
}

// Security Scan Result Interface
export interface SecurityScanResult {
  id: string
  scanType: "vulnerability" | "compliance" | "penetration" | "code_analysis"
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: Date
  endTime?: Date
  findings: SecurityVulnerability[]
  summary: {
    totalFindings: number
    criticalFindings: number
    highFindings: number
    mediumFindings: number
    lowFindings: number
    infoFindings: number
  }
  recommendations: string[]
  reportUrl?: string
}

// Security Compliance Framework Interface
export interface SecurityComplianceFramework {
  id: string
  name: string
  version: string
  description: string
  requirements: SecurityComplianceRequirement[]
  overallScore: number
  lastAssessment: Date
}

// Security Compliance Requirement Interface
export interface SecurityComplianceRequirement {
  id: string
  title: string
  description: string
  category: string
  mandatory: boolean
  status: "compliant" | "non_compliant" | "partial" | "not_assessed"
  evidence?: string[]
  lastChecked?: Date
  score?: number
}

// Export all types for easy importing
