"use client"

import { z } from "zod"
import { useState, useCallback, useMemo } from "react"

// Common validation schemas
export const commonSchemas = {
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  required: (fieldName: string) => z.string().min(1, `${fieldName} is required`),
  minLength: (fieldName: string, min: number) => 
    z.string().min(min, `${fieldName} must be at least ${min} characters`),
  positiveNumber: (fieldName: string) => 
    z.number().min(0, `${fieldName} must be a positive number`),
  currency: z.number().min(0, "Amount must be positive"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "Please enter a valid date")
}

// Common form validation patterns
export const createClientFormSchema = () => z.object({
  clientName: commonSchemas.required("Client name"),
  clientEmail: commonSchemas.email,
  clientPhone: commonSchemas.phone.optional(),
  businessName: commonSchemas.required("Business name"),
  industry: commonSchemas.required("Industry")
})

export const createProjectFormSchema = () => z.object({
  projectTitle: commonSchemas.minLength("Project title", 5),
  description: commonSchemas.minLength("Description", 10),
  timeline: commonSchemas.required("Timeline"),
  budget: commonSchemas.required("Budget"),
  requirements: commonSchemas.minLength("Requirements", 10)
})

// Form state management hook
export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

export interface FormActions<T> {
  updateField: (field: keyof T, value: unknown) => void
  updateFields: (fields: Partial<T>) => void
  validateField: (field: keyof T) => boolean
  validateForm: () => boolean
  resetForm: (newData?: Partial<T>) => void
  setSubmitting: (submitting: boolean) => void
  hasUnsavedChanges: () => boolean
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialData: T,
  schema: z.ZodSchema<T>,
  options: {
    validateOnChange?: boolean
    resetOnSubmit?: boolean
  } = {}
): [FormState<T>, FormActions<T>] {
  const { validateOnChange = true, resetOnSubmit = false } = options
  
  const [formData, setFormData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalData] = useState<T>(initialData)

  const validateField = useCallback((field: keyof T): boolean => {
    try {
      const fieldSchema = (schema as any).shape?.[field as string]
      if (fieldSchema) {
        fieldSchema.parse(formData[field])
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field as string]
          return newErrors
        })
        return true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field as string]: error.errors[0]?.message || "Invalid value"
        }))
      }
    }
    return false
  }, [formData, schema])

  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [formData, schema])

  const updateField = useCallback((field: keyof T, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    if (validateOnChange) {
      // Validate after a short delay to avoid excessive validation
      setTimeout(() => validateField(field), 100)
    }
  }, [validateField, validateOnChange])

  const updateFields = useCallback((fields: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...fields }))
    setIsDirty(true)
    
    if (validateOnChange) {
      setTimeout(() => validateForm(), 100)
    }
  }, [validateForm, validateOnChange])

  const resetForm = useCallback((newData?: Partial<T>) => {
    const resetData = newData ? { ...initialData, ...newData } : initialData
    setFormData(resetData)
    setErrors({})
    setIsDirty(false)
    setIsSubmitting(false)
  }, [initialData])

  const hasUnsavedChanges = useCallback((): boolean => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }, [formData, originalData])

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && isDirty
  }, [errors, isDirty])

  const formState: FormState<T> = {
    data: formData,
    errors,
    isValid,
    isDirty,
    isSubmitting
  }

  const formActions: FormActions<T> = {
    updateField,
    updateFields,
    validateField,
    validateForm,
    resetForm,
    setSubmitting: setIsSubmitting,
    hasUnsavedChanges
  }

  return [formState, formActions]
}

// Modal state management hook
export interface ModalState {
  isOpen: boolean
  isClosing: boolean
}

export interface ModalActions {
  openModal: () => void
  closeModal: () => void
  confirmClose: (hasUnsavedChanges: boolean, message?: string) => Promise<boolean>
}

export function useModalState(): [ModalState, ModalActions] {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
    setIsClosing(false)
  }, [])

  const closeModal = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 150) // Animation delay
  }, [])

  const confirmClose = useCallback(async (
    hasUnsavedChanges: boolean, 
    message = "You have unsaved changes. Are you sure you want to close this form? All data will be lost."
  ): Promise<boolean> => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(message)
      if (confirmed) {
        closeModal()
        return true
      }
      return false
    }
    closeModal()
    return true
  }, [closeModal])

  return [
    { isOpen, isClosing },
    { openModal, closeModal, confirmClose }
  ]
}

// Form submission helper
export interface SubmissionOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  resetOnSuccess?: boolean
  showSuccessMessage?: boolean
  showErrorMessage?: boolean
}

export function createSubmissionHandler<T>(
  formActions: FormActions<T>,
  submitFn: (data: T) => Promise<unknown>,
  options: SubmissionOptions<T> = {}
) {
  return async (data: T) => {
    const { 
      onSuccess, 
      onError, 
      resetOnSuccess = false,
      showSuccessMessage = true,
      showErrorMessage = true 
    } = options

    if (!formActions.validateForm()) {
      return
    }

    formActions.setSubmitting(true)

    try {
      const result = await submitFn(data)
      
      if (showSuccessMessage) {
        // You can integrate with your toast system here
        console.log('Form submitted successfully')
      }
      
      if (resetOnSuccess) {
        formActions.resetForm()
      }
      
      onSuccess?.(data)
      return result
    } catch (error) {
      if (showErrorMessage) {
        console.error('Form submission failed:', error)
      }
      
      onError?.(error as Error)
      throw error
    } finally {
      formActions.setSubmitting(false)
    }
  }
}

// Utility for checking if form data has changed
export function hasFormDataChanged<T extends Record<string, unknown>>(
  current: T, 
  original: T
): boolean {
  return JSON.stringify(current) !== JSON.stringify(original)
}

// Utility for extracting form errors for display
export function getFieldError(
  errors: Record<string, string>, 
  fieldName: string
): string | undefined {
  return errors[fieldName]
}

// Utility for checking if a field has an error
export function hasFieldError(
  errors: Record<string, string>, 
  fieldName: string
): boolean {
  return Boolean(errors[fieldName])
}