"use client"

import React from "react"
import {
  Mail,
  Star,
  Search,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react"

interface Email {
  id: string
  from: string
  email: string
  subject: string
  preview: string
  body: string
  date: string
  read: boolean
  starred: boolean
  labels: string[]
  folder: string
  attachments?: Array<{
    name: string
    size: string
    type: string
  }>
}

interface Label {
  id: string
  name: string
  color: string
}

interface LoadingState {
  emails: boolean
  sending: boolean
  attachment: boolean
}

interface EmailListProps {
  emails: Email[]
  selectedEmails: string[]
  searchQuery: string
  loading: LoadingState
  onSearchChange: (query: string) => void
  onEmailClick: (email: Email) => void
  onToggleSelect: (emailId: string) => void
  onToggleStar: (emailId: string, e: React.MouseEvent) => void
  onSelectAll: () => void
  getLabelColor: (labelId: string) => string
  getLabelBgColor: (color: string) => string
  getLabelTextColor: (color: string) => string
  labels: Label[]
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmails,
  searchQuery,
  loading,
  onSearchChange,
  onEmailClick,
  onToggleSelect,
  onToggleStar,
  onSelectAll,
  getLabelColor,
  getLabelBgColor,
  getLabelTextColor,
  labels,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedEmails.length === emails.length && emails.length > 0}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <Filter size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading.emails ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <Loader2 size={48} className="text-gray-300 mb-4 animate-spin" />
            <p className="text-lg font-medium">Loading emails...</p>
            <p className="text-sm">Please wait while we fetch your messages</p>
          </div>
        ) : emails.length > 0 ? (
          <div>
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => onEmailClick(email)}
                className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  !email.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={() => onToggleSelect(email.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <button onClick={(e) => onToggleStar(email.id, e)}>
                      <Star
                        size={18}
                        className={email.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                      />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!email.read ? "text-gray-900" : "text-gray-700"}`}>
                        {email.from}
                      </p>
                      <p className="text-xs text-gray-500">{email.date}</p>
                    </div>
                    <p
                      className={`text-sm truncate ${!email.read ? "font-medium text-gray-900" : "text-gray-700"}`}
                    >
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{email.preview}</p>

                    {email.labels && email.labels.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {email.labels.map((labelId) => (
                          <span
                            key={labelId}
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: getLabelBgColor(getLabelColor(labelId)),
                              color: getLabelTextColor(getLabelColor(labelId)),
                            }}
                          >
                            {labels.find((l) => l.id === labelId)?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <Mail size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">No emails found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailList