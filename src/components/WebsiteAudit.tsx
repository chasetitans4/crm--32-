"use client"

import type React from "react"
import { useState } from "react"
import {
  Globe,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Trash2,
  Bot,
  ScanEye,
  PlusCircle,
  CheckCircle2,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"
import type { Client } from "../types"

// Inline cn function to avoid import issues
function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ")
}

// Types for the new audit system
export type AuditType = "full" | "local"

export interface WebsiteAuditComponentProps {
  crmContactId: string
}

export interface AuditSection {
  title: string
  painPoints: string[]
  solutions: string[]
  salesOpportunity: string
}

export interface AuditReport {
  executiveSummary: string
  score: number
  onPageSeo: AuditSection
  uxAndDesign: AuditSection
  performance: AuditSection
  actionableChecklist: string[]
}

export interface LocalSeoReport {
  executiveSummary: string
  score: number
  googleBusinessProfile: AuditSection
  onPageLocalSeo: AuditSection
  citationsAndReputation: AuditSection
  actionableChecklist: string[]
}

export interface AuditResult {
  primary: AuditReport | LocalSeoReport
  competitor?: AuditReport | LocalSeoReport
}

// Self-contained UI components
const Card = ({
  children,
  className = "",
  ...props
}: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
    {children}
  </div>
)

const CardHeader = ({
  children,
  className = "",
  ...props
}: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("p-6 pb-4", className)} {...props}>
    {children}
  </div>
)

const CardBody = ({
  children,
  className = "",
  ...props
}: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
)

const Button = ({
  children,
  className = "",
  variant = "default",
  disabled = false,
  onClick,
  ...props
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline"
  disabled?: boolean
  onClick?: () => void
  [key: string]: any
}) => {
  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantClasses = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Badge = ({
  children,
  className = "",
  variant = "default",
  ...props
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "gray"
  [key: string]: any
}) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

const EmptyState = ({
  title,
  description,
  icon,
  className = "",
  ...props
}: {
  title: string
  description: string
  icon: React.ReactNode
  className?: string
  [key: string]: any
}) => (
  <div className={cn("text-center", className)} {...props}>
    <div className="text-gray-400 mb-2 flex justify-center">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
)

const Breadcrumb = ({
  children,
  className = "",
  ...props
}: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <nav className={cn("flex", className)} {...props}>
    <ol className="flex items-center space-x-2">{children}</ol>
  </nav>
)

const BreadcrumbItem = ({
  children,
  href,
  current = false,
  className = "",
  ...props
}: {
  children: React.ReactNode
  href?: string
  current?: boolean
  className?: string
  [key: string]: any
}) => (
  <li className={cn("flex items-center", className)} {...props}>
    {href && !current ? (
      <a href={href} className="text-blue-600 hover:text-blue-800">
        {children}
      </a>
    ) : (
      <span className={current ? "text-gray-500" : "text-gray-900"}>{children}</span>
    )}
    {!current && <span className="ml-2 text-gray-400">/</span>}
  </li>
)

// Mock Gemini API service
const callGeminiApi = async (prompt: string): Promise<string> => {
  console.log("---- SENDING ADVANCED PROMPT TO GEMINI ----\n", prompt, "\n---- END OF PROMPT ----")
  await new Promise((resolve) => setTimeout(resolve, 2500))

  const mockFullAuditResponse = `{
        "executiveSummary": "The website shows functional design but suffers from critical SEO and performance issues that are likely hindering lead generation and customer trust. There is a significant opportunity to improve its market position through strategic optimization.",
        "score": 62,
        "onPageSeo": {
            "title": "On-Page SEO",
            "painPoints": ["Missing key meta descriptions, making the site look unprofessional in Google search results.", "Inconsistent heading tags confuse search engines about the site's most important topics.", "Lack of keyword targeting means you're invisible to customers searching for your services."],
            "solutions": ["Develop unique, compelling meta descriptions for all core pages.", "Restructure page content with a logical H1->H2->H3 hierarchy.", "Perform keyword research and integrate terms into page titles and content."],
            "salesOpportunity": "Our SEO package includes comprehensive keyword research and on-page optimization to dramatically increase your visibility in search results, driving more qualified traffic to your site."
        },
        "uxAndDesign": {
            "title": "User Experience & Design",
            "painPoints": ["Mobile navigation is difficult to use, frustrating over 50% of your visitors.", "Calls-to-action are weak and don't stand out, leading to lost conversion opportunities.", "The design feels dated compared to modern competitors, which can erode brand credibility."],
            "solutions": ["Implement a responsive, user-friendly mobile menu.", "Redesign CTAs with stronger copy and contrasting colors.", "Modernize the visual design with a new theme and high-quality imagery."],
            "salesOpportunity": "Our Web Design service can create a modern, mobile-first website that not only looks professional but is engineered to convert visitors into customers."
        },
        "performance": {
            "title": "Site Speed & Performance",
            "painPoints": ["Slow load times (likely due to large images) cause users to abandon the site before it even loads.", "The site isn't using modern image formats, wasting bandwidth and slowing down user experience."],
            "solutions": ["Compress all images and implement lazy loading.", "Convert all images to a next-gen format like WebP.", "Minify CSS and JavaScript files."],
            "salesOpportunity": "As part of our web development process, we optimize all assets for lightning-fast load times, improving your SEO ranking and reducing bounce rate."
        },
        "actionableChecklist": ["Compress images on the homepage.", "Rewrite the title tag for the Services page.", "Redesign the primary 'Contact Us' button.", "Add meta descriptions to all pages.", "Implement mobile-responsive navigation."]
    }`

  return mockFullAuditResponse
}

const createPrompt = (auditType: "full" | "local", url: string, businessName?: string): string => {
  const baseInstructions = `
        Act as a Lead Strategist for a digital marketing agency. Your goal is to produce an audit that helps our sales team close a deal.
        Your analysis must be framed in a way that highlights business problems and presents our agency's services as the clear solution.
        You cannot browse the site in real-time, so base your audit on a logical analysis of a typical business in this space with the provided URL.
        Your response MUST be ONLY the JSON object specified, with no extra text or markdown.
    `

  const fullAuditSchema = `{
      "executiveSummary": "string (Professional summary linking technical issues to business impact.)",
      "score": "number (0-100 score.)",
      "onPageSeo": { "title": "On-Page SEO", "painPoints": ["string array"], "solutions": ["string array"], "salesOpportunity": "string (How our agency's SEO service solves this.)" },
      "uxAndDesign": { "title": "User Experience & Design", "painPoints": ["string array"], "solutions": ["string array"], "salesOpportunity": "string (How our agency's Web Design service solves this.)" },
      "performance": { "title": "Site Speed & Performance", "painPoints": ["string array"], "solutions": ["string array"], "salesOpportunity": "string (How our agency's Development service solves this.)" },
      "actionableChecklist": ["string array (Top 3-5 critical actions.)"]
    }`

  const localAuditSchema = `{
      "executiveSummary": "string (Professional summary linking local SEO issues to business impact.)",
      "score": "number (0-100 score.)",
      "googleBusinessProfile": { "title": "Google Business Profile", "painPoints": ["string array"], "solutions": ["string array"], "salesOpportunity": "string (How our agency's Local SEO service solves this.)" },
      "onPageLocalSeo": { "title": "On-Page Local Signals", "painPoints": ["string array"], "solutions": ["string array"], "salesOpportunity": "string (How our on-page SEO service helps locally.)" },
      "citationsAndReputation": { "title": "Citations & Online Reputation", "painPoints": ["string array"], "solutions": ["string array"], "salesOpportunity": "string (How our reputation management service helps.)" },
      "actionableChecklist": ["string array (Top 3-5 critical actions.)"]
    }`

  if (auditType === "full") {
    return `${baseInstructions}\nAudit the website: ${url}\n\nRespond with a JSON object following this exact structure:\n${fullAuditSchema}`
  } else {
    return `${baseInstructions}\nAudit the local presence for business '${businessName}' at website: ${url}\n\nRespond with a JSON object following this exact structure:\n${localAuditSchema}`
  }
}

const runAudit = async (
  auditType: "full" | "local",
  url: string,
  businessName?: string,
): Promise<AuditReport | LocalSeoReport> => {
  const prompt = createPrompt(auditType, url, businessName)
  const response = await callGeminiApi(prompt)
  return JSON.parse(response)
}

// Helper Components
const ScoreBadge = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 85) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }
  return <span className={cn("font-bold text-xl px-3 py-1 rounded-full", getColor())}>{score}/100</span>
}

const SectionCard = ({ title, section }: { title: string; section: AuditSection }) => (
  <Card className="h-full">
    <CardHeader>
      <h4 className="font-semibold text-lg text-gray-900">{title}</h4>
    </CardHeader>
    <CardBody className="space-y-4">
      <div>
        <h5 className="text-sm font-medium text-gray-500 flex items-center mb-2">
          <AlertTriangle size={14} className="mr-2 text-red-500" />
          Pain Points
        </h5>
        <ul className="pl-5 text-sm text-gray-600 list-disc space-y-1">
          {section.painPoints.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="text-sm font-medium text-gray-500 flex items-center mb-2">
          <TrendingUp size={14} className="mr-2 text-blue-500" />
          Solutions
        </h5>
        <ul className="pl-5 text-sm text-gray-600 list-disc space-y-1">
          {section.solutions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="pt-3 border-t border-gray-200 bg-blue-50 p-3 rounded-md">
        <h5 className="text-sm font-bold text-blue-800 flex items-center mb-2">
          <Lightbulb size={14} className="mr-2" />
          Sales Opportunity
        </h5>
        <p className="text-sm text-blue-700">{section.salesOpportunity}</p>
      </div>
    </CardBody>
  </Card>
)

const WebsiteAudit: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state

  const [auditType, setAuditType] = useState<AuditType>("full")
  const [primaryUrl, setPrimaryUrl] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [competitorUrl, setCompetitorUrl] = useState("")
  const [competitorBusinessName, setCompetitorBusinessName] = useState("")
  const [showCompetitor, setShowCompetitor] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)

  // Filter clients with websites
  const clientsWithWebsites = clients.filter((client) => client.websiteUrl)

  const handleRunAudit = async () => {
    if (!primaryUrl) {
      setError("Primary Website URL is required.")
      return
    }
    setIsLoading(true)
    setError(null)
    setAuditResult(null)

    try {
      const auditPromises: [Promise<AuditReport | LocalSeoReport>, Promise<AuditReport | LocalSeoReport> | null] = [
        runAudit(auditType, primaryUrl, businessName),
        null,
      ]

      if (showCompetitor && competitorUrl) {
        auditPromises[1] = runAudit(auditType, competitorUrl, competitorBusinessName)
      }

      const [primaryReport, competitorReport] = await Promise.all(auditPromises)

      setAuditResult({
        primary: primaryReport,
        competitor: competitorReport || undefined,
      })
    } catch (e) {
      console.error(e)
      setError("An AI generation error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    setPrimaryUrl(client.websiteUrl || "")
    setBusinessName(client.name)
  }

  const renderReport = () => {
    if (!auditResult) return null

    const { primary, competitor } = auditResult
    const isFullAudit = "uxAndDesign" in primary

    const sections = isFullAudit
      ? ["onPageSeo", "uxAndDesign", "performance"]
      : ["googleBusinessProfile", "onPageLocalSeo", "citationsAndReputation"]

    return (
      <div className="mt-8 space-y-6">
        {/* Score Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Client Analysis</h2>
                <p className="text-sm text-blue-600">{primaryUrl}</p>
              </div>
              <ScoreBadge score={primary.score} />
            </CardHeader>
          </Card>
          {competitor && (
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Competitor Analysis</h2>
                  <p className="text-sm text-gray-600">{competitorUrl}</p>
                </div>
                <ScoreBadge score={competitor.score} />
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Executive Summary */}
        <div className={`grid gap-6 ${competitor ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800">Executive Summary</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">{primary.executiveSummary}</p>
            </CardBody>
          </Card>
          {competitor && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-800">Competitor Summary</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700">{competitor.executiveSummary}</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Actionable Checklist */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
              Actionable Checklist for {primaryUrl}
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3">
              {primary.actionableChecklist.map((item: string, index: number) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="ml-3 text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Section Analysis */}
        {sections.map((key) => (
          <div key={key} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <SectionCard title={(primary as any)[key].title} section={(primary as any)[key]} />
            {competitor && <SectionCard title={(competitor as any)[key].title} section={(competitor as any)[key]} />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/tools">Tools</BreadcrumbItem>
          <BreadcrumbItem current>AI Website Audit</BreadcrumbItem>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="text-blue-600" size={28} />
              AI Website Audit Tool
            </h2>
            <p className="text-gray-500 mt-1">Generate persuasive, client-facing audits to highlight opportunities</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Client Selection Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold">Select Client</h3>
            <Badge variant="gray">{clientsWithWebsites.length} clients</Badge>
          </CardHeader>
          <CardBody className="p-0">
            {clientsWithWebsites.length > 0 ? (
              <div className="divide-y max-h-96 overflow-y-auto">
                {clientsWithWebsites.map((client) => (
                  <div
                    key={client.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedClient?.id === client.id ? "bg-blue-50 border-l-4 border-blue-500" : "",
                    )}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Globe size={14} />
                      <span className="truncate">{client.websiteUrl?.replace(/^https?:\/\//, "")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No clients with websites"
                description="Add website URLs to your clients to start auditing."
                icon={<Globe size={24} />}
                className="py-12"
              />
            )}
          </CardBody>
        </Card>

        {/* Audit Configuration */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <h3 className="text-lg font-semibold">Audit Configuration</h3>
            <p className="text-sm text-gray-500">Configure your AI-powered website audit</p>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Primary Inputs */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-4">Client Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Website URL*
                  </label>
                  <input
                    id="websiteUrl"
                    type="text"
                    value={primaryUrl}
                    onChange={(e) => setPrimaryUrl(e.target.value)}
                    placeholder="https://client-website.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audit Type</label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value as AuditType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full">Full Website & SEO Audit</option>
                    <option value="local">Local SEO Audit</option>
                  </select>
                </div>
                {auditType === "local" && (
                  <div className="md:col-span-2">
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Client Business Name*
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Joe's Pizza Downtown"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Competitor Inputs */}
            {showCompetitor && (
              <div className="p-4 border rounded-lg bg-gray-50 relative">
                <button
                  onClick={() => {
                    setShowCompetitor(false)
                    setCompetitorUrl("")
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <Trash2 size={18} />
                </button>
                <h4 className="font-medium text-gray-800 mb-4">Competitor Information (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="competitorUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Competitor Website URL
                    </label>
                    <input
                      id="competitorUrl"
                      type="text"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      placeholder="https://competitor-site.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {auditType === "local" && (
                    <div className="md:col-span-2">
                      <label htmlFor="competitorBusinessName" className="block text-sm font-medium text-gray-700 mb-1">
                        Competitor Business Name
                      </label>
                      <input
                        id="competitorBusinessName"
                        type="text"
                        value={competitorBusinessName}
                        onChange={(e) => setCompetitorBusinessName(e.target.value)}
                        placeholder="e.g., Pizza Palace"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button onClick={() => setShowCompetitor(!showCompetitor)} disabled={isLoading} variant="outline">
                <PlusCircle size={16} className="mr-2" />
                {showCompetitor ? "Remove Competitor" : "Add Competitor"}
              </Button>
              <Button onClick={handleRunAudit} disabled={isLoading} variant="default">
                {isLoading ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <ScanEye size={16} className="mr-2" />
                )}
                {isLoading ? "Analyzing..." : "Run AI Audit"}
              </Button>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardBody className="text-center py-12">
            <Bot className="mx-auto mb-4 text-blue-600 animate-pulse" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generating AI Audit Report</h3>
            <p className="text-gray-500">Our AI is analyzing the website and generating insights...</p>
          </CardBody>
        </Card>
      )}

      {/* Audit Results */}
      {auditResult && renderReport()}
    </div>
  )
}

export default WebsiteAudit
