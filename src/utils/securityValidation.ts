/**
 * Security Validation Utility
 * Validates environment variables and security configurations at startup
 */

interface SecurityValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface EnvironmentConfig {
  required: string[]
  sensitive: string[]
  clientSafe: string[]
}

/**
 * Configuration for environment variable validation
 */
const ENV_CONFIG: EnvironmentConfig = {
  // Required environment variables for production
  required: [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ],
  
  // Sensitive variables that should never have NEXT_PUBLIC_ prefix
  sensitive: [
    'SUPABASE_SERVICE_KEY',
    'MAILJET_API_KEY',
    'MAILJET_SECRET_KEY',
    'BOLDSIGN_API_KEY',
    'STRIPE_SECRET_KEY',
    'ENCRYPTION_KEY',
    'EMAIL_MASTER_KEY',
    'ENCRYPTION_MASTER_KEY',
    'SLACK_WEBHOOK_URL'
  ],
  
  // Variables safe for client-side exposure
  clientSafe: [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_VERSION',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
}

/**
 * Validates environment variables for security compliance
 */
export function validateEnvironmentSecurity(): SecurityValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'

  // Check for required variables in production
  if (isProduction) {
    for (const required of ENV_CONFIG.required) {
      if (!process.env[required]) {
        errors.push(`Required environment variable ${required} is not set`)
      }
    }
  }

  // Check for sensitive variables with NEXT_PUBLIC_ prefix
  for (const sensitive of ENV_CONFIG.sensitive) {
    const publicVersion = `NEXT_PUBLIC_${sensitive}`
    if (process.env[publicVersion]) {
      errors.push(`Sensitive variable ${sensitive} is exposed with NEXT_PUBLIC_ prefix`)
    }
  }

  // Check for weak encryption keys
  const encryptionKeys = ['ENCRYPTION_KEY', 'EMAIL_MASTER_KEY', 'ENCRYPTION_MASTER_KEY']
  for (const keyName of encryptionKeys) {
    const key = process.env[keyName]
    if (key) {
      if (key.length < 32) {
        errors.push(`${keyName} is too short (minimum 32 characters required)`)
      }
      if (key.includes('default') || key.includes('change-me') || key.includes('dev-only')) {
        if (isProduction) {
          errors.push(`${keyName} contains default/development value in production`)
        } else {
          warnings.push(`${keyName} contains default/development value`)
        }
      }
    } else if (isProduction) {
      errors.push(`${keyName} is required in production`)
    }
  }

  // Check for test credentials in production
  if (isProduction) {
    const testPatterns = ['test', 'mock', 'demo', 'example', 'localhost']
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === 'string') {
        for (const pattern of testPatterns) {
          if (value.toLowerCase().includes(pattern)) {
            warnings.push(`${key} contains test/demo value in production: ${value}`)
          }
        }
      }
    }
  }

  // Check for insecure URLs
  const urlVars = ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_API_URL', 'SUPABASE_URL']
  for (const urlVar of urlVars) {
    const url = process.env[urlVar]
    if (url && isProduction && url.startsWith('http://')) {
      errors.push(`${urlVar} uses insecure HTTP in production: ${url}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates API key format and strength
 */
export function validateApiKey(key: string, serviceName: string): string[] {
  const issues: string[] = []
  
  if (!key) {
    issues.push(`${serviceName} API key is empty`)
    return issues
  }

  if (key.length < 16) {
    issues.push(`${serviceName} API key is too short`)
  }

  if (key === '[REDACTED]' || key === '[SECURE_KEY_HIDDEN]') {
    issues.push(`${serviceName} API key is a placeholder value`)
  }

  const weakPatterns = ['test', 'demo', 'example', 'default', 'change-me']
  for (const pattern of weakPatterns) {
    if (key.toLowerCase().includes(pattern)) {
      issues.push(`${serviceName} API key contains weak pattern: ${pattern}`)
    }
  }

  return issues
}

/**
 * Generates a secure random key for development/testing
 */
export function generateSecureKey(length: number = 32): string {
  if (typeof window !== 'undefined') {
    throw new Error('Key generation should only happen server-side')
  }
  
  const crypto = require('crypto')
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Logs security validation results
 */
export function logSecurityValidation(result: SecurityValidationResult): void {
  if (result.errors.length > 0) {
    console.error('🚨 Security Validation Errors:')
    result.errors.forEach(error => console.error(`  ❌ ${error}`))
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Security Validation Warnings:')
    result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ Security validation passed')
  }
}

/**
 * Runs security validation and throws in production if critical issues found
 */
export function enforceSecurityValidation(): void {
  const result = validateEnvironmentSecurity()
  logSecurityValidation(result)

  if (!result.isValid && process.env.NODE_ENV === 'production') {
    throw new Error('Security validation failed in production. Check environment variables.')
  }
}

// Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  try {
    enforceSecurityValidation()
  } catch (error) {
    console.error('Security validation error:', error)
  }
}