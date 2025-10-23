import { z } from "zod"

// Shared item schema
export const itemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  total: z.number().optional(), // Calculated field: quantity * price
})

// Invoice specific schema
export const invoiceSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientAddress: z.string().min(1, "Client address is required"),
  issueDate: z.union([z.date(), z.string()]),
  dueDate: z.union([z.date(), z.string()]),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  totalAmount: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue"]).default("Draft"),
})

// Contract specific schema
export const contractSchema = z.object({
  id: z.string().optional(),
  quoteId: z.string().optional(),
  clientId: z.string().optional(),
  contractNumber: z.string().optional(),
  contractTitle: z.string().min(1, "Contract title is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  terms: z.string().min(50, "Terms must be at least 50 characters"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  paymentSchedule: z.string().min(1, "Payment schedule is required"),
  scopeOfWork: z.string().min(20, "Scope of work must be at least 20 characters"),
  clientInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  projectDetails: z.object({
    title: z.string(),
    description: z.string(),
  }).optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  templateId: z.string().optional(),
  contractContent: z.string().optional(),
  dynamicFieldValues: z.record(z.unknown()).optional(),
  dynamicTerms: z.record(z.unknown()).optional(),
})

// Quote schema
export const quoteSchema = z.object({
  id: z.string(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  businessName: z.string(),
  industry: z.string(),
  pageCount: z.number(),
  features: z.array(z.string()),
  timeline: z.string(),
  budget: z.string().optional(),
  projectPriority: z.string().optional(),
  finalPrice: z.number(),
  totalHours: z.number().optional(),
  createdAt: z.string(),
  status: z.enum(["draft", "sent", "approved", "accepted", "rejected"]).default("draft"),
  answers: z.record(z.unknown()).optional(),
  requirements: z.string().optional(),
  additionalNotes: z.string().optional(),
})

// Proposal schema
export const proposalSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  items: z.array(itemSchema).optional(),
  totalAmount: z.number().optional(),
  status: z.enum(["draft", "sent", "approved", "rejected"]).default("draft"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Type exports for convenience
export type Invoice = z.infer<typeof invoiceSchema>
export type Contract = z.infer<typeof contractSchema>
export type Item = z.infer<typeof itemSchema>
export type Quote = z.infer<typeof quoteSchema>
export type Proposal = z.infer<typeof proposalSchema>

// Quote data structure for transfer
export const quoteDataSchema = z.object({
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  items: z.array(itemSchema).optional(),
  total: z.number().optional(),
})

export type QuoteData = z.infer<typeof quoteDataSchema>
