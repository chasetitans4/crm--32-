"use client";

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Users,
  DollarSign,
  Target,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

const configService = {
  getFeature: (feature: string) => true, // Mock implementation
}

const analyticsService = {
  calculateMetrics: async (dateRange?: any) => {
    return [] // Mock implementation
  },
}

interface AnalyticsMetric {
  id: string
  name: string
  value: number | string
  change: number
  trend: "up" | "down" | "stable"
  category: "sales" | "clients" | "tasks" | "revenue" | "performance"
  period: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    fill?: boolean
  }[]
}

const AdvancedAnalytics: React.FC = () => {
  const { state } = useAppContext()
  const { clients, tasks } = state

  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [chartData, setChartData] = useState<Record<string, ChartData>>({})
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Check if advanced analytics is enabled
  const isAdvancedAnalyticsEnabled = configService.getFeature("enableAdvancedAnalytics")

  useEffect(() => {
    if (isAdvancedAnalyticsEnabled) {
      loadAnalyticsData()
    }
  }, [selectedPeriod, selectedCategory, isAdvancedAnalyticsEnabled])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Calculate date range based on selected period
      const endDate = new Date()
      const startDate = new Date()

      switch (selectedPeriod) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(endDate.getDate() - 30)
          break
        case "90d":
          startDate.setDate(endDate.getDate() - 90)
          break
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Load metrics from analytics service
      const analyticsMetrics = await analyticsService.calculateMetrics({ start: startDate, end: endDate })
      setMetrics(analyticsMetrics)

      // Generate chart data
      const charts = await generateChartData(startDate, endDate)
      setChartData(charts)

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateChartData = async (startDate: Date, endDate: Date): Promise<Record<string, ChartData>> => {
    // Generate sample chart data based on actual data
    const salesData = generateSalesChart()
    const clientsData = generateClientsChart()
    const tasksData = generateTasksChart()
    const revenueData = generateRevenueChart()

    return {
      sales: salesData,
      clients: clientsData,
      tasks: tasksData,
      revenue: revenueData,
    }
  }

  const generateSalesChart = (): ChartData => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const data = [12, 19, 15, 25, 22, 30]

    return {
      labels,
      datasets: [
        {
          label: "Sales",
          data,
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgb(59, 130, 246)",
          fill: true,
        },
      ],
    }
  }

  const generateClientsChart = (): ChartData => {
    const stageData =
      clients?.reduce(
        (acc, client) => {
          acc[client.stage] = (acc[client.stage] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    return {
      labels: Object.keys(stageData),
      datasets: [
        {
          label: "Clients by Stage",
          data: Object.values(stageData),
          backgroundColor: ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#6B7280"],
        },
      ],
    }
  }

  const generateTasksChart = (): ChartData => {
    const statusData =
      tasks?.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    return {
      labels: Object.keys(statusData),
      datasets: [
        {
          label: "Tasks by Status",
          data: Object.values(statusData),
          backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        },
      ],
    }
  }

  const generateRevenueChart = (): ChartData => {
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
    const data = [15000, 22000, 18000, 28000]

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data,
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgb(16, 185, 129)",
          fill: true,
        },
      ],
    }
  }

  const exportData = async (format: "csv" | "excel" | "pdf") => {
    try {
      // This would integrate with the data export service
      // Export analytics data
      // await dataExportService.exportAnalytics(metrics, chartData, format)
      alert(`Analytics data exported as ${format.toUpperCase()}`)
    } catch (error) {
      // Handle export error
    }
  }

  const refreshData = () => {
    loadAnalyticsData()
  }

  if (!isAdvancedAnalyticsEnabled) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Advanced Analytics Not Enabled</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Advanced analytics features are currently disabled. Please enable them in Settings to access detailed
            insights and reporting.
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
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Last updated: {lastUpdated.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="sales">Sales</option>
            <option value="clients">Clients</option>
            <option value="tasks">Tasks</option>
            <option value="revenue">Revenue</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="relative">
            <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover:block">
              <button
                onClick={() => exportData("csv")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export as CSV
              </button>
              <button
                onClick={() => exportData("excel")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export as Excel
              </button>
              <button
                onClick={() => exportData("pdf")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Revenue",
            value: "$83,200",
            change: 12.5,
            trend: "up" as const,
            icon: DollarSign,
            color: "green",
          },
          {
            title: "Active Clients",
            value: clients?.length.toString() || "0",
            change: 8.2,
            trend: "up" as const,
            icon: Users,
            color: "blue",
          },
          {
            title: "Completed Tasks",
            value: tasks?.filter((t) => t.status === "COMPLETED").length.toString() || "0",
            change: -2.1,
            trend: "down" as const,
            icon: CheckCircle2,
            color: "purple",
          },
          {
            title: "Conversion Rate",
            value: "24.8%",
            change: 5.3,
            trend: "up" as const,
            icon: Target,
            color: "orange",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {metric.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Sales trend chart would be rendered here</p>
          </div>
        </motion.div>

        {/* Client Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Client distribution chart would be rendered here</p>
          </div>
        </motion.div>

        {/* Task Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Performance</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Task performance chart would be rendered here</p>
          </div>
        </motion.div>

        {/* Revenue Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Revenue analytics chart would be rendered here</p>
          </div>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Top Performing Stage</h4>
            </div>
            <p className="text-sm text-blue-700 mt-1">Proposal stage has the highest conversion rate at 68%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Average Deal Time</h4>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Deals close in an average of 23 days, 15% faster than last month
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-900">Goal Progress</h4>
            </div>
            <p className="text-sm text-purple-700 mt-1">82% of monthly revenue goal achieved with 8 days remaining</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdvancedAnalytics
