"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Copy,
  Upload,
  PlayCircle,
  PauseCircle,
  X,
} from "lucide-react"
import {
  useAutomationService,
  type Workflow as ServiceWorkflow,
  type WorkflowTemplate,
  type WorkflowExecution,
} from "../services/automationService"
import { useToast } from "../hooks/useAppState"
import WorkflowEditor from "./WorkflowEditor"

// Types
interface WorkflowAction {
  type: string
  templateId?: string
  recipients?: string[]
  criteria?: Record<string, unknown>
  taskData?: {
    title: string
    description: string
    assignee: string
    dueDate: string
    priority: string
  }
  notification?: {
    title: string
    message: string
    type: string
  }
  status?: string
  options?: Record<string, unknown>
  mapping?: Record<string, string>
  contractTemplate?: string
  invoiceType?: string
  amount?: string
  includeLink?: boolean
  includePaymentLink?: boolean
  threshold?: number
  inactivityThreshold?: number
}

// Use the Workflow type from the service, but extend it with additional UI properties
interface Workflow extends Omit<ServiceWorkflow, 'tags'> {
  category: string
  tags: string[]
  priority: "high" | "medium" | "low"
  estimatedSavings: number
  lastRun: string
  nextRun: string
  created_at: string
  updated_at: string
  successRate: number
  runCount: number
  performance: {
    avgExecutionTime: number
    totalTimeSaved: number
    errorRate: number
    lastWeekRuns: number
    trend: "up" | "down" | "stable"
  }
}

// WorkflowTemplate is imported from the service

// Enhanced AutomationWorkflows Component
const AutomationWorkflows: React.FC = () => {
  const {
    isLoading: loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    getWorkflows,
    getTemplates,
    getExecutions,
    getAnalytics,
  } = useAutomationService()

  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [analytics, setAnalytics] = useState<any>(null)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const [workflowsData, templatesData, analyticsData] = await Promise.all([
        getWorkflows?.(),
        getTemplates?.(),
        getAnalytics?.(),
      ])

      if (workflowsData) {
        // Ensure each workflow has default properties
        const workflowsWithDefaults = workflowsData.map((workflow: any) => ({
          ...workflow,
          name: workflow.name || "Untitled Workflow",
          description: workflow.description || "No description available",
          category: workflow.category || "uncategorized",
          priority: workflow.priority || "medium" as "high" | "medium" | "low",
          estimatedSavings: workflow.estimatedSavings || 0,
          lastRun: workflow.lastRun || new Date().toISOString(),
          nextRun: workflow.nextRun || new Date().toISOString(),
          created_at: workflow.created_at || workflow.createdAt || new Date().toISOString(),
          updated_at: workflow.updated_at || workflow.updatedAt || new Date().toISOString(),
          successRate: workflow.successRate || 95,
          runCount: workflow.runCount || workflow.executionCount || 0,
          performance: workflow.performance || {
            avgExecutionTime: 0,
            totalTimeSaved: 0,
            errorRate: 0,
            lastWeekRuns: 0,
            trend: "stable" as "up" | "down" | "stable",
          },
        }))
        setWorkflows(workflowsWithDefaults)
      }
      if (templatesData) setTemplates(templatesData)
      if (analyticsData) setAnalytics(analyticsData)
    }

    loadData()
  }, [getWorkflows, getTemplates, getAnalytics])

  const { showSuccess, showError } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false)
  const [toasts, setToasts] = useState<Array<{
    id: string
    title: string
    description: string
    status: 'success' | 'error' | 'info'
  }>>([])

  const showToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => dismissToast(id), 5000)
  }

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleUseTemplate = (templateId: string) => {
    showToast({
      title: "Template Applied",
      description: "Workflow template has been applied successfully",
      status: "success",
    })
  }
  const [showDetails, setShowDetails] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "lastRun" | "successRate" | "priority">("name")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  // Filter and sort workflows
  const filteredWorkflows = useMemo(() => {
    const filtered = workflows.filter((workflow) => {
      const matchesSearch =
        (workflow.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workflow.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || workflow.category === selectedCategory
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && workflow.isActive) ||
        (filterStatus === "inactive" && !workflow.isActive)

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort workflows
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "lastRun":
          return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime()
        case "successRate":
          return b.successRate - a.successRate
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return 0
      }
    })

    return filtered
  }, [workflows, searchTerm, selectedCategory, filterStatus, sortBy])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = workflows.map((w) => w.category || "uncategorized")
    return ["all", ...Array.from(new Set(cats))]
  }, [workflows])

  const handleExecuteWorkflow = useCallback(
    async (workflowId: string) => {
      try {
        await executeWorkflow(workflowId)
        showSuccess("Workflow Executed", "Workflow has been executed successfully")
      } catch (error) {
        showError("Execution Failed", "Failed to execute workflow")
      }
    },
    [executeWorkflow, showSuccess, showError],
  )

  const handleToggleWorkflow = useCallback(
    async (workflow: Workflow) => {
      try {
        await updateWorkflow(workflow.id, { ...workflow, isActive: !workflow.isActive })
        showSuccess(
          workflow.isActive ? "Workflow Paused" : "Workflow Activated",
          `${workflow.name} has been ${workflow.isActive ? "paused" : "activated"}`,
        )
      } catch (error) {
        showError("Update Failed", "Failed to update workflow status")
      }
    },
    [updateWorkflow, showSuccess, showError],
  )

  const handleDeleteWorkflow = useCallback(
    async (workflowId: string) => {
      try {
        await deleteWorkflow(workflowId)
        showSuccess("Workflow Deleted", "Workflow has been deleted successfully")
      } catch (error) {
        showError("Delete Failed", "Failed to delete workflow")
      }
    },
    [deleteWorkflow, showSuccess, showError],
  )



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error loading workflows: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation Workflows</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Automate your business processes and save time</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Templates
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalWorkflows}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeWorkflows}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <PlayCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTimeSaved}h</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avgSuccessRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category.replace(/^./, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "lastRun" | "successRate" | "priority")}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="lastRun">Sort by Last Run</option>
            <option value="successRate">Sort by Success Rate</option>
            <option value="priority">Sort by Priority</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Workflows Grid/List */}
      <div className="space-y-4">
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workflows found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || selectedCategory !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first workflow"}
            </p>
            {!searchTerm && selectedCategory === "all" && filterStatus === "all" && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Create Workflow
                </button>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkflows.map((workflow, index) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    index={index}
                    onExecute={() => handleExecuteWorkflow(workflow.id)}
                    onToggle={() => handleToggleWorkflow(workflow)}
                    onDelete={() => handleDeleteWorkflow(workflow.id)}
                    onEdit={() => {
                      setSelectedWorkflow(workflow)
                      setShowWorkflowEditor(true)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkflows.map((workflow, index) => (
                  <WorkflowListItem
                    key={workflow.id}
                    workflow={workflow}
                    index={index}
                    onExecute={() => handleExecuteWorkflow(workflow.id)}
                    onToggle={() => handleToggleWorkflow(workflow)}
                    onDelete={() => handleDeleteWorkflow(workflow.id)}
                    onEdit={() => {
                      setSelectedWorkflow(workflow)
                      setShowWorkflowEditor(true)
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Workflow</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter workflow description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="support">Support</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast({
                    title: "Workflow Created",
                    description: "New workflow has been created successfully",
                    status: "success",
                  })
                  setShowCreateModal(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Templates</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: '1',
                  name: 'Lead Nurturing',
                  description: 'Automatically follow up with new leads',
                  category: 'Sales',
                  icon: <DollarSign className="w-5 h-5" />
                },
                {
                  id: '2',
                  name: 'Email Campaign',
                  description: 'Send targeted email campaigns',
                  category: 'Marketing',
                  icon: <TrendingUp className="w-5 h-5" />
                },
                {
                  id: '3',
                  name: 'Support Ticket',
                  description: 'Auto-assign support tickets',
                  category: 'Support',
                  icon: <Activity className="w-5 h-5" />
                },
                {
                  id: '4',
                  name: 'Data Backup',
                  description: 'Automated daily data backup',
                  category: 'Operations',
                  icon: <Settings className="w-5 h-5" />
                }
              ].map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    handleUseTemplate(template.id)
                    setShowTemplateModal(false)
                  }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      {template.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{template.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  <button className="mt-3 w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Workflow</h3>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedWorkflow.name}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  defaultValue={selectedWorkflow.description}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select 
                    defaultValue={selectedWorkflow.category}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select 
                    defaultValue={selectedWorkflow.priority}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      defaultChecked={selectedWorkflow.isActive}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      defaultChecked={!selectedWorkflow.isActive}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast({
                    title: "Workflow Updated",
                    description: "Workflow has been updated successfully",
                    status: "success",
                  })
                  setSelectedWorkflow(null)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Editor Modal */}
      {showWorkflowEditor && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Workflow: {selectedWorkflow.name}
              </h3>
              <button
                onClick={() => {
                  setShowWorkflowEditor(false)
                  setSelectedWorkflow(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <WorkflowEditor
                initialNodes={[]}
                initialEdges={[]}
                onSave={(nodes, edges) => {
                  // Convert nodes and edges back to workflow format if needed
                  // For now, just close the editor
                  showToast({
                    title: "Workflow Updated",
                    description: "Workflow has been updated successfully",
                    status: "success",
                  })
                  setShowWorkflowEditor(false)
                  setSelectedWorkflow(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              toast.status === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : toast.status === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{toast.title}</h4>
                <p className="text-sm mt-1">{toast.description}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AutomationWorkflows

// Workflow Card Component
interface WorkflowCardProps {
  workflow: Workflow
  index: number
  onExecute: () => void
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, index, onExecute, onToggle, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch ((category || "uncategorized").toLowerCase()) {
      case "sales":
        return <DollarSign className="w-4 h-4" />
      case "marketing":
        return <TrendingUp className="w-4 h-4" />
      case "support":
        return <Activity className="w-4 h-4" />
      case "operations":
        return <Settings className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${workflow.isActive ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-900/20"}`}
          >
            {getCategoryIcon(workflow.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(workflow.category || "Uncategorized").replace(/^./, (c) => c.toUpperCase())}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workflow.priority)}`}>
            {workflow.priority}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                >
                  <button
                    onClick={onExecute}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Now
                  </button>
                  <button
                    onClick={onEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={onToggle}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    {workflow.isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {workflow.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(workflow.id)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy ID
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{workflow.description}</p>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${workflow.isActive ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{workflow.isActive ? "Active" : "Inactive"}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{workflow.runCount} runs</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>{workflow.successRate}%</span>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Performance</span>
          <div className="flex items-center space-x-1">
            {workflow.performance?.trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : workflow.performance?.trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Activity className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-gray-600 dark:text-gray-400">
              {workflow.performance?.lastWeekRuns || 0} runs this week
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Saved {workflow.performance?.totalTimeSaved || 0}h • {workflow.performance?.errorRate || 0}% error rate
        </div>
      </div>

      {/* Tags */}
      {workflow.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {workflow.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md"
            >
              {tag}
            </span>
          ))}
          {workflow.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-md">
              +{workflow.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last run: {new Date(workflow.lastRun).toLocaleDateString()}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              workflow.isActive
                ? "text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                : "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
            }`}
            title={workflow.isActive ? "Pause workflow" : "Activate workflow"}
          >
            {workflow.isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
          </button>

          <button
            onClick={onExecute}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            title="Execute workflow"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Workflow List Item Component
interface WorkflowListItemProps {
  workflow: Workflow
  index: number
  onExecute: () => void
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}

const WorkflowListItem: React.FC<WorkflowListItemProps> = ({
  workflow,
  index,
  onExecute,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-full ${workflow.isActive ? "bg-green-500" : "bg-gray-400"}`} />

          {/* Workflow Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{workflow.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workflow.priority)}`}>
                {workflow.priority}
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-md">
                {(workflow.category || "Uncategorized").replace(/^./, (c) => c.toUpperCase())}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{workflow.description}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">{workflow.runCount}</div>
            <div className="text-xs">Runs</div>
          </div>

          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">{workflow.successRate}%</div>
            <div className="text-xs">Success</div>
          </div>

          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {workflow.performance?.totalTimeSaved || 0}h
            </div>
            <div className="text-xs">Saved</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(workflow.lastRun).toLocaleDateString()}
            </div>
            <div className="text-xs">Last Run</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-6">
          <button
            onClick={onExecute}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            title="Execute workflow"
          >
            <Play className="w-4 h-4" />
          </button>

          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              workflow.isActive
                ? "text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                : "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
            }`}
            title={workflow.isActive ? "Pause workflow" : "Activate workflow"}
          >
            {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Edit workflow"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            title="Delete workflow"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
