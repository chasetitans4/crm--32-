"use client"

import React, { useState } from "react"
import {
  Building,
  Phone,
  Mail,
  Plus,
  User,
  X,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  FileText,
  Receipt,
  Eye,
  DollarSign,
  CalendarIcon,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { useClientActions } from "../hooks/useClientActions"
import { formatCurrency, formatNumber } from "@/utils/safeFormatters"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError, type FormValidationError } from "@/utils/standardErrorHandling"
import { advancedEncryption } from "../utils/encryption"
import { secureStorage } from "../utils/secureStorage"
import type { Client } from "../types"

interface Project {
  name: string
  deadline: string
  status: string
  progress?: number
  budget: number | string
  spent: number | string
}

interface Note {
  type: "call" | "email" | "meeting"
  content: string
  date?: string
}

interface SalesStage {
  id: string
  name: string
  color: string
}

const Clients: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { clients, salesStages, contracts, invoices } = state
  const { addNote } = useClientActions()

  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newNote, setNewNote] = useState<{ type: "call" | "email" | "meeting"; content: string }>({
    type: "call",
    content: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // New client form state
  const [newClient, setNewClient] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    stage: "1", // Default to first stage
    value: "",
    status: "potential" as "active" | "potential" | "inactive",
    source: "",
  })

  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterValue, setFilterValue] = useState<string>("")
  const [filterSource, setFilterSource] = useState<string>("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showContractsModal, setShowContractsModal] = useState(false)
  const [showInvoicesModal, setShowInvoicesModal] = useState(false)
  const [selectedClientForContracts, setSelectedClientForContracts] = useState<Client | null>(null)
  const [selectedClientForInvoices, setSelectedClientForInvoices] = useState<Client | null>(null)

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedClientForEmail, setSelectedClientForEmail] = useState<Client | null>(null)
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
    priority: "normal" as "low" | "normal" | "high",
  })
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Error handling state
  const { hasError, error, setError, clearError } = useErrorState()

  // Secure data handling functions
  const setSecureClientData = (clientId: string, data: any) => {
    try {
      const encryptedData = advancedEncryption.encrypt(JSON.stringify(data))
      secureStorage.setItem(`client_${clientId}`, encryptedData)
      
      // Auto-clear after 10 minutes for security
      setTimeout(() => {
        secureStorage.removeItem(`client_${clientId}`)
      }, 10 * 60 * 1000)
    } catch (error) {
      console.error('Failed to encrypt client data:', error)
    }
  }

  const clearSensitiveClientData = () => {
    try {
      // Clear all client-related secure storage
      const keys = Object.keys(localStorage).filter(key => key.startsWith('client_'))
      keys.forEach(key => secureStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear sensitive client data:', error)
    }
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearSensitiveClientData()
    }
  }, [])

  const [showContractDetailsModal, setShowContractDetailsModal] = useState(false)
  const [selectedContractForDetails, setSelectedContractForDetails] = useState<any>(null)

  // Function to add a note to a client
  const handleAddNote = (clientId: string, type: "call" | "email" | "meeting") => {
    if (!newNote.content.trim()) return

    addNote(clientId, {
      type,
      content: newNote.content,
    })

    setNewNote({ type: "call", content: "" })
    setShowAddNote(false)
  }

  // Handle client form input change
  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewClient({
      ...newClient,
      [name]: value,
    })
  }

  // Handle client form submission
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()

    // Normalize value to number
    const rawVal = newClient.value
    const numericValue = typeof rawVal === 'string' ? Number(rawVal.replace(/[^0-9.-]+/g, "")) : Number(rawVal)

    // Create a new client object matching src/types/index.ts
    const client: Client = {
      id: (Math.max(0, ...clients.map((c) => parseInt(c.id) || 0)) + 1).toString(),
      name: newClient.name,
      contact: newClient.contact || newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      company: newClient.contact || newClient.name,
      stage: newClient.stage,
      value: isNaN(numericValue) ? 0 : numericValue,
      status: newClient.status,
      source: newClient.source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [],
      projects: [],
      custom_fields: {},
    }

    // Encrypt sensitive client data
    const sensitiveData = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      contact: client.contact,
      company: client.company
    }
    setSecureClientData(client.id, sensitiveData)

    // Dispatch action to add client
    dispatch({ type: "ADD_CLIENT", payload: client })

    // Reset form and close modal
    setNewClient({
      name: "",
      contact: "",
      email: "",
      phone: "",
      stage: "1",
      value: "",
      status: "potential",
      source: "",
    })
    setShowAddClient(false)

    // Show success message
    setError(createStandardError("Client added successfully!", {
      type: 'business',
      severity: 'low'
    }))
  }

  // Handle phone call action
  const handlePhoneCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, "_blank")
    } else {
      setError(createStandardError("No phone number available for this client", {
        type: 'validation',
        severity: 'low'
      }))
    }
  }

  // Handle email action - open modal instead of mailto
  const handleEmail = (client: Client) => {
    if (client.email) {
      setSelectedClientForEmail(client)
      setEmailForm({
        to: client.email,
        subject: `Follow up with ${client.name}`,
        body: `Dear ${client.contact || client.name},\n\nI hope this email finds you well.\n\nBest regards,\nYour Name`,
        priority: "normal",
      })
      setShowEmailModal(true)
    } else {
      setError(createStandardError("No email address available for this client", {
        type: 'validation',
        severity: 'low'
      }))
    }
  }

  // Handle email form changes
  const handleEmailFormChange = (field: string, value: string) => {
    setEmailForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle email send
  const handleSendEmail = async () => {
    // Validate required fields
    const errors: FormValidationError[] = []
    if (!emailForm.to.trim()) {
      errors.push({ field: 'to', message: 'Email recipient is required' })
    }
    if (!emailForm.subject.trim()) {
      errors.push({ field: 'subject', message: 'Email subject is required' })
    }
    if (!emailForm.body.trim()) {
      errors.push({ field: 'body', message: 'Email body is required' })
    }
    
    if (errors.length > 0) {
      setError(createStandardError('Please fix the validation errors', {
        type: 'validation',
        severity: 'low',
        context: { errors }
      }))
      return
    }

    setIsSendingEmail(true)

    try {
      // Encrypt sensitive email data
      const emailData = {
        to: emailForm.to,
        subject: emailForm.subject,
        body: emailForm.body,
        clientId: selectedClientForEmail?.id,
        timestamp: new Date().toISOString()
      }
      if (selectedClientForEmail) {
        setSecureClientData(`email_${selectedClientForEmail.id}_${Date.now()}`, emailData)
      }

      // Simulate email sending - replace with actual email service
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Add note to client about email sent
      if (selectedClientForEmail) {
        addNote(selectedClientForEmail.id, {
          type: "email",
          content: `Email sent: "${emailForm.subject}"`,
        })
      }

      setError(createStandardError("Email sent successfully!", {
        type: 'business',
        severity: 'low'
      }))
      setShowEmailModal(false)
      setEmailForm({ to: "", subject: "", body: "", priority: "normal" })
      setSelectedClientForEmail(null)
    } catch (error) {
      setError(createStandardError("Failed to send email. Please try again.", {
        type: 'network',
        severity: 'medium',
        context: { originalError: error }
      }))
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Handle contracts modal
  const handleViewContracts = (client: Client) => {
    setSelectedClientForContracts(client)
    setShowContractsModal(true)
  }

  // Handle invoices modal
  const handleViewInvoices = (client: Client) => {
    setSelectedClientForInvoices(client)
    setShowInvoicesModal(true)
  }

  // Handle contract details modal
  const handleViewContractDetails = (contract: any) => {
    setSelectedContractForDetails(contract)
    setShowContractDetailsModal(true)
  }

  // Get client contracts
  const getClientContracts = (clientId: string) => {
    return contracts?.filter((contract) => contract.clientId === clientId) || []
  }

  // Get client invoices
  const getClientInvoices = (clientId: string) => {
    return invoices?.filter((invoice) => invoice.clientId === clientId) || []
  }



  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "signed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
      case "review":
        return "bg-blue-100 text-blue-800"
      case "overdue":
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Safe formatters are imported at the top of the file

  // Safely parse currency or numeric values that may be stored as strings like "$12,345.67"
  const parseCurrencyValue = (val: string | number | null | undefined): number => {
    if (typeof val === "number") return isNaN(val) ? 0 : val
    if (typeof val === "string") {
      const num = Number(val.replace(/[^0-9.-]+/g, ""))
      return isNaN(num) ? 0 : num
    }
    return 0
  }

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
    const q = (searchTerm || "").toLowerCase()
    return (
      (client.name || "").toLowerCase().includes(q) ||
      (client.email || "").toLowerCase().includes(q) ||
      (client.contact || "").toLowerCase().includes(q)
    )
  })

  // Enhanced filter and sort function
  const filteredAndSortedClients = clients
    .filter((client) => {
      // Search term filter
      const q = (searchTerm || "").toLowerCase()
      const matchesSearch =
        (client.name || "").toLowerCase().includes(q) ||
        (client.email || "").toLowerCase().includes(q) ||
        (client.contact || "").toLowerCase().includes(q)

      // Status filter
      const matchesStatus = filterStatus.length === 0 || filterStatus.includes(client.status)

      // Value filter
      const clientValue = parseCurrencyValue(client.value)
      const matchesValue =
        !filterValue ||
        (filterValue === "under5k" && clientValue < 5000) ||
        (filterValue === "5kTo10k" && clientValue >= 5000 && clientValue <= 10000) ||
        (filterValue === "over10k" && clientValue > 10000)

      // Source filter
      const matchesSource = !filterSource || (client.source || "").toLowerCase().includes(filterSource.toLowerCase())

      return matchesSearch && matchesStatus && matchesValue && matchesSource
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortField === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortField === "value") {
        const aValue = parseCurrencyValue(a.value)
        const bValue = parseCurrencyValue(b.value)
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      } else if (sortField === "lastContact") {
        const aTime = new Date((a as any).lastContact || "").getTime() || 0
        const bTime = new Date((b as any).lastContact || "").getTime() || 0
        return sortDirection === "asc" ? aTime - bTime : bTime - aTime
      }
      return 0
    })

  return (
    <div className="p-8 fade-in">
      {hasError && (
        <DefaultErrorFallback
          error={error!}
          retry={clearError}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto"></div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-6">Clients</h2>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients by name, email, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white shadow-sm transition-all duration-200"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-6 bg-gray-50 hover:bg-gray-100 rounded-lg border-0 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Filter size={16} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">Filters</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl p-6 z-10 border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-4">Filter & Sort Clients</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filterStatus.includes("active")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterStatus([...filterStatus, "active"])
                                } else {
                                  setFilterStatus(filterStatus.filter((s) => s !== "active"))
                                }
                              }}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filterStatus.includes("potential")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterStatus([...filterStatus, "potential"])
                                } else {
                                  setFilterStatus(filterStatus.filter((s) => s !== "potential"))
                                }
                              }}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Potential</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filterStatus.includes("inactive")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterStatus([...filterStatus, "inactive"])
                                } else {
                                  setFilterStatus(filterStatus.filter((s) => s !== "inactive"))
                                }
                              }}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Inactive</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Project Value</label>
                        <select
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        >
                          <option value="">Any Value</option>
                          <option value="under5k">Under $5,000</option>
                          <option value="5kTo10k">$5,000 - $10,000</option>
                          <option value="over10k">Over $10,000</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Source</label>
                        <input
                          type="text"
                          value={filterSource}
                          onChange={(e) => setFilterSource(e.target.value)}
                          placeholder="Filter by source..."
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Sort By</label>
                        <div className="flex gap-2">
                          <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                          >
                            <option value="name">Name</option>
                            <option value="value">Value</option>
                            <option value="lastContact">Last Contact</option>
                          </select>
                          <button
                            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                            className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            title={sortDirection === "asc" ? "Ascending" : "Descending"}
                          >
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between border-t">
                        <button
                          onClick={() => {
                            setFilterStatus([])
                            setFilterValue("")
                            setFilterSource("")
                            setSortField("name")
                            setSortDirection("asc")
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Reset Filters
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition-colors font-medium"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAddClient(true)}
              className="h-12 px-6 bg-primary-600 text-white rounded-lg shadow-sm flex items-center gap-2 hover:bg-primary-700 transition-all duration-200 hover:shadow-md font-medium"
            >
              <Plus size={18} />
              <span>Add Client</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedClients.map((client, index) => (
                <tr
                  key={client.id}
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                        {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        {client.company && (
                          <div className="text-xs text-gray-600">{client.company}</div>
                        )}
                        <div className="text-xs text-gray-500 capitalize">{client.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{client.contact}</div>
                    <div className="text-xs text-gray-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                        salesStages && salesStages.find((s) => s.id === client.stage)?.color
                      }`}
                    >
                      {salesStages && salesStages.find((s) => s.id === client.stage)?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(typeof client.value === 'number' ? client.value : parseCurrencyValue(client.value))}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(client as any).lastContact || ''}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View client details"
                      >
                        <User size={16} />
                      </button>
                      <button
                        onClick={() => handleViewContracts(client)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                        title="View contracts"
                      >
                        <FileText size={16} />
                        {getClientContracts(client.id).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {getClientContracts(client.id).length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleViewContractDetails(getClientContracts(client.id)[0])}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View contract details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViewInvoices(client)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative"
                        title="View invoices"
                      >
                        <Receipt size={16} />
                        {getClientInvoices(client.id).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {getClientInvoices(client.id).length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handlePhoneCall(client.phone)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call client"
                      >
                        <Phone size={16} />
                      </button>
                      <button
                        onClick={() => handleEmail(client)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Email client"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedClients.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Building size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No clients found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => setShowAddClient(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
            >
              Add New Client
            </button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl scale-in">
            <div className="p-5 flex justify-between items-center bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800">Add New Client</h3>
              <button
                onClick={() => setShowAddClient(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="p-5 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Client Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newClient.name}
                  onChange={handleClientInputChange}
                  className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={newClient.contact}
                  onChange={handleClientInputChange}
                  className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newClient.email}
                  onChange={handleClientInputChange}
                  className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newClient.phone}
                  onChange={handleClientInputChange}
                  className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stage" className="block text-sm font-medium mb-1.5 text-gray-700">
                    Stage
                  </label>
                  <select
                    id="stage"
                    name="stage"
                    value={newClient.stage}
                    onChange={handleClientInputChange}
                    className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  >
                    {salesStages &&
                      salesStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1.5 text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newClient.status}
                    onChange={handleClientInputChange}
                    className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  >
                    <option value="potential">Potential</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="value" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Potential Value
                </label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  value={newClient.value}
                  onChange={handleClientInputChange}
                  className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter potential value (e.g. $5,000)"
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Source
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={newClient.source}
                  onChange={handleClientInputChange}
                  className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="How did they find you?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2.5 text-sm font-medium bg-white border-0 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 z-10 p-5 border-b flex justify-between items-center bg-gradient-to-r from-primary-50 to-secondary-50">
              <h3 className="text-lg font-bold text-gray-800">{selectedClient.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePhoneCall(selectedClient.phone)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Call client"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => handleEmail(selectedClient)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Email client"
                >
                  <Mail size={18} />
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-gray-500 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <User size={18} className="text-primary-500" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User size={16} className="text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Contact Person</div>
                        <div className="font-medium">{selectedClient.contact}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={16} className="text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <a
                          href={`mailto:${selectedClient.email}`}
                          className="font-medium text-primary-600 hover:underline flex items-center"
                        >
                          {selectedClient.email}
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone size={16} className="text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <a
                          href={`tel:${selectedClient.phone}`}
                          className="font-medium text-primary-600 hover:underline flex items-center"
                        >
                          {selectedClient.phone}
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <Building size={18} className="text-primary-500" />
                    Client Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">Status</div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {selectedClient.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">Stage</div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          salesStages && salesStages.find((s) => s.id === selectedClient.stage)?.color
                        }`}
                      >
                        {salesStages && salesStages.find((s) => s.id === selectedClient.stage)?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">Value</div>
                      <span className="font-medium text-gray-900">{formatCurrency(typeof selectedClient.value === 'number' ? selectedClient.value : parseCurrencyValue(selectedClient.value))}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">Source</div>
                      <span className="font-medium text-gray-900">{selectedClient.source || "Not specified"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-primary-500" />
                    Notes & Activity
                  </h4>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm flex items-center gap-1 shadow-sm hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={14} />
                    Add Note
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedClient.notes && selectedClient.notes.length > 0 ? (
                    selectedClient.notes.map((note, idx) => (
                      <div key={idx} className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              note.type === "call"
                                ? "bg-blue-100 text-blue-600"
                                : note.type === "email"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {note.type === "call" && <Phone size={16} />}
                            {note.type === "email" && <Mail size={16} />}
                            {note.type === "meeting" && <CalendarIcon size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">{note.date}</div>
                            <div className="text-gray-800">{note.content}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <CalendarIcon size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-3">No notes yet. Add your first note about this client.</p>
                      <button
                        onClick={() => setShowAddNote(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm shadow-sm hover:bg-primary-700 transition-colors"
                      >
                        Add Note
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showAddNote && (
                <div className="mb-6 p-5 bg-white rounded-xl shadow-md">
                  <h4 className="font-semibold mb-4 text-gray-800">Add New Note</h4>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewNote({ ...newNote, type: "call" })}
                        className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                          newNote.type === "call"
                            ? "bg-blue-100 text-blue-800 ring-2 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Phone size={16} />
                        Call
                      </button>
                      <button
                        onClick={() => setNewNote({ ...newNote, type: "email" })}
                        className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                          newNote.type === "email"
                            ? "bg-green-100 text-green-800 ring-2 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Mail size={16} />
                        Email
                      </button>
                      <button
                        onClick={() => setNewNote({ ...newNote, type: "meeting" })}
                        className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                          newNote.type === "meeting"
                            ? "bg-purple-100 text-purple-800 ring-2 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <CalendarIcon size={16} />
                        Meeting
                      </button>
                    </div>

                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Enter note details..."
                      className="w-full rounded-lg border-0 px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm h-24 resize-none"
                    />

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowAddNote(false)}
                        className="px-4 py-2 text-sm font-medium bg-white border-0 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddNote(selectedClient.id, newNote.type)}
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Access Section */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <ExternalLink size={18} className="text-primary-500" />
                  Quick Access
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-purple-600" />
                        <span className="font-medium text-purple-800">Contracts</span>
                      </div>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">
                        {getClientContracts(selectedClient.id).length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewContracts(selectedClient)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      View All Contracts
                    </button>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Receipt size={20} className="text-orange-600" />
                        <span className="font-medium text-orange-800">Invoices</span>
                      </div>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-medium">
                        {getClientInvoices(selectedClient.id).length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewInvoices(selectedClient)}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      View All Invoices
                    </button>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600" />
                        <span className="font-medium text-green-800">Total Value</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-700 mb-2">{formatCurrency(typeof selectedClient.value === 'number' ? selectedClient.value : parseCurrencyValue(selectedClient.value))}</div>
                    <div className="text-sm text-green-600">Project Value</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Building size={18} className="text-primary-500" />
                  Projects
                </h4>

                {selectedClient.projects && selectedClient.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedClient.projects.map((project, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500 mt-1">Deadline: {project.endDate}</div>
                          </div>
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                              project.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : project.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-medium text-gray-700">Progress</span>
                            <span className="font-medium text-primary-600">{project.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-gray-600">Budget:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {formatCurrency(project.budget)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Spent:</span>
                            <span className="ml-1 font-medium text-gray-900">{formatCurrency(project.spent)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Building size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-3">No projects yet. Create a new project for this client.</p>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm shadow-sm hover:bg-primary-700 transition-colors">
                      Create Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Modal */}
      {showContractsModal && selectedClientForContracts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Contracts for {selectedClientForContracts.name}
              </h3>
              <button
                onClick={() => setShowContractsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {getClientContracts(selectedClientForContracts.id).length > 0 ? (
                <div className="space-y-4">
                  {getClientContracts(selectedClientForContracts.id).map((contract) => (
                    <div key={contract.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{contract.projectDetails?.title || 'Untitled Project'}</h4>
                          <p className="text-sm text-gray-600 mt-1">{contract.contractNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusColor(contract.status || 'draft')}`}
                          >
                            {contract.status ? contract.status.charAt(0).toUpperCase() + contract.status.slice(1) : 'Unknown'}
                          </span>
                          <button
                            onClick={() => handleViewContractDetails(contract)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="View contract details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-medium text-gray-900">{formatCurrency(contract.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Priority:</span>
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                              contract.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : contract.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {contract.priority}
                          </span>
                        </div>
                      </div>
                      {contract.projectDetails?.description && (
                        <p className="text-sm text-gray-600 mt-3">{contract.projectDetails.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Contracts Found</h4>
                  <p className="text-gray-600 mb-4">This client doesn't have any contracts yet.</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Create Contract
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Modal */}
      {showInvoicesModal && selectedClientForInvoices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Receipt size={24} className="text-orange-600" />
                Invoices for {selectedClientForInvoices.name}
              </h3>
              <button
                onClick={() => setShowInvoicesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {getClientInvoices(selectedClientForInvoices.id).length > 0 ? (
                <div className="space-y-4">
                  {getClientInvoices(selectedClientForInvoices.id).map((invoice) => (
                    <div key={invoice.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h4>
                          <p className="text-sm text-gray-600 mt-1">Client: {invoice.clientName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusColor(invoice.status)}`}
                          >
                            {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'}
                          </span>
                          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Issue Date:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <span
                            className={`ml-2 font-medium ${
                              invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== "Paid"
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
                          </span>
                        </div>
                      </div>
                      {invoice.items && invoice.items.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Items:</h5>
                          <div className="space-y-1">
                            {invoice.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                <span>
                                  {item.description} (x{item.quantity})
                                </span>
                                <span>{formatCurrency(item.total)}</span>
                              </div>
                            ))}
                            {invoice.items.length > 3 && (
                              <div className="text-sm text-gray-500">... and {invoice.items.length - 3} more items</div>
                            )}
                          </div>
                        </div>
                      )}
                      {invoice.notes && <p className="text-sm text-gray-600 mt-3">{invoice.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt size={48} className="text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h4>
                  <p className="text-gray-600 mb-4">This client doesn't have any invoices yet.</p>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Create Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedClientForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Mail size={24} className="text-green-600" />
                Send Email to {selectedClientForEmail.name}
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setSelectedClientForEmail(null)
                  setEmailForm({ to: "", subject: "", body: "", priority: "normal" })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSendingEmail}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendEmail()
                }}
                className="space-y-6"
              >
                {/* To Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      {selectedClientForEmail.name ? selectedClientForEmail.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{selectedClientForEmail.name}</div>
                      <div className="text-sm text-gray-600">{emailForm.to}</div>
                    </div>
                  </div>
                </div>

                {/* Priority Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={emailForm.priority}
                    onChange={(e) => handleEmailFormChange("priority", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    disabled={isSendingEmail}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => handleEmailFormChange("subject", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter email subject"
                    required
                    disabled={isSendingEmail}
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Rich Text Editor Toolbar */}
                    <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById("email-body") as HTMLTextAreaElement
                          if (textarea) {
                            const start = textarea.selectionStart
                            const end = textarea.selectionEnd
                            const selectedText = emailForm.body.substring(start, end)
                            const newText =
                              emailForm.body.substring(0, start) + `**${selectedText}**` + emailForm.body.substring(end)
                            handleEmailFormChange("body", newText)
                          }
                        }}
                        className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        disabled={isSendingEmail}
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById("email-body") as HTMLTextAreaElement
                          if (textarea) {
                            const start = textarea.selectionStart
                            const end = textarea.selectionEnd
                            const selectedText = emailForm.body.substring(start, end)
                            const newText =
                              emailForm.body.substring(0, start) + `*${selectedText}*` + emailForm.body.substring(end)
                            handleEmailFormChange("body", newText)
                          }
                        }}
                        className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors italic"
                        disabled={isSendingEmail}
                        title="Italic"
                      >
                        I
                      </button>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentBody = emailForm.body
                          const newBody = currentBody + (currentBody ? "\n\n" : "") + "• "
                          handleEmailFormChange("body", newBody)
                        }}
                        className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        disabled={isSendingEmail}
                        title="Bullet Point"
                      >
                        •
                      </button>
                    </div>

                    {/* Text Area */}
                    <textarea
                      id="email-body"
                      value={emailForm.body}
                      onChange={(e) => handleEmailFormChange("body", e.target.value)}
                      className="w-full p-4 border-0 focus:outline-none focus:ring-0 resize-none"
                      rows={12}
                      placeholder="Compose your email message here..."
                      required
                      disabled={isSendingEmail}
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Use **text** for bold, *text* for italic</div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Sending to: {selectedClientForEmail.name} ({emailForm.to})
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailModal(false)
                        setSelectedClientForEmail(null)
                        setEmailForm({ to: "", subject: "", body: "", priority: "normal" })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSendingEmail}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSendingEmail || !emailForm.to || !emailForm.subject || !emailForm.body}
                    >
                      {isSendingEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {showContractDetailsModal && selectedContractForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Contract Details - {selectedContractForDetails.contractNumber}
              </h3>
              <button
                onClick={() => setShowContractDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contract Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Contract Overview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Number:</span>
                      <span className="font-medium text-gray-900">{selectedContractForDetails.contractNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedContractForDetails.status)}`}
                      >
                        {selectedContractForDetails.status ? selectedContractForDetails.status.charAt(0).toUpperCase() +
                          selectedContractForDetails.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          selectedContractForDetails.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : selectedContractForDetails.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedContractForDetails.priority ? selectedContractForDetails.priority.charAt(0).toUpperCase() +
                          selectedContractForDetails.priority.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(selectedContractForDetails.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedContractForDetails.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building size={18} className="text-green-600" />
                    Project Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 block text-sm">Project Title:</span>
                      <span className="font-medium text-gray-900">
                        {selectedContractForDetails.projectDetails.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-sm">Description:</span>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        {selectedContractForDetails.projectDetails.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Content */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-purple-600" />
                  Contract Content
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                  {selectedContractForDetails.contractContent ? (
                    <div className="prose max-w-none text-sm">
                      {selectedContractForDetails.contractContent.split("\n").map((line: string, index: number) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <h3 key={index} className="font-semibold text-gray-900 mt-4 mb-2">
                              {line.replace(/\*\*/g, "")}
                            </h3>
                          )
                        }
                        if (line.startsWith("*")) {
                          return (
                            <li key={index} className="ml-4 mb-1 text-gray-700">
                              {line.substring(2)}
                            </li>
                          )
                        }
                        if (line.trim() === "") {
                          return <br key={index} />
                        }
                        return (
                          <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                            {line}
                          </p>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Contract content will be generated from template when finalized.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowContractDetailsModal(false)
                    handleViewContracts(clients.find(c => c.id === selectedContractForDetails.clientId) || clients[0])
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View All Client Contracts
                </button>
                <button
                  onClick={() => setShowContractDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clients
