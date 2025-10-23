"use client"

import React, { useState } from "react"
import {
  Plus,
  Filter,
  Search,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  DollarSign,
  X,
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/utils/safeFormatters"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError } from "../utils/standardErrorHandling"
import { advancedEncryption } from "../utils/encryption"
import { secureStorage } from "../utils/secureStorage"
import ContactForm from "./ContactForm"
import { useLeadManagement, type Lead, type LeadStatus } from "../hooks/useLeadManagement"
import { useContactForm } from "../hooks/useContactForm"

// Type definitions
interface Task {
  title: string
  description: string
  priority: string
  dueDate: string
}

interface Event {
  title: string
  date: string
  time: string
  type: string
  description: string
}

const LeadStatuses: Record<LeadStatus, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-800" },
  CONTACTED: { label: "Contacted", color: "bg-purple-100 text-purple-800" },
  QUALIFIED: { label: "Qualified", color: "bg-green-100 text-green-800" },
  PROPOSAL: { label: "Proposal", color: "bg-yellow-100 text-yellow-800" },
  NEGOTIATION: { label: "Negotiation", color: "bg-orange-100 text-orange-800" },
  WON: { label: "Won", color: "bg-green-100 text-green-800" },
  LOST: { label: "Lost", color: "bg-red-100 text-red-800" },
}

const LeadSources = ["Website", "Referral", "Social Media", "Email Campaign", "Cold Call", "Event", "Other"]

const Leads = () => {
  const {
    leads,
    filteredLeads,
    searchTerm,
    filters,
    isAddingLead,
    editingLead,
    expandedLead,
    newLead,
    viewMode,
    setSearchTerm,
    setIsAddingLead,
    setEditingLead,
    setExpandedLead,
    setNewLead,
    setViewMode,
    addLead,
    updateLead,
    deleteLead,
    toggleStatusFilter,
    toggleSourceFilter,
    handleLeadClick,
    addContact,
    removeContact,
    updateContact,
    updateNewLeadContact,
    setPrimaryContact
  } = useLeadManagement()

  const {
    expandedContacts,
    toggleContactExpansion
  } = useContactForm()

  const { hasError, error, setError, clearError } = useErrorState()

  // Secure data handling functions
  const setSecureLeadData = (leadId: string, data: any) => {
    try {
      const encryptedData = advancedEncryption.encrypt(JSON.stringify(data))
      secureStorage.setItem(`lead_${leadId}`, encryptedData)
      
      // Auto-clear after 10 minutes for security
      setTimeout(() => {
        secureStorage.removeItem(`lead_${leadId}`)
      }, 10 * 60 * 1000)
    } catch (error) {
      console.error('Failed to encrypt lead data:', error)
    }
  }

  const clearSensitiveLeadData = () => {
    try {
      // Clear all lead-related secure storage
      const keys = Object.keys(localStorage).filter(key => key.startsWith('lead_'))
      keys.forEach(key => secureStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear sensitive lead data:', error)
    }
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearSensitiveLeadData()
    }
  }, [])

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newTask, setNewTask] = useState<Task>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  })
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    date: "",
    time: "",
    type: "meeting",
    description: "",
  })

  const handleAddTask = async () => {
    // Validate required fields
    if (!newTask.title.trim()) {
      setError(createStandardError('Task title is required', { type: 'validation', severity: 'medium', code: 'TASK_TITLE_REQUIRED' }))
      return
    }
    if (!newTask.dueDate) {
      setError(createStandardError('Due date is required', { type: 'validation', severity: 'medium', code: 'TASK_DUE_DATE_REQUIRED' }))
      return
    }

    const result = await handleAsyncOperation(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    }, 'Add Task')

    if (result.error) {
      setError(result.error)
    } else {
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      })
      setShowTaskModal(false)
      setSelectedLead(null)
      setError(createStandardError('Task added successfully!', { type: 'business', severity: 'low', code: 'TASK_ADDED' }))
    }
  }

  const handleAddEvent = async () => {
    // Validate required fields
    if (!newEvent.title.trim()) {
      setError(createStandardError('Event title is required', { type: 'validation', severity: 'medium', code: 'EVENT_TITLE_REQUIRED' }))
      return
    }
    if (!newEvent.date) {
      setError(createStandardError('Event date is required', { type: 'validation', severity: 'medium', code: 'EVENT_DATE_REQUIRED' }))
      return
    }
    if (!newEvent.time) {
      setError(createStandardError('Event time is required', { type: 'validation', severity: 'medium', code: 'EVENT_TIME_REQUIRED' }))
      return
    }

    const result = await handleAsyncOperation(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    }, 'Schedule Event')

    if (result.error) {
      setError(result.error)
    } else {
      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "meeting",
        description: "",
      })
      setShowCalendarModal(false)
      setSelectedLead(null)
      setError(createStandardError('Event scheduled successfully!', { type: 'business', severity: 'low', code: 'EVENT_SCHEDULED' }))
    }
  }

  const openTaskModal = (lead: Lead) => {
    setSelectedLead(lead)
    setNewTask({
      title: `Follow up with ${lead.name}`,
      description: `Contact ${lead.name} from ${lead.company} regarding their interest in credit repair services.`,
      priority: "medium",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
    setShowTaskModal(true)
  }

  const openCalendarModal = (lead: Lead) => {
    setSelectedLead(lead)
    setNewEvent({
      title: `Meeting with ${lead.name}`,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "10:00",
      type: "meeting",
      description: `Discuss credit repair services with ${lead.name} from ${lead.company}.`,
    })
    setShowCalendarModal(true)
  }

  return (
    <div className="p-6">
      {hasError && error && (
        <DefaultErrorFallback
          error={error}
          retry={clearError}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-black border-2 rounded-md transition-colors ${
                viewMode === "list" ? "border-blue-500 bg-blue-50" : "border-blue-300 bg-white hover:bg-blue-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 text-black border-2 rounded-md transition-colors ${
                viewMode === "cards" ? "border-green-500 bg-green-50" : "border-green-300 bg-white hover:bg-green-50"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 text-black border-2 rounded-md transition-colors ${
                viewMode === "table" ? "border-purple-500 bg-purple-50" : "border-purple-300 bg-white hover:bg-purple-50"
              }`}
            >
              Table
            </button>
          </div>
          <button
            onClick={() => setIsAddingLead(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const status = e.target.value as LeadStatus
                if (status) toggleStatusFilter(status)
              }}
            >
              <option value="">Filter by Status</option>
              {Object.entries(LeadStatuses).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const source = e.target.value
                if (source) toggleSourceFilter(source)
              }}
            >
              <option value="">Filter by Source</option>
              {LeadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Lead Form */}
      {isAddingLead && (
        <div className="mb-6 p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Add New Lead</h2>
            <button
              onClick={() => setIsAddingLead(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Lead Name"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newLead.status}
              onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(LeadStatuses).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Source</option>
              {LeadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Estimated Value"
              value={newLead.value}
              onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            placeholder="Notes"
            value={newLead.notes}
            onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            rows={3}
          />
          <ContactForm
            contacts={newLead.contacts}
            onUpdateContact={(index, field, value) => updateNewLeadContact(index, field, String(value))}
            onAddContact={() => addContact(null)}
            onRemoveContact={(index) => removeContact(null, index)}
            onSetPrimaryContact={(index) => setPrimaryContact(null, index)}
            expandedContacts={expandedContacts}
            onToggleExpanded={(contactIndex) => toggleContactExpansion(null, contactIndex)}
            leadId={undefined}
            showMultipleContacts={true}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setIsAddingLead(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addLead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Lead
            </button>
          </div>
        </div>
      )}

      {/* Leads Display */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="border rounded-lg bg-white shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${LeadStatuses[lead.status].color}`}>
                      {LeadStatuses[lead.status].label}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{lead.company}</p>
                  <p className="text-sm text-gray-500 mb-2">{lead.source}</p>
                  <p className="text-sm font-medium text-green-600">{formatCurrency(lead.value)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openTaskModal(lead)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Add Task"
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    onClick={() => openCalendarModal(lead)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Schedule Meeting"
                  >
                    <Calendar size={16} />
                  </button>
                  <button
                    onClick={() => handleLeadClick(lead)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Lead</h2>
              <button
                onClick={() => setEditingLead(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Lead Name"
                value={editingLead.name}
                onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={editingLead.company}
                onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingLead.status}
                onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(LeadStatuses).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={editingLead.source}
                onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Source</option>
                {LeadSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Estimated Value"
                value={editingLead.value}
                onChange={(e) => setEditingLead({ ...editingLead, value: Number(e.target.value) })}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              placeholder="Notes"
              value={editingLead.notes}
              onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            <ContactForm
              contacts={editingLead.contacts}
              onUpdateContact={(index, field, value) => updateContact(editingLead.id, index, field, String(value))}
              onAddContact={() => addContact(editingLead.id)}
              onRemoveContact={(index) => removeContact(editingLead.id, index)}
              onSetPrimaryContact={(index) => setPrimaryContact(editingLead.id, index)}
              expandedContacts={expandedContacts}
              onToggleExpanded={(contactIndex) => toggleContactExpansion(editingLead.id, contactIndex)}
              leadId={editingLead.id}
              showMultipleContacts={true}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateLead()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Schedule Meeting</h2>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="call">Phone Call</option>
                <option value="email">Email Follow-up</option>
              </select>
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads
