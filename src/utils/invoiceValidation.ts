import {
  type ContractFormData,
  type InvoiceFormData,
  type InvoiceItem,
  type ValidationResult,
  type ValidationError,
  InvoiceError,
  ContractError,
} from "../types/invoice"

// Validation utility functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters except + at the beginning
  const cleanPhone = phone.replace(/[^\d+]/g, "")
  // Allow + at the beginning, then 10-15 digits
  const phoneRegex = /^\+?\d{10,15}$/
  return phoneRegex.test(cleanPhone)
}

export const validateAmount = (amount: string): boolean => {
  const numAmount = Number.parseFloat(amount)
  return !isNaN(numAmount) && numAmount >= 0
}

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}

// Contract form validation
export const validateContractForm = (formData: ContractFormData): ValidationResult => {
  const errors: ValidationError[] = []

  // Required field validation
  if (!formData.clientName.trim()) {
    errors.push({
      field: "clientName",
      message: "Client name is required",
      code: "REQUIRED_FIELD",
    })
  }

  if (!formData.clientEmail.trim()) {
    errors.push({
      field: "clientEmail",
      message: "Client email is required",
      code: "REQUIRED_FIELD",
    })
  } else if (!validateEmail(formData.clientEmail)) {
    errors.push({
      field: "clientEmail",
      message: "Please enter a valid email address",
      code: "INVALID_EMAIL",
    })
  }

  if (!formData.projectTitle.trim()) {
    errors.push({
      field: "projectTitle",
      message: "Project title is required",
      code: "REQUIRED_FIELD",
    })
  }

  if (!formData.totalAmount || (typeof formData.totalAmount === 'number' && formData.totalAmount <= 0) || (typeof formData.totalAmount === 'string' && (!formData.totalAmount.trim() || parseFloat(formData.totalAmount) <= 0))) {
    errors.push({
      field: "totalAmount",
      message: "Total amount is required and must be greater than 0",
      code: "REQUIRED_FIELD",
    })
  } else if (typeof formData.totalAmount === 'string' && !validateAmount(formData.totalAmount)) {
    errors.push({
      field: "totalAmount",
      message: "Please enter a valid amount",
      code: "INVALID_AMOUNT",
    })
  }

  // Optional field validation
  if (formData.clientPhone && !validatePhone(formData.clientPhone)) {
    errors.push({
      field: "clientPhone",
      message: "Please enter a valid phone number",
      code: "INVALID_PHONE",
    })
  }

  if (formData.startDate && !validateDate(formData.startDate)) {
    errors.push({
      field: "startDate",
      message: "Please enter a valid start date",
      code: "INVALID_DATE",
    })
  }

  if (formData.deliveryDate && !validateDate(formData.deliveryDate)) {
    errors.push({
      field: "deliveryDate",
      message: "Please enter a valid delivery date",
      code: "INVALID_DATE",
    })
  }

  // Business logic validation
  if (formData.startDate && formData.deliveryDate) {
    const startDate = new Date(formData.startDate)
    const deliveryDate = new Date(formData.deliveryDate)

    if (deliveryDate <= startDate) {
      errors.push({
        field: "deliveryDate",
        message: "Delivery date must be after start date",
        code: "INVALID_DATE_RANGE",
      })
    }
  }

  const depositPercentage = Number.parseFloat(formData.depositPercentage)
  if (depositPercentage < 0 || depositPercentage > 100) {
    errors.push({
      field: "depositPercentage",
      message: "Deposit percentage must be between 0 and 100",
      code: "INVALID_PERCENTAGE",
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Invoice form validation
export const validateInvoiceForm = (formData: InvoiceFormData, items: InvoiceItem[]): ValidationResult => {
  const errors: ValidationError[] = []

  // Required field validation
  if (!formData.clientName.trim()) {
    errors.push({
      field: "clientName",
      message: "Client name is required",
      code: "REQUIRED_FIELD",
    })
  }

  if (!formData.clientEmail.trim()) {
    errors.push({
      field: "clientEmail",
      message: "Client email is required",
      code: "REQUIRED_FIELD",
    })
  } else if (!validateEmail(formData.clientEmail)) {
    errors.push({
      field: "clientEmail",
      message: "Please enter a valid email address",
      code: "INVALID_EMAIL",
    })
  }

  if (!validateDate(formData.issueDate instanceof Date ? formData.issueDate.toISOString() : formData.issueDate)) {
    errors.push({
      field: "issueDate",
      message: "Please enter a valid invoice date",
      code: "INVALID_DATE",
    })
  }

  if (!validateDate(formData.dueDate instanceof Date ? formData.dueDate.toISOString() : formData.dueDate)) {
    errors.push({
      field: "dueDate",
      message: "Please enter a valid due date",
      code: "INVALID_DATE",
    })
  }

  // Business logic validation
  if (formData.issueDate && formData.dueDate) {
    const invoiceDate = new Date(formData.issueDate)
    const dueDate = new Date(formData.dueDate)

    if (dueDate < invoiceDate) {
      errors.push({
        field: "dueDate",
        message: "Due date cannot be before invoice date",
        code: "INVALID_DATE_RANGE",
      })
    }
  }

  // Invoice items validation
  if (items.length === 0) {
    errors.push({
      field: "items",
      message: "At least one invoice item is required",
      code: "REQUIRED_ITEMS",
    })
  }

  items.forEach((item, index) => {
    if (!item.description.trim()) {
      errors.push({
        field: `items.${index}.description`,
        message: `Item ${index + 1} description is required`,
        code: "REQUIRED_FIELD",
      })
    }

    if (item.quantity <= 0) {
      errors.push({
        field: `items.${index}.quantity`,
        message: `Item ${index + 1} quantity must be greater than 0`,
        code: "INVALID_QUANTITY",
      })
    }

    if (item.price < 0) {
      errors.push({
        field: `items.${index}.price`,
        message: `Item ${index + 1} price cannot be negative`,
        code: "INVALID_PRICE",
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Error handling utilities
export const createInvoiceError = (message: string, code?: string): InvoiceError => {
  return new InvoiceError(message, code)
}

export const createContractError = (message: string, code?: string): ContractError => {
  return new ContractError(message, code)
}

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map((error) => error.message).join(", ")
}
