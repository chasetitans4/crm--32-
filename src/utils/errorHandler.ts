"use client"

import { toast } from "../components/ui/use-toast"

export interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
  fallbackMessage?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: unknown
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorReportingService: ((error: Error, context?: unknown) => void) | null = null

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  setErrorReportingService(service: (error: Error, context?: unknown) => void) {
    this.errorReportingService = service
  }

  handleError(
    error: Error | string,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) {
    const {
      showToast = true,
      logToConsole = true,
      reportToService = false,
      fallbackMessage = "An unexpected error occurred"
    } = options

    const errorMessage = typeof error === 'string' ? error : error.message
    const displayMessage = errorMessage || fallbackMessage

    // Log to console if enabled
    if (logToConsole) {
      console.error(`[${context || 'Error'}]:`, error)
    }

    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: "Error",
        description: displayMessage,
      })
    }

    // Report to external service if enabled and configured
    if (reportToService && this.errorReportingService && typeof error !== 'string') {
      try {
        this.errorReportingService(error, { context, timestamp: new Date().toISOString() })
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
      }
    }
  }

  handleSuccess(
    message: string,
    options: { showToast?: boolean; logToConsole?: boolean } = {}
  ) {
    const { showToast = true, logToConsole = false } = options

    if (logToConsole) {
      console.log(`[Success]: ${message}`)
    }

    if (showToast) {
      toast({
        title: "Success",
        description: message,
      })
    }
  }

  handleValidationErrors(
    errors: ValidationError[],
    options: { showToast?: boolean } = {}
  ) {
    const { showToast = true } = options

    if (showToast) {
      const errorMessage = errors.length === 1 
        ? errors[0].message
        : `Please fix the following errors:\n${errors.map(e => `• ${e.message}`).join('\n')}`

      toast({
        title: "Validation Error",
        description: errorMessage,
      })
    }
  }

  handleApiError(
    error: ApiError,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) {
    let message = error.message

    // Customize message based on status code
    if (error.status) {
      switch (error.status) {
        case 400:
          message = "Invalid request. Please check your input."
          break
        case 401:
          message = "You are not authorized to perform this action."
          break
        case 403:
          message = "Access denied. You don't have permission for this action."
          break
        case 404:
          message = "The requested resource was not found."
          break
        case 429:
          message = "Too many requests. Please try again later."
          break
        case 500:
          message = "Server error. Please try again later."
          break
        default:
          message = error.message || "An unexpected error occurred"
      }
    }

    this.handleError(new Error(message), context, options)
  }

  async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string,
    options: ErrorHandlerOptions & {
      successMessage?: string
      loadingMessage?: string
    } = {}
  ): Promise<T | null> {
    try {
      const result = await operation()
      
      if (options.successMessage) {
        this.handleSuccess(options.successMessage)
      }
      
      return result
    } catch (error) {
      this.handleError(error as Error, context, options)
      return null
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions
export const handleError = (error: Error | string, context?: string, options?: ErrorHandlerOptions) => {
  errorHandler.handleError(error, context, options)
}

export const handleSuccess = (message: string, options?: { showToast?: boolean; logToConsole?: boolean }) => {
  errorHandler.handleSuccess(message, options)
}

export const handleValidationErrors = (errors: ValidationError[], options?: { showToast?: boolean }) => {
  errorHandler.handleValidationErrors(errors, options)
}

export const handleApiError = (error: ApiError, context?: string, options?: ErrorHandlerOptions) => {
  errorHandler.handleApiError(error, context, options)
}

export const handleAsyncOperation = <T>(
  operation: () => Promise<T>,
  context: string,
  options?: ErrorHandlerOptions & {
    successMessage?: string
    loadingMessage?: string
  }
) => {
  return errorHandler.handleAsyncOperation(operation, context, options)
}