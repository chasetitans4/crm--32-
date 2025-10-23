import axios from "axios"

// Environment variables - Security: Server-side only, never expose via NEXT_PUBLIC_
const BOLDSIGN_API_KEY = process.env.BOLDSIGN_API_KEY || ""
const BOLDSIGN_BASE_URL = "https://api.boldsign.com/v1"
const BOLDSIGN_WEBHOOK_URL = process.env.BOLDSIGN_WEBHOOK_URL || ""

// Validate configuration
if (!BOLDSIGN_API_KEY) {
  // Silent: BoldSign API key not configured. E-signature functionality will be limited.
}

export interface Signer {
  name: string
  emailAddress: string
  signerType: "signer" | "approver" | "cc" | "viewer"
  signerOrder: number
  enableEmailOTP?: boolean
  enableSMSOTP?: boolean
  phoneNumber?: string
  deliveryMode: "email" | "sms" | "both"
  locale?: string
  redirectUrl?: string
  formFields?: FormField[]
}

export interface FormField {
  id: string
  type: "signature" | "initial" | "date" | "textbox" | "checkbox" | "radiobutton" | "dropdown" | "image"
  pageNumber: number
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  isRequired: boolean
  placeholder?: string
  value?: string
  options?: string[]
  fontSize?: number
  fontColor?: string
  backgroundColor?: string
}

export interface DocumentInfo {
  documentId: string
  documentName: string
  documentOrder: number
}

export interface SignatureRequestOptions {
  title: string
  message?: string
  signers: Signer[]
  documentInfo: DocumentInfo[]
  expiryDays?: number
  reminderSettings?: {
    enableAutoReminder: boolean
    reminderDays: number
    reminderCount: number
  }
  brandId?: string
  labels?: string[]
  disableEmails?: boolean
  disableSMS?: boolean
  enablePrintAndSign?: boolean
  enableReassign?: boolean
  allowReassign?: boolean
  hideDocumentId?: boolean
  enableSigningOrder?: boolean
  useTextTags?: boolean
  sendLinkValidTill?: string
  onBehalfOf?: string
}

export interface SignatureRequest {
  id: string
  title: string
  status: "draft" | "inProgress" | "completed" | "declined" | "expired" | "cancelled" | "revoked"
  createdDate: string
  expiryDate?: string
  completedDate?: string
  signers: SignerInfo[]
  documentDetails: DocumentDetail[]
  auditTrail?: AuditEvent[]
}

export interface SignerInfo {
  signerEmail: string
  signerName: string
  signerType: string
  signerOrder: number
  status: "awaiting" | "completed" | "declined" | "expired" | "reassigned"
  signedDate?: string
  declineReason?: string
  deliveryMode: string
  language?: string
}

export interface DocumentDetail {
  documentId: string
  documentName: string
  documentOrder: number
  documentSize: number
  documentPages: number
}

export interface AuditEvent {
  eventType: string
  eventDate: string
  eventBy: string
  eventDescription: string
  ipAddress?: string
  userAgent?: string
}

export interface WebhookEvent {
  eventType: string
  documentId: string
  signerEmail?: string
  signerName?: string
  eventTime: string
  status?: string
  declineReason?: string
  reassignReason?: string
}

export interface UploadedDocument {
  documentId: string
  documentName: string
  documentSize: number
  documentPages: number
}

class BoldSignService {
  private apiKey: string
  private baseURL: string
  private isConfigured: boolean

  constructor() {
    this.apiKey = BOLDSIGN_API_KEY
    this.baseURL = BOLDSIGN_BASE_URL
    this.isConfigured = !!this.apiKey

    if (!this.isConfigured) {
      // Silent: BoldSign service not properly configured. Please check your API key.
    }
  }

  private getHeaders() {
    return {
      "X-API-KEY": this.apiKey,
      "Content-Type": "application/json",
    }
  }

  private getMultipartHeaders() {
    return {
      "X-API-KEY": this.apiKey,
    }
  }

  // Check if service is properly configured
  public isReady(): boolean {
    return this.isConfigured
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false
    }

