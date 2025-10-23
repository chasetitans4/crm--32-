'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { performanceOptimizationService } from '../../services/performanceOptimization'
import {
  Activity,
  Zap,
  Clock,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'

interface PerformanceMetrics {
  webVitals: {
    fcp: number
    lcp: number
    fid: number
    cls: number
    ttfb: number
  }
  bundleSize: {
    total: number
    js: number
    css: number
    images: number
  }
  cacheMetrics: {
    hitRate: number
    missRate: number
    size: number
  }
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  networkMetrics: {
    requests: number
    totalSize: number
    avgResponseTime: number
  }
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: Date
}

const PERFORMANCE_THRESHOLDS = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
  cacheHitRate: { good: 80, poor: 60 },
  memoryUsage: { good: 70, poor: 85 }
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([])

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring()
    } else {
      stopMonitoring()
    }

    return () => stopMonitoring()
  }, [isMonitoring, refreshInterval])

  const startMonitoring = () => {
    collectMetrics()
    intervalRef.current = setInterval(collectMetrics, refreshInterval)
  }

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const collectMetrics = async () => {
    try {
      // Collect Web Vitals
      const webVitals = await collectWebVitals()
      
      // Collect Bundle Size
      const bundleSize = await collectBundleSize()
      
      // Collect Cache Metrics
      const cacheMetrics = await collectCacheMetrics()
      
      // Collect Memory Usage
      const memoryUsage = await collectMemoryUsage()
      
      // Collect Network Metrics
      const networkMetrics = await collectNetworkMetrics()

      const newMetrics: PerformanceMetrics = {
        webVitals,
        bundleSize,
        cacheMetrics,
        memoryUsage,
        networkMetrics
      }

      setMetrics(newMetrics)
      setHistoricalData(prev => [...prev.slice(-19), newMetrics])
      
      // Check for performance alerts
      checkPerformanceAlerts(newMetrics)
      
      // Log metrics to performance service
      performanceOptimizationService.logPerformanceMetric('monitoring', {
        timestamp: Date.now(),
        metrics: newMetrics
      })
    } catch (error) {
      console.error('Failed to collect performance metrics:', error)
    }
  }

  const collectWebVitals = async (): Promise<PerformanceMetrics['webVitals']> => {
    return new Promise((resolve) => {
      // Use Web Vitals API if available
      if ('web-vitals' in window) {
        resolve({
          fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          lcp: 0, // Would be collected via web-vitals library
          fid: 0, // Would be collected via web-vitals library
          cls: 0, // Would be collected via web-vitals library
          ttfb: (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.responseStart || 0
        })
      } else {
        // Fallback metrics
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        resolve({
          fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          lcp: navigation?.loadEventEnd - navigation?.fetchStart || 0,
          fid: 0,
          cls: 0,
          ttfb: navigation?.responseStart - navigation?.requestStart || 0
        })
      }
    })
  }

  const collectBundleSize = async (): Promise<PerformanceMetrics['bundleSize']> => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    let js = 0, css = 0, images = 0
    
    resources.forEach(resource => {
      const size = resource.transferSize || 0
      
      if (resource.name.includes('.js')) {
        js += size
      } else if (resource.name.includes('.css')) {
        css += size
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        images += size
      }
    })
    
    return {
      total: js + css + images,
      js,
      css,
      images
    }
  }

  const collectCacheMetrics = async (): Promise<PerformanceMetrics['cacheMetrics']> => {
    const cacheStats = await performanceOptimizationService.getCacheStats()
    
    return {
      hitRate: cacheStats.hitRate,
      missRate: 100 - cacheStats.hitRate,
      size: cacheStats.size
    }
  }

  const collectMemoryUsage = async (): Promise<PerformanceMetrics['memoryUsage']> => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }
    
    return { used: 0, total: 0, percentage: 0 }
  }

  const collectNetworkMetrics = async (): Promise<PerformanceMetrics['networkMetrics']> => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const requests = resources.length
    const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
    const avgResponseTime = resources.reduce((sum, resource) => 
      sum + (resource.responseEnd - resource.requestStart), 0) / requests
    
    return {
      requests,
      totalSize,
      avgResponseTime
    }
  }

  const checkPerformanceAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = []
    
    // Check Web Vitals
    if (metrics.webVitals.fcp > PERFORMANCE_THRESHOLDS.fcp.poor) {
      newAlerts.push({
        id: `fcp-${Date.now()}`,
        type: 'error',
        message: 'First Contentful Paint is too slow',
        metric: 'FCP',
        value: metrics.webVitals.fcp,
        threshold: PERFORMANCE_THRESHOLDS.fcp.poor,
        timestamp: new Date()
      })
    }
    
    if (metrics.webVitals.lcp > PERFORMANCE_THRESHOLDS.lcp.poor) {
      newAlerts.push({
        id: `lcp-${Date.now()}`,
        type: 'error',
        message: 'Largest Contentful Paint is too slow',
        metric: 'LCP',
        value: metrics.webVitals.lcp,
        threshold: PERFORMANCE_THRESHOLDS.lcp.poor,
        timestamp: new Date()
      })
    }
    
    // Check Cache Hit Rate
    if (metrics.cacheMetrics.hitRate < PERFORMANCE_THRESHOLDS.cacheHitRate.poor) {
      newAlerts.push({
        id: `cache-${Date.now()}`,
        type: 'warning',
        message: 'Cache hit rate is below optimal threshold',
        metric: 'Cache Hit Rate',
        value: metrics.cacheMetrics.hitRate,
        threshold: PERFORMANCE_THRESHOLDS.cacheHitRate.poor,
        timestamp: new Date()
      })
    }
    
    // Check Memory Usage
    if (metrics.memoryUsage.percentage > PERFORMANCE_THRESHOLDS.memoryUsage.poor) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: 'Memory usage is critically high',
        metric: 'Memory Usage',
        value: metrics.memoryUsage.percentage,
        threshold: PERFORMANCE_THRESHOLDS.memoryUsage.poor,
        timestamp: new Date()
      })
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)])
    }
  }

  const getMetricStatus = (value: number, thresholds: { good: number; poor: number }, reverse = false) => {
    if (reverse) {
      if (value >= thresholds.good) return 'good'
      if (value >= thresholds.poor) return 'needs-improvement'
      return 'poor'
    } else {
      if (value <= thresholds.good) return 'good'
      if (value <= thresholds.poor) return 'needs-improvement'
      return 'poor'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  const exportMetrics = () => {
    const data = {
      currentMetrics: metrics,
      historicalData,
      alerts,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
          <CardDescription>
            Real-time performance monitoring and optimization insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Button onClick={() => setIsMonitoring(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Start Monitoring
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitor
              {isMonitoring && (
                <Badge variant="outline" className="ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? 'Stop' : 'Start'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportMetrics}>
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Performance Alerts ({alerts.length})
              </div>
              <Button variant="outline" size="sm" onClick={clearAlerts}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={alert.type === 'error' ? 'border-red-200' : 'border-yellow-200'}>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                        {alert.metric}: {alert.value.toFixed(2)}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Tabs */}
      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatTime(metrics.webVitals.fcp)}</span>
                  <Badge 
                    variant={getMetricStatus(metrics.webVitals.fcp, PERFORMANCE_THRESHOLDS.fcp) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.webVitals.fcp, PERFORMANCE_THRESHOLDS.fcp)}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((metrics.webVitals.fcp / PERFORMANCE_THRESHOLDS.fcp.poor) * 100, 100)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* LCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatTime(metrics.webVitals.lcp)}</span>
                  <Badge 
                    variant={getMetricStatus(metrics.webVitals.lcp, PERFORMANCE_THRESHOLDS.lcp) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.webVitals.lcp, PERFORMANCE_THRESHOLDS.lcp)}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((metrics.webVitals.lcp / PERFORMANCE_THRESHOLDS.lcp.poor) * 100, 100)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* TTFB */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time to First Byte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatTime(metrics.webVitals.ttfb)}</span>
                  <Badge 
                    variant={getMetricStatus(metrics.webVitals.ttfb, PERFORMANCE_THRESHOLDS.ttfb) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.webVitals.ttfb, PERFORMANCE_THRESHOLDS.ttfb)}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((metrics.webVitals.ttfb / PERFORMANCE_THRESHOLDS.ttfb.poor) * 100, 100)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bundle Size</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{formatBytes(metrics.bundleSize.total)}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">JavaScript</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{formatBytes(metrics.bundleSize.js)}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{formatBytes(metrics.bundleSize.css)}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Images</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{formatBytes(metrics.bundleSize.images)}</span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metrics.cacheMetrics.hitRate.toFixed(1)}%</span>
                  <Badge 
                    variant={getMetricStatus(metrics.cacheMetrics.hitRate, PERFORMANCE_THRESHOLDS.cacheHitRate, true) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.cacheMetrics.hitRate, PERFORMANCE_THRESHOLDS.cacheHitRate, true)}
                  </Badge>
                </div>
                <Progress value={metrics.cacheMetrics.hitRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Miss Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{metrics.cacheMetrics.missRate.toFixed(1)}%</span>
                <Progress value={metrics.cacheMetrics.missRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{formatBytes(metrics.cacheMetrics.size)}</span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metrics.memoryUsage.percentage.toFixed(1)}%</span>
                  <Badge 
                    variant={getMetricStatus(metrics.memoryUsage.percentage, PERFORMANCE_THRESHOLDS.memoryUsage) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.memoryUsage.percentage, PERFORMANCE_THRESHOLDS.memoryUsage)}
                  </Badge>
                </div>
                <Progress value={metrics.memoryUsage.percentage} className="mt-2" />
                <div className="text-sm text-muted-foreground mt-1">
                  {formatBytes(metrics.memoryUsage.used)} / {formatBytes(metrics.memoryUsage.total)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{metrics.networkMetrics.requests}</span>
                <div className="text-sm text-muted-foreground mt-1">
                  Total: {formatBytes(metrics.networkMetrics.totalSize)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{formatTime(metrics.networkMetrics.avgResponseTime)}</span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}