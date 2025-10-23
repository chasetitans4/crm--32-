"use client"

import { type Invoice, type Item } from '../schemas/contractInvoiceSchemas';
import { EnhancedValidator, calculateInvoiceTotal } from '../utils/enhancedValidation';

export interface InvoiceNumberConfig {
  prefix: string;
  yearFormat: 'YY' | 'YYYY';
  sequenceLength: number;
  separator: string;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  type: 'gentle' | 'firm' | 'final';
  scheduledDate: Date;
  sentDate?: Date;
  status: 'pending' | 'sent' | 'failed';
  emailTemplate: string;
}

export interface AgingReport {
  current: Invoice[];
  days1to30: Invoice[];
  days31to60: Invoice[];
  days61to90: Invoice[];
  over90Days: Invoice[];
  totals: {
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    over90Days: number;
    grandTotal: number;
  };
}

export interface InvoiceMetrics {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  averagePaymentTime: number;
  paymentRate: number;
}

export class EnhancedInvoiceService {
  private static instance: EnhancedInvoiceService;
  private invoices: Map<string, Invoice> = new Map();
  private reminders: Map<string, PaymentReminder> = new Map();
  private numberConfig: InvoiceNumberConfig = {
    prefix: 'INV',
    yearFormat: 'YYYY',
    sequenceLength: 4,
    separator: '-'
  };

  static getInstance(): EnhancedInvoiceService {
    if (!this.instance) {
      this.instance = new EnhancedInvoiceService();
    }
    return this.instance;
  }

  /**
   * Generate professional invoice number
   */
  generateInvoiceNumber(date: Date = new Date()): string {
    const year = date.getFullYear();
    const yearStr = this.numberConfig.yearFormat === 'YY' 
      ? year.toString().slice(-2)
      : year.toString();
    
    // Get next sequence number for the year
    const yearInvoices = Array.from(this.invoices.values())
      .filter(inv => {
        const issueDate = inv.issueDate instanceof Date ? inv.issueDate : new Date(inv.issueDate);
        return issueDate.getFullYear() === year;
      })
      .length;
    
    const sequence = (yearInvoices + 1).toString().padStart(this.numberConfig.sequenceLength, '0');
    
    return `${this.numberConfig.prefix}${this.numberConfig.separator}${yearStr}${this.numberConfig.separator}${sequence}`;
  }

