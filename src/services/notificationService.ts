import { supabase } from "../lib/supabase"
import type { Database } from "../lib/supabase"

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

export interface NotificationPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  in_app_notifications: boolean
  task_reminders: boolean
  event_alerts: boolean
  lead_assignments: boolean
  invoice_due_alerts: boolean
  system_updates: boolean
  marketing_emails: boolean
  reminder_timing: number // minutes before event
  quiet_hours_start: string // HH:MM format
  quiet_hours_end: string // HH:MM format
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "task" | "event" | "invoice" | "lead" | "system" | "mention"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "urgent"
  read: boolean
  action_url?: string
  action_label?: string
  metadata?: Record<string, any>
  scheduled_for?: string
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: string
  subject: string
  body: string
  variables: string[]
  active: boolean
  created_at: string
  updated_at: string
}

class NotificationService {
  private listeners: Array<(notifications: Notification[]) => void> = []
  private currentNotifications: Notification[] = []

  // Notification CRUD operations
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`)
    return data || []
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw new Error(`Failed to get unread count: ${error.message}`)
    return count || 0
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() } as any)
      .eq("id", notificationId)

    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`)
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() } as any)
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await (supabase as any).from("notifications").delete().eq("id", notificationId)

    if (error) throw new Error(`Failed to delete notification: ${error.message}`)
  }

  async createNotification(
    notification: Omit<Notification, "id" | "created_at" | "updated_at">,
  ): Promise<Notification> {
    const { data, error } = await (supabase as any)
      .from("notifications")
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) throw new Error(`Failed to create notification: ${error.message}`)
    return data
  }

  // Notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch notification preferences: ${error.message}`)
    }
    return data
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">>,
  ): Promise<NotificationPreferences> {
    const { data, error } = await (supabase as any)
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) throw new Error(`Failed to update notification preferences: ${error.message}`)
    return data
  }

  // Smart notification creation based on events
  async createTaskReminder(taskId: string, userId: string, dueDate: Date): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences?.task_reminders) return

    const reminderTime = new Date(dueDate.getTime() - preferences.reminder_timing * 60 * 1000)

    await this.createNotification({
      user_id: userId,
      type: "task",
      title: "Task Due Soon",
      message: `Your task is due in ${preferences.reminder_timing} minutes`,
      priority: "medium",
      read: false,
      action_url: "/tasks",
      action_label: "View Task",
      metadata: { task_id: taskId },
      scheduled_for: reminderTime.toISOString(),
    })
  }

  async createEventAlert(eventId: string, userId: string, startDate: Date, title: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences?.event_alerts) return

    const alertTime = new Date(startDate.getTime() - preferences.reminder_timing * 60 * 1000)

    await this.createNotification({
      user_id: userId,
      type: "event",
      title: "Upcoming Event",
      message: `"${title}" starts in ${preferences.reminder_timing} minutes`,
      priority: "high",
      read: false,
      action_url: "/calendar",
      action_label: "View Calendar",
      metadata: { event_id: eventId },
      scheduled_for: alertTime.toISOString(),
    })
  }

  async createInvoiceDueAlert(
    invoiceId: string,
    userId: string,
    clientName: string,
    amount: number,
    dueDate: Date,
  ): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences?.invoice_due_alerts) return

    const isOverdue = dueDate < new Date()
    const priority = isOverdue ? "urgent" : "high"
    const title = isOverdue ? "Invoice Overdue" : "Invoice Due Today"
    const message = isOverdue
      ? `Invoice for ${clientName} ($${amount}) is overdue`
      : `Invoice for ${clientName} ($${amount}) is due today`

    await this.createNotification({
      user_id: userId,
      type: "invoice",
      title,
      message,
      priority,
      read: false,
      action_url: "/invoicing",
      action_label: "View Invoice",
      metadata: { invoice_id: invoiceId, client_name: clientName, amount },
    })
  }

  async createLeadAssignmentAlert(leadId: string, userId: string, leadName: string, assignedBy: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences?.lead_assignments) return

    await this.createNotification({
      user_id: userId,
      type: "lead",
      title: "New Lead Assigned",
      message: `You have been assigned a new lead: ${leadName} by ${assignedBy}`,
      priority: "medium",
      read: false,
      action_url: "/clients",
      action_label: "View Lead",
      metadata: { lead_id: leadId, assigned_by: assignedBy },
    })
  }

  async createMentionAlert(userId: string, mentionedBy: string, context: string, contextUrl: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: "mention",
      title: "You were mentioned",
      message: `${mentionedBy} mentioned you in ${context}`,
      priority: "medium",
      read: false,
      action_url: contextUrl,
      action_label: "View",
      metadata: { mentioned_by: mentionedBy, context },
    })
  }

  // Real-time subscription
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    this.listeners.push(callback)

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Fetch updated notifications
          const notifications = await this.getNotifications(userId)
          this.currentNotifications = notifications
          this.listeners.forEach((listener) => listener(notifications))
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  // Email notification service
  async sendEmailNotification(userId: string, templateName: string, variables: Record<string, any>): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences?.email_notifications) return

    // Get user email
    const { data: user } = await (supabase as any).from("users").select("email").eq("id", userId).single()

    if (!user?.email) return

    // Get email template
    const { data: template } = await (supabase as any)
      .from("notification_templates")
      .select("*")
      .eq("name", templateName)
      .eq("active", true)
      .single()

    if (!template) return

    // Replace variables in template
    let subject = (template as any).subject
    let body = (template as any).body

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, "g"), String(value))
      body = body.replace(new RegExp(placeholder, "g"), String(value))
    })

    // Send email (integrate with your email service)
    // This would typically call an email service like SendGrid, Mailgun, etc.
    // Silent logging - Sending email notification
  }

  // Batch operations for performance
  async createBulkNotifications(
    notifications: Array<Omit<Notification, "id" | "created_at" | "updated_at">>,
  ): Promise<void> {
    const { error } = await (supabase as any).from("notifications").insert(
      notifications.map((notification) => ({
        ...notification,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as any,
    )

    if (error) throw new Error(`Failed to create bulk notifications: ${error.message}`)
  }

  // Cleanup old notifications
  async cleanupOldNotifications(userId: string, daysToKeep = 30): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { error } = await (supabase as any)
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .eq("read", true)
      .lt("created_at", cutoffDate.toISOString())

    if (error) throw new Error(`Failed to cleanup old notifications: ${error.message}`)
  }
}

export const notificationService = new NotificationService()
export default notificationService
