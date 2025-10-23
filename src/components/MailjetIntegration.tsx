"use client"

import React, { useState } from "react"
import { Send, Settings, FileText, BarChart3, Check, AlertCircle, ChevronRight } from "lucide-react"

const MailjetIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState("setup")
  const [isConnected, setIsConnected] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [fromName, setFromName] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "<p>Hello {{name}},</p><p>This is your email content.</p>",
  })
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "Test Email from Mailjet",
    content: "<p>This is a test email sent from the Mailjet integration.</p>",
  })
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API connection
    setTimeout(() => {
      if (apiKey && secretKey && fromEmail) {
        setIsConnected(true)
        setSuccessMessage("Successfully connected to Mailjet!")
        setErrorMessage("")
      } else {
        setErrorMessage("Please fill in all required fields")
        setSuccessMessage("")
      }
      setLoading(false)
    }, 1000)
  }

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate template creation
    setTimeout(() => {
      if (newTemplate.name && newTemplate.subject && newTemplate.content) {
        const template = {
          id: Date.now().toString(),
          ...newTemplate,
          createdAt: new Date().toISOString(),
        }
        setTemplates([...templates, template])
        setNewTemplate({
          name: "",
          subject: "",
          content: "<p>Hello {{name}},</p><p>This is your email content.</p>",
        })
        setSuccessMessage("Template created successfully!")
        setErrorMessage("")
      } else {
        setErrorMessage("Please fill in all template fields")
        setSuccessMessage("")
      }
      setLoading(false)
    }, 1000)
  }

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending test email
    setTimeout(() => {
      if (testEmail.to && testEmail.subject && testEmail.content) {
        setSuccessMessage(`Test email sent to ${testEmail.to}!`)
        setErrorMessage("")
      } else {
        setErrorMessage("Please fill in all email fields")
        setSuccessMessage("")
      }
      setLoading(false)
    }, 1000)
  }

  const clearMessages = () => {
    setSuccessMessage("")
    setErrorMessage("")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "setup":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mailjet Configuration</h2>
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Mailjet API Key"
                />
              </div>

              <div>
                <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Mailjet Secret Key"
                />
              </div>

              <div>
                <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  From Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  id="fromName"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Company Name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect to Mailjet"}
              </button>
            </form>
          </div>
        )

      case "templates":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Email Templates</h2>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">Create New Template</h3>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Welcome Email"
                  />
                </div>

                <div>
                  <label htmlFor="templateSubject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="templateSubject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Welcome to our service!"
                  />
                </div>

                <div>
                  <label htmlFor="templateContent" className="block text-sm font-medium text-gray-700 mb-1">
                    HTML Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="templateContent"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="<p>Hello {{name}},</p><p>Welcome to our service!</p>"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Template"}
                </button>

                {!isConnected && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    Connect to Mailjet first to create templates
                  </p>
                )}
              </form>
            </div>

            <h3 className="text-lg font-medium mb-3">Your Templates</h3>
            {templates.length > 0 ? (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500">Subject: {template.subject}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                        View <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <FileText size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No templates created yet</p>
              </div>
            )}
          </div>
        )

      case "test":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>
            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label htmlFor="toEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  To Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="toEmail"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emailSubject"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Test Email Subject"
                />
              </div>

              <div>
                <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="emailContent"
                  value={testEmail.content}
                  onChange={(e) => setTestEmail({ ...testEmail, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="<p>This is a test email.</p>"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isConnected}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Test Email"}
              </button>

              {!isConnected && (
                <p className="text-sm text-amber-600 mt-2 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  Connect to Mailjet first to send test emails
                </p>
              )}
            </form>
          </div>
        )

      case "analytics":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Email Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Total Sent</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Open Rate</p>
                <p className="text-2xl font-bold">42.8%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3.2% from last month</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Click Rate</p>
                <p className="text-2xl font-bold">12.5%</p>
                <p className="text-xs text-red-600 mt-1">↓ 1.3% from last month</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Bounce Rate</p>
                <p className="text-2xl font-bold">0.8%</p>
                <p className="text-xs text-green-600 mt-1">↑ 0.2% from last month</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>

              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Welcome Email</p>
                      <p className="text-sm text-gray-500">Sent to 24 recipients</p>
                    </div>
                    <p className="text-sm text-gray-500">Today, 10:23 AM</p>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Newsletter</p>
                      <p className="text-sm text-gray-500">Sent to 156 recipients</p>
                    </div>
                    <p className="text-sm text-gray-500">Yesterday, 2:45 PM</p>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Product Update</p>
                      <p className="text-sm text-gray-500">Sent to 89 recipients</p>
                    </div>
                    <p className="text-sm text-gray-500">Jul 10, 9:12 AM</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Connect to Mailjet to view analytics</p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mailjet Integration</h1>
            <p className="text-gray-500 mt-1">Manage your email marketing campaigns</p>
          </div>

          <div className="flex items-center">
            <span className="text-sm mr-2">Status:</span>
            {isConnected ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check size={12} className="mr-1" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab("setup")
              clearMessages()
            }}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === "setup"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Settings size={16} className="mr-2" />
            Setup
          </button>

          <button
            onClick={() => {
              setActiveTab("templates")
              clearMessages()
            }}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === "templates"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <FileText size={16} className="mr-2" />
            Templates
          </button>

          <button
            onClick={() => {
              setActiveTab("test")
              clearMessages()
            }}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === "test"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Send size={16} className="mr-2" />
            Test Email
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics")
              clearMessages()
            }}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === "analytics"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <BarChart3 size={16} className="mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(successMessage || errorMessage) && (
        <div className="px-6 py-3 border-b border-gray-200">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
              <Check size={16} className="text-green-600 mr-2" />
              <span className="text-green-800 text-sm">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <AlertCircle size={16} className="text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white">{renderTabContent()}</div>
    </div>
  )
}

export default MailjetIntegration
