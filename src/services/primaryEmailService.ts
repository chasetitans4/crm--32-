// Create a new primary email service that uses Mailjet as the default
import { mailjetService } from "./mailjet"

export interface EmailServiceConfig {
  provider: "mailjet" | "outlook" | "smtp"
  apiKey?: string
  secretKey?: string
  fromEmail: string
  fromName: string
}

export class PrimaryEmailService {
  private config: EmailServiceConfig | null = null
  private activeService: any = null

  async configure(config: EmailServiceConfig): Promise<void> {
    this.config = config

    switch (config.provider) {
      case "mailjet":
        this.activeService = mailjetService
        break
      case "outlook":
        // Configure Outlook service
        break
      case "smtp":
        // Configure SMTP service
        break
      default:
        throw new Error("Unsupported email provider")
    }

    // Initialize the service with configuration
    if (this.activeService && this.activeService.configure) {
      await this.activeService.configure(config)
    }
  }

  async sendEmail(options: any): Promise<any> {
    if (!this.activeService) {
      throw new Error("Email service not configured")
    }

    return await this.activeService.sendEmail(options)
  }

  async getTemplates(): Promise<any[]> {
    if (!this.activeService) {
      throw new Error("Email service not configured")
    }

    return await this.activeService.getTemplates()
  }

  async getAnalytics(): Promise<any> {
    if (!this.activeService) {
      throw new Error("Email service not configured")
    }

    return await this.activeService.getAnalytics()
  }
}

// Create singleton instance with Mailjet as default
export const primaryEmailService = new PrimaryEmailService()

// Auto-configure with Mailjet
primaryEmailService.configure({
  provider: "mailjet",
  // Security: Server-side only credentials
      apiKey: process.env.MAILJET_API_KEY || "",
      secretKey: process.env.MAILJET_SECRET_KEY || "",
      fromEmail: process.env.MAILJET_FROM_EMAIL || "noreply@company.com",
      fromName: process.env.MAILJET_FROM_NAME || "CRM System",
})

export default primaryEmailService
