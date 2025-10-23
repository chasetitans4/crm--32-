import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Activity, 
  Zap, 
  Image, 
  Database, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Monitor
} from 'lucide-react'
import { performanceOptimizationService, PerformanceMetrics } from '../../services/performanceOptimization'

interface WebVitals {
  fcp: number
  lcp: number
  fid: number
  cls: number
}

interface MemoryUsage {
  used: number
  total: number
  percentage: number
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    cacheHitRate: 0,
    imageOptimizationSavings: 0
  })
  const [webVitals, setWebVitals] = useState<WebVitals>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0
  })
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({
    used: 0,
    total: 0,
    percentage: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const refreshMetrics = async () => {
    setIsLoading(true)
    try {
      // Get current performance metrics
      const currentMetrics = performanceOptimizationService.getPerformanceMetrics()
      setMetrics(currentMetrics)

      // Measure Web Vitals
      const vitals = await performanceOptimizationService.measureWebVitals()
      setWebVitals(vitals)

      // Get memory usage
      const memory = performanceOptimizationService.getMemoryUsage()
      setMemoryUsage(memory)

      // Analyze bundle size
      await performanceOptimizationService.analyzeBundleSize()

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh performance metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshMetrics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getPerformanceScore = (): { score: number; grade: string; color: string } => {
    let score = 100
    
    // Deduct points based on metrics
    if (webVitals.fcp > 1800) score -= 15
    if (webVitals.lcp > 2500) score -= 20
    if (webVitals.fid > 100) score -= 15
    if (webVitals.cls > 0.1) score -= 10
    if (metrics.bundleSize > 1000) score -= 15
    if (memoryUsage.percentage > 80) score -= 10
    if (metrics.cacheHitRate < 0.7) score -= 15

    score = Math.max(0, score)
    
    let grade = 'F'
    let color = 'text-red-600'
    
    if (score >= 90) {
      grade = 'A'
      color = 'text-green-600'
    } else if (score >= 80) {
      grade = 'B'
      color = 'text-blue-600'
    } else if (score >= 70) {
      grade = 'C'
      color = 'text-yellow-600'
    } else if (score >= 60) {
      grade = 'D'
      color = 'text-orange-600'
    }
    
    return { score, grade, color }
  }

  const getMetricStatus = (value: number, thresholds: { good: number; poor: number }, reverse = false) => {
    if (reverse) {
      if (value >= thresholds.good) return { status: 'good', icon: CheckCircle, color: 'text-green-600' }
      if (value >= thresholds.poor) return { status: 'needs-improvement', icon: AlertTriangle, color: 'text-yellow-600' }
      return { status: 'poor', icon: AlertTriangle, color: 'text-red-600' }
    } else {
      if (value <= thresholds.good) return { status: 'good', icon: CheckCircle, color: 'text-green-600' }
      if (value <= thresholds.poor) return { status: 'needs-improvement', icon: AlertTriangle, color: 'text-yellow-600' }
      return { status: 'poor', icon: AlertTriangle, color: 'text-red-600' }
    }
  }

  const performanceScore = getPerformanceScore()

  const optimizationSuggestions = [
    {
      condition: webVitals.fcp > 1800,
      suggestion: 'Optimize First Contentful Paint by reducing server response time and eliminating render-blocking resources',
      priority: 'high'
    },
    {
      condition: webVitals.lcp > 2500,
      suggestion: 'Improve Largest Contentful Paint by optimizing images and preloading key resources',
      priority: 'high'
    },
    {
      condition: metrics.bundleSize > 1000,
      suggestion: 'Reduce bundle size by implementing code splitting and removing unused dependencies',
      priority: 'medium'
    },
    {
      condition: metrics.cacheHitRate < 0.7,
      suggestion: 'Improve caching strategy to increase cache hit rate and reduce server requests',
      priority: 'medium'
    },
    {
      condition: memoryUsage.percentage > 80,
      suggestion: 'Optimize memory usage by implementing proper cleanup and avoiding memory leaks',
      priority: 'high'
    }
  ].filter(item => item.condition)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor and optimize your application's performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={refreshMetrics} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
          <CardDescription>
            Comprehensive performance assessment based on key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-6xl font-bold ${performanceScore.color}`}>
                {performanceScore.grade}
              </div>
              <div>
                <div className="text-2xl font-semibold">{performanceScore.score}/100</div>
                <div className="text-gray-600">Performance Score</div>
              </div>
            </div>
            <div className="w-32">
              <Progress value={performanceScore.score} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              First Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{webVitals.fcp.toFixed(0)}ms</div>
                <div className="text-xs text-gray-600">Target: &lt;1.8s</div>
              </div>
              {(() => {
                const status = getMetricStatus(webVitals.fcp, { good: 1800, poor: 3000 })
                const Icon = status.icon
                return <Icon className={`h-5 w-5 ${status.color}`} />
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Largest Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{webVitals.lcp.toFixed(0)}ms</div>
                <div className="text-xs text-gray-600">Target: &lt;2.5s</div>
              </div>
              {(() => {
                const status = getMetricStatus(webVitals.lcp, { good: 2500, poor: 4000 })
                const Icon = status.icon
                return <Icon className={`h-5 w-5 ${status.color}`} />
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              First Input Delay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{webVitals.fid.toFixed(0)}ms</div>
                <div className="text-xs text-gray-600">Target: &lt;100ms</div>
              </div>
              {(() => {
                const status = getMetricStatus(webVitals.fid, { good: 100, poor: 300 })
                const Icon = status.icon
                return <Icon className={`h-5 w-5 ${status.color}`} />
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cumulative Layout Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{webVitals.cls.toFixed(3)}</div>
                <div className="text-xs text-gray-600">Target: &lt;0.1</div>
              </div>
              {(() => {
                const status = getMetricStatus(webVitals.cls, { good: 0.1, poor: 0.25 })
                const Icon = status.icon
                return <Icon className={`h-5 w-5 ${status.color}`} />
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Bundle Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{metrics.bundleSize.toFixed(0)} KB</div>
              <Progress value={Math.min(100, (metrics.bundleSize / 1500) * 100)} className="h-2" />
              <div className="text-sm text-gray-600">Target: &lt;1000 KB</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{(metrics.cacheHitRate * 100).toFixed(1)}%</div>
              <Progress value={metrics.cacheHitRate * 100} className="h-2" />
              <div className="text-sm text-gray-600">Target: &gt;70%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{memoryUsage.percentage.toFixed(1)}%</div>
              <Progress value={memoryUsage.percentage} className="h-2" />
              <div className="text-sm text-gray-600">
                {(memoryUsage.used / 1024 / 1024).toFixed(1)} MB / {(memoryUsage.total / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
            <CardDescription>
              Recommendations to improve your application's performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizationSuggestions.map((suggestion, index) => (
                <Alert key={index} className="border-l-4 border-l-blue-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{suggestion.suggestion}</span>
                    <Badge 
                      variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {suggestion.priority}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
          <CardDescription>
            Quick actions to optimize your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => performanceOptimizationService.clearCache()}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Clear Cache
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Force Reload
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => registration.unregister())
                  })
                }
              }}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Reset Service Worker
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceDashboard