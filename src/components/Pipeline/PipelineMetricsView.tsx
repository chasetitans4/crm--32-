"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, AlertCircle, TrendingUp } from "lucide-react"

interface StageMetrics {
  velocity: number
  bottleneck: boolean
  trend: 'up' | 'down' | 'stable'
  forecast: number
}

interface StageStats {
  count: number
  value: number
  avgDaysInStage: number
  clients: any[]
}

interface SalesStage {
  id: string
  name: string
}

interface PipelineMetricsViewProps {
  salesStages: SalesStage[]
  getStageStats: (stageId: string) => StageStats
  calculateStageMetrics: (stageId: string) => StageMetrics
  getConversionRate: (stageId: string) => number | null
}

const PipelineMetricsView: React.FC<PipelineMetricsViewProps> = ({
  salesStages,
  getStageStats,
  calculateStageMetrics,
  getConversionRate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {salesStages.map((stage) => {
        const stats = getStageStats(stage.id)
        const metrics = calculateStageMetrics(stage.id)
        const conversionRate = getConversionRate(stage.id)

        return (
          <motion.div
            key={stage.id}
            className="bg-white rounded-xl shadow-sm border p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: salesStages.findIndex(s => s.id === stage.id) * 0.05 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{stage.name}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{stats.count} clients</span>
                </div>
              </div>
              {metrics.bottleneck && (
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Bottleneck
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Value</span>
                <span className="font-semibold">${stats.value.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Avg. Cycle Time</span>
                <span className="font-medium">{stats.avgDaysInStage} days</span>
              </div>
              
              {conversionRate !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Conversion Rate</span>
                  <span className="font-medium">{conversionRate}%</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Velocity</span>
                <div className="flex items-center">
                  {metrics.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                  {metrics.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />}
                  <span className={`font-medium ${
                    metrics.trend === 'up' ? 'text-green-600' : 
                    metrics.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metrics.velocity > 0 ? '+' : ''}{(metrics.velocity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Forecast (Next Week)</span>
                  <span className="font-medium">{metrics.forecast} clients</span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default PipelineMetricsView