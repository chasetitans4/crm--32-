import { mailjetService, type EmailOptions, type EmailRecipient } from "./mailjet"
import { databaseService } from "./database"

export interface CRMEmailOptions {
  clientId?: string
  projectId?: string
  taskId?: string
  invoiceId?: string
  templateName?: string
  customVariables?: Record<string, unknown>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
  category: "client" | "project" | "invoice" | "marketing" | "system"
}

class CRMEmailService {
  private defaultSender = {
    // Security: Server-side only email configuration
    email: process.env.SENDER_EMAIL || "noreply@yourcrm.com",
    name: process.env.SENDER_NAME || "CRM System",
  }

  // Send welcome email to new client
  async sendWelcomeEmail(clientId: string, customVariables?: Record<string, unknown>): Promise<unknown> {
    try {
      const client = await databaseService.getClientById(clientId)
      if (!client) throw new Error("Client not found")

      const variables = {
        client_name: client.name,
        company_name: this.defaultSender.name,
        account_manager: "Your Account Manager",
        ...customVariables,
      }

      return await mailjetService.sendEmail({
        from: this.defaultSender,
        to: [{ email: client.email, name: client.name, variables }],
        subject: `Welcome to ${this.defaultSender.name}!`,
        templateId: await this.getTemplateId("Welcome Client"),
        variables,
        customId: `welcome_${clientId}`,
        eventPayload: JSON.stringify({ type: "welcome", clientId }),
      })
    } catch (error) {
      // Silent error handling: Failed to send welcome email
      throw error
    }
  }

  // Send project update email
  async sendProjectUpdate(
    clientId: string,
    projectId: string,
    updateMessage: string,
    customVariables?: Record<string, any>,
  ): Promise<any> {
    try {
      const client = await databaseService.getClientById(clientId)
      if (!client) throw new Error("Client not found")

      const variables = {
        client_name: client.name,
        project_name: `Project #${projectId}`,
        project_status: "In Progress",
        progress_percentage: "75",
        update_message: updateMessage,
        next_milestone: "Design Review",
        account_manager: "Your Account Manager",
        ...customVariables,
      }

      return await mailjetService.sendEmail({
        from: this.defaultSender,
        to: [{ email: client.email, name: client.name, variables }],
        subject: `Project Update: ${variables.project_name}`,
        templateId: await this.getTemplateId("Project Update"),
        variables,
        customId: `project_update_${projectId}`,
        eventPayload: JSON.stringify({ type: "project_update", clientId, projectId }),
      })
    } catch (error) {
      // Silent error handling: Failed to send project update
      throw error
    }
  }

  // Send invoice email
  async sendInvoiceEmail(
    clientId: string,
    invoiceNumber: string,
    amount: string,
    dueDate: string,
    paymentLink?: string,
  ): Promise<any> {
    try {
      const client = await databaseService.getClientById(clientId)
      if (!client) throw new Error("Client not found")

      const variables = {
        client_name: client.name,
        company_name: this.defaultSender.name,
        invoice_number: invoiceNumber,
        invoice_amount: amount,
        due_date: dueDate,
        payment_link: paymentLink || "#",
      }

      return await mailjetService.sendEmail({
        from: this.defaultSender,
        to: [{ email: client.email, name: client.name, variables }],
        subject: `Invoice ${invoiceNumber} from ${this.defaultSender.name}`,
        templateId: await this.getTemplateId("Invoice Notification"),
        variables,
        customId: `invoice_${invoiceNumber}`,
        eventPayload: JSON.stringify({ type: "invoice", clientId, invoiceNumber }),
      })
    } catch (error) {
      // Silent error handling: Failed to send invoice email
      throw error
    }
  }

  // Send meeting reminder
  async sendMeetingReminder(
    clientId: string,
    meetingTitle: string,
    meetingDate: string,
    meetingTime: string,
    meetingLocation: string,
    agenda?: string,
  ): Promise<any> {
    try {
      const client = await databaseService.getClientById(clientId)
      if (!client) throw new Error("Client not found")

      const variables = {
        client_name: client.name,
        meeting_title: meetingTitle,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        meeting_location: meetingLocation,
        meeting_agenda: agenda || "We will discuss your project progress and next steps.",
        account_manager: "Your Account Manager",
      }

      return await mailjetService.sendEmail({
        from: this.defaultSender,
        to: [{ email: client.email, name: client.name, variables }],
        subject: `Meeting Reminder: ${meetingTitle}`,
        templateId: await this.getTemplateId("Meeting Reminder"),
        variables,
        customId: `meeting_${clientId}_${Date.now()}`,
        eventPayload: JSON.stringify({ type: "meeting_reminder", clientId }),
      })
    } catch (error) {
      // Silent error handling: Failed to send meeting reminder
      throw error
    }
  }

  // Send custom email
  async sendCustomEmail(
    recipients: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    attachments?: any[],
    options?: CRMEmailOptions,
  ): Promise<any> {
    try {
      return await mailjetService.sendEmail({
        from: this.defaultSender,
        to: recipients,
        subject,
        htmlPart: htmlContent,
        textPart: textContent,
        attachments,
        customId: options?.clientId ? `custom_${options.clientId}_${Date.now()}` : undefined,
        eventPayload: options ? JSON.stringify(options) : undefined,
      })
    } catch (error) {
      // Silent error handling: Failed to send custom email
      throw error
    }
  }

  // Send bulk marketing email
  async sendMarketingCampaign(
    clientIds: string[],
    subject: string,
    htmlContent: string,
    campaignName: string,
  ): Promise<any> {
    try {
      const clients = await Promise.all(clientIds.map((id) => databaseService.getClientById(id)))

      const validClients = clients.filter((client) => client && client.email)

      const emails: EmailOptions[] = validClients.map((client) => ({
        from: this.defaultSender,
        to: [{ email: client!.email, name: client!.name }],
        subject,
        htmlPart: htmlContent,
        customId: `campaign_${campaignName}_${client!.id}`,
        eventPayload: JSON.stringify({
          type: "marketing_campaign",
          campaignName,
          clientId: client!.id,
        }),
      }))

      return await mailjetService.sendBulkEmail(emails)
    } catch (error) {
      // Silent error handling: Failed to send marketing campaign
      throw error
    }
  }

  // Get email statistics
  async getEmailStats(customId?: string): Promise<any> {
    try {
      const stats = await mailjetService.getEmailStats()
      // Filter by customId if provided
      if (customId) {
        return stats.filter(stat => stat.eventPayload && JSON.parse(stat.eventPayload).customId === customId)
      }
      return stats
    } catch (error) {
      // Silent error handling: Failed to get email stats
      throw error
    }
  }

  // Get client email history
  async getClientEmailHistory(clientId: string): Promise<any[]> {
    try {
      const stats = await mailjetService.getEmailStats()
      return stats.filter((stat) => stat.eventPayload && JSON.parse(stat.eventPayload).clientId === clientId)
    } catch (error) {
      // Silent error handling: Failed to get client email history
      return []
    }
  }

  // Initialize CRM email templates
  async initializeTemplates(): Promise<void> {
    try {
      await mailjetService.initializeCRMTemplates()
    } catch (error) {
      // Silent error handling: Failed to initialize templates
    }
  }

  // Helper method to get template ID by name
  private async getTemplateId(templateName: string): Promise<number | undefined> {
    try {
      const templates = await mailjetService.getTemplates()
      const template = templates.find((t) => t.name === templateName)
      return template?.id
    } catch (error) {
      // Silent error handling: Failed to get template ID
      return undefined
    }
  }

  // Email automation workflows
  async setupEmailAutomation(): Promise<void> {
    // Silent logging: Email automation workflows would be set up here
  }
}

export const crmEmailService = new CRMEmailService()
export default crmEmailService
