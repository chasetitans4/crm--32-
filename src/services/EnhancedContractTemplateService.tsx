import type { Quote, Contract, Invoice } from "../schemas/contractInvoiceSchemas"

// Enhanced interfaces for unified system
export interface EnhancedContract {
  // Core contract data
  id: string
  contractNumber: string
  quoteId?: string
  clientId?: string
  clientName: string
  clientEmail: string
  contractTitle: string
  startDate: Date
  endDate: Date
  contractTerms: {
    serviceDescription: string
    clientResponsibilities: string[]
    providerResponsibilities: string[]
    intellectualProperty: string
    confidentiality: string
    termination: string
    disputeResolution: string
    governingLaw: string
  }
  totalAmount: number
  paymentSchedule: string
  scopeOfWork: string

  // Enhanced project details with quote data preservation
  projectDetails: {
    title: string
    description: string
    scope: string[]
    deliverables: string[]
    timeline: string
    startDate: string
    endDate: string

    // Preserved quote data
    originalQuoteData?: {
      businessName: string
      industry: string
      pageCount: number
      features: string[]
      timeline: string
      budget: string
      finalPrice: number
      totalHours: number
      requirements: string
      additionalNotes: string
    }
  }

  // Payment structure for invoice generation
  paymentStructure: {
    type: "single" | "deposit_final" | "milestone" | "progress"
    totalAmount: number
    currency: string

    // Payment schedule
    schedule: PaymentMilestone[]

    // Terms
    paymentTerms: string
    lateFeePercentage?: number
    discountTerms?: string
  }

  // Contract terms
  status: "draft" | "sent" | "under_review" | "signed" | "active" | "completed" | "terminated"
  signedDate?: string
  completedDate?: string

  // Invoice tracking
  invoiceIds: string[]
  totalInvoiced: number
  totalPaid: number

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
  lastModifiedBy?: string
}

export interface PaymentMilestone {
  id: string
  milestoneNumber: number
  name: string
  description: string
  percentage: number
  amount: number
  dueDate: string
  deliverables: string[]
  dependencies?: string[]
  status: "pending" | "in_progress" | "completed" | "invoiced" | "paid"
  invoiceId?: string
  completedDate?: string
}

export interface ContractTemplate {
  id: string
  name: string
  description: string
  category: "web_design" | "web_development" | "full_service" | "maintenance" | "custom"

  // Template content with placeholders
  sections: {
    introduction: string
    scope: string
    deliverables: string
    timeline: string
    payment: string
    terms: string
    signatures: string
  }

  // Default payment structure
  defaultPaymentStructure: {
    type: "single" | "deposit_final" | "milestone" | "progress"
    schedule: Omit<PaymentMilestone, "id" | "amount" | "dueDate" | "status">[]
  }

  // Placeholders for dynamic content
  placeholders: {
    [key: string]: {
      description: string
      type: "text" | "number" | "date" | "list" | "currency"
      required: boolean
      defaultValue?: any
    }
  }

  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Enhanced Contract Template Service
export class EnhancedContractTemplateService {
  private static templates: ContractTemplate[] = [
    {
      id: "web-design-template",
      name: "Web Design & Development Contract",
      description: "Comprehensive contract for web design and development projects",
      category: "full_service",
      sections: {
        introduction: `This Web Design and Development Agreement ("Agreement") is entered into on {{contract_date}} between {{client_name}} ("Client") and {{provider_name}} ("Provider") for the creation of a {{page_count}}-page website for {{business_name}} in the {{industry}} industry.`,
        scope: `The Provider agrees to design and develop a professional website including:\n\n{{features_list}}\n\nThe website will be optimized for modern browsers and mobile devices, following current web standards and best practices.`,
        deliverables: `The Provider will deliver:\n\n1. Custom website design mockups\n2. Fully functional website with {{page_count}} pages\n3. Content Management System (CMS) integration\n4. Basic SEO optimization\n5. Mobile-responsive design\n6. {{additional_deliverables}}\n\nAll deliverables will be completed according to the project timeline outlined below.`,
        timeline: `Project Timeline: {{timeline}}\n\nStart Date: {{start_date}}\nEstimated Completion: {{end_date}}\n\nThe project will be completed in phases with regular client review and approval points. Any changes to the scope or timeline must be agreed upon in writing.`,
        payment: `Total Project Cost: {{total_amount}} {{currency}}\n\nPayment Schedule:\n{{payment_schedule}}\n\nPayment Terms: {{payment_terms}}\nLate payments may incur a {{late_fee_percentage}}% monthly fee.`,
        terms: `1. INTELLECTUAL PROPERTY\n{{intellectual_property_terms}}\n\n2. CLIENT RESPONSIBILITIES\n{{client_responsibilities}}\n\n3. PROVIDER RESPONSIBILITIES\n{{provider_responsibilities}}\n\n4. CONFIDENTIALITY\n{{confidentiality_terms}}\n\n5. TERMINATION\n{{termination_terms}}\n\n6. DISPUTE RESOLUTION\n{{dispute_resolution}}\n\n7. GOVERNING LAW\n{{governing_law}}`,
        signatures: `By signing below, both parties agree to the terms and conditions outlined in this agreement.\n\nCLIENT:\n\nSignature: ___________________________ Date: ___________\nPrint Name: {{client_name}}\nTitle: {{client_title}}\n\nPROVIDER:\n\nSignature: ___________________________ Date: ___________\nPrint Name: {{provider_name}}\nTitle: {{provider_title}}`,
      },
      defaultPaymentStructure: {
        type: "milestone",
        schedule: [
          {
            milestoneNumber: 1,
            name: "Project Initiation & Deposit",
            description: "Project kickoff, requirements gathering, and initial design concepts",
            percentage: 40,
            deliverables: ["Project kickoff meeting", "Requirements document", "Initial wireframes", "Design concepts"],
            dependencies: [],
          },
          {
            milestoneNumber: 2,
            name: "Design Approval",
            description: "Final design approval and development initiation",
            percentage: 30,
            deliverables: ["Final design mockups", "Design system", "Client approval", "Development setup"],
            dependencies: ["Milestone 1 completion", "Client feedback on designs"],
          },
          {
            milestoneNumber: 3,
            name: "Development & Launch",
            description: "Website development, testing, and launch",
            percentage: 30,
            deliverables: ["Fully developed website", "Testing completion", "Launch", "Training and documentation"],
            dependencies: ["Milestone 2 completion", "Content provided by client"],
          },
        ],
      },
      placeholders: {
        contract_date: { description: "Contract signing date", type: "date", required: true },
        client_name: { description: "Client full name or company name", type: "text", required: true },
        provider_name: {
          description: "Service provider name",
          type: "text",
          required: true,
          defaultValue: "Your Company Name",
        },
        business_name: { description: "Client business name", type: "text", required: true },
        industry: { description: "Client industry", type: "text", required: true },
        page_count: { description: "Number of website pages", type: "number", required: true },
        features_list: { description: "List of website features", type: "list", required: true },
        timeline: { description: "Project timeline", type: "text", required: true },
        start_date: { description: "Project start date", type: "date", required: true },
        end_date: { description: "Project end date", type: "date", required: true },
        total_amount: { description: "Total project cost", type: "currency", required: true },
        currency: { description: "Currency code", type: "text", required: true, defaultValue: "USD" },
        payment_schedule: { description: "Payment milestone schedule", type: "text", required: true },
        payment_terms: { description: "Payment terms", type: "text", required: true, defaultValue: "Net 30" },
        late_fee_percentage: { description: "Late fee percentage", type: "number", required: false, defaultValue: 1.5 },
        additional_deliverables: { description: "Additional project deliverables", type: "list", required: false },
        intellectual_property_terms: {
          description: "IP ownership terms",
          type: "text",
          required: true,
          defaultValue: "Upon full payment, all intellectual property rights transfer to the Client.",
        },
        client_responsibilities: { description: "Client responsibilities", type: "list", required: true },
        provider_responsibilities: { description: "Provider responsibilities", type: "list", required: true },
        confidentiality_terms: { description: "Confidentiality agreement terms", type: "text", required: true },
        termination_terms: { description: "Contract termination terms", type: "text", required: true },
        dispute_resolution: { description: "Dispute resolution process", type: "text", required: true },
        governing_law: { description: "Governing law jurisdiction", type: "text", required: true },
        client_title: { description: "Client title/position", type: "text", required: false },
        provider_title: {
          description: "Provider title/position",
          type: "text",
          required: false,
          defaultValue: "Owner/Director",
        },
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Generate enhanced contract from quote
  static generateContractFromQuote(quote: Quote, templateId = "web-design-template"): EnhancedContract {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const contractNumber = `CON-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Generate payment schedule based on quote amount and template
    const paymentSchedule = this.generatePaymentSchedule(quote, template)

    // Calculate timeline dates
    const startDate = new Date()
    const timelineWeeks = quote.timeline.includes("week")
      ? Number.parseInt(quote.timeline.split("-")[0]) || 4
      : quote.timeline.includes("month")
        ? (Number.parseInt(quote.timeline.split("-")[0]) || 2) * 4
        : 8
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + timelineWeeks * 7)

    const contract: EnhancedContract = {
      id: `contract-${Date.now()}`,
      contractNumber,
        quoteId: quote.id,
        clientId: undefined, // Quote doesn't have clientId, only clientName
        clientName: quote.clientName || quote.businessName,
        clientEmail: quote.clientEmail || quote.clientName || "client@example.com",
        contractTitle: `Website Development Contract - ${quote.businessName}`,
        startDate: startDate,
        endDate: endDate,

        totalAmount: quote.finalPrice,
        paymentSchedule: "Payment schedule as outlined in payment structure.",
        scopeOfWork: `Development of ${quote.pageCount} page website with specified features.`,

        projectDetails: {
        title: `${quote.businessName} Website Design & Development`,
        description: `Professional ${quote.pageCount}-page website for ${quote.businessName} in the ${quote.industry} industry, featuring ${quote.features.join(", ")}.`,
        scope: [
          `Design and develop ${quote.pageCount} custom web pages`,
          ...quote.features.map((feature) => `Implement ${feature}`),
          "Mobile-responsive design",
          "Basic SEO optimization",
          "Content management system integration",
          "Cross-browser compatibility testing",
        ],
        deliverables: [
          "Custom website design mockups",
          `Fully functional ${quote.pageCount}-page website`,
          "Content Management System (CMS)",
          "Mobile-responsive design",
          "Basic SEO setup",
          "Website documentation and training",
          "Post-launch support (30 days)",
        ],
        timeline: quote.timeline,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],

        originalQuoteData: {
          businessName: quote.businessName,
          industry: quote.industry,
          pageCount: quote.pageCount,
          features: quote.features,
          timeline: quote.timeline,
          budget: quote.budget || "",
          finalPrice: quote.finalPrice,
          totalHours: quote.totalHours || 0,
          requirements: "",
          additionalNotes: "",
        },
      },

      paymentStructure: {
        type: quote.finalPrice < 5000 ? "deposit_final" : quote.finalPrice < 15000 ? "milestone" : "milestone",
        totalAmount: quote.finalPrice,
        currency: "USD",
        schedule: paymentSchedule,
        paymentTerms: "Net 30",
        lateFeePercentage: 1.5,
      },

      contractTerms: {
        serviceDescription: `Professional web design and development services for ${quote.businessName}, including custom design, development, and launch of a ${quote.pageCount}-page website with specified features and functionality.`,
        clientResponsibilities: [
          "Provide all necessary content, images, and materials in a timely manner",
          "Review and provide feedback on designs and development within 5 business days",
          "Provide access to hosting and domain accounts as needed",
          "Make timely payments according to the agreed schedule",
          "Communicate any changes or concerns promptly",
        ],
        providerResponsibilities: [
          "Deliver all agreed-upon features and functionality",
          "Ensure website is mobile-responsive and cross-browser compatible",
          "Provide regular project updates and maintain communication",
          "Deliver project within agreed timeline",
          "Provide 30 days of post-launch support",
          "Maintain confidentiality of client information",
        ],
        intellectualProperty:
          "Upon full payment of all invoices, all intellectual property rights, including but not limited to design, code, and content created specifically for this project, will transfer to the Client. The Provider retains rights to general methodologies, techniques, and any pre-existing intellectual property.",
        confidentiality:
          "Both parties agree to maintain confidentiality of all proprietary information shared during the course of this project. This includes but is not limited to business strategies, technical specifications, and any sensitive business information.",
        termination:
          "Either party may terminate this agreement with 30 days written notice. In the event of termination, the Client will pay for all work completed up to the termination date. Any work in progress will be delivered in its current state.",
        disputeResolution:
          "Any disputes arising from this agreement will first be addressed through good faith negotiation. If resolution cannot be reached, disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.",
        governingLaw:
          "This agreement shall be governed by and construed in accordance with the laws of [Your State/Province], without regard to its conflict of law provisions.",
      },

      status: "draft",
      invoiceIds: [],
      totalInvoiced: 0,
      totalPaid: 0,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return contract
  }

  // Generate payment schedule based on quote and template
  private static generatePaymentSchedule(quote: Quote, template: ContractTemplate): PaymentMilestone[] {
    const baseAmount = quote.finalPrice
    const schedule: PaymentMilestone[] = []

    // Use template's default schedule as base
    const templateSchedule = template.defaultPaymentStructure.schedule

    // Calculate timeline distribution
    const timelineWeeks = quote.timeline.includes("week")
      ? Number.parseInt(quote.timeline.split("-")[0]) || 4
      : quote.timeline.includes("month")
        ? (Number.parseInt(quote.timeline.split("-")[0]) || 2) * 4
        : 8

    const startDate = new Date()

    templateSchedule.forEach((milestone, index) => {
      const dueDate = new Date(startDate)
      dueDate.setDate(startDate.getDate() + (index + 1) * Math.floor((timelineWeeks * 7) / templateSchedule.length))

      schedule.push({
        id: `milestone-${Date.now()}-${index}`,
        milestoneNumber: milestone.milestoneNumber,
        name: milestone.name,
        description: milestone.description,
        percentage: milestone.percentage,
        amount: baseAmount * (milestone.percentage / 100),
        dueDate: dueDate.toISOString().split("T")[0],
        deliverables: milestone.deliverables,
        dependencies: milestone.dependencies,
        status: "pending",
      })
    })

    return schedule
  }

  // Populate contract template with data
  static populateTemplate(template: ContractTemplate, contract: EnhancedContract): string {
    let populatedContent = ""

    // Combine all sections
    const fullTemplate = Object.values(template.sections).join("\n\n")

    // Create placeholder values from contract data
    const placeholderValues: Record<string, any> = {
      contract_date: new Date().toLocaleDateString(),
      client_name: contract.clientName,
      provider_name: "Your Company Name", // This should come from settings
      business_name: contract.projectDetails.originalQuoteData?.businessName || contract.clientName,
      industry: contract.projectDetails.originalQuoteData?.industry || "Technology",
      page_count: contract.projectDetails.originalQuoteData?.pageCount || 5,
      features_list: contract.projectDetails.scope.map((item) => `• ${item}`).join("\n"),
      timeline: contract.projectDetails.timeline,
      start_date: new Date(contract.projectDetails.startDate).toLocaleDateString(),
      end_date: new Date(contract.projectDetails.endDate).toLocaleDateString(),
      total_amount: contract.paymentStructure.totalAmount.toLocaleString(),
      currency: contract.paymentStructure.currency,
      payment_schedule: contract.paymentStructure.schedule
        .map(
          (milestone) =>
            `${milestone.milestoneNumber}. ${milestone.name} - ${milestone.percentage}% (${contract.paymentStructure.currency} ${milestone.amount.toLocaleString()}) - Due: ${new Date(milestone.dueDate).toLocaleDateString()}`,
        )
        .join("\n"),
      payment_terms: contract.paymentStructure.paymentTerms,
      late_fee_percentage: contract.paymentStructure.lateFeePercentage || 1.5,
      additional_deliverables: contract.projectDetails.deliverables
        .slice(4)
        .map((item) => `• ${item}`)
        .join("\n"),
      intellectual_property_terms: contract.contractTerms.intellectualProperty,
      client_responsibilities: contract.contractTerms.clientResponsibilities.map((item: string) => `• ${item}`).join("\n"),
      provider_responsibilities: contract.contractTerms.providerResponsibilities.map((item: string) => `• ${item}`).join("\n"),
      confidentiality_terms: contract.contractTerms.confidentiality,
      termination_terms: contract.contractTerms.termination,
      dispute_resolution: contract.contractTerms.disputeResolution,
      governing_law: contract.contractTerms.governingLaw,
      client_title: "Owner/Manager",
      provider_title: "Owner/Director",
    }

    // Replace placeholders
    populatedContent = fullTemplate
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g")
      populatedContent = populatedContent.replace(placeholder, String(value))
    })

    return populatedContent
  }

  // Generate invoice from contract milestone
  static generateInvoiceFromMilestone(contract: EnhancedContract, milestoneId: string): Partial<Invoice> {
    const milestone = contract.paymentStructure.schedule.find((m) => m.id === milestoneId)
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found`)
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    return {
      id: `invoice-${Date.now()}`,
      invoiceNumber,
      clientName: contract.clientName,
      clientEmail: contract.clientEmail,
      clientAddress: "Address not provided",

      items: [
        {
          id: `item-${Date.now()}`,
          description: `${milestone.name} - ${contract.projectDetails.title}`,
          quantity: 1,
          price: milestone.amount,
        },
      ],

      status: "Draft" as const,
      issueDate: new Date(),
      dueDate: new Date(milestone.dueDate),
      notes: `Milestone ${milestone.milestoneNumber}: ${milestone.description}\n\nDeliverables:\n${milestone.deliverables.map((d) => `• ${d}`).join("\n")}`,
    }
  }

  // Update contract with invoice information
  static updateContractWithInvoice(
    contract: EnhancedContract,
    invoice: Invoice,
    milestoneId: string,
  ): EnhancedContract {
    const updatedSchedule = contract.paymentStructure.schedule.map((milestone) => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          status: "invoiced" as const,
          invoiceId: invoice.id,
        }
      }
      return milestone
    })

