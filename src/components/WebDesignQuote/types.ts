// Types and interfaces for WebDesignQuote component

export interface Feature {
  name: string
  price: number
  description: string
  category: string
}

export interface Service {
  name: string
  price: number
  description: string
}

export interface QuoteDetails {
  basePrice: number
  features: Feature[]
  services: Service[]
  timeline: string
  total: number
}

export interface QuoteResult {
  details: QuoteDetails
  clientName: string
  projectName: string
  date: string
}

export interface QuestionnaireState {
  currentStep: number
  industry: string
  subIndustry: string
  goals: string[]
  features: string[]
  pages: number
  timeline: string
  isCompleted: boolean
  quoteResult: QuoteResult | null
  answers: any
  quickMode: boolean
  historyIndex: number
  history: QuestionnaireState[]
  isComplete: boolean
}

export type QuestionnaireAction =
  | { type: "SET_INDUSTRY"; payload: string }
  | { type: "SET_SUB_INDUSTRY"; payload: string }
  | { type: "SET_GOALS"; payload: string[] }
  | { type: "SET_FEATURES"; payload: string[] }
  | { type: "SET_PAGES"; payload: number }
  | { type: "SET_TIMELINE"; payload: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "COMPLETE"; payload: QuoteResult }
  | { type: "RESET" }
  | { type: "LOAD_STATE"; payload: QuestionnaireState }
  | { type: "SET_ANSWER"; payload: { id: string; value: any } }
  | { type: "SAVE_PROGRESS" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_QUICK_MODE"; payload: boolean }

export interface Task {
  id: number
  // Add other task properties as needed
}

export interface Client {
  id: number
  name?: string
  notes?: { id: number; text: string; timestamp: string; type: string }[]
  // Add other client properties as needed
}

export interface Event {
  id: string
  // Add other event properties as needed
}

export interface SalesStage {
  // Add sales stage properties as needed
}

export interface SavedQuote {
  id: string
  clientName: string
  answers: any
  pricing: any
  v0Hours: any
  leadScore: number
  createdAt: string
  expiresAt: string
  daysRemaining: number
  isExtended: boolean
  timeline: string
}

export interface SavedProposal {
  id: number
  timeline: {
    endDate: string
  }
  // Add other proposal properties as needed
}

export interface Invoice {
  id: number
  // Add other invoice properties as needed
}

export interface AdminSettings {
  vacationMode?: boolean
  // Add other admin settings as needed
}



export interface NavigationControlsProps {
  currentStep: number
  answers: any
  onPrevStep: () => void
  onNextStep: () => void
  onSave: () => void
  onReset: () => void
  quickMode: boolean
  onToggleQuickMode: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  isComplete: boolean
}

export interface ReportSummaryProps {
  answers: any
  quickMode: boolean
  startTime: number
  onStartOver: () => void
  onGenerateTextReport: () => void
  currentSavedQuote: any
}