'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LazyWrapper, createLazyComponent } from '@/components/ui/LazyWrapper'
import { performanceOptimizationService } from '@/services/performanceOptimization'
import { Skeleton } from '../../../components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Lazy load components for better performance
const LazyHeader = createLazyComponent(
  () => import('@/components/layout/Header'),
  { preload: true }
)

const LazySidebar = createLazyComponent(
  () => import('@/components/Sidebar'),
  { preload: true }
)

const LazyFooter = createLazyComponent(
  () => import('@/components/layout/Footer'),
  { preload: false }
)

// Route-based lazy components
const LazyDashboard = createLazyComponent(
  () => import('@/components/Dashboard')
)

const LazyContacts = createLazyComponent(
  () => import('@/components/Clients')
)

const LazyDeals = createLazyComponent(
  () => import('@/components/Pipeline')
)

const LazyCompanies = createLazyComponent(
  () => import('@/components/Company')
)

const LazyQuotes = createLazyComponent(
  () => import('@/components/ProposalBuilder')
)

const LazyReports = createLazyComponent(
  () => import('@/components/Reports')
)

const LazySettings = createLazyComponent(
  () => import('@/components/Settings')
)

const LazySecurityDashboard = createLazyComponent(
  () => import('@/components/security/SecurityDashboard')
)

const LazyPerformanceDashboard = createLazyComponent(
  () => import('@/components/performance/PerformanceDashboard')
)

const LazyPerformanceMonitor = createLazyComponent(
  () => import('@/components/performance/PerformanceMonitor')
)

interface OptimizedLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

// Loading skeletons for different sections
const HeaderSkeleton = () => (
  <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center">
      <Skeleton className="h-6 w-32" />
      <div className="ml-auto flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
)

const SidebarSkeleton = () => (
  <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <Skeleton className="h-6 w-20 mb-2" />
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

const FooterSkeleton = () => (
  <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center justify-between">
      <Skeleton className="h-4 w-48" />
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </footer>
)

// Route component mapping for dynamic loading
const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  '/dashboard': LazyDashboard,
  '/contacts': LazyContacts,
  '/deals': LazyDeals,
  '/companies': LazyCompanies,
  '/quotes': LazyQuotes,
  '/reports': LazyReports,
  '/settings': LazySettings,
  '/security': LazySecurityDashboard,
  '/performance': LazyPerformanceDashboard,
  '/performance/monitor': LazyPerformanceMonitor
}

export default function OptimizedLayout({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  className = ''
}: OptimizedLayoutProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [layoutMetrics, setLayoutMetrics] = useState({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0
  })

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true)
    
    // Performance monitoring
    const startTime = performance.now()
    
    // Track layout render performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('layout')) {
          setLayoutMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }))
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    // Measure layout render time
    performance.mark('layout-start')
    
    return () => {
      performance.mark('layout-end')
      performance.measure('layout-render', 'layout-start', 'layout-end')
      observer.disconnect()
      
      // Log layout performance
      const endTime = performance.now()
      console.log('Layout render performance:', {
        renderTime: endTime - startTime,
        pathname,
        timestamp: Date.now()
      })
    }
  }, [pathname])

  // Preload route components based on current path
  useEffect(() => {
    if (!isClient) return
    
    // Preload likely next routes based on current route
    const preloadRoutes = getPreloadRoutes(pathname)
    
    preloadRoutes.forEach(route => {
      const Component = ROUTE_COMPONENTS[route]
      if (Component) {
        // Preload component after a short delay
        setTimeout(() => {
          // This will trigger the lazy loading
          React.createElement(Component)
        }, 1000)
      }
    })
  }, [pathname, isClient])

  // Get routes to preload based on current route
  const getPreloadRoutes = (currentPath: string): string[] => {
    const preloadMap: Record<string, string[]> = {
      '/dashboard': ['/contacts', '/deals', '/reports'],
      '/contacts': ['/deals', '/companies', '/dashboard'],
      '/deals': ['/contacts', '/quotes', '/companies'],
      '/companies': ['/contacts', '/deals'],
      '/quotes': ['/deals', '/contacts'],
      '/reports': ['/dashboard', '/deals', '/contacts'],
      '/settings': ['/security', '/performance']
    }
    
    return preloadMap[currentPath] || []
  }

  // Dynamic route component rendering
  const renderRouteComponent = () => {
    const RouteComponent = ROUTE_COMPONENTS[pathname]
    
    if (RouteComponent) {
      return (
        <LazyWrapper
          skeleton="dashboard"
          className="flex-1"
          onLoad={() => {
            console.log('Route load performance:', {
              route: pathname,
              timestamp: Date.now()
            })
          }}
        >
          <RouteComponent />
        </LazyWrapper>
      )
    }
    
    return children
  }

  // Critical CSS inlining for above-the-fold content
  useEffect(() => {
    if (isClient) {
      // Inline critical CSS for above-the-fold content
      const criticalCSS = `
        .layout-critical {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }
      `
      performanceOptimizationService.inlineCriticalCSS(criticalCSS)
    }
  }, [isClient])

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      {showHeader && (
        <LazyWrapper
          fallback={<HeaderSkeleton />}
          skeleton="custom"
          className="sticky top-0 z-50"
        >
          <LazyHeader />
        </LazyWrapper>
      )}
      
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <LazyWrapper
            fallback={<SidebarSkeleton />}
            skeleton="custom"
            className="hidden md:block"
          >
            <LazySidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </LazyWrapper>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto p-6">
            {/* Performance monitoring in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-muted rounded text-xs text-muted-foreground">
                Layout Render: {layoutMetrics.renderTime.toFixed(2)}ms | 
                Route: {pathname} | 
                Hydrated: {isClient ? 'Yes' : 'No'}
              </div>
            )}
            
            {/* Route-based content or children */}
            {renderRouteComponent()}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      {showFooter && (
        <LazyWrapper
          fallback={<FooterSkeleton />}
          skeleton="custom"
        >
          <LazyFooter />
        </LazyWrapper>
      )}
      
      {/* Performance monitoring overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceOverlay metrics={layoutMetrics} />
      )}
    </div>
  )
}

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  memoryUsage: number
}

// Development performance overlay
function PerformanceOverlay({ metrics }: { metrics: PerformanceMetrics }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isVisible])
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show Performance Metrics (Ctrl+Shift+P)"
        >
          <Loader2 className="h-4 w-4" />
        </button>
      </div>
    )
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between">
            <span>Render Time:</span>
            <span>{metrics.renderTime.toFixed(2)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Components:</span>
            <span>{metrics.componentCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for layout performance monitoring
export function useLayoutPerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    hydrationTime: 0,
    componentCount: 0
  })
  
  useEffect(() => {
    const startTime = performance.now()
    
    // Track hydration time
    const hydrationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'Next.js-hydration') {
          setMetrics(prev => ({
            ...prev,
            hydrationTime: entry.duration
          }))
        }
      })
    })
    
    hydrationObserver.observe({ entryTypes: ['measure'] })
    
    return () => {
      const endTime = performance.now()
      setMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime
      }))
      hydrationObserver.disconnect()
    }
  }, [])
  
  return metrics
}

// Export route components for external use
export {
  LazyDashboard,
  LazyContacts,
  LazyDeals,
  LazyCompanies,
  LazyQuotes,
  LazyReports,
  LazySettings,
  LazySecurityDashboard,
  LazyPerformanceDashboard,
  LazyPerformanceMonitor
}