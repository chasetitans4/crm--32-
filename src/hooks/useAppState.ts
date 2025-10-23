"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { stateManager, type AppState, type Selector, type PaginationState, actions, selectors } from "../services/stateManager"

// Hook for accessing the entire state
export function useAppState(): AppState {
  const [state, setState] = useState<AppState>(stateManager.getState())

  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState)
    return unsubscribe
  }, [])

  return state
}

// Hook for selecting specific parts of the state
export function useSelector<T>(selector: Selector<T>): T {
  const [value, setValue] = useState<T>(selector(stateManager.getState()))
  const selectorRef = useRef(selector)

  useEffect(() => {
    selectorRef.current = selector
    const unsubscribe = stateManager.select(
      (state) => selectorRef.current(state),
      (newValue) => setValue(newValue),
    )
    return unsubscribe
  }, [selector])

  return value
}

// Hook for dispatching actions
export function useActions() {
  return actions
}

// Hook for accessing selectors
export function useSelectors() {
  return selectors
}

// Specific hooks for common use cases
export function useAuth() {
  const currentUser = useSelector(selectors.getCurrentUser)
  const isAuthenticated = useSelector(selectors.isAuthenticated)
  const permissions = useSelector(selectors.getUserPermissions)
  const preferences = useSelector(selectors.getUserPreferences)

  return {
    currentUser,
    isAuthenticated,
    permissions,
    preferences,
    login: actions.login,
    logout: actions.logout,
    updatePreferences: actions.updatePreferences,
  }
}

export function useClients() {
  const clients = useSelector(selectors.getClients)
  const selectedClient = useSelector(selectors.getSelectedClient)
  const filters = useSelector(selectors.getClientFilters)
  const loading = useSelector(selectors.isClientsLoading)
  const error = useSelector(selectors.getClientsError)

  return {
    clients,
    selectedClient,
    filters,
    loading,
    error,
    loadClients: actions.loadClients,
    createClient: actions.createClient,
    updateClient: actions.updateClient,
    deleteClient: actions.deleteClient,
    selectClient: actions.selectClient,
  }
}

// Simple UI hook that works with existing context
export function useUI() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: string }>>([])
  const activeTab = useSelector(selectors.getActiveTab)
  const sidebarCollapsed = useSelector(selectors.isSidebarCollapsed)
  const theme = useSelector(selectors.getTheme)
  const modals = useSelector(selectors.getModals)
  //const toasts = useSelector(selectors.getToasts)

  return {
    activeTab,
    sidebarCollapsed,
    theme,
    modals,
    toasts,
    setActiveTab: actions.setActiveTab,
    toggleSidebar: actions.toggleSidebar,
    setTheme: actions.setTheme,
    showModal: actions.showModal,
    hideModal: actions.hideModal,
    addToast: (toast: { id: string; message: string; type?: string }) => setToasts((prev) => [...prev, toast]),
    removeToast: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
  }
}

export function useCache() {
  const getCacheValue = useCallback((key: string) => {
    return selectors.getCacheValue(key)(stateManager.getState())
  }, [])

  const isCacheValid = useCallback((key: string) => {
    return selectors.isCacheValid(key)(stateManager.getState())
  }, [])

  return {
    getCacheValue,
    isCacheValid,
    setCache: actions.setCache,
    clearCache: actions.clearCache,
  }
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(selector: Selector<T>, updateAction: (data: T) => void) {
  const currentValue = useSelector(selector)
  const [optimisticValue, setOptimisticValue] = useState<T>(currentValue)
  const [isOptimistic, setIsOptimistic] = useState(false)

  useEffect(() => {
    if (!isOptimistic) {
      setOptimisticValue(currentValue)
    }
  }, [currentValue, isOptimistic])

  const performOptimisticUpdate = useCallback(
    async (optimisticData: T, actualUpdate: () => Promise<void>) => {
      setOptimisticValue(optimisticData)
      setIsOptimistic(true)

      try {
        await actualUpdate()
      } catch (error) {
        // Revert on error
        setOptimisticValue(currentValue)
        throw error
      } finally {
        setIsOptimistic(false)
      }
    },
    [currentValue],
  )

  return {
    value: optimisticValue,
    isOptimistic,
    performOptimisticUpdate,
  }
}

// Hook for debounced state updates
export function useDebouncedSelector<T>(selector: Selector<T>, delay = 300): T {
  const value = useSelector(selector)
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Hook for local state with state manager sync
export function useSyncedLocalState<T>(key: string, initialValue: T, selector?: Selector<T>): [T, (value: T) => void] {
  const [localValue, setLocalValue] = useState<T>(initialValue)
  const globalValue = selector ? useSelector(selector) : undefined

  useEffect(() => {
    if (selector) {
      setLocalValue(useSelector(selector))
    }
  }, [selector])

  const setValue = useCallback(
    (value: T) => {
      setLocalValue(value)
      // Optionally sync to global state
      if (selector) {
        actions.setCache(key, value)
      }
    },
    [key, selector],
  )

  return [localValue, setValue]
}

// Hook for pagination
export function usePagination(entityType: string) {
  const pagination = useSelector((state: AppState) => {
    switch (entityType) {
      case "clients":
        return state.clients.pagination
      case "tasks":
        return state.tasks.pagination
      case "projects":
        return state.projects.pagination
      case "invoices":
        return state.invoices.pagination
      case "emails":
        return state.emails.pagination
      default:
        return { page: 1, limit: 20, total: 0, hasMore: false }
    }
  })

  const setPagination = useCallback(
    (newPagination: Partial<PaginationState>) => {
      switch (entityType) {
        case "clients":
          stateManager.dispatch({ type: "CLIENTS_SET_PAGINATION", payload: newPagination })
          break
        case "tasks":
          stateManager.dispatch({ type: "TASKS_SET_PAGINATION", payload: newPagination })
          break
        // Add other cases as needed
      }
    },
    [entityType],
  )

  return {
    ...pagination,
    setPagination,
    nextPage: () => setPagination({ ...pagination, page: pagination.page + 1 }),
    prevPage: () => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) }),
    setPage: (page: number) => setPagination({ ...pagination, page }),
    setLimit: (limit: number) => setPagination({ ...pagination, limit, page: 1 }),
  }
}

// Hook for filters
export function useFilters(entityType: string) {
  const filters = useSelector((state: AppState) => {
    switch (entityType) {
      case "clients":
        return state.clients.filters
      case "tasks":
        return state.tasks.filters
      case "events":
        return state.events.filters
      case "projects":
        return state.projects.filters
      case "invoices":
        return state.invoices.filters
      case "emails":
        return state.emails.filters
      case "notifications":
        return state.notifications.filters
      default:
        return {}
    }
  })

  const setFilters = useCallback(
    (newFilters: Record<string, any>) => {
      switch (entityType) {
        case "clients":
          stateManager.dispatch({ type: "CLIENTS_SET_FILTERS", payload: newFilters })
          break
        case "tasks":
          stateManager.dispatch({ type: "TASKS_SET_FILTERS", payload: newFilters })
          break
        case "events":
          stateManager.dispatch({ type: "EVENTS_SET_FILTERS", payload: newFilters })
          break
        // Add other cases as needed
      }
    },
    [entityType],
  )

  const updateFilter = useCallback(
    (key: string, value: unknown) => {
      setFilters({ ...filters, [key]: value })
    },
    [filters, setFilters],
  )

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [setFilters])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
  }
}

// Simple toast hook that works with existing context
export function useToast() {
  const showToast = useCallback(
    (
      type: "success" | "error" | "warning" | "info",
      title: string,
      message: string,
      duration?: number,
      actions?: Array<{ label: string; action: () => void }>,
    ) => {
      // For now, use console.log until we fully integrate state manager
      console.log(`${type.toUpperCase()}: ${title} - ${message}`)

      // You can also show browser notifications
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message })
      }

      return crypto.randomUUID()
    },
    [],
  )

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      return showToast("success", title, message, duration)
    },
    [showToast],
  )

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      return showToast("error", title, message, duration)
    },
    [showToast],
  )

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      return showToast("warning", title, message, duration)
    },
    [showToast],
  )

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      return showToast("info", title, message, duration)
    },
    [showToast],
  )

  const removeToast = useCallback((id: string) => {
    console.log(`Removing toast: ${id}`)
  }, [])

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  }
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState(stateManager.getPerformanceMetrics())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(stateManager.getPerformanceMetrics())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Hook for development tools
export function useDevTools() {
  const [actionHistory, setActionHistory] = useState(stateManager.getActionHistory())

  useEffect(() => {
    const unsubscribe = stateManager.subscribe(() => {
      setActionHistory(stateManager.getActionHistory())
    })
    return unsubscribe
  }, [])

  return {
    actionHistory,
    replayActions: stateManager.replayActions.bind(stateManager),
    resetState: stateManager.resetState.bind(stateManager),
    getState: stateManager.getState.bind(stateManager),
  }
}
