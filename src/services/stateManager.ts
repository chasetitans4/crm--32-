import { supabase } from "../lib/supabase"
import { secureStorage } from "../utils/secureStorage"
import type { Client, Task, Event, User, Email as DatabaseEmail } from "./database"
import type { Project } from "../types/index"
import type { Invoice } from "../types/invoice"

// Notification type definition
export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  read: boolean
  channel: "email" | "sms" | "push" | "in-app"
  priority: "low" | "medium" | "high" | "critical"
}

// Email type definition
export interface Email {
  id: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  bodyType: "text" | "html"
  priority: "low" | "normal" | "high"
  status: "draft" | "scheduled" | "sent" | "failed" | "delivered" | "read"
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  clientId?: string
  projectId?: string
  taskId?: string
  created_at: string
  updated_at: string
}

export interface AppState {
  user: UserState
  clients: ClientsState
  tasks: TasksState
  events: EventsState
  projects: ProjectsState
  invoices: InvoicesState
  emails: EmailsState
  notifications: NotificationsState
  ui: UIState
  cache: CacheState
  sync: SyncState
}

export interface UserState {
  currentUser: User | null
  preferences: Record<string, unknown>
  permissions: string[]
  isAuthenticated: boolean
  profile: User | null
}

export interface ClientsState {
  items: Client[]
  selectedClient: Client | null
  filters: Record<string, unknown>
  sortBy: string
  sortOrder: "asc" | "desc"
  pagination: PaginationState
  loading: boolean
  error: string | null
}

export interface TasksState {
  items: Task[]
  selectedTask: Task | null
  filters: Record<string, unknown>
  groupBy: string
  pagination: PaginationState
  loading: boolean
  error: string | null
}

export interface EventsState {
  items: Event[]
  selectedEvent: Event | null
  viewMode: "month" | "week" | "day" | "agenda"
  currentDate: string
  filters: Record<string, unknown>
  loading: boolean
  error: string | null
}

export interface ProjectsState {
  items: Project[]
  selectedProject: Project | null
  filters: Record<string, unknown>
  pagination: PaginationState
  loading: boolean
  error: string | null
}

export interface InvoicesState {
  items: Invoice[]
  selectedInvoice: Invoice | null
  filters: Record<string, unknown>
  pagination: PaginationState
  loading: boolean
  error: string | null
}

export interface EmailsState {
  items: Email[]
  selectedEmail: Email | null
  folders: string[]
  currentFolder: string
  filters: Record<string, unknown>
  pagination: PaginationState
  loading: boolean
  error: string | null
}

export interface NotificationsState {
  items: Notification[]
  unreadCount: number
  filters: Record<string, unknown>
  loading: boolean
  error: string | null
}

export interface UIState {
  activeTab: string
  sidebarCollapsed: boolean
  theme: string
  modals: Record<string, boolean>
  loading: Record<string, boolean>
  errors: Record<string, string>
  toasts: ToastState[]
}

export interface CacheState {
  data: Record<string, any>
  timestamps: Record<string, number>
  ttl: Record<string, number>
}

export interface SyncState {
  lastSync: Record<string, string>
  syncing: Record<string, boolean>
  conflicts: any[]
  offlineActions: any[]
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface ToastState {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  actions?: Array<{ label: string; action: () => void }>
}

export type ActionType =
  // User Actions
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_UPDATE_PROFILE"
  | "USER_UPDATE_PREFERENCES"
  | "USER_SET_PERMISSIONS"

  // Client Actions
  | "CLIENTS_LOAD_START"
  | "CLIENTS_LOAD_SUCCESS"
  | "CLIENTS_LOAD_ERROR"
  | "CLIENTS_CREATE"
  | "CLIENTS_UPDATE"
  | "CLIENTS_DELETE"
  | "CLIENTS_SELECT"
  | "CLIENTS_SET_FILTERS"
  | "CLIENTS_SET_SORT"
  | "CLIENTS_SET_PAGINATION"

  // Task Actions
  | "TASKS_LOAD_START"
  | "TASKS_LOAD_SUCCESS"
  | "TASKS_LOAD_ERROR"
  | "TASKS_CREATE"
  | "TASKS_UPDATE"
  | "TASKS_DELETE"
  | "TASKS_SELECT"
  | "TASKS_SET_FILTERS"
  | "TASKS_SET_GROUP_BY"
  | "TASKS_SET_PAGINATION"

