"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Download,
  FileText,
  Database,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Briefcase,
  CheckSquare,
  Mail,
  DollarSign,
  BarChart3,
  X,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

const configService = {
  getFeature: (feature: string) => true, // Mock implementation
}

interface ExportJob {
  id: string
  name: string
  dataType: "clients" | "projects" | "tasks" | "leads" | "proposals" | "invoices" | "reports" | "analytics"
  format: "csv" | "xlsx" | "json" | "pdf"
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  filters: Record<string, any>
  fields: string[]
  totalRecords: number
  exportedRecords: number
  fileSize?: string
  downloadUrl?: string
  created_at: string
  completed_at?: string
  error?: string
}

interface ExportTemplate {
  id: string
  name: string
  dataType: string
  format: string
  fields: string[]
  filters: Record<string, any>
  isDefault: boolean
  created_at: string
}

const DataExport: React.FC = () => {
  const { state } = useAppContext()
  const { clients, tasks, projects } = state

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDataType, setSelectedDataType] = useState<string>("clients")
  const [selectedFormat, setSelectedFormat] = useState<string>("csv")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [exportFilters, setExportFilters] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"exports" | "templates">("exports")

  // Check if data export is enabled
  const isDataExportEnabled = configService.getFeature("enableDataExport")

  useEffect(() => {
    if (isDataExportEnabled) {
      loadExportJobs()
      loadExportTemplates()
    }
  }, [isDataExportEnabled])

  const loadExportJobs = async () => {
    setIsLoading(true)
    try {
      // Load export jobs from service (mock data for now)
      const mockJobs: ExportJob[] = [
        {
          id: "1",
          name: "All Clients Export",
          dataType: "clients",
          format: "xlsx",
          status: "completed",
          progress: 100,
          filters: {},
          fields: ["name", "email", "phone", "company", "status", "created_at"],
          totalRecords: 156,
          exportedRecords: 156,
          fileSize: "2.3 MB",
          downloadUrl: "/exports/clients_2025_01_30.xlsx",
          created_at: "2025-01-30T10:30:00Z",
          completed_at: "2025-01-30T10:32:15Z",
        },
        {
          id: "2",
          name: "Active Projects Report",
          dataType: "projects",
          format: "pdf",
          status: "processing",
          progress: 65,
          filters: { status: "active" },
          fields: ["name", "client", "status", "start_date", "end_date", "budget"],
          totalRecords: 23,
          exportedRecords: 15,
          created_at: "2025-01-30T11:15:00Z",
        },
        {
          id: "3",
          name: "Overdue Tasks",
          dataType: "tasks",
          format: "csv",
          status: "failed",
          progress: 0,
          filters: { status: "overdue" },
          fields: ["title", "assignee", "due_date", "priority", "project"],
          totalRecords: 8,
          exportedRecords: 0,
          created_at: "2025-01-30T09:45:00Z",
          error: "Database connection timeout",
        },
        {
          id: "4",
          name: "Monthly Analytics",
          dataType: "analytics",
          format: "json",
          status: "pending",
          progress: 0,
          filters: { date_range: "last_month" },
          fields: ["metrics", "charts", "insights"],
          totalRecords: 1,
          exportedRecords: 0,
          created_at: "2025-01-30T12:00:00Z",
        },
      ]
      setExportJobs(mockJobs)
    } catch (error) {
      console.error("Failed to load export jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadExportTemplates = async () => {
    try {
      // Load export templates from service (mock data for now)
      const mockTemplates: ExportTemplate[] = [
        {
          id: "1",
          name: "Client Contact List",
          dataType: "clients",
          format: "csv",
          fields: ["name", "email", "phone", "company"],
          filters: { status: "active" },
          isDefault: true,
          created_at: "2025-01-15T09:00:00Z",
        },
        {
          id: "2",
          name: "Project Summary Report",
          dataType: "projects",
          format: "pdf",
          fields: ["name", "client", "status", "budget", "progress"],
          filters: {},
          isDefault: false,
          created_at: "2025-01-20T14:30:00Z",
        },
        {
          id: "3",
          name: "Task Performance",
          dataType: "tasks",
          format: "xlsx",
          fields: ["title", "assignee", "status", "due_date", "completion_time"],
          filters: { completed: true },
          isDefault: false,
          created_at: "2025-01-25T11:15:00Z",
        },
      ]
      setExportTemplates(mockTemplates)
    } catch (error) {
      console.error("Failed to load export templates:", error)
    }
  }

  const getAvailableFields = (dataType: string) => {
    const fieldMappings = {
      clients: [
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "phone", label: "Phone" },
        { id: "company", label: "Company" },
        { id: "status", label: "Status" },
        { id: "created_at", label: "Created Date" },
        { id: "updated_at", label: "Updated Date" },
        { id: "address", label: "Address" },
        { id: "website", label: "Website" },
      ],
      projects: [
        { id: "name", label: "Project Name" },
        { id: "client", label: "Client" },
        { id: "status", label: "Status" },
        { id: "start_date", label: "Start Date" },
        { id: "end_date", label: "End Date" },
        { id: "budget", label: "Budget" },
        { id: "progress", label: "Progress" },
        { id: "description", label: "Description" },
      ],
      tasks: [
        { id: "title", label: "Task Title" },
        { id: "description", label: "Description" },
        { id: "assignee", label: "Assignee" },
        { id: "status", label: "Status" },
        { id: "priority", label: "Priority" },
        { id: "due_date", label: "Due Date" },
        { id: "project", label: "Project" },
        { id: "created_at", label: "Created Date" },
      ],
      leads: [
        { id: "name", label: "Lead Name" },
        { id: "email", label: "Email" },
        { id: "phone", label: "Phone" },
        { id: "company", label: "Company" },
        { id: "source", label: "Lead Source" },
        { id: "status", label: "Status" },
        { id: "value", label: "Estimated Value" },
        { id: "created_at", label: "Created Date" },
      ],
      proposals: [
        { id: "title", label: "Proposal Title" },
        { id: "client", label: "Client" },
        { id: "status", label: "Status" },
        { id: "total_amount", label: "Total Amount" },
        { id: "created_at", label: "Created Date" },
        { id: "sent_at", label: "Sent Date" },
        { id: "accepted_at", label: "Accepted Date" },
      ],
      invoices: [
        { id: "invoice_number", label: "Invoice Number" },
        { id: "client", label: "Client" },
        { id: "amount", label: "Amount" },
        { id: "status", label: "Status" },
        { id: "due_date", label: "Due Date" },
        { id: "created_at", label: "Created Date" },
        { id: "paid_at", label: "Paid Date" },
      ],
      reports: [
        { id: "title", label: "Report Title" },
        { id: "type", label: "Report Type" },
        { id: "data", label: "Report Data" },
        { id: "created_at", label: "Generated Date" },
      ],
      analytics: [
        { id: "metrics", label: "Key Metrics" },
        { id: "charts", label: "Chart Data" },
        { id: "insights", label: "Insights" },
        { id: "period", label: "Time Period" },
      ],
    }
    return fieldMappings[dataType as keyof typeof fieldMappings] || []
  }

  const handleCreateExport = async () => {
    if (selectedFields.length === 0) {
      alert("Please select at least one field to export")
      return
    }

    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `${selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)} Export`,
      dataType: selectedDataType as ExportJob["dataType"],
      format: selectedFormat as ExportJob["format"],
      status: "pending",
      progress: 0,
      filters: exportFilters,
      fields: selectedFields,
      totalRecords: 0,
      exportedRecords: 0,
      created_at: new Date().toISOString(),
    }

    setExportJobs((prev) => [newJob, ...prev])
    setShowCreateModal(false)
    resetForm()

    // Simulate export processing
    setTimeout(() => {
      setExportJobs((prev) =>
        prev.map((job) => (job.id === newJob.id ? { ...job, status: "processing", totalRecords: 50 } : job)),
      )
    }, 1000)

    // Simulate completion
    setTimeout(() => {
      setExportJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
                ...job,
                status: "completed",
                progress: 100,
                exportedRecords: 50,
                fileSize: "1.2 MB",
                downloadUrl: `/exports/${selectedDataType}_${Date.now()}.${selectedFormat}`,
                completed_at: new Date().toISOString(),
              }
            : job,
        ),
      )
    }, 5000)
  }

  const handleRetryExport = async (jobId: string) => {
    setExportJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: "pending", progress: 0, error: undefined } : job)),
    )
  }

  const handleCancelExport = async (jobId: string) => {
    setExportJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: "failed", error: "Cancelled by user" } : job)),
    )
  }

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      // In a real implementation, this would trigger the actual download
      alert(`Downloading ${job.name} (${job.fileSize})...`)
    }
  }

  const resetForm = () => {
    setSelectedDataType("clients")
    setSelectedFormat("csv")
    setSelectedFields([])
    setExportFilters({})
  }

  const getStatusIcon = (status: ExportJob["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: ExportJob["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "processing":
        return "text-blue-600 bg-blue-100"
      case "completed":
        return "text-green-600 bg-green-100"
      case "failed":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case "clients":
        return Users
      case "projects":
        return Briefcase
      case "tasks":
        return CheckSquare
      case "leads":
        return Mail
      case "proposals":
      case "invoices":
        return DollarSign
      case "reports":
      case "analytics":
        return BarChart3
      default:
        return Database
    }
  }

  if (!isDataExportEnabled) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Data Export Not Enabled</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Data export features are currently disabled. Please enable them in Settings to export your data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Export</h1>
          <p className="text-gray-600 mt-1">Export your data in various formats for backup or analysis</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          New Export
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Exports",
            value: exportJobs.length.toString(),
            icon: Download,
            color: "blue",
          },
          {
            title: "Completed",
            value: exportJobs.filter((job) => job.status === "completed").length.toString(),
            icon: CheckCircle,
            color: "green",
          },
          {
            title: "Processing",
            value: exportJobs.filter((job) => job.status === "processing").length.toString(),
            icon: RefreshCw,
            color: "blue",
          },
          {
            title: "Templates",
            value: exportTemplates.length.toString(),
            icon: FileText,
            color: "purple",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "exports", label: "Export Jobs", icon: Download },
            { id: "templates", label: "Templates", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Export Jobs Tab */}
      {activeTab === "exports" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Export Jobs</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {exportJobs.map((job, index) => {
              const DataTypeIcon = getDataTypeIcon(job.dataType)
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-md">
                          <DataTypeIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{job.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(job.status)}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                            >
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="capitalize">{job.dataType}</span>
                        <span>•</span>
                        <span className="uppercase">{job.format}</span>
                        <span>•</span>
                        <span>{job.fields.length} fields</span>
                        {job.totalRecords > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {job.exportedRecords}/{job.totalRecords} records
                            </span>
                          </>
                        )}
                        {job.fileSize && (
                          <>
                            <span>•</span>
                            <span>{job.fileSize}</span>
                          </>
                        )}
                      </div>
                      {job.status === "processing" && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {job.error && <div className="mt-2 text-sm text-red-600">Error: {job.error}</div>}
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === "completed" && job.downloadUrl && (
                        <button
                          onClick={() => handleDownload(job)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {job.status === "processing" && (
                        <button
                          onClick={() => handleCancelExport(job.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                          title="Cancel export"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      {job.status === "failed" && (
                        <button
                          onClick={() => handleRetryExport(job.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                          title="Retry export"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Export Templates</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Export templates feature would be implemented here with:</p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Pre-configured export settings</li>
                <li>• Reusable field selections</li>
                <li>• Scheduled exports</li>
                <li>• Template sharing</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeTab === "exports" && exportJobs.length === 0 && (
        <div className="text-center py-12">
          <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exports yet</h3>
          <p className="text-gray-600 mb-4">Create your first data export to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            New Export
          </button>
        </div>
      )}

      {/* Create Export Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create New Export</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Data Type and Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                  <select
                    value={selectedDataType}
                    onChange={(e) => {
                      setSelectedDataType(e.target.value)
                      setSelectedFields([])
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="clients">Clients</option>
                    <option value="projects">Projects</option>
                    <option value="tasks">Tasks</option>
                    <option value="leads">Leads</option>
                    <option value="proposals">Proposals</option>
                    <option value="invoices">Invoices</option>
                    <option value="reports">Reports</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Fields to Export</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {getAvailableFields(selectedDataType).map((field) => (
                    <label key={field.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields((prev) => [...prev, field.id])
                          } else {
                            setSelectedFields((prev) => prev.filter((f) => f !== field.id))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => {
                      const allFields = getAvailableFields(selectedDataType).map((f) => f.id)
                      setSelectedFields(allFields)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button onClick={() => setSelectedFields([])} className="text-sm text-gray-600 hover:text-gray-800">
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filters (Optional)</label>
                <div className="text-center py-4 border border-gray-200 rounded-md">
                  <Filter className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Advanced filtering options would be implemented here</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Start Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataExport
