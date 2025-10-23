// src/utils/validation.ts

/**
 * This utility file provides common validation functions for various data types.
 * It can be used for form validation, data integrity checks, etc.
 */

/**
 * Secure email validation with additional security checks
 * @param email The email to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateEmailSecure(email: string | null | undefined): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }

  const trimmedEmail = email.trim().toLowerCase()
  
  // Check for basic email format
  if (!isValidEmail(trimmedEmail)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  // Additional security checks
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email is too long' }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // consecutive dots
    /^\.|\.$/, // starts or ends with dot
    /@\.|@$/, // @ followed by dot or at end
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedEmail)) {
      return { isValid: false, error: 'Invalid email format' }
    }
  }

  return { isValid: true }
}

/**
 * Secure password validation with comprehensive security checks
 * @param password The password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePasswordSecure(password: string | null | undefined): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' }
  }

  // Length check
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' }
  }

  // Character requirements
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  const missingRequirements = []
  if (!hasLowercase) missingRequirements.push('lowercase letter')
  if (!hasUppercase) missingRequirements.push('uppercase letter')
  if (!hasNumbers) missingRequirements.push('number')
  if (!hasSpecialChars) missingRequirements.push('special character')

  if (missingRequirements.length > 0) {
    return { 
      isValid: false, 
      error: `Password must contain at least one ${missingRequirements.join(', ')}` 
    }
  }

  // Check for common weak patterns
  const weakPatterns = [
    /123456/, // sequential numbers
    /abcdef/, // sequential letters
    /qwerty/, // keyboard patterns
    /password/i, // contains "password"
    /(.)\1{2,}/, // repeated characters (3 or more)
  ]

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return { isValid: false, error: 'Password contains weak patterns' }
    }
  }

  return { isValid: true }
}

/**
 * Checks if a string is not empty or just whitespace.
 * @param value The string to check.
 * @returns True if the string has content, false otherwise.
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Checks if a string is a valid email format.
 * @param email The string to check.
 * @returns True if it's a valid email, false otherwise.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!isNotEmpty(email)) return false
  // Basic regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email as string)
}

/**
 * Checks if a string is a valid phone number format (basic check).
 * Supports various formats, but not exhaustive.
 * @param phone The string to check.
 * @returns True if it's a valid phone number, false otherwise.
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!isNotEmpty(phone)) return false
  // Allows digits, spaces, hyphens, parentheses, and plus sign for international codes
  const phoneRegex = /^\+?[\d\s\-$$$$]+$/
  // Also check for minimum number of digits to avoid very short strings
  const digitsOnly = (phone as string).replace(/\D/g, "")
  return phoneRegex.test(phone as string) && digitsOnly.length >= 7
}

/**
 * Checks if a number is within a specified range (inclusive).
 * @param value The number to check.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns True if the number is within range, false otherwise.
 */
export function isNumberInRange(value: number | null | undefined, min: number, max: number): boolean {
  return typeof value === "number" && value >= min && value <= max
}

/**
 * Checks if a string represents a valid date in YYYY-MM-DD format.
 * @param dateString The date string to check.
 * @returns True if it's a valid date string, false otherwise.
 */
export function isValidDateString(dateString: string | null | undefined): boolean {
  if (!isNotEmpty(dateString)) return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString as string)) return false
  const date = new Date(dateString as string)
  // Check if the date object is valid and matches the original string (to catch invalid dates like Feb 30)
  return date.toISOString().slice(0, 10) === dateString
}

/**
 * Checks if a value is a positive number (greater than 0).
 * @param value The number to check.
 * @returns True if positive, false otherwise.
 */
export function isPositiveNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && value > 0
}

/**
 * Checks if an array is not empty.
 * @param arr The array to check.
 * @returns True if the array has elements, false otherwise.
 */
export function isArrayNotEmpty<T>(arr: T[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.length > 0
}

/**
 * Validates a password based on common criteria.
 * Now uses the standardized secure password validation.
 * @param password The password string to validate.
 * @param minLength Minimum required length (ignored, uses secure validation standards).
 * @returns True if the password meets criteria, false otherwise.
 */
export function isValidPassword(password: string | null | undefined, minLength = 8): boolean {
  const result = validatePasswordSecure(password)
  return result.isValid
}

/**
 * A generic function to validate an object against a set of rules.
 * @param data The object to validate.
 * @param rules An object where keys are data properties and values are validation functions.
 * @returns An object containing errors, or empty if valid.
 */
export function validateObject<T extends Record<string, unknown>>(
  data: T,
  rules: { [K in keyof T]?: (value: T[K]) => string | null },
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const key in rules) {
    if (Object.prototype.hasOwnProperty.call(rules, key)) {
      const rule = rules[key]
      if (rule) {
        const error = rule(data[key])
        if (error) {
          errors[key] = error
        }
      }
    }
  }
  return errors
}

// Example usage of validateObject:
/*
interface UserForm {
  name: string;
  email: string;
  age: number;
  password?: string;
}

const userRules = {
  name: (value: string) => isNotEmpty(value) ? null : "Name is required.",
  email: (value: string) => isValidEmail(value) ? null : "Invalid email format.",
  age: (value: number) => isNumberInRange(value, 18, 99) ? null : "Age must be between 18 and 99.",
  password: (value?: string) => {
    if (!value || !isNotEmpty(value)) return null
    const result = validatePasswordSecure(value)
    return result.isValid ? null : (result.error || "Password does not meet security requirements.")
  },
};

const userData: UserForm = {
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  password: process.env.EXAMPLE_PASSWORD || "[REDACTED]",
};

const errors = validateObject(userData, userRules);
if (Object.keys(errors).length > 0) {
  console.log("Validation Errors:", errors);
} else {
  console.log("User data is valid.");
}
*/
