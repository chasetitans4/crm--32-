'use client';

import React, { useState, useEffect } from 'react';
import {
  useErrorTracking,
  usePerformanceTracking,
  useApiErrorTracking,
  useErrorAnalytics
} from '@/hooks/useErrorTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Zap,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import type { ErrorInfo, PerformanceIssue } from '@/utils/errorTracking';

interface ErrorMonitoringDashboardProps {
  className?: string;
  showExportButton?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ErrorMonitoringDashboard: React.FC<ErrorMonitoringDashboardProps> = ({
  className = '',
  showExportButton = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const {
    metrics,
    recentErrors,
    clearErrors,
    exportErrors,
    resolveError
  } = useErrorTracking();
  
  const {
    performanceIssues,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  } = usePerformanceTracking();
  
  const { apiErrors } = useApiErrorTracking();
  const { analytics } = useErrorAnalytics();
  
  const [selectedError, setSelectedError] = useState<ErrorInfo | null>(null);
  const [selectedPerformanceIssue, setSelectedPerformanceIssue] = useState<PerformanceIssue | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript': return <Zap className="h-4 w-4" />;
      case 'network': return <Globe className="h-4 w-4" />;
      case 'api': return <Activity className="h-4 w-4" />;
      case 'ui': return <BarChart3 className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleExportErrors = () => {
    const data = exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Error Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {formatTimestamp(lastRefresh)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastRefresh(Date.now())}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {showExportButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportErrors}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalErrors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.unresolvedErrors || 0} unresolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.errorRate || 0}</div>
            <p className="text-xs text-muted-foreground">
              errors per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Issues</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              {performanceIssues.filter(issue => !issue.resolved).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isMonitoring ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance Issues</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="api">API Errors</TabsTrigger>
        </TabsList>

        {/* Recent Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              {recentErrors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No errors recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {recentErrors.map((error) => (
                    <div
                      key={error.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(error.category)}
                            <Badge
                              variant="secondary"
                              className={`${getSeverityColor(error.severity)} text-white`}
                            >
                              {error.severity}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{error.message}</h4>
                            <p className="text-sm text-muted-foreground">
                              {error.category} • {formatTimestamp(error.timestamp)}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">
                                {error.occurrences} occurrence{error.occurrences !== 1 ? 's' : ''}
                              </Badge>
                              {error.resolved && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveError(error.fingerprint);
                          }}
                          disabled={error.resolved}
                        >
                          {error.resolved ? 'Resolved' : 'Resolve'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Issues Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No performance issues detected
                </div>
              ) : (
                <div className="space-y-4">
                  {performanceIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPerformanceIssue(issue)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium">{issue.message}</h4>
                            <p className="text-sm text-muted-foreground">
                              {issue.type} • {formatTimestamp(issue.timestamp)}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span>
                                Threshold: {formatDuration(issue.threshold)}
                              </span>
                              <span>
                                Actual: {formatDuration(issue.actualValue)}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`${getSeverityColor(issue.severity)} text-white`}
                              >
                                {issue.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Error Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Error Trends (7 days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.errorTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{trend.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((trend.count / Math.max(...analytics.errorTrends.map(t => t.count))) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{trend.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Error Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Error Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topErrorMessages.slice(0, 5).map((error, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate flex-1 mr-2">
                          {error.message}
                        </span>
                        <span className="text-sm">{error.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1">
                        <div
                          className="bg-orange-500 h-1 rounded-full"
                          style={{
                            width: `${(error.count / Math.max(...analytics.topErrorMessages.map(e => e.count))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Errors by Browser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Errors by Browser</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.errorsByBrowser).map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{browser}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Errors by Page */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Errors by Page</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.errorsByPage).slice(0, 5).map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between">
                      <span className="text-sm font-mono truncate flex-1 mr-2">{page}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Errors Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Errors</CardTitle>
            </CardHeader>
            <CardContent>
              {apiErrors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No API errors recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {apiErrors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Activity className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium">{error.message}</h4>
                            <p className="text-sm text-muted-foreground">
                              {error.context?.method} {error.context?.url}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              {error.context?.status && (
                                <Badge variant="outline">
                                  Status: {error.context.status}
                                </Badge>
                              )}
                              {error.context?.duration && (
                                <span>
                                  Duration: {formatDuration(error.context.duration)}
                                </span>
                              )}
                              <span>{formatTimestamp(error.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Error Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedError(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedError.message}</p>
              </div>
              
              {selectedError.stack && (
                <div>
                  <h4 className="font-medium mb-2">Stack Trace</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {selectedError.stack}
                  </pre>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Category:</strong> {selectedError.category}</p>
                    <p><strong>Severity:</strong> {selectedError.severity}</p>
                    <p><strong>Occurrences:</strong> {selectedError.occurrences}</p>
                    <p><strong>Timestamp:</strong> {formatTimestamp(selectedError.timestamp)}</p>
                    <p><strong>URL:</strong> {selectedError.url}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Context</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              </div>
              
              {selectedError.breadcrumbs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Breadcrumbs</h4>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {selectedError.breadcrumbs.slice(-10).map((breadcrumb, index) => (
                      <div key={index} className="text-sm border-l-2 border-muted pl-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{breadcrumb.message}</span>
                          <span className="text-muted-foreground">
                            {formatTimestamp(breadcrumb.timestamp)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {breadcrumb.category} • {breadcrumb.level}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ErrorMonitoringDashboard;