import * as React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode, useState, useMemo } from "react"
import { databaseService } from "../services/database"
import { initialQuotes } from "../data/mockData"
import type {
  Quote,
  Contract,
  Invoice,
  Proposal,
  QuoteData,
} from "../schemas/contractInvoiceSchemas"
import type {
  Task,
  Client,
  Event as CalendarEvent,
  SalesStage,
} from "../types"

// Define AdminSettings interface
export interface AdminSettings {
  id: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  defaultCurrency: string
  taxRate: number
  invoicePrefix: string
  quotePrefix: string
  contractPrefix: string
  emailSignature: string
  logoUrl?: string
  created_at: string
  updated_at: string
}

// Define the shape of your state with all required fields
export interface AppState {
  tasks: Task[]
  clients: Client[]
  events: CalendarEvent[]
  salesStages: SalesStage[]
  quotes: Quote[]
  savedProposals: Proposal[]
  invoices: Invoice[]
  contracts: Contract[] // Added contracts to state
  adminSettings: AdminSettings
  pendingQuoteForConversion: Quote | null // New state for workflow
  loading: {
    tasks: boolean
    clients: boolean
    events: boolean
    salesStages: boolean
    quotes: boolean
    savedQuotes: boolean
    contracts: boolean
    invoices: boolean
    proposals: boolean
  }
  error: string | null
  isOnline: boolean
  [key: string]: any
}

// Define action types
type ActionType =
  // Task actions
  | { type: "ADD_TASK"; payload: Omit<Task, "id"> }
  | { type: "UPDATE_TASK"; payload: { id: string | number; task: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string | number }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_TASKS_LOADING"; payload: boolean }
  | { type: "TOGGLE_TASK_COMPLETION"; payload: string }
  | { type: "ASSIGN_TASK"; payload: { taskId: string; assigneeId: string } }
  | { type: "FILTER_TASKS_BY_STATUS"; payload: string }
  | { type: "SORT_TASKS"; payload: string }
  // Client actions
  | { type: "ADD_CLIENT"; payload: Client }
  | { type: "UPDATE_CLIENT"; payload: { id: string; client: Partial<Client> } }
  | { type: "DELETE_CLIENT"; payload: string }
  | { type: "SET_CLIENTS"; payload: Client[] }
  | { type: "SET_CLIENTS_LOADING"; payload: boolean }
  | { type: "ADD_NOTE"; payload: { clientId: string; note: any } }
  | { type: "ADD_CLIENT_NOTE"; payload: { clientId: string; note: any } }
  | { type: "UPDATE_CLIENT_STAGE"; payload: { clientId: string; stage: string } }
  // Project actions
  | { type: "ADD_PROJECT"; payload: any }
  // Event actions
  | { type: "ADD_EVENT"; payload: Omit<CalendarEvent, "id"> }
  | { type: "UPDATE_EVENT"; payload: { id: string; event: Partial<CalendarEvent> } }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "SET_EVENTS"; payload: CalendarEvent[] }
  | { type: "SET_EVENTS_LOADING"; payload: boolean }
  // Sales stage actions
  | { type: "SET_SALES_STAGES"; payload: SalesStage[] }
  | { type: "SET_SALES_STAGES_LOADING"; payload: boolean }
  // Quote actions
  | { type: "ADD_QUOTE"; payload: Quote }
  | { type: "UPDATE_QUOTE"; payload: { id: string; quote: Partial<Quote> } }
  | { type: "DELETE_QUOTE"; payload: string }
  | { type: "SET_QUOTES"; payload: Quote[] }
  | { type: "SET_QUOTES_LOADING"; payload: boolean }
  // Proposal actions
  | { type: "ADD_PROPOSAL"; payload: Proposal }
  | { type: "UPDATE_PROPOSAL"; payload: { id: string; proposal: Partial<Proposal> } }
  | { type: "DELETE_PROPOSAL"; payload: string }
  | { type: "SET_PROPOSALS"; payload: Proposal[] }
  | { type: "SET_PROPOSALS_LOADING"; payload: boolean }
  // Contract actions
  | { type: "ADD_CONTRACT"; payload: Contract }
  | { type: "UPDATE_CONTRACT"; payload: { id: string; contract: Partial<Contract> } }
  | { type: "DELETE_CONTRACT"; payload: string }
  | { type: "SET_CONTRACTS"; payload: Contract[] }
  | { type: "SET_CONTRACTS_LOADING"; payload: boolean }
  // Invoice actions
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "UPDATE_INVOICE"; payload: { id: string; invoice: Partial<Invoice> } }
  | { type: "DELETE_INVOICE"; payload: string }
  | { type: "SET_INVOICES"; payload: Invoice[] }
  | { type: "SET_INVOICES_LOADING"; payload: boolean }
  // Admin settings actions
  | { type: "UPDATE_ADMIN_SETTINGS"; payload: Partial<AdminSettings> }
  // Workflow actions
  | { type: "SET_PENDING_QUOTE_FOR_CONVERSION"; payload: Quote | null }
  // General actions
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ONLINE_STATUS"; payload: boolean }
  | { type: "SYNC_WITH_DATABASE" }

