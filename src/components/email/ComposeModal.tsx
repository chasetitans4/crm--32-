"use client"

import React from "react"
import {
  X,
  Send,
  Paperclip,
  Loader2,
} from "lucide-react"

interface ComposeForm {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
}

interface LoadingState {
  emails: boolean
  sending: boolean
  attachment: boolean
}

interface ComposeModalProps {
  showCompose: boolean
  composeForm: ComposeForm
  replyMode: "reply" | "reply-all" | "forward" | null
  loading: LoadingState
  onClose: () => void
  onFormChange: (field: keyof ComposeForm, value: string) => void
  onSend: () => void
}

const ComposeModal: React.FC<ComposeModalProps> = ({
  showCompose,
  composeForm,
  replyMode,
  loading,
  onClose,
  onFormChange,
  onSend,
}) => {
  if (!showCompose) return null

  const getModalTitle = () => {
    switch (replyMode) {
      case "reply":
        return "Reply"
      case "reply-all":
        return "Reply All"
      case "forward":
        return "Forward"
      default:
        return "Compose Email"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{getModalTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={composeForm.to}
                onChange={(e) => onFormChange("to", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="recipient@example.com"
                required
              />
            </div>

            {/* CC Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CC
              </label>
              <input
                type="email"
                value={composeForm.cc}
                onChange={(e) => onFormChange("cc", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cc@example.com"
              />
            </div>

            {/* BCC Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BCC
              </label>
              <input
                type="email"
                value={composeForm.bcc}
                onChange={(e) => onFormChange("bcc", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bcc@example.com"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={composeForm.subject}
                onChange={(e) => onFormChange("subject", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={composeForm.body}
                onChange={(e) => onFormChange("body", e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Paperclip size={16} />
              Attach
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={loading.sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComposeModal