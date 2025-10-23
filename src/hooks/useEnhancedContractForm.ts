"use client"

import { useState, useCallback, useReducer, useMemo, useEffect } from 'react'
import type { EnhancedContract, PaymentMilestone } from '../services/EnhancedContractTemplateService'
import type { Contract } from '../schemas/contractInvoiceSchemas'
import { debounce } from 'lodash'
import { EnhancedValidator, ValidationResult } from '../utils/enhancedValidation'
import { useToast } from '../components/ui/use-toast'
import { getCurrentDateISO, addDaysToDate, normalizeDateFields } from '../utils/dateUtils'

// Contract revision interface
export interface ContractRevision {
  id: string
  contractId: string
  version: number
  changes: Record<string, unknown>
  comments?: string
  createdBy: string
  createdAt: string
  previousVersion?: number
}

// Contract form state interface
export interface ContractFormState {
  // Form data
  contract: Partial<EnhancedContract>
  
  // Form status
  isLoading: boolean
  isSaving: boolean
  isValid: boolean
  isDirty: boolean
  
  // Validation
  errors: Record<string, string>
  warnings: Record<string, string>
  
  // UI state
  activeSection: string
  expandedSections: string[]
  
  // History and revisions
  revisionHistory: ContractRevision[]
  hasUnsavedChanges: boolean
  
  // Preview and export
  previewMode: boolean
  exportFormat: 'pdf' | 'docx' | 'html'
  
  // Approval workflow
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected'
  currentApprover?: string
  
  // Digital signature
  signatureStatus: {
    clientSigned: boolean
    vendorSigned: boolean
    pendingSignatures: string[]
  }
}

// Contract form actions interface
export interface ContractFormActions {
  // Basic form actions
  updateField: (field: string, value: unknown) => void
  updateNestedField: (path: string, value: unknown) => void
  resetForm: () => void
  loadContract: (contract: EnhancedContract) => void
  
  // Validation
  validateForm: () => boolean
  validateField: (field: string) => boolean
  clearErrors: () => void
  
  // Section management
  setActiveSection: (section: string) => void
  toggleSection: (section: string) => void
  expandAllSections: () => void
  collapseAllSections: () => void
  
  // Payment milestones
  addPaymentMilestone: () => void
  updatePaymentMilestone: (index: number, milestone: Partial<PaymentMilestone>) => void
  removePaymentMilestone: (index: number) => void
  reorderPaymentMilestones: (fromIndex: number, toIndex: number) => void
  
  // Contract operations
  saveContract: () => Promise<boolean>
  saveAsDraft: () => Promise<boolean>
  submitForApproval: () => Promise<boolean>
  approveContract: (comments?: string) => Promise<boolean>
  rejectContract: (reason: string) => Promise<boolean>
  
  // Revisions
  createRevision: (changes: Record<string, unknown>, comments?: string) => void
  revertToRevision: (revisionId: string) => void
  compareRevisions: (revisionId1: string, revisionId2: string) => Record<string, unknown>
  
  // Export and preview
  togglePreviewMode: () => void
  exportContract: (format: 'pdf' | 'docx' | 'html') => Promise<void>
  generatePreview: () => string
  
  // Digital signature
  requestSignature: (signerEmail: string, signerType: 'client' | 'vendor') => Promise<boolean>
  checkSignatureStatus: () => Promise<void>
  
  // Templates
  applyTemplate: (templateId: string) => void
  saveAsTemplate: (templateName: string) => Promise<boolean>
}

// Form reducer action types
type ContractFormAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: unknown } }
  | { type: 'UPDATE_NESTED_FIELD'; payload: { path: string; value: unknown } }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_WARNINGS'; payload: Record<string, string> }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'SET_EXPANDED_SECTIONS'; payload: string[] }
  | { type: 'LOAD_CONTRACT'; payload: EnhancedContract }
  | { type: 'RESET_FORM' }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_VALID'; payload: boolean }
  | { type: 'ADD_REVISION'; payload: ContractRevision }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_APPROVAL_STATUS'; payload: ContractFormState['approvalStatus'] }
  | { type: 'UPDATE_SIGNATURE_STATUS'; payload: Partial<ContractFormState['signatureStatus']> }

