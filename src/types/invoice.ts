// Invoice-related types for validation and processing

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: Date | string;
  dueDate: Date | string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

export interface InvoiceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface InvoiceCalculation {
  subtotal: number;
  tax: number;
  total: number;
}

// Additional types for validation
export interface ContractFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectTitle: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  deliveryDate?: string;
  totalAmount: number | string;
  depositPercentage: string;
  paymentTerms: string;
  deliverables: string[];
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: Date | string;
  dueDate: Date | string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export class InvoiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'InvoiceError';
  }
}

export class ContractError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ContractError';
  }
}