"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { emailService } from "../../services/email"
import { mailjetService } from "../../services/mailjet"
import { databaseService } from "../../services/database"
import { useToast } from "../../hooks/useAppState"
import {
  Mail,
  Send,
  Users,
  BarChart3,
  LayoutTemplateIcon as Template,
  Plus,
  Eye,
  MousePointer,
  TrendingUp,
  FileText,
} from "lucide-react"

const EmailIntegration: React.FC = () => {
  const { showToast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [emailStats, setEmailStats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("compose")

  // Compose email state
  const [composeForm, setComposeForm] = useState({
    recipients: "",
    subject: "",
    htmlContent: "",
    textContent: "",
  })

  // Campaign state
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    content: "",
    selectedClients: [] as string[],
  })

  const [emailConfig, setEmailConfig] = useState({
    provider: "mailjet",
    apiKey: "",
    secretKey: "",
    fromEmail: "",
    fromName: "CRM System",
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Load clients
      const clientsData = await databaseService.getClients()
      setClients(clientsData)

      // Load templates
      const templatesData = await mailjetService.getTemplates()
      setTemplates(templatesData)

      // Load email stats
      const statsData = await mailjetService.getEmailStats()
      setEmailStats(statsData)
    } catch (error) {
      console.error("Failed to load email data:", error)
      showToast("error", "Error", "Failed to load email data")
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      setLoading(true)

      const recipients = composeForm.recipients
        .split(",")
        .map((email) => ({ email: email.trim() }))
        .filter((r) => r.email)

      await emailService.sendEmail({
        to: recipients.map(r => r.email),
        subject: composeForm.subject,
        body: composeForm.htmlContent || composeForm.textContent,
        bodyType: composeForm.htmlContent ? "html" : "text"
      }, "user-id")

      showToast("success", "Email Sent", `Email sent to ${recipients.length} recipient(s)`)

      // Reset form
      setComposeForm({
        recipients: "",
        subject: "",
        htmlContent: "",
        textContent: "",
      })

      // Reload stats
      loadInitialData()
    } catch (error) {
      console.error("Failed to send email:", error)
      showToast("error", "Error", "Failed to send email")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async () => {
    try {
      setLoading(true)

      // Send marketing campaign using sendEmail method
      for (const clientId of campaignForm.selectedClients) {
        const client = clients.find(c => c.id === clientId)
        if (client) {
          await emailService.sendEmail({
            to: [client.email],
            subject: campaignForm.subject,
            body: campaignForm.content,
            bodyType: "html"
          }, "user-id")
        }
      }

      showToast("success", "Campaign Sent", `Campaign sent to ${campaignForm.selectedClients.length} client(s)`)

      // Reset form
      setCampaignForm({
        name: "",
        subject: "",
        content: "",
        selectedClients: [],
      })

      // Reload stats
      loadInitialData()
    } catch (error) {
      console.error("Failed to send campaign:", error)
      showToast("error", "Error", "Failed to send campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleSendWelcomeEmail = async (clientId: string) => {
    try {
      // Send welcome email using sendEmail method
      const client = clients.find(c => c.id === clientId)
      if (client) {
        await emailService.sendEmail({
          to: [client.email],
          subject: "Welcome!",
          body: "Welcome to our service!",
          bodyType: "html"
        }, "user-id")
      }
      showToast("success", "Welcome Email Sent", "Welcome email sent to client")
    } catch (error) {
      console.error("Failed to send welcome email:", error)
      showToast("error", "Error", "Failed to send welcome email")
    }
  }

  const getEmailStatsOverview = () => {
    const total = emailStats.length
    const opened = emailStats.filter((s) => s.status === "opened").length
    const clicked = emailStats.filter((s) => s.status === "clicked").length
    const bounced = emailStats.filter((s) => s.status === "bounced").length

    return {
      total,
      opened,
      clicked,
      bounced,
      openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : "0",
      clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) : "0",
      bounceRate: total > 0 ? ((bounced / total) * 100).toFixed(1) : "0",
    }
  }

  const stats = getEmailStatsOverview()

  const renderComposeTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Compose Email
            </CardTitle>
            <CardDescription>Send custom emails to clients or prospects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipients (comma-separated)</label>
              <Input
                placeholder="client1@example.com, client2@example.com"
                value={composeForm.recipients}
                onChange={(e) => setComposeForm({ ...composeForm, recipients: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input
                placeholder="Email subject"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">HTML Content</label>
              <Textarea
                placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                rows={8}
                value={composeForm.htmlContent}
                onChange={(e) => setComposeForm({ ...composeForm, htmlContent: e.target.value })}
              />
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={loading || !composeForm.recipients || !composeForm.subject}
              className="w-full"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Send predefined emails to clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleSendWelcomeEmail(client.id)}>
                    <Mail className="mr-1 h-3 w-3" />
                    Welcome
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCampaignTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Marketing Campaign
          </CardTitle>
          <CardDescription>Send bulk emails to multiple clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Name</label>
              <Input
                placeholder="Monthly Newsletter"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input
                placeholder="Campaign subject"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              placeholder="Campaign HTML content..."
              rows={6}
              value={campaignForm.content}
              onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Clients</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
              {clients.map((client) => (
                <label key={client.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={campaignForm.selectedClients.includes(client.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCampaignForm({
                          ...campaignForm,
                          selectedClients: [...campaignForm.selectedClients, client.id],
                        })
                      } else {
                        setCampaignForm({
                          ...campaignForm,
                          selectedClients: campaignForm.selectedClients.filter((id) => id !== client.id),
                        })
                      }
                    }}
                  />
                  <span className="text-sm">
                    {client.name} ({client.email})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSendCampaign}
            disabled={loading || !campaignForm.name || campaignForm.selectedClients.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending Campaign...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Campaign ({campaignForm.selectedClients.length} recipients)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">{stats.openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">{stats.clickRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold">{stats.bounceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Email Activity</CardTitle>
          <CardDescription>Latest email delivery and engagement statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emailStats.slice(0, 10).map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="font-medium">{stat.email}</div>
                    <div className="text-sm text-gray-500">{new Date(stat.time).toLocaleString()}</div>
                  </div>
                </div>
                <Badge
                  variant={
                    stat.status === "opened"
                      ? "default"
                      : stat.status === "clicked"
                        ? "secondary"
                        : stat.status === "bounced"
                          ? "destructive"
                          : "outline"
                  }
                >
                  {stat.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Email Templates</h3>
          <p className="text-sm text-gray-500">Manage your email templates</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>Created: {new Date(template.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{template.purposes?.[0] || "General"}</Badge>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const testEmailConnection = async () => {
    try {
      setLoading(true)
      // Test Mailjet connection
      const response = await fetch("https://api.mailjet.com/v3/REST/contact", {
        headers: {
          Authorization: `Basic ${btoa(`${emailConfig.apiKey}:${emailConfig.secretKey}`)}`,
        },
      })

      if (response.ok) {
        showToast("success", "Connection Successful", "Mailjet connection established successfully")
      } else {
        throw new Error("Connection failed")
      }
    } catch (error) {
      showToast("error", "Connection Failed", "Unable to connect to Mailjet. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Email Integration</h1>
        <p className="text-gray-600">Manage your email communications with Mailjet</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">
            <Mail className="mr-2 h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Users className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Template className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          {renderComposeTab()}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          {renderCampaignTab()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalyticsTab()}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          {renderTemplatesTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmailIntegration
