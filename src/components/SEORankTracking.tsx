"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

// Replace the SEORankTracking component with this enhanced version
const SEORankTracking: React.FC = React.memo(() => {
  const { state } = useAppContext()
  const { clients } = state

  const [selectedClient, setSelectedClient] = useState<number | null>(null)
  const [timeRange, setTimeRange] = useState("30")
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false)
  const [showCompetitorModal, setShowCompetitorModal] = useState(false)
  const [showKeywordInsightsModal, setShowKeywordInsightsModal] = useState<number | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [newKeyword, setNewKeyword] = useState<{
    keyword: string;
    clientId: string;
    targetUrl: string;
    tags: string[];
    competitors: number[];
}>({
    keyword: "",
    clientId: "",
    targetUrl: "",
    tags: [],
    competitors: [],
  })
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    url: "",
    clientId: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("position")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeTab, setActiveTab] = useState<"keywords" | "competitors" | "insights">("keywords")
  const [expandedKeywords, setExpandedKeywords] = useState<number[]>([])
  const [reportSettings, setReportSettings] = useState({
    includeKeywords: true,
    includeCompetitors: true,
    includeInsights: true,
    emailRecipients: "",
    scheduleFrequency: "weekly",
  })
  const [isAutomatedReportsEnabled, setIsAutomatedReportsEnabled] = useState(true)

  // Mock keyword data with enhanced properties
  const keywordData = [
    {
      id: 1,
      clientId: 1,
      keyword: "web design agency",
      position: 3,
      previousPosition: 5,
      change: 2,
      searchVolume: 1900,
      difficulty: 65,
      url: "/services",
      lastChecked: "2023-05-28",
      tags: ["service", "core"],
      ctr: 4.2,
      impressions: 1240,
      clicks: 52,
      conversionRate: 3.8,
      competitorRankings: [
        { competitorId: 1, position: 1 },
        { competitorId: 2, position: 5 },
        { competitorId: 3, position: 8 },
      ],
      history: [
        { date: "2023-05-28", position: 3 },
        { date: "2023-05-21", position: 5 },
        { date: "2023-05-14", position: 7 },
        { date: "2023-05-07", position: 9 },
        { date: "2023-04-30", position: 12 },
      ],
      serp: {
        features: ["local pack", "featured snippet", "people also ask"],
        topResult: "competitor-website.com",
      },
      actionableInsights: [
        "Your page is ranking well but missing a featured snippet opportunity",
        "Consider adding FAQ schema to target 'people also ask' section",
        "Competitor at position #1 has more comprehensive content (2500 words vs your 1200)",
      ],
    },
    {
      id: 2,
      clientId: 1,
      keyword: "responsive website design",
      position: 12,
      previousPosition: 9,
      change: -3,
      searchVolume: 2400,
      difficulty: 85,
      url: "/responsive-design",
      lastChecked: "2023-05-28",
      tags: ["service", "technical"],
      ctr: 1.8,
      impressions: 860,
      clicks: 15,
      conversionRate: 2.1,
      competitorRankings: [
        { competitorId: 1, position: 2 },
        { competitorId: 2, position: 4 },
        { competitorId: 3, position: 7 },
      ],
      history: [
        { date: "2023-05-28", position: 12 },
        { date: "2023-05-21", position: 9 },
        { date: "2023-05-14", position: 10 },
        { date: "2023-05-07", position: 11 },
        { date: "2023-04-30", position: 14 },
      ],
      serp: {
        features: ["featured snippet", "video carousel", "people also ask"],
        topResult: "major-competitor.com",
      },
      actionableInsights: [
        "Your page has dropped 3 positions - content may need updating",
        "Top competitors have video content which you currently lack",
        "Consider adding case studies to demonstrate responsive design work",
      ],
    },
    {
      id: 3,
      clientId: 2,
      keyword: "local seo services",
      position: 5,
      previousPosition: 12,
      change: 7,
      searchVolume: 720,
      difficulty: 78,
      url: "/local-seo",
      lastChecked: "2023-05-28",
      tags: ["service", "local"],
      ctr: 3.5,
      impressions: 580,
      clicks: 20,
      conversionRate: 5.0,
      competitorRankings: [
        { competitorId: 4, position: 3 },
        { competitorId: 5, position: 8 },
      ],
      history: [
        { date: "2023-05-28", position: 5 },
        { date: "2023-05-21", position: 12 },
        { date: "2023-05-14", position: 15 },
        { date: "2023-05-07", position: 18 },
        { date: "2023-04-30", position: 22 },
      ],
      serp: {
        features: ["local pack", "people also ask", "related searches"],
        topResult: "seo-experts.com",
      },
      actionableInsights: [
        "Significant improvement of 7 positions - recent content updates are working",
        "You're not appearing in the local pack despite ranking well organically",
        "Consider optimizing Google Business Profile to appear in the local pack",
      ],
    },
    {
      id: 4,
      clientId: 2,
      keyword: "google business profile optimization",
      position: 8,
      previousPosition: 15,
      change: 7,
      searchVolume: 590,
      difficulty: 72,
      url: "/google-business-profile",
      lastChecked: "2023-05-28",
      tags: ["service", "local", "google"],
      ctr: 2.8,
      impressions: 420,
      clicks: 12,
      conversionRate: 4.2,
      competitorRankings: [
        { competitorId: 4, position: 2 },
        { competitorId: 5, position: 6 },
      ],
      history: [
        { date: "2023-05-28", position: 8 },
        { date: "2023-05-21", position: 15 },
        { date: "2023-05-14", position: 14 },
        { date: "2023-05-07", position: 16 },
        { date: "2023-04-30", position: 18 },
      ],
      serp: {
        features: ["featured snippet", "people also ask", "knowledge panel"],
        topResult: "google.com",
      },
      actionableInsights: [
        "Strong improvement but competitor at position #2 has more detailed how-to content",
        "Your page lacks structured data that competitors are using",
        "Consider adding step-by-step instructions with images for better engagement",
      ],
    },
    {
      id: 5,
      clientId: 3,
      keyword: "ecommerce website development",
      position: 18,
      previousPosition: 22,
      change: 4,
      searchVolume: 1800,
      difficulty: 88,
      url: "/ecommerce",
      lastChecked: "2023-05-28",
      tags: ["service", "ecommerce"],
      ctr: 0.9,
      impressions: 320,
      clicks: 3,
      conversionRate: 1.5,
      competitorRankings: [
        { competitorId: 6, position: 4 },
        { competitorId: 7, position: 9 },
      ],
      history: [
        { date: "2023-05-28", position: 18 },
        { date: "2023-05-21", position: 22 },
        { date: "2023-05-14", position: 25 },
        { date: "2023-05-07", position: 28 },
        { date: "2023-04-30", position: 30 },
      ],
      serp: {
        features: ["shopping results", "people also ask", "related searches"],
        topResult: "shopify.com",
      },
      actionableInsights: [
        "Your page is gradually improving but still on page 2 of results",
        "Consider adding more case studies and portfolio examples",
        "Top-ranking competitors have more technical specifications and platform comparisons",
      ],
    },
    {
      id: 6,
      clientId: 3,
      keyword: "shopify website design",
      position: 7,
      previousPosition: 10,
      change: 3,
      searchVolume: 1200,
      difficulty: 75,
      url: "/shopify-design",
      lastChecked: "2023-05-28",
      tags: ["service", "ecommerce", "platform"],
      ctr: 3.1,
      impressions: 680,
      clicks: 21,
      conversionRate: 4.8,
      competitorRankings: [
        { competitorId: 6, position: 3 },
        { competitorId: 7, position: 5 },
      ],
      history: [
        { date: "2023-05-28", position: 7 },
        { date: "2023-05-21", position: 10 },
        { date: "2023-05-14", position: 9 },
        { date: "2023-05-07", position: 12 },
        { date: "2023-04-30", position: 15 },
      ],
      serp: {
        features: ["shopping results", "featured snippet", "site links"],
        topResult: "shopify.com",
      },
      actionableInsights: [
        "Good improvement to position 7, but competitors have more Shopify-specific content",
        "Consider creating a Shopify app or theme to build authority in this niche",
        "Your page lacks customer testimonials that top competitors showcase",
      ],
    },
    {
      id: 7,
      clientId: 1,
      keyword: "affordable web design",
      position: 22,
      previousPosition: 18,
      change: -4,
      searchVolume: 2800,
      difficulty: 90,
      url: "/pricing",
      lastChecked: "2023-05-28",
      tags: ["service", "pricing"],
      ctr: 0.6,
      impressions: 240,
      clicks: 1,
      conversionRate: 0,
      competitorRankings: [
        { competitorId: 1, position: 4 },
        { competitorId: 2, position: 9 },
        { competitorId: 3, position: 12 },
      ],
      history: [
        { date: "2023-05-28", position: 22 },
        { date: "2023-05-21", position: 18 },
        { date: "2023-05-14", position: 19 },
        { date: "2023-05-07", position: 17 },
        { date: "2023-04-30", position: 16 },
      ],
      serp: {
        features: ["ads", "people also ask", "related searches"],
        topResult: "budget-websites.com",
      },
      actionableInsights: [
        "Significant drop in rankings - competitors may have updated their content",
        "Your pricing page doesn't explicitly mention 'affordable' options",
        "Consider creating a dedicated landing page for budget-conscious clients",
      ],
    },
    {
      id: 8,
      clientId: 2,
      keyword: "local business seo",
      position: 4,
      previousPosition: 6,
      change: 2,
      searchVolume: 880,
      difficulty: 70,
      url: "/local-business-seo",
      lastChecked: "2023-05-28",
      tags: ["service", "local", "core"],
      ctr: 4.5,
      impressions: 720,
      clicks: 32,
      conversionRate: 6.2,
      competitorRankings: [
        { competitorId: 4, position: 1 },
        { competitorId: 5, position: 7 },
      ],
      history: [
        { date: "2023-05-28", position: 4 },
        { date: "2023-05-21", position: 6 },
        { date: "2023-05-14", position: 5 },
        { date: "2023-05-07", position: 8 },
        { date: "2023-04-30", position: 10 },
      ],
      serp: {
        features: ["local pack", "featured snippet", "people also ask"],
        topResult: "seo-experts.com",
      },
      actionableInsights: [
        "Strong position but competitor at #1 has more local business case studies",
        "Your page could benefit from adding schema markup for local businesses",
        "Consider creating location-specific landing pages for major service areas",
      ],
    },
  ]

  // Mock competitor data
  const competitorData = [
    {
      id: 1,
      clientId: 1,
      name: "DesignMasters",
      url: "https://designmasters.com",
      keywordOverlap: 78,
      averagePosition: 4.2,
      topKeywords: ["web design agency", "professional web design", "business website design"],
      strengthAreas: ["Portfolio showcase", "Case studies", "Design awards"],
      weaknessAreas: ["Local SEO", "Mobile optimization content", "Loading speed"],
      dateAdded: "2023-03-15",
    },
    {
      id: 2,
      clientId: 1,
      name: "WebCraft Solutions",
      url: "https://webcraftsolutions.com",
      keywordOverlap: 65,
      averagePosition: 6.8,
      topKeywords: ["responsive website design", "custom web development", "business web design"],
      strengthAreas: ["Technical content", "Developer resources", "API documentation"],
      weaknessAreas: ["Visual design", "Case studies", "Client testimonials"],
      dateAdded: "2023-04-02",
    },
    {
      id: 3,
      clientId: 1,
      name: "CreativeWeb Studios",
      url: "https://creativewebstudios.com",
      keywordOverlap: 52,
      averagePosition: 8.5,
      topKeywords: ["creative web design", "web design portfolio", "website redesign services"],
      strengthAreas: ["Visual design", "Creative portfolio", "Design process content"],
      weaknessAreas: ["Technical SEO", "Conversion optimization", "Industry-specific content"],
      dateAdded: "2023-02-28",
    },
    {
      id: 4,
      clientId: 2,
      name: "Local SEO Experts",
      url: "https://localseoexperts.com",
      keywordOverlap: 82,
      averagePosition: 3.1,
      topKeywords: ["local seo services", "google business profile optimization", "local business seo"],
      strengthAreas: ["Local case studies", "Google Business Profile guides", "Local citation content"],
      weaknessAreas: ["Web design content", "Technical SEO", "Content marketing"],
      dateAdded: "2023-03-10",
    },
    {
      id: 5,
      clientId: 2,
      name: "RankLocal",
      url: "https://ranklocal.com",
      keywordOverlap: 71,
      averagePosition: 7.2,
      topKeywords: ["local search optimization", "local business marketing", "local seo agency"],
      strengthAreas: ["Local business guides", "Industry-specific content", "Local SEO tools"],
      weaknessAreas: ["Case studies", "Technical documentation", "User experience"],
      dateAdded: "2023-04-18",
    },
    {
      id: 6,
      clientId: 3,
      name: "EcommerceBuilders",
      url: "https://ecommercebuilders.com",
      keywordOverlap: 68,
      averagePosition: 5.4,
      topKeywords: ["ecommerce website development", "shopify website design", "online store creation"],
      strengthAreas: ["Platform comparisons", "Technical specifications", "Integration guides"],
      weaknessAreas: ["Design portfolio", "Case studies", "User experience content"],
      dateAdded: "2023-03-22",
    },
    {
      id: 7,
      clientId: 3,
      name: "ShopifyPros",
      url: "https://shopifypros.com",
      keywordOverlap: 59,
      averagePosition: 6.9,
      topKeywords: ["shopify website design", "shopify store setup", "shopify theme customization"],
      strengthAreas: ["Shopify-specific content", "App recommendations", "Theme customization guides"],
      weaknessAreas: ["General ecommerce content", "Multi-platform comparisons", "Technical SEO"],
      dateAdded: "2023-04-05",
    },
  ]

  // Filter keywords by client if selected
  const filteredKeywords = selectedClient ? keywordData.filter((kw) => kw.clientId === selectedClient) : keywordData

  // Filter by tags if selected
  const tagFilteredKeywords =
    filterTags.length > 0
      ? filteredKeywords.filter((kw) => filterTags.some((tag) => kw.tags.includes(tag)))
      : filteredKeywords

  // Filter by search query
  const searchFilteredKeywords = searchQuery
    ? tagFilteredKeywords.filter((kw) => kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    : tagFilteredKeywords

  // Further filter by status if needed
  const displayedKeywords =
    filterStatus === "all"
      ? searchFilteredKeywords
      : filterStatus === "top10"
        ? searchFilteredKeywords.filter((kw) => kw.position <= 10)
        : filterStatus === "improving"
          ? searchFilteredKeywords.filter((kw) => kw.change > 0)
          : filterStatus === "declining"
            ? searchFilteredKeywords.filter((kw) => kw.change < 0)
            : searchFilteredKeywords

  // Sort keywords
  const sortedKeywords = [...displayedKeywords].sort((a, b) => {
    if (sortBy === "position") {
      return sortDirection === "asc" ? a.position - b.position : b.position - a.position
    }
    if (sortBy === "change") {
      return sortDirection === "asc" ? a.change - b.change : b.change - a.change
    }
    if (sortBy === "volume") {
      return sortDirection === "asc" ? a.searchVolume - b.searchVolume : b.searchVolume - a.searchVolume
    }
    if (sortBy === "difficulty") {
      return sortDirection === "asc" ? a.difficulty - b.difficulty : b.difficulty - a.difficulty
    }
    if (sortBy === "keyword") {
      return sortDirection === "asc" ? a.keyword.localeCompare(b.keyword) : b.keyword.localeCompare(a.keyword)
    }
    return 0
  })

  // Filter competitors by client if selected
  const filteredCompetitors = selectedClient
    ? competitorData.filter((comp) => comp.clientId === selectedClient)
    : competitorData

  // Get all unique tags from keywords
  const allTags = Array.from(new Set(keywordData.flatMap((kw) => kw.tags)))

  // Toggle keyword expansion
  const toggleKeywordExpansion = (keywordId: number) => {
    if (expandedKeywords.includes(keywordId)) {
      setExpandedKeywords(expandedKeywords.filter((id) => id !== keywordId))
    } else {
      setExpandedKeywords([...expandedKeywords, keywordId])
    }
  }

  // Handle adding a new keyword
  const handleAddKeyword = () => {
    if (!newKeyword.keyword || !newKeyword.clientId) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would call an API to add the keyword
      alert(`Keyword "${newKeyword.keyword}" added for tracking`)

      // Reset form and close modal
      setNewKeyword({
        keyword: "",
        clientId: "",
        targetUrl: "",
        tags: [],
        competitors: [],
      })
      setIsLoading(false)
      setShowAddKeywordModal(false)
    }, 1500)
  }

  // Handle adding a new competitor
  const handleAddCompetitor = () => {
    if (!newCompetitor.name || !newCompetitor.url || !newCompetitor.clientId) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would call an API to add the competitor
      alert(`Competitor "${newCompetitor.name}" added for tracking`)

      // Reset form and close modal
      setNewCompetitor({
        name: "",
        url: "",
        clientId: "",
      })
      setIsLoading(false)
      setShowCompetitorModal(false)
    }, 1500)
  }

  // Handle generating a report
  const handleGenerateReport = useCallback(() => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would call an API to generate the report
      alert("SEO report generated successfully")
      setIsLoading(false)
      setShowReportModal(false)
    }, 2000)
  }, [])

  // Get position color based on ranking
  const getPositionColor = (position: number) => {
    if (position <= 3) return "bg-green-100 text-green-800"
    if (position <= 10) return "bg-blue-100 text-blue-800"
    if (position <= 20) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "bg-green-500"
    if (difficulty < 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Handle refreshing keyword data
  const handleRefreshData = useCallback(() => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Keyword rankings refreshed successfully")
    }, 2000)
  }, [])

  // Toggle sort direction
  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }, [sortBy, sortDirection])

  // Handle tag selection
  const handleTagSelection = useCallback((tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag))
    } else {
      setFilterTags([...filterTags, tag])
    }
  }, [filterTags])

  // Simulate automated report generation
  useEffect(() => {
    if (!isAutomatedReportsEnabled) return

    const interval = setInterval(() => {
      // In a real app, this would generate and send reports based on schedule
      console.log("Checking if reports need to be generated...")
    }, 86400000) // Check daily

    return () => clearInterval(interval)
  }, [isAutomatedReportsEnabled])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Enhanced SEO Rank Tracking</h2>
          <p className="text-gray-500">Track keyword rankings, analyze competitors, and get actionable insights</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Refresh Data
              </>
            )}
          </button>
          <button
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowReportModal(true)}
          >
            <Download size={16} />
            Generate Report
          </button>
          <button
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowCompetitorModal(true)}
          >
            <Users size={16} />
            Add Competitor
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            onClick={() => setShowAddKeywordModal(true)}
          >
            <Plus size={16} />
            Add Keyword
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("keywords")}
              className={`px-4 py-2 ${activeTab === "keywords" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            >
              Keywords
            </button>
            <button
              onClick={() => setActiveTab("competitors")}
              className={`px-4 py-2 ${activeTab === "competitors" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            >
              Competitors
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-2 ${activeTab === "insights" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            >
              Insights & Reports
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div>
                <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select
                  id="clientFilter"
                  className="border rounded px-3 py-2 min-w-[200px]"
                  value={selectedClient || ""}
                  onChange={(e) => setSelectedClient(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Range
                </label>
                <select
                  id="timeRange"
                  className="border rounded px-3 py-2"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                </select>
              </div>

              {activeTab === "keywords" && (
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    className="border rounded px-3 py-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Keywords</option>
                    <option value="top10">Top 10 Rankings</option>
                    <option value="improving">Improving</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>
              )}
            </div>

            {activeTab === "keywords" && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  className="border rounded pl-9 pr-3 py-2 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Automated Reports</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAutomatedReportsEnabled}
                  onChange={() => setIsAutomatedReportsEnabled(!isAutomatedReportsEnabled)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {activeTab === "keywords" && filterTags.length === 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-700 py-1">Filter by tag:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => handleTagSelection(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {activeTab === "keywords" && filterTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-700 py-1">Active filters:</span>
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
                  onClick={() => handleTagSelection(tag)}
                >
                  {tag}
                  <X size={12} />
                </button>
              ))}
              <button className="px-2 py-1 text-xs text-blue-600 hover:underline" onClick={() => setFilterTags([])}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {activeTab === "keywords" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("keyword")}
                  >
                    <div className="flex items-center gap-1">
                      Keyword
                      {sortBy === "keyword" &&
                        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("position")}
                  >
                    <div className="flex items-center gap-1">
                      Position
                      {sortBy === "position" &&
                        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("change")}
                  >
                    <div className="flex items-center gap-1">
                      Change
                      {sortBy === "change" &&
                        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("volume")}
                  >
                    <div className="flex items-center gap-1">
                      Search Volume
                      {sortBy === "volume" &&
                        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("difficulty")}
                  >
                    <div className="flex items-center gap-1">
                      Difficulty
                      {sortBy === "difficulty" &&
                        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedKeywords.map((keyword) => (
                  <React.Fragment key={keyword.id}>
                    <tr className={`hover:bg-gray-50 ${expandedKeywords.includes(keyword.id) ? "bg-gray-50" : ""}`}>
                      <td className="px-6 py-4">
                        <div
                          className="font-medium cursor-pointer flex items-center gap-1"
                          onClick={() => toggleKeywordExpansion(keyword.id)}
                        >
                          {keyword.keyword}
                          {expandedKeywords.includes(keyword.id) ? (
                            <ChevronUp size={16} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {clients.find((c) => c.id.toString() === keyword.clientId.toString())?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPositionColor(keyword.position)}`}>
                          {keyword.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {keyword.change > 0 ? (
                          <div className="flex items-center text-green-600">
                            <ArrowUp size={14} />
                            <span>{keyword.change}</span>
                          </div>
                        ) : keyword.change < 0 ? (
                          <div className="flex items-center text-red-600">
                            <ArrowDown size={14} />
                            <span>{Math.abs(keyword.change)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{keyword.searchVolume.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${getDifficultyColor(keyword.difficulty)} h-2 rounded-full`}
                              style={{ width: `${keyword.difficulty}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{keyword.difficulty}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={keyword.url} className="text-blue-600 hover:underline text-sm">
                          {keyword.url}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {keyword.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => setShowKeywordInsightsModal(keyword.id)}
                          >
                            Insights
                          </button>
                          <button className="text-blue-600 hover:text-blue-800">Edit</button>
                        </div>
                      </td>
                    </tr>
                    {expandedKeywords.includes(keyword.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="border rounded-lg p-3">
                              <h4 className="text-sm font-medium mb-2">Performance</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-xs text-gray-500">CTR</div>
                                  <div className="font-medium">{keyword.ctr}%</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Impressions</div>
                                  <div className="font-medium">{keyword.impressions.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Clicks</div>
                                  <div className="font-medium">{keyword.clicks.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Conversion Rate</div>
                                  <div className="font-medium">{keyword.conversionRate}%</div>
                                </div>
                              </div>
                            </div>

                            <div className="border rounded-lg p-3">
                              <h4 className="text-sm font-medium mb-2">SERP Features</h4>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {keyword.serp.features.map((feature, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500">Top Result:</div>
                              <div className="text-sm">{keyword.serp.topResult}</div>
                            </div>

                            <div className="border rounded-lg p-3">
                              <h4 className="text-sm font-medium mb-2">Competitor Rankings</h4>
                              <div className="space-y-1">
                                {keyword.competitorRankings.map((comp, index) => {
                                  const competitor = competitorData.find((c) => c.id === comp.competitorId)
                                  return competitor ? (
                                    <div key={index} className="flex justify-between items-center">
                                      <span className="text-sm">{competitor.name}</span>
                                      <span
                                        className={`px-2 py-0.5 text-xs rounded-full ${getPositionColor(comp.position)}`}
                                      >
                                        #{comp.position}
                                      </span>
                                    </div>
                                  ) : null
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-3 mb-4">
                            <h4 className="text-sm font-medium mb-2">Ranking History</h4>
                            <div className="h-32 flex items-end justify-between gap-1 pt-4 relative">
                              {/* This would be a chart in a real implementation */}
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                Ranking history chart would appear here
                              </div>
                              {keyword.history.map((point, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div
                                    className="bg-blue-500 w-8"
                                    style={{
                                      height: `${Math.max(10, 100 - point.position * 3)}px`,
                                      opacity: index === 0 ? 1 : 0.7 - index * 0.1,
                                    }}
                                  ></div>
                                  <div className="text-xs mt-1">{point.date.split("-")[2]}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <AlertCircle size={16} className="text-yellow-500" />
                              Actionable Insights
                            </h4>
                            <ul className="space-y-2">
                              {keyword.actionableInsights.map((insight, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <div className="min-w-4 mt-1">•</div>
                                  <div>{insight}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "competitors" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCompetitors.map((competitor) => (
                <div key={competitor.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{competitor.name}</h3>
                      <a
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {competitor.url.replace(/^https?:\/\//, "")}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="text-xs text-gray-500">Added: {competitor.dateAdded}</div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Keyword Overlap</div>
                        <div className="text-lg font-semibold">{competitor.keywordOverlap}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${competitor.keywordOverlap}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Avg. Position</div>
                        <div className="text-lg font-semibold">{competitor.averagePosition}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              competitor.averagePosition < 5
                                ? "bg-green-500"
                                : competitor.averagePosition < 10
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${Math.max(0, 100 - competitor.averagePosition * 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Top Ranking Keywords</div>
                      <div className="space-y-1">
                        {competitor.topKeywords.map((keyword, index) => (
                          <div key={index} className="text-sm py-1 border-b border-gray-100 last:border-0">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <TrendingUp size={14} className="text-green-500" />
                          Strengths
                        </div>
                        <ul className="text-sm space-y-1">
                          {competitor.strengthAreas.map((strength, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <TrendingDown size={14} className="text-red-500" />
                          Weaknesses
                        </div>
                        <ul className="text-sm space-y-1">
                          {competitor.weaknessAreas.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button className="text-sm text-blue-600 hover:underline">View Detailed Analysis</button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCompetitors.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500 border rounded-lg">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No competitors found</h3>
                  <p className="mb-4">
                    Add competitors to track their rankings and analyze their strengths and weaknesses.
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2"
                    onClick={() => setShowCompetitorModal(true)}
                  >
                    <Plus size={16} />
                    Add Competitor
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Ranking Summary</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Top 3 Rankings</span>
                      <span className="font-medium">{keywordData.filter((k) => k.position <= 3).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{
                          width: `${(keywordData.filter((k) => k.position <= 3).length / keywordData.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Top 10 Rankings</span>
                      <span className="font-medium">{keywordData.filter((k) => k.position <= 10).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${(keywordData.filter((k) => k.position <= 10).length / keywordData.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Improving Keywords</span>
                      <span className="font-medium">{keywordData.filter((k) => k.change > 0).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{
                          width: `${(keywordData.filter((k) => k.change > 0).length / keywordData.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Declining Keywords</span>
                      <span className="font-medium">{keywordData.filter((k) => k.change < 0).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{
                          width: `${(keywordData.filter((k) => k.change < 0).length / keywordData.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Total Impressions</span>
                      <span className="font-medium">
                        {keywordData.reduce((sum, k) => sum + k.impressions, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Total Clicks</span>
                      <span className="font-medium">
                        {keywordData.reduce((sum, k) => sum + k.clicks, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Average CTR</span>
                      <span className="font-medium">
                        {(keywordData.reduce((sum, k) => sum + k.ctr, 0) / keywordData.length).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Average Conversion Rate</span>
                      <span className="font-medium">
                        {(keywordData.reduce((sum, k) => sum + k.conversionRate, 0) / keywordData.length).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Automated Reports</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm mb-1">Weekly Performance Report</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Sent every Monday at 9:00 AM</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Monthly Competitor Analysis</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Sent on the 1st of each month</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Quarterly Strategy Review</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Sent at the end of each quarter</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  <button
                    className="w-full px-3 py-2 mt-2 border rounded text-sm text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowReportModal(true)}
                  >
                    Configure Reports
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Priority Action Items</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-3 py-2">
                  <div className="font-medium">Address declining rankings for "affordable web design"</div>
                  <p className="text-sm text-gray-600">
                    This keyword has dropped 4 positions and is now on page 3. Create a dedicated landing page focused
                    on affordable options.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Priority: High</span>
                    <span className="text-xs text-gray-500">Potential Impact: +2,800 monthly searches</span>
                  </div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3 py-2">
                  <div className="font-medium">Optimize for featured snippet opportunity</div>
                  <p className="text-sm text-gray-600">
                    Your page for "web design agency" is ranking well but missing the featured snippet. Add a clear
                    definition section with structured markup.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Priority: Medium</span>
                    <span className="text-xs text-gray-500">Potential Impact: +30% CTR</span>
                  </div>
                </div>
                <div className="border-l-4 border-green-500 pl-3 py-2">
                  <div className="font-medium">Capitalize on improving "local SEO services" rankings</div>
                  <p className="text-sm text-gray-600">
                    This keyword has improved by 7 positions. Add more local case studies and optimize for the local
                    pack to maximize visibility.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Priority: Medium</span>
                    <span className="text-xs text-gray-500">Potential Impact: Local pack visibility</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Ranking Distribution</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  {/* This would be a chart in a real implementation */}
                  <div className="text-gray-400">Ranking distribution chart</div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Ranking Changes Over Time</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  {/* This would be a chart in a real implementation */}
                  <div className="text-gray-400">Ranking trends chart</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {sortedKeywords.length === 0 && activeTab === "keywords" && (
          <div className="text-center py-8 text-gray-500">
            No keywords found. Add keywords to start tracking rankings.
          </div>
        )}
      </div>

      {/* Add Keyword Modal */}
      {showAddKeywordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Keyword for Tracking</h3>
              <button onClick={() => setShowAddKeywordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Client*</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newKeyword.clientId}
                onChange={(e) => setNewKeyword({ ...newKeyword, clientId: e.target.value })}
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Keyword*</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                placeholder="e.g., web design services"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newKeyword.targetUrl}
                onChange={(e) => setNewKeyword({ ...newKeyword, targetUrl: e.target.value })}
                placeholder="e.g., /services"
              />
              <p className="text-xs text-gray-500 mt-1">The page you want to rank for this keyword (optional)</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`px-2 py-1 text-xs rounded-full ${
                      newKeyword.tags.includes(tag)
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      if (newKeyword.tags.includes(tag)) {
                        setNewKeyword({
                          ...newKeyword,
                          tags: newKeyword.tags.filter((t) => t !== tag),
                        })
                      } else {
                        setNewKeyword({
                          ...newKeyword,
                          tags: [...newKeyword.tags, tag],
                        })
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  placeholder="Add custom tag..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      setNewKeyword({
                        ...newKeyword,
                        tags: [...newKeyword.tags, e.currentTarget.value],
                      })
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <button className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Add</button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Track Competitors</label>
              <div className="border rounded p-3 max-h-32 overflow-y-auto">
                {competitorData
                  .filter((comp) => !newKeyword.clientId || comp.clientId.toString() === newKeyword.clientId)
                  .map((competitor) => (
                    <div key={competitor.id} className="flex items-center mb-2 last:mb-0">
                      <input
                        type="checkbox"
                        id={`comp-${competitor.id}`}
                        className="mr-2"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyword({
                              ...newKeyword,
                              competitors: [...newKeyword.competitors, competitor.id],
                            })
                          } else {
                            setNewKeyword({
                              ...newKeyword,
                              competitors: newKeyword.competitors.filter((id) => id !== competitor.id),
                            })
                          }
                        }}
                        checked={newKeyword.competitors.includes(competitor.id)}
                      />
                      <label htmlFor={`comp-${competitor.id}`} className="text-sm">
                        {competitor.name}
                      </label>
                    </div>
                  ))}
                {(!newKeyword.clientId ||
                  competitorData.filter((comp) => comp.clientId.toString() === newKeyword.clientId).length === 0) && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    {!newKeyword.clientId
                      ? "Select a client to see available competitors"
                      : "No competitors found for this client"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddKeywordModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                disabled={isLoading || !newKeyword.keyword || !newKeyword.clientId}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Keyword
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showCompetitorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Competitor for Tracking</h3>
              <button onClick={() => setShowCompetitorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Client*</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newCompetitor.clientId}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, clientId: e.target.value })}
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Name*</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="e.g., DesignMasters"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Competitor URL*</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newCompetitor.url}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
                placeholder="e.g., https://designmasters.com"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCompetitorModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCompetitor}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                disabled={isLoading || !newCompetitor.name || !newCompetitor.url || !newCompetitor.clientId}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Competitor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Insights Modal */}
      {showKeywordInsightsModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Keyword Insights</h3>
              <button onClick={() => setShowKeywordInsightsModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Placeholder for detailed keyword insights */}
            <div className="text-center py-8 text-gray-500">
              <Info size={48} className="mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Detailed keyword insights coming soon</h3>
              <p>
                This modal will provide in-depth analysis of the selected keyword, including ranking history, competitor
                analysis, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Generate SEO Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Content</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={reportSettings.includeKeywords}
                    onChange={(e) => setReportSettings({ ...reportSettings, includeKeywords: e.target.checked })}
                  />
                  Include Keyword Rankings
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={reportSettings.includeCompetitors}
                    onChange={(e) => setReportSettings({ ...reportSettings, includeCompetitors: e.target.checked })}
                  />
                  Include Competitor Analysis
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={reportSettings.includeInsights}
                    onChange={(e) => setReportSettings({ ...reportSettings, includeInsights: e.target.checked })}
                  />
                  Include Actionable Insights
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Recipients (comma-separated)</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={reportSettings.emailRecipients}
                onChange={(e) => setReportSettings({ ...reportSettings, emailRecipients: e.target.value })}
                placeholder="e.g., john@example.com, jane@example.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Frequency</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={reportSettings.scheduleFrequency}
                onChange={(e) => setReportSettings({ ...reportSettings, scheduleFrequency: e.target.value })}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="one-time">One-Time</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default SEORankTracking
