"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Globe,
  Lock,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Activity,
} from "lucide-react"
import type { AuditLogEntry } from "@/services/auditLogService"

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  warningEvents: number
  infoEvents: number
  uniqueUsers: number
  uniqueIPs: number
  failedLogins: number
  successfulLogins: number
  blockedRequests: number
  suspiciousActivity: number
}

interface FilterOptions {
  dateFrom: string
  dateTo: string
  eventType: string
  severity: string
  userId: string
  ipAddress: string
  searchTerm: string
}

const defaultFilters: FilterOptions = {
  dateFrom: "",
  dateTo: "",
  eventType: "",
  severity: "",
  userId: "",
  ipAddress: "",
  searchTerm: "",
}

const eventTypeColors = {
  auth: "bg-blue-100 text-blue-800",
  data: "bg-green-100 text-green-800",
  system: "bg-indigo-100 text-indigo-800",
  security: "bg-red-100 text-red-800",
  user: "bg-purple-100 text-purple-800",
  api: "bg-yellow-100 text-yellow-800",
}

const severityColors = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-blue-500 text-white",
  info: "bg-gray-500 text-white",
}

export const SecurityAudit: React.FC = () => {
  const [events, setEvents] = useState<AuditLogEntry[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AuditLogEntry[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadAuditData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [events, filters])

  const loadAuditData = async () => {
    try {
      setLoading(true)

      // Generate sample audit events for demonstration
      const sampleEvents: AuditLogEntry[] = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          category: "auth",
          severity: "low",
          userId: "user123",
          userEmail: "john.doe@example.com",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          action: "User logged in successfully",
          resource: "/auth/login",
          details: { method: "email_password", rememberMe: true },
          success: true,
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          category: "auth",
          severity: "medium",
          userId: "unknown",
          userEmail: "attacker@malicious.com",
          ipAddress: "10.0.0.1",
          userAgent: "curl/7.68.0",
          action: "Failed login attempt",
          resource: "/auth/login",
          details: { reason: "invalid_credentials", attempts: 3 },
          success: false,
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          category: "security",
          severity: "high",
          userId: "user456",
          userEmail: "jane.smith@example.com",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          action: "Account locked due to multiple failed login attempts",
          resource: "/auth/login",
          details: { lockoutDuration: 900, failedAttempts: 5 },
          success: false,
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 1000 * 60 * 90),
          category: "data",
          severity: "low",
          userId: "user123",
          userEmail: "john.doe@example.com",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          action: "Accessed customer data",
          resource: "/api/customers/12345",
          details: { customerId: "12345", dataFields: ["name", "email", "phone"] },
          success: true,
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          category: "security",
          severity: "critical",
          userId: "unknown",
          userEmail: "unknown",
          ipAddress: "203.0.113.1",
          userAgent: "sqlmap/1.4.7",
          action: "SQL injection attempt detected",
          resource: "/api/search",
          details: { payload: "'; DROP TABLE users; --", blocked: true },
          success: false,
        },
        {
          id: "6",
          timestamp: new Date(Date.now() - 1000 * 60 * 150),
          category: "auth",
          severity: "low",
          userId: "user789",
          userEmail: "bob.wilson@example.com",
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
          action: "Password changed successfully",
          resource: "/auth/change-password",
          details: { passwordStrength: "strong", forced: false },
          success: true,
        },
      ]

      setEvents(sampleEvents)

      // Calculate metrics
      const calculatedMetrics: SecurityMetrics = {
        totalEvents: sampleEvents.length,
        criticalEvents: sampleEvents.filter((e) => e.severity === "critical").length,
        warningEvents: sampleEvents.filter((e) => e.severity === "medium" || e.severity === "high").length,
        infoEvents: sampleEvents.filter((e) => e.severity === "low").length,
        uniqueUsers: new Set(sampleEvents.map((e) => e.userId)).size,
        uniqueIPs: new Set(sampleEvents.map((e) => e.ipAddress)).size,
        failedLogins: sampleEvents.filter((e) => e.category === "auth" && e.details?.success === false).length,
        successfulLogins: sampleEvents.filter((e) => e.category === "auth" && e.details?.success === true).length,
        blockedRequests: sampleEvents.filter((e) => e.details?.blocked === true).length,
        suspiciousActivity: sampleEvents.filter((e) => e.severity === "critical" || e.severity === "high").length,
      }

      setMetrics(calculatedMetrics)
    } catch (error) {
      console.error("Failed to load audit data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...events]

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((event) => event.timestamp >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter((event) => event.timestamp <= toDate)
    }

    // Event type filter
    if (filters.eventType) {
      filtered = filtered.filter((event) => event.category === filters.eventType)
    }

    // Severity filter
    if (filters.severity) {
      filtered = filtered.filter((event) => event.severity === filters.severity)
    }

    // User ID filter
    if (filters.userId) {
      filtered = filtered.filter(
        (event) =>
          (event.userId && event.userId.toLowerCase().includes(filters.userId.toLowerCase())) ||
          (event.userEmail && event.userEmail.toLowerCase().includes(filters.userId.toLowerCase())),
      )
    }

    // IP address filter
    if (filters.ipAddress) {
      filtered = filtered.filter((event) => event.ipAddress && event.ipAddress.includes(filters.ipAddress))
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.action.toLowerCase().includes(searchLower) ||
          event.resource.toLowerCase().includes(searchLower) ||
          JSON.stringify(event.details).toLowerCase().includes(searchLower),
      )
    }

    setFilteredEvents(filtered)
  }

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const exportAuditLog = async () => {
    try {
      setExporting(true)

      // Create CSV content
      const headers = [
        "Timestamp",
        "Event Type",
        "Severity",
        "User",
        "IP Address",
        "Action",
        "Resource",
        "Success",
        "Details",
      ]
      const csvContent = [
        headers.join(","),
        ...filteredEvents.map((event) =>
          [
            event.timestamp.toISOString(),
            event.category,
            event.severity,
            event.userEmail || event.userId,
            event.ipAddress,
            `"${event.action}"`,
            event.resource,
            event.success ? "Yes" : "No",
            `"${JSON.stringify(event.details)}"`,
          ].join(","),
        ),
      ].join("\n")

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `security-audit-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export audit log:", error)
    } finally {
      setExporting(false)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading audit data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Audit</h1>
          <p className="text-gray-600">Monitor and analyze security events and activities</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadAuditData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportAuditLog} variant="outline" size="sm" disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Events</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.uniqueUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.blockedRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <select
                id="eventType"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.eventType}
                onChange={(e) => updateFilter("eventType", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="auth">Authentication</option>
                <option value="data">Data Access</option>
                <option value="system">System Events</option>
                <option value="security">Security</option>
                <option value="user">User Actions</option>
                <option value="api">API Calls</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.severity}
                onChange={(e) => updateFilter("severity", e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User</Label>
              <Input
                id="userId"
                placeholder="User ID or email"
                value={filters.userId}
                onChange={(e) => updateFilter("userId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                placeholder="192.168.1.1"
                value={filters.ipAddress}
                onChange={(e) => updateFilter("ipAddress", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchTerm">Search</Label>
              <Input
                id="searchTerm"
                placeholder="Search in actions..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Security Events</span>
            </div>
            <Badge variant="outline">
              {filteredEvents.length} of {events.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No events found matching the current filters.</div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          className={
                            eventTypeColors[event.category as keyof typeof eventTypeColors] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {event.category.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className={severityColors[event.severity as keyof typeof severityColors]}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        {event.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>

                      <h3 className="font-medium text-gray-900 mb-1">{event.action}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(event.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{event.userEmail || event.userId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span>{event.ipAddress}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Lock className="h-3 w-3" />
                          <span>{event.resource}</span>
                        </div>
                      </div>

                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          <strong>Details:</strong> {JSON.stringify(event.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityAudit
