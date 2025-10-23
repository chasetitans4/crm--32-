"use client"

import { z } from 'zod';
import { contractSchema, invoiceSchema, type Contract, type Invoice } from '../schemas/contractInvoiceSchemas';

// Enhanced validation utilities for contract and invoice systems

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Business validation rules
const BUSINESS_RULES = {
  MIN_PROJECT_DURATION_DAYS: 1,
  MAX_PROJECT_DURATION_DAYS: 365 * 2, // 2 years
  MIN_HOURLY_RATE: 25,
  MAX_HOURLY_RATE: 500,
  MAX_LATE_FEE_PERCENTAGE: 25,
  MIN_MILESTONE_AMOUNT: 100,
  MAX_INVOICE_AMOUNT: 1000000,
  OVERDUE_THRESHOLD_DAYS: 30
};

export class EnhancedValidator {
  /**
   * Validate contract with schema and business rules
   */
  static validateContract(data: unknown): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Schema validation
      contractSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
      }
    }

    // Business rule validation
    if (data) {
      this.validateContractBusinessRules(data, result);
    }

    return result;
  }

  /**
   * Validate invoice with schema and business rules
   */
  static validateInvoice(data: unknown): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Schema validation
      invoiceSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
      }
    }

    // Business rule validation
    if (data) {
      this.validateInvoiceBusinessRules(data, result);
    }

    return result;
  }

  /**
   * Validate individual field for real-time validation
   */
  static validateField(fieldPath: string, value: unknown, schema: z.ZodSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => ({
          field: fieldPath,
          message: err.message,
          code: err.code
        }));
      }
    }

    return result;
  }

  /**
   * Contract business rules validation
   */
  private static validateContractBusinessRules(contract: Partial<Contract>, result: ValidationResult): void {
    // Timeline validation - commented out as timeline property doesn't exist on projectDetails
    // if (contract.projectDetails?.timeline) {
    //   const { startDate, endDate, estimatedHours } = contract.projectDetails.timeline;
    //   
    //   if (startDate && endDate) {
    //     const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    //     
    //     if (durationDays < BUSINESS_RULES.MIN_PROJECT_DURATION_DAYS) {
    //       result.warnings.push({
    //         field: 'projectDetails.timeline',
    //         message: 'Project duration is very short. Consider if this is realistic.',
    //         code: 'SHORT_DURATION'
    //       });
    //     }
    //     
    //     if (durationDays > BUSINESS_RULES.MAX_PROJECT_DURATION_DAYS) {
    //       result.errors.push({
    //         field: 'projectDetails.timeline.endDate',
    //         message: 'Project duration exceeds maximum allowed period of 2 years.',
    //         code: 'DURATION_TOO_LONG'
    //       });
    //       result.isValid = false;
    //     }
    //   }

    //   // Hourly rate validation
    //   if (estimatedHours && contract.totalAmount) {
    //     const hourlyRate = contract.totalAmount / estimatedHours;
    //     
    //     if (hourlyRate < BUSINESS_RULES.MIN_HOURLY_RATE) {
    //       result.warnings.push({
    //         field: 'totalAmount',
    //         message: `Hourly rate ($${hourlyRate.toFixed(2)}) is below recommended minimum ($${BUSINESS_RULES.MIN_HOURLY_RATE}).`,
    //         code: 'LOW_HOURLY_RATE'
    //       });
    //     }
    //     
    //     if (hourlyRate > BUSINESS_RULES.MAX_HOURLY_RATE) {
    //       result.warnings.push({
    //         field: 'totalAmount',
    //         message: `Hourly rate ($${hourlyRate.toFixed(2)}) is unusually high. Please verify.`,
    //         code: 'HIGH_HOURLY_RATE'
    //       });
    //     }
    //   }
    // }

    // Financial terms validation - commented out as these properties don't exist on current contract type
    // if (contract.financialTerms) {
    //   const { milestones, lateFeePercentage } = contract.financialTerms;
    //   
    //   // Milestone amount validation
    //   if (milestones) {
    //     milestones.forEach((milestone, index) => {
    //       if (milestone.amount < BUSINESS_RULES.MIN_MILESTONE_AMOUNT) {
    //         result.warnings.push({
    //           field: `financialTerms.milestones.${index}.amount`,
    //           message: `Milestone amount ($${milestone.amount}) is below recommended minimum ($${BUSINESS_RULES.MIN_MILESTONE_AMOUNT}).`,
    //           code: 'LOW_MILESTONE_AMOUNT'
    //         });
    //       }
    //     });
    //   }
    //   
    //   // Late fee validation
    //   if (lateFeePercentage && lateFeePercentage > BUSINESS_RULES.MAX_LATE_FEE_PERCENTAGE) {
    //     result.errors.push({
    //       field: 'financialTerms.lateFeePercentage',
    //       message: `Late fee percentage (${lateFeePercentage}%) exceeds maximum allowed (${BUSINESS_RULES.MAX_LATE_FEE_PERCENTAGE}%).`,
    //       code: 'EXCESSIVE_LATE_FEE'
    //     });
    //     result.isValid = false;
    //   }
    // }
  }

  /**
   * Invoice business rules validation
   */
  private static validateInvoiceBusinessRules(invoice: Partial<Invoice>, result: ValidationResult): void {
    // Amount validation
    if (invoice.totalAmount) {
      if (invoice.totalAmount > BUSINESS_RULES.MAX_INVOICE_AMOUNT) {
        result.warnings.push({
          field: 'totalAmount',
          message: `Invoice amount ($${invoice.totalAmount.toLocaleString()}) is unusually high. Please verify.`,
          code: 'HIGH_INVOICE_AMOUNT'
        });
      }
    }

    // Due date validation
    if (invoice.dueDate) {
      const today = new Date();
      const dueDateObj = invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate);
      const daysUntilDue = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        const daysOverdue = Math.abs(daysUntilDue);
        if (daysOverdue > BUSINESS_RULES.OVERDUE_THRESHOLD_DAYS) {
          result.warnings.push({
            field: 'dueDate',
            message: `Invoice is ${daysOverdue} days overdue. Consider collection actions.`,
            code: 'SEVERELY_OVERDUE'
          });
        }
      }
    }

    // Item validation
    if (invoice.items) {
      invoice.items.forEach((item, index) => {
        if (item.quantity && item.quantity > 1000) {
          result.warnings.push({
            field: `items.${index}.quantity`,
            message: `Item quantity (${item.quantity}) is unusually high. Please verify.`,
            code: 'HIGH_QUANTITY'
          });
        }
        
        if (item.price && item.price > 10000) {
          result.warnings.push({
            field: `items.${index}.price`,
            message: `Unit price ($${item.price.toLocaleString()}) is unusually high. Please verify.`,
            code: 'HIGH_UNIT_PRICE'
          });
        }
      });
    }
  }
}

// Utility functions
export const validateBusinessEmail = (email: string): boolean => {
  const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !businessDomains.includes(domain) : false;
};

export const validateTaxId = (taxId: string, businessType: string): boolean => {
  if (!taxId) return true; // Optional field
  
  switch (businessType) {
    case 'corporation':
      return /^\d{2}-\d{7}$/.test(taxId); // EIN format
    case 'individual':
      return /^\d{3}-\d{2}-\d{4}$/.test(taxId); // SSN format
    default:
      return /^\d{2}-\d{7}$/.test(taxId); // Default to EIN
  }
};

export const validateCurrency = (currency: string): boolean => {
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  return supportedCurrencies.includes(currency.toUpperCase());
};

export const calculateInvoiceTotal = (items: { quantity?: number; unitPrice?: number; price?: number; taxRate?: number; discount?: number }[]): { subtotal: number; taxAmount: number; totalAmount: number } => {
  let subtotal = 0;
  let taxAmount = 0;
  
  items.forEach(item => {
    const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
    const discountAmount = itemTotal * (item.discount || 0);
    const discountedAmount = itemTotal - discountAmount;
    
    subtotal += discountedAmount;
    taxAmount += discountedAmount * (item.taxRate || 0);
  });
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round((subtotal + taxAmount) * 100) / 100
  };
};
