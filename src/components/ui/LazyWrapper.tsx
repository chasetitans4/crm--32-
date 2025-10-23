'use client'

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react'
import { Skeleton } from '../../../components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { performanceOptimizationService } from '@/services/performanceOptimization'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
  className?: string
  minHeight?: string | number
  skeleton?: 'card' | 'table' | 'form' | 'dashboard' | 'custom'
  skeletonRows?: number
  onLoad?: () => void
  onError?: (error: Error) => void
}

interface LazyComponentProps {
  importFn: () => Promise<{ default: ComponentType<any> }>
  fallback?: ReactNode
  errorFallback?: ReactNode
  preload?: boolean
  retryCount?: number
  timeout?: number
}

// Error Boundary for lazy components
class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
    this.props.onError?.(error)
    
    // Log performance metric for failed component loads
    console.error('Component load error metrics:', {
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <Loader2 className="h-4 w-4" />
              Failed to load component
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Skeleton components for different layouts
const CardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </CardContent>
  </Card>
)

const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <div className="flex space-x-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: 4 }).map((_, j) => (
          <Skeleton key={j} className="h-6 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

const FormSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton rows={6} />
      <CardSkeleton rows={6} />
    </div>
  </div>
)

const LoadingSkeleton = ({ type, rows }: { type: LazyWrapperProps['skeleton']; rows?: number }) => {
  switch (type) {
    case 'card':
      return <CardSkeleton rows={rows} />
    case 'table':
      return <TableSkeleton rows={rows} />
    case 'form':
      return <FormSkeleton rows={rows} />
    case 'dashboard':
      return <DashboardSkeleton />
    default:
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
  }
}

// Main LazyWrapper component
export function LazyWrapper({
  children,
  fallback,
  errorFallback,
  className,
  minHeight,
  skeleton = 'custom',
  skeletonRows = 3,
  onLoad,
  onError
}: LazyWrapperProps) {
  const defaultFallback = fallback || <LoadingSkeleton type={skeleton} rows={skeletonRows} />

  React.useEffect(() => {
    onLoad?.()
  }, [])

  return (
    <LazyErrorBoundary fallback={errorFallback} onError={onError}>
      <div className={className} style={{ minHeight }}>
        <Suspense fallback={defaultFallback}>
          {children}
        </Suspense>
      </div>
    </LazyErrorBoundary>
  )
}

// Higher-order component for creating lazy components
export function createLazyComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<LazyComponentProps, 'importFn'> = {}
) {
  const {
    fallback,
    errorFallback,
    preload = false,
    retryCount = 3,
    timeout = 10000
  } = options

  // Create lazy component with retry logic
  const LazyComponent = lazy(() => {
    const startTime = Date.now()
    
    return Promise.race([
      // Main import with retry logic
      (async () => {
        let lastError: Error = new Error('Component load failed')
        
        for (let attempt = 1; attempt <= retryCount; attempt++) {
          try {
            const module = await importFn()
            
            // Log successful load
            console.log('Component load success:', {
              loadTime: Date.now() - startTime,
              attempt,
              timestamp: Date.now()
            })
            
            return module
          } catch (error) {
            lastError = error as Error
            console.warn(`Component load attempt ${attempt} failed:`, error)
            
            if (attempt < retryCount) {
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            }
          }
        }
        
        throw lastError
      })(),
      
      // Timeout
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Component load timeout after ${timeout}ms`))
        }, timeout)
      })
    ])
  })

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(error => {
        console.warn('Preload failed:', error)
      })
    }, 100)
  }

  // Return wrapped component
  return React.forwardRef<any, T>((props, ref) => (
    <LazyWrapper
      fallback={fallback}
      errorFallback={errorFallback}
      skeleton="card"
    >
      <LazyComponent {...(props as any)} ref={ref} />
    </LazyWrapper>
  ))
}

// Hook for preloading components
export function usePreloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  condition: boolean = true
) {
  React.useEffect(() => {
    if (condition && typeof window !== 'undefined') {
      const preloadTimer = setTimeout(() => {
        importFn().catch(error => {
          console.warn('Component preload failed:', error)
        })
      }, 100)

      return () => clearTimeout(preloadTimer)
    }
  }, [importFn, condition])
}

// Intersection Observer based lazy loading
export function useIntersectionLazyLoad(
  ref: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element || hasIntersected) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          setHasIntersected(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [ref, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Component for intersection-based lazy loading
interface IntersectionLazyProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function IntersectionLazy({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  once = true
}: IntersectionLazyProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { isIntersecting, hasIntersected } = useIntersectionLazyLoad(ref, {
    threshold,
    rootMargin
  })

  const shouldRender = once ? hasIntersected : isIntersecting

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (fallback || <LoadingSkeleton type="custom" />)}
    </div>
  )
}

// Utility for creating route-based code splitting
export function createRouteComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  return createLazyComponent(importFn, {
    preload: false,
    retryCount: 3,
    timeout: 15000,
    fallback: <LoadingSkeleton type="dashboard" />
  })
}

export default LazyWrapper