// Initial form state
const initialState: ContractFormState = {
  contract: {},
  isLoading: false,
  isSaving: false,
  isValid: false,
  isDirty: false,
  errors: {},
  warnings: {},
  activeSection: 'basic-info',
  expandedSections: ['basic-info'],
  revisionHistory: [],
  hasUnsavedChanges: false,
  previewMode: false,
  exportFormat: 'pdf',
  approvalStatus: 'draft',
  signatureStatus: {
    clientSigned: false,
    vendorSigned: false,
    pendingSignatures: []
  }
}

// Form reducer
function contractFormReducer(state: ContractFormState, action: ContractFormAction): ContractFormState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    
    case 'UPDATE_FIELD':
      return {
        ...state,
        contract: {
          ...state.contract,
          [action.payload.field]: action.payload.value
        },
        isDirty: true,
        hasUnsavedChanges: true
      }
    
    case 'UPDATE_NESTED_FIELD': {
      const { path, value } = action.payload
      const pathParts = path.split('.')
      const updatedContract = { ...state.contract }
      
      let current: Record<string, unknown> = updatedContract as Record<string, unknown>
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]] as Record<string, unknown>
      }
      current[pathParts[pathParts.length - 1]] = value
      
      return {
        ...state,
        contract: updatedContract,
        isDirty: true,
        hasUnsavedChanges: true
      }
    }
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} }
    
    case 'SET_WARNINGS':
      return { ...state, warnings: action.payload }
    
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload }
    
    case 'TOGGLE_SECTION': {
      const section = action.payload
      const isExpanded = state.expandedSections.includes(section)
      const expandedSections = isExpanded
        ? state.expandedSections.filter(s => s !== section)
        : [...state.expandedSections, section]
      
      return { ...state, expandedSections }
    }
    
    case 'SET_EXPANDED_SECTIONS':
      return { ...state, expandedSections: action.payload }
    
    case 'LOAD_CONTRACT':
      return {
        ...state,
        contract: action.payload,
        revisionHistory: [],
        approvalStatus: action.payload.status === 'signed' || action.payload.status === 'active' ? 'approved' : 'draft',
        signatureStatus: {
          clientSigned: false,
          vendorSigned: false,
          pendingSignatures: []
        },
        isDirty: false,
        hasUnsavedChanges: false
      }
    
    case 'RESET_FORM':
      return initialState
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload }
    
    case 'SET_VALID':
      return { ...state, isValid: action.payload }
    
    case 'ADD_REVISION':
      return {
        ...state,
        revisionHistory: [...state.revisionHistory, action.payload]
      }
    
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload }
    
    case 'SET_APPROVAL_STATUS':
      return { ...state, approvalStatus: action.payload }
    
    case 'UPDATE_SIGNATURE_STATUS':
      return {
        ...state,
        signatureStatus: {
          ...state.signatureStatus,
          ...action.payload
        }
      }
    
    default:
      return state
  }
}

export interface EnhancedContractFormState {
  data: Partial<Contract>
  errors: Record<string, string>
  warnings: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  lastSaved: Date | null
  autoSaveEnabled: boolean
}

export interface EnhancedContractFormActions {
  updateField: (path: string, value: any) => void
  updateClientInfo: (field: string, value: any) => void
  updateProjectDetails: (field: string, value: any) => void
  updateContractTerms: (field: string, value: any) => void
  addMilestone: () => void
  removeMilestone: (id: string) => void
  updateMilestone: (id: string, field: string, value: any) => void
  validateForm: () => ValidationResult
  validateField: (path: string) => void
  submitForm: () => Promise<boolean>
  saveAsDraft: () => Promise<boolean>
  resetForm: () => void
  loadContract: (contract: Partial<Contract>) => void
  toggleAutoSave: () => void
  calculateTotals: () => void
}

const initialFormData: Partial<Contract> = {
  clientInfo: {
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "", // Contract schema expects string, not object
  },
  projectDetails: {
    title: "",
    description: "",
    // Removed scope, deliverables, timeline as they don't exist in Contract schema
  },
  contractTitle: "",
  clientName: "",
  clientEmail: "",
  startDate: getCurrentDateISO(),
  endDate: addDaysToDate(getCurrentDateISO(), 30),
  terms: "",
  totalAmount: 0,
  paymentSchedule: "",
  scopeOfWork: "",
  status: "draft",
  priority: "medium",
}

