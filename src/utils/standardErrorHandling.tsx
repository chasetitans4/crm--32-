/**
 * Standardized Error Handling Utilities
 * Provides consistent error handling patterns across the CRM application
 */

// Import React for hooks and components
import * as React from 'react'

// Import logging services
import { auditLogService } from '../services/auditLogService'
import { errorReporting } from '../services/analyticsService'

export interface StandardError {
  message: string
  code?: string
  type: 'validation' | 'network' | 'authentication' | 'authorization' | 'business' | 'system' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  context?: Record<string, unknown>
  stack?: string
}

export interface ErrorState {
  hasError: boolean
  error: StandardError | null
  isLoading: boolean
}

export interface AsyncOperationState {
  isLoading: boolean
  error: StandardError | null
  data: unknown
}

/**
 * Error logging configuration
 */
export interface ErrorLoggingConfig {
  enableConsoleLogging: boolean
  enableAuditLogging: boolean
  enableErrorReporting: boolean
  logContext: boolean
}

// Default logging configuration
const defaultLoggingConfig: ErrorLoggingConfig = {
  enableConsoleLogging: true,
  enableAuditLogging: true,
  enableErrorReporting: true,
  logContext: true
}

let currentLoggingConfig = { ...defaultLoggingConfig }

/**
 * Configure error logging behavior
 */
export function configureErrorLogging(config: Partial<ErrorLoggingConfig>): void {
  currentLoggingConfig = { ...currentLoggingConfig, ...config }
}

/**
 * Log error to various services
 */
export async function logError(
  error: StandardError,
  userId?: string,
  userEmail?: string
): Promise<void> {
  try {
    // Console logging
    if (currentLoggingConfig.enableConsoleLogging) {
      console.error('[StandardError]:', {
        message: error.message,
        code: error.code,
        type: error.type,
        severity: error.severity,
        timestamp: error.timestamp,
        context: currentLoggingConfig.logContext ? error.context : undefined,
        stack: error.stack
      })
    }

    // Audit logging
    if (currentLoggingConfig.enableAuditLogging) {
      await auditLogService.logError(
        new Error(error.message),
        {
          errorCode: error.code,
          errorType: error.type,
          severity: error.severity,
          context: error.context
        },
        userId
      )
    }

    // Error reporting service
    if (currentLoggingConfig.enableErrorReporting) {
      errorReporting.captureException(
        new Error(error.message),
        {
          userId: userId || 'unknown',
          module: 'error-handler',
          context: error.context ? JSON.stringify(error.context) : 'unknown',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          timestamp: new Date()
        }
      )
    }
  } catch (loggingError) {
    // Fallback to console if logging services fail
    console.error('Failed to log error:', loggingError)
    console.error('Original error:', error)
  }
}

/**
 * Creates a standardized error object
 */
export function createStandardError(
  message: string,
  options: {
    code?: string
    type?: StandardError['type']
    severity?: StandardError['severity']
    context?: Record<string, unknown>
    originalError?: Error
    userId?: string
    userEmail?: string
    autoLog?: boolean
  } = {}
): StandardError {
  const {
    code,
    type = 'unknown',
    severity = 'medium',
    context,
    originalError,
    userId,
    userEmail,
    autoLog = true
  } = options

  const standardError: StandardError = {
    message,
    code,
    type,
    severity,
    timestamp: new Date().toISOString(),
    context,
    stack: originalError?.stack
  }

  // Automatically log the error if enabled
  if (autoLog) {
    logError(standardError, userId, userEmail).catch(err => {
      console.error('Failed to auto-log error:', err)
    })
  }

  return standardError
}

/**
 * Error classification utility
 */
export function classifyError(error: unknown): StandardError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      return createStandardError(error.message, {
        type: 'network',
        severity: 'medium',
        originalError: error
      })
    }

    // Authentication errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return createStandardError(error.message, {
        type: 'authentication',
        severity: 'high',
        originalError: error
      })
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return createStandardError(error.message, {
        type: 'validation',
        severity: 'low',
        originalError: error
      })
    }

    // Default error classification
    return createStandardError(error.message, {
      type: 'system',
      severity: 'medium',
      originalError: error
    })
  }

  // Handle string errors
  if (typeof error === 'string') {
    return createStandardError(error, { type: 'unknown', severity: 'medium' })
  }

  // Handle unknown error types
  return createStandardError('An unknown error occurred', {
    type: 'unknown',
    severity: 'medium',
    context: { originalError: error }
  })
}

/**
 * Async operation wrapper with standardized error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: string,
  options?: {
    userId?: string
    userEmail?: string
    enableLogging?: boolean
  }
): Promise<{ data: T | null; error: StandardError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const standardError = classifyError(error)
    
    // Add context if provided
    if (context) {
      standardError.context = {
        ...standardError.context,
        operationContext: context
      }
    }

    // Log the error if logging is enabled
    if (options?.enableLogging !== false) {
      await logError(standardError, options?.userId, options?.userEmail)
    }

    return { data: null, error: standardError }
  }
}

/**
 * Hook for managing error state with logging
 */
