"use client"

import { useState, useCallback, useEffect } from "react"
import { z } from "zod"

export interface UseReusableFormOptions<T> {
  initialValues: T
  validationSchema?: z.ZodSchema<T>
  onSubmit?: (values: T) => Promise<void> | void
  resetOnSubmit?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export interface FormField {
  value: any
  error?: string
  touched: boolean
  onChange: (value: any) => void
  onBlur: () => void
}

export interface UseReusableFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  hasUnsavedChanges: boolean
  getFieldProps: (name: keyof T) => FormField
  setFieldValue: (name: keyof T, value: any) => void
  setFieldError: (name: keyof T, error: string) => void
  setFieldTouched: (name: keyof T, touched?: boolean) => void
  setValues: (values: Partial<T>) => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
  resetForm: () => void
  validateField: (name: keyof T) => Promise<boolean>
  validateForm: () => Promise<boolean>
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  clearErrors: () => void
}

export function useReusableForm<T extends Record<string, any>>(
  options: UseReusableFormOptions<T>
): UseReusableFormReturn<T> {
  const {
    initialValues,
    validationSchema,
    onSubmit,
    resetOnSubmit = false,
    validateOnChange = true,
    validateOnBlur = true
  } = options

  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate derived state
  const isValid = Object.keys(errors).length === 0
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)
  const hasUnsavedChanges = isDirty && !isSubmitting

  // Validate a single field
  const validateField = useCallback(async (name: keyof T): Promise<boolean> => {
    if (!validationSchema) return true

    try {
      // Check if the schema is a ZodObject and has shape property
      if ('shape' in validationSchema) {
        const fieldSchema = (validationSchema as any).shape[name as string]
        if (fieldSchema) {
          await fieldSchema.parseAsync(values[name])
          setErrorsState(prev => {
            const newErrors = { ...prev }
            delete newErrors[name]
            return newErrors
          })
          return true
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message || "Invalid value"
        setErrorsState(prev => ({ ...prev, [name]: fieldError }))
        return false
      }
    }
    return true
  }, [validationSchema, values])

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationSchema) return true

    try {
      await validationSchema.parseAsync(values)
      setErrorsState({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach(err => {
          const path = err.path[0] as keyof T
          if (path) {
            newErrors[path] = err.message
          }
        })
        setErrorsState(newErrors)
        return false
      }
    }
    return false
  }, [validationSchema, values])

  // Set field value
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange) {
      // Debounce validation to avoid excessive calls
      setTimeout(() => validateField(name), 100)
    }
  }, [validateOnChange, validateField])

  // Set field error
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [name]: error }))
  }, [])

  // Set field touched
  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }))
    
    if (isTouched && validateOnBlur) {
      validateField(name)
    }
  }, [validateOnBlur, validateField])

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
  }, [])

  // Set multiple errors
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(prev => ({ ...prev, ...newErrors }))
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setValuesState(initialValues)
    setErrorsState({})
    setTouchedState({})
    setIsSubmitting(false)
  }, [initialValues])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorsState({})
  }, [])

  // Get field props for easy binding
  const getFieldProps = useCallback((name: keyof T): FormField => {
    return {
      value: values[name],
      error: errors[name],
      touched: touched[name] || false,
      onChange: (value: any) => setFieldValue(name, value),
      onBlur: () => setFieldTouched(name, true)
    }
  }, [values, errors, touched, setFieldValue, setFieldTouched])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setIsSubmitting(true)

    try {
      // Mark all fields as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {}
      Object.keys(values).forEach(key => {
        allTouched[key as keyof T] = true
      })
      setTouchedState(allTouched)

      // Validate form
      const isFormValid = await validateForm()
      
      if (!isFormValid) {
        setIsSubmitting(false)
        return
      }

      // Submit form
      if (onSubmit) {
        await onSubmit(values)
      }

      // Reset form if requested
      if (resetOnSubmit) {
        resetForm()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // You might want to set a general form error here
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm, onSubmit, resetOnSubmit, resetForm])

  // Update values when initialValues change
  useEffect(() => {
    setValuesState(initialValues)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    hasUnsavedChanges,
    getFieldProps,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    resetForm,
    validateField,
    validateForm,
    handleSubmit,
    clearErrors
  }
}

// Common validation schemas
export const commonSchemas = {
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  required: z.string().min(1, "This field is required"),
  optionalString: z.string().optional(),
  positiveNumber: z.number().positive("Must be a positive number"),
  currency: z.number().min(0, "Amount must be non-negative"),
  date: z.date({ required_error: "Date is required" }),
  url: z.string().url("Please enter a valid URL"),
  
  // Common composite schemas
  clientInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number").optional(),
    company: z.string().optional()
  }),
  
  projectInfo: z.object({
    title: z.string().min(1, "Project title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    budget: z.number().min(0, "Budget must be non-negative"),
    deadline: z.date({ required_error: "Deadline is required" })
  })
}

// Utility function to create form with common patterns
export function createFormHook<T extends Record<string, any>>(
  defaultValues: T,
  schema?: z.ZodSchema<T>
) {
  return (overrides?: Partial<UseReusableFormOptions<T>>) => {
    return useReusableForm({
      initialValues: defaultValues,
      validationSchema: schema,
      validateOnChange: true,
      validateOnBlur: true,
      ...overrides
    })
  }
}

export default useReusableForm