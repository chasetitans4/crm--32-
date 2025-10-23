import { useState, useEffect, useMemo, useCallback } from 'react'
import { advancedEncryption } from '../utils/encryption'
import { secureStorage } from '../utils/secureStorage'

interface Contact {
  id?: number
  name: string
  email: string
  phone?: string
  position?: string
  isPrimary: boolean
}

interface Lead {
  id: number
  name: string
  company: string
  status: LeadStatus
  source: string
  notes: string
  createdAt: string
  lastContact: string
  value: number
  contacts: Contact[]
}

interface NewLead {
  name: string
  company: string
  status: LeadStatus
  source: string
  notes: string
  value: number
  contacts: Contact[]
}

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'

const mockLeads: Lead[] = [
  {
    id: 1,
    name: "ABC Corporation",
    company: "ABC Corporation",
    status: "NEW" as LeadStatus,
    source: "Website",
    notes: "Interested in credit repair services for their business",
    createdAt: "2023-05-10T10:30:00",
    lastContact: "2023-05-10T10:30:00",
    value: 5000,
    contacts: [
      {
        id: 1,
        name: "John Smith",
        email: "john.smith@abccorp.com",
        phone: "(555) 123-4567",
        position: "CEO",
        isPrimary: true,
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.j@abccorp.com",
        phone: "(555) 123-4568",
        position: "CFO",
        isPrimary: false,
      },
    ],
  },
  {
    id: 2,
    name: "Tech Solutions Inc",
    company: "Tech Solutions Inc",
    status: "CONTACTED" as LeadStatus,
    source: "Referral",
    notes: "Looking for comprehensive credit repair package",
    createdAt: "2023-05-08T14:20:00",
    lastContact: "2023-05-12T09:15:00",
    value: 7500,
    contacts: [
      {
        id: 3,
        name: "Mike Davis",
        email: "mike@techsolutions.com",
        phone: "(555) 987-6543",
        position: "Operations Manager",
        isPrimary: true,
      },
    ],
  },
  {
    id: 3,
    name: "Davis Consulting",
    company: "Davis Consulting",
    status: "QUALIFIED" as LeadStatus,
    source: "Social Media",
    notes: "Needs credit repair for business expansion",
    createdAt: "2023-05-05T11:45:00",
    lastContact: "2023-05-11T16:30:00",
    value: 10000,
    contacts: [
      {
        id: 4,
        name: "Robert Davis",
        email: "robert@davisconsulting.com",
        phone: "(555) 456-7890",
        position: "Founder & CEO",
        isPrimary: true,
      },
      {
        id: 5,
        name: "Lisa Chen",
        email: "lisa@davisconsulting.com",
        phone: "(555) 456-7891",
        position: "Business Development Manager",
        isPrimary: false,
      },
      {
        id: 6,
        name: "Tom Wilson",
        email: "tom@davisconsulting.com",
        phone: "(555) 456-7892",
        position: "Financial Advisor",
        isPrimary: false,
      },
    ],
  },
]

export const useLeadManagement = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{ status: LeadStatus[]; source: string[] }>({ status: [], source: [] })
  const [isAddingLead, setIsAddingLead] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [expandedLead, setExpandedLead] = useState<Lead | null>(null)
  const [expandedContacts, setExpandedContacts] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'cards'>('table')
  const [newLead, setNewLead] = useState<NewLead>({
    name: '',
    company: '',
    status: 'NEW' as LeadStatus,
    source: '',
    notes: '',
    value: 0,
    contacts: [{ name: '', email: '', phone: '', position: '', isPrimary: true }],
  })

  // Memoized filtered leads for better performance
  const filteredLeads = useMemo(() => {
    let filtered = leads

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower) ||
          lead.contacts.some((contact) =>
            contact.name.toLowerCase().includes(searchLower) ||
            contact.email.toLowerCase().includes(searchLower)
          )
      )
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((lead) => filters.status.includes(lead.status))
    }

    if (filters.source.length > 0) {
      filtered = filtered.filter((lead) => filters.source.includes(lead.source))
    }

    return filtered
  }, [leads, searchTerm, filters])

  // Helper functions for contact management
  const getPrimaryContact = useCallback((contacts: Contact[]) => {
    return contacts.find(contact => contact.isPrimary) || contacts[0]
  }, [])

  const getPrimaryContactIndex = useCallback((contacts: Contact[]) => {
    return contacts.findIndex(contact => contact.isPrimary)
  }, [])

  const updatePrimaryContactField = useCallback((leadId: number, field: keyof Contact, value: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      const primaryIndex = getPrimaryContactIndex(lead.contacts)
      if (primaryIndex !== -1) {
        updateContact(leadId, primaryIndex, field, value)
      }
    }
  }, [leads, getPrimaryContactIndex])

  // Lead management functions
  const addLead = useCallback(() => {
    if (!newLead.name || !newLead.contacts[0]?.email) {
      alert('Please fill in required fields')
      return
    }

    const lead: Lead = {
      ...newLead,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
    }

    // Encrypt sensitive lead data
    try {
      const sensitiveData = {
        name: lead.name,
        company: lead.company,
        contacts: lead.contacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position
        })),
        notes: lead.notes
      }
      const encryptedData = advancedEncryption.encrypt(JSON.stringify(sensitiveData))
      secureStorage.setItem(`lead_${lead.id}`, encryptedData)
      
      // Auto-clear after 10 minutes for security
      setTimeout(() => {
        secureStorage.removeItem(`lead_${lead.id}`)
      }, 10 * 60 * 1000)
    } catch (error) {
      console.error('Failed to encrypt lead data:', error)
    }

    setLeads([...leads, lead])
    setNewLead({
      name: '',
      company: '',
      status: 'NEW' as LeadStatus,
      source: '',
      notes: '',
      value: 0,
      contacts: [{ name: '', email: '', phone: '', position: '', isPrimary: true }],
    })
    setIsAddingLead(false)
  }, [newLead, leads])

  const handleLeadClick = useCallback((lead: Lead) => {
    setEditingLead(lead)
  }, [])

  const updateLead = useCallback(() => {
    if (!editingLead) return

    // Encrypt sensitive lead data
    try {
      const sensitiveData = {
        name: editingLead.name,
        company: editingLead.company,
        contacts: editingLead.contacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position
        })),
        notes: editingLead.notes
      }
      const encryptedData = advancedEncryption.encrypt(JSON.stringify(sensitiveData))
      secureStorage.setItem(`lead_${editingLead.id}`, encryptedData)
      
      // Auto-clear after 10 minutes for security
      setTimeout(() => {
        secureStorage.removeItem(`lead_${editingLead.id}`)
      }, 10 * 60 * 1000)
    } catch (error) {
      console.error('Failed to encrypt lead data:', error)
    }

    setLeads(leads.map(lead => lead.id === editingLead.id ? editingLead : lead))
    setEditingLead(null)
  }, [editingLead, leads])

  const deleteLead = useCallback((id: number) => {
    setLeads(leads.filter(lead => lead.id !== id))
  }, [leads])

  // Contact management functions
  const addContact = useCallback((leadId: number | null = null) => {
    const newContact: Contact = { name: '', email: '', phone: '', position: '', isPrimary: false }
    
    if (leadId === null) {
      setNewLead({
        ...newLead,
        contacts: [...newLead.contacts, newContact]
      })
    } else {
      setLeads(leads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, contacts: [...lead.contacts, newContact] }
        }
        return lead
      }))
    }
  }, [newLead, leads])

  const removeContact = useCallback((leadId: number | null, contactIndex: number) => {
    if (leadId === null) {
      setNewLead({
        ...newLead,
        contacts: newLead.contacts.filter((_, index) => index !== contactIndex)
      })
    } else {
      setLeads(leads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, contacts: lead.contacts.filter((_, index) => index !== contactIndex) }
        }
        return lead
      }))
    }
  }, [newLead, leads])

  const updateContact = useCallback((leadId: number | null, contactIndex: number, field: string, value: string) => {
    if (leadId === null) {
      setNewLead({
        ...newLead,
        contacts: newLead.contacts.map((contact, index) => {
          if (index === contactIndex) {
            return { ...contact, [field]: value }
          }
          return contact
        })
      })
    } else {
      setLeads(leads.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            contacts: lead.contacts.map((contact, index) => {
              if (index === contactIndex) {
                return { ...contact, [field]: value }
              }
              return contact
            })
          }
        }
        return lead
      }))
    }
  }, [newLead, leads])

  const setPrimaryContact = useCallback((leadId: number | null, contactIndex: number) => {
    if (leadId === null) {
      setNewLead({
        ...newLead,
        contacts: newLead.contacts.map((contact, index) => ({
          ...contact,
          isPrimary: index === contactIndex
        }))
      })
    } else {
      setLeads(leads.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            contacts: lead.contacts.map((contact, index) => ({
              ...contact,
              isPrimary: index === contactIndex
            }))
          }
        }
        return lead
      }))
    }
  }, [newLead, leads])

  // Helper function for updating new lead contacts
  const updateNewLeadContact = useCallback((contactIndex: number, field: string, value: string) => {
    updateContact(null, contactIndex, field, value)
  }, [updateContact])

  // Filter management functions
  const toggleStatusFilter = useCallback((status: LeadStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }, [])

  const toggleSourceFilter = useCallback((source: string) => {
    setFilters(prev => ({
      ...prev,
      source: prev.source.includes(source)
        ? prev.source.filter(s => s !== source)
        : [...prev.source, source]
    }))
  }, [])

  return {
    // State
    leads,
    filteredLeads,
    searchTerm,
    filters,
    isAddingLead,
    editingLead,
    expandedLead,
    expandedContacts,
    viewMode,
    newLead,
    
    // State setters
    setSearchTerm,
    setIsAddingLead,
    setEditingLead,
    setExpandedLead,
    setExpandedContacts,
    setViewMode,
    setNewLead,
    
    // Lead management
    addLead,
    updateLead,
    deleteLead,
    handleLeadClick,
    
    // Contact management
    addContact,
    removeContact,
    updateContact,
    updateNewLeadContact,
    setPrimaryContact,
    getPrimaryContact,
    getPrimaryContactIndex,
    updatePrimaryContactField,
    
    // Filter management
    toggleStatusFilter,
    toggleSourceFilter,
  }
}

export type { Lead, NewLead, Contact, LeadStatus }