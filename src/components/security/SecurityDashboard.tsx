import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  AlertTriangle,
  Users,
  Activity,
  Lock,
  Eye,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { enhancedAuditLogService, type EnhancedAuditEvent, type AuditMetrics, type AuditSearchFilters } from '@/services/enhancedAuditLog';
import { granularRBACService, type GranularRole, type UserRoleAssignment } from '@/services/granularRBAC';
import { format } from 'date-fns';

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  failedLogins24h: number;
  successfulLogins24h: number;
  highRiskEvents: number;
  mfaEnabled: number;
  suspiciousActivity: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    failedLogins24h: 0,
    successfulLogins24h: 0,
    highRiskEvents: 0,
    mfaEnabled: 0,
    suspiciousActivity: 0,
    systemHealth: 'good'
  });
  
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics | null>(null);
  const [auditEvents, setAuditEvents] = useState<EnhancedAuditEvent[]>([]);
  const [roles, setRoles] = useState<GranularRole[]>([]);
  const [searchFilters, setSearchFilters] = useState<AuditSearchFilters>({});
  const [selectedEvent, setSelectedEvent] = useState<EnhancedAuditEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load audit metrics
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const auditData = enhancedAuditLogService.getMetrics({ from: yesterday, to: now });
      setAuditMetrics(auditData);
      
      // Load recent audit events
      const recentEvents = enhancedAuditLogService.searchEvents({}, 50, 0);
      setAuditEvents(recentEvents.events);
      
      // Load roles
      const allRoles = granularRBACService.getAllRoles();
      setRoles(allRoles);
      
      // Calculate security metrics
      const suspiciousActivity = enhancedAuditLogService.getSuspiciousActivity();
      
      setMetrics({
        totalUsers: auditData.uniqueUsers,
        activeUsers: Math.floor(auditData.uniqueUsers * 0.8), // Simulated
        failedLogins24h: auditData.failedLogins,
        successfulLogins24h: auditData.successfulLogins,
        highRiskEvents: auditData.highRiskEvents,
        mfaEnabled: Math.floor(auditData.uniqueUsers * 0.6), // Simulated
        suspiciousActivity: suspiciousActivity.multipleFailedLogins.length + 
                           suspiciousActivity.offHoursActivity.length + 
                           suspiciousActivity.highRiskEvents.length,
        systemHealth: auditData.highRiskEvents > 10 ? 'critical' : 
                     auditData.highRiskEvents > 5 ? 'warning' : 'good'
      });
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEvents = () => {
    const results = enhancedAuditLogService.searchEvents(searchFilters, 100, 0);
    setAuditEvents(results.events);
  };

  const handleExportAuditData = () => {
    const csvData = enhancedAuditLogService.exportAuditData(searchFilters, 'csv');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'auth': return <UserCheck className="h-4 w-4" />;
      case 'security_violation': return <AlertTriangle className="h-4 w-4" />;
      case 'data_access': return <Eye className="h-4 w-4" />;
      case 'data_modification': return <Activity className="h-4 w-4" />;
      case 'system_event': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events, audit logs, and user access
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadSecurityData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportAuditData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {metrics.systemHealth !== 'good' && (
        <Alert className={metrics.systemHealth === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {metrics.systemHealth === 'critical' ? 'Critical Security Alert' : 'Security Warning'}
          </AlertTitle>
          <AlertDescription>
            {metrics.systemHealth === 'critical' 
              ? `${metrics.highRiskEvents} high-risk security events detected in the last 24 hours. Immediate attention required.`
              : `${metrics.highRiskEvents} high-risk security events detected. Please review recent activity.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeUsers} active users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.successfulLogins24h}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{metrics.failedLogins24h}</span> failed attempts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.highRiskEvents > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.highRiskEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mfaEnabled}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.mfaEnabled / metrics.totalUsers) * 100)}% coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="user-access">User Access</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest high-priority security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getEventTypeIcon(event.eventType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.userEmail} • {format(event.timestamp || new Date(), 'MMM d, HH:mm')}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Users by Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>Users with highest activity in last 24h</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditMetrics?.topUsers.slice(0, 5).map((user, index) => (
                    <div key={user.userId} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.userEmail}</p>
                        <p className="text-xs text-muted-foreground">{user.eventCount} events</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search Audit Logs</CardTitle>
              <CardDescription>Filter and search through security audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input
                    placeholder="Search events..."
                    value={searchFilters.searchText || ''}
                    onChange={(e) => setSearchFilters({ ...searchFilters, searchText: e.target.value })}
                  />
                </div>
                <div>
                  <Select
                    value={searchFilters.eventType?.[0] || ''}
                    onValueChange={(value) => setSearchFilters({ 
                      ...searchFilters, 
                      eventType: value ? [value] : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="data_access">Data Access</SelectItem>
                      <SelectItem value="data_modification">Data Modification</SelectItem>
                      <SelectItem value="security_violation">Security Violation</SelectItem>
                      <SelectItem value="system_event">System Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={searchFilters.severity?.[0] || ''}
                    onValueChange={(value) => setSearchFilters({ 
                      ...searchFilters, 
                      severity: value ? [value] : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button onClick={handleSearchEvents} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Events</CardTitle>
              <CardDescription>{auditEvents.length} events found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm">
                        {format(event.timestamp || new Date(), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.eventType)}
                          <span className="text-sm">{event.action}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.userEmail || 'System'}
                      </TableCell>
                      <TableCell className="text-sm">{event.resource}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${getRiskScoreColor(event.riskScore || 0)}`}>
                          {((event.riskScore || 0) * 100).toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.success ? 'default' : 'destructive'}>
                          {event.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Event Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about this security event
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEvent && (
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="text-sm font-medium">Event ID</label>
                                    <p className="text-sm text-muted-foreground">{selectedEvent.id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Timestamp</label>
                                    <p className="text-sm text-muted-foreground">
                                      {format(selectedEvent.timestamp || new Date(), 'PPpp')}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">User</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedEvent.userEmail || 'System'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">IP Address</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedEvent.ipAddress || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Action</label>
                                    <p className="text-sm text-muted-foreground">{selectedEvent.action}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Resource</label>
                                    <p className="text-sm text-muted-foreground">{selectedEvent.resource}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Details</label>
                                  <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-40">
                                    {JSON.stringify(selectedEvent.details, null, 2)}
                                  </pre>
                                </div>
                                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium">Tags</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedEvent.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Access Tab */}
        <TabsContent value="user-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>MFA Required</TableHead>
                    <TableHead>Data Access</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {role.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.permissions.length} permissions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.requiresMFA ? 'default' : 'secondary'}>
                          {role.requiresMFA ? 'Required' : 'Optional'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={role.dataAccessLevel === 'admin' ? 'bg-red-100 text-red-800' : 
                                        role.dataAccessLevel === 'write' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-green-100 text-green-800'}>
                          {role.dataAccessLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isActive ? 'default' : 'secondary'}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Users
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              Edit Role
                            </DropdownMenuItem>
                            {!role.isSystemRole && (
                              <DropdownMenuItem className="text-red-600">
                                Delete Role
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspicious Activity Tab */}
        <TabsContent value="suspicious" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Failed Login Attempts</CardTitle>
                <CardDescription>Users with multiple failed login attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enhancedAuditLogService.getSuspiciousActivity().multipleFailedLogins.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{user.userId}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.count} failed attempts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Last: {format(user.lastAttempt, 'MMM d, HH:mm')}
                        </p>
                        <Badge variant="destructive">High Risk</Badge>
                      </div>
                    </div>
                  ))}
                  {enhancedAuditLogService.getSuspiciousActivity().multipleFailedLogins.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No suspicious login activity detected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Off-Hours Activity</CardTitle>
                <CardDescription>Activity outside normal business hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enhancedAuditLogService.getSuspiciousActivity().offHoursActivity.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.userEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(event.timestamp || new Date(), 'MMM d, HH:mm')}
                        </p>
                        <Badge variant="outline">Off-Hours</Badge>
                      </div>
                    </div>
                  ))}
                  {enhancedAuditLogService.getSuspiciousActivity().offHoursActivity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No off-hours activity detected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;