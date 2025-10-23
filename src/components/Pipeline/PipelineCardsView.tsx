"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  DollarSign, 
  Clock, 
  BarChart3, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react"

interface Client {
  id: string
  name: string
  contact: string
  value: number
  stage: string
  daysInStage?: number
}

interface StageStats {
  count: number
  value: number
  avgDaysInStage: number
  clients: Client[]
}

interface SalesStage {
  id: string
  name: string
}

interface StageMetrics {
  velocity: number
  bottleneck: boolean
  trend: 'up' | 'down' | 'stable'
  forecast: number
}

interface PipelineCardsViewProps {
  salesStages: SalesStage[]
  getStageStats: (stageId: string) => StageStats
  getConversionRate: (stageId: string) => number | null
  getStageColor: (stageId: string, isHovered?: boolean) => string
  getProgressColor: (stageId: string) => string
  selectedClients: Set<string>
  setSelectedClients: (clients: Set<string>) => void
  expandedStage: string | null
  toggleStage: (stageId: string) => void
  hoveredStage: string | null
  setHoveredStage: (stageId: string | null) => void
  updateClientStage: (clientId: string, newStage: string) => void
  handleDragStart: (e: React.DragEvent, clientId: string) => void
  handleDrop: (e: React.DragEvent, targetStage: string) => void
  handleDragOver: (e: React.DragEvent) => void
  animateCards: boolean
  calculateStageMetrics: (stageId: string) => StageMetrics
  viewMode: 'cards' | 'kanban'
}

const PipelineCardsView: React.FC<PipelineCardsViewProps> = ({
  salesStages,
  getStageStats,
  getConversionRate,
  getStageColor,
  getProgressColor,
  selectedClients,
  setSelectedClients,
  expandedStage,
  toggleStage,
  hoveredStage,
  setHoveredStage,
  updateClientStage,
  handleDragStart,
  handleDrop,
  handleDragOver,
  animateCards,
  calculateStageMetrics,
  viewMode
}) => {
  return (
    <div className={viewMode === 'kanban' ? 'flex gap-4 overflow-x-auto pb-4' : 'grid grid-cols-1 lg:grid-cols-6 gap-4'}>
      {salesStages.map((stage) => {
        const stats = getStageStats(stage.id)
        const conversionRate = getConversionRate(stage.id)
        const isExpanded = expandedStage === stage.id
        const metrics = calculateStageMetrics(stage.id)

        return (
          <motion.div
            key={stage.id}
            className={`bg-white rounded-xl shadow-sm border ${
              isExpanded ? "lg:col-span-2" : ""
            } ${
              viewMode === 'kanban' ? 'min-w-[300px] flex-shrink-0' : ''
            } transition-all duration-300 ease-in-out ${
              hoveredStage === stage.id ? 'ring-2 ring-primary-400' : ''
            }`}
            initial={animateCards ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: salesStages.findIndex(s => s.id === stage.id) * 0.1 }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            onDragEnter={() => setHoveredStage(stage.id)}
            onDragLeave={() => setHoveredStage(null)}
          >
            <div className="p-4">
              {/* Stage header */}
              <div
                className={`p-4 rounded-t-xl cursor-pointer ${getStageColor(stage.id, hoveredStage === stage.id)} flex justify-between items-center`}
                onClick={() => toggleStage(stage.id)}
              >
                <div>
                  <h3 className="font-semibold flex items-center">
                    {stage.name}
                    {metrics.bottleneck && (
                      <AlertCircle className="h-4 w-4 ml-2 text-red-600" />
                    )}
                  </h3>
                  <div className="flex items-center mt-1 text-sm">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    <span>{stats.count} clients</span>
                    {metrics.trend !== 'stable' && (
                      <span className={`ml-2 text-xs ${
                        metrics.trend === 'up' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {metrics.trend === 'up' ? '↑' : '↓'} {Math.abs(metrics.velocity * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-semibold flex items-center">
                    <DollarSign className="h-3.5 w-3.5" />
                    {stats.value.toLocaleString()}
                  </div>
                  {viewMode === 'cards' && (
                    isExpanded ? <ChevronUp className="h-4 w-4 mt-1" /> : <ChevronDown className="h-4 w-4 mt-1" />
                  )}
                </div>
              </div>

              {/* Stage metrics */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-md p-2">
                  <div className="text-xs text-gray-500">Avg. Time</div>
                  <div className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                    {stats.avgDaysInStage} days
                  </div>
                </div>
                {conversionRate !== null && (
                  <div className="bg-gray-50 rounded-md p-2">
                    <div className="text-xs text-gray-500">Conversion</div>
                    <div className="font-medium flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1 text-gray-400" />
                      {conversionRate}%
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(stage.id)} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, stats.count * 10)}%` }}
                ></div>
              </div>

              {/* Client cards */}
              <AnimatePresence>
                {stats.clients.slice(0, viewMode === 'kanban' || isExpanded ? 10 : 3).map((client) => (
                  <motion.div
                    key={client.id}
                    className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-move ${
                      selectedClients.has(client.id) ? 'ring-2 ring-primary-400 bg-primary-50' : ''
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, client.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedClients)
                          if (e.target.checked) {
                            newSelected.add(client.id)
                          } else {
                            newSelected.delete(client.id)
                          }
                          setSelectedClients(newSelected)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {client.daysInStage || 0}d
                      </div>
                    </div>
                    
                    <div className="font-medium text-sm">{client.name}</div>
                    <div className="text-xs text-gray-500">{client.contact}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-medium">{client.value}</div>
                      <div className="flex gap-1">
                        <button
                          className="text-xs bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            const currentIndex = salesStages.findIndex((s) => s.id === stage.id)
                            if (currentIndex > 0) {
                              updateClientStage(client.id, salesStages[currentIndex - 1].id)
                            }
                          }}
                          disabled={salesStages.findIndex(s => s.id === stage.id) === 0}
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          className="text-xs bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            const currentIndex = salesStages.findIndex((s) => s.id === stage.id)
                            if (currentIndex < salesStages.length - 1) {
                              updateClientStage(client.id, salesStages[currentIndex + 1].id)
                            }
                          }}
                          disabled={salesStages.findIndex(s => s.id === stage.id) === salesStages.length - 1}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Show more button */}
              {stats.clients.length > (viewMode === 'kanban' || isExpanded ? 10 : 3) && (
                <button
                  className="w-full text-xs text-center py-1 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => toggleStage(stage.id)}
                >
                  {isExpanded ? "Show less" : `Show ${stats.clients.length - 3} more`}
                </button>
              )}

              {/* Empty state */}
              {stats.clients.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  <div className="mb-2">No clients in this stage</div>
                  {hoveredStage === stage.id && (
                    <div className="text-xs text-primary-600">Drop here to move client</div>
                  )}
                </div>
              )}

              {/* Quick actions for stage */}
              {viewMode === 'kanban' && (
                <div className="pt-3 border-t flex justify-between items-center">
                  <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                    <Plus className="h-3 w-3 mr-1" />
                    Add client
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Automate
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default PipelineCardsView