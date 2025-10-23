import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

// Validate environment variables
if (!supabaseUrl || supabaseUrl === "https://your-project.supabase.co") {
  console.warn("Supabase URL not configured. Using mock data.")
}

if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key") {
  console.warn(
    "Supabase anonymous key not configured. Using mock data. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.",
  )
}

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          company: string
          status: string
          value: number
          stage: string
          source: string
          created_at: string
          updated_at: string
          notes: string
          projects: string[]
          custom_fields: Record<string, unknown>
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string
          company?: string
          status?: string
          value?: number
          stage?: string
          source?: string
          created_at?: string
          updated_at?: string
          notes?: string
          projects?: string[]
          custom_fields?: Record<string, unknown>
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          status?: string
          value?: number
          stage?: string
          source?: string
          created_at?: string
          updated_at?: string
          notes?: string
          projects?: string[]
          custom_fields?: Record<string, unknown>
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          assigned_to: string
          client_id: string
          due_date: string
          created_at: string
          updated_at: string
          tags: string[]
          time_estimate: number
          time_spent: number
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: string
          priority?: string
          assigned_to?: string
          client_id?: string
          due_date?: string
          created_at?: string
          updated_at?: string
          tags?: string[]
          time_estimate?: number
          time_spent?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          assigned_to?: string
          client_id?: string
          due_date?: string
          created_at?: string
          updated_at?: string
          tags?: string[]
          time_estimate?: number
          time_spent?: number
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          type: string
          client_id: string
          created_at: string
          updated_at: string
          location: string
          attendees: string[]
        }
        Insert: {
          id?: string
          title: string
          description?: string
          start_date: string
          end_date: string
          type?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          location?: string
          attendees?: string[]
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          type?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          location?: string
          attendees?: string[]
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          status: string
          last_login: string
          created_at: string
          updated_at: string
          avatar_url: string
          preferences: Record<string, unknown>
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: string
          status?: string
          last_login?: string
          created_at?: string
          updated_at?: string
          avatar_url?: string
          preferences?: Record<string, unknown>
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          status?: string
          last_login?: string
          created_at?: string
          updated_at?: string
          avatar_url?: string
          preferences?: Record<string, unknown>
        }
      }
      custom_fields: {
        Row: {
          id: string
          name: string
          type: string
          required: boolean
          options: string[]
          entity_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          required?: boolean
          options?: string[]
          entity_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          required?: boolean
          options?: string[]
          entity_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          name: string
          key_hash: string
          permissions: string[]
          user_id: string
          created_at: string
          last_used: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          key_hash: string
          permissions: string[]
          user_id: string
          created_at?: string
          last_used?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          key_hash?: string
          permissions?: string[]
          user_id?: string
          created_at?: string
          last_used?: string
          is_active?: boolean
        }
      }
      sales_stages: {
        Row: {
          id: string
          name: string
          order: number
          color: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          order: number
          color?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          order?: number
          color?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          subject: string
          body: string
          body_type: string
          from_email: string
          to_email: string[]
          cc_email: string[]
          bcc_email: string[]
          status: string
          priority: string
          thread_id: string
          folder: string
          is_read: boolean
          is_starred: boolean
          is_important: boolean
          client_id: string
          project_id: string
          task_id: string
          user_id: string
          metadata: Record<string, any>
          created_at: string
          updated_at: string
          sent_at: string
          attachments: { id: string; filename: string; contentType: string; size: number; data?: string; url?: string; cid?: string }[]
        }
        Insert: {
          id?: string
          subject: string
          body: string
          body_type?: string
          from_email: string
          to_email: string[]
          cc_email?: string[]
          bcc_email?: string[]
          status?: string
          priority?: string
          thread_id?: string
          folder?: string
          is_read?: boolean
          is_starred?: boolean
          is_important?: boolean
          client_id?: string
          project_id?: string
          task_id?: string
          user_id?: string
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
          sent_at?: string
          attachments?: { id: string; filename: string; contentType: string; size: number; data?: string; url?: string; cid?: string }[]
        }
        Update: {
          id?: string
          subject?: string
          body?: string
          body_type?: string
          from_email?: string
          to_email?: string[]
          cc_email?: string[]
          bcc_email?: string[]
          status?: string
          priority?: string
          thread_id?: string
          folder?: string
          is_read?: boolean
          is_starred?: boolean
          is_important?: boolean
          client_id?: string
          project_id?: string
          task_id?: string
          user_id?: string
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
          sent_at?: string
          attachments?: { id: string; filename: string; contentType: string; size: number; data?: string; url?: string; cid?: string }[]
        }
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      workflow_triggers: {
        Row: {
          id: string
          workflow_id: string
          type: string
          config: Record<string, unknown>
        }
        Insert: {
          id?: string
          workflow_id: string
          type: string
          config?: Record<string, unknown>
        }
        Update: {
          id?: string
          workflow_id?: string
          type?: string
          config?: Record<string, unknown>
        }
      }
      workflow_actions: {
        Row: {
          id: string
          workflow_id: string
          type: string
          config: Record<string, unknown>
          order: number
        }
        Insert: {
          id?: string
          workflow_id: string
          type: string
          config?: Record<string, unknown>
          order: number
        }
        Update: {
          id?: string
          workflow_id?: string
          type?: string
          config?: Record<string, unknown>
          order?: number
        }
      }
      workflow_templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          config: Record<string, unknown>
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category?: string
          config?: Record<string, unknown>
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          config?: Record<string, unknown>
        }
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          status: string
          started_at: string
          completed_at: string
          error: string
          logs: { timestamp: string; level: string; message: string }[]
        }
        Insert: {
          id?: string
          workflow_id: string
          status: string
          started_at?: string
          completed_at?: string
          error?: string
          logs?: { timestamp: string; level: string; message: string }[]
        }
        Update: {
          id?: string
          workflow_id?: string
          status?: string
          started_at?: string
          completed_at?: string
          error?: string
          logs?: { timestamp: string; level: string; message: string }[]
        }
      }
      email_quotas: {
        Row: {
          id: string
          user_id: string
          daily_limit: number
          monthly_limit: number
          daily_sent: number
          monthly_sent: number
          last_reset_date: string
          attachment_size_limit: number
          storage_used: number
          storage_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_limit?: number
          monthly_limit?: number
          daily_sent?: number
          monthly_sent?: number
          last_reset_date?: string
          attachment_size_limit?: number
          storage_used?: number
          storage_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_limit?: number
          monthly_limit?: number
          daily_sent?: number
          monthly_sent?: number
          last_reset_date?: string
          attachment_size_limit?: number
          storage_used?: number
          storage_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Create Supabase client with error handling
let supabase: SupabaseClient<Database> | null = null

try {
  if (supabaseUrl !== "https://your-project.supabase.co" && supabaseAnonKey !== "your-anon-key") {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn("Using mock Supabase client for development")
    // Create a mock client for development
    const mockQueryBuilder = {
      select: () => mockQueryBuilder,
      insert: () => mockQueryBuilder,
      update: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      neq: () => mockQueryBuilder,
      gt: () => mockQueryBuilder,
      gte: () => mockQueryBuilder,
      lt: () => mockQueryBuilder,
      lte: () => mockQueryBuilder,
      like: () => mockQueryBuilder,
      ilike: () => mockQueryBuilder,
      is: () => mockQueryBuilder,
      in: () => mockQueryBuilder,
      contains: () => mockQueryBuilder,
      containedBy: () => mockQueryBuilder,
      rangeGt: () => mockQueryBuilder,
      rangeGte: () => mockQueryBuilder,
      rangeLt: () => mockQueryBuilder,
      rangeLte: () => mockQueryBuilder,
      rangeAdjacent: () => mockQueryBuilder,
      overlaps: () => mockQueryBuilder,
      textSearch: () => mockQueryBuilder,
      match: () => mockQueryBuilder,
      not: () => mockQueryBuilder,
      or: () => mockQueryBuilder,
      filter: () => mockQueryBuilder,
      order: () => mockQueryBuilder,
      limit: () => mockQueryBuilder,
      range: () => mockQueryBuilder,
      abortSignal: () => mockQueryBuilder,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      csv: () => Promise.resolve({ data: '', error: null }),
      geojson: () => Promise.resolve({ data: null, error: null }),
      explain: () => Promise.resolve({ data: '', error: null }),
      rollback: () => Promise.resolve({ data: null, error: null }),
      returns: () => mockQueryBuilder,
      then: (resolve: any) => resolve({ data: [], error: null })
    }
    
    supabase = {
      from: () => mockQueryBuilder,
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any as SupabaseClient<Database>
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
  supabase = null
}

export { supabase }

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