    return {
      ...contract,
      paymentStructure: {
        ...contract.paymentStructure,
        schedule: updatedSchedule,
      },
      invoiceIds: [...contract.invoiceIds, invoice.id || ''],
      totalInvoiced: contract.totalInvoiced + (invoice.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0),
      updatedAt: new Date().toISOString(),
    }
  }

  // Get available templates
  static getTemplates(): ContractTemplate[] {
    return this.templates.filter((t) => t.isActive)
  }

  // Get template by ID
  static getTemplate(id: string): ContractTemplate | undefined {
    return this.templates.find((t) => t.id === id && t.isActive)
  }

  // Validate contract data
  static validateContract(contract: Partial<EnhancedContract>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!contract.clientName) errors.push("Client name is required")
    if (!contract.projectDetails?.title) errors.push("Project title is required")
    if (!contract.projectDetails?.description) errors.push("Project description is required")
    if (!contract.paymentStructure?.totalAmount || contract.paymentStructure.totalAmount <= 0) {
      errors.push("Valid total amount is required")
    }
    if (!contract.paymentStructure?.schedule || contract.paymentStructure.schedule.length === 0) {
      errors.push("Payment schedule is required")
    }

    // Validate payment schedule totals 100%
    if (contract.paymentStructure?.schedule) {
      const totalPercentage = contract.paymentStructure.schedule.reduce(
        (sum, milestone) => sum + milestone.percentage,
        0,
      )
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push("Payment schedule must total 100%")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Generate contract preview
  static generatePreview(contract: EnhancedContract, templateId = "web-design-template"): string {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    return this.populateTemplate(template, contract)
  }
}

export default EnhancedContractTemplateService
