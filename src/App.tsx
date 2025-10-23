"use client"

import React, { useState, useEffect, lazy, Suspense } from "react"
import dynamic from "next/dynamic"
import { Bell, Search, User, LogOut, Settings, Menu, Clock } from "lucide-react"
import { useToast, setGlobalToastInstance } from "./components/ui/use-toast"
import { Toaster } from "./components/ui/toaster"
import { EnhancedErrorBoundary } from "./components/EnhancedErrorBoundary"
import { useAuth } from "./context/AuthContext"
import { useAppContext } from "./context/AppContext"
import { preloadCriticalComponents, preloadBasedOnRoute } from '@/utils/dynamicImports';

// Dynamic imports for layout components
const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false })
const QuickNavigation = dynamic(() => import("./components/QuickNavigation"), { ssr: false })
const FocusMode = dynamic(() => import("./components/FocusMode"), { ssr: false })
const MobileNavigation = dynamic(() => import("./components/MobileNavigation"), { ssr: false })
const ProposalBuilder = dynamic(() => import("./components/ProposalBuilder"), { ssr: false })
const WebDesignQuote = dynamic(() => import("./components/WebDesignQuote"), { ssr: false })


// Loading component
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// Lazy load components for better performance
const Dashboard = lazy(() => import("./components/Dashboard"))
const Clients = lazy(() => import("./components/Clients"))
const Pipeline = lazy(() => import("./components/Pipeline"))
const Projects = lazy(() => import("./components/Projects"))
const Tasks = lazy(() => import("./components/Tasks"))
const Calendar = lazy(() => import("./components/Calendar"))
const Documents = lazy(() => import("./components/Documents"))
const Email = lazy(() => import("./components/Email"))
const Reports = lazy(() => import("./components/Reports"))
const SettingsComponent = lazy(() => import("./components/Settings"))
const CustomizableDashboard = dynamic(() => import('./components/CustomizableDashboard'), { ssr: false });

// ProposalBuilder is now imported directly above to avoid blob fetch issues
const ClientPortal = lazy(() => import("./components/EnhancedClientPortal"))
const DesignFeedback = lazy(() => import("./components/DesignFeedback"))
const Invoicing = lazy(() => import("./components/EnhancedContractInvoiceManager"))
const WebsiteAudit = lazy(() => import("./components/WebsiteAudit"))
const LocalSEO = lazy(() => import("./components/LocalSEO"))
const SalesScripts = lazy(() => import("./components/SalesScripts"))
const ROICalculator = lazy(() => import("./components/ROICalculator"))
const CompetitorAnalysis = lazy(() => import("./components/CompetitorAnalysis"))
const SalesPerformance = lazy(() => import("./components/SalesPerformance"))
const ProductivityAdmin = lazy(() => import("./components/ProductivityAdmin"))
const Leads = lazy(() => import("./components/Leads"))
const MailjetIntegration = lazy(() => import("./components/MailjetIntegration"))
const EnhancedClientDashboard = lazy(() => import("./components/EnhancedClientDashboard"))
const AdvancedAnalytics = lazy(() => import("./components/AdvancedAnalytics"))
const AutomationWorkflows = lazy(() => import("./components/AutomationWorkflows"))
const CustomFieldsManager = lazy(() => import("./components/CustomFieldsManager"))
const DataExport = lazy(() => import("./components/DataExport"))
const EnhancedSearch = lazy(() => import("./components/EnhancedSearch"))


const CommissionDashboard = lazy(() => import("./components/CommissionDashboard"))
const Contracts = lazy(() => import("./components/Contracts"))
const Company = lazy(() => import("./components/Company"))
const AdminDashboard = lazy(() => import("./components/AdminDashboard"))
const Notes = lazy(() => import("./components/Notes"))
const EnhancedPaymentSystem = lazy(() => import("./components/EnhancedPaymentSystem"))
const ContractApprovalWorkflow = lazy(() => import("./components/ContractApprovalWorkflow"))

const FinancialDashboard = lazy(() => import("./components/FinancialDashboard"))
const AutomatedNotificationSystem = lazy(() => import("./components/AutomatedNotificationSystem"))
const AdvancedProjectManagement = lazy(() => import("./components/AdvancedProjectManagement"))
const EnhancedCRMShowcase = lazy(() => import("./components/EnhancedCRMShowcase"))
const TrainingDashboard = lazy(() => import("./components/TrainingDashboard"))

