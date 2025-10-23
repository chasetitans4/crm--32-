import {
  validateEmail,
  validatePhone,
  validateAmount,
  validateContractForm,
  validateInvoiceForm,
} from "../../utils/invoiceValidation"
import type { ContractFormData, InvoiceFormData, InvoiceItem } from "../../types/invoice"

describe("invoiceValidation", () => {
  describe("validateEmail", () => {
    it("validates correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true)
      expect(validateEmail("user.name@domain.co.uk")).toBe(true)
    })

    it("rejects invalid email addresses", () => {
      expect(validateEmail("invalid-email")).toBe(false)
      expect(validateEmail("test@")).toBe(false)
      expect(validateEmail("@domain.com")).toBe(false)
    })
  })

  describe("validatePhone", () => {
    it("validates correct phone numbers", () => {
      expect(validatePhone("1234567890")).toBe(true)
      expect(validatePhone("+1 (555) 123-4567")).toBe(true)
    })

    it("rejects invalid phone numbers", () => {
      expect(validatePhone("abc")).toBe(false)
      expect(validatePhone("123")).toBe(false)
    })
  })

  describe("validateAmount", () => {
    it("validates correct amounts", () => {
      expect(validateAmount("100")).toBe(true)
      expect(validateAmount("100.50")).toBe(true)
      expect(validateAmount("0")).toBe(true)
    })

    it("rejects invalid amounts", () => {
      expect(validateAmount("-100")).toBe(false)
      expect(validateAmount("abc")).toBe(false)
    })
  })

  describe("validateContractForm", () => {
    const validFormData: ContractFormData = {
      clientName: "John Doe",
      clientEmail: "john@example.com",
      clientPhone: "1234567890",
      projectTitle: "Website Redesign",
      projectDescription: "Complete website redesign",
      totalAmount: "5000",
      depositPercentage: "50",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      deliveryDate: "2024-02-01",
      paymentTerms: "Net 30",
      deliverables: ["Design", "Development"],
    }

    it("validates correct form data", () => {
      const result = validateContractForm(validFormData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("rejects form with missing required fields", () => {
      const invalidFormData = { ...validFormData, clientName: "" }
      const result = validateContractForm(invalidFormData)
      expect(result.isValid).toBe(false)
      expect(result.errors.some((error) => error.field === "clientName")).toBe(true)
    })

    it("rejects form with invalid email", () => {
      const invalidFormData = { ...validFormData, clientEmail: "invalid-email" }
      const result = validateContractForm(invalidFormData)
      expect(result.isValid).toBe(false)
      expect(result.errors.some((error) => error.field === "clientEmail")).toBe(true)
    })
  })

  describe("validateInvoiceForm", () => {
    const validFormData: InvoiceFormData = {
      invoiceNumber: "INV-001",
      clientName: "John Doe",
      clientEmail: "john@example.com",
      clientAddress: "123 Main St",
      issueDate: "2024-01-01",
      dueDate: "2024-02-01",
      items: [],
      subtotal: 0,
      tax: 0,
      totalAmount: 0,
      notes: "Thank you",
      status: "Draft",
    }

    const validItems: InvoiceItem[] = [
      {
        id: "1",
        description: "Web Design",
        quantity: 1,
        price: 1000,
        total: 1000,
      },
    ]

    it("validates correct form data", () => {
      const result = validateInvoiceForm(validFormData, validItems)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("rejects form with no items", () => {
      const result = validateInvoiceForm(validFormData, [])
      expect(result.isValid).toBe(false)
      expect(result.errors.some((error) => error.field === "items")).toBe(true)
    })

    it("rejects form with invalid due date", () => {
      const invalidFormData = { ...validFormData, dueDate: "2023-12-01" }
      const result = validateInvoiceForm(invalidFormData, validItems)
      expect(result.isValid).toBe(false)
      expect(result.errors.some((error) => error.field === "dueDate")).toBe(true)
    })
  })
})
