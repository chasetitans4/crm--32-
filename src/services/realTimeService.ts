import { supabase } from "../lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface UserPresence {
  user_id: string
  user_name: string
  avatar_url?: string
  status: "online" | "away" | "busy" | "offline"
  current_page?: string
  last_seen: string
  cursor_position?: { x: number; y: number }
  editing_field?: string
}

export interface CollaborativeEdit {
  id: string
  user_id: string
  user_name: string
  entity_type: "client" | "task" | "event" | "project"
  entity_id: string
  field_name: string
  action: "start_edit" | "end_edit" | "typing"
  timestamp: string
}

export interface RealTimeUpdate {
  id: string
  type: "create" | "update" | "delete"
  table: string
  record_id: string
  user_id: string
  user_name: string
  changes?: Record<string, any>
  timestamp: string
}

class RealTimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private presenceListeners: Array<(presence: UserPresence[]) => void> = []
  private updateListeners: Array<(update: RealTimeUpdate) => void> = []
  private editListeners: Array<(edit: CollaborativeEdit) => void> = []
  private currentUser: { id: string; name: string; avatar_url?: string } | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null

  // Initialize the service with current user
  initialize(user: { id: string; name: string; avatar_url?: string }) {
    this.currentUser = user
    this.startHeartbeat()
  }

  // Cleanup when user logs out
  cleanup() {
    this.channels.forEach((channel) => channel.unsubscribe())
    this.channels.clear()
    this.presenceListeners = []
    this.updateListeners = []
    this.editListeners = []
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    this.currentUser = null
  }

  // Presence management
  async joinPresence(roomId = "global"): Promise<() => void> {
    if (!this.currentUser) {
      throw new Error("User not initialized. Call initialize() first.")
    }

    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const channelName = `presence:${roomId}`
    let channel = this.channels.get(channelName)

    if (!channel) {
      channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: this.currentUser.id,
          },
        },
      })

      // Track presence changes
      if (channel) {
        channel
          .on("presence", { event: "sync" }, () => {
            if (!channel) return;
            const presenceState = channel.presenceState()
            const users: UserPresence[] = Object.values(presenceState)
              .flat()
              .map((presence: any) => presence as UserPresence)

            this.presenceListeners.forEach((listener) => listener(users))
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            // Silent logging: User joined
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            // Silent logging: User left
          })
      }

      this.channels.set(channelName, channel)
    }

    // Join with current user presence
    if (channel) {
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: this.currentUser!.id,
            user_name: this.currentUser!.name,
            avatar_url: this.currentUser!.avatar_url,
            status: "online",
            current_page: window.location.pathname,
            last_seen: new Date().toISOString(),
          })
        }
      })
    }

    return () => {
      if (channel) {
        channel.unsubscribe()
        this.channels.delete(channelName)
      }
    }
  }

  // Update user presence
  async updatePresence(
    roomId = "global",
    updates: Partial<Pick<UserPresence, "status" | "current_page" | "cursor_position" | "editing_field" | "last_seen">>,
  ) {
    if (!this.currentUser) return

    const channelName = `presence:${roomId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      await channel.track({
        user_id: this.currentUser.id,
        user_name: this.currentUser.name,
        avatar_url: this.currentUser.avatar_url,
        status: "online",
        last_seen: new Date().toISOString(),
        ...updates,
      })
    }
  }

  // Subscribe to presence changes
  subscribeToPresence(callback: (presence: UserPresence[]) => void): () => void {
    this.presenceListeners.push(callback)
    return () => {
      this.presenceListeners = this.presenceListeners.filter((l) => l !== callback)
    }
  }

  // Collaborative editing
  async startEditing(
    entityType: CollaborativeEdit["entity_type"],
    entityId: string,
    fieldName: string,
    roomId = "global",
  ) {
    if (!this.currentUser) return

    const edit: CollaborativeEdit = {
      id: `${this.currentUser.id}-${entityId}-${fieldName}`,
      user_id: this.currentUser.id,
      user_name: this.currentUser.name,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
      action: "start_edit",
      timestamp: new Date().toISOString(),
    }

    await this.broadcastEdit(edit, roomId)
    await this.updatePresence(roomId, { editing_field: `${entityType}:${entityId}:${fieldName}` })
  }

  async endEditing(
    entityType: CollaborativeEdit["entity_type"],
    entityId: string,
    fieldName: string,
    roomId = "global",
  ) {
    if (!this.currentUser) return

    const edit: CollaborativeEdit = {
      id: `${this.currentUser.id}-${entityId}-${fieldName}`,
      user_id: this.currentUser.id,
      user_name: this.currentUser.name,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
      action: "end_edit",
      timestamp: new Date().toISOString(),
    }

    await this.broadcastEdit(edit, roomId)
    await this.updatePresence(roomId, { editing_field: undefined })
  }

  private async broadcastEdit(edit: CollaborativeEdit, roomId: string) {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const channelName = `edits:${roomId}`
    let channel = this.channels.get(channelName)

    if (!channel) {
      channel = supabase.channel(channelName)

      channel.on("broadcast", { event: "edit" }, (payload) => {
        this.editListeners.forEach((listener) => listener(payload.payload as CollaborativeEdit))
      })

      await channel.subscribe()
      this.channels.set(channelName, channel)
    }

    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "edit",
        payload: edit,
      })
    }
  }

  // Subscribe to collaborative edits
  subscribeToEdits(callback: (edit: CollaborativeEdit) => void): () => void {
    this.editListeners.push(callback)
    return () => {
      this.editListeners = this.editListeners.filter((l) => l !== callback)
    }
  }

  // Real-time data updates
  subscribeToTableUpdates(table: string, callback: (update: RealTimeUpdate) => void, filter?: string): () => void {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const channelName = `updates:${table}`
    let channel = this.channels.get(channelName)

    if (!channel) {
      channel = supabase.channel(channelName)
  
      const config: any = {
        event: "*",
        schema: "public",
        table: table,
      }
  
      if (filter) {
        config.filter = filter
      }
  
      channel!.on("postgres_changes", config, (payload) => {
        if (!this.currentUser) return
  
        const recordId = (payload.new as any)?.id || (payload.old as any)?.id || 'unknown'
        let updateType: "create" | "update" | "delete";
        switch (payload.eventType) {
          case "INSERT":
            updateType = "create";
            break;
          case "UPDATE":
            updateType = "update";
            break;
          case "DELETE":
            updateType = "delete";
            break;
          default:
            return;
        }
        const update: RealTimeUpdate = {
          id: `${payload.eventType}-${payload.table}-${recordId}`,
          type: updateType,
          table: payload.table,
          record_id: recordId,
          user_id: this.currentUser.id,
          user_name: this.currentUser.name,
          changes: payload.eventType !== "DELETE" ? payload.new : payload.old,
          timestamp: new Date().toISOString(),
        }
  
        this.updateListeners.forEach((listener) => listener(update))
        callback(update)
      })
  
      channel!.subscribe()
      this.channels.set(channelName, channel!)
    }
  
    return () => {
      channel?.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // Subscribe to all updates
  subscribeToUpdates(callback: (update: RealTimeUpdate) => void): () => void {
    this.updateListeners.push(callback)
    return () => {
      this.updateListeners = this.updateListeners.filter((l) => l !== callback)
    }
  }

  // Heartbeat to maintain connection
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.currentUser) {
        await this.updatePresence("global", {
          last_seen: new Date().toISOString(),
        })
      }
    }, 30000) // Every 30 seconds
  }

  // Utility methods
  getCurrentUser() {
    return this.currentUser
  }

  getActiveChannels() {
    return Array.from(this.channels.keys())
  }

  async leaveRoom(roomId: string) {
    const channelsToRemove = Array.from(this.channels.keys()).filter((name) => name.includes(roomId))

    for (const channelName of channelsToRemove) {
      const channel = this.channels.get(channelName)
      if (channel) {
        await channel.unsubscribe()
        this.channels.delete(channelName)
      }
    }
  }
}

export const realTimeService = new RealTimeService()
export default realTimeService
