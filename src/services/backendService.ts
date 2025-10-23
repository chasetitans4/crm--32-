import { supabase } from "../lib/supabase"
import type { Database } from "../lib/supabase"

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

export interface BackendConfig {
  apiUrl: string
  timeout: number
  retryAttempts: number
  enableOfflineMode: boolean
  syncInterval: number
}

export interface SyncStatus {
  entity: string
  lastSync: string
  status: "synced" | "pending" | "error"
  errorMessage?: string
}

export interface OfflineAction {
  id: string
  type: "create" | "update" | "delete"
  entity: string
  data: Record<string, unknown>
  timestamp: string
  synced: boolean
}

export interface BackupData {
  id: string
  timestamp: string
  entities: Record<string, unknown[]>
  size: number
  compressed: boolean
}

// Helper function to ensure secure URL
const ensureSecureUrl = (url: string): string => {
  // In production, enforce HTTPS
  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    console.warn('Insecure HTTP URL detected in production, converting to HTTPS:', url)
    return url.replace('http://', 'https://')
  }
  return url
}

// Helper function to check if we have a real Supabase connection
const isRealSupabaseConnection = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project") && !supabaseKey.includes("your-anon-key")
}

class BackendService {
  private config: BackendConfig
  private offlineQueue: OfflineAction[] = []
  private syncStatus: Map<string, SyncStatus> = new Map()
  private isOnline = navigator.onLine
  private syncInterval: NodeJS.Timeout | null = null
  private hasRealConnection = false

  constructor(config: Partial<BackendConfig> = {}) {
    const defaultApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:3001"
    
    this.config = {
      apiUrl: ensureSecureUrl(defaultApiUrl),
      timeout: 30000,
      retryAttempts: 3,
      enableOfflineMode: true,
      syncInterval: 30000, // 30 seconds
      ...config,
    }

    // Ensure the configured URL is also secure
    this.config.apiUrl = ensureSecureUrl(this.config.apiUrl)

    this.hasRealConnection = Boolean(isRealSupabaseConnection())

    if (this.hasRealConnection) {
      this.initializeOfflineSupport()
      this.startSyncInterval()
    } else {
      // Silent logging - Backend service running in mock mode
    }
  }

  async initialize(): Promise<void> {
    if (this.hasRealConnection) {
      // Silent logging - Backend service initialized with real database
    } else {
      // Silent logging - Backend service initialized in mock mode
    }
  }

  // Connection Management
  private initializeOfflineSupport(): void {
    if (!this.hasRealConnection) return

    window.addEventListener("online", () => {
      this.isOnline = true
      this.syncOfflineActions()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })

    // Load offline queue from localStorage
    const savedQueue = localStorage.getItem("offline_queue")
    if (savedQueue) {
      this.offlineQueue = JSON.parse(savedQueue)
    }
  }

  private startSyncInterval(): void {
    if (!this.hasRealConnection) return

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.hasRealConnection) {
        this.syncAllEntities()
      }
    }, this.config.syncInterval)
  }

  // CRUD Operations with Offline Support
  async create<T extends keyof Database["public"]["Tables"]>(table: T, data: Inserts<T>): Promise<Tables<T>> {
    if (!this.hasRealConnection) {
      // Return mock data for development
      return {
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Tables<T>
    }

    if (!this.isOnline && this.config.enableOfflineMode) {
      return this.queueOfflineAction("create", table as string, data as any)
    }

    try {
      const { data: result, error } = await (supabase as any).from(table).insert(data as any).select().single()

      if (error) throw error

      // Update sync status
      this.updateSyncStatus(table as string, "synced")

      return result as Tables<T>
    } catch (error: any) {
      if (this.config.enableOfflineMode) {
        return this.queueOfflineAction("create", table as string, data as any)
      }
      throw error
    }
  }

  async update<T extends keyof Database["public"]["Tables"]>(
    table: T,
    id: string,
    data: Updates<T>,
  ): Promise<Tables<T>> {
    if (!this.hasRealConnection) {
      // Return mock data for development
      return {
        id,
        ...data,
        updated_at: new Date().toISOString(),
      } as Tables<T>
    }

    if (!this.isOnline && this.config.enableOfflineMode) {
      return this.queueOfflineAction("update", table as string, { id, ...data as any })
    }

    try {
      const { data: result, error } = await (supabase as any).from(table).update(data as any).eq("id", id as any).select().single()

      if (error) throw error

      this.updateSyncStatus(table as string, "synced")

      return result as Tables<T>
    } catch (error: any) {
      if (this.config.enableOfflineMode) {
        return this.queueOfflineAction("update", table as string, { id, ...data as any })
      }
      throw error
    }
  }

  async delete<T extends keyof Database["public"]["Tables"]>(table: T, id: string): Promise<void> {
    if (!this.hasRealConnection) {
      // Mock delete - just log it
      // Silent logging - Mock delete operation
      return
    }

    if (!this.isOnline && this.config.enableOfflineMode) {
      this.queueOfflineAction("delete", table as string, { id })
      return
    }

    try {
      const { error } = await (supabase as any).from(table).delete().eq("id", id as any)

      if (error) throw error

      this.updateSyncStatus(table as string, "synced")
    } catch (error: any) {
      if (this.config.enableOfflineMode) {
        this.queueOfflineAction("delete", table as string, { id })
        return
      }
      throw error
    }
  }

  async read<T extends keyof Database["public"]["Tables"]>(
    table: T,
    filters?: Record<string, any>,
  ): Promise<Tables<T>[]> {
    if (!this.hasRealConnection) {
      // Return mock data based on table
      return this.getMockData(table as string) as Tables<T>[]
    }

    try {
      let query = (supabase as any).from(table).select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key as any, value as any)
          } else {
            query = query.eq(key as any, value as any)
          }
        })
      }

      const { data, error } = await query

      if (error) throw error

      this.updateSyncStatus(table as string, "synced")

      return (data || []) as Tables<T>[]
    } catch (error: any) {
      // Try to get cached data if offline
      if (!this.isOnline && this.config.enableOfflineMode) {
        return this.getCachedData(table as string, filters)
      }
      throw error
    }
  }

  // Mock data for development
  private getMockData(table: string): any[] {
    switch (table) {
      case "clients":
        return [
          {
            id: "1",
            name: "Acme Corp",
            email: "john@acme.com",
            phone: "555-0123",
            company: "Acme Corporation",
            status: "active",
            stage: "1",
            value: 5000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Tech Solutions",
            email: "sarah@techsolutions.com",
            phone: "555-0456",
            company: "Tech Solutions Inc",
            status: "active",
            stage: "3",
            value: 12000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
      case "tasks":
        return [
          {
            id: "1",
            title: "Design Homepage",
            description: "Create homepage design mockup",
            status: "pending",
            priority: "high",
            due_date: "2024-02-15",
            client_id: "1",
            assigned_to: "John Doe",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Client Review",
            description: "Review client feedback",
            status: "completed",
            priority: "medium",
            due_date: "2024-02-20",
            client_id: "2",
            assigned_to: "Jane Smith",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
      case "events":
        return [
          {
            id: "1",
            title: "Client Meeting",
            description: "Discuss project requirements",
            start_date: "2024-02-15T10:00:00Z",
            end_date: "2024-02-15T11:00:00Z",
            type: "meeting",
            client_id: "1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
      default:
        return []
    }
  }

  // Offline Queue Management
  private queueOfflineAction(type: OfflineAction["type"], entity: string, data: any): any {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      entity,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    }

    this.offlineQueue.push(action)
    this.saveOfflineQueue()
    this.updateSyncStatus(entity, "pending")

    // Return optimistic result for UI
    return {
      id: action.id,
      ...data,
      created_at: action.timestamp,
      updated_at: action.timestamp,
    }
  }

  private saveOfflineQueue(): void {
    if (!this.hasRealConnection) return
    localStorage.setItem("offline_queue", JSON.stringify(this.offlineQueue))
  }

  private async syncOfflineActions(): Promise<void> {
    if (!this.hasRealConnection) return

    const pendingActions = this.offlineQueue.filter((action) => !action.synced)

    for (const action of pendingActions) {
      try {
        await this.executeOfflineAction(action)
        action.synced = true
        this.updateSyncStatus(action.entity, "synced")
      } catch (error: any) {
        // Silent error handling - Failed to sync action
        this.updateSyncStatus(action.entity, "error", error.message)
      }
    }

    // Remove synced actions
    this.offlineQueue = this.offlineQueue.filter((action) => !action.synced)
    this.saveOfflineQueue()
  }

  private async executeOfflineAction(action: OfflineAction): Promise<void> {
    if (!this.hasRealConnection) return

    const { type, entity, data } = action

    switch (type) {
      case "create":
        await (supabase as any).from(entity).insert(data as any)
        break
      case "update":
        const { id, ...updateData } = data
        await (supabase as any).from(entity).update(updateData as any).eq("id", id as any)
        break
      case "delete":
        await (supabase as any).from(entity).delete().eq("id", (data as any).id)
        break
    }
  }

  // Caching
  private getCachedData(entity: string, filters?: Record<string, any>): any[] {
    if (!this.hasRealConnection) {
      return this.getMockData(entity)
    }

    const cacheKey = `cache_${entity}_${JSON.stringify(filters || {})}`
    const cached = localStorage.getItem(cacheKey)
    return cached ? JSON.parse(cached) : []
  }

  private setCachedData(entity: string, data: any[], filters?: Record<string, any>): void {
    if (!this.hasRealConnection) return

    const cacheKey = `cache_${entity}_${JSON.stringify(filters || {})}`
    localStorage.setItem(cacheKey, JSON.stringify(data))
  }

  // Sync Status Management
  private updateSyncStatus(entity: string, status: SyncStatus["status"], errorMessage?: string): void {
    this.syncStatus.set(entity, {
      entity,
      lastSync: new Date().toISOString(),
      status,
      errorMessage,
    })
  }

  getSyncStatus(entity?: string): SyncStatus | SyncStatus[] {
    if (entity) {
      return (
        this.syncStatus.get(entity) || {
          entity,
          lastSync: "",
          status: this.hasRealConnection ? "pending" : "synced",
        }
      )
    }
    return Array.from(this.syncStatus.values())
  }

  // Full Sync
  private async syncAllEntities(): Promise<void> {
    if (!this.hasRealConnection) {
      // Silent logging - Skipping sync, using mock data
      return
    }

    const entities = ["clients", "tasks", "events", "projects", "invoices"]

    for (const entity of entities) {
      try {
        const data = await this.read(entity as any)
        this.setCachedData(entity, data)
        this.updateSyncStatus(entity, "synced")
      } catch (error: any) {
        // Silent error handling - Failed to sync entity
        this.updateSyncStatus(entity, "error", error.message)
      }
    }
  }

  // Performance Monitoring
  async getPerformanceMetrics(): Promise<{
    responseTime: number
    errorRate: number
    syncQueueSize: number
    cacheHitRate: number
  }> {
    if (!this.hasRealConnection) {
      // Return mock metrics for development
      return {
        responseTime: 50,
        errorRate: 0,
        syncQueueSize: 0,
        cacheHitRate: 1,
      }
    }

    const startTime = Date.now()

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      
      await supabase.from("clients").select("count").limit(1)
      const responseTime = Date.now() - startTime

      return {
        responseTime,
        errorRate: this.calculateErrorRate(),
        syncQueueSize: this.offlineQueue.length,
        cacheHitRate: this.calculateCacheHitRate(),
      }
    } catch (error) {
      return {
        responseTime: -1,
        errorRate: 1,
        syncQueueSize: this.offlineQueue.length,
        cacheHitRate: 0,
      }
    }
  }

  private calculateErrorRate(): number {
    const errorStatuses = Array.from(this.syncStatus.values()).filter((status) => status.status === "error")
    return errorStatuses.length / Math.max(this.syncStatus.size, 1)
  }

  private calculateCacheHitRate(): number {
    // Simplified cache hit rate calculation
    // In a real implementation, you'd track cache hits vs misses
    return this.hasRealConnection ? 0.85 : 1.0 // 100% hit rate for mock data
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    if (this.hasRealConnection) {
      window.removeEventListener("online", this.syncOfflineActions)
      window.removeEventListener("offline", () => (this.isOnline = false))
    }
  }
}

export const backendService = new BackendService()
export default backendService
