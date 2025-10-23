import axios from "axios"
import { toast } from "react-hot-toast"
import { secureStorage } from "../utils/secureStorage"
import type { Client, Task, Event, EmailTemplate, NewTask, NewEvent } from "../types"

// Helper function to ensure secure URL
const ensureSecureUrl = (url: string): string => {
  // In production, enforce HTTPS
  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    console.warn('Insecure HTTP URL detected in production, converting to HTTPS:', url)
    return url.replace('http://', 'https://')
  }
  return url
}

// Helper function to validate URL security
const validateUrlSecurity = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    
    // In production, only allow HTTPS
    if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
      console.error('Insecure protocol detected in production:', urlObj.protocol)
      return false
    }
    
    // Block known insecure hosts (add more as needed)
    const insecureHosts = ['localhost', '127.0.0.1', '0.0.0.0']
    if (process.env.NODE_ENV === 'production' && insecureHosts.includes(urlObj.hostname)) {
      console.error('Insecure host detected in production:', urlObj.hostname)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Invalid URL:', url)
    return false
  }
}

// Get and validate base URL
const getSecureBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
  
  // If it's a relative URL, return as-is (will use current origin)
  if (baseUrl.startsWith('/')) {
    return baseUrl
  }
  
  // For absolute URLs, ensure security
  const secureUrl = ensureSecureUrl(baseUrl)
  
  if (!validateUrlSecurity(secureUrl)) {
    // Fallback to relative URL if validation fails
    console.warn('URL validation failed, falling back to relative API path')
    return "/api"
  }
  
  return secureUrl
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: getSecureBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  // Add security configurations
  timeout: 30000, // 30 second timeout
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
})

// Add request interceptor for authentication and security
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = secureStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.headers['Cache-Control'] = 'no-cache'
    
    // Validate URL security for absolute URLs
    if (config.url && config.url.startsWith('http')) {
      if (!validateUrlSecurity(config.url)) {
        throw new Error('Insecure URL rejected by security policy')
      }
    }
    
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      secureStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    
    // Log security-related errors
    if (error.message?.includes('security policy')) {
      console.error('Security policy violation:', error.message)
    }
    
    return Promise.reject(error)
  },
)

// Client API endpoints
export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    try {
      const response = await api.get("/clients")
      return response.data
    } catch (error) {
      // Error fetching clients - error handled silently
      throw error
    }
  },

  getById: async (id: string): Promise<Client> => {
    try {
      const response = await api.get(`/clients/${id}`)
      return response.data
    } catch (error) {
      // Error fetching client - error handled silently
      throw error
    }
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    try {
      const response = await api.patch(`/clients/${id}`, data)
      return response.data
    } catch (error) {
      // Error updating client - error handled silently
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/clients/${id}`)
    } catch (error) {
      // Error deleting client - error handled silently
      throw error
    }
  },

  addNote: async (clientId: string, note: { type: "call" | "email" | "meeting"; content: string }): Promise<Client> => {
    try {
      const response = await api.post(`/clients/${clientId}/notes`, note)
      return response.data
    } catch (error) {
      // Error adding note to client - error handled silently
      throw error
    }
  },

  updateStage: async (clientId: string, stage: string): Promise<Client> => {
    try {
      const response = await api.patch(`/clients/${clientId}`, { stage })
      return response.data
    } catch (error) {
      // Error updating stage for client - error handled silently
      throw error
    }
  },
}

// Task API endpoints
export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    try {
      const response = await api.get("/tasks")
      return response.data
    } catch (error) {
      // Error fetching tasks - error handled silently
      throw error
    }
  },

  getById: async (id: string): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}`)
      return response.data
    } catch (error) {
      // Error fetching task - error handled silently
      throw error
    }
  },

  create: async (task: NewTask): Promise<Task> => {
    try {
      const response = await api.post("/tasks", task)
      return response.data
    } catch (error) {
      // Error creating task - error handled silently
      throw error
    }
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}`, data)
      return response.data
    } catch (error) {
      // Error updating task - error handled silently
      throw error
    }
  },

  updateStatus: async (id: string, status: "pending" | "in-progress" | "completed"): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}`, { status })
      return response.data
    } catch (error) {
      // Error updating status for task - error handled silently
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`)
    } catch (error) {
      // Error deleting task - error handled silently
      throw error
    }
  },
}

// Event API endpoints
export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    try {
      const response = await api.get("/events")
      return response.data
    } catch (error) {
      // Error fetching events - error handled silently
      throw error
    }
  },

  create: async (event: NewEvent): Promise<Event> => {
    try {
      const response = await api.post("/events", event)
      return response.data
    } catch (error) {
      // Error creating event - error handled silently
      throw error
    }
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    try {
      const response = await api.patch(`/events/${id}`, data)
      return response.data
    } catch (error) {
      // Error updating event - error handled silently
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/events/${id}`)
    } catch (error) {
      // Error deleting event - error handled silently
      throw error
    }
  },
}

// Email templates API endpoints
export const emailTemplatesApi = {
  getAll: async (): Promise<EmailTemplate[]> => {
    try {
      const response = await api.get("/email-templates")
      return response.data
    } catch (error) {
      // Error fetching email templates - error handled silently
      throw error
    }
  },

  create: async (template: Omit<EmailTemplate, "id">): Promise<EmailTemplate> => {
    try {
      const response = await api.post("/email-templates", template)
      return response.data
    } catch (error) {
      // Error creating email template - error handled silently
      throw error
    }
  },

  update: async (id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    try {
      const response = await api.patch(`/email-templates/${id}`, data)
      return response.data
    } catch (error) {
      // Error updating email template - error handled silently
      throw error
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/email-templates/${id}`)
    } catch (error) {
      // Error deleting email template - error handled silently
      throw error
    }
  },
}

// Export a default object with all APIs
const apiService = {
  clients: clientsApi,
  tasks: tasksApi,
  events: eventsApi,
  emailTemplates: emailTemplatesApi,
};

export default apiService;
