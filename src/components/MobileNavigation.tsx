"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
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
  ClipboardList,
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
  X,
  Send,
  Menu,
  Star,
  Clock,
  Zap
} from "lucide-react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"

interface MobileNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  onToggle: () => void
  recentItems?: string[]
  favoriteItems?: string[]
  onAddToFavorites?: (itemId: string) => void
  onRemoveFromFavorites?: (itemId: string) => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  disabled?: boolean
  badge?: string | number
  isNew?: boolean
  isFavorite?: boolean
  lastAccessed?: Date
}

interface MenuSection {
  title: string
  items: MenuItem[]
  expanded?: boolean
  icon?: React.ReactNode
  priority?: number
}

interface TouchGesture {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  velocity: number
  direction: 'left' | 'right' | 'up' | 'down' | null
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onToggle,
  recentItems = [],
  favoriteItems = [],
  onAddToFavorites,
  onRemoveFromFavorites
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    recent: true,
    main: true,
    sales: false,
    projects: false,
    tools: false,
    admin: false,
  })
  
  const [touchGesture, setTouchGesture] = useState<TouchGesture | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSections, setFilteredSections] = useState<MenuSection[]>([])
  const navigationRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<number>(0)
  
  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }, [])
  
  const handleDoubleTap = useCallback((itemId: string) => {
    const now = Date.now()
    const timeDiff = now - lastTapRef.current
    
    if (timeDiff < 300) {
      // Double tap detected - toggle favorite
      if (favoriteItems.includes(itemId)) {
        onRemoveFromFavorites?.(itemId)
      } else {
        onAddToFavorites?.(itemId)
      }
    }
    
    lastTapRef.current = now
  }, [favoriteItems, onAddToFavorites, onRemoveFromFavorites])
  
  const handlePanStart = useCallback((event: any, info: PanInfo) => {
    setTouchGesture({
      startX: info.point.x,
      startY: info.point.y,
      currentX: info.point.x,
      currentY: info.point.y,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null
    })
  }, [])
  
  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (!touchGesture) return
    
    const deltaX = info.point.x - touchGesture.startX
    const deltaY = info.point.y - touchGesture.startY
    const velocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2)
    
    let direction: TouchGesture['direction'] = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }
    
    setTouchGesture({
      ...touchGesture,
      currentX: info.point.x,
      currentY: info.point.y,
      deltaX,
      deltaY,
      velocity,
      direction
    })
  }, [touchGesture])
  
  const handlePanEnd = useCallback((event: any, info: PanInfo) => {
    if (!touchGesture) return
    
    // Swipe to close navigation
    if (touchGesture.direction === 'left' && Math.abs(touchGesture.deltaX) > 100 && touchGesture.velocity > 500) {
      onToggle()
    }
    
    setTouchGesture(null)
  }, [touchGesture, onToggle])

  // Filter and search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(allMenuSections)
      return
    }
    
    const filtered = allMenuSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0)
    
    setFilteredSections(filtered)
  }, [searchQuery])
  
  const createFavoriteItems = (): MenuItem[] => {
    return favoriteItems.map(itemId => {
      const allItems = allMenuSections.flatMap(section => section.items)
      const item = allItems.find(i => i.id === itemId)
      return item ? { ...item, isFavorite: true } : null
    }).filter(Boolean) as MenuItem[]
  }
  
  const createRecentItems = (): MenuItem[] => {
    return recentItems.slice(0, 5).map(itemId => {
      const allItems = allMenuSections.flatMap(section => section.items)
      const item = allItems.find(i => i.id === itemId)
      return item ? { ...item, lastAccessed: new Date() } : null
    }).filter(Boolean) as MenuItem[]
  }
  
  const allMenuSections: MenuSection[] = [
    {
      title: "Favorites",
      icon: <Star size={16} />,
      items: createFavoriteItems(),
      priority: 1
    },
    {
      title: "Recent",
      icon: <Clock size={16} />,
      items: createRecentItems(),
      priority: 2
    },
    {
      title: "Main",
      icon: <Home size={16} />,
      priority: 3,
      items: [
        { id: "dashboard", label: "Dashboard", icon: <Home size={20} />, isFavorite: favoriteItems.includes("dashboard") },
        { id: "calendar", label: "Calendar", icon: <Calendar size={20} />, isFavorite: favoriteItems.includes("calendar") },
        { id: "email", label: "Email", icon: <Mail size={20} />, badge: "3", isFavorite: favoriteItems.includes("email") },
        { id: "mailjet", label: "Mailjet Integration", icon: <Send size={20} />, isFavorite: favoriteItems.includes("mailjet") },
        { id: "reports", label: "Reports", icon: <BarChart3 size={20} />, isFavorite: favoriteItems.includes("reports") },
      ],
    },
    {
      title: "Sales & CRM",
      icon: <TrendingUp size={16} />,
      priority: 4,
      items: [
        { id: "leads", label: "Leads", icon: <UserPlus size={20} />, badge: "12", isFavorite: favoriteItems.includes("leads") },
        { id: "clients", label: "Clients", icon: <Users size={20} />, isFavorite: favoriteItems.includes("clients") },
        { id: "pipeline", label: "Pipeline", icon: <TrendingUp size={20} />, isFavorite: favoriteItems.includes("pipeline") },
        { id: "salesperformance", label: "Sales Performance", icon: <Activity size={20} />, isNew: true, isFavorite: favoriteItems.includes("salesperformance") },
      ],
    },
    {
      title: "Project Management",
      icon: <FolderOpen size={16} />,
      priority: 5,
      items: [
        { id: "projects", label: "Projects", icon: <FolderOpen size={20} />, badge: "8", isFavorite: favoriteItems.includes("projects") },
        { id: "tasks", label: "Tasks", icon: <CheckSquare size={20} />, badge: "24", isFavorite: favoriteItems.includes("tasks") },
        { id: "documents", label: "Documents", icon: <FileText size={20} />, isFavorite: favoriteItems.includes("documents") },
        { id: "requirements", label: "Requirements", icon: <ClipboardList size={20} />, isFavorite: favoriteItems.includes("requirements") },
        { id: "proposals", label: "Proposals", icon: <FileEdit size={20} />, badge: "3", isFavorite: favoriteItems.includes("proposals") },
        { id: "designfeedback", label: "Design Feedback", icon: <MessageSquare size={20} />, disabled: true, isFavorite: favoriteItems.includes("designfeedback") },
        { id: "clientportal", label: "Client Portal", icon: <Globe size={20} />, isFavorite: favoriteItems.includes("clientportal") },
      ],
    },
    {
      title: "Business Tools",
      icon: <Zap size={16} />,
      priority: 6,
      items: [
        { id: "webdesignquote", label: "Web Design Quote", icon: <FileText size={20} />, isFavorite: favoriteItems.includes("webdesignquote") },
        { id: "invoicing", label: "Invoicing", icon: <DollarSign size={20} />, badge: "5", isFavorite: favoriteItems.includes("invoicing") },
        { id: "websiteaudit", label: "Website Audit", icon: <Search size={20} />, isNew: true, isFavorite: favoriteItems.includes("websiteaudit") },
        { id: "localseo", label: "Local SEO", icon: <MapPin size={20} />, isFavorite: favoriteItems.includes("localseo") },
        { id: "salesscripts", label: "Sales Scripts", icon: <Phone size={20} />, isFavorite: favoriteItems.includes("salesscripts") },
        { id: "roicalculator", label: "ROI Calculator", icon: <Calculator size={20} />, isFavorite: favoriteItems.includes("roicalculator") },
        { id: "competitoranalysis", label: "Competitor Analysis", icon: <Target size={20} />, isFavorite: favoriteItems.includes("competitoranalysis") },
      ],
    },
    {
      title: "Administration",
      icon: <Settings size={16} />,
      priority: 7,
      items: [
        { id: "productivityadmin", label: "Productivity Admin", icon: <Briefcase size={20} />, isFavorite: favoriteItems.includes("productivityadmin") },
        { id: "settings", label: "Settings", icon: <Settings size={20} />, isFavorite: favoriteItems.includes("settings") },
      ],
    },
  ]
  
  const menuSections = searchQuery ? filteredSections : allMenuSections.filter(section => 
    section.title === 'Favorites' ? section.items.length > 0 :
    section.title === 'Recent' ? section.items.length > 0 : true
  )

  const handleItemClick = useCallback((itemId: string, event?: React.MouseEvent) => {
    // Handle double tap for favorites
    handleDoubleTap(itemId)
    
    setActiveTab(itemId)
    
    // Add haptic feedback if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    // Track analytics
    console.log('Navigation item clicked:', { itemId, timestamp: new Date().toISOString() })

    // Enhanced scroll to top with multiple fallbacks
    const scrollToTop = () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return
      
      const scrollTargets = [
        document.querySelector('main[class*="overflow-auto"]') as HTMLElement,
        document.querySelector("main") as HTMLElement,
        document.querySelector("main[data-main-content]") as HTMLElement,
        document.documentElement,
        document.body,
      ]

      const target = scrollTargets.find((t) => t !== null)
      if (target) {
        if (target === document.documentElement || target === document.body) {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
        } else {
          target.scrollTo({ top: 0, left: 0, behavior: "smooth" })
        }
      }

      // Force window scroll for mobile compatibility
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    }

    // Multiple scroll attempts for mobile reliability
    scrollToTop()
    requestAnimationFrame(scrollToTop)
    setTimeout(scrollToTop, 50)
    setTimeout(scrollToTop, 150)
    setTimeout(scrollToTop, 300) // Extra delay for mobile

    onToggle() // Close menu after selection
  }, [setActiveTab, handleDoubleTap, onToggle])

  // Close menu when clicking outside
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest(".mobile-nav-container") && !target.closest(".mobile-nav-trigger")) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden" // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onToggle])

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeTab === item.id
    const isDisabled = item.disabled

    return (
      <motion.button
        key={item.id}
        onClick={() => !isDisabled && handleItemClick(item.id)}
        disabled={isDisabled}
        className={`w-full flex items-center px-4 py-3 text-base rounded-xl transition-all duration-200 group touch-manipulation ${
          isDisabled
            ? "text-gray-400 cursor-not-allowed opacity-50"
            : isActive
              ? "bg-primary-100 text-primary-700 shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
        }`}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span
          className={`mr-4 ${
            isDisabled ? "text-gray-400" : isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"
          }`}
        >
          {item.icon}
        </span>
        <span className="flex-1 text-left font-medium">{item.label}</span>
        {isActive && !isDisabled && (
          <motion.div
            className="w-2 h-2 bg-primary-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
    )
  }

  const renderSection = (section: MenuSection, sectionKey: string) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <motion.div
        key={sectionKey}
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-800 transition-colors touch-manipulation rounded-lg hover:bg-gray-50 active:bg-gray-100"
          whileTap={{ scale: 0.98 }}
        >
          <span>{section.title}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1 pl-2">
                {section.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {renderMenuItem(item)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="mobile-nav-container fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">CRM</span>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-gray-900">Web Design CRM</h1>
                    <p className="text-sm text-gray-600">Project Management</p>
                  </div>
                </div>
                <motion.button
                  onClick={onToggle}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors touch-manipulation"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} className="text-gray-600" />
                </motion.button>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-safe">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
                {menuSections.map((section, index) => renderSection(section, Object.keys(expandedSections)[index]))}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileNavigation
