import {
  EnhancedContractTemplateService,
  type EnhancedContract,
  type PaymentMilestone,
} from "../services/EnhancedContractTemplateService"
import type { Quote, Invoice } from "../schemas/contractInvoiceSchemas"

// Enhanced interfaces for unified conversion
export interface UnifiedInvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number

  // Enhanced properties for quote data preservation
  category?: "design" | "development" | "content" | "seo" | "maintenance" | "custom"
  hoursAllocated?: number
  relatedFeatures?: string[]
  milestonePhase?: string

  // Tax and pricing
  taxable: boolean
  taxRate: number
  discountPercentage?: number
  discountAmount?: number
}

export interface UnifiedInvoice {
  // Core invoice data
  id: string
  invoiceNumber: string
  contractId?: string
  quoteId?: string
  clientId?: string
  clientName: string
  clientEmail: string
  clientAddress: string

  // Dynamic invoice properties
  invoiceType: "deposit" | "milestone" | "final" | "progress" | "custom"
  milestoneNumber?: number
  totalMilestones?: number
  progressPercentage?: number

  // Enhanced items with quote data preservation
  items: UnifiedInvoiceItem[]

  // Financial details
  subtotal: number
  tax: number
  totalAmount: number
  amountPaid: number
  amountDue: number

  // Status and dates
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled"
  issueDate: Date
  dueDate: Date
  paidDate?: string

  // Quote data preservation
  originalQuoteData?: {
    businessName: string
    industry: string
    pageCount: number
    features: string[]
    timeline: string
    budget: string
    finalPrice: number
    totalHours: number
    requirements?: string
    additionalNotes?: string
  }

  // Contract data preservation
  contractData?: {
    projectTitle: string
    projectDescription: string
    serviceType: string
    timeline: string
    startDate: string
    deliveryDate: string
    milestones?: PaymentMilestone[]
  }

  // Payment and terms
  paymentTerms: string
  notes?: string
  internalNotes?: string
  currency: string

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
  lastModifiedBy?: string
}

// Conversion options
export interface ConversionOptions {
  templateId?: string
  paymentStructure?: "single" | "deposit_final" | "milestone" | "progress"
  customMilestones?: Partial<PaymentMilestone>[]
  taxRate?: number
  paymentTerms?: string
  includeDetailedItems?: boolean
  autoGenerateInvoices?: boolean
  userId?: string
}

// Conversion result
export interface ConversionResult {
  contract: EnhancedContract
  invoices: UnifiedInvoice[]
  paymentSchedule: PaymentMilestone[]
  summary: {
    totalAmount: number
    numberOfInvoices: number
    firstInvoiceAmount: number
    estimatedCompletionDate: string
    preservedQuoteData: boolean
  }
}

// Enhanced Quote to Contract Converter
export class EnhancedQuoteConverter {
  private static readonly DEFAULT_TAX_RATE = 0.0875 // 8.75%
  private static readonly DEFAULT_PAYMENT_TERMS = "Net 30"

  /**
   * Convert quote to contract and generate unified invoices
   */
  static convertQuoteToContractAndInvoices(quote: Quote, options: ConversionOptions = {}): ConversionResult {
    // Generate enhanced contract
    const contract = this.generateEnhancedContract(quote, options)

    // Generate unified invoices based on payment structure
    const invoices = this.generateUnifiedInvoices(quote, contract, options)

    // Extract payment schedule
    const paymentSchedule = contract.paymentStructure.schedule

    // Calculate summary
    const summary = {
      totalAmount: contract.paymentStructure.totalAmount,
      numberOfInvoices: invoices.length,
      firstInvoiceAmount: invoices[0]?.totalAmount || 0,
      estimatedCompletionDate: contract.projectDetails.endDate,
      preservedQuoteData: true,
    }

    return {
      contract,
      invoices,
      paymentSchedule,
      summary,
    }
  }

  /**
   * Generate enhanced contract from quote
   */
  private static generateEnhancedContract(quote: Quote, options: ConversionOptions): EnhancedContract {
    const templateId = options.templateId || "web-design-template"
    const contract = EnhancedContractTemplateService.generateContractFromQuote(quote, templateId)

    // Apply custom payment structure if provided
    if (options.paymentStructure) {
      contract.paymentStructure.type = options.paymentStructure

      // Regenerate schedule based on custom structure
      if (options.customMilestones && options.customMilestones.length > 0) {
        contract.paymentStructure.schedule = this.generateCustomPaymentSchedule(quote, options.customMilestones)
      } else {
        contract.paymentStructure.schedule = this.generatePaymentScheduleByType(quote, options.paymentStructure)
      }
    }

    // Apply custom payment terms
    if (options.paymentTerms) {
      contract.paymentStructure.paymentTerms = options.paymentTerms
    }

    // Add user metadata
    if (options.userId) {
      contract.createdBy = options.userId
      contract.lastModifiedBy = options.userId
    }

    return contract
  }

  /**
   * Generate unified invoices from contract
   */
  private static generateUnifiedInvoices(
    quote: Quote,
    contract: EnhancedContract,
    options: ConversionOptions,
  ): UnifiedInvoice[] {
    const invoices: UnifiedInvoice[] = []
    const taxRate = options.taxRate || this.DEFAULT_TAX_RATE

    // Generate invoice for each milestone
    contract.paymentStructure.schedule.forEach((milestone, index) => {
      const invoice = this.generateInvoiceFromMilestone(quote, contract, milestone, index, taxRate, options)
      invoices.push(invoice)
    })

    return invoices
  }

  /**
   * Generate invoice from milestone
   */
  private static generateInvoiceFromMilestone(
    quote: Quote,
    contract: EnhancedContract,
    milestone: PaymentMilestone,
    index: number,
    taxRate: number,
    options: ConversionOptions,
  ): UnifiedInvoice {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now() + index).slice(-6)}`

    // Determine invoice type
    let invoiceType: UnifiedInvoice["invoiceType"] = "milestone"
    if (contract.paymentStructure.schedule.length === 1) {
      invoiceType = "custom"
    } else if (index === 0 && milestone.percentage >= 40) {
      invoiceType = "deposit"
    } else if (index === contract.paymentStructure.schedule.length - 1) {
      invoiceType = "final"
    }

    // Generate invoice items
    const items = this.generateInvoiceItems(quote, contract, milestone, options.includeDetailedItems || false)

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * taxRate
    const totalAmount = subtotal + tax

    const invoice: UnifiedInvoice = {
      id: `invoice-${Date.now()}-${index}`,
      invoiceNumber,
      contractId: contract.id,
      quoteId: quote.id,
      clientId: quote.clientId,
      clientName: quote.clientName || quote.businessName,
      clientEmail: quote.clientEmail || '',
      clientAddress: quote.clientAddress || '',

      invoiceType,
      milestoneNumber: milestone.milestoneNumber,
      totalMilestones: contract.paymentStructure.schedule.length,
      progressPercentage: milestone.percentage,

      items,
      subtotal,
      tax,
      totalAmount,
      amountPaid: 0,
      amountDue: totalAmount,

      status: options.autoGenerateInvoices ? "draft" : "draft",
      issueDate: new Date(),
      dueDate: new Date(milestone.dueDate),

      originalQuoteData: {
        businessName: quote.businessName,
        industry: quote.industry,
        pageCount: quote.pageCount,
        features: quote.features,
        timeline: quote.timeline,
        budget: quote.budget || '',
        finalPrice: quote.finalPrice,
        totalHours: quote.totalHours || 0,
        requirements: quote.requirements,
        additionalNotes: quote.additionalNotes,
      },

      contractData: {
        projectTitle: contract.projectDetails.title,
        projectDescription: contract.projectDetails.description,
        serviceType: "Web Design & Development",
        timeline: contract.projectDetails.timeline,
        startDate: contract.projectDetails.startDate,
        deliveryDate: contract.projectDetails.endDate,
        milestones: contract.paymentStructure.schedule,
      },

      paymentTerms: contract.paymentStructure.paymentTerms,
      notes: this.generateInvoiceNotes(quote, milestone, invoiceType),
      internalNotes: this.generateInternalNotes(quote, contract, milestone),
      currency: contract.paymentStructure.currency,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: options.userId,
      lastModifiedBy: options.userId,
    }

    return invoice
  }

  /**
   * Generate detailed invoice items
   */
  private static generateInvoiceItems(
    quote: Quote,
    contract: EnhancedContract,
    milestone: PaymentMilestone,
    includeDetailed: boolean,
  ): UnifiedInvoiceItem[] {
    const items: UnifiedInvoiceItem[] = []

    if (includeDetailed && quote.features.length > 1) {
      // Generate detailed items based on features
      const baseAmount = milestone.amount * 0.3 // 30% for base services
      const featureAmount = milestone.amount * 0.7 // 70% for features
      const amountPerFeature = featureAmount / quote.features.length

      // Base service item
      items.push({
        id: `item-base-${Date.now()}`,
        description: `${milestone.name} - Base Web Design Services`,
        quantity: 1,
        unitPrice: baseAmount,
        total: baseAmount,
        category: "design",
        hoursAllocated: (quote.totalHours || 0) * 0.3 * (milestone.percentage / 100),
        milestonePhase: milestone.name,
        taxable: true,
        taxRate: 0,
      })

      // Feature-specific items
      quote.features.forEach((feature: string, index: number) => {
        items.push({
          id: `item-feature-${Date.now()}-${index}`,
          description: `${milestone.name} - ${feature}`,
          quantity: 1,
          unitPrice: amountPerFeature,
          total: amountPerFeature,
          category: this.categorizeFeature(feature),
          hoursAllocated: ((quote.totalHours || 0) * 0.7 * (milestone.percentage / 100)) / quote.features.length,
          relatedFeatures: [feature],
          milestonePhase: milestone.name,
          taxable: true,
          taxRate: 0,
        })
      })
    } else {
      // Single consolidated item
      items.push({
        id: `item-${Date.now()}`,
        description: `${milestone.name} - ${contract.projectDetails.title}`,
        quantity: 1,
        unitPrice: milestone.amount,
        total: milestone.amount,
        category: "custom",
        hoursAllocated: (quote.totalHours || 0) * (milestone.percentage / 100),
        relatedFeatures: quote.features,
        milestonePhase: milestone.name,
        taxable: true,
        taxRate: 0,
      })
    }

    return items
  }

  /**
   * Categorize feature for invoice items
   */
  private static categorizeFeature(feature: string): UnifiedInvoiceItem["category"] {
    const featureLower = feature.toLowerCase()

    if (featureLower.includes("design") || featureLower.includes("ui") || featureLower.includes("ux")) {
      return "design"
    } else if (featureLower.includes("seo") || featureLower.includes("optimization")) {
      return "seo"
    } else if (featureLower.includes("content") || featureLower.includes("cms")) {
      return "content"
    } else if (featureLower.includes("maintenance") || featureLower.includes("support")) {
      return "maintenance"
    } else {
      return "development"
    }
  }

  /**
   * Generate payment schedule by type
   */
  private static generatePaymentScheduleByType(
    quote: Quote,
    type: "single" | "deposit_final" | "milestone" | "progress",
  ): PaymentMilestone[] {
    const baseAmount = quote.finalPrice
    const schedule: PaymentMilestone[] = []
    const startDate = new Date()

    // Calculate timeline
    const timelineWeeks = quote.timeline.includes("week")
      ? Number.parseInt(quote.timeline.split("-")[0]) || 4
      : quote.timeline.includes("month")
        ? (Number.parseInt(quote.timeline.split("-")[0]) || 2) * 4
        : 8

    switch (type) {
      case "single":
        schedule.push({
          id: `milestone-${Date.now()}`,
          milestoneNumber: 1,
          name: "Full Payment",
          description: "Complete project payment",
          percentage: 100,
          amount: baseAmount,
          dueDate: new Date(startDate.getTime() + timelineWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          deliverables: ["Complete website", "All features implemented", "Testing completed", "Launch and training"],
          status: "pending",
        })
        break

      case "deposit_final":
        schedule.push(
          {
            id: `milestone-${Date.now()}-1`,
            milestoneNumber: 1,
            name: "Project Deposit",
            description: "Initial deposit to begin project",
            percentage: 50,
            amount: baseAmount * 0.5,
            dueDate: startDate.toISOString().split("T")[0],
            deliverables: ["Project kickoff", "Requirements gathering", "Initial designs"],
            status: "pending",
          },
          {
            id: `milestone-${Date.now()}-2`,
            milestoneNumber: 2,
            name: "Final Payment",
            description: "Final payment upon project completion",
            percentage: 50,
            amount: baseAmount * 0.5,
            dueDate: new Date(startDate.getTime() + timelineWeeks * 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            deliverables: ["Complete website", "Testing", "Launch", "Training"],
            status: "pending",
          },
        )
        break

      case "milestone":
        if (baseAmount < 5000) {
          return this.generatePaymentScheduleByType(quote, "deposit_final")
        } else if (baseAmount < 15000) {
          // 3-milestone schedule
          const milestones = [
            {
              name: "Project Start & Deposit",
              percentage: 40,
              deliverables: ["Project kickoff", "Requirements", "Wireframes"],
            },
            {
              name: "Design Approval",
              percentage: 30,
              deliverables: ["Visual designs", "Content integration", "Development start"],
            },
            { name: "Project Completion", percentage: 30, deliverables: ["Final development", "Testing", "Launch"] },
          ]

          milestones.forEach((milestone, index) => {
            const dueDate = new Date(startDate)
            dueDate.setDate(startDate.getDate() + (index + 1) * Math.floor((timelineWeeks * 7) / milestones.length))

            schedule.push({
              id: `milestone-${Date.now()}-${index + 1}`,
              milestoneNumber: index + 1,
              name: milestone.name,
              description: `${milestone.name} for ${quote.businessName}`,
              percentage: milestone.percentage,
              amount: baseAmount * (milestone.percentage / 100),
              dueDate: dueDate.toISOString().split("T")[0],
              deliverables: milestone.deliverables,
              status: "pending",
            })
          })
        } else {
          // 4-milestone schedule for larger projects
          const milestones = [
            {
              name: "Project Start & Deposit",
              percentage: 30,
              deliverables: ["Project kickoff", "Requirements", "Wireframes"],
            },
            {
              name: "Design Phase",
              percentage: 25,
              deliverables: ["Visual designs", "Design system", "Client approval"],
            },
            {
              name: "Development Phase",
              percentage: 25,
              deliverables: ["Frontend development", "Backend integration", "Content management"],
            },
            {
              name: "Launch & Completion",
              percentage: 20,
              deliverables: ["Testing", "Launch", "Training", "Documentation"],
            },
          ]

          milestones.forEach((milestone, index) => {
            const dueDate = new Date(startDate)
            dueDate.setDate(startDate.getDate() + (index + 1) * Math.floor((timelineWeeks * 7) / milestones.length))

            schedule.push({
              id: `milestone-${Date.now()}-${index + 1}`,
              milestoneNumber: index + 1,
              name: milestone.name,
              description: `${milestone.name} for ${quote.businessName}`,
              percentage: milestone.percentage,
              amount: baseAmount * (milestone.percentage / 100),
              dueDate: dueDate.toISOString().split("T")[0],
              deliverables: milestone.deliverables,
              status: "pending",
            })
          })
        }
        break

      case "progress":
        // Monthly progress payments
        const monthlyPayments = Math.ceil(timelineWeeks / 4)
        const percentagePerMonth = 100 / monthlyPayments

        for (let i = 0; i < monthlyPayments; i++) {
          const dueDate = new Date(startDate)
          dueDate.setMonth(startDate.getMonth() + i + 1)

          schedule.push({
            id: `milestone-${Date.now()}-${i + 1}`,
            milestoneNumber: i + 1,
            name: `Progress Payment ${i + 1}`,
            description: `Monthly progress payment ${i + 1} of ${monthlyPayments}`,
            percentage: percentagePerMonth,
            amount: baseAmount * (percentagePerMonth / 100),
            dueDate: dueDate.toISOString().split("T")[0],
            deliverables: [`Month ${i + 1} deliverables`, "Progress review", "Client approval"],
            status: "pending",
          })
        }
        break
    }

    return schedule
  }

  /**
   * Generate custom payment schedule
   */
  private static generateCustomPaymentSchedule(
    quote: Quote,
    customMilestones: Partial<PaymentMilestone>[],
  ): PaymentMilestone[] {
    const baseAmount = quote.finalPrice
    const startDate = new Date()

    return customMilestones.map((milestone, index) => ({
      id: milestone.id || `milestone-${Date.now()}-${index}`,
      milestoneNumber: milestone.milestoneNumber || index + 1,
      name: milestone.name || `Milestone ${index + 1}`,
      description: milestone.description || `Custom milestone ${index + 1}`,
      percentage: milestone.percentage || 0,
      amount: milestone.amount || baseAmount * ((milestone.percentage || 0) / 100),
      dueDate:
        milestone.dueDate ||
        new Date(startDate.getTime() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      deliverables: milestone.deliverables || [`Milestone ${index + 1} deliverables`],
      dependencies: milestone.dependencies,
      status: "pending",
    }))
  }

  /**
   * Generate invoice notes
   */
  private static generateInvoiceNotes(
    quote: Quote,
    milestone: PaymentMilestone,
    invoiceType: UnifiedInvoice["invoiceType"],
  ): string {
    let notes = `${milestone.name} for ${quote.businessName}\n\n`
    notes += `Project Details:\n`
    notes += `• ${quote.pageCount} pages\n`
    notes += `• Industry: ${quote.industry}\n`
    notes += `• Timeline: ${quote.timeline}\n\n`
    notes += `Milestone Deliverables:\n`
    milestone.deliverables.forEach((deliverable) => {
      notes += `• ${deliverable}\n`
    })

    if (invoiceType === "deposit") {
      notes += `\nThis is the initial deposit to begin your project. Work will commence upon receipt of payment.`
    } else if (invoiceType === "final") {
      notes += `\nThis is the final payment for your project. All deliverables will be completed upon receipt.`
    }

    return notes
  }

  /**
   * Generate internal notes
   */
  private static generateInternalNotes(quote: Quote, contract: EnhancedContract, milestone: PaymentMilestone): string {
    let notes = `Auto-generated from Quote ${quote.id} via Contract ${contract.contractNumber}\n\n`
    notes += `Original Quote Data:\n`
    notes += `• Budget: ${quote.budget}\n`
    notes += `• Total Hours: ${quote.totalHours}\n`
    notes += `• Features: ${quote.features.join(", ")}\n\n`
    notes += `Milestone: ${milestone.milestoneNumber} of ${contract.paymentStructure.schedule.length}\n`
    notes += `Percentage: ${milestone.percentage}%\n`

    if (milestone.dependencies && milestone.dependencies.length > 0) {
      notes += `Dependencies: ${milestone.dependencies.join(", ")}\n`
    }

    return notes
  }

  /**
   * Validate conversion options
   */
  static validateConversionOptions(options: ConversionOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (options.customMilestones && options.customMilestones.length > 0) {
      const totalPercentage = options.customMilestones.reduce((sum, milestone) => sum + (milestone.percentage || 0), 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push("Custom milestones must total 100%")
      }

      options.customMilestones.forEach((milestone, index) => {
        if (!milestone.name) errors.push(`Milestone ${index + 1} name is required`)
        if (!milestone.percentage || milestone.percentage <= 0)
          errors.push(`Milestone ${index + 1} percentage must be greater than 0`)
      })
    }

    if (options.taxRate && (options.taxRate < 0 || options.taxRate > 1)) {
      errors.push("Tax rate must be between 0 and 1")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Generate conversion summary
   */
  static generateConversionSummary(result: ConversionResult): string {
    const { contract, invoices, summary } = result

    let summaryText = `Conversion Summary\n`
    summaryText += `================\n\n`
    summaryText += `Contract: ${contract.contractNumber}\n`
    summaryText += `Client: ${contract.clientName}\n`
    summaryText += `Project: ${contract.projectDetails.title}\n`
    summaryText += `Total Amount: ${contract.paymentStructure.currency} ${summary.totalAmount.toLocaleString()}\n`
    summaryText += `Payment Structure: ${contract.paymentStructure.type}\n`
    summaryText += `Number of Invoices: ${summary.numberOfInvoices}\n`
    summaryText += `Estimated Completion: ${new Date(summary.estimatedCompletionDate).toLocaleDateString()}\n\n`

    summaryText += `Invoice Schedule:\n`
    invoices.forEach((invoice, index) => {
      summaryText += `${index + 1}. ${invoice.invoiceNumber} - ${invoice.invoiceType} - ${invoice.currency} ${invoice.totalAmount.toLocaleString()} (Due: ${new Date(invoice.dueDate).toLocaleDateString()})\n`
    })

    summaryText += `\nQuote Data Preserved: ${summary.preservedQuoteData ? "Yes" : "No"}\n`

    return summaryText
  }
}

export default EnhancedQuoteConverter
