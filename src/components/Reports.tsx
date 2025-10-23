"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Phone, Mail, Calendar, Download, AlertCircle, Loader2, RefreshCw, TrendingUp, TrendingDown, X } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { exportClientsToCSV, exportTasksToCSV, exportEventsToCSV } from "../utils/exportData"
import { useErrorState, useAsyncOperation, handleAsyncOperation, DefaultErrorFallback } from "../utils/standardErrorHandling"

interface LoadingState {
  reports: boolean
  export: boolean
  refresh: boolean
}

interface ReportMetrics {
  totalValue: number
  averageDealSize: number
  activeClients: number
  closedWonRate: number
  taskCompletionRate: number
  upcomingEvents: number
}

const Reports: React.FC = () => {
  const { state } = useAppContext()
  const { clients, tasks, events, salesStages } = state
  const { hasError, error, setError, clearError, setLoading: setErrorLoading } = useErrorState()
  const exportOperation = useAsyncOperation()
  const [loading, setLoading] = useState<LoadingState>({
    reports: true,
    export: false,
    refresh: false,
  })
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Initialize reports
  useEffect(() => {
    const initializeReports = async () => {
      setLoading(prev => ({ ...prev, reports: true }))
      clearError()
      
      const result = await handleAsyncOperation(async () => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Set calculated metrics
        setMetrics(calculatedMetrics)
        setLastUpdated(new Date())
        
        return calculatedMetrics
      }, 'Initialize Reports')
      
      if (result.error) {
        setError(result.error)
      }
      
      setLoading(prev => ({ ...prev, reports: false }))
    }

    initializeReports()
  }, [clients, tasks, events, salesStages, clearError, setError])

  // Clear error after 5 seconds
  useEffect(() => {
    if (hasError && error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [hasError, error, clearError])

  // Memoized metrics calculation for better performance
  const calculatedMetrics = useMemo((): ReportMetrics => {
    const result = handleAsyncOperation(async () => {
      const totalValue = clients.reduce((sum, client) => {
        const value = typeof client.value === 'string' ? Number.parseInt((client.value as string).replace(/[^0-9]/g, "")) : client.value
        return sum + (isNaN(value) ? 0 : value)
      }, 0)

      const activeClientsCount = clients.filter((c) => c.status === "active").length
      const closedWonCount = clients.filter((c) => c.stage === "closed-won").length
      const completedTasksCount = tasks.filter((t) => t.status === "completed").length
      const upcomingEventsCount = events.filter((e) => new Date(e.date) >= new Date()).length

      return {
        totalValue,
        averageDealSize: clients.length > 0 ? totalValue / clients.length : 0,
        activeClients: activeClientsCount,
        closedWonRate: clients.length > 0 ? (closedWonCount / clients.length) * 100 : 0,
        taskCompletionRate: tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0,
        upcomingEvents: upcomingEventsCount,
      }
    }, 'Calculate Metrics')
    
    // For synchronous calculation, we'll handle it differently
    try {
      const totalValue = clients.reduce((sum, client) => {
        const value = typeof client.value === 'string' ? Number.parseInt((client.value as string).replace(/[^0-9]/g, "")) : client.value
        return sum + (isNaN(value) ? 0 : value)
      }, 0)

      const activeClientsCount = clients.filter((c) => c.status === "active").length
      const closedWonCount = clients.filter((c) => c.stage === "closed-won").length
      const completedTasksCount = tasks.filter((t) => t.status === "completed").length
      const upcomingEventsCount = events.filter((e) => new Date(e.date) >= new Date()).length

      return {
        totalValue,
        averageDealSize: clients.length > 0 ? totalValue / clients.length : 0,
        activeClients: activeClientsCount,
        closedWonRate: clients.length > 0 ? (closedWonCount / clients.length) * 100 : 0,
        taskCompletionRate: tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0,
        upcomingEvents: upcomingEventsCount,
      }
    } catch (err) {
      setError('Error calculating metrics')
      return {
        totalValue: 0,
        averageDealSize: 0,
        activeClients: 0,
        closedWonRate: 0,
        taskCompletionRate: 0,
        upcomingEvents: 0,
      }
    }
  }, [clients, tasks, events, setError])

  // Refresh reports with useCallback for performance
  const refreshReports = useCallback(async () => {
    setLoading(prev => ({ ...prev, refresh: true }))
    clearError()
    
    const result = await handleAsyncOperation(async () => {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMetrics(calculatedMetrics)
      setLastUpdated(new Date())
      
      return 'Reports refreshed successfully!'
    }, 'Refresh Reports')
    
    if (result.error) {
      setError(result.error)
    }
    
    setLoading(prev => ({ ...prev, refresh: false }))
  }, [calculatedMetrics, clearError, setError])

  // Enhanced export function with error handling and useCallback
  const handleExport = useCallback(async (exportFunction: () => void, dataType: string) => {
    const result = await exportOperation.execute(async () => {
      setLoading(prev => ({ ...prev, export: true }))
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      exportFunction()
      
      setLoading(prev => ({ ...prev, export: false }))
      return `${dataType} exported successfully!`
    }, `Export ${dataType}`)
    
    if (result.error) {
      setError(result.error)
      setLoading(prev => ({ ...prev, export: false }))
    }
  }, [exportOperation, setError])

  // Retry function with useCallback
  const retryOperation = useCallback(() => {
    clearError()
    window.location.reload()
  }, [clearError])

  // Memoized total value calculation
  const totalValue = useMemo(() => {
    return clients.reduce((sum, client) => {
      const value = typeof client.value === 'string' ? Number.parseInt((client.value as string).replace(/[^0-9]/g, "")) : client.value
      return sum + value
    }, 0)
  }, [clients])

  // Memoized stage statistics calculation
  const stageStats = useMemo(() => {
    return salesStages.map((stage) => {
      const stageClients = clients.filter((client) => client.stage === stage.id)
      const stageValue = stageClients.reduce((sum, client) => {
        const value = typeof client.value === 'string' ? Number.parseInt((client.value as string).replace(/[^0-9]/g, "")) : client.value
        return sum + value
      }, 0)

      return {
        stage: stage.name,
        clients: stageClients.length,
        value: stageValue,
        percentage: totalValue > 0 ? ((stageValue / totalValue) * 100).toFixed(1) : 0,
      }
    })
  }, [salesStages, clients, totalValue])

  // Memoized task statistics calculation
  const taskStats = useMemo(() => {
    const pendingTasks = tasks.filter((t) => t.status === "pending").length
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const completionRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : '0'
    
    return {
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      completionRate
    }
  }, [tasks])

  // Memoized event statistics calculation
  const eventStats = useMemo(() => {
    const meetings = events.filter((e) => e.type === "meeting").length
    const calls = events.filter((e) => e.type === "call").length
    const deadlines = events.filter((e) => e.type === "deadline").length
    const internal = events.filter((e) => e.type === "internal").length
    
    const upcomingEvents = events
      .filter((e) => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
    
    return {
      meetings,
      calls,
      deadlines,
      internal,
      upcomingEvents
    }
  }, [events])

  // Memoized recent activity calculation
  const recentActivity = useMemo(() => {
    return clients
      .flatMap((client) =>
        client.notes.map((note) => ({
          ...note,
          clientName: client.name,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [clients])

  // Loading state
  if (loading.reports) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 size={48} className="text-blue-600 mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Reports</h3>
          <p className="text-gray-500">Please wait while we generate your analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <button
          onClick={refreshReports}
          disabled={loading.refresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.refresh ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          {loading.refresh ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pipeline by Stage</h3>
            <button
              onClick={() => handleExport(() => exportClientsToCSV(clients), 'Clients')}
              disabled={loading.export}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export clients data to CSV"
            >
              {loading.export ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {loading.export ? 'Exporting...' : 'Export'}
            </button>
          </div>
          <div className="space-y-4">
            {stageStats.map((stat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{stat.stage}</span>
                  <span>
                    {stat.clients} clients - ${stat.value.toLocaleString()} ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Pipeline Value</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${metrics?.totalValue.toLocaleString() || '0'}</span>
                <TrendingUp size={16} className="text-green-500" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Deal Size</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${metrics?.averageDealSize.toLocaleString() || '0'}</span>
                <TrendingUp size={16} className="text-green-500" />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Clients</span>
              <span className="font-medium">{metrics?.activeClients || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Closed Won Rate</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{metrics?.closedWonRate.toFixed(1) || '0'}%</span>
                {(metrics?.closedWonRate || 0) > 50 ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Task Summary</h3>
            <button
              onClick={() => handleExport(() => exportTasksToCSV(tasks), 'Tasks')}
              disabled={loading.export}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export tasks data to CSV"
            >
              {loading.export ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {loading.export ? 'Exporting...' : 'Export'}
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {taskStats.pending}
                </div>
                <div className="text-sm text-blue-600">Pending</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-700">
                  {taskStats.inProgress}
                </div>
                <div className="text-sm text-yellow-600">In Progress</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">
                  {taskStats.completed}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Rate</span>
                <span>
                  {taskStats.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${taskStats.completionRate}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Calendar Events</h3>
            <button
              onClick={() => handleExport(() => exportEventsToCSV(events), 'Events')}
              disabled={loading.export}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export events data to CSV"
            >
              {loading.export ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {loading.export ? 'Exporting...' : 'Export'}
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-700">
                  {eventStats.meetings}
                </div>
                <div className="text-xs text-blue-600">Meetings</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-700">{eventStats.calls}</div>
                <div className="text-xs text-green-600">Calls</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-red-700">
                  {eventStats.deadlines}
                </div>
                <div className="text-xs text-red-600">Deadlines</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-gray-700">
                  {eventStats.internal}
                </div>
                <div className="text-xs text-gray-600">Internal</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Upcoming Events</div>
              <div className="space-y-2">
                {eventStats.upcomingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <span className="text-gray-500">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity Summary</h3>
        <div className="space-y-2">
          {recentActivity.map((note, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm py-2 border-b">
              <div className="flex items-center gap-3">
                {note.type === "call" && <Phone size={16} className="text-blue-600" />}
                {note.type === "email" && <Mail size={16} className="text-green-600" />}
                {note.type === "meeting" && <Calendar size={16} className="text-purple-600" />}
                <div>
                  <span className="font-medium">{note.clientName}</span>
                  <span className="text-gray-500 ml-2">{note.content}</span>
                </div>
              </div>
              <span className="text-gray-400">{note.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {hasError && error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <DefaultErrorFallback
            error={error}
            retry={clearError}
          />
        </div>
      )}
    </div>
  )
}

export default Reports
