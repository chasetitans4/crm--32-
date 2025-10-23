import { RateLimiter } from "../services/analyticsService" // Corrected import path

// Dynamic import for DOMPurify to handle SSR
let DOMPurify: any = null
if (typeof window !== 'undefined') {
  import('dompurify').then((module: any) => {
    DOMPurify = module.default || module
  })
}

// Content Security Policy headers
export const cspHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.supabase.co https://api.github.com https://api.openai.com wss://*.supabase.co; " +
    "media-src 'self' data: blob:; " +
    "object-src 'none'; " +
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests; " +
    "block-all-mixed-content;",
}

// Rate limiter instance for API calls
export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// Input sanitization function
export const sanitizeUserInput = (input: string): string => {
  if (typeof input !== "string") {
    return ""
  }
  // Fallback sanitization if DOMPurify is not available
  if (!DOMPurify) {
    return input.replace(/<[^>]*>/g, '').trim()
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  })
}

// HTML sanitization for rich content
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== "string") {
    return ""
  }
  // Fallback sanitization if DOMPurify is not available
  if (!DOMPurify) {
    return html.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]*>/g, '').trim()
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ol",
      "ul",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
    ],
    ALLOWED_ATTR: {
      "a": ["href", "title", "target"],
      "img": ["src", "alt", "title", "width", "height"],
      "*": ["class"],
    } as Record<string, string[]>,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "object", "embed", "form", "input", "iframe"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  })
}

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ["http:", "https:"].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Import standardized password validation
import { validatePasswordSecure } from './validation'

// Password strength validation - now uses standardized validation
export const validatePasswordStrength = (
  password: string,
): {
  isValid: boolean
  errors: string[]
  score: number
} => {
  const result = validatePasswordSecure(password)
  
  if (!result.isValid) {
    return {
      isValid: false,
      errors: result.error ? [result.error] : ['Invalid password'],
      score: 0
    }
  }
  
  // Calculate score based on password strength
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1
  
  return {
    isValid: true,
    errors: [],
    score
  }
}

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Session token validation
export const isValidSessionToken = (token: string): boolean => {
  if (!token || typeof token !== "string") {
    return false
  }
  // Check token format (should be hex string of specific length)
  const tokenRegex = /^[a-f0-9]{64}$/i
  return tokenRegex.test(token)
}

// SQL injection prevention for search queries
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== "string") {
    return ""
  }
  // Use whitelist approach - only allow alphanumeric, spaces, and safe punctuation
  return query
    .replace(/[^a-zA-Z0-9\s\-_.@]/g, "") // Only allow safe characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .substring(0, 100) // Limit length
}

// File upload validation
export const validateFileUpload = (
  file: File,
): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  if (file.size > maxSize) {
    errors.push("File size must be less than 10MB")
  }
  if (!allowedTypes.includes(file.type)) {
    errors.push("File type not allowed")
  }
  // Check file extension matches MIME type
  const extension = file.name.split(".").pop()?.toLowerCase()
  const mimeTypeMap: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/gif": ["gif"],
    "application/pdf": ["pdf"],
    "text/plain": ["txt"],
    "application/msword": ["doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  }
  const expectedExtensions = mimeTypeMap[file.type]
  if (expectedExtensions && extension && !expectedExtensions.includes(extension)) {
    errors.push("File extension does not match file type")
  }
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// XSS prevention for dynamic content
export const escapeHTML = (text: string): string => {
  if (typeof text !== "string") {
    return ""
  }
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Secure random string generation
export const generateSecureRandomString = (length = 32): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

// Import advanced encryption system
import { advancedEncryption } from './encryption'

// Legacy encryption key for backward compatibility
const LEGACY_ENCRYPTION_KEY = typeof window === 'undefined' 
  ? process.env.ENCRYPTION_KEY || (() => { 
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY must be set in production')
      }
      return 'dev-only-legacy-key-not-for-production'
    })()
  : process.env.NEXT_PUBLIC_ENCRYPTION_KEY || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY must be set in production')
      }
      return 'dev-only-client-key-not-for-production'
    })()

/**
 * Encrypts API keys using AES-256-GCM encryption
 * Automatically handles both new and legacy formats
 */
export const encryptApiKey = async (apiKey: string): Promise<string> => {
  try {
    // Use advanced encryption for new data
    return await advancedEncryption.encryptApiKey(apiKey, {
      encryptedAt: new Date().toISOString(),
      source: 'security_module'
    })
  } catch (error) {
    console.error('Advanced encryption failed, falling back to legacy:', error)
    // Fallback to legacy base64 encoding for compatibility
    if (typeof crypto !== "undefined" && crypto.subtle) {
      return btoa(apiKey + ":" + LEGACY_ENCRYPTION_KEY)
    }
    return btoa(apiKey)
  }
}

/**
 * Decrypts API keys, handling both new AES-256-GCM and legacy formats
 */
export const decryptApiKey = async (encryptedApiKey: string): Promise<string> => {
  try {
    // Check if it's new format (JSON structure)
    if (advancedEncryption.isEncrypted(encryptedApiKey)) {
      const result = await advancedEncryption.decryptApiKey(encryptedApiKey)
      return result.apiKey
    }
    
    // Handle legacy format
    if (typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const decoded = atob(encryptedApiKey)
        const parts = decoded.split(":")
        if (parts.length === 2 && parts[1] === LEGACY_ENCRYPTION_KEY) {
          return parts[0]
        }
      } catch {
        // Continue to fallback
      }
    }
    
    // Final fallback - simple base64 decode
    try {
      return atob(encryptedApiKey)
    } catch {
      return encryptedApiKey // Return as-is if all decoding fails
    }
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Synchronous versions for backward compatibility
 * Note: These use legacy encryption and should be migrated
 */
export const encryptApiKeySync = (apiKey: string): string => {
  console.warn('⚠️  Using legacy synchronous encryption. Migrate to async encryptApiKey()')
  if (typeof crypto !== "undefined" && crypto.subtle) {
    return btoa(apiKey + ":" + LEGACY_ENCRYPTION_KEY)
  }
  return btoa(apiKey)
}

export const decryptApiKeySync = (encryptedApiKey: string): string => {
  console.warn('⚠️  Using legacy synchronous decryption. Migrate to async decryptApiKey()')
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const decoded = atob(encryptedApiKey)
      const parts = decoded.split(":")
      if (parts.length === 2 && parts[1] === LEGACY_ENCRYPTION_KEY) {
        return parts[0]
      }
    } catch {
      // Continue to fallback
    }
  }
  try {
    return atob(encryptedApiKey)
  } catch {
    return encryptedApiKey
  }
}

// Get client IP address
export const getClientIpAddress = async (): Promise<string> => {
  try {
    // Try to get IP from various sources
    if (typeof window !== "undefined") {
      // Client-side: use a service to get public IP
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'unknown'
    }
    // Server-side: would get from request headers
    return 'server-side-ip'
  } catch {
    return 'unknown'
  }
}

// Content validation for training modules
export const validateTrainingContent = (
  content: unknown,
): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  if (!content || typeof content !== "object" || content === null) {
    errors.push("Content must be a valid object")
    return { isValid: false, errors }
  }
  
  const contentObj = content as Record<string, unknown>
  
  // Validate required fields
  const requiredFields = ["title", "description", "category"]
  for (const field of requiredFields) {
    if (!contentObj[field] || typeof contentObj[field] !== "string") {
      errors.push(`${field} is required and must be a string`)
    }
  }
  // Validate title length
  if (contentObj.title && typeof contentObj.title === "string" && contentObj.title.length > 100) {
    errors.push("Title must be less than 100 characters")
  }
  // Validate description length
  if (contentObj.description && typeof contentObj.description === "string" && contentObj.description.length > 1000) {
    errors.push("Description must be less than 1000 characters")
  }
  // Validate category
  const allowedCategories = ["security", "compliance", "technical", "soft-skills", "onboarding"]
  if (contentObj.category && typeof contentObj.category === "string" && !allowedCategories.includes(contentObj.category)) {
    errors.push("Invalid category")
  }
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Security headers for API responses
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    ...cspHeaders,
  }
}

// Rate limiting check for user actions
export const checkRateLimit = (userId: string, action: string): boolean => {
  const key = `${userId}:${action}`
  return rateLimiter.isAllowed(key)
}

// Audit logging for security events
export const logSecurityEvent = (event: {
  type: "login" | "logout" | "failed_login" | "permission_denied" | "data_access" | "data_modification"
  userId?: string
  ip?: string
  userAgent?: string
  details?: Record<string, unknown>
}): void => {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
    sessionId: generateSecureRandomString(16),
  }
  // In a real implementation, this would be sent to a secure logging service
  console.log("Security Event:", logEntry)
  // Send to security monitoring service
  if (typeof fetch !== "undefined") {
    fetch("/api/security/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getSecurityHeaders(),
      },
      body: JSON.stringify(logEntry),
    }).catch((error) => {
      console.warn("Failed to log security event:", error)
    })
  }
}

// Security service object with required methods
export const securityService = {
  validateCSRFToken: (token: string): boolean => {
    return isValidSessionToken(token)
  },
  
  validateSession: (sessionId: string): boolean => {
    return isValidSessionToken(sessionId)
  },
  
  sanitizeInput: (input: string): string => {
    return sanitizeUserInput(input)
  },
  
  generateCSPHeader: (): string => {
    return cspHeaders["Content-Security-Policy"]
  }
}