    try {
      const response = await axios.get(`${this.baseURL}/account`, {
        headers: this.getHeaders(),
        timeout: 10000,
      })
      return response.status === 200
    } catch (error) {
      // Silent: BoldSign connection test failed
      return false
    }
  }

  // Upload document
  async uploadDocument(file: File, fileName?: string): Promise<UploadedDocument> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (fileName) {
        formData.append("fileName", fileName)
      }

      const response = await axios.post(`${this.baseURL}/document/upload`, formData, {
        headers: this.getMultipartHeaders(),
        timeout: 60000, // 60 seconds for file upload
      })

      return {
        documentId: response.data.documentId,
        documentName: response.data.documentName,
        documentSize: response.data.documentSize,
        documentPages: response.data.documentPages,
      }
    } catch (error: any) {
      // Silent: BoldSign document upload error
      throw new Error(`Failed to upload document: ${error.response?.data?.message || error.message}`)
    }
  }

  // Create signature request
  async createSignatureRequest(options: SignatureRequestOptions): Promise<SignatureRequest> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const payload = {
        title: options.title,
        message: options.message || "",
        signers: options.signers,
        files: options.documentInfo,
        expiryDays: options.expiryDays || 30,
        reminderSettings: options.reminderSettings || {
          enableAutoReminder: true,
          reminderDays: 3,
          reminderCount: 3,
        },
        brandId: options.brandId,
        labels: options.labels || [],
        disableEmails: options.disableEmails || false,
        disableSMS: options.disableSMS || false,
        enablePrintAndSign: options.enablePrintAndSign || false,
        enableReassign: options.enableReassign || true,
        allowReassign: options.allowReassign || true,
        hideDocumentId: options.hideDocumentId || false,
        enableSigningOrder: options.enableSigningOrder || true,
        useTextTags: options.useTextTags || false,
        sendLinkValidTill: options.sendLinkValidTill,
        onBehalfOf: options.onBehalfOf,
      }

      const response = await axios.post(`${this.baseURL}/document/send`, payload, {
        headers: this.getHeaders(),
        timeout: 30000,
      })

      return {
        id: response.data.documentId,
        title: options.title,
        status: "inProgress",
        createdDate: new Date().toISOString(),
        expiryDate: options.expiryDays
          ? new Date(Date.now() + options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        signers: options.signers.map((signer) => ({
          signerEmail: signer.emailAddress,
          signerName: signer.name,
          signerType: signer.signerType,
          signerOrder: signer.signerOrder,
          status: "awaiting",
          deliveryMode: signer.deliveryMode,
          language: signer.locale,
        })),
        documentDetails: options.documentInfo.map((doc) => ({
          documentId: doc.documentId,
          documentName: doc.documentName,
          documentOrder: doc.documentOrder,
          documentSize: 0, // Will be populated by API
          documentPages: 0, // Will be populated by API
        })),
      }
    } catch (error: any) {
      // Silent: BoldSign create signature request error
      throw new Error(`Failed to create signature request: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get signature request details
  async getSignatureRequest(documentId: string): Promise<SignatureRequest> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const response = await axios.get(`${this.baseURL}/document/${documentId}`, {
        headers: this.getHeaders(),
        timeout: 15000,
      })

      const data = response.data
      return {
        id: data.documentId,
        title: data.title,
        status: data.status,
        createdDate: data.createdDate,
        expiryDate: data.expiryDate,
        completedDate: data.completedDate,
        signers: data.signers || [],
        documentDetails: data.documentDetails || [],
        auditTrail: data.auditTrail || [],
      }
    } catch (error: any) {
      // Silent: BoldSign get signature request error
      throw new Error(`Failed to get signature request: ${error.response?.data?.message || error.message}`)
    }
  }

  // Cancel signature request
  async cancelSignatureRequest(documentId: string, reason?: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const payload = {
        reason: reason || "Cancelled by sender",
      }

      await axios.post(`${this.baseURL}/document/${documentId}/cancel`, payload, {
        headers: this.getHeaders(),
        timeout: 15000,
      })
    } catch (error: any) {
      // Silent: BoldSign cancel signature request error
      throw new Error(`Failed to cancel signature request: ${error.response?.data?.message || error.message}`)
    }
  }

  // Send reminder
  async sendReminder(documentId: string, signerEmail: string, message?: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const payload = {
        signerEmail,
        message: message || "Please sign the document at your earliest convenience.",
      }

      await axios.post(`${this.baseURL}/document/${documentId}/reminder`, payload, {
        headers: this.getHeaders(),
        timeout: 15000,
      })
    } catch (error: any) {
      // Silent: BoldSign send reminder error
      throw new Error(`Failed to send reminder: ${error.response?.data?.message || error.message}`)
    }
  }

  // Download signed document
  async downloadDocument(documentId: string, format: "pdf" | "zip" = "pdf"): Promise<Blob> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const response = await axios.get(`${this.baseURL}/document/${documentId}/download`, {
        headers: this.getHeaders(),
        params: { format },
        responseType: "blob",
        timeout: 60000,
      })

      return response.data
    } catch (error: any) {
      // Silent: BoldSign download document error
      throw new Error(`Failed to download document: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get audit trail
  async getAuditTrail(documentId: string): Promise<AuditEvent[]> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const response = await axios.get(`${this.baseURL}/document/${documentId}/auditTrail`, {
        headers: this.getHeaders(),
        timeout: 15000,
      })

      return response.data.auditTrail || []
    } catch (error: any) {
      // Silent: BoldSign get audit trail error
      throw new Error(`Failed to get audit trail: ${error.response?.data?.message || error.message}`)
    }
  }

  // List signature requests
  async listSignatureRequests(
    page = 1,
    pageSize = 25,
    status?: string,
    searchText?: string,
  ): Promise<{ requests: SignatureRequest[]; totalCount: number }> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const params: any = {
        page,
        pageSize,
      }
      if (status) params.status = status
      if (searchText) params.searchText = searchText

      const response = await axios.get(`${this.baseURL}/document/list`, {
        headers: this.getHeaders(),
        params,
        timeout: 15000,
      })

      return {
        requests: response.data.result || [],
        totalCount: response.data.totalCount || 0,
      }
    } catch (error: any) {
      // Silent: BoldSign list signature requests error
      throw new Error(`Failed to list signature requests: ${error.response?.data?.message || error.message}`)
    }
  }

  // Resend signature request
  async resendSignatureRequest(documentId: string, signerEmail: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const payload = {
        signerEmail,
      }

      await axios.post(`${this.baseURL}/document/${documentId}/resend`, payload, {
        headers: this.getHeaders(),
        timeout: 15000,
      })
    } catch (error: any) {
      // Silent: BoldSign resend signature request error
      throw new Error(`Failed to resend signature request: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get signing URL (for embedded signing)
  async getSigningUrl(documentId: string, signerEmail: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const response = await axios.get(`${this.baseURL}/document/${documentId}/signingUrl`, {
        headers: this.getHeaders(),
        params: { signerEmail },
        timeout: 15000,
      })

      return response.data.signingUrl
    } catch (error: any) {
      // Silent: BoldSign get signing URL error
      throw new Error(`Failed to get signing URL: ${error.response?.data?.message || error.message}`)
    }
  }

  // Process webhook event
  processWebhookEvent(event: any): {
    documentId: string
    eventType: string
    signerEmail?: string
    status: string
    timestamp: string
  } | null {
    try {
      if (!event || !event.documentId || !event.eventType) {
        return null
      }

      return {
        documentId: event.documentId,
        eventType: event.eventType,
        signerEmail: event.signerEmail,
        status: event.status || event.documentStatus,
        timestamp: event.eventTime || new Date().toISOString(),
      }
    } catch (error) {
      // Silent: Error processing BoldSign webhook event
      return null
    }
  }

  // Get account information
  async getAccountInfo(): Promise<any> {
    if (!this.isConfigured) {
      return null
    }

    try {
      const response = await axios.get(`${this.baseURL}/account`, {
        headers: this.getHeaders(),
        timeout: 15000,
      })
      return response.data
    } catch (error: any) {
      // Silent: BoldSign get account info error
      throw new Error(`Failed to get account info: ${error.response?.data?.message || error.message}`)
    }
  }

  // Create template
  async createTemplate(title: string, documentId: string, signers: Signer[]): Promise<{ templateId: string }> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const payload = {
        title,
        documentId,
        signers,
      }

      const response = await axios.post(`${this.baseURL}/template/create`, payload, {
        headers: this.getHeaders(),
        timeout: 30000,
      })

      return {
        templateId: response.data.templateId,
      }
    } catch (error: any) {
      // Silent: BoldSign create template error
      throw new Error(`Failed to create template: ${error.response?.data?.message || error.message}`)
    }
  }

  // Send document using template
  async sendUsingTemplate(
    templateId: string,
    title: string,
    signers: Omit<Signer, "formFields">[],
  ): Promise<SignatureRequest> {
    if (!this.isConfigured) {
      throw new Error("BoldSign service is not properly configured")
    }

    try {
      const payload = {
        templateId,
        title,
        signers,
      }

      const response = await axios.post(`${this.baseURL}/template/send`, payload, {
        headers: this.getHeaders(),
        timeout: 30000,
      })

      return {
        id: response.data.documentId,
        title,
        status: "inProgress",
        createdDate: new Date().toISOString(),
        signers: signers.map((signer) => ({
          signerEmail: signer.emailAddress,
          signerName: signer.name,
          signerType: signer.signerType,
          signerOrder: signer.signerOrder,
          status: "awaiting",
          deliveryMode: signer.deliveryMode,
          language: signer.locale,
        })),
        documentDetails: [],
      }
    } catch (error: any) {
      // Silent: BoldSign send using template error
      throw new Error(`Failed to send using template: ${error.response?.data?.message || error.message}`)
    }
  }
}

// Enhanced error types
export class BoldSignError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "BoldSignError"
  }
}

export class BoldSignConfigurationError extends BoldSignError {
  constructor(message: string) {
    super(message, 0, "CONFIGURATION_ERROR")
    this.name = "BoldSignConfigurationError"
  }
}

export class BoldSignValidationError extends BoldSignError {
  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR", { field })
    this.name = "BoldSignValidationError"
  }
}

export const boldSignService = new BoldSignService()
export default boldSignService