  /**
   * Calculate precise invoice totals with proper rounding
   */
  calculateInvoiceTotals(items: Item[]): {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  } {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    
    items.forEach(item => {
      const lineTotal = item.quantity * item.price;
      // Note: Item schema doesn't include discount or taxRate, using defaults
      const itemDiscount = 0; // lineTotal * (item.discount || 0);
      const discountedAmount = lineTotal - itemDiscount;
      const itemTax = 0; // discountedAmount * (item.taxRate || 0);
      
      subtotal += lineTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });
    
    // Round to 2 decimal places
    subtotal = Math.round(subtotal * 100) / 100;
    discountAmount = Math.round(discountAmount * 100) / 100;
    taxAmount = Math.round(taxAmount * 100) / 100;
    const totalAmount = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
    
    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount
    };
  }

  /**
   * Validate and create invoice
   */
  async createInvoice(invoiceData: Partial<Invoice>): Promise<{ success: boolean; invoice?: Invoice; errors?: string[] }> {
    try {
      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = this.generateInvoiceNumber();
      }
      
      // Note: Invoice schema doesn't have financialDetails or createdAt properties
      // Totals are calculated from items array
      
      // Validate
      const validation = EnhancedValidator.validateInvoice(invoiceData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors.map(e => e.message)
        };
      }
      
      const invoice = invoiceData as Invoice;
      
      // Store invoice
      this.invoices.set(invoice.id || invoice.invoiceNumber, invoice);
      
      // Schedule payment reminders
      await this.schedulePaymentReminders(invoice);
      
      return {
        success: true,
        invoice
      };
    } catch (error) {
      // Failed to create invoice - error handled silently
      return {
        success: false,
        errors: ['Failed to create invoice']
      };
    }
  }

  /**
   * Update invoice status and handle payment
   */
  async updateInvoiceStatus(invoiceId: string, status: Invoice['status'], paidDate?: Date): Promise<boolean> {
    try {
      const invoice = this.invoices.get(invoiceId);
      if (!invoice) return false;
      
      invoice.status = status;
      // Note: Invoice schema doesn't have updatedAt property
      
      if (status === 'Paid' && paidDate) {
        // Note: Invoice schema doesn't have dates.paidDate, consider adding if needed
        // For now, we'll just update the status
        
        // Cancel pending reminders
        await this.cancelPaymentReminders(invoiceId);
      }
      
      this.invoices.set(invoiceId, invoice);
      return true;
    } catch (error) {
      // Failed to update invoice status - error handled silently
      return false;
    }
  }

  /**
   * Schedule payment reminders
   */
  async schedulePaymentReminders(invoice: Invoice): Promise<void> {
    if (invoice.status === 'Paid' || !invoice.dueDate) return;
    
    const dueDate = invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate);
    const reminders: PaymentReminder[] = [
      {
        id: `${invoice.id}_gentle`,
        invoiceId: invoice.id || invoice.invoiceNumber,
        type: 'gentle',
        scheduledDate: new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before
        status: 'pending',
        emailTemplate: 'gentle_reminder'
      },
      {
        id: `${invoice.id}_firm`,
        invoiceId: invoice.id || invoice.invoiceNumber,
        type: 'firm',
        scheduledDate: new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after
        status: 'pending',
        emailTemplate: 'firm_reminder'
      },
      {
        id: `${invoice.id}_final`,
        invoiceId: invoice.id || invoice.invoiceNumber,
        type: 'final',
        scheduledDate: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days after
        status: 'pending',
        emailTemplate: 'final_notice'
      }
    ];
    
    reminders.forEach(reminder => {
      this.reminders.set(reminder.id, reminder);
    });
  }

  /**
   * Cancel payment reminders
   */
  async cancelPaymentReminders(invoiceId: string): Promise<void> {
    const remindersToCancel = Array.from(this.reminders.values())
      .filter(reminder => reminder.invoiceId === invoiceId && reminder.status === 'pending');
    
    remindersToCancel.forEach(reminder => {
      this.reminders.delete(reminder.id);
    });
  }

  /**
   * Get overdue invoices
   */
  getOverdueInvoices(): Invoice[] {
    const today = new Date();
    
    return Array.from(this.invoices.values())
      .filter(invoice => 
          invoice.status !== 'Paid' && 
        invoice.dueDate &&
        (invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate)) < today
      )
      .sort((a, b) => {
        const aDue = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
        const bDue = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
        const aDays = aDue ? Math.floor((today.getTime() - aDue.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const bDays = bDue ? Math.floor((today.getTime() - bDue.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return bDays - aDays; // Most overdue first
      });
  }

  /**
   * Generate aging report
   */
  generateAgingReport(): AgingReport {
    const today = new Date();
    const invoices = Array.from(this.invoices.values())
      .filter(invoice => invoice.status !== 'Paid');
    
    const report: AgingReport = {
      current: [],
      days1to30: [],
      days31to60: [],
      days61to90: [],
      over90Days: [],
      totals: {
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        over90Days: 0,
        grandTotal: 0
      }
    };
    
    invoices.forEach(invoice => {
      if (!invoice.dueDate) return;
      
      const dueDateObj = invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));
      const amount = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      if (daysOverdue <= 0) {
        report.current.push(invoice);
        report.totals.current += amount;
      } else if (daysOverdue <= 30) {
        report.days1to30.push(invoice);
        report.totals.days1to30 += amount;
      } else if (daysOverdue <= 60) {
        report.days31to60.push(invoice);
        report.totals.days31to60 += amount;
      } else if (daysOverdue <= 90) {
        report.days61to90.push(invoice);
        report.totals.days61to90 += amount;
      } else {
        report.over90Days.push(invoice);
        report.totals.over90Days += amount;
      }
      
      report.totals.grandTotal += amount;
    });
    
    return report;
  }

  /**
   * Get invoice metrics
   */
  getInvoiceMetrics(): InvoiceMetrics {
    const allInvoices = Array.from(this.invoices.values());
    const paidInvoices = allInvoices.filter(inv => inv.status === 'Paid');
    const overdueInvoices = this.getOverdueInvoices();
    
    const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0), 0);
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0), 0);
    
    // Calculate average payment time
    // Note: Invoice schema doesn't have paidDate, using dueDate as approximation
    const paymentTimes = paidInvoices
      .filter(inv => inv.issueDate && inv.dueDate)
      .map(inv => {
        const issueDate = inv.issueDate instanceof Date ? inv.issueDate : new Date(inv.issueDate);
        const dueDate = inv.dueDate instanceof Date ? inv.dueDate : new Date(inv.dueDate);
        return Math.floor((dueDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      });
    
    const averagePaymentTime = paymentTimes.length > 0 
      ? paymentTimes.reduce((sum, days) => sum + days, 0) / paymentTimes.length
      : 0;
    
    return {
      totalInvoices: allInvoices.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      paidAmount: Math.round(paidAmount * 100) / 100,
      outstandingAmount: Math.round((totalAmount - paidAmount) * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      averagePaymentTime: Math.round(averagePaymentTime * 10) / 10,
      paymentRate: allInvoices.length > 0 ? Math.round((paidInvoices.length / allInvoices.length) * 100) : 0
    };
  }

  /**
   * Get pending reminders
   */
  getPendingReminders(): PaymentReminder[] {
    const today = new Date();
    
    return Array.from(this.reminders.values())
      .filter(reminder => 
        reminder.status === 'pending' && 
        reminder.scheduledDate <= today
      )
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(reminderId: string): Promise<boolean> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) return false;
    
    reminder.status = 'sent';
    reminder.sentDate = new Date();
    
    this.reminders.set(reminderId, reminder);
    return true;
  }

  /**
   * Configure invoice numbering
   */
  configureInvoiceNumbering(config: Partial<InvoiceNumberConfig>): void {
    this.numberConfig = { ...this.numberConfig, ...config };
  }

  /**
   * Export invoices to CSV
   */
  exportToCSV(invoices?: Invoice[]): string {
    const data = invoices || Array.from(this.invoices.values());
    
    const headers = [
      'Invoice Number',
      'Client Name',
      'Issue Date',
      'Due Date',
      'Amount',
      'Status',
      'Days Overdue'
    ];
    
    const rows = data.map(invoice => {
      const daysOverdue = invoice.dueDate
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      
      return [
        invoice.invoiceNumber,
        invoice.clientName || '',
        invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '',
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '',
        invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2) || '0.00',
        invoice.status,
        daysOverdue.toString()
      ];
    });
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}
