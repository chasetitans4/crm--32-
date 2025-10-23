"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useAppContext } from "../context/AppContext"
import {
  BarChart,
  DollarSign,
  Users,
  Calendar,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react"
import { motion } from "framer-motion"

// Chart component with enhanced visualization
const Chart: React.FC<{ data: number[]; labels: string[]; title: string }> = ({ data, labels, title }) => {
  const max = Math.max(...data, 10)

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      <div className="flex items-end h-40 gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-primary-100 hover:bg-primary-200 transition-colors rounded-t-sm relative group cursor-pointer"
              style={{ height: `${(value / max) * 100}%` }}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap z-10">
                {value.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">{labels[index]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Stat card component
const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  change?: { value: number; positive: boolean }
  color: string
  delay: number
}> = ({ title, value, icon, change, color, delay }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 flex items-center ${change.positive ? "text-emerald-600" : "text-rose-600"}`}>
              {change.positive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {change.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </motion.div>
  )
}

// Recent activity component
const ActivityItem: React.FC<{
  title: string
  description: string
  time: string
  icon: React.ReactNode
  iconColor: string
  index: number
}> = ({ title, description, time, icon, iconColor, index }) => {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
    >
      <div className={`mt-1.5 rounded-full p-2 ${iconColor}`}>{icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </motion.div>
  )
}

interface DashboardProps {
  setActiveTab?: (tab: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  // Safe context usage with fallback
  let state = null
  let context = null
  try {
    context = useAppContext()
    state = context?.state
  } catch (error) {
    console.warn("AppContext not available, using fallback data")
  }

  const { clients = [], tasks = [], events = [] } = state || {}

  useEffect(() => {
    // Simulate loading delay for animation purposes
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Safe calculation with fallbacks
  const calculateMetrics = () => {
    try {
      const totalValue = clients.reduce((sum, client) => {
        const clientValue = client?.value
        const valueStr = typeof clientValue === 'string' ? clientValue : String(clientValue || '0')
        const value = Number.parseInt(valueStr.replace(/[^0-9]/g, "") || "0")
        return sum + (isNaN(value) ? 0 : value)
      }, 0)

      const activeProjects = clients.reduce((sum, client) => sum + (client?.projects?.length || 0), 0)
      const activeClients = clients.filter((c) => c?.status === "active").length
      const completedTasks = tasks.filter((t) => t?.status === "DONE").length
      const pendingTasks = tasks.filter((t) => t?.status && t.status !== "DONE").length
      const upcomingEvents = events.filter((e) => new Date(e?.date || 0) > new Date()).length

      return {
        totalValue,
        activeProjects,
        activeClients,
        completedTasks,
        pendingTasks,
        upcomingEvents,
      }
    } catch (error) {
      console.warn("Error calculating metrics, using defaults:", error)
      return {
        totalValue: 0,
        activeProjects: 0,
        activeClients: 0,
        completedTasks: 0,
        pendingTasks: 0,
        upcomingEvents: 0,
      }
    }
  }

  const metrics = calculateMetrics()

  if (!isLoaded) {
    return (
      <div className="p-8">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <BarChart className="h-12 w-12 text-gray-300 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  // Mock data for charts
  const revenueData = [12500, 18200, 21300, 19800, 24100, 28500, 32100]
  const revenueLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]

  const clientsData = [5, 8, 12, 15, 18, 22, 25]
  const clientsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]

  // Mock recent activity
  const recentActivity = [
    {
      title: "New client added",
      description: "John Smith from Acme Inc. was added as a new client",
      time: "2 hours ago",
      icon: <Users className="h-4 w-4 text-white" />,
      iconColor: "bg-blue-500",
    },
    {
      title: "Task completed",
      description: "Send proposal to Globex Corporation",
      time: "4 hours ago",
      icon: <CheckSquare className="h-4 w-4 text-white" />,
      iconColor: "bg-emerald-500",
    },
    {
      title: "Meeting scheduled",
      description: "Product demo with TechCorp team",
      time: "Yesterday at 2:30 PM",
      icon: <Calendar className="h-4 w-4 text-white" />,
      iconColor: "bg-purple-500",
    },
    {
      title: "Deal closed",
      description: "Website redesign project with Initech",
      time: "Yesterday at 11:15 AM",
      icon: <DollarSign className="h-4 w-4 text-white" />,
      iconColor: "bg-amber-500",
    },
    {
      title: "Call completed",
      description: "Follow-up call with Jane from Massive Dynamic",
      time: "2 days ago",
      icon: <Phone className="h-4 w-4 text-white" />,
      iconColor: "bg-indigo-500",
    },
  ]

  // Mock upcoming tasks and events
  const upcomingItems = [
    {
      title: "Client meeting",
      description: "Discuss project requirements with Acme Inc.",
      time: "Today at 2:00 PM",
      icon: <Calendar className="h-4 w-4 text-white" />,
      iconColor: "bg-purple-500",
    },
    {
      title: "Send proposal",
      description: "Finalize and send proposal to TechCorp",
      time: "Tomorrow at 10:00 AM",
      icon: <Mail className="h-4 w-4 text-white" />,
      iconColor: "bg-blue-500",
    },
    {
      title: "Follow-up call",
      description: "Call John regarding the website project",
      time: "Tomorrow at 3:30 PM",
      icon: <Phone className="h-4 w-4 text-white" />,
      iconColor: "bg-indigo-500",
    },
  ]

  const completionRate =
    metrics.completedTasks + metrics.pendingTasks > 0
      ? Math.round((metrics.completedTasks / (metrics.completedTasks + metrics.pendingTasks)) * 100)
      : 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <motion.h1
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Dashboard
        </motion.h1>
        <motion.p
          className="text-gray-500 mt-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Welcome back! Here's an overview of your sales performance.
        </motion.p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Pipeline Value"
          value={`$${metrics.totalValue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
          change={{ value: 12, positive: true }}
          color="bg-emerald-50"
          delay={0.2}
        />
        <StatCard
          title="Active Clients"
          value={metrics.activeClients}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          change={{ value: 8, positive: true }}
          color="bg-blue-50"
          delay={0.3}
        />
        <StatCard
          title="Active Projects"
          value={metrics.activeProjects}
          icon={<Briefcase className="h-5 w-5 text-purple-500" />}
          change={{ value: 5, positive: true }}
          color="bg-purple-50"
          delay={0.4}
        />
        <StatCard
          title="Tasks Completion"
          value={`${completionRate}%`}
          icon={<CheckSquare className="h-5 w-5 text-amber-500" />}
          change={{ value: 3, positive: false }}
          color="bg-amber-50"
          delay={0.5}
        />
      </div>

      {/* KPI Summary */}
      <motion.div
        className="mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.55 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">Conversion Rate</h4>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">+5.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">24.8%</p>
            <p className="text-xs text-gray-500 mt-1">From proposals to signed contracts</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">Avg. Project Value</h4>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">+12.3%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">$8,240</p>
            <p className="text-xs text-gray-500 mt-1">Up from $7,335 last quarter</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">Client Retention</h4>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">+3.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">92.5%</p>
            <p className="text-xs text-gray-500 mt-1">Clients with repeat projects</p>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Chart data={revenueData} labels={revenueLabels} title="Revenue Trend (Last 7 Months)" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Chart data={clientsData} labels={clientsLabels} title="New Clients (Last 7 Months)" />
        </motion.div>
      </div>

      {/* Activity and upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                icon={activity.icon}
                iconColor={activity.iconColor}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Tasks & Events</h3>
          <div className="space-y-4">
            {upcomingItems.map((item, index) => (
              <ActivityItem
                key={index}
                title={item.title}
                description={item.description}
                time={item.time}
                icon={item.icon}
                iconColor={item.iconColor}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Deadlines */}
      <motion.div
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.0 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {[
            {
              project: "TechCorp Website Redesign",
              client: "TechCorp Solutions",
              deadline: "Tomorrow",
              status: "At Risk",
            },
            { project: "StartupXYZ Logo Design", client: "StartupXYZ", deadline: "In 3 days", status: "On Track" },
            {
              project: "Global Enterprises E-commerce",
              client: "Global Enterprises",
              deadline: "Next week",
              status: "On Track",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">{item.project}</h4>
                <p className="text-sm text-gray-500">{item.client}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{item.deadline}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === "At Risk" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
