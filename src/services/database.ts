import { supabase, Database } from "../lib/supabase"
import { sanitizeSearchQuery, encryptApiKey, decryptApiKey } from "../utils/security"

// Helper types for database operations
type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
type Rows<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]

// Database types (using Supabase generated types)
export type Client = Database['public']['Tables']['clients']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type CustomField = Database['public']['Tables']['custom_fields']['Row']
export type SalesStage = Database['public']['Tables']['sales_stages']['Row']
export type Email = Database['public']['Tables']['emails']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
// Export insert and update data types for convenience
export type ClientInsertData = Inserts<"clients">
export type ClientUpdateData = Updates<"clients">
export type TaskInsertData = Inserts<"tasks">
export type TaskUpdateData = Updates<"tasks">

// Helper function to check if we have a real Supabase connection
const isRealSupabaseConnection = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project") && !supabaseKey.includes("your-anon-key")
}

class DatabaseService {
  // Client operations
  async getClients(): Promise<Client[]> {
    if (!supabase || !isRealSupabaseConnection()) {
      // Return mock data
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
          source: "Website",
          notes: "Initial consultation completed",
          projects: [],
          custom_fields: {},
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
          source: "Referral",
          notes: "Proposal sent",
          projects: [],
          custom_fields: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    }

    const { data, error } = await (supabase as any).from("clients").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch clients: ${error.message}`)
    return data || []
  }

  async getClientById(id: string): Promise<Client | null> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("clients").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch client: ${error.message}`)
    }
    return data
  }

  async createClient(client: Inserts<"clients">): Promise<Client> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("clients")
      .insert({
        ...client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create client: ${error.message}`)
    return data
  }

  async updateClient(id: string, updates: Updates<"clients">): Promise<Client> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("clients")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update client: ${error.message}`)
    return data
  }

  async deleteClient(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("clients").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete client: ${error.message}`)
  }

  async searchClients(query: string): Promise<Client[]> {
    if (!supabase) throw new Error('Database not initialized')
    const sanitizedQuery = sanitizeSearchQuery(query)
    const { data, error } = await (supabase as any)
      .from("clients")
      .select("*")
      .or(`name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%,company.ilike.%${sanitizedQuery}%`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Database search error:', error)
      throw new Error('Failed to search clients')
    }
    return data || []
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    if (!supabase || !isRealSupabaseConnection()) {
      // Return mock data
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
          tags: ["design", "homepage"],
          time_estimate: 8,
          time_spent: 0,
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
          tags: ["review", "client"],
          time_estimate: 4,
          time_spent: 3,
        },
      ]
    }

    const { data, error } = await (supabase as any).from("tasks").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`)
    return data || []
  }

  async getTaskById(id: string): Promise<Task | null> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("tasks").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch task: ${error.message}`)
    }
    return data
  }

  async createTask(task: Inserts<"tasks">): Promise<Task> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("tasks")
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)
    return data
  }

  async updateTask(id: string, updates: Updates<"tasks">): Promise<Task> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update task: ${error.message}`)
    return data
  }

  async deleteTask(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("tasks").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete task: ${error.message}`)
  }

  async getTasksByClient(clientId: string): Promise<Task[]> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("tasks")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch client tasks: ${error.message}`)
    return data || []
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    if (!supabase || !isRealSupabaseConnection()) {
      // Return mock data
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
          location: "Conference Room A",
          attendees: ["john@techcorp.com", "sarah@company.com"],
        },
        {
          id: "2",
          title: "Follow-up Call",
          description: "Check on project progress",
          start_date: "2024-02-18T14:00:00Z",
          end_date: "2024-02-18T14:30:00Z",
          type: "call",
          client_id: "2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "Phone Call",
          attendees: ["mike@marketing.com"],
        },
      ]
    }

    const { data, error } = await (supabase as any).from("events").select("*").order("start_date", { ascending: true })

    if (error) throw new Error(`Failed to fetch events: ${error.message}`)
    return data || []
  }

  async getEventById(id: string): Promise<Event | null> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("events").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch event: ${error.message}`)
    }
    return data
  }

  async createEvent(event: Inserts<"events">): Promise<Event> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("events")
      .insert({
        ...event,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create event: ${error.message}`)
    return data
  }

  async updateEvent(id: string, updates: Updates<"events">): Promise<Event> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("events")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update event: ${error.message}`)
    return data
  }

  async deleteEvent(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("events").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete event: ${error.message}`)
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("events")
      .select("*")
      .gte("start_date", startDate)
      .lte("end_date", endDate)
      .order("start_date", { ascending: true })

    if (error) throw new Error(`Failed to fetch events by date range: ${error.message}`)
    return data || []
  }

  // User operations
  async getUsers(): Promise<User[]> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("users").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch users: ${error.message}`)
    return data || []
  }

  async getUserById(id: string): Promise<User | null> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("users").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
    return data
  }

  async createUser(user: Inserts<"users">): Promise<User> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("users")
      .insert({
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data
  }

  async updateUser(id: string, updates: Updates<"users">): Promise<User> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data
  }

  async deleteUser(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("users").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete user: ${error.message}`)
  }

  // Custom Fields operations
  async getCustomFields(entityType?: string): Promise<CustomField[]> {
    if (!supabase) throw new Error('Database not initialized')
    let query = (supabase as any).from("custom_fields").select("*")

    if (entityType) {
      query = query.eq("entity_type", entityType)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch custom fields: ${error.message}`)
    return data || []
  }

  async createCustomField(field: Inserts<"custom_fields">): Promise<CustomField> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("custom_fields")
      .insert({
        ...field,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create custom field: ${error.message}`)
    return data
  }

  async updateCustomField(id: string, updates: Updates<"custom_fields">): Promise<CustomField> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("custom_fields")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update custom field: ${error.message}`)
    return data
  }

  async deleteCustomField(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("custom_fields").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete custom field: ${error.message}`)
  }

  // Sales Stages operations
  async getSalesStages(): Promise<SalesStage[]> {
    if (!supabase || !isRealSupabaseConnection()) {
      // Return mock data
      return [
        {
          id: "1",
          name: "Lead",
          color: "#3B82F6",
          order: 1,
          description: "Initial lead stage",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Qualified",
          color: "#8B5CF6",
          order: 2,
          description: "Qualified prospect",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Proposal",
          color: "#F59E0B",
          order: 3,
          description: "Proposal sent",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Negotiation",
          color: "#F97316",
          order: 4,
          description: "In negotiation",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Closed Won",
          color: "#10B981",
          order: 5,
          description: "Deal closed successfully",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "6",
          name: "Closed Lost",
          color: "#EF4444",
          order: 6,
          description: "Deal lost",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    }

    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("sales_stages").select("*").order("order", { ascending: true })

    if (error) throw new Error(`Failed to fetch sales stages: ${error.message}`)
    return data || []
  }

  async createSalesStage(stage: Inserts<"sales_stages">): Promise<SalesStage> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("sales_stages")
      .insert({
        ...stage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create sales stage: ${error.message}`)
    return data
  }

  async updateSalesStage(id: string, updates: Updates<"sales_stages">): Promise<SalesStage> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("sales_stages")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update sales stage: ${error.message}`)
    return data
  }

  async deleteSalesStage(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("sales_stages").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete sales stage: ${error.message}`)
  }

  // Email operations
  async getEmails(): Promise<Email[]> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("emails").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch emails: ${error.message}`)
    return data || []
  }

  async createEmail(email: Inserts<"emails">): Promise<Email> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("emails")
      .insert({
        ...email,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create email: ${error.message}`)
    return data
  }

  async updateEmail(id: string, updates: Updates<"emails">): Promise<Email> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("emails").update(updates).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update email: ${error.message}`)
    return data
  }

  async getEmailsByClient(clientId: string): Promise<Email[]> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("emails")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch client emails: ${error.message}`)
    return data || []
  }

  // API Keys operations
  async getApiKeys(userId: string): Promise<ApiKey[]> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Database API keys fetch error:', error)
      throw new Error('Failed to fetch API keys')
    }
    
    // Return API keys as-is (key_hash is already encrypted)
    return data || []
  }

  async createApiKey(apiKey: Database['public']['Tables']['api_keys']['Insert']): Promise<ApiKey> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any)
      .from("api_keys")
      .insert(apiKey)
      .select()
      .single()

    if (error) {
      console.error('Database API key creation error:', error)
      throw new Error('Failed to create API key')
    }
    
    if (!data) throw new Error('No data returned from API key creation')
    
    return data
  }

  async updateApiKey(id: string, updates: Database['public']['Tables']['api_keys']['Update']): Promise<ApiKey> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("api_keys").update(updates).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update API key: ${error.message}`)
    return data
  }

  async deleteApiKey(id: string): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    const { error } = await (supabase as any).from("api_keys").delete().eq("id", id)

    if (error) throw new Error(`Failed to delete API key: ${error.message}`)
  }

  // Analytics and reporting
  async getClientStats(): Promise<any> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("clients").select("status, stage, value")

    if (error) throw new Error(`Failed to fetch client stats: ${error.message}`)

    const clientData = data as Array<{ status: string; stage: string; value: number }>

    const stats = {
      total: clientData?.length || 0,
      totalValue: clientData?.reduce((sum, client) => sum + (client.value || 0), 0) || 0,
      byStatus: {} as Record<string, number>,
      byStage: {} as Record<string, number>,
    }

    clientData?.forEach((client) => {
      stats.byStatus[client.status] = (stats.byStatus[client.status] || 0) + 1
      stats.byStage[client.stage] = (stats.byStage[client.stage] || 0) + 1
    })

    return stats
  }

  async getTaskStats(): Promise<any> {
    if (!supabase) throw new Error('Database not initialized')
    const { data, error } = await (supabase as any).from("tasks").select("status, priority")

    if (error) throw new Error(`Failed to fetch task stats: ${error.message}`)

    const taskData = data as Array<{ status: string; priority: string }>

    const stats = {
      total: taskData?.length || 0,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    }

    taskData?.forEach((task) => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
    })

    return stats
  }

  // Real-time subscriptions
  subscribeToClients(callback: (payload: any) => void) {
    if (!supabase || !isRealSupabaseConnection()) {
      return null
    }

    return supabase
      .channel("clients")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, callback)
      .subscribe()
  }

  subscribeToTasks(callback: (payload: any) => void) {
    if (!supabase || !isRealSupabaseConnection()) {
      return null
    }

    return supabase
      .channel("tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, callback)
      .subscribe()
  }

  subscribeToEvents(callback: (payload: any) => void) {
    if (!supabase || !isRealSupabaseConnection()) {
      return null
    }

    return supabase
      .channel("events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, callback)
      .subscribe()
  }
}

export const databaseService = new DatabaseService()
