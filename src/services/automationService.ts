"use client"

import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase"
import type { Database } from "../lib/supabase"
import { authService } from "./auth"

type WorkflowRow = Database["public"]["Tables"]["workflows"]["Row"]
type WorkflowTriggerRow = Database["public"]["Tables"]["workflow_triggers"]["Row"]
type WorkflowActionRow = Database["public"]["Tables"]["workflow_actions"]["Row"]
type WorkflowExecutionRow = Database["public"]["Tables"]["workflow_executions"]["Row"]

// Helper function to execute individual workflow actions
async function executeWorkflowAction(action: WorkflowAction): Promise<void> {
  switch (action.type) {
    case "email":
      // Send email action
      try {
        const emailConfig = action.config as {
          to: string
          subject: string
          body: string
          from?: string
        }
        
        // In a real implementation, you would integrate with an email service like:
        // - SendGrid, Mailgun, AWS SES, etc.
        // For now, we'll simulate the email sending
        
        if (!emailConfig.to || !emailConfig.subject || !emailConfig.body) {
          throw new Error('Email configuration missing required fields: to, subject, body')
        }
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log(`Email sent successfully:`, {
          to: emailConfig.to,
          subject: emailConfig.subject,
          from: emailConfig.from || 'noreply@crm.com'
        })
        
        // In production, you would call your email service API here:
        // await emailService.send(emailConfig)
        
      } catch (error) {
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      break
    case "webhook":
      // Webhook action - simulated for now
      try {
        const config = action.config as {
          url: string
          data?: Record<string, any>
          headers?: Record<string, string>
        }
        
        if (!config.url) {
          throw new Error('Webhook configuration missing required field: url')
        }
        
        // Simulate webhook call
        console.log(`Webhook called successfully:`, {
          url: config.url,
          data: config.data,
          headers: config.headers
        })
      } catch (error) {
        throw new Error(`Webhook failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      break
    case "database":
      // Database action - simulated for now
      try {
        const config = action.config as {
          table: string
          data: Record<string, any>
        }
        
        // Simulate database insert
        console.log(`Record inserted successfully in table: ${config.table}`, config.data)
      } catch (error) {
        throw new Error(`Failed to insert record: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      break
    case "update_record":
      // Update database record - simulated for now
      try {
        const config = action.config as {
          table: string
          data: Record<string, any>
        }
        
        // Simulate database update
        console.log(`Record updated successfully in table: ${config.table}`, config.data)
      } catch (error) {
        throw new Error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      break
    case "notification":
      // Send notification action
      try {
        const notificationConfig = action.config as {
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          recipients?: string[]
          channels?: ('email' | 'sms' | 'push' | 'in-app')[]
        }
        
        if (!notificationConfig.message) {
          throw new Error('Notification configuration missing required field: message')
        }
        
        // Simulate notification sending delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const notification = {
          message: notificationConfig.message,
          type: notificationConfig.type || 'info',
          recipients: notificationConfig.recipients || ['system'],
          channels: notificationConfig.channels || ['in-app'],
          timestamp: new Date().toISOString()
        }
        
        console.log(`Notification sent successfully:`, notification)
        
        // In production, you would integrate with notification services like:
        // - Firebase Cloud Messaging for push notifications
        // - Twilio for SMS
        // - Your in-app notification system
        // await notificationService.send(notification)
        
      } catch (error) {
        throw new Error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      break
    default:
      console.warn(`Unknown action type: ${action.type}`)
  }
}

// Types for automation workflows
export interface Workflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastExecuted?: string
  executionCount: number
  tags: string[]
}

export interface WorkflowTrigger {
  type: "schedule" | "event" | "webhook" | "manual"
  config: {
    schedule?: string // cron expression
    event?: string
    webhookUrl?: string
    conditions?: Record<string, unknown>
  }
}

export interface WorkflowAction {
  id: string
  type: "email" | "task" | "notification" | "webhook" | "update_record" | "database"
  config: Record<string, unknown>
  order: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  isPopular: boolean
  usageCount: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: "pending" | "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  error?: string
  logs: ExecutionLog[]
}

export interface ExecutionLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error"
  message: string
  data?: Record<string, unknown>
}

// Mock data for development
const mockWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Welcome Email Sequence",
    description: "Send welcome emails to new clients",
    trigger: {
      type: "event",
      config: {
        event: "client_created"
      }
    },
    actions: [
      {
        id: "1",
        type: "email",
        config: {
          to: "{{client.email}}",
          subject: "Welcome to our CRM!",
          body: "Thank you for joining us!"
        },
        order: 1
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 5,
    tags: ["email", "onboarding"]
  }
]

const mockExecutions: WorkflowExecution[] = [
  {
    id: "1",
    workflowId: "1",
    status: "completed",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    logs: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Workflow execution started"
      }
    ]
  }
]

// Automation Service Hook
export const useAutomationService = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createWorkflow = useCallback(
    async (workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "executionCount">): Promise<Workflow> => {
      setIsLoading(true)
      setError(null)
      try {
        // For now, simulate workflow creation with mock data
        const newWorkflow: Workflow = {
          ...workflow,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executionCount: 0
        }

        return newWorkflow
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create workflow"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const updateWorkflow = useCallback(async (id: string, updates: Partial<Workflow>): Promise<Workflow> => {
    setIsLoading(true)
    setError(null)
    try {
      // For now, simulate workflow update with mock data
      const existingWorkflow = mockWorkflows.find(w => w.id === id)
      if (!existingWorkflow) {
        throw new Error(`Workflow with id ${id} not found`)
      }

      const updatedWorkflow: Workflow = {
        ...existingWorkflow,
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      }

      return updatedWorkflow
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update workflow"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteWorkflow = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      
      const { error: triggerError } = await supabase.from("workflow_triggers").delete().eq("workflow_id", id)
      if (triggerError) throw triggerError

      const { error: actionError } = await supabase.from("workflow_actions").delete().eq("workflow_id", id)
      if (actionError) throw actionError

      const { error: wfError } = await supabase.from("workflows").delete().eq("id", id)
      if (wfError) throw wfError
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete workflow"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const executeWorkflow = useCallback(async (id: string, context?: Record<string, any>): Promise<WorkflowExecution> => {
    setIsLoading(true)
    setError(null)
    try {
      // For now, simulate workflow execution with mock data
      const workflow = mockWorkflows.find(w => w.id === id)
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`)
      }

      const execution: WorkflowExecution = {
        id: Date.now().toString(),
        workflowId: id,
        status: "completed",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        logs: [
          {
            id: "1",
            timestamp: new Date().toISOString(),
            level: "info",
            message: `Workflow ${workflow.name} executed successfully`
          }
        ]
      }

      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 1000))

      return execution
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute workflow"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getWorkflows = useCallback(async (): Promise<Workflow[]> => {
    setIsLoading(true)
    setError(null)
    try {
      // Check if Supabase is properly configured
      if (!supabase) {
        console.warn('Supabase not configured, using mock data')
        return mockWorkflows
      }
      
      const { data: workflows, error } = await supabase.from("workflows").select("*")
      if (error) {
        console.warn('Failed to fetch workflows from database, using mock data:', error)
        return mockWorkflows
      }

      // Fetch triggers and actions for each workflow
      const fullWorkflows = await Promise.all((workflows as WorkflowRow[]).map(async (wf) => {
        if (!supabase) {
          throw new Error("Supabase client not initialized")
        }
        
        const { data: trigger } = await supabase.from("workflow_triggers").select("*").eq("workflow_id", wf.id).single()
        const { data: actions } = await supabase.from("workflow_actions").select("*").eq("workflow_id", wf.id)
        
        // Calculate execution count from workflow_executions table
        const { data: executions, error: execError } = await supabase
          .from("workflow_executions")
          .select("id")
          .eq("workflow_id", wf.id)
        
        const executionCount = execError ? 0 : (executions?.length || 0)
        
        return {
          id: wf.id,
          name: wf.name,
          description: wf.description || '',
          trigger: trigger ? (trigger as WorkflowTrigger) : {
            id: '',
            type: 'manual',
            config: {},
            workflowId: wf.id
          },
          actions: (actions || []) as WorkflowAction[],
          isActive: wf.is_active || false,
          createdAt: wf.created_at || new Date().toISOString(),
          updatedAt: wf.updated_at || new Date().toISOString(),
          executionCount,
          tags: [] // Note: tags field not in current schema, using empty array
        } as Workflow
      }))

      return fullWorkflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch workflows"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTemplates = useCallback(async (): Promise<WorkflowTemplate[]> => {
    setIsLoading(true)
    setError(null)
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      
      const { data, error } = await supabase.from("workflow_templates").select("*")
      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch templates"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getExecutions = useCallback(async (workflowId?: string): Promise<WorkflowExecution[]> => {
    setIsLoading(true)
    setError(null)
    try {
      if (workflowId) {
        return mockExecutions.filter((e) => e.workflowId === workflowId)
      }
      return [...mockExecutions]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch executions"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAnalytics = useCallback(async (): Promise<any> => {
    setIsLoading(true)
    setError(null)
    try {
      return {
        totalWorkflows: mockWorkflows.length,
        activeWorkflows: mockWorkflows.filter((w) => w.isActive).length,
        totalExecutions: mockExecutions.length,
        successfulExecutions: mockExecutions.filter((e) => e.status === "completed").length,
        failedExecutions: mockExecutions.filter((e) => e.status === "failed").length,
        executionTrend: [
          { date: "2024-01-01", count: 5 },
          { date: "2024-01-02", count: 8 },
          { date: "2024-01-03", count: 12 },
          { date: "2024-01-04", count: 15 },
          { date: "2024-01-05", count: 10 },
        ],
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    getWorkflows,
    getTemplates,
    getExecutions,
    getAnalytics,
  }
}

// Export default service instance
export default {
  useAutomationService,
}
