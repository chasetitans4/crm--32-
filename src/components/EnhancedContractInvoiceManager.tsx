import React, { useState, useCallback, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Link,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  X
} from "lucide-react"

// ===== TYPE DEFINITIONS =====
interface Quote {
  id: string
  quoteNumber: string
  clientName: string
  clientEmail: string
  clientPhone?: string
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

interface Contract {
  id: string
  quoteId?: string
  clientId: string
  contractNumber: string
  contractTitle: string
  clientName: string
  clientEmail: string
  startDate: string
  endDate: string
  terms: string
  totalAmount: number
  paymentSchedule: string
  scopeOfWork: string
  clientInfo: {
    name: string
    email: string
    phone: string
    company: string
    address: string
  }
  projectDetails: {
    title: string
    description: string
  }
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  clientEmail: string
  clientAddress: string
  issueDate: Date
  dueDate: Date
  items: {
    id: string
    description: string
    quantity: number
    price: number
    total: number
  }[]
  subtotal: number
  tax: number
  totalAmount: number
  notes?: string
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue'
}

interface EnhancedContract {
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
  projectDetails: {
    title: string
    description: string
    scope: string[]
    deliverables: string[]
    timeline: string
    startDate: string
    endDate: string
  }
  paymentStructure: {
    type: 'single' | 'deposit_final' | 'milestone' | 'progress'
    totalAmount: number
    currency: string
    schedule: PaymentMilestone[]
  }
  createdAt?: string
  updatedAt?: string
}

interface PaymentMilestone {
  id: string
  name: string
  percentage: number
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'invoiced'
  invoiceId?: string
}

interface UnifiedInvoice {
  id: string
  invoiceNumber: string
  contractId?: string
  quoteId?: string
  clientId?: string
  clientName: string
  clientEmail: string
  clientAddress: string
  invoiceType: 'deposit' | 'milestone' | 'final' | 'progress' | 'custom'
  items: {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax: number
  totalAmount: number
  amountPaid: number
  amountDue: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  issueDate: Date
  dueDate: Date
  notes?: string
}

interface ConversionOptions {
  paymentStructure: 'single' | 'deposit_final' | 'milestone' | 'progress'
  taxRate: number
  paymentTerms: string
  includeDetailedItems: boolean
  autoGenerateInvoices: boolean
  userId?: string
}

interface ConversionResult {
  contract: EnhancedContract
  invoices: UnifiedInvoice[]
  success: boolean
  errors: string[]
}

interface DashboardStats {
  totalQuotes: number
  totalContracts: number
  totalInvoices: number
  totalRevenue: number
  pendingPayments: number
  activeProjects: number
  conversionRate: number
  averageProjectValue: number
}

interface ConversionFlow {
  step: 'select_quote' | 'configure_contract' | 'setup_payments' | 'review' | 'complete'
  selectedQuote?: Quote
  conversionOptions: ConversionOptions
  previewResult?: ConversionResult
  errors: string[]
}

// ===== MOCK DATA =====
const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'Q-2024-001',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    businessName: 'Doe Enterprises',
    industry: 'Technology',
    pageCount: 5,
    features: ['Responsive Design', 'E-commerce', 'SEO'],
    timeline: '6 weeks',
    budget: '$5000-$10000',
    finalPrice: 7500,
    totalHours: 150,
    requirements: 'Modern website with e-commerce functionality',
    additionalNotes: 'Client prefers blue color scheme',
    status: 'accepted',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    quoteNumber: 'Q-2024-002',
    clientName: 'Jane Smith',
    clientEmail: 'jane@company.com',
    businessName: 'Smith Corp',
    industry: 'Healthcare',
    pageCount: 8,
    features: ['Patient Portal', 'Appointment Booking', 'HIPAA Compliance'],
    timeline: '8 weeks',
    budget: '$10000-$15000',
    finalPrice: 12000,
    totalHours: 200,
    requirements: 'Healthcare website with patient management',
    additionalNotes: 'Must be HIPAA compliant',
    status: 'sent',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-22T11:15:00Z'
  }
]

const mockContracts: Contract[] = [
  {
    id: '1',
    quoteId: '1',
    clientId: 'client-1',
    contractNumber: 'C-2024-001',
    contractTitle: 'Website Development for Doe Enterprises',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    terms: 'Standard web development terms and conditions',
    totalAmount: 7500,
    paymentSchedule: '50% upfront, 50% on completion',
    scopeOfWork: 'Responsive website with e-commerce functionality',
    clientInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      company: 'Doe Enterprises',
      address: '123 Business St, City, State 12345'
    },
    projectDetails: {
      title: 'E-commerce Website',
      description: 'Modern responsive website with shopping cart'
    },
    status: 'active',
    priority: 'high',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  }
]

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientAddress: '123 Business St, City, State 12345',
    issueDate: new Date('2024-02-01'),
    dueDate: new Date('2024-02-15'),
    items: [
      {
        id: '1',
        description: 'Website Development - Deposit',
        quantity: 1,
        price: 3750,
        total: 3750
      }
    ],
    subtotal: 3750,
    tax: 328.13,
    totalAmount: 4078.13,
    notes: 'Deposit payment for website development project',
    status: 'Paid'
  }
]

// ===== MOCK CONTEXT AND HOOKS =====
const mockAppState = {
  quotes: mockQuotes,
  contracts: mockContracts,
  invoices: mockInvoices
}

const useAppContext = () => {
  const [state, setState] = useState(mockAppState)
  
  const dispatch = useCallback((action: { type: string; payload: any }) => {
    setState(prevState => {
      switch (action.type) {
        case 'ADD_CONTRACT':
          return {
            ...prevState,
            contracts: [...prevState.contracts, action.payload]
          }
        case 'ADD_INVOICE':
          return {
            ...prevState,
            invoices: [...prevState.invoices, action.payload]
          }
        default:
          return prevState
      }
    })
  }, [])
  
  return { state, dispatch }
}

const useAuth = () => {
  return {
    user: {
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin'
    }
  }
}

const useRoleAccess = (role: string) => {
  return {
    hasAccess: true
  }
}

const useToast = () => {
  return {
    showSuccess: (message: string) => {
      console.log('Success:', message)
    },
    showError: (message: string) => {
      console.error('Error:', message)
    }
  }
}

// ===== MOCK SERVICES =====
const EnhancedContractTemplateService = {
  getTemplate: (id: string) => ({
    id,
    name: 'Standard Web Development Contract',
    content: 'This is a standard contract template.'
  })
}

const EnhancedQuoteConverter = {
  convertQuoteToContractAndInvoices: (quote: Quote, options: ConversionOptions): ConversionResult => {
    const contract: EnhancedContract = {
      id: `contract-${Date.now()}`,
      contractNumber: `C-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      quoteId: quote.id,
      clientId: `client-${quote.id}`,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      contractTitle: `${quote.businessName} - ${quote.requirements}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      contractTerms: {
        serviceDescription: quote.requirements,
        clientResponsibilities: ['Provide content', 'Review deliverables'],
        providerResponsibilities: ['Develop website', 'Provide support'],
        intellectualProperty: 'Standard IP terms',
        confidentiality: 'Standard confidentiality terms',
        termination: 'Standard termination clause',
        disputeResolution: 'Mediation and arbitration',
        governingLaw: 'State law'
      },
      totalAmount: quote.finalPrice,
      paymentSchedule: options.paymentTerms,
      scopeOfWork: quote.requirements,
      projectDetails: {
        title: quote.businessName,
        description: quote.requirements,
        scope: quote.features,
        deliverables: ['Website', 'Documentation'],
        timeline: quote.timeline,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      paymentStructure: {
        type: options.paymentStructure,
        totalAmount: quote.finalPrice,
        currency: 'USD',
        schedule: [
          {
            id: '1',
            name: 'Deposit',
            percentage: 50,
            amount: quote.finalPrice * 0.5,
            dueDate: new Date().toISOString(),
            status: 'pending'
          },
          {
            id: '2',
            name: 'Final Payment',
            percentage: 50,
            amount: quote.finalPrice * 0.5,
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const invoices: UnifiedInvoice[] = [
      {
        id: `invoice-${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        contractId: contract.id,
        quoteId: quote.id,
        clientId: contract.clientId,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientAddress: '',
        invoiceType: 'deposit',
        items: [
          {
            id: '1',
            description: 'Project Deposit',
            quantity: 1,
            unitPrice: quote.finalPrice * 0.5,
            total: quote.finalPrice * 0.5
          }
        ],
        subtotal: quote.finalPrice * 0.5,
        tax: quote.finalPrice * 0.5 * options.taxRate,
        totalAmount: quote.finalPrice * 0.5 * (1 + options.taxRate),
        amountPaid: 0,
        amountDue: quote.finalPrice * 0.5 * (1 + options.taxRate),
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: 'Deposit payment for project'
      }
    ]

    return {
      contract,
      invoices,
      success: true,
      errors: []
    }
  }
}

// ===== MOCK UNIFIED INVOICE SYSTEM =====
// UnifiedInvoiceSystem component removed - functionality integrated into main component

// ===== MAIN COMPONENT =====
const EnhancedContractInvoiceManager: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const { hasAccess: isAdmin } = useRoleAccess("Admin")
  const { showSuccess, showError } = useToast()
  
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quotes' | 'contracts' | 'invoices' | 'conversion'>('dashboard')
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Modal states
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  
  // Conversion flow state
  const [conversionFlow, setConversionFlow] = useState<ConversionFlow>({
    step: 'select_quote',
    conversionOptions: {
      paymentStructure: 'milestone',
      taxRate: 0.0875,
      paymentTerms: 'Net 30',
      includeDetailedItems: true,
      autoGenerateInvoices: true,
      userId: user?.id
    },
    errors: []
  })
  
  // Selected items
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  // Enhanced data with conversion tracking
  const [enhancedContracts, setEnhancedContracts] = useState<EnhancedContract[]>([])
  const [unifiedInvoices, setUnifiedInvoices] = useState<UnifiedInvoice[]>([])
  
  // New Quote form state
  const [newQuoteForm, setNewQuoteForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    businessName: '',
    industry: '',
    pageCount: 1,
    features: [] as string[],
    timeline: '',
    budget: '',
    finalPrice: 0,
    totalHours: 0,
    requirements: '',
    additionalNotes: ''
  })
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)
  
  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const validateForm = useCallback((formData: typeof newQuoteForm): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    // Required field validations
    if (!formData.clientName.trim()) {
      errors.clientName = 'Client name is required'
    }
    
    if (!formData.clientEmail.trim()) {
      errors.clientEmail = 'Client email is required'
    } else if (!validateEmail(formData.clientEmail)) {
      errors.clientEmail = 'Please enter a valid email address'
    }
    
    if (!formData.businessName.trim()) {
      errors.businessName = 'Business name is required'
    }
    
    if (!formData.industry) {
      errors.industry = 'Please select an industry'
    }
    
    if (!formData.timeline.trim()) {
      errors.timeline = 'Timeline is required'
    }
    
    if (!formData.budget) {
      errors.budget = 'Please select a budget range'
    }
    
    if (formData.finalPrice <= 0) {
      errors.finalPrice = 'Final price must be greater than 0'
    }
    
    if (!formData.requirements.trim()) {
      errors.requirements = 'Project requirements are required'
    }
    
    if (formData.pageCount < 1) {
      errors.pageCount = 'Page count must be at least 1'
    }
    
    return errors
  }, [])
  
  // Handler functions
  const handleNewQuoteFormChange = useCallback((field: string, value: any) => {
    const updatedForm = {
      ...newQuoteForm,
      [field]: value
    }
    
    setNewQuoteForm(updatedForm)
    
    // Validate form and update errors
    const errors = validateForm(updatedForm)
    setFormErrors(errors)
    setIsFormValid(Object.keys(errors).length === 0)
  }, [newQuoteForm, validateForm])
  
  const handleNewQuote = useCallback(() => {
    // Reset form when opening modal
    setNewQuoteForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      businessName: '',
      industry: '',
      pageCount: 1,
      features: [],
      timeline: '',
      budget: '',
      finalPrice: 0,
      totalHours: 0,
      requirements: '',
      additionalNotes: ''
    })
    setFormErrors({})
    setIsFormValid(false)
    setShowQuoteModal(true)
  }, [])

  const handleCloseQuoteModal = useCallback(() => {
    // Check if form has any data
    const hasFormData = Object.values(newQuoteForm).some(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'number') return value > 0
      return false
    })

    if (hasFormData && !isSubmittingQuote) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close this form? All data will be lost.'
      )
      if (!confirmClose) return
    }

    setShowQuoteModal(false)
    // Reset form when closing
    setNewQuoteForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      businessName: '',
      industry: '',
      pageCount: 1,
      features: [],
      timeline: '',
      budget: '',
      finalPrice: 0,
      totalHours: 0,
      requirements: '',
      additionalNotes: ''
    })
    setFormErrors({})
    setIsFormValid(false)
  }, [newQuoteForm, isSubmittingQuote])

  const handleQuoteSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form one more time
    const errors = validateForm(newQuoteForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsFormValid(false)
      return
    }

    setIsSubmittingQuote(true)
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create new quote
      const newQuote: Quote = {
        id: `quote-${Date.now()}`,
        quoteNumber: `Q-${new Date().getFullYear()}-${String(state.quotes.length + 1).padStart(3, '0')}`,
        clientName: newQuoteForm.clientName,
        clientEmail: newQuoteForm.clientEmail,
        clientPhone: newQuoteForm.clientPhone,
        businessName: newQuoteForm.businessName,
        industry: newQuoteForm.industry,
        pageCount: newQuoteForm.pageCount,
        features: newQuoteForm.features,
        timeline: newQuoteForm.timeline,
        budget: newQuoteForm.budget,
        finalPrice: newQuoteForm.finalPrice,
        totalHours: newQuoteForm.totalHours,
        requirements: newQuoteForm.requirements,
        additionalNotes: newQuoteForm.additionalNotes,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add quote to state
      dispatch({ type: 'ADD_QUOTE', payload: newQuote })
      
      // Close modal and reset form
      setShowQuoteModal(false)
      setNewQuoteForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        businessName: '',
        industry: '',
        pageCount: 1,
        features: [],
        timeline: '',
        budget: '',
        finalPrice: 0,
        totalHours: 0,
        requirements: '',
        additionalNotes: ''
      })
      setFormErrors({})
      setIsFormValid(false)
      
      // Enhanced success message with more details
       showSuccess(
         `Quote ${newQuote.quoteNumber} created successfully! ` +
         `Client: ${newQuote.clientName} (${newQuote.businessName}) | ` +
         `Value: $${newQuote.finalPrice.toLocaleString()} | ` +
         `You can now convert this quote to a contract.`
       )
      
    } catch (error) {
      console.error('Error creating quote:', error)
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Failed to create quote. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('validation')) {
          errorMessage = 'Please check your form data and try again.'
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'A quote with similar details already exists.'
        }
      }
      
      showError(errorMessage)
      
      // Keep form data intact on error so user doesn't lose their work
      // Don't reset the form or close modal on error
    } finally {
      setIsSubmittingQuote(false)
    }
  }, [newQuoteForm, validateForm, state.quotes.length, dispatch, showSuccess, showError])

  // Calculate dashboard stats
  const dashboardStats = useMemo((): DashboardStats => {
    const totalQuotes = state.quotes.length
    const totalContracts = state.contracts.length
    const totalInvoices = state.invoices.length
    const totalRevenue = state.invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((acc, inv) => acc + inv.totalAmount, 0)
    const pendingPayments = state.invoices
      .filter(inv => inv.status === 'Sent')
      .reduce((acc, inv) => acc + inv.totalAmount, 0)
    const activeProjects = state.contracts.filter(contract => contract.status === 'active').length
    const conversionRate = totalQuotes > 0 ? (totalContracts / totalQuotes) * 100 : 0
    const averageProjectValue = totalContracts > 0 ? totalRevenue / totalContracts : 0

    return {
      totalQuotes,
      totalContracts,
      totalInvoices,
      totalRevenue,
      pendingPayments,
      activeProjects,
      conversionRate,
      averageProjectValue
    }
  }, [state.quotes, state.contracts, state.invoices])

  // Handle quote to contract conversion
  const handleConversion = useCallback(async () => {
    if (!conversionFlow.selectedQuote) {
      setConversionFlow(prev => ({
        ...prev,
        errors: ['Please select a quote to convert']
      }))
      return
    }

    setIsLoading(true)
    try {
      const result = EnhancedQuoteConverter.convertQuoteToContractAndInvoices(
        conversionFlow.selectedQuote,
        conversionFlow.conversionOptions
      )

      if (!result.success) {
        setConversionFlow(prev => ({
          ...prev,
          errors: result.errors
        }))
        return
      }

      // Convert EnhancedContract to Contract format
      const convertedContract: Contract = {
        id: result.contract.id,
        quoteId: result.contract.quoteId,
        clientId: result.contract.clientId || '',
        contractNumber: result.contract.contractNumber,
        contractTitle: result.contract.contractTitle,
        clientName: result.contract.clientName,
        clientEmail: result.contract.clientEmail,
        startDate: result.contract.startDate.toISOString(),
        endDate: result.contract.endDate.toISOString(),
        terms: result.contract.contractTerms.serviceDescription + '\n\n' + 
               'Client Responsibilities: ' + result.contract.contractTerms.clientResponsibilities.join(', ') + '\n\n' +
               'Provider Responsibilities: ' + result.contract.contractTerms.providerResponsibilities.join(', '),
        totalAmount: result.contract.totalAmount,
        paymentSchedule: result.contract.paymentSchedule,
        scopeOfWork: result.contract.scopeOfWork,
        clientInfo: {
          name: result.contract.clientName,
          email: result.contract.clientEmail,
          phone: '',
          company: result.contract.clientName,
          address: ''
        },
        projectDetails: {
          title: result.contract.projectDetails.title,
          description: result.contract.projectDetails.description
        },
        status: 'draft',
        priority: 'medium',
        createdAt: result.contract.createdAt || new Date().toISOString(),
        updatedAt: result.contract.updatedAt || new Date().toISOString()
      }
      dispatch({ type: 'ADD_CONTRACT', payload: convertedContract })
      
      result.invoices.forEach(invoice => {
        // Convert UnifiedInvoice to Invoice format
        const standardInvoice: Invoice = {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId || '',
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          items: invoice.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            price: item.unitPrice,
            total: item.total
          })),
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          totalAmount: invoice.totalAmount,
          notes: invoice.notes,
          status: invoice.status === 'draft' ? 'Draft' : 
                  invoice.status === 'sent' ? 'Sent' : 
                  invoice.status === 'paid' ? 'Paid' : 
                  invoice.status === 'overdue' ? 'Overdue' : 'Draft'
        }
        dispatch({ type: 'ADD_INVOICE', payload: standardInvoice })
      }) // Fixed: Added missing closing parenthesis
      
      // Update enhanced data
      setEnhancedContracts(prev => [...prev, result.contract])
      setUnifiedInvoices(prev => [...prev, ...result.invoices])
      
      // Reset conversion flow
      setConversionFlow({
        step: 'select_quote',
        conversionOptions: {
          paymentStructure: 'milestone',
          taxRate: 0.0875,
          paymentTerms: 'Net 30',
          includeDetailedItems: true,
          autoGenerateInvoices: true,
          userId: user?.id
        },
        errors: []
      })
      
      setShowConversionModal(false)
      setActiveTab('contracts')
      showSuccess('Quote successfully converted to contract and invoices!')
      
    } catch (error) {
      console.error('Conversion error:', error)
      setConversionFlow(prev => ({
        ...prev,
        errors: ['Failed to convert quote to contract. Please try again.']
      }))
      showError('Failed to convert quote to contract')
    } finally {
      setIsLoading(false)
    }
  }, [conversionFlow, dispatch, user?.id, showSuccess, showError])
  
  // Generate preview of conversion
  const generatePreview = useCallback(() => {
    if (!conversionFlow.selectedQuote) return
    
    try {
      const result = EnhancedQuoteConverter.convertQuoteToContractAndInvoices(
        conversionFlow.selectedQuote,
        conversionFlow.conversionOptions
      )
      
      setConversionFlow(prev => ({
        ...prev,
        previewResult: result,
        step: 'review'
      }))
    } catch (error) {
      console.error('Preview error:', error)
      setConversionFlow(prev => ({
        ...prev,
        errors: ['Failed to generate preview. Please check your configuration.']
      }))
    }
  }, [conversionFlow.selectedQuote, conversionFlow.conversionOptions])
  
  // Status badge component
  const StatusBadge: React.FC<{ status: string; type?: 'quote' | 'contract' | 'invoice' }> = ({ status, type = 'quote' }) => {
    const getStatusConfig = (status: string, type: string) => {
      const configs: Record<string, Record<string, { color: string; icon: any }>> = {
        quote: {
          draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
          sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
          accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          rejected: { color: 'bg-red-100 text-red-800', icon: X }
        },
        contract: {
          draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
          active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
          cancelled: { color: 'bg-red-100 text-red-800', icon: X }
        },
        invoice: {
          Draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
          Sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
          Paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          Overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
        }
      }
      
      return configs[type]?.[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock }
    }
    
    const config = getStatusConfig(status, type)
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    )
  }

  // Dashboard rendering
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Quotes</dt>
                <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalQuotes}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Contracts</dt>
                <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalContracts}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                <dd className="text-lg font-medium text-gray-900">{dashboardStats.conversionRate.toFixed(1)}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {state.quotes.slice(0, 3).map(quote => (
              <div key={quote.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Quote {quote.quoteNumber} for {quote.clientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${quote.finalPrice.toLocaleString()} • {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={quote.status} type="quote" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Conversion flow rendering
  const renderConversionFlow = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote to Contract Conversion</h2>
        
        {/* Step 1: Select Quote */}
        {conversionFlow.step === 'select_quote' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select a Quote to Convert</h3>
            <div className="grid gap-4">
              {state.quotes.filter(q => q.status === 'accepted').map(quote => (
                <div key={quote.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                     onClick={() => setConversionFlow(prev => ({ ...prev, selectedQuote: quote, step: 'configure_contract' }))}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{quote.quoteNumber}</h4>
                      <p className="text-sm text-gray-600">{quote.clientName} • {quote.businessName}</p>
                      <p className="text-sm text-gray-500">${quote.finalPrice.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={quote.status} type="quote" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Configure Contract */}
        {conversionFlow.step === 'configure_contract' && conversionFlow.selectedQuote && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Configure Contract Settings</h3>
              <button
                onClick={() => setConversionFlow(prev => ({ ...prev, step: 'select_quote' }))}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Quote Selection
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected Quote</h4>
              <p className="text-sm text-gray-600">
                {conversionFlow.selectedQuote.quoteNumber} • {conversionFlow.selectedQuote.clientName} • 
                ${conversionFlow.selectedQuote.finalPrice.toLocaleString()}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Structure</label>
                <select
                  value={conversionFlow.conversionOptions.paymentStructure}
                  onChange={(e) => setConversionFlow(prev => ({
                    ...prev,
                    conversionOptions: {
                      ...prev.conversionOptions,
                      paymentStructure: e.target.value as any
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="single">Single Payment</option>
                  <option value="deposit_final">Deposit + Final</option>
                  <option value="milestone">Milestone Payments</option>
                  <option value="progress">Progress Payments</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <select
                  value={conversionFlow.conversionOptions.paymentTerms}
                  onChange={(e) => setConversionFlow(prev => ({
                    ...prev,
                    conversionOptions: {
                      ...prev.conversionOptions,
                      paymentTerms: e.target.value
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={generatePreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Preview
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Review */}
        {conversionFlow.step === 'review' && conversionFlow.previewResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Review Conversion</h3>
              <button
                onClick={() => setConversionFlow(prev => ({ ...prev, step: 'configure_contract' }))}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Configuration
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contract Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Contract Preview</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Contract Number:</span> {conversionFlow.previewResult.contract.contractNumber}</p>
                  <p><span className="font-medium">Client:</span> {conversionFlow.previewResult.contract.clientName}</p>
                  <p><span className="font-medium">Total Amount:</span> ${conversionFlow.previewResult.contract.totalAmount.toLocaleString()}</p>
                  <p><span className="font-medium">Payment Structure:</span> {conversionFlow.previewResult.contract.paymentStructure.type}</p>
                </div>
              </div>
              
              {/* Invoice Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Generated Invoices ({conversionFlow.previewResult.invoices.length})</h4>
                <div className="space-y-3">
                  {conversionFlow.previewResult.invoices.map((invoice, index) => (
                    <div key={index} className="bg-white rounded p-3 text-sm">
                      <p><span className="font-medium">Invoice:</span> {invoice.invoiceNumber}</p>
                      <p><span className="font-medium">Type:</span> {invoice.invoiceType}</p>
                      <p><span className="font-medium">Amount:</span> ${invoice.totalAmount.toLocaleString()}</p>
                      <p><span className="font-medium">Due:</span> {invoice.dueDate.toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleConversion}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Converting...' : 'Confirm Conversion'}
              </button>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {conversionFlow.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Conversion Errors</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {conversionFlow.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Tab configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'contracts', label: 'Contracts', icon: Receipt },
    { id: 'invoices', label: 'Invoices', icon: DollarSign },
    { id: 'conversion', label: 'Quote Conversion', icon: ArrowRight }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contract & Invoice Manager</h1>
              <p className="text-sm text-gray-600">Streamlined quote-to-contract-to-invoice workflow</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleNewQuote()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'conversion' && renderConversionFlow()}
        {activeTab === 'invoices' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Management</h3>
            <p>Invoice management interface will be implemented here.</p>
          </div>
        )}
        {activeTab === 'contracts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Contracts</h2>
            <p className="text-gray-600">Contract management interface will be implemented here.</p>
          </div>
        )}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quotes Management</h2>
            <div className="space-y-4">
              {state.quotes.map(quote => (
                <div key={quote.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{quote.quoteNumber}</h3>
                      <p className="text-sm text-gray-600">{quote.clientName} • {quote.businessName}</p>
                      <p className="text-sm text-gray-500">${quote.finalPrice.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={quote.status} type="quote" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Creation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Quote</h2>
              <button
                onClick={handleCloseQuoteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={newQuoteForm.clientName}
                    onChange={(e) => handleNewQuoteFormChange('clientName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.clientName 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter client name"
                  />
                  {formErrors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.clientName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    value={newQuoteForm.clientEmail}
                    onChange={(e) => handleNewQuoteFormChange('clientEmail', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.clientEmail 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter client email"
                  />
                  {formErrors.clientEmail && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.clientEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    value={newQuoteForm.clientPhone}
                    onChange={(e) => handleNewQuoteFormChange('clientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter client phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={newQuoteForm.businessName}
                    onChange={(e) => handleNewQuoteFormChange('businessName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.businessName 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter business name"
                  />
                  {formErrors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.businessName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <select 
                    value={newQuoteForm.industry}
                    onChange={(e) => handleNewQuoteFormChange('industry', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.industry 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.industry && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.industry}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQuoteForm.pageCount}
                    onChange={(e) => handleNewQuoteFormChange('pageCount', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.pageCount 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Number of pages"
                  />
                  {formErrors.pageCount && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.pageCount}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline *
                  </label>
                  <input
                    type="text"
                    value={newQuoteForm.timeline}
                    onChange={(e) => handleNewQuoteFormChange('timeline', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.timeline 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., 6 weeks"
                  />
                  {formErrors.timeline && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.timeline}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Requirements *
                </label>
                <textarea
                  rows={3}
                  value={newQuoteForm.requirements}
                  onChange={(e) => handleNewQuoteFormChange('requirements', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.requirements 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Describe the project requirements"
                />
                {formErrors.requirements && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.requirements}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={newQuoteForm.features.join(', ')}
                  onChange={(e) => handleNewQuoteFormChange('features', e.target.value.split(',').map(f => f.trim()).filter(f => f))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Responsive Design, E-commerce, SEO"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range *
                  </label>
                  <select 
                    value={newQuoteForm.budget}
                    onChange={(e) => handleNewQuoteFormChange('budget', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.budget 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select budget range</option>
                    <option value="$1000-$5000">$1,000 - $5,000</option>
                    <option value="$5000-$10000">$5,000 - $10,000</option>
                    <option value="$10000-$15000">$10,000 - $15,000</option>
                    <option value="$15000-$25000">$15,000 - $25,000</option>
                    <option value="$25000+">$25,000+</option>
                  </select>
                  {formErrors.budget && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newQuoteForm.finalPrice}
                    onChange={(e) => handleNewQuoteFormChange('finalPrice', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.finalPrice 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter final price"
                  />
                  {formErrors.finalPrice && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.finalPrice}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={newQuoteForm.additionalNotes}
                  onChange={(e) => handleNewQuoteFormChange('additionalNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes or requirements"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseQuoteModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmittingQuote}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                    isFormValid && !isSubmittingQuote
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingQuote && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                  <span>{isSubmittingQuote ? 'Creating Quote...' : 'Create Quote'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedContractInvoiceManager
