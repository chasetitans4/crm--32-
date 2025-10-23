"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"

import { useAppContext } from "../context/AppContext"
import { useClientActions } from "../hooks/useClientActions"
import { 
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, DollarSign, Users, 
  BarChart3, Clock, Plus, Filter, Search, Download, TrendingUp, 
  AlertCircle, Target, Calendar, Tag, Eye, EyeOff, Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import PipelineMetricsView from "./Pipeline/PipelineMetricsView"
import PipelineCardsView from "./Pipeline/PipelineCardsView"

// Types for new features
interface FilterOptions {
  valueRange: { min: number; max: number }
  dateRange: { start: Date | null; end: Date | null }
  tags: string[]
  searchTerm: string
}

interface StageMetrics {
  velocity: number
  bottleneck: boolean
  trend: 'up' | 'down' | 'stable'
  forecast: number
}

const Pipeline: React.FC = () => {
  const { state } = useAppContext()
  const { clients, salesStages } = state
  const { updateClientStage } = useClientActions()
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [animateCards, setAnimateCards] = useState(false)
  
  // New state for enhanced features
  const [viewMode, setViewMode] = useState<'cards' | 'kanban' | 'metrics'>('cards')
  const [filters, setFilters] = useState<FilterOptions>({
    valueRange: { min: 0, max: Infinity },
    dateRange: { start: null, end: null },
    tags: [],
    searchTerm: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [draggedClient, setDraggedClient] = useState<string | null>(null)
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)

  // Trigger animation on initial load
  useEffect(() => {
    setAnimateCards(true)
  }, [])

  // Calculate stage metrics for advanced analytics
  const calculateStageMetrics = (stageId: string): StageMetrics => {
    const stageClients = clients?.filter((client) => client.stage === stageId) || []
    const previousWeekClients = stageClients.filter(client => 
      client.daysInStage && client.daysInStage <= 7
    ).length
    const currentWeekClients = stageClients.length

    const velocity = previousWeekClients > 0 
      ? (currentWeekClients - previousWeekClients) / previousWeekClients 
      : 0

    const avgTimeInStage = stageClients.reduce((sum, client) => 
      sum + (client.daysInStage || 0), 0) / (stageClients.length || 1)
    
    const bottleneck = avgTimeInStage > 30 // 30 days as threshold

    const trend = velocity > 0.1 ? 'up' : velocity < -0.1 ? 'down' : 'stable'
    
    // Simple forecast based on current velocity
    const forecast = Math.round(currentWeekClients * (1 + velocity))

    return { velocity, bottleneck, trend, forecast }
  }

  // Enhanced filtering function
  const getFilteredClients = useMemo(() => {
    if (!clients) return []
    
    return clients.filter(client => {
      const value = Number.parseInt(String(client.value || 0).replace(/[^0-9]/g, "") || "0")
      
      // Value range filter
      if (value < filters.valueRange.min || value > filters.valueRange.max) return false
      
      // Search filter
      if (filters.searchTerm && !client.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !client.contact?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false
      
      // Date range filter (would need actual date fields in client object)
      // Tag filter (would need tags field in client object)
      
      return true
    })
  }, [clients, filters])

  // Function to get stage statistics with filtering
  const getStageStats = (stageId: string) => {
    const stageClients = getFilteredClients.filter((client) => client.stage === stageId)
    const stageValue = stageClients.reduce((sum, client) => {
      const value = Number.parseInt(String(client.value || 0).replace(/[^0-9]/g, "") || "0")
      return sum + value
    }, 0)

    const avgDaysInStage =
      stageClients.length > 0
        ? Math.round(stageClients.reduce((sum, client) => sum + (client.daysInStage || 0), 0) / stageClients.length)
        : 0

    return {
      count: stageClients.length,
      value: stageValue,
      avgDaysInStage,
      clients: stageClients.map(client => ({
        ...client,
        contact: client.contact || 'No contact'
      })),
    }
  }

  // Function to get stage color
  const getStageColor = (stageId: string, isHovered: boolean = false) => {
    const stage = salesStages?.find((s) => s.id === stageId)
    if (!stage) return "bg-gray-100 border-gray-200"

    const baseColors: Record<string, string> = {
      "1": "blue",
      "2": "indigo",
      "3": "purple",
      "4": "amber",
      "5": "emerald",
      "6": "rose",
      "lead": "blue",
      "qualified": "indigo",
      "discovery": "purple",
      "proposal": "amber",
      "negotiation": "orange",
      "closed-won": "emerald",
      "closed-lost": "rose"
    }

    const color = baseColors[stageId] || "gray"
    const intensity = isHovered ? "100" : "50"
    const borderIntensity = isHovered ? "300" : "200"
    const textIntensity = isHovered ? "800" : "700"

    return `bg-${color}-${intensity} border-${color}-${borderIntensity} text-${color}-${textIntensity}`
  }

  // Function to get stage progress color
  const getProgressColor = (stageId: string) => {
    const colors: Record<string, string> = {
      "1": "bg-blue-500",
      "2": "bg-indigo-500",
      "3": "bg-purple-500",
      "4": "bg-amber-500",
      "5": "bg-emerald-500",
      "6": "bg-rose-500",
      "lead": "bg-blue-500",
      "qualified": "bg-indigo-500",
      "discovery": "bg-purple-500",
      "proposal": "bg-amber-500",
      "negotiation": "bg-orange-500",
      "closed-won": "bg-emerald-500",
      "closed-lost": "bg-rose-500"
    }
    return colors[stageId] || "bg-gray-500"
  }

  // Function to calculate conversion rate between stages
  const getConversionRate = (currentStageId: string) => {
    if (!salesStages || salesStages.length === 0) return null

    const currentStageIndex = salesStages.findIndex((s) => s.id === currentStageId)
    if (currentStageIndex <= 0) return null

    const previousStageId = salesStages[currentStageIndex - 1].id
    const previousStageClients = getFilteredClients.filter((c) => c.stage === previousStageId).length
    const currentStageClients = getFilteredClients.filter((c) => c.stage === currentStageId).length

    if (previousStageClients === 0) return 0
    return Math.round((currentStageClients / previousStageClients) * 100)
  }

  // Toggle expanded stage
  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId)
  }

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    setDraggedClient(clientId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedClient !== null) {
      updateClientStage(draggedClient, stageId)
      setDraggedClient(null)
      setHoveredStage(null)
    }
  }

  // Bulk actions
  const handleBulkMove = (targetStageId: string) => {
    selectedClients.forEach(clientId => {
      updateClientStage(clientId, targetStageId)
    })
    setSelectedClients(new Set())
  }

  // Export functionality
  const exportPipelineData = () => {
    const data = salesStages?.map(stage => {
      const stats = getStageStats(stage.id)
      return {
        stage: stage.name,
        clients: stats.count,
        value: stats.value,
        avgDaysInStage: stats.avgDaysInStage,
        conversionRate: getConversionRate(stage.id)
      }
    })
    
    // Convert to CSV
    const csv = [
      ['Stage', 'Clients', 'Value', 'Avg Days', 'Conversion Rate'],
      ...(data?.map(row => [
        row.stage,
        row.clients,
        row.value,
        row.avgDaysInStage,
        row.conversionRate !== null ? `${row.conversionRate}%` : 'N/A'
      ]) || [])
    ].map(row => row.join(',')).join('\n')
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pipeline-export.csv'
    a.click()
  }

  if (!salesStages || !clients) {
    return (
      <div className="p-8">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total pipeline value
  const totalPipelineValue = getFilteredClients.reduce((sum, client) => {
    const value = Number.parseInt(String(client.value || 0).replace(/[^0-9]/g, "") || "0")
    return sum + value
  }, 0)

  return (
    <div className="p-6 md:p-8">
      {/* Header with enhanced controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
          <p className="text-gray-500 mt-1">
            Track and manage your sales opportunities • Total Value: ${totalPipelineValue.toLocaleString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-l-md border ${
                viewMode === 'cards' 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium border-t border-b ${
                viewMode === 'kanban' 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('metrics')}
              className={`px-3 py-1.5 text-sm font-medium rounded-r-md border ${
                viewMode === 'metrics' 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Metrics
            </button>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </button>
          
          <button 
            onClick={exportPipelineData}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </button>
          
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Analytics
          </button>
          
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Search clients..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.valueRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      valueRange: { ...prev.valueRange, min: Number(e.target.value) || 0 }
                    }))}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.valueRange.max === Infinity ? '' : filters.valueRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      valueRange: { ...prev.valueRange, max: Number(e.target.value) || Infinity }
                    }))}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="No limit"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => setFilters({
                    valueRange: { min: 0, max: Infinity },
                    dateRange: { start: null, end: null },
                    tags: [],
                    searchTerm: ''
                  })}
                  className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk actions bar */}
      {selectedClients.size > 0 && (
        <div className="mb-4 bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-900">
            {selectedClients.size} client{selectedClients.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <select 
              onChange={(e) => handleBulkMove(e.target.value)}
              className="text-sm rounded-md border-primary-300 text-primary-700 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Move to stage...</option>
              {salesStages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setSelectedClients(new Set())}
              className="text-sm text-primary-700 hover:text-primary-900"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Main content based on view mode */}
      {viewMode === 'metrics' ? (
        <PipelineMetricsView
          salesStages={salesStages}
          getStageStats={getStageStats}
          calculateStageMetrics={calculateStageMetrics}
          getConversionRate={getConversionRate}
        />
      ) : (
        <PipelineCardsView
          salesStages={salesStages}
          getStageStats={getStageStats}
          getConversionRate={getConversionRate}
          getStageColor={getStageColor}
          getProgressColor={getProgressColor}
          selectedClients={selectedClients}
          setSelectedClients={setSelectedClients}
          expandedStage={expandedStage}
          toggleStage={toggleStage}
          hoveredStage={hoveredStage}
          setHoveredStage={setHoveredStage}
          updateClientStage={updateClientStage}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          animateCards={animateCards}
          calculateStageMetrics={calculateStageMetrics}
          viewMode={viewMode as 'cards' | 'kanban'}
        />
      )}

      {/* Pipeline insights */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Pipeline Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-primary-700">Win Rate</div>
            <div className="text-2xl font-bold text-primary-900">
              {(() => {
                const closedWon = getFilteredClients.filter(c => c.stage === "5" || c.stage === "closed-won").length
                const closedLost = getFilteredClients.filter(c => c.stage === "6" || c.stage === "closed-lost").length
                const total = closedWon + closedLost
                return total > 0 ? Math.round((closedWon / total) * 100) : 0
              })()}%
            </div>
          </div>
          <div>
            <div className="text-sm text-primary-700">Avg. Deal Size</div>
            <div className="text-2xl font-bold text-primary-900">
              ${getFilteredClients.length > 0 
                ? Math.round(totalPipelineValue / getFilteredClients.length).toLocaleString()
                : 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-primary-700">Sales Velocity</div>
            <div className="text-2xl font-bold text-primary-900">
              {(() => {
                const avgCycleTime = getFilteredClients.reduce((sum, client) => 
                  sum + (client.daysInStage || 0), 0) / (getFilteredClients.length || 1)
                return avgCycleTime > 0 ? Math.round(30 / avgCycleTime * 100) / 100 : 0
              })()}<span className="text-sm font-normal text-primary-700"> deals/month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pipeline