const ReportsPage = dynamic(() => import("@/app/reports/page"), { ssr: false });
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showNotifications, setShowNotifications] = useState(false)
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const toastInstance = useToast()
  const { toast } = toastInstance
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { user: currentUser } = useAuth()

  // Initialize global toast instance for errorHandler
  useEffect(() => {
    setGlobalToastInstance(toastInstance)
  }, [toastInstance])

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    // Preload critical components after initial load
    preloadCriticalComponents()
  }, [])

  // Preload components based on current route
  useEffect(() => {
    if (isClient && activeTab) {
      preloadBasedOnRoute(activeTab)
    }
  }, [activeTab, isClient])

  useEffect(() => {
    if (!isClient) return
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isClient])

  const [notifications, setNotifications] = useState([
    { id: 1, text: "New task assigned to you", read: false },
    { id: 2, text: "Meeting with TechCorp in 30 minutes", read: false },
    { id: 3, text: "StartupXYZ proposal due tomorrow", read: false },
    { id: 4, text: "New design feedback from TechCorp", read: false },
    { id: 5, text: "Client portal access requested", read: false },
  ])

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "clients", label: "Clients", href: "/clients" },
    { id: "leads", label: "Leads", href: "/leads" },
    { id: "pipeline", label: "Pipeline", href: "/pipeline" },
    { id: "projects", label: "Projects", href: "/projects" },
    { id: "tasks", label: "Tasks", href: "/tasks" },
    { id: "calendar", label: "Calendar", href: "/calendar" },
    { id: "documents", label: "Documents", href: "/documents" },
    { id: "email", label: "Email", href: "/email" },
    { id: "reports", label: "Reports", href: "/reports" },
    { id: "settings", label: "Settings", href: "/settings" },

    { id: "proposals", label: "Proposals", href: "/proposals" },
    { id: "clientportal", label: "Client Portal", href: "/clientportal" },
    { id: "designfeedback", label: "Design Feedback", href: "/designfeedback" },
    { id: "invoicing", label: "Invoicing", href: "/invoicing" },

    
    { id: "websiteaudit", label: "Website Audit", href: "/websiteaudit" },
    { id: "localseo", label: "Local SEO", href: "/localseo" },
    { id: "salesscripts", label: "Sales Scripts", href: "/salesscripts" },
    { id: "roicalculator", label: "ROI Calculator", href: "/roicalculator" },
    { id: "competitoranalysis", label: "Competitor Analysis", href: "/competitoranalysis" },
    { id: "salesperformance", label: "Sales Performance", href: "/salesperformance" },
    { id: "productivityadmin", label: "Productivity Admin", href: "/productivityadmin" },
    { id: "webdesignquote", label: "Web Design Quote", href: "/webdesignquote" },
    { id: "mailjet", label: "Mailjet Integration", href: "/mailjet" },
    { id: "advancedanalytics", label: "Advanced Analytics", href: "/advancedanalytics" },
    { id: "automationworkflows", label: "Automation Workflows", href: "/automationworkflows" },
    { id: "customfields", label: "Custom Fields", href: "/customfields" },
    { id: "dataexport", label: "Data Export", href: "/dataexport" },
    { id: "enhancedsearch", label: "Enhanced Search", href: "/enhancedsearch" },
    { id: "enhancedclientdashboard", label: "Client Dashboard", href: "/enhancedclientdashboard" },
    { id: "admindashboard", label: "Admin Dashboard", href: "/admindashboard" },
    { id: "enhancedpaymentsystem", label: "Enhanced Payment System", href: "/enhancedpaymentsystem" },
    { id: "contractapprovalworkflow", label: "Contract Approval Workflow", href: "/contractapprovalworkflow" },

    { id: "financialdashboard", label: "Financial Dashboard", href: "/financialdashboard" },
    { id: "automatednotificationsystem", label: "Automated Notifications", href: "/automatednotificationsystem" },
    { id: "advancedprojectmanagement", label: "Advanced Project Management", href: "/advancedprojectmanagement" },
    { id: "enhancedcrmshowcase", label: "Enhanced CRM Showcase", href: "/enhancedcrmshowcase" },
    { id: "trainingdashboard", label: "Training Dashboard", href: "/trainingdashboard" },
    { id: "commission", label: "Commission Dashboard", href: "/commission" },
    { id: "contracts", label: "Contracts", href: "/contracts" },
    { id: "company", label: "Company", href: "/company" },
    { id: "notes", label: "Notes", href: "/notes" },
  ]

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast({
      type: "success",
      title: "Notifications",
      description: "All notifications marked as read",
    })
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    toast({
      title: "Navigation",
      description: `Switched to ${tab}`,
    })

    // Close mobile menu when changing tabs
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }

    // Scroll to top (client-side only)
    if (isClient && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={handleTabChange} />
      case "clients":
        return <Clients />
      case "leads":
        return <Leads />
      case "pipeline":
        return <Pipeline />
      case "projects":
        return <Projects />
      case "tasks":
        return <Tasks />
      case "calendar":
        return <Calendar />
      case "documents":
        return <Documents />
      case "email":
        return <Email />
      case "reports":
        return <ReportsPage />
      case "settings":
        return <SettingsComponent />
      case "proposals":
        return <ProposalBuilder />
      case "clientportal":
        return <ClientPortal />
      case "designfeedback":
        return <DesignFeedback />
      case "invoicing":
        return <Invoicing />
      case "websiteaudit":
        return <WebsiteAudit />
      case "localseo":
        return <LocalSEO />
      case "salesscripts":
        return <SalesScripts />
      case "roicalculator":
        return <ROICalculator />
      case "competitoranalysis":
        return <CompetitorAnalysis />
      case "salesperformance":
        return <SalesPerformance />
      case "productivityadmin":
        return <ProductivityAdmin />
      case "webdesignquote":
        return <WebDesignQuote />
      case "mailjet":
        return <MailjetIntegration />
      case "advancedanalytics":
        return <AdvancedAnalytics />
      case "automationworkflows":
        return <AutomationWorkflows />
      case "customfields":
        return <CustomFieldsManager />
      case "dataexport":
        return <DataExport />
      case "enhancedsearch":
        return <EnhancedSearch />
      case "enhancedclientdashboard":
        return <EnhancedClientDashboard />
      case "commission":
        return <CommissionDashboard currentUser={currentUser} />
      case "contracts":
        return <Contracts currentUser={currentUser} />
      case "company":
        return <Company setActiveTab={handleTabChange} />
      case "admindashboard":
        return <AdminDashboard />
      case "notes":
        return <Notes />
      case "enhancedpaymentsystem":
        return <EnhancedPaymentSystem />
      case "contractapprovalworkflow":
        return <ContractApprovalWorkflow />
      case "financialdashboard":
        return <FinancialDashboard />
      case "automatednotificationsystem":
        return <AutomatedNotificationSystem />
      case "advancedprojectmanagement":
        return <AdvancedProjectManagement />
      case "enhancedcrmshowcase":
        return <EnhancedCRMShowcase />
      case "trainingdashboard":
        return <TrainingDashboard />
      case "customizabledashboard":
        return <CustomizableDashboard />
      default:
        return <Dashboard setActiveTab={handleTabChange} />
    }
  }

  return (
    <EnhancedErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row">
        {/* Desktop Sidebar */}
        {isClient && !isMobile && <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />}
        {!isClient && <div className="hidden md:block"><Sidebar activeTab={activeTab} setActiveTab={handleTabChange} /></div>}

        {/* Mobile Navigation */}
        {isClient && isMobile && (
          <MobileNavigation
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                {isClient && isMobile && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Menu size={24} className="text-gray-600" />
                  </button>
                )}
                {!isClient && (
                  <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Menu size={24} className="text-gray-600" />
                  </button>
                )}

                <button
                  onClick={() => setIsQuickNavOpen(true)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow bg-white"
                >
                  <Search size={18} />
                  <span className="hidden md:inline text-sm">Search or jump to...</span>
                  <span className="hidden md:flex items-center ml-auto px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                    ⌘K
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Focus Mode Button */}
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowFocusMode(!showFocusMode)}
                    title="Focus Mode"
                  >
                    <span className="sr-only">Focus Mode</span>
                    <Clock size={20} />
                  </button>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <span className="sr-only">Notifications</span>
                    <Bell size={20} />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg z-20 border overflow-hidden">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700">
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div>
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                  !notification.read ? "bg-blue-50" : ""
                                }`}
                              >
                                <p className="text-sm">{notification.text}</p>
                                <p className="text-xs text-gray-500 mt-1">Just now</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="sr-only">User menu</span>
                    <User size={20} className="text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-20 border overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-medium text-sm">John Doe</p>
                        <p className="text-xs text-gray-500">john@example.com</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveTab("settings")
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gray-50 relative" data-main-content>
            <div className="p-4 sm:p-6 lg:p-8">
              <Suspense fallback={<LoadingSpinner />}>
                {renderActiveComponent()}
              </Suspense>
            </div>
          </main>
        </div>

        {/* Quick Navigation Modal */}
        {isQuickNavOpen && (
          <QuickNavigation
            isOpen={isQuickNavOpen}
            onClose={() => setIsQuickNavOpen(false)}
            navigationItems={navigationItems}
            setActiveTab={handleTabChange}
          />
        )}

        {/* Focus Mode Component */}
        {showFocusMode && <FocusMode isOpen={showFocusMode} onClose={() => setShowFocusMode(false)} />}

        {/* Notification System */}
        {/* <NotificationSystem /> - Removed as component doesn't exist */}

        {/* Toast Container */}
        <Toaster />
      </div>
    </EnhancedErrorBoundary>
  )
}

export default App
