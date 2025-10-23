"use client"

import React from "react"
import {
  X,
  Star,
  MoreHorizontal,
  Reply,
  ReplyAll,
  Forward,
  Paperclip,
} from "lucide-react"
import { sanitizeHTML } from "../../utils/security"

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

interface EmailDetailModalProps {
  selectedEmail: Email | null
  showEmailDetail: boolean
  onClose: () => void
  onToggleStar: (emailId: string, e: React.MouseEvent) => void
  onReply: (mode: "reply" | "reply-all" | "forward") => void
  getLabelColor: (labelId: string) => string
  getLabelBgColor: (color: string) => string
  getLabelTextColor: (color: string) => string
  labels: Label[]
}

const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  selectedEmail,
  showEmailDetail,
  onClose,
  onToggleStar,
  onReply,
  getLabelColor,
  getLabelBgColor,
  getLabelTextColor,
  labels,
}) => {
  if (!selectedEmail || !showEmailDetail) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold truncate">{selectedEmail.subject}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Email Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedEmail.from ? selectedEmail.from.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="font-medium">{selectedEmail.from}</p>
                    <p className="text-sm text-gray-500">{selectedEmail.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">To: you@company.com</p>
                <p className="text-sm text-gray-500">{selectedEmail.date}</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={(e) => onToggleStar(selectedEmail.id, e)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Star
                    size={18}
                    className={selectedEmail.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                  />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Labels */}
            {selectedEmail.labels && selectedEmail.labels.length > 0 && (
              <div className="flex gap-1 mt-2">
                {selectedEmail.labels.map((labelId) => (
                  <span
                    key={labelId}
                    className="text-xs px-2 py-1 rounded-full"
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

          {/* Email Body */}
          <div className="p-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedEmail.body) }} />
          </div>

          {/* Attachments */}
          {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Attachments ({selectedEmail.attachments.length})
              </p>
              <div className="space-y-2">
                {selectedEmail.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Paperclip size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => onReply("reply")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Reply size={16} />
            Reply
          </button>
          <button
            onClick={() => onReply("reply-all")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ReplyAll size={16} />
            Reply All
          </button>
          <button
            onClick={() => onReply("forward")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Forward size={16} />
            Forward
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailDetailModal