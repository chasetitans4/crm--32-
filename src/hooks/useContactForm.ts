import { useState } from 'react'
import type { Contact } from './useLeadManagement'

export const useContactForm = () => {
  const [expandedContacts, setExpandedContacts] = useState<Record<string, boolean>>({})

  const toggleContactExpansion = (leadId: number | null, contactIndex: number) => {
    const key = leadId !== null ? `${leadId}-${contactIndex}` : contactIndex.toString()
    setExpandedContacts(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isContactExpanded = (leadId: number | null, contactIndex: number) => {
    const key = leadId !== null ? `${leadId}-${contactIndex}` : contactIndex.toString()
    return expandedContacts[key] || false
  }

  const validateContact = (contact: Contact) => {
    const errors: string[] = []
    
    if (!contact.name.trim()) {
      errors.push('Name is required')
    }
    
    if (!contact.email.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.push('Invalid email format')
    }
    
    if (contact.phone && !/^[\d\s\-\(\)\+]+$/.test(contact.phone)) {
      errors.push('Invalid phone format')
    }
    
    return errors
  }

  const validateContacts = (contacts: Contact[]) => {
    const allErrors: { [index: number]: string[] } = {}
    let hasErrors = false
    
    contacts.forEach((contact, index) => {
      const errors = validateContact(contact)
      if (errors.length > 0) {
        allErrors[index] = errors
        hasErrors = true
      }
    })
    
    // Check if there's at least one primary contact
    const hasPrimary = contacts.some(contact => contact.isPrimary)
    if (!hasPrimary && contacts.length > 0) {
      allErrors[0] = [...(allErrors[0] || []), 'At least one contact must be primary']
      hasErrors = true
    }
    
    return { errors: allErrors, hasErrors }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    
    // Return original if not a standard US number
    return phone
  }

  const createEmptyContact = (): Contact => ({
    name: '',
    email: '',
    phone: '',
    position: '',
    isPrimary: false
  })

  return {
    expandedContacts,
    setExpandedContacts,
    toggleContactExpansion,
    isContactExpanded,
    validateContact,
    validateContacts,
    formatPhoneNumber,
    createEmptyContact,
  }
}

export type { Contact }