export function useErrorState(
  initialError: StandardError | null = null,
  options?: {
    userId?: string
    userEmail?: string
    enableAutoLogging?: boolean
  }
) {
  const [errorState, setErrorState] = React.useState<ErrorState>({
    hasError: !!initialError,
    error: initialError,
    isLoading: false
  })

  const setError = React.useCallback(async (error: StandardError | string | Error | null) => {
    if (error === null) {
      setErrorState({ hasError: false, error: null, isLoading: false })
      return
    }

    const standardError = typeof error === 'string' || error instanceof Error
      ? classifyError(error)
      : error

    setErrorState({ hasError: true, error: standardError, isLoading: false })
    
    // Auto-log error if enabled
    if (options?.enableAutoLogging !== false) {
      await logError(standardError, options?.userId, options?.userEmail)
    }
  }, [options?.userId, options?.userEmail, options?.enableAutoLogging])

  const clearError = React.useCallback(() => {
    setErrorState(prev => ({ ...prev, hasError: false, error: null }))
  }, [])

  const setLoading = React.useCallback((isLoading: boolean) => {
    setErrorState(prev => ({ ...prev, isLoading }))
  }, [])

  const handleError = React.useCallback(async (error: unknown, context?: string) => {
    const standardError = classifyError(error)
    if (context) {
      standardError.context = { ...standardError.context, hookContext: context }
    }
    await setError(standardError)
  }, [setError])

  return {
    ...errorState,
    setError,
    clearError,
    setLoading,
    handleError
  }
}

/**
 * Hook for error reporting and logging
 */
export function useErrorReporting(userId?: string, userEmail?: string) {
  const reportError = React.useCallback(async (
    error: Error | StandardError | string,
    context?: string,
    options?: {
      severity?: StandardError['severity']
      type?: StandardError['type']
      code?: string
    }
  ) => {
    let standardError: StandardError
    
    if (typeof error === 'string') {
      standardError = createStandardError(error, {
        ...options,
        context: context ? { reportContext: context } : undefined,
        userId,
        userEmail
      })
    } else if (error instanceof Error) {
      standardError = createStandardError(error.message, {
        ...options,
        originalError: error,
        context: context ? { reportContext: context } : undefined,
        userId,
        userEmail
      })
    } else {
      // Already a StandardError
      standardError = error
      await logError(standardError, userId, userEmail)
    }
    
    return standardError
  }, [userId, userEmail])

  const reportSuccess = React.useCallback(async (
    message: string,
    context?: string
  ) => {
    if (currentLoggingConfig.enableConsoleLogging) {
      console.log('[Success]:', { message, context, userId, timestamp: new Date().toISOString() })
    }
    
    if (currentLoggingConfig.enableAuditLogging) {
      await auditLogService.log({
        userId,
        userEmail,
        action: 'success_event',
        resource: 'application',
        details: { message, context },
        severity: 'low',
        category: 'user',
        success: true
      })
    }
  }, [userId, userEmail])

  return {
    reportError,
    reportSuccess
  }
}

/**
 * React hook for async operations with error handling
 */
export function useAsyncOperation<T>(options?: {
  userId?: string
  userEmail?: string
  enableLogging?: boolean
}) {
  const [state, setState] = React.useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    data: null
  })

  const execute = React.useCallback(async (
    operation: () => Promise<T>,
    context?: string
  ) => {
    setState({ isLoading: true, error: null, data: null })
    
    const result = await handleAsyncOperation(operation, context, {
      userId: options?.userId,
      userEmail: options?.userEmail,
      enableLogging: options?.enableLogging
    })
    
    setState({
      isLoading: false,
      error: result.error,
      data: result.data
    })

    return result
  }, [options?.userId, options?.userEmail, options?.enableLogging])

  const reset = React.useCallback(() => {
    setState({ isLoading: false, error: null, data: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Error boundary component props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: StandardError; retry: () => void }>
  onError?: (error: StandardError) => void
  context?: string
}

/**
 * Default error display component
 */
export const DefaultErrorFallback: React.FC<{
  error: StandardError
  retry: () => void
}> = ({ error, retry }) => {
  const getSeverityColor = (severity: StandardError['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'critical': return 'text-red-800 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`p-4 border rounded-lg ${getSeverityColor(error.severity)}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Something went wrong</h3>
          <p className="text-sm mt-1">{error.message}</p>
          {error.code && (
            <p className="text-xs mt-1 opacity-75">Error Code: {error.code}</p>
          )}
        </div>
        <button
          onClick={retry}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

/**
 * Form validation error handling
 */
export interface FormValidationError {
  field: string
  message: string
  code?: string
}

export function createValidationError(
  field: string,
  message: string,
  code?: string
): FormValidationError {
  return { field, message, code }
}

export function validateRequired(value: unknown, fieldName: string): FormValidationError | null {
  if (value === null || value === undefined || value === '') {
    return createValidationError(fieldName, `${fieldName} is required`, 'REQUIRED')
  }
  return null
}

export function validateEmail(email: string): FormValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return createValidationError('email', 'Please enter a valid email address', 'INVALID_EMAIL')
  }
  return null
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): FormValidationError | null {
  if (value.length < minLength) {
    return createValidationError(
      fieldName,
      `${fieldName} must be at least ${minLength} characters`,
      'MIN_LENGTH'
    )
  }
  return null
}