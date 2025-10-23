"use client"

import React, { useState } from "react"
import { Bell, Clock, Users, Sliders, Save, X, Plus, Trash2, AlertTriangle } from "lucide-react"
import { useAppContext } from "../context/AppContext"
// import aiAssistant, { type AIAssistantConfig } from "../services/aiAssistant"

interface ProductivitySettings {
  notifications: {
    enabled: boolean
    taskReminders: boolean
    calendarAlerts: boolean
    aiSuggestions: boolean
    adminAlerts: boolean
    soundEnabled: boolean
    advanceNoticeMinutes: number
  }
  // ai: AIAssistantConfig
  productivity: {
    dailyGoals: {
      calls: number
      emails: number
      meetings: number
      proposals: number
    }
    workHours: {
      start: string
      end: string
      workDays: string[]
    }
    focusMode: {
      enabled: boolean
      duration: number
      blockNotifications: boolean
    }
  }
  motivation: {
    showLeaderboard: boolean
    enableChallenges: boolean
    rewardsEnabled: boolean
    celebrateAchievements: boolean
  }
}

const ProductivityAdmin: React.FC = () => {
  const { state } = useAppContext()
  const { clients, tasks, events } = state

  // State for various settings
  const [notificationSettings, setNotificationSettings] = useState({
    taskReminders: true,
    meetingAlerts: true,
    meetingReminderTime: 30, // minutes
    overdueTaskAlerts: true,
    dailySummary: true,
    weeklyReport: true,
    soundEnabled: true,
  })

  const [focusModeSettings, setFocusModeSettings] = useState({
    defaultDuration: 25, // minutes
    autoBreakReminders: true,
    breakDuration: 5, // minutes
    blockNotifications: true,
    blockSocialMedia: true,
    allowedApps: ["email", "crm", "documents"],
  })

  const [teamSettings, setTeamSettings] = useState({
    showLeaderboard: true,
    anonymizeRankings: false,
    enableChallenges: true,
    showProductivityMetrics: true,
    managerInsights: true,
  })

  const [customRules, setCustomRules] = useState([
    { id: 1, name: "Morning Check-in", condition: "Time is 9:00 AM", action: "Show daily task summary", enabled: true },
    { id: 2, name: "End of Day", condition: "Time is 5:00 PM", action: "Prompt for daily report", enabled: true },
    {
      id: 3,
      name: "Inactive Alert",
      condition: "No activity for 30 minutes",
      action: "Send reminder notification",
      enabled: false,
    },
  ])

  // Initial settings
  const [settings, setSettings] = useState<ProductivitySettings>({
    notifications: {
      enabled: true,
      taskReminders: true,
      calendarAlerts: true,
      aiSuggestions: true,
      adminAlerts: true,
      soundEnabled: true,
      advanceNoticeMinutes: 45,
    },
    // ai: aiAssistant.getConfig(),
    productivity: {
      dailyGoals: {
        calls: 10,
        emails: 15,
        meetings: 3,
        proposals: 2,
      },
      workHours: {
        start: "09:00",
        end: "17:00",
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      focusMode: {
        enabled: true,
        duration: 25,
        blockNotifications: true,
      },
    },
    motivation: {
      showLeaderboard: true,
      enableChallenges: true,
      rewardsEnabled: true,
      celebrateAchievements: true,
    },
  })

  // Active tab state
  const [activeTab, setActiveTab] = useState("notifications")

  // Toggle handlers
  const toggleNotificationSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting as keyof typeof notificationSettings],
    })
  }

  const toggleFocusModeSetting = (setting: keyof typeof focusModeSettings) => {
    setFocusModeSettings({
      ...focusModeSettings,
      [setting]:
        typeof focusModeSettings[setting] === "boolean" ? !focusModeSettings[setting] : focusModeSettings[setting],
    })
  }

  const toggleTeamSetting = (setting: keyof typeof teamSettings) => {
    setTeamSettings({
      ...teamSettings,
      [setting]: !teamSettings[setting],
    })
  }

  const toggleCustomRule = (id: number) => {
    setCustomRules(customRules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  // Handle settings change
  const handleSettingsChange = (section: keyof ProductivitySettings, subsection: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: value,
      },
    }))
  }

  // Handle nested settings change
  const handleNestedSettingsChange = (section: keyof ProductivitySettings, subsection: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value,
        },
      },
    }))
  }

  // Add new custom rule
  const addCustomRule = () => {
    const newId = customRules.length > 0 ? Math.max(...customRules.map((rule) => rule.id)) + 1 : 1

    setCustomRules([
      ...customRules,
      {
        id: newId,
        name: "New Rule",
        condition: "Define condition...",
        action: "Define action...",
        enabled: true,
      },
    ])
  }

  // Delete custom rule
  const deleteCustomRule = (id: number) => {
    setCustomRules(customRules.filter((rule) => rule.id !== id))
  }

  // Save settings
  const saveSettings = () => {
    // Update AI Assistant config
    // aiAssistant.updateConfig(settings.ai)

    // In a real implementation, you would save these settings to your backend
    console.log("Saving settings:", settings)

    // Show success message
    alert("Settings saved successfully!")
  }

  // Get productivity stats
  const getProductivityStats = () => {
    const today = new Date().toISOString().split("T")[0]

    return {
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        overdue: tasks.filter((t) => t.status !== "completed" && t.due_date < today).length,
        dueToday: tasks.filter((t) => t.status !== "completed" && t.due_date === today).length,
      },
      events: {
        total: events.length,
        today: events.filter((e) => e.date === today).length,
        upcoming: events.filter((e) => e.date > today).length,
      },
      clients: {
        total: clients.length,
        active: clients.filter((c) => c.status === "active").length,
        needsFollowUp: clients.filter((c) => {
          if (!c.lastContact) return true; // No contact date means needs follow up
          const lastContact = new Date(c.lastContact)
          const now = new Date()
          const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
          return daysSinceContact > 14
        }).length,
      },
    }
  }

  const stats = getProductivityStats()

  // Save all settings
  const saveAllSettings = () => {
    // In a real app, this would save to backend/API
    alert("Settings saved successfully!")
  }

  // Render toggle switch
  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${enabled ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productivity System Administration</h1>
        <button
          onClick={saveAllSettings}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Save size={16} />
          Save All Settings
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell size={16} />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("focus")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "focus" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock size={16} />
            Focus Mode
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "team" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={16} />
            Team Settings
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "rules" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sliders size={16} />
            Custom Rules
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Notification Settings</h2>
              <p className="text-gray-500">Configure how and when notifications are displayed to sales agents.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Task Reminders</h3>
                    <p className="text-sm text-gray-500">Notify agents about upcoming and overdue tasks</p>
                  </div>
                  <ToggleSwitch
                    enabled={notificationSettings.taskReminders}
                    onChange={() => toggleNotificationSetting("taskReminders")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Meeting Alerts</h3>
                    <p className="text-sm text-gray-500">Notify agents about upcoming meetings</p>
                  </div>
                  <ToggleSwitch
                    enabled={notificationSettings.meetingAlerts}
                    onChange={() => toggleNotificationSetting("meetingAlerts")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Meeting Reminder Time</h3>
                    <p className="text-sm text-gray-500">How many minutes before a meeting to show a reminder</p>
                  </div>
                  <select
                    value={notificationSettings.meetingReminderTime}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        meetingReminderTime: Number.parseInt(e.target.value),
                      })
                    }
                    className="border rounded-md px-3 py-2"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Overdue Task Alerts</h3>
                    <p className="text-sm text-gray-500">Show alerts for tasks that are past their due date</p>
                  </div>
                  <ToggleSwitch
                    enabled={notificationSettings.overdueTaskAlerts}
                    onChange={() => toggleNotificationSetting("overdueTaskAlerts")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Daily Summary</h3>
                    <p className="text-sm text-gray-500">Send a daily summary of tasks and meetings</p>
                  </div>
                  <ToggleSwitch
                    enabled={notificationSettings.dailySummary}
                    onChange={() => toggleNotificationSetting("dailySummary")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Report</h3>
                    <p className="text-sm text-gray-500">Send a weekly productivity report</p>
                  </div>
                  <ToggleSwitch
                    enabled={notificationSettings.weeklyReport}
                    onChange={() => toggleNotificationSetting("weeklyReport")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sound Enabled</h3>
                    <p className="text-sm text-gray-500">Play sound with notifications</p>
                  </div>
                  <ToggleSwitch
                    enabled={notificationSettings.soundEnabled}
                    onChange={() => toggleNotificationSetting("soundEnabled")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Focus Mode Settings */}
          {activeTab === "focus" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Focus Mode Settings</h2>
              <p className="text-gray-500">Configure how Focus Mode works to help sales agents concentrate.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Default Focus Duration</h3>
                    <p className="text-sm text-gray-500">Default length of focus sessions in minutes</p>
                  </div>
                  <select
                    value={focusModeSettings.defaultDuration}
                    onChange={(e) =>
                      setFocusModeSettings({
                        ...focusModeSettings,
                        defaultDuration: Number.parseInt(e.target.value),
                      })
                    }
                    className="border rounded-md px-3 py-2"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={25}>25 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto Break Reminders</h3>
                    <p className="text-sm text-gray-500">Automatically suggest breaks after focus sessions</p>
                  </div>
                  <ToggleSwitch
                    enabled={focusModeSettings.autoBreakReminders}
                    onChange={() => toggleFocusModeSetting("autoBreakReminders")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Break Duration</h3>
                    <p className="text-sm text-gray-500">Default length of breaks in minutes</p>
                  </div>
                  <select
                    value={focusModeSettings.breakDuration}
                    onChange={(e) =>
                      setFocusModeSettings({
                        ...focusModeSettings,
                        breakDuration: Number.parseInt(e.target.value),
                      })
                    }
                    className="border rounded-md px-3 py-2"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Block Notifications</h3>
                    <p className="text-sm text-gray-500">Block all notifications during focus sessions</p>
                  </div>
                  <ToggleSwitch
                    enabled={focusModeSettings.blockNotifications}
                    onChange={() => toggleFocusModeSetting("blockNotifications")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Block Social Media</h3>
                    <p className="text-sm text-gray-500">Block access to social media during focus sessions</p>
                  </div>
                  <ToggleSwitch
                    enabled={focusModeSettings.blockSocialMedia}
                    onChange={() => toggleFocusModeSetting("blockSocialMedia")}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Allowed Applications</h3>
                  <p className="text-sm text-gray-500 mb-2">Applications that remain accessible during focus mode</p>
                  <div className="flex flex-wrap gap-2">
                    {focusModeSettings.allowedApps.map((app, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                        {app}
                        <button
                          onClick={() =>
                            setFocusModeSettings({
                              ...focusModeSettings,
                              allowedApps: focusModeSettings.allowedApps.filter((_, i) => i !== index),
                            })
                          }
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newApp = prompt("Enter application name:")
                        if (newApp && !focusModeSettings.allowedApps.includes(newApp)) {
                          setFocusModeSettings({
                            ...focusModeSettings,
                            allowedApps: [...focusModeSettings.allowedApps, newApp],
                          })
                        }
                      }}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      <Plus size={14} className="mr-1" /> Add App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Settings */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Team Productivity Settings</h2>
              <p className="text-gray-500">Configure team-wide productivity features and gamification.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Leaderboard</h3>
                    <p className="text-sm text-gray-500">Display productivity leaderboard to motivate the team</p>
                  </div>
                  <ToggleSwitch
                    enabled={teamSettings.showLeaderboard}
                    onChange={() => toggleTeamSetting("showLeaderboard")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Anonymize Rankings</h3>
                    <p className="text-sm text-gray-500">Hide names on leaderboard to reduce competitive pressure</p>
                  </div>
                  <ToggleSwitch
                    enabled={teamSettings.anonymizeRankings}
                    onChange={() => toggleTeamSetting("anonymizeRankings")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Enable Challenges</h3>
                    <p className="text-sm text-gray-500">Create team challenges and goals to boost productivity</p>
                  </div>
                  <ToggleSwitch
                    enabled={teamSettings.enableChallenges}
                    onChange={() => toggleTeamSetting("enableChallenges")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Productivity Metrics</h3>
                    <p className="text-sm text-gray-500">Display individual productivity metrics to team members</p>
                  </div>
                  <ToggleSwitch
                    enabled={teamSettings.showProductivityMetrics}
                    onChange={() => toggleTeamSetting("showProductivityMetrics")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Manager Insights</h3>
                    <p className="text-sm text-gray-500">Provide detailed productivity insights to managers</p>
                  </div>
                  <ToggleSwitch
                    enabled={teamSettings.managerInsights}
                    onChange={() => toggleTeamSetting("managerInsights")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom Rules */}
          {activeTab === "rules" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Custom Productivity Rules</h2>
                <button
                  onClick={addCustomRule}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Add Rule
                </button>
              </div>
              <p className="text-gray-500">Create custom rules to automate productivity workflows.</p>

              <div className="space-y-4">
                {customRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <input
                          type="text"
                          value={rule.name}
                          onChange={(e) =>
                            setCustomRules(
                              customRules.map((r) => (r.id === rule.id ? { ...r, name: e.target.value } : r)),
                            )
                          }
                          className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <ToggleSwitch enabled={rule.enabled} onChange={() => toggleCustomRule(rule.id)} />
                        <button onClick={() => deleteCustomRule(rule.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">When</label>
                        <input
                          type="text"
                          value={rule.condition}
                          onChange={(e) =>
                            setCustomRules(
                              customRules.map((r) => (r.id === rule.id ? { ...r, condition: e.target.value } : r)),
                            )
                          }
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          placeholder="Define condition..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Then</label>
                        <input
                          type="text"
                          value={rule.action}
                          onChange={(e) =>
                            setCustomRules(
                              customRules.map((r) => (r.id === rule.id ? { ...r, action: e.target.value } : r)),
                            )
                          }
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          placeholder="Define action..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {customRules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No custom rules defined yet.</p>
                    <p className="text-sm">Click "Add Rule" to create your first automation rule.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductivityAdmin
