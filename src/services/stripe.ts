// This is a mock Stripe service for demonstration purposes
// In a real application, you would use the actual Stripe SDK

export interface StripePaymentIntent {
  id: string
  amount: number
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded"
  client_secret: string
  created: number
  currency: string
  customer?: string
  description?: string
  metadata?: Record<string, string>
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  phone?: string
  metadata?: Record<string, string>
}

export interface StripeInvoice {
  id: string
  customer: string
  amount_due: number
  amount_paid: number
  currency: string
  status: "draft" | "open" | "paid" | "uncollectible" | "void"
  due_date?: number
  number?: string
  description?: string
  metadata?: Record<string, string>
}

class StripeService {
  private apiKey: string
  private mockData: {
    customers: StripeCustomer[]
    paymentIntents: StripePaymentIntent[]
    invoices: StripeInvoice[]
  }

  constructor(apiKey: string) {
    this.apiKey = apiKey

    // Mock data for demonstration
    this.mockData = {
      customers: [],
      paymentIntents: [],
      invoices: [],
    }
  }

  // Customer methods
  async createCustomer(params: {
    email: string
    name?: string
    phone?: string
    metadata?: Record<string, string>
  }): Promise<StripeCustomer> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const customer: StripeCustomer = {
      id: `cus_${Math.random().toString(36).substring(2, 10)}`,
      email: params.email,
      name: params.name,
      phone: params.phone,
      metadata: params.metadata,
    }

    this.mockData.customers.push(customer)

    return customer
  }

  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    return this.mockData.customers.find((c) => c.id === customerId) || null
  }

  // Payment Intent methods
  async createPaymentIntent(params: {
    amount: number
    currency: string
    customer?: string
    description?: string
    metadata?: Record<string, string>
  }): Promise<StripePaymentIntent> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const paymentIntent: StripePaymentIntent = {
      id: `pi_${Math.random().toString(36).substring(2, 10)}`,
      amount: params.amount,
      status: "requires_payment_method",
      client_secret: `pi_${Math.random().toString(36).substring(2, 10)}_secret_${Math.random().toString(36).substring(2, 10)}`,
      created: Date.now(),
      currency: params.currency,
      customer: params.customer,
      description: params.description,
      metadata: params.metadata,
    }

    this.mockData.paymentIntents.push(paymentIntent)

    return paymentIntent
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 700))

    const paymentIntent = this.mockData.paymentIntents.find((pi) => pi.id === paymentIntentId)

    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`)
    }

    // Simulate successful payment
    paymentIntent.status = "succeeded"

    return paymentIntent
  }

  // Invoice methods
  async createInvoice(params: {
    customer: string
    amount: number
    currency: string
    description?: string
    due_date?: number
    metadata?: Record<string, string>
  }): Promise<StripeInvoice> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600))

    const invoice: StripeInvoice = {
      id: `in_${Math.random().toString(36).substring(2, 10)}`,
      customer: params.customer,
      amount_due: params.amount,
      amount_paid: 0,
      currency: params.currency,
      status: "draft",
      due_date: params.due_date,
      number: `INV-${Math.floor(Math.random() * 10000)}`,
      description: params.description,
      metadata: params.metadata,
    }

    this.mockData.invoices.push(invoice)

    return invoice
  }

  async finalizeInvoice(invoiceId: string): Promise<StripeInvoice> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 400))

    const invoice = this.mockData.invoices.find((inv) => inv.id === invoiceId)

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`)
    }

    invoice.status = "open"

    return invoice
  }

  async payInvoice(invoiceId: string): Promise<StripeInvoice> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    const invoice = this.mockData.invoices.find((inv) => inv.id === invoiceId)

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`)
    }

    invoice.status = "paid"
    invoice.amount_paid = invoice.amount_due

    return invoice
  }
}

// Create a singleton instance
const stripe = new StripeService(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key")

export default stripe
