"use client"

import type React from "react"
import { useState } from "react"
import { Users, DollarSign, Calendar, Award, Download, Phone, Mail, FileText, CheckSquare } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import type { SalesMetric } from "../types"

const SalesPerformance: React.FC = () => {
  const { state } = useAppContext()

  // Sample sales agents
  const salesAgents = [
    { id: 1, name: "John Smith", avatar: "JS", role: "Senior Sales Rep" },
    { id: 2, name: "Sarah Johnson", avatar: "SJ", role: "Sales Manager" },
    { id: 3, name: "Michael Chen", avatar: "MC", role: "Sales Rep" },
    { id: 4, name: "Emily Davis", avatar: "ED", role: "Junior Sales Rep" },
  ]

  // Sample sales metrics
  const [salesMetrics, setSalesMetrics] = useState<SalesMetric[]>([
    {
      id: 1,
      agentId: 1,
      period: "May 2025",
      leads: 32,
      calls: 85,
      meetings: 15,
      proposals: 12,
      closedDeals: 8,
      revenue: 42000,
      conversionRate: 25,
    },
    {
      id: 2,
      agentId: 2,
      period: "May 2025",
      leads: 45,
      calls: 110,
      meetings: 22,
      proposals: 18,
      closedDeals: 12,
      revenue: 68000,
      conversionRate: 26.7,
    },
    {
      id: 3,
      agentId: 3,
      period: "May 2025",
      leads: 28,
      calls: 72,
      meetings: 14,
      proposals: 10,
      closedDeals: 6,
      revenue: 35000,
      conversionRate: 21.4,
    },
    {
      id: 4,
      agentId: 4,
      period: "May 2025",
      leads: 20,
      calls: 60,
      meetings: 8,
      proposals: 6,
      closedDeals: 3,
      revenue: 18000,
      conversionRate: 15,
    },
  ])

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState<string>("May 2025")
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)

  // Get agent by ID
  const getAgentById = (id: number) => {
    return salesAgents.find((agent) => agent.id === id) || null
  }

  // Filter metrics based on selected period and agent
  const filteredMetrics = salesMetrics.filter((metric) => {
    if (selectedPeriod && metric.period !== selectedPeriod) return false
    if (selectedAgent !== null && metric.agentId !== selectedAgent) return false
    return true
  })

  // Calculate team totals
  const calculateTeamTotals = () => {
    return filteredMetrics.reduce(
      (totals, metric) => {
        return {
          leads: totals.leads + metric.leads,
          calls: totals.calls + metric.calls,
          meetings: totals.meetings + metric.meetings,
          proposals: totals.proposals + metric.proposals,
          closedDeals: totals.closedDeals + metric.closedDeals,
          revenue: totals.revenue + metric.revenue,
          conversionRate:
            filteredMetrics.length > 0
              ? ((totals.closedDeals + metric.closedDeals) / (totals.proposals + metric.proposals)) * 100
              : 0,
        }
      },
      { leads: 0, calls: 0, meetings: 0, proposals: 0, closedDeals: 0, revenue: 0, conversionRate: 0 },
    )
  }

  const teamTotals = calculateTeamTotals()

  // Find top performer
  const findTopPerformer = () => {
    if (filteredMetrics.length === 0) return null

    const topPerformer = filteredMetrics.reduce((top, current) => {
      return current.revenue > top.revenue ? current : top
    }, filteredMetrics[0])

    return {
      agent: getAgentById(topPerformer.agentId),
      metrics: topPerformer,
    }
  }

  const topPerformer = findTopPerformer()

  // Recent activities (would be fetched from API in a real app)
  const recentActivities = [
    { id: 1, agentId: 1, type: "call", client: "TechCorp Solutions", date: "2025-05-14", status: "completed" },
    { id: 2, agentId: 2, type: "meeting", client: "StartupXYZ", date: "2025-05-13", status: "completed" },
    { id: 3, agentId: 3, type: "proposal", client: "Global Enterprises", date: "2025-05-12", status: "pending" },
    { id: 4, agentId: 1, type: "email", client: "Smith Dental Care", date: "2025-05-11", status: "completed" },
    { id: 5, agentId: 4, type: "call", client: "Green Lawn Services", date: "2025-05-10", status: "completed" },
  ]

  // Generate PDF report
  const generatePDFReport = () => {
    alert("PDF report generation would be implemented here")
    // In a real implementation, this would generate a PDF with the sales performance data
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sales Performance Dashboard</h2>
        <button
          onClick={generatePDFReport}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance Overview</h3>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="May 2025">May 2025</option>
                <option value="April 2025">April 2025</option>
                <option value="March 2025">March 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sales Agent</label>
              <select
                value={selectedAgent || ""}
                onChange={(e) => setSelectedAgent(e.target.value ? Number.parseInt(e.target.value) : null)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">All Agents</option>
                {salesAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-blue-600" size={18} />
              <div className="text-sm text-blue-800 font-medium">Total Leads</div>
            </div>
            <div className="text-2xl font-bold">{teamTotals.leads}</div>
            <div className="text-xs text-blue-600 mt-1">
              {selectedAgent === null ? "Across all agents" : `For ${getAgentById(selectedAgent)?.name}`}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="text-green-600" size={18} />
              <div className="text-sm text-green-800 font-medium">Closed Deals</div>
            </div>
            <div className="text-2xl font-bold">{teamTotals.closedDeals}</div>
            <div className="text-xs text-green-600 mt-1">{teamTotals.conversionRate.toFixed(1)}% conversion rate</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-purple-600" size={18} />
              <div className="text-sm text-purple-800 font-medium">Proposals</div>
            </div>
            <div className="text-2xl font-bold">{teamTotals.proposals}</div>
            <div className="text-xs text-purple-600 mt-1">
              {((teamTotals.closedDeals / teamTotals.proposals) * 100).toFixed(1)}% close rate
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-orange-600" size={18} />
              <div className="text-sm text-orange-800 font-medium">Revenue</div>
            </div>
            <div className="text-2xl font-bold">${teamTotals.revenue.toLocaleString()}</div>
            <div className="text-xs text-orange-600 mt-1">
              Avg ${(teamTotals.revenue / teamTotals.closedDeals).toLocaleString()} per deal
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h4 className="font-medium mb-3">Agent Performance</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leads
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calls
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meetings
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proposals
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMetrics.map((metric) => {
                    const agent = getAgentById(metric.agentId)
                    return (
                      <tr key={metric.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              {agent?.avatar}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{agent?.name}</div>
                              <div className="text-xs text-gray-500">{agent?.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{metric.leads}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{metric.calls}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{metric.meetings}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{metric.proposals}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{metric.closedDeals}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          ${metric.revenue.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-1">
            {topPerformer && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-1">
                  <Award className="text-yellow-500" size={18} />
                  Top Performer
                </h4>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                    {topPerformer.agent?.avatar}
                  </div>
                  <div className="ml-3">
                    <div className="text-lg font-medium">{topPerformer.agent?.name}</div>
                    <div className="text-sm text-gray-500">{topPerformer.agent?.role}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Closed Deals:</span>
                    <span className="font-medium">{topPerformer.metrics.closedDeals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">${topPerformer.metrics.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium">{topPerformer.metrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Deal Size:</span>
                    <span className="font-medium">
                      ${(topPerformer.metrics.revenue / topPerformer.metrics.closedDeals).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-3">Recent Activities</h4>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const agent = getAgentById(activity.agentId)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      {activity.type === "call" && <Phone size={16} className="text-blue-600 mt-0.5" />}
                      {activity.type === "meeting" && <Calendar size={16} className="text-purple-600 mt-0.5" />}
                      {activity.type === "proposal" && <FileText size={16} className="text-orange-600 mt-0.5" />}
                      {activity.type === "email" && <Mail size={16} className="text-green-600 mt-0.5" />}
                      <div className="flex-1">
                        <div className="font-medium">
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} with {activity.client}
                        </div>
                        <div className="text-gray-500 flex justify-between mt-1">
                          <span>{agent?.name}</span>
                          <span>{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sales Funnel</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Leads ({teamTotals.leads})</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calls ({teamTotals.calls})</span>
                <span>{((teamTotals.calls / teamTotals.leads) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${(teamTotals.calls / teamTotals.leads) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Meetings ({teamTotals.meetings})</span>
                <span>{((teamTotals.meetings / teamTotals.leads) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${(teamTotals.meetings / teamTotals.leads) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Proposals ({teamTotals.proposals})</span>
                <span>{((teamTotals.proposals / teamTotals.leads) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${(teamTotals.proposals / teamTotals.leads) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Closed Deals ({teamTotals.closedDeals})</span>
                <span>{((teamTotals.closedDeals / teamTotals.leads) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${(teamTotals.closedDeals / teamTotals.leads) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Conversion Rate Analysis</div>
              <p className="text-sm mt-1">
                The team's overall conversion rate from proposal to closed deal is{" "}
                {((teamTotals.closedDeals / teamTotals.proposals) * 100).toFixed(1)}%.
                {(teamTotals.closedDeals / teamTotals.proposals) * 100 > 25
                  ? " This is above the industry average of 25%."
                  : " This is below the industry average of 25%. Consider implementing additional sales training."}
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium">Lead Quality</div>
              <p className="text-sm mt-1">
                {(teamTotals.meetings / teamTotals.leads) * 100 > 40
                  ? "Your team is converting a high percentage of leads to meetings, indicating good lead quality and effective initial outreach."
                  : "Your team's lead-to-meeting conversion rate is below target. Consider reviewing lead sources and initial outreach strategies."}
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium">Deal Size</div>
              <p className="text-sm mt-1">
                Average deal size is ${(teamTotals.revenue / teamTotals.closedDeals).toLocaleString()}.
                {teamTotals.revenue / teamTotals.closedDeals > 5000
                  ? " This is above your target of $5,000 per deal."
                  : " This is below your target of $5,000 per deal. Consider focusing on higher-value services or upselling strategies."}
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium">Recommended Actions</div>
              <ul className="text-sm mt-1 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Focus on improving proposal-to-close ratio through better follow-up strategies</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Implement weekly sales training sessions focused on objection handling</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Review pricing strategy to increase average deal size</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesPerformance
