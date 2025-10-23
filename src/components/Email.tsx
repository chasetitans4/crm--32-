"use client"

import React, { useState, useEffect } from "react"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError } from "../utils/standardErrorHandling"
import EmailSidebar from "./email/EmailSidebar"
import EmailList from "./email/EmailList"
import EmailDetailModal from "./email/EmailDetailModal"
import ComposeModal from "./email/ComposeModal"
import { Email, LoadingState, ComposeForm, Label, Folder } from "./email/types"

const EmailComponent: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [showEmailDetail, setShowEmailDetail] = useState(false)
  const [composeForm, setComposeForm] = useState<ComposeForm>({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  })
  const [replyMode, setReplyMode] = useState<"reply" | "reply-all" | "forward" | null>(null)
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null)
  const { hasError, error, setError, clearError } = useErrorState()
  const [loading, setLoading] = useState<LoadingState>({
    emails: true,
    sending: false,
    attachment: false,
  })

  const labels: Label[] = [
    { id: "important", name: "Important", color: "red" },
    { id: "work", name: "Work", color: "blue" },
    { id: "personal", name: "Personal", color: "green" },
    { id: "clients", name: "Clients", color: "purple" },
  ]

  const folders: Folder[] = [
    { id: "inbox", name: "Inbox", icon: "📥", count: 12 },
    { id: "sent", name: "Sent", icon: "📤" },
    { id: "drafts", name: "Drafts", icon: "📝", count: 3 },
    { id: "starred", name: "Starred", icon: "⭐", count: 5 },
    { id: "trash", name: "Trash", icon: "🗑️" },
  ]

  // Initialize component and load emails
  useEffect(() => {
    const initializeEmails = async () => {
      setLoading(prev => ({ ...prev, emails: true }))
      clearError()
      
      const result = await handleAsyncOperation(async () => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Sample email data
        const sampleEmails: Email[] = [
          {
            id: "1",
            from: "John Smith",
            email: "john@example.com",
            subject: "Website Design Project Update",
            preview: "Hi, I've reviewed the latest mockups and have some feedback...",
            body: "<p>Hi there,</p><p>I've reviewed the latest mockups for the website design project and have some feedback to share.</p>",
            date: "10:30 AM",
            read: false,
            starred: true,
            labels: ["important", "clients"],
            folder: "inbox",
            attachments: [
              { name: "mockup-v2.pdf", size: "2.4 MB", type: "pdf" },
            ],
          },
          {
            id: "2",
            from: "Sarah Johnson",
            email: "sarah@example.com",
            subject: "Invoice #1234 Payment Confirmation",
            preview: "This email confirms that payment for invoice #1234 has been received...",
            body: "<p>Dear Team,</p><p>This email confirms that payment for invoice #1234 has been received and processed successfully.</p>",
            date: "Yesterday",
            read: true,
            starred: false,
            labels: ["work"],
            folder: "inbox",
          },
        ]
        
        return sampleEmails
      }, 'Email initialization')
      
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setEmails(result.data as Email[])
      }
      
      setLoading(prev => ({ ...prev, emails: false }))
    }

    initializeEmails()
  }, [clearError, setError])

  // Clear error after 5 seconds
  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hasError, clearError])

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateComposeForm = (): string | null => {
    if (!composeForm.to.trim()) {
      return 'Recipient email is required'
    }
    
    if (!validateEmail(composeForm.to)) {
      return 'Please enter a valid recipient email address'
    }
    
    if (composeForm.cc && !validateEmail(composeForm.cc)) {
      return 'Please enter a valid CC email address'
    }
    
    if (composeForm.bcc && !validateEmail(composeForm.bcc)) {
      return 'Please enter a valid BCC email address'
    }
    
    if (!composeForm.subject.trim()) {
      return 'Subject is required'
    }
    
    if (!composeForm.body.trim()) {
      return 'Message body is required'
    }
    
    return null
  }

  // Error handling function
  const handleError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setError(createStandardError(message, {
      type: type === 'error' ? 'system' : 'business',
      code: type.toUpperCase()
    }))
  }

  // Retry function
  const retryOperation = () => {
    clearError()
    window.location.reload()
  }

  // Initialize emails state
  const [emails, setEmails] = useState<Email[]>([])

  const filteredEmails = emails.filter((email) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())

    // Folder filter
    let matchesFolder = true
    if (activeFolder === "starred") {
      matchesFolder = email.starred
    } else if (activeFolder !== "inbox") {
      matchesFolder = email.folder === activeFolder
    } else {
      matchesFolder = email.folder === "inbox"
    }

    // Label filter
    const matchesLabel = activeLabelFilter ? email.labels.includes(activeLabelFilter) : true

    return matchesSearch && matchesFolder && matchesLabel
  })

  const toggleSelectEmail = (emailId: string) => {
    setSelectedEmails((prev) => (prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]))
  }

  const selectAllEmails = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(filteredEmails.map((email) => email.id))
    }
  }

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email)
    setShowEmailDetail(true)

    // Mark as read
    if (!email.read) {
      const result = await handleAsyncOperation(async () => {
        // Simulate API call to mark as read
        await new Promise(resolve => setTimeout(resolve, 100))
        return email.id
      }, 'Mark email as read')
      
      if (result.error) {
        setError(result.error)
      } else {
        setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)))
      }
    }
  }

  const toggleStar = async (emailId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    
    const result = await handleAsyncOperation(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      return emailId
    }, 'Toggle star status')
    
    if (result.error) {
      setError(result.error)
    } else {
      setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, starred: !email.starred } : email)))
    }
  }

  const handleCompose = () => {
    setComposeForm({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
    })
    setReplyMode(null)
    setShowCompose(true)
  }

  const handleReply = (type: "reply" | "reply-all" | "forward") => {
    if (!selectedEmail) {
      setError(createStandardError('No email selected for reply.', {
        type: 'validation',
        code: 'NO_EMAIL_SELECTED'
      }))
      return
    }

    setReplyMode(type)

    let subject = selectedEmail.subject
    if (!subject.toLowerCase().startsWith("re:") && type !== "forward") {
      subject = `Re: ${subject}`
    } else if (type === "forward" && !subject.toLowerCase().startsWith("fwd:")) {
      subject = `Fwd: ${subject}`
    }

    setComposeForm({
      to: type === "forward" ? "" : selectedEmail.email,
      cc: "",
      bcc: "",
      subject: subject,
      body:
        type === "forward"
          ? `\n\n---------- Forwarded message ----------\nFrom: ${selectedEmail.from} <${selectedEmail.email}>\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`
          : `\n\n---------- Original message ----------\nFrom: ${selectedEmail.from} <${selectedEmail.email}>\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`,
    })
    setShowCompose(true)
  }

  const handleFormChange = (field: keyof ComposeForm, value: string) => {
    setComposeForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSendEmail = async () => {
    // Validate form
    if (!validateComposeForm()) {
      return
    }

    setLoading(prev => ({ ...prev, sending: true }))
    clearError()

    const result = await handleAsyncOperation(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate potential network error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Network error: Failed to send email')
      }

      // Add to sent folder (simulate)
      const newEmail: Email = {
        id: Date.now().toString(),
        from: "You",
        email: "you@company.com",
        subject: composeForm.subject,
        preview: composeForm.body.substring(0, 100) + "...",
        body: composeForm.body,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
        starred: false,
        labels: [],
        folder: "sent",
      }

      return newEmail
    }, 'Send email')

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEmails((prev) => [result.data as Email, ...prev])
      setShowCompose(false)
      setComposeForm({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
      })
      setReplyMode(null)

      // Show success message
      setError(createStandardError('Email sent successfully!', {
        type: 'business',
        code: 'EMAIL_SENT_SUCCESS'
      }))
    }

    setLoading(prev => ({ ...prev, sending: false }))
  }

  const getLabelColor = (labelId: string) => {
    const label = labels.find((l) => l.id === labelId)
    return label ? label.color : "gray"
  }

  const getColorForLabel = (color: string): string => {
    const colorMap: Record<string, string> = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#10b981",
      purple: "#8b5cf6",
      yellow: "#f59e0b",
      gray: "#6b7280",
    }
    return colorMap[color] || colorMap.gray
  }

  const getLabelBgColor = (color: string): string => {
    const bgColorMap: Record<string, string> = {
      red: "#fee2e2",
      blue: "#dbeafe",
      green: "#d1fae5",
      purple: "#ede9fe",
      yellow: "#fef3c7",
      gray: "#f3f4f6",
    }
    return bgColorMap[color] || bgColorMap.gray
  }

  const getLabelTextColor = (color: string): string => {
    const textColorMap: Record<string, string> = {
      red: "#b91c1c",
      blue: "#1d4ed8",
      green: "#047857",
      purple: "#5b21b6",
      yellow: "#b45309",
      gray: "#374151",
    }
    return textColorMap[color] || textColorMap.gray
  }



  const handleLabelClick = (labelId: string) => {
    try {
      if (activeLabelFilter === labelId) {
        setActiveLabelFilter(null) // Clear filter if clicking the same label
      } else {
        setActiveLabelFilter(labelId)
        setActiveFolder("inbox") // Reset folder when filtering by label
      }
      setError(null) // Clear any existing errors
    } catch (err) {
      handleError('Failed to apply label filter. Please try again.')
    }
  }

  const handleFolderClick = (folderId: string) => {
    try {
      setActiveFolder(folderId)
      setActiveLabelFilter(null) // Clear label filter when switching folders
      setError(null) // Clear any existing errors
    } catch (err) {
      handleError('Failed to switch folder. Please try again.')
    }
  }

  const getEmailCountForFolder = (folderId: string): number => {
    if (folderId === "starred") {
      return emails.filter((email) => email.starred).length
    }
    return emails.filter((email) => email.folder === folderId).length
  }

  const getEmailCountForLabel = (labelId: string): number => {
    return emails.filter((email) => email.labels.includes(labelId)).length
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Email</h1>
        <p className="text-gray-500 mt-1">Manage your communications</p>
      </div>

      <div className="flex-1 flex overflow-hidden bg-white border border-gray-200 rounded-lg mt-6 shadow-sm">
        <EmailSidebar
          activeFolder={activeFolder}
          activeLabelFilter={activeLabelFilter}
          onFolderClick={handleFolderClick}
          onLabelClick={handleLabelClick}
          onCompose={handleCompose}
          getEmailCountForFolder={getEmailCountForFolder}
          getEmailCountForLabel={getEmailCountForLabel}
          getColorForLabel={getColorForLabel}
        />

        <EmailList
          emails={filteredEmails}
          selectedEmails={selectedEmails}
          searchQuery={searchQuery}
          loading={loading}
          onSearchChange={setSearchQuery}
          onEmailClick={handleEmailClick}
          onToggleSelect={toggleSelectEmail}
          onSelectAll={selectAllEmails}
          onToggleStar={toggleStar}
          labels={labels}
          getLabelColor={getLabelColor}
          getLabelBgColor={getLabelBgColor}
          getLabelTextColor={getLabelTextColor}
        />
      </div>

      {hasError && error && (
        <DefaultErrorFallback
          error={error}
          retry={retryOperation}
        />
      )}

      <EmailDetailModal
        selectedEmail={selectedEmail}
        showEmailDetail={showEmailDetail}
        onClose={() => setShowEmailDetail(false)}
        onToggleStar={toggleStar}
        onReply={handleReply}
        getLabelColor={getLabelColor}
        getLabelBgColor={getLabelBgColor}
        getLabelTextColor={getLabelTextColor}
        labels={labels}
      />

      <ComposeModal
        showCompose={showCompose}
        composeForm={composeForm}
        replyMode={replyMode}
        loading={loading}
        onClose={() => setShowCompose(false)}
        onFormChange={handleFormChange}
        onSend={handleSendEmail}
      />
    </div>
  )
}

export default EmailComponent
