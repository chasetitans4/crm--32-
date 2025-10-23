import { supabase } from "../lib/supabase"
import type { Database } from "../lib/supabase"
import * as crypto from "crypto"

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]

// Email encryption configuration
interface EmailEncryptionConfig {
  enabled: boolean
  algorithm: string
  keySize: number
  encryptAttachments: boolean
  encryptSubject: boolean
  encryptMetadata: boolean
}

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
  // Encryption fields
  isEncrypted?: boolean
  encryptionKeyId?: string
  encryptedFields?: string[]
}

export interface EmailAttachment {
  id: string
  filename: string
  contentType: string
  size: number
  data?: string // base64 encoded
  url?: string
  cid?: string // for inline attachments
  // Encryption fields
  isEncrypted?: boolean
  encryptionKeyId?: string
  originalSize?: number
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

export interface EmailAutomation {
  id: string
  name: string
  trigger: {
    type: "schedule" | "event" | "condition"
    schedule?: string // cron expression
    event?: string
    condition?: Record<string, any>
  }
  actions: EmailAutomationAction[]
  isActive: boolean
  lastRun?: string
  nextRun?: string
  runCount: number
  created_at: string
  updated_at: string
}

export interface EmailAutomationAction {
  type: "send_email" | "add_label" | "move_folder" | "create_task" | "update_client"
  templateId?: string
  recipients?: string[]
  data?: Record<string, any>
}

export interface EmailSignature {
  id: string
  name: string
  content: string
  isDefault: boolean
  created_at: string
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

export interface EmailRetentionPolicy {
  sentEmailRetentionDays: number
  receivedEmailRetentionDays: number
  attachmentRetentionDays: number
  deletedEmailRetentionDays: number
  maxAttachmentSize: number // in MB
  compressAttachments: boolean
  autoDeleteOldEmails: boolean
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

  // Email encryption configuration
  private readonly ENCRYPTION_CONFIG: EmailEncryptionConfig = {
    enabled: process.env.NODE_ENV === 'production',
    algorithm: 'aes-256-gcm',
    keySize: 32,
    encryptAttachments: true,
    encryptSubject: false, // Keep subject unencrypted for searchability
    encryptMetadata: true,
  }

  // Retention policies
  private readonly DEFAULT_RETENTION: EmailRetentionPolicy = {
    sentEmailRetentionDays: 365, // 1 year
    receivedEmailRetentionDays: 365, // 1 year
    attachmentRetentionDays: 180, // 6 months
    deletedEmailRetentionDays: 30, // 30 days in trash
    maxAttachmentSize: 10, // 10MB
    compressAttachments: true,
    autoDeleteOldEmails: true,
  }

  /**
   * Generate encryption key for email data
   */
  private generateEncryptionKey(): Buffer {
    return crypto.randomBytes(this.ENCRYPTION_CONFIG.keySize)
  }

  /**
   * Encrypt sensitive email data
   */
  private encryptData(data: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
    if (!this.ENCRYPTION_CONFIG.enabled) {
      return { encrypted: data, iv: '', tag: '' }
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.ENCRYPTION_CONFIG.algorithm, key, iv)
    ;(cipher as any).setAAD(Buffer.from('email-encryption'))

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = (cipher as any).getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  /**
   * Decrypt email data
   */
  private decryptData(encryptedData: string, key: Buffer, iv: string, tag: string): string {
    if (!this.ENCRYPTION_CONFIG.enabled || !iv || !tag) {
      return encryptedData
    }

    try {
      const decipher = crypto.createDecipheriv(this.ENCRYPTION_CONFIG.algorithm, key, Buffer.from(iv, 'hex'))
      ;(decipher as any).setAAD(Buffer.from('email-encryption'))
      ;(decipher as any).setAuthTag(Buffer.from(tag, 'hex'))

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      console.error('Failed to decrypt email data:', error)
      throw new Error('Email decryption failed')
    }
  }

  /**
   * Encrypt email message before storage
   */
  private async encryptEmailMessage(message: EmailMessage, userId: string): Promise<EmailMessage> {
    if (!this.ENCRYPTION_CONFIG.enabled) {
      return message
    }

    const encryptionKey = this.generateEncryptionKey()
    const keyId = crypto.randomUUID()
    
    // Store encryption key securely (in production, use a proper key management service)
    await this.storeEncryptionKey(keyId, encryptionKey, userId)

    const encryptedMessage = { ...message }
    const encryptedFields: string[] = []

    // Encrypt email body
    const bodyEncryption = this.encryptData(message.body, encryptionKey)
    encryptedMessage.body = JSON.stringify({
      encrypted: bodyEncryption.encrypted,
      iv: bodyEncryption.iv,
      tag: bodyEncryption.tag
    })
    encryptedFields.push('body')

    // Encrypt subject if configured
    if (this.ENCRYPTION_CONFIG.encryptSubject) {
      const subjectEncryption = this.encryptData(message.subject, encryptionKey)
      encryptedMessage.subject = JSON.stringify({
        encrypted: subjectEncryption.encrypted,
        iv: subjectEncryption.iv,
        tag: subjectEncryption.tag
      })
      encryptedFields.push('subject')
    }

    // Encrypt metadata if configured
    if (this.ENCRYPTION_CONFIG.encryptMetadata && message.metadata) {
      const metadataEncryption = this.encryptData(JSON.stringify(message.metadata), encryptionKey)
      encryptedMessage.metadata = {
        encrypted: metadataEncryption.encrypted,
        iv: metadataEncryption.iv,
        tag: metadataEncryption.tag
      }
      encryptedFields.push('metadata')
    }

    // Encrypt attachments if configured
    if (this.ENCRYPTION_CONFIG.encryptAttachments && message.attachments) {
      encryptedMessage.attachments = await Promise.all(
        message.attachments.map(async (attachment) => {
          if (attachment.data) {
            const attachmentEncryption = this.encryptData(attachment.data, encryptionKey)
            return {
              ...attachment,
              data: JSON.stringify({
                encrypted: attachmentEncryption.encrypted,
                iv: attachmentEncryption.iv,
                tag: attachmentEncryption.tag
              }),
              isEncrypted: true,
              encryptionKeyId: keyId,
              originalSize: attachment.size
            }
          }
          return attachment
        })
      )
      encryptedFields.push('attachments')
    }

    encryptedMessage.isEncrypted = true
    encryptedMessage.encryptionKeyId = keyId
    encryptedMessage.encryptedFields = encryptedFields

    return encryptedMessage
  }

  /**
   * Decrypt email message after retrieval
   */
  private async decryptEmailMessage(message: EmailMessage, userId: string): Promise<EmailMessage> {
    if (!message.isEncrypted || !message.encryptionKeyId) {
      return message
    }

    const encryptionKey = await this.getEncryptionKey(message.encryptionKeyId, userId)
    if (!encryptionKey) {
      throw new Error('Encryption key not found')
    }

    const decryptedMessage = { ...message }

    // Decrypt body
    if (message.encryptedFields?.includes('body')) {
      try {
        const bodyData = JSON.parse(message.body)
        decryptedMessage.body = this.decryptData(bodyData.encrypted, encryptionKey, bodyData.iv, bodyData.tag)
      } catch (error) {
        console.error('Failed to decrypt email body:', error)
      }
    }

    // Decrypt subject
    if (message.encryptedFields?.includes('subject')) {
      try {
        const subjectData = JSON.parse(message.subject)
        decryptedMessage.subject = this.decryptData(subjectData.encrypted, encryptionKey, subjectData.iv, subjectData.tag)
      } catch (error) {
        console.error('Failed to decrypt email subject:', error)
      }
    }

    // Decrypt metadata
    if (message.encryptedFields?.includes('metadata') && message.metadata) {
      try {
        const metadataStr = this.decryptData(
          (message.metadata as any).encrypted,
          encryptionKey,
          (message.metadata as any).iv,
          (message.metadata as any).tag
        )
        decryptedMessage.metadata = JSON.parse(metadataStr)
      } catch (error) {
        console.error('Failed to decrypt email metadata:', error)
      }
    }

    // Decrypt attachments
    if (message.encryptedFields?.includes('attachments') && message.attachments) {
      decryptedMessage.attachments = await Promise.all(
        message.attachments.map(async (attachment) => {
          if (attachment.isEncrypted && attachment.data) {
            try {
              const attachmentData = JSON.parse(attachment.data)
              return {
                ...attachment,
                data: this.decryptData(attachmentData.encrypted, encryptionKey, attachmentData.iv, attachmentData.tag),
                isEncrypted: false,
                size: attachment.originalSize || attachment.size
              }
            } catch (error) {
              console.error('Failed to decrypt attachment:', error)
              return attachment
            }
          }
          return attachment
        })
      )
    }

    return decryptedMessage
  }

  /**
   * Store encryption key securely
   */
  private async storeEncryptionKey(keyId: string, key: Buffer, userId: string): Promise<void> {
    // In production, use a proper key management service like AWS KMS, Azure Key Vault, etc.
    // For now, store in database with additional encryption
    // Security: Require strong encryption key in production
    const masterKey = process.env.EMAIL_MASTER_KEY || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('EMAIL_MASTER_KEY must be set in production environment')
      }
      return 'dev-only-master-key-not-for-production'
    })()
    const keyEncryption = this.encryptData(key.toString('hex'), Buffer.from(masterKey))

    await (supabase as any).from('email_encryption_keys').insert({
      id: keyId,
      user_id: userId,
      encrypted_key: keyEncryption.encrypted,
      key_iv: keyEncryption.iv,
      key_tag: keyEncryption.tag,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    })
  }

  /**
   * Retrieve encryption key
   */
  private async getEncryptionKey(keyId: string, userId: string): Promise<Buffer | null> {
    try {
      const { data: keyData } = await (supabase as any)
        .from('email_encryption_keys')
        .select('*')
        .eq('id', keyId)
        .eq('user_id', userId)
        .single()

      if (!keyData) {
        return null
      }

      // Security: Require strong encryption key in production
    const masterKey = process.env.EMAIL_MASTER_KEY || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('EMAIL_MASTER_KEY must be set in production environment')
      }
      return 'dev-only-master-key-not-for-production'
    })()
      const decryptedKey = this.decryptData(
        keyData.encrypted_key,
        Buffer.from(masterKey),
        keyData.key_iv,
        keyData.key_tag
      )

      return Buffer.from(decryptedKey, 'hex')
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error)
      return null
    }
  }

  /**
   * Validate email content for sensitive data
   */
  private containsSensitiveData(content: string): boolean {
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card numbers
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b(?:password|pwd|pass|secret|key|token)\s*[:=]\s*\S+/i, // Passwords/secrets
    ]

    return sensitivePatterns.some(pattern => pattern.test(content))
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

      // Start sync if not already running
      this.startSync()

      // Start cleanup job
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

    // Reset monthly counter if needed
    const currentMonth = new Date().getMonth()
    const lastResetMonth = new Date(quota.lastResetDate).getMonth()
    if (currentMonth !== lastResetMonth) {
      quota.monthlySent = 0
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
    const { data, error } = await (supabase as any).from("email_quotas").select("*").eq("user_id", userId).single()

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
    await (supabase as any)
      .from("email_quotas")
      .update({
        daily_sent: quota.dailySent,
        monthly_sent: quota.monthlySent,
        last_reset_date: quota.lastResetDate,
        storage_used: quota.storageUsed,
      } as any)
      .eq("user_id", userId)
  }

  // Attachment Management with Size Limits
  async validateAttachments(
    attachments: EmailAttachment[],
    userId: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    if (!attachments || attachments.length === 0) {
      return { valid: true }
    }

    const quota = await this.getUserQuota(userId)

    // Check individual attachment size
    for (const attachment of attachments) {
      const sizeInMB = attachment.size / (1024 * 1024)
      if (sizeInMB > quota.attachmentSizeLimit) {
        return {
          valid: false,
          reason: `Attachment "${attachment.filename}" exceeds size limit of ${quota.attachmentSizeLimit}MB`,
        }
      }
    }

    // Check total storage usage
    const totalAttachmentSize = attachments.reduce((sum, att) => sum + att.size, 0)
    const totalSizeInMB = totalAttachmentSize / (1024 * 1024)

    if (quota.storageUsed + totalSizeInMB > quota.storageLimit) {
      return {
        valid: false,
        reason: `Storage limit exceeded. Available: ${(quota.storageLimit - quota.storageUsed).toFixed(1)}MB, Required: ${totalSizeInMB.toFixed(1)}MB`,
      }
    }

    return { valid: true }
  }

  async compressAttachment(attachment: EmailAttachment): Promise<EmailAttachment> {
    // Simple compression simulation - in real implementation, use image compression libraries
    if (attachment.contentType.startsWith("image/") && attachment.size > 1024 * 1024) {
      return {
        ...attachment,
        size: Math.floor(attachment.size * 0.7), // Simulate 30% compression
        filename: attachment.filename.replace(/(\.[^.]+)$/, "_compressed$1"),
      }
    }
    return attachment
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error("Email not configured")
    }

    try {
      // Test connection based on provider
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
    // Test Mailjet API connection
    const response = await fetch("https://api.mailjet.com/v3/REST/contact", {
      headers: {
        Authorization: `Basic ${btoa(`${this.config?.clientId}:${this.config?.clientSecret}`)}`,
      },
    })
    return response.ok
  }

  private async testOutlookConnection(): Promise<boolean> {
    // Test Outlook API connection
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${this.config?.accessToken}`,
      },
    })
    return response.ok
  }

  private async testSmtpConnection(): Promise<boolean> {
    // For SMTP, we'll simulate a connection test
    // In a real implementation, you'd test the SMTP connection
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

    // Validate attachments
    if (message.attachments) {
      const attachmentValidation = await this.validateAttachments(message.attachments, userId)
      if (!attachmentValidation.valid) {
        throw new Error(attachmentValidation.reason)
      }

      // Compress attachments if enabled
      if (this.DEFAULT_RETENTION.compressAttachments) {
        message.attachments = await Promise.all(message.attachments.map((att) => this.compressAttachment(att)))
      }
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
      // Check if email contains sensitive data and encrypt if needed
      const hasSensitiveData = this.containsSensitiveData(emailMessage.body) || 
                              this.containsSensitiveData(emailMessage.subject)

      // Encrypt email if it contains sensitive data or encryption is enabled
      let finalEmailMessage = emailMessage
      if (this.ENCRYPTION_CONFIG.enabled || hasSensitiveData) {
        finalEmailMessage = await this.encryptEmailMessage(emailMessage, userId)
      }

      // Send email based on provider (use original unencrypted message for sending)
      await this.sendViaProvider(emailMessage)

      // Update quota
      quotaCheck.quota.dailySent += 1
      quotaCheck.quota.monthlySent += 1

      // Update storage usage
      if (finalEmailMessage.attachments) {
        const attachmentSize = finalEmailMessage.attachments.reduce((sum, att) => sum + att.size, 0)
        quotaCheck.quota.storageUsed += attachmentSize / (1024 * 1024)
      }

      await this.updateUserQuota(userId, quotaCheck.quota)

      // Save encrypted email to database
      await (supabase as any).from("emails").insert({
        id: finalEmailMessage.id,
        from_email: finalEmailMessage.from,
        to_email: finalEmailMessage.to,
        cc_email: finalEmailMessage.cc,
        bcc_email: finalEmailMessage.bcc,
        subject: finalEmailMessage.subject,
        body: finalEmailMessage.body,
        body_type: finalEmailMessage.bodyType,
        attachments: finalEmailMessage.attachments,
        priority: finalEmailMessage.priority,
        status: finalEmailMessage.status,
        thread_id: finalEmailMessage.threadId,
        folder: finalEmailMessage.folder,
        is_read: finalEmailMessage.isRead,
        is_starred: finalEmailMessage.isStarred,
        is_important: finalEmailMessage.isImportant,
        client_id: finalEmailMessage.clientId,
        project_id: finalEmailMessage.projectId,
        task_id: finalEmailMessage.taskId,
        metadata: finalEmailMessage.metadata,
        sent_at: finalEmailMessage.sentAt,
        created_at: finalEmailMessage.created_at,
        updated_at: finalEmailMessage.updated_at,
        user_id: userId,
        is_encrypted: finalEmailMessage.isEncrypted,
        encryption_key_id: finalEmailMessage.encryptionKeyId,
        encrypted_fields: finalEmailMessage.encryptedFields,
      } as any)

      return finalEmailMessage
    } catch (error: any) {
      emailMessage.status = "failed"
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }

  /**
   * Retrieve and decrypt email messages
   */
  async getEmails(userId: string, folder?: string): Promise<EmailMessage[]> {
    let query = (supabase as any).from("emails").select("*").eq("user_id", userId)
    
    if (folder) {
      query = query.eq("folder", folder)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to get emails: ${error.message}`)
    }

    // Decrypt emails if they are encrypted
    const emails = await Promise.all(
      (data || []).map(async (emailData: any) => {
        const email: EmailMessage = {
          id: emailData.id,
          from: emailData.from_email,
          to: emailData.to_email,
          cc: emailData.cc_email,
          bcc: emailData.bcc_email,
          subject: emailData.subject,
          body: emailData.body,
          bodyType: emailData.body_type,
          attachments: emailData.attachments,
          priority: emailData.priority,
          status: emailData.status,
          threadId: emailData.thread_id,
          folder: emailData.folder,
          isRead: emailData.is_read,
          isStarred: emailData.is_starred,
          isImportant: emailData.is_important,
          clientId: emailData.client_id,
          projectId: emailData.project_id,
          taskId: emailData.task_id,
          metadata: emailData.metadata,
          sentAt: emailData.sent_at,
          created_at: emailData.created_at,
          updated_at: emailData.updated_at,
          isEncrypted: emailData.is_encrypted,
          encryptionKeyId: emailData.encryption_key_id,
          encryptedFields: emailData.encrypted_fields,
        }

        // Decrypt if encrypted
        if (email.isEncrypted) {
          return await this.decryptEmailMessage(email, userId)
        }

        return email
      })
    )

    return emails
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
    const email = this.formatEmailForMailjet(message)

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
    const email = this.formatEmailForOutlook(message)

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
    // SMTP implementation would go here
    // For now, we'll simulate sending
    // Silent logging - Sending via SMTP
  }

  private formatEmailForMailjet(message: EmailMessage): any {
    return {
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
  }

  private formatEmailForOutlook(message: EmailMessage): any {
    return {
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
  }

  // Cleanup and Retention
  private startCleanupJob(): void {
    // Run cleanup daily at 2 AM
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0)

    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    setTimeout(() => {
      this.runCleanup()
      // Then run every 24 hours
      setInterval(() => this.runCleanup(), 24 * 60 * 60 * 1000)
    }, msUntilTomorrow)
  }

  private async runCleanup(): Promise<void> {
    try {
      // Silent logging - Starting email cleanup job

      if (this.DEFAULT_RETENTION.autoDeleteOldEmails) {
        await this.cleanupOldEmails()
        await this.cleanupOldAttachments()
        await this.cleanupDeletedEmails()
      }

      // Silent logging - Email cleanup job completed
    } catch (error) {
      // Silent error handling - Email cleanup job failed
    }
  }

  private async cleanupOldEmails(): Promise<void> {
    const sentCutoff = new Date()
    sentCutoff.setDate(sentCutoff.getDate() - this.DEFAULT_RETENTION.sentEmailRetentionDays)

    const receivedCutoff = new Date()
    receivedCutoff.setDate(receivedCutoff.getDate() - this.DEFAULT_RETENTION.receivedEmailRetentionDays)

    // Delete old sent emails
    await (supabase as any).from("emails").delete().eq("folder", "sent").lt("created_at", sentCutoff.toISOString())

    // Delete old received emails
    await (supabase as any).from("emails").delete().eq("folder", "inbox").lt("created_at", receivedCutoff.toISOString())
  }

  private async cleanupOldAttachments(): Promise<void> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - this.DEFAULT_RETENTION.attachmentRetentionDays)

    // Get emails with attachments older than retention period
    const { data: oldEmails } = await (supabase as any)
      .from("emails")
      .select("id, attachments, user_id")
      .not("attachments", "is", null)
      .lt("created_at", cutoff.toISOString())

    if (oldEmails) {
      for (const email of oldEmails as any[]) {
        // Calculate storage to be freed
        const attachmentSize = (email as any).attachments?.reduce((sum: number, att: any) => sum + att.size, 0) || 0
        const sizeInMB = attachmentSize / (1024 * 1024)

        // Remove attachments from email
        await (supabase as any).from("emails").update({ attachments: null } as any).eq("id", (email as any).id)

        // Update user storage quota
        if ((email as any).user_id) {
          const quota = await this.getUserQuota((email as any).user_id)
          quota.storageUsed = Math.max(0, quota.storageUsed - sizeInMB)
          await this.updateUserQuota((email as any).user_id, quota)
        }
      }
    }
  }

  private async cleanupDeletedEmails(): Promise<void> {
    if (!supabase) throw new Error('Database not initialized')
    
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - this.DEFAULT_RETENTION.deletedEmailRetentionDays)

    await supabase.from("emails").delete().eq("folder", "trash").lt("updated_at", cutoff.toISOString())
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

  async renderTemplate(
    templateId: string,
    variables: Record<string, string>,
  ): Promise<{ subject: string; body: string }> {
    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error("Template not found")
    }

    let subject = template.subject
    let body = template.body

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, "g"), value)
      body = body.replace(new RegExp(placeholder, "g"), value)
    })

    // Increment usage count
    await (supabase as any)
      .from("email_templates")
      .update({ usage_count: template.usage_count + 1 } as any)
      .eq("id", templateId)

    return { subject, body }
  }

  private async getTemplate(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await (supabase as any).from("email_templates").select("*").eq("id", id).single()

    if (error) return null

    return {
      id: (data as any).id,
      name: (data as any).name,
      subject: (data as any).subject,
      body: (data as any).body,
      bodyType: (data as any).body_type,
      category: (data as any).category,
      variables: (data as any).variables || [],
      isActive: (data as any).is_active,
      usage_count: (data as any).usage_count,
      created_by: (data as any).created_by,
      created_at: (data as any).created_at,
      updated_at: (data as any).updated_at,
    }
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
      // Sync based on provider
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
    // Outlook sync implementation
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

    const emails = data || []
    const sent = emails.filter((e: any) => e.status === "sent").length
    const opened = emails.filter((e: any) => e.is_read).length
    const clicked = emails.filter((e: any) => e.metadata?.clicked).length
    const replied = emails.filter((e: any) => e.metadata?.replied).length
    const bounced = emails.filter((e: any) => e.status === "failed").length

    return {
      sent,
      received: emails.length - sent,
      opened,
      clicked,
      replied,
      bounced,
      unsubscribed: 0, // Would need separate tracking
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