  // Event Actions
  | "EVENTS_LOAD_START"
  | "EVENTS_LOAD_SUCCESS"
  | "EVENTS_LOAD_ERROR"
  | "EVENTS_CREATE"
  | "EVENTS_UPDATE"
  | "EVENTS_DELETE"
  | "EVENTS_SELECT"
  | "EVENTS_SET_VIEW_MODE"
  | "EVENTS_SET_DATE"
  | "EVENTS_SET_FILTERS"

  // Project Actions
  | "PROJECTS_LOAD_START"
  | "PROJECTS_LOAD_SUCCESS"
  | "PROJECTS_LOAD_ERROR"
  | "PROJECTS_CREATE"
  | "PROJECTS_UPDATE"
  | "PROJECTS_DELETE"
  | "PROJECTS_SELECT"
  | "PROJECTS_SET_FILTERS"
  | "PROJECTS_SET_PAGINATION"

  // Invoice Actions
  | "INVOICES_LOAD_START"
  | "INVOICES_LOAD_SUCCESS"
  | "INVOICES_LOAD_ERROR"
  | "INVOICES_CREATE"
  | "INVOICES_UPDATE"
  | "INVOICES_DELETE"
  | "INVOICES_SELECT"
  | "INVOICES_SET_FILTERS"
  | "INVOICES_SET_PAGINATION"

  // Email Actions
  | "EMAILS_LOAD_START"
  | "EMAILS_LOAD_SUCCESS"
  | "EMAILS_LOAD_ERROR"
  | "EMAILS_SEND"
  | "EMAILS_SELECT"
  | "EMAILS_SET_FOLDER"
  | "EMAILS_SET_FILTERS"
  | "EMAILS_SET_PAGINATION"

  // Notification Actions
  | "NOTIFICATIONS_LOAD_START"
  | "NOTIFICATIONS_LOAD_SUCCESS"
  | "NOTIFICATIONS_LOAD_ERROR"
  | "NOTIFICATIONS_ADD"
  | "NOTIFICATIONS_MARK_READ"
  | "NOTIFICATIONS_DELETE"
  | "NOTIFICATIONS_SET_FILTERS"

  // UI Actions
  | "UI_SET_ACTIVE_TAB"
  | "UI_TOGGLE_SIDEBAR"
  | "UI_SET_THEME"
  | "UI_SHOW_MODAL"
  | "UI_HIDE_MODAL"
  | "UI_SET_LOADING"
  | "UI_SET_ERROR"
  | "UI_ADD_TOAST"
  | "UI_REMOVE_TOAST"

  // Cache Actions
  | "CACHE_SET"
  | "CACHE_GET"
  | "CACHE_CLEAR"
  | "CACHE_INVALIDATE"

  // Sync Actions
  | "SYNC_START"
  | "SYNC_SUCCESS"
  | "SYNC_ERROR"
  | "SYNC_ADD_CONFLICT"
  | "SYNC_RESOLVE_CONFLICT"
  | "SYNC_ADD_OFFLINE_ACTION"
  | "SYNC_REMOVE_OFFLINE_ACTION"

export interface Action {
  type: ActionType
  payload?: any
  meta?: {
    timestamp: number
    source?: string
    optimistic?: boolean
  }
}

export type Middleware = (store: StateManager) => (next: (action: Action) => void) => (action: Action) => void

export type Selector<T> = (state: AppState) => T

export interface Subscription {
  id: string
  selector: Selector<any>
  callback: (value: any, previousValue: any) => void
  lastValue: any
}

class StateManager {
  private state: AppState
  private listeners: Set<(state: AppState) => void> = new Set()
  private subscriptions: Map<string, Subscription> = new Map()
  private middlewares: Middleware[] = []
  private actionHistory: Action[] = []
  private maxHistorySize = 100
  private persistedKeys: Set<string> = new Set(["user", "ui.theme", "ui.sidebarCollapsed"])

  constructor() {
    this.state = this.getInitialState()
    this.loadPersistedState()
    this.setupMiddlewares()
  }

  private getInitialState(): AppState {
    return {
      user: {
        currentUser: null,
        preferences: {},
        permissions: [],
        isAuthenticated: false,
        profile: null,
      },
      clients: {
        items: [],
        selectedClient: null,
        filters: {},
        sortBy: "name",
        sortOrder: "asc",
        pagination: { page: 1, limit: 20, total: 0, hasMore: false },
        loading: false,
        error: null,
      },
      tasks: {
        items: [],
        selectedTask: null,
        filters: {},
        groupBy: "status",
        pagination: { page: 1, limit: 20, total: 0, hasMore: false },
        loading: false,
        error: null,
      },
      events: {
        items: [],
        selectedEvent: null,
        viewMode: "month",
        currentDate: new Date().toISOString(),
        filters: {},
        loading: false,
        error: null,
      },
      projects: {
        items: [],
        selectedProject: null,
        filters: {},
        pagination: { page: 1, limit: 20, total: 0, hasMore: false },
        loading: false,
        error: null,
      },
      invoices: {
        items: [],
        selectedInvoice: null,
        filters: {},
        pagination: { page: 1, limit: 20, total: 0, hasMore: false },
        loading: false,
        error: null,
      },
      emails: {
        items: [],
        selectedEmail: null,
        folders: ["inbox", "sent", "drafts", "trash"],
        currentFolder: "inbox",
        filters: {},
        pagination: { page: 1, limit: 20, total: 0, hasMore: false },
        loading: false,
        error: null,
      },
      notifications: {
        items: [],
        unreadCount: 0,
        filters: {},
        loading: false,
        error: null,
      },
      ui: {
        activeTab: "dashboard",
        sidebarCollapsed: false,
        theme: "default",
        modals: {},
        loading: {},
        errors: {},
        toasts: [],
      },
      cache: {
        data: {},
        timestamps: {},
        ttl: {},
      },
      sync: {
        lastSync: {},
        syncing: {},
        conflicts: [],
        offlineActions: [],
      },
    }
  }

  private setupMiddlewares(): void {
    // Logger middleware
    this.use((store) => (next) => (action) => {
      // Silent logging - Action, Previous State, Next State
      next(action)
    })

    // Persistence middleware
    this.use((store) => (next) => (action) => {
      next(action)
      this.persistState()
    })

    // Analytics middleware
    this.use((store) => (next) => (action) => {
      next(action)
      this.trackAction(action)
    })
  }

  // Core Methods
  dispatch(action: Action): void {
    // Add metadata
    action.meta = {
      timestamp: Date.now(),
      source: "user",
      ...action.meta,
    }

    // Apply middlewares
    let dispatch = (action: Action) => {
      this.state = this.reducer(this.state, action)
      this.addToHistory(action)
      this.notifyListeners()
      this.notifySubscriptions()
    }

    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      dispatch = this.middlewares[i](this)(dispatch)
    }

    dispatch(action)
  }

  getState(): AppState {
    return { ...this.state }
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  select<T>(selector: Selector<T>, callback: (value: T, previousValue: T) => void): () => void {
    const id = crypto.randomUUID()
    const subscription: Subscription = {
      id,
      selector,
      callback,
      lastValue: selector(this.state),
    }

    this.subscriptions.set(id, subscription)

    return () => this.subscriptions.delete(id)
  }

  use(middleware: Middleware): void {
    this.middlewares.push(middleware)
  }

  // Reducer
  private reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
      // User Actions
      case "USER_LOGIN":
        return {
          ...state,
          user: {
            ...state.user,
            currentUser: action.payload.user,
            isAuthenticated: true,
            permissions: action.payload.permissions || [],
          },
        }

      case "USER_LOGOUT":
        return {
          ...state,
          user: {
            ...state.user,
            currentUser: null,
            isAuthenticated: false,
            permissions: [],
          },
        }

      case "USER_UPDATE_PREFERENCES":
        return {
          ...state,
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, ...action.payload },
          },
        }

      // Client Actions
      case "CLIENTS_LOAD_START":
        return {
          ...state,
          clients: { ...state.clients, loading: true, error: null },
        }

      case "CLIENTS_LOAD_SUCCESS":
        return {
          ...state,
          clients: {
            ...state.clients,
            items: action.payload.items,
            pagination: action.payload.pagination,
            loading: false,
            error: null,
          },
        }

      case "CLIENTS_LOAD_ERROR":
        return {
          ...state,
          clients: { ...state.clients, loading: false, error: action.payload },
        }

      case "CLIENTS_CREATE":
        return {
          ...state,
          clients: {
            ...state.clients,
            items: [...state.clients.items, action.payload],
          },
        }

      case "CLIENTS_UPDATE":
        return {
          ...state,
          clients: {
            ...state.clients,
            items: state.clients.items.map((item) =>
              item.id === action.payload.id ? { ...item, ...action.payload } : item,
            ),
          },
        }

      case "CLIENTS_DELETE":
        return {
          ...state,
          clients: {
            ...state.clients,
            items: state.clients.items.filter((item) => item.id !== action.payload),
          },
        }

      case "CLIENTS_SELECT":
        return {
          ...state,
          clients: { ...state.clients, selectedClient: action.payload },
        }

      case "CLIENTS_SET_FILTERS":
        return {
          ...state,
          clients: { ...state.clients, filters: action.payload },
        }

      // UI Actions
      case "UI_SET_ACTIVE_TAB":
        return {
          ...state,
          ui: { ...state.ui, activeTab: action.payload },
        }

      case "UI_TOGGLE_SIDEBAR":
        return {
          ...state,
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
        }

      case "UI_SET_THEME":
        return {
          ...state,
          ui: { ...state.ui, theme: action.payload },
        }

      case "UI_SHOW_MODAL":
        return {
          ...state,
          ui: {
            ...state.ui,
            modals: { ...state.ui.modals, [action.payload]: true },
          },
        }

      case "UI_HIDE_MODAL":
        return {
          ...state,
          ui: {
            ...state.ui,
            modals: { ...state.ui.modals, [action.payload]: false },
          },
        }

      case "UI_ADD_TOAST":
        return {
          ...state,
          ui: {
            ...state.ui,
            toasts: [...state.ui.toasts, action.payload],
          },
        }

      case "UI_REMOVE_TOAST":
        return {
          ...state,
          ui: {
            ...state.ui,
            toasts: state.ui.toasts.filter((toast) => toast.id !== action.payload),
          },
        }

      // Cache Actions
      case "CACHE_SET":
        return {
          ...state,
          cache: {
            ...state.cache,
            data: { ...state.cache.data, [action.payload.key]: action.payload.value },
            timestamps: { ...state.cache.timestamps, [action.payload.key]: Date.now() },
            ttl: { ...state.cache.ttl, [action.payload.key]: action.payload.ttl || 300000 },
          },
        }

      case "CACHE_CLEAR":
        return {
          ...state,
          cache: { data: {}, timestamps: {}, ttl: {} },
        }

      default:
        return state
    }
  }

  // Action Creators
  createActionCreators() {
    return {
      // User Actions
      login: (user: any, permissions: string[] = []) =>
        this.dispatch({ type: "USER_LOGIN", payload: { user, permissions } }),

      logout: () => this.dispatch({ type: "USER_LOGOUT" }),

      updatePreferences: (preferences: Record<string, any>) =>
        this.dispatch({ type: "USER_UPDATE_PREFERENCES", payload: preferences }),

      // Client Actions
      loadClients: async (filters?: any) => {
        this.dispatch({ type: "CLIENTS_LOAD_START" })
        try {
          if (!supabase) {
            throw new Error('Supabase client is not initialized');
          }
          
          const { data, error } = await supabase.from("clients").select("*").order("name")

          if (error) throw error

          this.dispatch({
            type: "CLIENTS_LOAD_SUCCESS",
            payload: {
              items: data || [],
              pagination: { page: 1, limit: 20, total: data?.length || 0, hasMore: false },
            },
          })
        } catch (error: any) {
          this.dispatch({ type: "CLIENTS_LOAD_ERROR", payload: error.message })
        }
      },

      createClient: (client: any) => this.dispatch({ type: "CLIENTS_CREATE", payload: client }),

      updateClient: (client: any) => this.dispatch({ type: "CLIENTS_UPDATE", payload: client }),

      deleteClient: (id: string) => this.dispatch({ type: "CLIENTS_DELETE", payload: id }),

      selectClient: (client: any) => this.dispatch({ type: "CLIENTS_SELECT", payload: client }),

      // UI Actions
      setActiveTab: (tab: string) => this.dispatch({ type: "UI_SET_ACTIVE_TAB", payload: tab }),

      toggleSidebar: () => this.dispatch({ type: "UI_TOGGLE_SIDEBAR" }),

      setTheme: (theme: string) => this.dispatch({ type: "UI_SET_THEME", payload: theme }),

      showModal: (modalId: string) => this.dispatch({ type: "UI_SHOW_MODAL", payload: modalId }),

      hideModal: (modalId: string) => this.dispatch({ type: "UI_HIDE_MODAL", payload: modalId }),

      addToast: (toast: ToastState) => this.dispatch({ type: "UI_ADD_TOAST", payload: toast }),

      removeToast: (toastId: string) => this.dispatch({ type: "UI_REMOVE_TOAST", payload: toastId }),

      // Cache Actions
      setCache: (key: string, value: any, ttl?: number) =>
        this.dispatch({ type: "CACHE_SET", payload: { key, value, ttl } }),

      clearCache: () => this.dispatch({ type: "CACHE_CLEAR" }),
    }
  }

  // Selectors
  createSelectors() {
    return {
      // User Selectors
      getCurrentUser: (state: AppState) => state.user.currentUser,
      isAuthenticated: (state: AppState) => state.user.isAuthenticated,
      getUserPreferences: (state: AppState) => state.user.preferences,
      getUserPermissions: (state: AppState) => state.user.permissions,

      // Client Selectors
      getClients: (state: AppState) => state.clients.items,
      getSelectedClient: (state: AppState) => state.clients.selectedClient,
      getClientFilters: (state: AppState) => state.clients.filters,
      isClientsLoading: (state: AppState) => state.clients.loading,
      getClientsError: (state: AppState) => state.clients.error,

      // UI Selectors
      getActiveTab: (state: AppState) => state.ui.activeTab,
      isSidebarCollapsed: (state: AppState) => state.ui.sidebarCollapsed,
      getTheme: (state: AppState) => state.ui.theme,
      getModals: (state: AppState) => state.ui.modals,
      getToasts: (state: AppState) => state.ui.toasts,

      // Cache Selectors
      getCacheValue: (key: string) => (state: AppState) => state.cache.data[key],
      isCacheValid: (key: string) => (state: AppState) => {
        const timestamp = state.cache.timestamps[key]
        const ttl = state.cache.ttl[key] || 300000
        return timestamp && Date.now() - timestamp < ttl
      },
    }
  }

  // Utility Methods
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }

  private notifySubscriptions(): void {
    this.subscriptions.forEach((subscription) => {
      const newValue = subscription.selector(this.state)
      if (newValue !== subscription.lastValue) {
        subscription.callback(newValue, subscription.lastValue)
        subscription.lastValue = newValue
      }
    })
  }

  private addToHistory(action: Action): void {
    this.actionHistory.push(action)
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory.shift()
    }
  }

  private persistState(): void {
    try {
      const stateToPersist: any = {}

      this.persistedKeys.forEach((key) => {
        const keys = key.split(".")
        let value = this.state as any

        for (const k of keys) {
          value = value?.[k]
        }

        if (value !== undefined) {
          this.setNestedValue(stateToPersist, keys, value)
        }
      })

      secureStorage.setJSON("app_state", stateToPersist)
    } catch (error) {
      // Failed to persist state - error handled silently
    }
  }

  private loadPersistedState(): void {
    try {
      const persistedState = secureStorage.getJSON("app_state")
      if (persistedState) {
        this.state = this.mergeDeep(this.state, persistedState)
      }
    } catch (error) {
      // Failed to load persisted state - error handled silently
    }
  }

  private setNestedValue(obj: any, keys: string[], value: any): void {
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  }

  private mergeDeep(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  private trackAction(action: Action): void {
    // Track action for analytics
    // Silent logging - Action tracked
  }

  // Development Tools
  getActionHistory(): Action[] {
    return [...this.actionHistory]
  }

  replayActions(actions: Action[]): void {
    actions.forEach((action) => this.dispatch(action))
  }

  resetState(): void {
    this.state = this.getInitialState()
    this.notifyListeners()
    this.notifySubscriptions()
  }

  // Performance Monitoring
  getPerformanceMetrics() {
    return {
      stateSize: JSON.stringify(this.state).length,
      listenersCount: this.listeners.size,
      subscriptionsCount: this.subscriptions.size,
      actionHistorySize: this.actionHistory.length,
      cacheSize: Object.keys(this.state.cache.data).length,
    }
  }
}

// Create singleton instance
export const stateManager = new StateManager()

// Export action creators and selectors
export const actions = stateManager.createActionCreators()
export const selectors = stateManager.createSelectors()

export default stateManager
