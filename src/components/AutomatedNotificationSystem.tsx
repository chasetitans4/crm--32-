"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Switch } from "./ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
} from "lucide-react"

interface NotificationRule {
  id: string
  name: string
  description: string
  trigger: string
  channels: ("email" | "sms" | "push" | "in-app")[]
  enabled: boolean
  frequency: "immediate" | "daily" | "weekly"
  priority: "low" | "medium" | "high" | "critical"
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  read: boolean
  channel: "email" | "sms" | "push" | "in-app"
  priority: "low" | "medium" | "high" | "critical"
}

interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  soundEnabled: boolean
}

const AutomatedNotificationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState("notifications")

  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
    soundEnabled: true,
  })

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: "1",
      name: "New Lead Assignment",
      description: "Notify when a new lead is assigned to you",
      trigger: "lead_assigned",
      channels: ["email", "push", "in-app"],
      enabled: true,
      frequency: "immediate",
      priority: "high",
    },
    {
      id: "2",
      name: "Invoice Payment Received",
      description: "Alert when an invoice payment is received",
      trigger: "payment_received",
      channels: ["email", "in-app"],
      enabled: true,
      frequency: "immediate",
      priority: "medium",
    },
    {
      id: "3",
      name: "Project Deadline Approaching",
      description: "Remind about upcoming project deadlines",
      trigger: "deadline_approaching",
      channels: ["email", "push"],
      enabled: true,
      frequency: "daily",
      priority: "high",
    },
    {
      id: "4",
      name: "Contract Approval Required",
      description: "Notify when a contract needs approval",
      trigger: "contract_approval",
      channels: ["email", "sms", "push"],
      enabled: true,
      frequency: "immediate",
      priority: "critical",
    },
    {
      id: "5",
      name: "Weekly Performance Summary",
      description: "Send weekly performance and metrics summary",
      trigger: "weekly_summary",
      channels: ["email"],
      enabled: false,
      frequency: "weekly",
      priority: "low",
    },
  ])

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Lead Assigned",
      message: "You have been assigned a new lead: Acme Corporation",
      type: "info",
      timestamp: "2024-01-18T10:30:00Z",
      read: false,
      channel: "in-app",
      priority: "high",
    },
    {
      id: "2",
      title: "Payment Received",
      message: "Invoice #INV-2024-001 has been paid ($15,000)",
      type: "success",
      timestamp: "2024-01-18T09:15:00Z",
      read: false,
      channel: "email",
      priority: "medium",
    },
    {
      id: "3",
      title: "Project Deadline Warning",
      message: "Website redesign project deadline is in 2 days",
      type: "warning",
      timestamp: "2024-01-17T16:45:00Z",
      read: true,
      channel: "push",
      priority: "high",
    },
    {
      id: "4",
      title: "Contract Approval Needed",
      message: "Contract #CON-2024-003 requires your approval",
      type: "warning",
      timestamp: "2024-01-17T14:20:00Z",
      read: false,
      channel: "email",
      priority: "critical",
    },
    {
      id: "5",
      title: "System Maintenance",
      message: "Scheduled maintenance will occur tonight at 2 AM",
      type: "info",
      timestamp: "2024-01-17T12:00:00Z",
      read: true,
      channel: "in-app",
      priority: "low",
    },
  ])

  const toggleRule = (ruleId: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "sms":
        return <MessageSquare className="w-4 h-4" />
      case "push":
        return <Smartphone className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const criticalCount = notifications.filter((n) => n.priority === "critical" && !n.read).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Notification System</h1>
          <p className="text-gray-600 mt-2">Manage automated notifications and alerts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">{unreadCount} unread</span>
            {criticalCount > 0 && <Badge className="bg-red-100 text-red-800">{criticalCount} critical</Badge>}
          </div>
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{rules.filter((r) => r.enabled).length}</p>
              </div>
              <Settings className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Recent Notifications</TabsTrigger>
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      notification.read ? "bg-gray-50" : "bg-white border-blue-200"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {getChannelIcon(notification.channel)}
                            <span>{notification.channel}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Rules</CardTitle>
              <CardDescription>Configure automated notification triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(rule.priority)}>{rule.priority}</Badge>
                        <Badge variant="outline">{rule.frequency}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Channels:</span>
                      {rule.channels.map((channel) => (
                        <div key={channel} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                          {getChannelIcon(channel)}
                          <span>{channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>Enable or disable notification channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Notifications</span>
                  </div>
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>SMS Notifications</span>
                  </div>
                  <Switch
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Push Notifications</span>
                  </div>
                  <Switch
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>In-App Notifications</span>
                  </div>
                  <Switch
                    checked={settings.inAppEnabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, inAppEnabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize notification behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>Sound Notifications</span>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Quiet Hours</span>
                  </div>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: checked },
                      }))
                    }
                  />
                </div>
                {settings.quietHours.enabled && (
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>From:</span>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value },
                          }))
                        }
                        className="border rounded px-2 py-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>To:</span>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value },
                          }))
                        }
                        className="border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AutomatedNotificationSystem
