import { supabase } from "../lib/supabase"
import { backendService } from "./backendService"
import { stateManager } from "./stateManager"
import { secureStorage } from "../utils/secureStorage"
import { advancedEncryption } from "../utils/encryption"

export interface PersistenceConfig {
  enableOfflineMode: boolean
  syncInterval: number
  maxRetries: number
  retryDelay: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export interface SyncOperation {
  id: string
  type: "create" | "update" | "delete"
  table: string
  data: any
  timestamp: number
  retries: number
  status: "pending" | "syncing" | "completed" | "failed"
  error?: string
}

export interface ConflictResolution {
  strategy: "client-wins" | "server-wins" | "merge" | "manual"
  resolver?: (clientData: any, serverData: any) => any
}

class PersistenceService {
  private config: PersistenceConfig
  private syncQueue: SyncOperation[] = []
  private isOnline: boolean = navigator.onLine
  private syncInterval: NodeJS.Timeout | null = null
  private conflictResolvers: Map<string, ConflictResolution> = new Map()

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = {
      enableOfflineMode: true,
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      compressionEnabled: true,
      encryptionEnabled: true, // Enable encryption by default for security
      ...config,
    }

    this.setupEventListeners()
    this.loadSyncQueue()
    this.setupConflictResolvers()
  }

  async initialize(): Promise<void> {
    try {
      // Initialize backend service
      await backendService.initialize()

      // Start sync process if online
      if (this.isOnline) {
        this.startSyncProcess()
      }

      // Load cached data if offline
      if (!this.isOnline && this.config.enableOfflineMode) {
        await this.loadCachedData()
      }

      // Silent logging - Persistence service initialized
    } catch (error) {
      // Silent error handling - Failed to initialize persistence service
      throw error
    }
  }

  // CRUD Operations with offline support
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      type: "create",
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: "pending",
    }

    if (this.isOnline) {
      try {
        const result = await this.executeCreate(table, data)
        operation.status = "completed"
        return result
      } catch (error) {
        if (this.config.enableOfflineMode) {
          this.addToSyncQueue(operation)
          return this.createOptimisticRecord(table, data)
        }
        throw error
      }
    } else if (this.config.enableOfflineMode) {
      this.addToSyncQueue(operation)
      return this.createOptimisticRecord(table, data)
    } else {
      throw new Error("Offline mode disabled and no internet connection")
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      type: "update",
      table,
      data: { id, ...data },
      timestamp: Date.now(),
      retries: 0,
      status: "pending",
    }

    if (this.isOnline) {
      try {
        const result = await this.executeUpdate(table, id, data)
        operation.status = "completed"
        return result
      } catch (error) {
        if (this.config.enableOfflineMode) {
          this.addToSyncQueue(operation)
          return this.updateOptimisticRecord(table, id, data)
        }
        throw error
      }
    } else if (this.config.enableOfflineMode) {
      this.addToSyncQueue(operation)
      return this.updateOptimisticRecord(table, id, data)
    } else {
      throw new Error("Offline mode disabled and no internet connection")
    }
  }

  async delete(table: string, id: string): Promise<void> {
    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      type: "delete",
      table,
      data: { id },
      timestamp: Date.now(),
      retries: 0,
      status: "pending",
    }

    if (this.isOnline) {
      try {
        await this.executeDelete(table, id)
        operation.status = "completed"
      } catch (error) {
        if (this.config.enableOfflineMode) {
          this.addToSyncQueue(operation)
          this.deleteOptimisticRecord(table, id)
        } else {
          throw error
        }
      }
    } else if (this.config.enableOfflineMode) {
      this.addToSyncQueue(operation)
      this.deleteOptimisticRecord(table, id)
    } else {
      throw new Error("Offline mode disabled and no internet connection")
    }
  }

  async read<T>(table: string, filters?: any): Promise<T[]> {
    if (this.isOnline) {
      try {
        const result = await this.executeRead<T>(table, filters)
        // Cache the result for offline access
        await this.cacheData(table, result, filters)
        return result
      } catch (error) {
        if (this.config.enableOfflineMode) {
          return await this.getCachedData<T>(table, filters)
        }
        throw error
      }
    } else if (this.config.enableOfflineMode) {
      return await this.getCachedData<T>(table, filters)
    } else {
      throw new Error("Offline mode disabled and no internet connection")
    }
  }

  // Sync Operations
  async syncAll(): Promise<void> {
    if (!this.isOnline) {
      // Silent logging - Cannot sync while offline
      return
    }

    // Silent logging - Starting sync operations

    const pendingOperations = this.syncQueue.filter((op) => op.status === "pending")

    for (const operation of pendingOperations) {
      await this.syncOperation(operation)
    }

    // Remove completed operations
    this.syncQueue = this.syncQueue.filter((op) => op.status !== "completed")
    this.saveSyncQueue()

    // Silent logging - Sync completed
  }

  private async syncOperation(operation: SyncOperation): Promise<void> {
    operation.status = "syncing"

    try {
      switch (operation.type) {
        case "create":
          await this.executeCreate(operation.table, operation.data)
          break
        case "update":
          await this.executeUpdate(operation.table, operation.data.id, operation.data)
          break
        case "delete":
          await this.executeDelete(operation.table, operation.data.id)
          break
      }

      operation.status = "completed"
      // Silent logging - Synced operation
    } catch (error: any) {
      operation.retries++
      operation.error = error.message

      if (operation.retries >= this.config.maxRetries) {
        operation.status = "failed"
        // Silent error handling - Failed to sync operation after max retries
      } else {
        operation.status = "pending"
        // Silent error handling - Sync failed, will retry
      }
    }
  }

  // Conflict Resolution
  setConflictResolver(table: string, resolution: ConflictResolution): void {
    this.conflictResolvers.set(table, resolution)
  }

  private async resolveConflict(table: string, clientData: any, serverData: any): Promise<any> {
    const resolver = this.conflictResolvers.get(table) || { strategy: "server-wins" }

    switch (resolver.strategy) {
      case "client-wins":
        return clientData
      case "server-wins":
        return serverData
      case "merge":
        return { ...serverData, ...clientData, updated_at: new Date().toISOString() }
      case "manual":
        if (resolver.resolver) {
          return resolver.resolver(clientData, serverData)
        }
        // Fallback to server wins if no custom resolver
        return serverData
      default:
        return serverData
    }
  }

  // Database Operations
  private async executeCreate<T>(table: string, data: Partial<T>): Promise<T> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data: result, error } = await (supabase as any).from(table).insert(data).select().single()

    if (error) throw error
    return result
  }

  private async executeUpdate<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data: result, error } = await (supabase as any).from(table).update(data).eq("id", id).select().single()

    if (error) throw error
    return result
  }

  private async executeDelete(table: string, id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await supabase.from(table).delete().eq("id", id)

    if (error) throw error
  }

  private async executeRead<T>(table: string, filters?: any): Promise<T[]> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    let query = supabase.from(table).select("*")

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value as any)
      })
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Optimistic Updates
  private createOptimisticRecord<T>(table: string, data: Partial<T>): T {
    const optimisticRecord = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _optimistic: true,
    } as T

    // Update state manager
    this.updateStateManager(table, "create", optimisticRecord)

    return optimisticRecord
  }

  private updateOptimisticRecord<T>(table: string, id: string, data: Partial<T>): T {
    const optimisticRecord = {
      id,
      ...data,
      updated_at: new Date().toISOString(),
      _optimistic: true,
    } as T

    // Update state manager
    this.updateStateManager(table, "update", optimisticRecord)

    return optimisticRecord
  }

  private deleteOptimisticRecord(table: string, id: string): void {
    // Update state manager
    this.updateStateManager(table, "delete", { id })
  }

  private updateStateManager(table: string, operation: string, data: any): void {
    const actionType = `${table.toUpperCase()}_${operation.toUpperCase()}` as any

    try {
      stateManager.dispatch({
        type: actionType,
        payload: data,
        meta: {
          timestamp: Date.now(),
          source: "persistence",
          optimistic: true,
        },
      })
    } catch (error) {
      // Silent error handling - Failed to update state manager
    }
  }

  // Caching
  private async cacheData(table: string, data: any[], filters?: any): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(table, filters)
      const cacheData = {
        data,
        timestamp: Date.now(),
        filters,
      }

      let dataToStore = JSON.stringify(cacheData)

      // Apply encryption if enabled
      if (this.config.encryptionEnabled) {
        dataToStore = await advancedEncryption.encrypt(dataToStore)
      }

      // Apply compression if enabled (after encryption)
      if (this.config.compressionEnabled) {
        // Simple compression simulation - in production, use actual compression
        secureStorage.setItem(`cache_${cacheKey}`, dataToStore)
      } else {
        secureStorage.setItem(`cache_${cacheKey}`, dataToStore)
      }
    } catch (error) {
      // Silent error handling - Failed to cache data
    }
  }

  private async getCachedData<T>(table: string, filters?: any): Promise<T[]> {
    try {
      const cacheKey = this.getCacheKey(table, filters)
      let cached = secureStorage.getItem(`cache_${cacheKey}`)

      if (cached) {
        // Decrypt if encryption is enabled
        if (this.config.encryptionEnabled) {
          cached = await advancedEncryption.decrypt(cached)
        }

        const cacheData = JSON.parse(cached)
        return cacheData.data || []
      }
    } catch (error) {
      // Silent error handling - Failed to get cached data
    }
    return []
  }

  private getCacheKey(table: string, filters?: any): string {
    const filterString = filters ? JSON.stringify(filters) : "all"
    return `${table}_${filterString}`
  }

  private async loadCachedData(): Promise<void> {
    try {
      const tables = ["clients", "tasks", "projects", "invoices"]

      for (const table of tables) {
        const cachedData = await this.getCachedData(table)
        if (cachedData.length > 0) {
          this.updateStateManager(table, "load_success", {
            items: cachedData,
            pagination: { page: 1, limit: cachedData.length, total: cachedData.length, hasMore: false },
          })
        }
      }
    } catch (error) {
      // Silent error handling - Failed to load cached data
    }
  }

  // Sync Queue Management
  private addToSyncQueue(operation: SyncOperation): void {
    this.syncQueue.push(operation)
    this.saveSyncQueue()
  }

  private saveSyncQueue(): void {
    try {
      secureStorage.setJSON("sync_queue", this.syncQueue)
    } catch (error) {
      // Silent error handling - Failed to save sync queue
    }
  }

  private loadSyncQueue(): void {
    try {
      const saved = secureStorage.getJSON("sync_queue")
      if (saved && Array.isArray(saved)) {
        this.syncQueue = saved as SyncOperation[]
      }
    } catch (error) {
      // Silent error handling - Failed to load sync queue
      this.syncQueue = []
    }
  }

  // Event Listeners
  private setupEventListeners(): void {
    // Online/Offline detection
    window.addEventListener("online", () => {
      this.isOnline = true
      // Silent logging - Connection restored, starting sync
      this.startSyncProcess()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      // Silent logging - Connection lost, entering offline mode
      this.stopSyncProcess()
    })

    // Page visibility for sync optimization
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.isOnline) {
        this.syncAll()
      }
    })
  }

  private startSyncProcess(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    // Initial sync
    this.syncAll()

    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll()
    }, this.config.syncInterval)
  }

  private stopSyncProcess(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  private setupConflictResolvers(): void {
    // Default conflict resolvers for different tables
    this.setConflictResolver("clients", {
      strategy: "merge",
      resolver: (client, server) => ({
        ...server,
        ...client,
        updated_at: new Date().toISOString(),
      }),
    })

    this.setConflictResolver("tasks", {
      strategy: "client-wins", // Tasks are usually more current on client
    })

    this.setConflictResolver("projects", {
      strategy: "merge",
    })
  }

  // Public API
  getSyncStatus(): {
    isOnline: boolean
    queueLength: number
    pendingOperations: number
    failedOperations: number
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      pendingOperations: this.syncQueue.filter((op) => op.status === "pending").length,
      failedOperations: this.syncQueue.filter((op) => op.status === "failed").length,
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = secureStorage.getAllKeys().filter((key) => key.startsWith("cache_"))
      keys.forEach((key) => secureStorage.removeItem(key))
      // Silent logging - Cache cleared
    } catch (error) {
      // Silent error handling - Failed to clear cache
    }
  }

  async retryFailedOperations(): Promise<void> {
    const failedOperations = this.syncQueue.filter((op) => op.status === "failed")

    for (const operation of failedOperations) {
      operation.status = "pending"
      operation.retries = 0
      operation.error = undefined
    }

    this.saveSyncQueue()

    if (this.isOnline) {
      await this.syncAll()
    }
  }

  getFailedOperations(): SyncOperation[] {
    return this.syncQueue.filter((op) => op.status === "failed")
  }

  async exportData(): Promise<string> {
    const exportData = {
      syncQueue: this.syncQueue,
      cache: this.getAllCachedData(),
      timestamp: new Date().toISOString(),
    }

    return JSON.stringify(exportData, null, 2)
  }

  private getAllCachedData(): Record<string, any> {
    const cacheData: Record<string, any> = {}

    secureStorage.getAllKeys().forEach((key) => {
      if (key.startsWith("cache_")) {
        try {
          cacheData[key] = secureStorage.getJSON(key) || {}
        } catch (error) {
          // Silent error handling - Failed to parse cached data
        }
      }
    })

    return cacheData
  }
}

// Create singleton instance
export const persistenceService = new PersistenceService()

export default persistenceService