// Define the context type
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<ActionType>
  activeComponent: string
  setActiveComponent: React.Dispatch<React.SetStateAction<string>>
  quoteData: QuoteData | null
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData | null>>
}

// Enhanced initial state with sample data to prevent undefined errors
const initialState: AppState = {
  tasks: [
    {
      id: "1",
      title: "Design Homepage",
      description: "Create homepage design mockup",
      due_date: "2024-02-15",
      priority: "high",
      assigned_to: "John Doe",
      status: "pending",
      client_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      time_estimate: 8,
      time_spent: 0,
    },
    {
      id: "2",
      title: "Client Review",
      description: "Review client feedback",
      due_date: "2024-02-20",
      priority: "medium",
      assigned_to: "Jane Smith",
      status: "completed",
      client_id: "2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      time_estimate: 4,
      time_spent: 4,
    },
  ],
  quotes: initialQuotes,
  savedProposals: [],
  contracts: [
    {
      id: "contract-1",
      quoteId: "quote-1",
      clientId: "1",
      contractNumber: "CON-2024-0001",
      contractTitle: "Website Redesign Project",
      clientName: "Acme Corp",
      clientEmail: "john@acme.com",
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      terms: "Standard terms and conditions for website development project. Payment due within 30 days of invoice. Project includes design, development, and deployment phases.",
      totalAmount: 7500,
      paymentSchedule: "50% deposit, 50% on completion",
      scopeOfWork: "Complete website redesign with modern features including responsive design, content management system, and SEO optimization.",
      clientInfo: {
        name: "Acme Corp",
        email: "john@acme.com",
        phone: "555-0123",
        company: "Acme Corp",
        address: "123 Main St, City, State 12345",
      },
      projectDetails: {
        title: "Website Redesign Project",
        description: "Complete website redesign with modern features",
      },
      status: "draft",
      priority: "high",
      createdAt: "2024-01-16T10:00:00.000Z",
      updatedAt: "2024-01-16T10:00:00.000Z",
      templateId: "template-1",
      contractContent: "",
      dynamicFieldValues: {},
      dynamicTerms: {
        totalCost: 7500,
        depositPercentage: 50,
        projectStartDate: "2024-02-01",
        estimatedCompletionDate: "2024-02-28",
      },
    },
  ],
  invoices: [
    {
      id: "invoice-1",
      clientId: "1",
      invoiceNumber: "INV-2024-0001",
      issueDate: "2024-01-20",
      dueDate: "2024-02-05",
      items: [
        {
          id: "item-1",
          description: "Website Design - Deposit",
          quantity: 1,
          price: 3750,
          total: 3750,
        },
      ],
      subtotal: 3750,
      tax: 375,
      totalAmount: 4125,
      status: "Sent",
      notes: "50% deposit for website project",
      clientName: "Acme Corp",
      clientEmail: "john@acme.com",
      clientAddress: "123 Main St, City, State 12345",
    },
  ],
  clients: [
    {
      id: "1",
      name: "Acme Corp",
      email: "john@acme.com",
      phone: "555-0123",
      company: "Acme Corp",
      stage: "1",
      value: 5000,
      status: "active",
      source: "Website",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [
        {
          type: "call",
          content: "Initial consultation call",
          date: "2024-01-15"
        }
      ],
      projects: [],
      custom_fields: {},
    },
    {
      id: "2",
      name: "Tech Solutions",
      email: "sarah@techsolutions.com",
      phone: "555-0456",
      company: "Tech Solutions Inc",
      stage: "3",
      value: 12000,
      status: "active",
      source: "Referral",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [
        {
          type: "email",
          content: "Sent proposal",
          date: "2024-01-20"
        }
      ],
      projects: [],
      custom_fields: {},
    },
  ],
  events: [
    {
      id: "1",
      title: "Client Meeting",
      type: "meeting",
      date: "2024-02-15",
      time: "10:00 AM",
      description: "Discuss project requirements",
    },
    {
      id: "2",
      title: "Follow-up Call",
      type: "call",
      date: "2024-02-18",
      time: "2:00 PM",
      description: "Check on project progress",
    },
    {
      id: "3",
      title: "Project Deadline",
      type: "deadline",
      date: "2024-02-25",
      time: "11:59 PM",
      description: "Website launch deadline",
    },
  ],
  salesStages: [
    { 
      id: "1", 
      name: "Lead", 
      color: "#3B82F6", 
      order: 1, 
      description: "Initial lead stage", 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
    { 
      id: "2", 
      name: "Qualified", 
      color: "#8B5CF6", 
      order: 2, 
      description: "Qualified prospect", 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
    { 
      id: "3", 
      name: "Proposal", 
      color: "#F59E0B", 
      order: 3, 
      description: "Proposal sent", 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
    { 
      id: "4", 
      name: "Negotiation", 
      color: "#F97316", 
      order: 4, 
      description: "In negotiation", 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
    { 
      id: "5", 
      name: "Closed Won", 
      color: "#10B981", 
      order: 5, 
      description: "Deal closed successfully", 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
    { 
      id: "6", 
      name: "Closed Lost", 
      color: "#EF4444", 
      order: 6, 
      description: "Deal lost", 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
  ],
  adminSettings: {
    id: "admin-1",
    companyName: "Your Company",
    companyEmail: "admin@company.com",
    companyPhone: "555-0123",
    companyAddress: "123 Main St",
    defaultCurrency: "USD",
    taxRate: 0.08,
    invoicePrefix: "INV",
    quotePrefix: "QUO",
    contractPrefix: "CON",
    emailSignature: "Best regards,\nYour Company",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  pendingQuoteForConversion: null, // Initialize new state
  loading: {
    tasks: false,
    clients: false,
    events: false,
    salesStages: false,
    quotes: false,
    savedQuotes: false,
    contracts: false,
    invoices: false,
    proposals: false,
  },
  error: null,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Export the context for direct usage
export { AppContext }

// Enhanced reducer function with proper error handling
const appReducer = (state: AppState, action: ActionType): AppState => {
  try {
    switch (action.type) {
      // Task actions
      case "ADD_TASK":
        return {
          ...state,
          tasks: [...state.tasks, { ...action.payload, id: Date.now().toString() }],
        }
      case "UPDATE_TASK":
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload.id ? { ...task, ...action.payload.task } : task,
          ),
        }
      case "DELETE_TASK":
        return {
          ...state,
          tasks: state.tasks.filter((task) => task.id !== action.payload),
        }
      case "SET_TASKS":
        return {
          ...state,
          tasks: action.payload || [],
          loading: { ...state.loading, tasks: false },
        }
      case "SET_TASKS_LOADING":
        return {
          ...state,
          loading: { ...state.loading, tasks: action.payload },
        }
      case "TOGGLE_TASK_COMPLETION":
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload
              ? { ...task, status: task.status === "completed" ? "pending" : "completed", updated_at: new Date().toISOString() }
              : task,
          ),
        }
      case "ASSIGN_TASK":
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload.taskId
              ? { ...task, assigned_to: action.payload.assigneeId, updated_at: new Date().toISOString() }
              : task,
          ),
        }
      case "FILTER_TASKS_BY_STATUS":
        // This would typically be handled in the UI layer, but we can store the filter state
        return {
          ...state,
          // You might want to add a filter state to AppState if needed
        }
      case "SORT_TASKS":
        return {
          ...state,
          tasks: [...state.tasks].sort((a, b) => {
            const sortBy = action.payload
            if (sortBy === "dueDate") {
              return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime()
            } else if (sortBy === "priority") {
              const priorityOrder = { "HIGH": 3, "MEDIUM": 2, "LOW": 1 }
              return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
            } else if (sortBy === "createdAt") {
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            }
            return 0
          }),
        }

      // Client actions
      case "ADD_CLIENT":
        return {
          ...state,
          clients: [...state.clients, action.payload],
        }
      case "UPDATE_CLIENT":
        return {
          ...state,
          clients: state.clients.map((client) =>
            client.id === action.payload.id ? { ...client, ...action.payload.client } : client,
          ),
        }
      case "DELETE_CLIENT":
        return {
          ...state,
          clients: state.clients.filter((client) => client.id !== action.payload),
        }
      case "SET_CLIENTS":
        return {
          ...state,
          clients: action.payload || [],
          loading: { ...state.loading, clients: false },
        }
      case "SET_CLIENTS_LOADING":
        return {
          ...state,
          loading: { ...state.loading, clients: action.payload },
        }
      case "ADD_NOTE":
        return {
          ...state,
          clients: state.clients.map((client) =>
            client.id === action.payload.clientId
              ? {
                  ...client,
                  notes: [
                    ...(client.notes || []),
                    {
                      ...action.payload.note,
                      date: new Date().toISOString().split("T")[0],
                    },
                  ],
                }
              : client,
          ),
        }

      // Project actions
      case "ADD_PROJECT":
        return {
          ...state,
          clients: state.clients.map((client) =>
            client.id === action.payload.clientId
              ? {
                  ...client,
                  projects: [
                    ...(client.projects || []),
                    {
                      ...action.payload,
                      id: Date.now().toString(),
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                  ],
                }
              : client,
          ),
        }

      // Event actions
      case "ADD_EVENT":
        return {
          ...state,
          events: [...state.events, { ...action.payload, id: Date.now().toString() }],
        }
      case "UPDATE_EVENT":
        return {
          ...state,
          events: state.events.map((event) =>
            event.id === action.payload.id ? { ...event, ...action.payload.event } : event,
          ),
        }
      case "DELETE_EVENT":
        return {
          ...state,
          events: state.events.filter((event) => event.id !== action.payload),
        }
      case "SET_EVENTS":
        return {
          ...state,
          events: action.payload || [],
          loading: { ...state.loading, events: false },
        }
      case "SET_EVENTS_LOADING":
        return {
          ...state,
          loading: { ...state.loading, events: action.payload },
        }

      // Sales stage actions
      case "SET_SALES_STAGES":
        return {
          ...state,
          salesStages: action.payload || [],
          loading: { ...state.loading, salesStages: false },
        }
      case "SET_SALES_STAGES_LOADING":
        return {
          ...state,
          loading: { ...state.loading, salesStages: action.payload },
        }

      // Quote actions
      case "ADD_QUOTE":
        return {
          ...state,
          quotes: [...state.quotes, action.payload],
        }
      case "UPDATE_QUOTE":
        return {
          ...state,
          quotes: state.quotes.map((quote) =>
            quote.id === action.payload.id ? { ...quote, ...action.payload.quote } : quote,
          ),
        }
      case "DELETE_QUOTE":
        return {
          ...state,
          quotes: state.quotes.filter((quote) => quote.id !== action.payload),
        }
      case "SET_QUOTES":
        return {
          ...state,
          quotes: action.payload || [],
          loading: { ...state.loading, quotes: false },
        }
      case "SET_QUOTES_LOADING":
        return {
          ...state,
          loading: { ...state.loading, quotes: action.payload },
        }

      // Proposal actions
      case "ADD_PROPOSAL":
        return {
          ...state,
          savedProposals: [...state.savedProposals, action.payload],
        }
      case "UPDATE_PROPOSAL":
        return {
          ...state,
          savedProposals: state.savedProposals.map((proposal) =>
            proposal.id === action.payload.id ? { ...proposal, ...action.payload.proposal } : proposal,
          ),
        }
      case "DELETE_PROPOSAL":
        return {
          ...state,
          savedProposals: state.savedProposals.filter((proposal) => proposal.id !== action.payload),
        }
      case "SET_PROPOSALS":
        return {
          ...state,
          savedProposals: action.payload || [],
          loading: { ...state.loading, savedQuotes: false },
        }
      case "SET_PROPOSALS_LOADING":
        return {
          ...state,
          loading: { ...state.loading, savedQuotes: action.payload },
        }

      // Contract actions
      case "ADD_CONTRACT":
        return {
          ...state,
          contracts: [...state.contracts, action.payload],
        }
      case "UPDATE_CONTRACT":
        return {
          ...state,
          contracts: state.contracts.map((contract) =>
            contract.id === action.payload.id ? { ...contract, ...action.payload.contract } : contract,
          ),
        }
      case "DELETE_CONTRACT":
        return {
          ...state,
          contracts: state.contracts.filter((contract) => contract.id !== action.payload),
        }
      case "SET_CONTRACTS":
        return {
          ...state,
          contracts: action.payload || [],
          loading: { ...state.loading, contracts: false },
        }
      case "SET_CONTRACTS_LOADING":
        return {
          ...state,
          loading: { ...state.loading, contracts: action.payload },
        }

      // Invoice actions
      case "ADD_INVOICE":
        return {
          ...state,
          invoices: [...state.invoices, action.payload],
        }
      case "UPDATE_INVOICE":
        return {
          ...state,
          invoices: state.invoices.map((invoice) =>
            invoice.id === action.payload.id ? { ...invoice, ...action.payload.invoice } : invoice,
          ),
        }
      case "DELETE_INVOICE":
        return {
          ...state,
          invoices: state.invoices.filter((invoice) => invoice.id !== action.payload),
        }
      case "SET_INVOICES":
        return {
          ...state,
          invoices: action.payload || [],
          loading: { ...state.loading, invoices: false },
        }
      case "SET_INVOICES_LOADING":
        return {
          ...state,
          loading: { ...state.loading, invoices: action.payload },
        }

      // Admin settings actions
      case "UPDATE_ADMIN_SETTINGS":
        return {
          ...state,
          adminSettings: { ...state.adminSettings, ...action.payload },
        }

      // Workflow actions
      case "SET_PENDING_QUOTE_FOR_CONVERSION":
        return {
          ...state,
          pendingQuoteForConversion: action.payload,
        }

      // General actions
      case "SET_ERROR":
        return {
          ...state,
          error: action.payload,
        }
      case "SET_ONLINE_STATUS":
        return {
          ...state,
          isOnline: action.payload,
        }

      default:
        return state
    }
  } catch (error) {
    console.error("Reducer error:", error)
    return {
      ...state,
      error: "An error occurred while updating the application state",
    }
  }
}

// Provider component with enhanced error handling
export const AppProvider: React.FC<{ children: ReactNode; initialState?: Partial<AppState> }> = ({ children, initialState: customInitialState }) => {
  const mergedInitialState = customInitialState ? { ...initialState, ...customInitialState } : initialState
  const [state, dispatch] = useReducer(appReducer, mergedInitialState)
  const isTestMode = customInitialState !== undefined
  const [activeComponent, setActiveComponent] = useState<string>("Dashboard")
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      activeComponent,
      setActiveComponent,
      quoteData,
      setQuoteData,
    }),
    [state, dispatch, activeComponent, quoteData],
  )

  // Initialize data from database on mount
  useEffect(() => {
    // Skip data loading in test mode
    if (isTestMode) {
      return
    }

    const initializeData = async () => {
      try {
        // Check for transferQuoteData in localStorage and set as pendingQuoteForConversion
        const transferQuoteData = localStorage.getItem('transferQuoteData')
        if (transferQuoteData) {
          try {
            const quoteData = JSON.parse(transferQuoteData)
            console.log('Loading transferQuoteData from localStorage:', quoteData)
            dispatch({ type: 'SET_PENDING_QUOTE_FOR_CONVERSION', payload: quoteData })
            // Clear the transferQuoteData after loading
            localStorage.removeItem('transferQuoteData')
          } catch (error) {
            console.error('Error parsing transferQuoteData:', error)
            localStorage.removeItem('transferQuoteData')
          }
        }

        // Only try to load from database if we have a real Supabase connection
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (
          !supabaseUrl ||
          !supabaseKey ||
          supabaseUrl.includes("your-project") ||
          supabaseKey.includes("your-anon-key")
        ) {
          console.log("Using mock data - Supabase not configured")
          return
        }

        // Load data with proper error handling
        const loadData = async (type: string, action: string, getter: () => Promise<any>) => {
          dispatch({ type: `SET_${type}_LOADING` as any, payload: true })
          try {
            const data = await getter()
            dispatch({ type: action as any, payload: data })
          } catch (error) {
            console.warn(`Failed to load ${type.toLowerCase()} from database, using mock data:`, error)
            dispatch({ type: `SET_${type}_LOADING` as any, payload: false })
          }
        }

        await Promise.all([
          loadData("TASKS", "SET_TASKS", () => databaseService.getTasks()),
          loadData("CLIENTS", "SET_CLIENTS", () => databaseService.getClients()),
          loadData("EVENTS", "SET_EVENTS", () => databaseService.getEvents()),
          loadData("SALES_STAGES", "SET_SALES_STAGES", () => databaseService.getSalesStages()),
          // Note: Quotes, proposals, contracts, and invoices are not yet implemented in DatabaseService
          // loadData("QUOTES", "SET_QUOTES", () => databaseService.getQuotes()),
          // loadData("PROPOSALS", "SET_PROPOSALS", () => databaseService.getProposals()),
          // loadData("CONTRACTS", "SET_CONTRACTS", () => databaseService.getContracts()),
          // loadData("INVOICES", "SET_INVOICES", () => databaseService.getInvoices()),
        ])
      } catch (error) {
        console.error("Failed to initialize data:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load data - using offline mode" })
        // Clear all loading states
        dispatch({ type: "SET_TASKS_LOADING", payload: false })
        dispatch({ type: "SET_CLIENTS_LOADING", payload: false })
        dispatch({ type: "SET_EVENTS_LOADING", payload: false })
        dispatch({ type: "SET_SALES_STAGES_LOADING", payload: false })
        dispatch({ type: "SET_QUOTES_LOADING", payload: false })
        dispatch({ type: "SET_PROPOSALS_LOADING", payload: false })
        dispatch({ type: "SET_CONTRACTS_LOADING", payload: false })
        dispatch({ type: "SET_INVOICES_LOADING", payload: false })
      }
    }

    initializeData()
  }, [isTestMode])

  // Monitor online status with error handling
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => dispatch({ type: "SET_ONLINE_STATUS", payload: true })
    const handleOffline = () => dispatch({ type: "SET_ONLINE_STATUS", payload: false })

    try {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    } catch (error) {
      console.warn("Failed to set up online status monitoring:", error)
    }
  }, [])

  // Set up real-time subscriptions with error handling
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project") || supabaseKey.includes("your-anon-key")) {
      return
    }

    const subscriptions: Array<() => void> = []

    try {
      const setupSubscription = (name: string, subscriber: (callback: (data: any) => void) => any, action: string) => {
        try {
          const unsubscribe = subscriber((data) => {
            dispatch({ type: action as any, payload: data })
          })
          if (unsubscribe) subscriptions.push(unsubscribe)
        } catch (error) {
          console.warn(`Failed to set up ${name} subscription:`, error)
        }
      }

      setupSubscription("tasks", databaseService.subscribeToTasks, "SET_TASKS")
      setupSubscription("clients", databaseService.subscribeToClients, "SET_CLIENTS")
      setupSubscription("events", databaseService.subscribeToEvents, "SET_EVENTS")
      // Note: Quotes, proposals, contracts, and invoices subscriptions are not yet implemented in DatabaseService
      // setupSubscription("quotes", databaseService.subscribeToQuotes, "SET_QUOTES")
      // setupSubscription("proposals", databaseService.subscribeToProposals, "SET_PROPOSALS")
      // setupSubscription("contracts", databaseService.subscribeToContracts, "SET_CONTRACTS")
      // setupSubscription("invoices", databaseService.subscribeToInvoices, "SET_INVOICES")
    } catch (error) {
      console.warn("Failed to set up real-time subscriptions:", error)
    }

    return () => {
      subscriptions.forEach((unsubscribe) => {
        try {
          unsubscribe()
        } catch (error) {
          console.warn("Error unsubscribing:", error)
        }
      })
    }
  }, [])

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

// Custom hook to use the context with error handling
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
