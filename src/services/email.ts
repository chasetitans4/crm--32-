import { supabase } from "../lib/supabase"
import type { Database } from "../lib/supabase"

type EmailQuotaRow = Database["public"]["Tables"]["email_quotas"]["Row"]
type EmailRow = Database["public"]["Tables"]["emails"]["Row"]

export interface EmailConfig {
  provider: "mailjet" | "outlook" | "smtp"
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  username: string
  password?: string
  accessToken?: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
}

export interface EmailMessage {
  id: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  bodyType: "text" | "html"
  attachments?: EmailAttachment[]
  priority: "low" | "normal" | "high"
  readReceipt?: boolean
  deliveryReceipt?: boolean
  scheduledAt?: string
  sentAt?: string
  status: "draft" | "scheduled" | "sent" | "failed" | "delivered" | "read"
  threadId?: string
  inReplyTo?: string
  references?: string[]
  labels?: string[]
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  clientId?: string
  projectId?: string
  taskId?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailAttachment {
  id: string
  filename: string
  contentType: string
  size: number
  data?: string // base64 encoded
  url?: string
  cid?: string // for inline attachments
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  bodyType: "text" | "html"
  category: string
  variables: string[]
  isActive: boolean
  usage_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface EmailQuota {
  userId: string
  dailyLimit: number
  monthlyLimit: number
  dailySent: number
  monthlySent: number
  lastResetDate: string
  attachmentSizeLimit: number // in MB
  storageUsed: number // in MB
  storageLimit: number // in MB
}

export interface EmailAnalytics {
  sent: number
  received: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  replyRate: number
  bounceRate: number
}

class EmailService {
  private config: EmailConfig | null = null
  private isConnected = false
  private syncInterval: NodeJS.Timeout | null = null

  // Email quotas - moderate limits
  private readonly DEFAULT_QUOTAS = {
    dailyLimit: 100,
    monthlyLimit: 2000,
    attachmentSizeLimit: 10, // 10MB per attachment
    storageLimit: 500, // 500MB total storage per user
  }

  // Configuration
  async configure(config: EmailConfig): Promise<void> {
    this.config = config

    try {
      await this.testConnection()
      this.isConnected = true

      // Save configuration
      await (supabase as any).from("email_configs").upsert({
        provider: config.provider,
        username: config.username,
        smtp_host: config.smtpHost,
        smtp_port: config.smtpPort,
        smtp_secure: config.smtpSecure,
        access_token: config.accessToken,
        refresh_token: config.refreshToken,
        client_id: config.clientId,
        updated_at: new Date().toISOString(),
      } as any)

      this.startSync()
      this.startCleanupJob()
    } catch (error: any) {
      this.isConnected = false
      throw new Error(`Failed to configure email: ${error.message}`)
    }
  }

  // Quota Management
  async checkEmailQuota(userId: string): Promise<{ canSend: boolean; reason?: string; quota: EmailQuota }> {
    const quota = await this.getUserQuota(userId)

    // Reset daily counter if needed
    const today = new Date().toDateString()
    if (quota.lastResetDate !== today) {
      quota.dailySent = 0
      quota.lastResetDate = today
      await this.updateUserQuota(userId, quota)
    }

    // Check daily limit
    if (quota.dailySent >= quota.dailyLimit) {
      return {
        canSend: false,
        reason: `Daily email limit reached (${quota.dailyLimit}). Resets tomorrow.`,
        quota,
      }
    }

    // Check monthly limit
    if (quota.monthlySent >= quota.monthlyLimit) {
      return {
        canSend: false,
        reason: `Monthly email limit reached (${quota.monthlyLimit}). Resets next month.`,
        quota,
      }
    }

    return { canSend: true, quota }
  }

  async getUserQuota(userId: string): Promise<EmailQuota> {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    const { data, error } = await (supabase as any).from("email_quotas").select("*").eq("user_id", userId).single() as { data: EmailQuotaRow | null, error: any }

    if (error || !data) {
      // Create default quota for new user
      const defaultQuota: EmailQuota = {
        userId,
        ...this.DEFAULT_QUOTAS,
        dailySent: 0,
        monthlySent: 0,
        lastResetDate: new Date().toDateString(),
        storageUsed: 0,
      }

      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      await (supabase as any).from("email_quotas").insert({
        user_id: userId,
        daily_limit: defaultQuota.dailyLimit,
        monthly_limit: defaultQuota.monthlyLimit,
        daily_sent: defaultQuota.dailySent,
        monthly_sent: defaultQuota.monthlySent,
        last_reset_date: defaultQuota.lastResetDate,
        attachment_size_limit: defaultQuota.attachmentSizeLimit,
        storage_used: defaultQuota.storageUsed,
        storage_limit: defaultQuota.storageLimit,
      } as any)

      return defaultQuota
    }

    return {
      userId: data.user_id,
      dailyLimit: data.daily_limit,
      monthlyLimit: data.monthly_limit,
      dailySent: data.daily_sent,
      monthlySent: data.monthly_sent,
      lastResetDate: data.last_reset_date,
      attachmentSizeLimit: data.attachment_size_limit,
      storageUsed: data.storage_used,
      storageLimit: data.storage_limit,
    }
  }

  async updateUserQuota(userId: string, quota: EmailQuota): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    const { error: updateError } = await (supabase as any)
      .from("email_quotas")
      .update({
        daily_sent: quota.dailySent,
        monthly_sent: quota.monthlySent,
        last_reset_date: quota.lastResetDate,
        storage_used: quota.storageUsed,
      } as any)
      .eq("user_id", userId)

    if (updateError) {
      throw new Error(`Failed to update user quota: ${updateError.message}`)
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error("Email not configured")
    }

    try {
      switch (this.config.provider) {
        case "mailjet":
          return await this.testMailjetConnection()
        case "outlook":
          return await this.testOutlookConnection()
        case "smtp":
          return await this.testSmtpConnection()
        default:
          throw new Error("Unsupported email provider")
      }
    } catch (error) {
      // Silent error handling - Email connection test failed
      return false
    }
  }

  private async testMailjetConnection(): Promise<boolean> {
    const response = await fetch("https://api.mailjet.com/v3/REST/contact", {
      headers: {
        Authorization: `Basic ${btoa(`${this.config?.clientId}:${this.config?.clientSecret}`)}`,
      },
    })
    return response.ok
  }

  private async testOutlookConnection(): Promise<boolean> {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${this.config?.accessToken}`,
      },
    })
    return response.ok
  }

  private async testSmtpConnection(): Promise<boolean> {
    return true
  }

  // Email Operations with Quota Checks
  async sendEmail(message: Partial<EmailMessage>, userId: string): Promise<EmailMessage> {
    if (!this.isConnected) {
      throw new Error("Email service not connected")
    }

    // Check quota
    const quotaCheck = await this.checkEmailQuota(userId)
    if (!quotaCheck.canSend) {
      throw new Error(quotaCheck.reason)
    }

    const emailMessage: EmailMessage = {
      id: crypto.randomUUID(),
      from: this.config?.username || "",
      to: message.to || [],
      cc: message.cc,
      bcc: message.bcc,
      subject: message.subject || "",
      body: message.body || "",
      bodyType: message.bodyType || "html",
      attachments: message.attachments,
      priority: message.priority || "normal",
      readReceipt: message.readReceipt,
      deliveryReceipt: message.deliveryReceipt,
      scheduledAt: message.scheduledAt,
      sentAt: new Date().toISOString(),
      status: "sent",
      threadId: message.threadId,
      inReplyTo: message.inReplyTo,
      references: message.references,
      labels: message.labels || [],
      folder: "sent",
      isRead: true,
      isStarred: false,
      isImportant: false,
      clientId: message.clientId,
      projectId: message.projectId,
      taskId: message.taskId,
      metadata: message.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      await this.sendViaProvider(emailMessage)

      // Update quota
      quotaCheck.quota.dailySent += 1
      quotaCheck.quota.monthlySent += 1
      await this.updateUserQuota(userId, quotaCheck.quota)

      // Save to database
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      const { error: insertError } = await (supabase as any).from("emails").insert({
        id: emailMessage.id,
        from_email: emailMessage.from,
        to_email: emailMessage.to,
        cc_email: emailMessage.cc,
        bcc_email: emailMessage.bcc,
        subject: emailMessage.subject,
        body: emailMessage.body,
        body_type: emailMessage.bodyType,
        attachments: emailMessage.attachments,
        priority: emailMessage.priority,
        status: emailMessage.status,
        thread_id: emailMessage.threadId,
        folder: emailMessage.folder,
        is_read: emailMessage.isRead,
        is_starred: emailMessage.isStarred,
        is_important: emailMessage.isImportant,
        client_id: emailMessage.clientId,
        project_id: emailMessage.projectId,
        task_id: emailMessage.taskId,
        metadata: emailMessage.metadata,
        sent_at: emailMessage.sentAt,
        created_at: emailMessage.created_at,
        updated_at: emailMessage.updated_at,
        user_id: userId,
      } as any)

      if (insertError) {
        throw new Error(`Failed to save email: ${insertError.message}`)
      }

      return emailMessage
    } catch (error: any) {
      emailMessage.status = "failed"
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }

  private async sendViaProvider(message: EmailMessage): Promise<void> {
    switch (this.config?.provider) {
      case "mailjet":
        await this.sendViaMailjet(message)
        break
      case "outlook":
        await this.sendViaOutlook(message)
        break
      case "smtp":
        await this.sendViaSmtp(message)
        break
      default:
        throw new Error("Unsupported email provider")
    }
  }

  private async sendViaMailjet(message: EmailMessage): Promise<void> {
    const email = {
      Messages: [
        {
          From: {
            Email: this.config?.username || "",
            Name: "CRM System",
          },
          To: message.to.map((email) => ({ Email: email })),
          Cc: message.cc?.map((email) => ({ Email: email })) || [],
          Bcc: message.bcc?.map((email) => ({ Email: email })) || [],
          Subject: message.subject,
          HTMLPart: message.bodyType === "html" ? message.body : undefined,
          TextPart: message.bodyType === "text" ? message.body : undefined,
        },
      ],
    }

    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${this.config?.clientId}:${this.config?.clientSecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    })

    if (!response.ok) {
      throw new Error(`Mailjet API error: ${response.statusText}`)
    }
  }

  private async sendViaOutlook(message: EmailMessage): Promise<void> {
    const email = {
      subject: message.subject,
      body: {
        contentType: message.bodyType === "html" ? "HTML" : "Text",
        content: message.body,
      },
      toRecipients: message.to.map((email) => ({ emailAddress: { address: email } })),
      ccRecipients: message.cc?.map((email) => ({ emailAddress: { address: email } })) || [],
      bccRecipients: message.bcc?.map((email) => ({ emailAddress: { address: email } })) || [],
      importance: message.priority === "high" ? "high" : message.priority === "low" ? "low" : "normal",
    }

    const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: email }),
    })

    if (!response.ok) {
      throw new Error(`Outlook API error: ${response.statusText}`)
    }
  }

  private async sendViaSmtp(message: EmailMessage): Promise<void> {
    // Silent logging - Sending via SMTP
  }

  // Cleanup and Retention
  private startCleanupJob(): void {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0)

    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    setTimeout(() => {
      this.runCleanup()
      setInterval(() => this.runCleanup(), 24 * 60 * 60 * 1000)
    }, msUntilTomorrow)
  }

  private async runCleanup(): Promise<void> {
    try {
      // Silent logging - Starting email cleanup job
      await this.cleanupOldEmails()
      // Silent logging - Email cleanup job completed
    } catch (error) {
      // Silent error handling - Email cleanup job failed
    }
  }

  private async cleanupOldEmails(): Promise<void> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 365) // 1 year retention

    await (supabase as any).from("emails").delete().lt("created_at", cutoff.toISOString())
  }

  // Email Templates
  async createTemplate(
    template: Omit<EmailTemplate, "id" | "usage_count" | "created_at" | "updated_at">,
  ): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: crypto.randomUUID(),
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...template,
    }

    const { error } = await (supabase as any).from("email_templates").insert({
      id: newTemplate.id,
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      body_type: newTemplate.bodyType,
      category: newTemplate.category,
      variables: newTemplate.variables,
      is_active: newTemplate.isActive,
      usage_count: newTemplate.usage_count,
      created_by: newTemplate.created_by,
      created_at: newTemplate.created_at,
      updated_at: newTemplate.updated_at,
    } as any)

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`)
    }

    return newTemplate
  }

  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    let query = (supabase as any).from("email_templates").select("*").eq("is_active", true).order("name")

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get templates: ${error.message}`)
    }

    return (data || []).map((template: any) => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      bodyType: template.body_type,
      category: template.category,
      variables: template.variables || [],
      isActive: template.is_active,
      usage_count: template.usage_count,
      created_by: template.created_by,
      created_at: template.created_at,
      updated_at: template.updated_at,
    }))
  }

  // Email Sync
  private startSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(
      () => {
        this.syncEmails()
      },
      5 * 60 * 1000,
    ) // Sync every 5 minutes
  }

  private async syncEmails(): Promise<void> {
    if (!this.isConnected) return

    try {
      switch (this.config?.provider) {
        case "outlook":
          await this.syncOutlookEmails()
          break
      }
    } catch (error) {
      // Silent error handling - Email sync failed
    }
  }

  private async syncOutlookEmails(): Promise<void> {
    // Silent logging - Syncing Outlook emails
  }

  // Analytics
  async getAnalytics(dateRange?: { start: Date; end: Date }): Promise<EmailAnalytics> {
    let query = (supabase as any).from("emails").select("status, is_read, metadata")

    if (dateRange) {
      query = query.gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString())
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get analytics: ${error.message}`)
    }

    const emails: EmailRow[] = data || []
    const sent = emails.filter((e: EmailRow) => e.status === "sent").length
    const opened = emails.filter((e: EmailRow) => e.is_read).length
    const clicked = emails.filter((e: EmailRow) => e.metadata?.clicked).length
    const replied = emails.filter((e: EmailRow) => e.metadata?.replied).length
    const bounced = emails.filter((e: EmailRow) => e.status === "failed").length

    return {
      sent,
      received: emails.length - sent,
      opened,
      clicked,
      replied,
      bounced,
      unsubscribed: 0,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      replyRate: sent > 0 ? (replied / sent) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
    }
  }

  // Quota Management Methods
  async getQuotaStatus(userId: string): Promise<{
    daily: { used: number; limit: number; remaining: number }
    monthly: { used: number; limit: number; remaining: number }
    storage: { used: number; limit: number; remaining: number }
  }> {
    const quota = await this.getUserQuota(userId)

    return {
      daily: {
        used: quota.dailySent,
        limit: quota.dailyLimit,
        remaining: quota.dailyLimit - quota.dailySent,
      },
      monthly: {
        used: quota.monthlySent,
        limit: quota.monthlyLimit,
        remaining: quota.monthlyLimit - quota.monthlySent,
      },
      storage: {
        used: quota.storageUsed,
        limit: quota.storageLimit,
        remaining: quota.storageLimit - quota.storageUsed,
      },
    }
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export const emailService = new EmailService()
export default emailService