export const useEnhancedContractForm = (
  initialData?: Partial<Contract>,
  onSubmit?: (data: Contract) => Promise<boolean>,
  onAutoSave?: (data: Partial<Contract>) => Promise<boolean>,
): [EnhancedContractFormState, EnhancedContractFormActions] => {
  const { toast } = useToast()

  const [state, setState] = useState<EnhancedContractFormState>({
    data: initialData || initialFormData,
    errors: {},
    warnings: {},
    isValid: false,
    isSubmitting: false,
    isDirty: false,
    lastSaved: null,
    autoSaveEnabled: true,
  })

  // Debounced validation
  const debouncedValidation = useMemo(
    () =>
      debounce((data: Partial<Contract>) => {
        const result = EnhancedValidator.validateContract(data)

        const errors: Record<string, string> = {}
        const warnings: Record<string, string> = {}

        result.errors.forEach((error: any) => {
          errors[error.field] = error.message
        })

        result.warnings.forEach((warning: any) => {
          warnings[warning.field] = warning.message
        })

        setState((prev) => ({
          ...prev,
          errors,
          warnings,
          isValid: result.isValid,
        }))
      }, 300),
    [],
  )

  // Debounced auto-save
  const debouncedAutoSave = useMemo(
    () =>
      debounce(async (data: Partial<Contract>) => {
        if (onAutoSave && state.autoSaveEnabled && state.isDirty) {
          try {
            const success = await onAutoSave(data)
            if (success) {
              setState((prev) => ({
                ...prev,
                lastSaved: new Date(),
                isDirty: false,
              }))
              toast({ type: "success", title: "Auto-save", description: "Draft saved automatically" })
            }
          } catch (error) {
            console.error("Auto-save failed:", error)
          }
        }
      }, 2000),
    [onAutoSave, state.autoSaveEnabled, state.isDirty, toast],
  )

  // Update field helper
  const updateNestedField = useCallback((obj: any, path: string, value: any) => {
    const keys = path.split(".")
    const result = { ...obj }
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {}
      } else {
        current[key] = { ...current[key] }
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
    return result
  }, [])

  // Calculate milestone amounts based on percentages
  const calculateMilestoneAmounts = useCallback((milestones: PaymentMilestone[], totalAmount: number) => {
    return milestones.map((milestone) => ({
      ...milestone,
      amount: Math.round((milestone.percentage / 100) * totalAmount * 100) / 100,
    }))
  }, [])

  // Create updateField function separately to avoid circular dependency
  const updateField = useCallback(
    (path: string, value: any) => {
      setState((prev) => {
        let newData = updateNestedField(prev.data, path, value)

        // Normalize date fields for consistent storage
        const dateFields = ['startDate', 'endDate', 'createdAt', 'updatedAt']
        newData = normalizeDateFields(newData, dateFields)

        // For basic Contract schema, no complex milestone calculations needed

        const newState = {
          ...prev,
          data: newData,
          isDirty: true,
        }

        // Trigger validation and auto-save
        debouncedValidation(newData)
        debouncedAutoSave(newData)

        return newState
      })
    },
    [updateNestedField, debouncedValidation, debouncedAutoSave],
  )

  // Define all action callbacks outside of useMemo
  const updateClientInfo = useCallback((field: string, value: any) => {
    updateField(`clientInfo.${field}`, value)
  }, [updateField])

  const updateProjectDetails = useCallback((field: string, value: any) => {
    updateField(`projectDetails.${field}`, value)
  }, [updateField])

  const updateContractTerms = useCallback((field: string, value: any) => {
    updateField(field, value)
  }, [updateField])

  const addMilestone = useCallback(() => {
    // Basic Contract schema doesn't support complex milestones
    // This is a placeholder for compatibility
    console.warn('addMilestone not supported in basic Contract schema')
  }, [])

  const removeMilestone = useCallback(
    (id: string) => {
      // Basic Contract schema doesn't support complex milestones
      console.warn('removeMilestone not supported in basic Contract schema')
    },
    [],
  )

  const updateMilestone = useCallback(
    (id: string, field: string, value: any) => {
      // Basic Contract schema doesn't support complex milestones
      console.warn('updateMilestone not supported in basic Contract schema')
    },
    [],
  )

  const validateForm = useCallback(() => {
    return EnhancedValidator.validateContract(state.data)
  }, [state.data])

  const validateField = useCallback(
    (path: string) => {
      // Simplified field validation for basic Contract schema
      // Field-specific validation would go here
      debouncedValidation(state.data)
    },
    [state.data, debouncedValidation],
  )

  const submitForm = useCallback(async () => {
    if (!onSubmit) return false

    setState((prev) => ({ ...prev, isSubmitting: true }))

    try {
      const validation = EnhancedValidator.validateContract(state.data)

      if (!validation.isValid) {
        toast({ type: "error", title: "Validation Error", description: "Please fix validation errors before submitting", variant: "destructive" })
        return false
      }

      const success = await onSubmit(state.data as Contract)

      if (success) {
        setState((prev) => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date(),
        }))
        toast({ type: "success", title: "Success", description: "Contract submitted successfully" })
      }

      return success
    } catch (error) {
      console.error("Form submission failed:", error)
      toast({ type: "error", title: "Error", description: "Failed to submit contract", variant: "destructive" })
      return false
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }, [onSubmit, state.data, toast])

  const saveAsDraft = useCallback(async () => {
    if (!onAutoSave) return false

    try {
      const success = await onAutoSave(state.data)

      if (success) {
        setState((prev) => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date(),
        }))
        toast({ type: "success", title: "Success", description: "Draft saved successfully" })
      }

      return success
    } catch (error) {
      console.error("Save draft failed:", error)
      toast({ type: "error", title: "Error", description: "Failed to save draft", variant: "destructive" })
      return false
    }
  }, [onAutoSave, state.data, toast])

  const resetForm = useCallback(() => {
    setState({
      data: initialData || initialFormData,
      errors: {},
      warnings: {},
      isValid: false,
      isSubmitting: false,
      isDirty: false,
      lastSaved: null,
      autoSaveEnabled: true,
    })
  }, [initialData])

  const loadContract = useCallback(
    (contract: Partial<Contract>) => {
      // Normalize date fields when loading contract data
      const dateFields = ['startDate', 'endDate', 'createdAt', 'updatedAt']
      const normalizedContract = normalizeDateFields(contract, dateFields)
      
      setState((prev) => ({
        ...prev,
        data: normalizedContract,
        isDirty: false,
        lastSaved: new Date(),
      }))

      debouncedValidation(normalizedContract)
    },
    [debouncedValidation],
  )

  const toggleAutoSave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      autoSaveEnabled: !prev.autoSaveEnabled,
    }))
  }, [])

  const calculateTotals = useCallback(() => {
    // For the basic Contract schema, we don't have complex milestone structures
    // This is a simplified version that just updates the total amount
    setState((prev) => {
      return {
        ...prev,
        isDirty: true,
      }
    })
  }, [])

  // Actions object using useMemo to prevent recreation
  const actions: EnhancedContractFormActions = useMemo(() => ({
    updateField,
    updateClientInfo,
    updateProjectDetails,
    updateContractTerms,
    addMilestone,
    removeMilestone,
    updateMilestone,
    validateForm,
    validateField,
    submitForm,
    saveAsDraft,
    resetForm,
    loadContract,
    toggleAutoSave,
    calculateTotals,
  }), [updateField, updateClientInfo, updateProjectDetails, updateContractTerms, addMilestone, removeMilestone, updateMilestone, validateForm, validateField, submitForm, saveAsDraft, resetForm, loadContract, toggleAutoSave, calculateTotals])

  // Initial validation
  useEffect(() => {
    debouncedValidation(state.data)
  }, [debouncedValidation, state.data])

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedValidation.cancel()
      debouncedAutoSave.cancel()
    }
  }, [debouncedValidation, debouncedAutoSave])

  return [state, actions]
}
