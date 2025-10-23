/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Safely format Date objects for HTML input type="date"
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted date string (YYYY-MM-DD) or empty string
 */
export const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ""
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""
    return dateObj.toISOString().split("T")[0]
  } catch {
    return ""
  }
}

/**
 * Convert HTML date input value to ISO string
 * @param dateString - Date string from HTML input (YYYY-MM-DD)
 * @returns ISO string or empty string if invalid
 */
export const convertInputDateToISO = (dateString: string): string => {
  if (!dateString) return ""
  
  try {
    const date = new Date(dateString + "T00:00:00.000Z")
    if (isNaN(date.getTime())) return ""
    return date.toISOString()
  } catch {
    return ""
  }
}

/**
 * Convert ISO string to Date object safely
 * @param isoString - ISO date string
 * @returns Date object or null if invalid
 */
export const parseISOToDate = (isoString: string | undefined | null): Date | null => {
  if (!isoString) return null
  
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}

/**
 * Get current date as ISO string
 * @returns Current date as ISO string
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString()
}

/**
 * Add days to a date and return as ISO string
 * @param date - Starting date (Date object or ISO string)
 * @param days - Number of days to add
 * @returns New date as ISO string
 */
export const addDaysToDate = (date: Date | string, days: number): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return getCurrentDateISO()
    
    const newDate = new Date(dateObj)
    newDate.setDate(newDate.getDate() + days)
    return newDate.toISOString()
  } catch {
    return getCurrentDateISO()
  }
}

/**
 * Format date for display (human-readable)
 * @param date - Date object, ISO string, or null/undefined
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or empty string
 */
export const formatDateForDisplay = (
  date: Date | string | undefined | null,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string => {
  if (!date) return ""
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""
    return dateObj.toLocaleDateString(undefined, options)
  } catch {
    return ""
  }
}

/**
 * Validate if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDate = (dateString: string | undefined | null): boolean => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Normalize date data for consistent storage
 * Converts various date formats to ISO strings
 * @param data - Object containing date fields
 * @param dateFields - Array of field names that contain dates
 * @returns Object with normalized date fields
 */
export const normalizeDateFields = <T extends Record<string, unknown>>(
  data: T,
  dateFields: string[]
): T => {
  const normalized = { ...data } as any
  
  dateFields.forEach(field => {
    if (normalized[field]) {
      if (typeof normalized[field] === 'string') {
        // Already a string, ensure it's a valid ISO string
        const date = new Date(normalized[field])
        if (!isNaN(date.getTime())) {
          normalized[field] = date.toISOString()
        }
      } else if (normalized[field] instanceof Date) {
        // Convert Date object to ISO string
        normalized[field] = normalized[field].toISOString()
      }
    }
  })
  
  return normalized as T
}