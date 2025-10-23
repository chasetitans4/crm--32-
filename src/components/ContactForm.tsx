"use client"

import React from "react"
import { Trash2, User, Plus, ChevronUp, ChevronDown } from "lucide-react"

interface Contact {
  id?: number
  name: string
  email: string
  phone?: string
  position?: string
  isPrimary: boolean
}

interface ContactFormProps {
  contacts: Contact[]
  onUpdateContact: (contactIndex: number, field: keyof Contact, value: string | boolean) => void
  onAddContact?: () => void
  onRemoveContact?: (contactIndex: number) => void
  onSetPrimaryContact?: (contactIndex: number) => void
  showMultipleContacts?: boolean
  className?: string
  expandedContacts?: { [key: string]: boolean }
  onToggleExpanded?: (contactIndex: number) => void
  leadId?: number
}

const ContactForm: React.FC<ContactFormProps> = ({
  contacts,
  onUpdateContact,
  onAddContact,
  onRemoveContact,
  onSetPrimaryContact,
  showMultipleContacts = true,
  className = "",
  expandedContacts = {},
  onToggleExpanded,
  leadId
}) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium">Contacts</h4>
        {onAddContact && (
          <button
            type="button"
            onClick={onAddContact}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Plus className="mr-1" size={14} /> Add Contact
          </button>
        )}
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => {
          const isExpanded = typeof expandedContacts === 'object' ? expandedContacts[index] : true
          
          return (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <User className="text-gray-500" size={16} />
                  <span className="font-medium text-sm">
                    Contact {index + 1}
                    {contact.isPrimary && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Primary
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {onToggleExpanded && (
                    <button
                      type="button"
                      onClick={() => onToggleExpanded(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                  {onSetPrimaryContact && !contact.isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimaryContact(index)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  {onRemoveContact && contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveContact(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => onUpdateContact(index, 'name', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => onUpdateContact(index, 'email', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={contact.position || ''}
                      onChange={(e) => onUpdateContact(index, 'position', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Job title/position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contact.phone || ''}
                      onChange={(e) => onUpdateContact(index, 'phone', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showMultipleContacts && onAddContact && (
        <button
          type="button"
          onClick={onAddContact}
          className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
        >
          <Plus className="mr-2" size={16} />
          Add Another Contact
        </button>
      )}
    </div>
  )
}

export default ContactForm