"use client"

import React from "react"
import {
  Home,
  Users,
  TrendingUp,
  FolderOpen,
  CheckSquare,
  Calendar,
  FileText,
  Mail,
  BarChart3,
  Settings,
  FileEdit,
  Globe,
  MessageSquare,
  DollarSign,
  Search,
  MapPin,
  Phone,
  Calculator,
  Target,
  Activity,
  Briefcase,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Send,
  Zap,
  Download,
  Sliders,
  Building2,
  StickyNote,
  Bell,
  Star,
  BookOpen,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
  expanded?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    main: true,
    sales: true,
    projects: true,
    tools: true,
    advanced: true,
    company: true,
    admin: true,
  })

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  const menuSections: MenuSection[] = [
    {
      title: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <Home size={18} />, shortcut: "Alt+D" },
        { id: "calendar", label: "Calendar", icon: <Calendar size={18} />, shortcut: "Alt+A" },
        { id: "email", label: "Email", icon: <Mail size={18} />, shortcut: "Alt+E" },
        { id: "notes", label: "Notes", icon: <StickyNote size={18} />, shortcut: "Alt+N" },
        { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
      ],
    },
    {
      title: "Sales & CRM",
      items: [
        { id: "leads", label: "Leads", icon: <UserPlus size={18} /> },
        { id: "clients", label: "Clients", icon: <Users size={18} />, shortcut: "Alt+C" },
        { id: "pipeline", label: "Pipeline", icon: <TrendingUp size={18} />, shortcut: "Alt+P" },
        { id: "salesperformance", label: "Sales Performance", icon: <Activity size={18} /> },
      ],
    },
    {
      title: "Project Management",
      items: [
        { id: "projects", label: "Projects", icon: <FolderOpen size={18} /> },
        { id: "tasks", label: "Tasks", icon: <CheckSquare size={18} />, shortcut: "Alt+T" },
        { id: "documents", label: "Documents", icon: <FileText size={18} /> },
        // Removed "Project Requirements" button
        { id: "proposals", label: "Proposals", icon: <FileEdit size={18} /> },
        { id: "designfeedback", label: "Design Feedback", icon: <MessageSquare size={18} />, shortcut: "Alt+F" },
        { id: "clientportal", label: "Client Portal", icon: <Globe size={18} /> },
        { id: "enhancedclientdashboard", label: "Client Dashboard", icon: <BarChart3 size={18} /> },
        { id: "contractapprovalworkflow", label: "Contract Approval", icon: <FileText size={18} /> },
        { id: "advancedprojectmanagement", label: "Advanced Projects", icon: <FolderOpen size={18} /> },
      ],
    },
    {
      title: "Business Tools",
      items: [
        { id: "invoicing", label: "Invoicing", icon: <DollarSign size={18} />, shortcut: "Alt+I" },
        // Removed "Enhanced Payments" button
        { id: "financialdashboard", label: "Financial Dashboard", icon: <BarChart3 size={18} /> },
        { id: "webdesignquote", label: "Web Design Quote", icon: <FileEdit size={18} /> },
        { id: "websiteaudit", label: "Website Audit", icon: <Search size={18} /> },
        { id: "localseo", label: "Local SEO", icon: <MapPin size={18} /> },
        { id: "salesscripts", label: "Sales Scripts", icon: <Phone size={18} /> },
        { id: "roicalculator", label: "ROI Calculator", icon: <Calculator size={18} /> },
        { id: "competitoranalysis", label: "Competitor Analysis", icon: <Target size={18} /> },
      ],
    },
    {
      title: "Advanced Features",
      items: [
        { id: "advancedanalytics", label: "Advanced Analytics", icon: <BarChart3 size={18} /> },
        { id: "automationworkflows", label: "Automation Workflows", icon: <Zap size={18} /> },
        { id: "automatednotificationsystem", label: "Smart Notifications", icon: <Bell size={18} /> },
        { id: "customfields", label: "Custom Fields", icon: <Sliders size={18} /> },
        { id: "dataexport", label: "Data Export", icon: <Download size={18} /> },
        { id: "enhancedsearch", label: "Enhanced Search", icon: <Search size={18} /> },
      ],
    },
    {
      title: "Company",
      items: [{ id: "company", label: "Company Dashboard", icon: <Building2 size={18} /> }],
    },
    {
      title: "Administration",
      items: [
        { id: "admindashboard", label: "Admin Dashboard", icon: <Settings size={18} />, shortcut: "Alt+Admin" },
        { id: "productivityadmin", label: "Productivity Admin", icon: <Briefcase size={18} /> },
        { id: "mailjet", label: "Mailjet Integration", icon: <Send size={18} />, shortcut: "Alt+M" },
        { id: "settings", label: "Settings", icon: <Settings size={18} /> },
        { id: "trainingdashboard", label: "Training Dashboard", icon: <BookOpen size={18} /> },
        { id: "enhancedcrmshowcase", label: "Enhanced Features", icon: <Star size={18} /> },
      ],
    },
  ]

  const handleItemClick = (itemId: string) => {
    setActiveTab(itemId)

    // Scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeTab === item.id

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item.id)}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
          isActive ? "bg-gray-900 text-white border border-purple-500" : "text-white hover:bg-gray-800 hover:text-white"
        }`}
      >
        <span className={`mr-3 ${isActive ? "text-purple-400" : "text-gray-400 group-hover:text-white"}`}>
          {item.icon}
        </span>
        <span className="flex-1 text-left">{item.label}</span>
      </button>
    )
  }

  const renderSection = (section: MenuSection, sectionKey: string) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <div key={sectionKey} className="mb-6">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
        >
          <span>{section.title}</span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {isExpanded && <div className="mt-2 space-y-1">{section.items.map(renderMenuItem)}</div>}
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CRM</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Web Design CRM</h1>
            <p className="text-xs text-gray-500">Project Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 bg-black text-white">
        {menuSections.map((section, index) => renderSection(section, Object.keys(expandedSections)[index]))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span>All systems operational</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
