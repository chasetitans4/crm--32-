import { auditLogService, type AuditLogEntry } from './auditLogService';

export interface EnhancedAuditEvent {
  id?: string;
  timestamp?: Date;
  eventType: 'auth' | 'data_access' | 'data_modification' | 'security_violation' | 'system_event' | 'user_action';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  success: boolean;
  sessionId?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  riskScore?: number;
  tags?: string[];
}

export interface AuditSearchFilters {
  eventType?: string[];
  severity?: string[];
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  dateFrom?: Date;
  dateTo?: Date;
  success?: boolean;
  riskScoreMin?: number;
  riskScoreMax?: number;
  tags?: string[];
  searchText?: string;
}

export interface AuditMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  uniqueUsers: number;
  uniqueIPs: number;
  failedLogins: number;
  successfulLogins: number;
  highRiskEvents: number;
  recentActivity: EnhancedAuditEvent[];
  topUsers: { userId: string; userEmail: string; eventCount: number }[];
  topIPs: { ipAddress: string; eventCount: number; riskScore: number }[];
}

class EnhancedAuditLogService {
  private events: EnhancedAuditEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  private riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  /**
   * Log an enhanced audit event
   */
  async logEvent(event: EnhancedAuditEvent): Promise<void> {
    const enhancedEvent: EnhancedAuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: event.timestamp || new Date(),
      riskScore: event.riskScore || this.calculateRiskScore(event),
      tags: event.tags || this.generateTags(event)
    };

    // Add to in-memory storage
    this.events.unshift(enhancedEvent);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Also log to the existing audit service
    try {
      await auditLogService.log({
        userId: event.userId,
        userEmail: event.userEmail,
        action: event.action,
        resource: event.resource,
        details: event.details,
        severity: event.severity === 'info' ? 'low' : event.severity,
        category: this.mapEventTypeToCategory(event.eventType),
        success: event.success
      });
    } catch (error) {
      console.error('Failed to log to audit service:', error);
    }

    // Trigger real-time alerts for high-risk events
    if (enhancedEvent.riskScore && enhancedEvent.riskScore > this.riskThresholds.high) {
      this.triggerSecurityAlert(enhancedEvent);
    }
  }

  /**
   * Search and filter audit events
   */
  searchEvents(filters: AuditSearchFilters, limit = 100, offset = 0): {
    events: EnhancedAuditEvent[];
    total: number;
    hasMore: boolean;
  } {
    let filteredEvents = [...this.events];

    // Apply filters
    if (filters.eventType?.length) {
      filteredEvents = filteredEvents.filter(e => filters.eventType!.includes(e.eventType));
    }

    if (filters.severity?.length) {
      filteredEvents = filteredEvents.filter(e => filters.severity!.includes(e.severity));
    }

    if (filters.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
    }

    if (filters.userEmail) {
      filteredEvents = filteredEvents.filter(e => 
        e.userEmail?.toLowerCase().includes(filters.userEmail!.toLowerCase())
      );
    }

    if (filters.ipAddress) {
      filteredEvents = filteredEvents.filter(e => e.ipAddress === filters.ipAddress);
    }

    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter(e => 
        e.timestamp && e.timestamp >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter(e => 
        e.timestamp && e.timestamp <= filters.dateTo!
      );
    }

    if (filters.success !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.success === filters.success);
    }

    if (filters.riskScoreMin !== undefined) {
      filteredEvents = filteredEvents.filter(e => 
        e.riskScore && e.riskScore >= filters.riskScoreMin!
      );
    }

    if (filters.riskScoreMax !== undefined) {
      filteredEvents = filteredEvents.filter(e => 
        e.riskScore && e.riskScore <= filters.riskScoreMax!
      );
    }

    if (filters.tags?.length) {
      filteredEvents = filteredEvents.filter(e => 
        e.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredEvents = filteredEvents.filter(e => 
        e.action.toLowerCase().includes(searchLower) ||
        e.resource.toLowerCase().includes(searchLower) ||
        JSON.stringify(e.details).toLowerCase().includes(searchLower)
      );
    }

    const total = filteredEvents.length;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      events: paginatedEvents,
      total,
      hasMore
    };
  }

  /**
   * Get audit metrics and analytics
   */
  getMetrics(timeRange?: { from: Date; to: Date }): AuditMetrics {
    let events = this.events;

    if (timeRange) {
      events = events.filter(e => 
        e.timestamp && 
        e.timestamp >= timeRange.from && 
        e.timestamp <= timeRange.to
      );
    }

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const userCounts: Record<string, { userId: string; userEmail: string; count: number }> = {};
    const ipCounts: Record<string, { count: number; riskScore: number }> = {};
    
    let failedLogins = 0;
    let successfulLogins = 0;
    let highRiskEvents = 0;

    events.forEach(event => {
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      
      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      // Count users
      if (event.userId && event.userEmail) {
        const key = event.userId;
        if (!userCounts[key]) {
          userCounts[key] = { userId: event.userId, userEmail: event.userEmail, count: 0 };
        }
        userCounts[key].count++;
      }
      
      // Count IPs
      if (event.ipAddress) {
        if (!ipCounts[event.ipAddress]) {
          ipCounts[event.ipAddress] = { count: 0, riskScore: 0 };
        }
        ipCounts[event.ipAddress].count++;
        ipCounts[event.ipAddress].riskScore = Math.max(
          ipCounts[event.ipAddress].riskScore,
          event.riskScore || 0
        );
      }
      
      // Count login events
      if (event.eventType === 'auth') {
        if (event.success) {
          successfulLogins++;
        } else {
          failedLogins++;
        }
      }
      
      // Count high-risk events
      if (event.riskScore && event.riskScore > this.riskThresholds.high) {
        highRiskEvents++;
      }
    });

    const topUsers = Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(user => ({ userId: user.userId, userEmail: user.userEmail, eventCount: user.count }));

    const topIPs = Object.entries(ipCounts)
      .map(([ip, data]) => ({ ipAddress: ip, eventCount: data.count, riskScore: data.riskScore }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const recentActivity = events.slice(0, 20);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      uniqueUsers: Object.keys(userCounts).length,
      uniqueIPs: Object.keys(ipCounts).length,
      failedLogins,
      successfulLogins,
      highRiskEvents,
      recentActivity,
      topUsers,
      topIPs
    };
  }

  /**
   * Calculate risk score for an event
   */
  private calculateRiskScore(event: EnhancedAuditEvent): number {
    let score = 0;

    // Base score by event type
    const typeScores = {
      'security_violation': 0.8,
      'auth': event.success ? 0.1 : 0.6,
      'data_modification': 0.4,
      'data_access': 0.2,
      'user_action': 0.1,
      'system_event': 0.1
    };
    
    score += typeScores[event.eventType] || 0.1;

    // Severity multiplier
    const severityMultipliers = {
      'critical': 1.0,
      'high': 0.8,
      'medium': 0.6,
      'low': 0.4,
      'info': 0.2
    };
    
    score *= severityMultipliers[event.severity] || 0.5;

    // Failed action penalty
    if (!event.success) {
      score += 0.3;
    }

    // Time-based factors (higher risk for off-hours)
    if (event.timestamp) {
      const hour = event.timestamp.getHours();
      if (hour < 6 || hour > 22) {
        score += 0.2; // Off-hours activity
      }
    }

    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Generate tags for an event
   */
  private generateTags(event: EnhancedAuditEvent): string[] {
    const tags: string[] = [];

    // Add severity tag
    tags.push(`severity:${event.severity}`);
    
    // Add success/failure tag
    tags.push(event.success ? 'success' : 'failure');
    
    // Add time-based tags
    if (event.timestamp) {
      const hour = event.timestamp.getHours();
      if (hour < 6 || hour > 22) {
        tags.push('off-hours');
      }
      
      const day = event.timestamp.getDay();
      if (day === 0 || day === 6) {
        tags.push('weekend');
      }
    }
    
    // Add event-specific tags
    if (event.eventType === 'auth') {
      if (event.action.includes('login')) {
        tags.push('login');
      }
      if (event.action.includes('2fa')) {
        tags.push('2fa');
      }
    }
    
    if (event.eventType === 'security_violation') {
      tags.push('security-alert');
    }
    
    // Add risk level tags
    const riskScore = event.riskScore || this.calculateRiskScore(event);
    if (riskScore > this.riskThresholds.high) {
      tags.push('high-risk');
    } else if (riskScore > this.riskThresholds.medium) {
      tags.push('medium-risk');
    } else {
      tags.push('low-risk');
    }

    return tags;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapEventTypeToCategory(eventType: EnhancedAuditEvent['eventType']): AuditLogEntry['category'] {
    switch (eventType) {
      case 'data_access':
      case 'data_modification':
        return 'data';
      case 'security_violation':
        return 'security';
      case 'system_event':
        return 'system';
      case 'user_action':
        return 'user';
      case 'auth':
        return 'auth';
      default:
        return 'system';
    }
  }

  /**
   * Trigger security alert for high-risk events
   */
  private triggerSecurityAlert(event: EnhancedAuditEvent): void {
    // In a real implementation, this would send notifications
    // to security team, trigger automated responses, etc.
    console.warn('🚨 High-risk security event detected:', {
      id: event.id,
      action: event.action,
      userId: event.userId,
      ipAddress: event.ipAddress,
      riskScore: event.riskScore,
      timestamp: event.timestamp
    });
  }

  /**
   * Export audit data for compliance
   */
  exportAuditData(filters?: AuditSearchFilters, format: 'json' | 'csv' = 'json'): string {
    const { events } = this.searchEvents(filters || {}, 10000, 0);
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Timestamp', 'Event Type', 'Severity', 'User ID', 'User Email',
        'IP Address', 'Action', 'Resource', 'Success', 'Risk Score', 'Tags'
      ];
      
      const csvRows = events.map(event => [
        event.id || '',
        event.timestamp?.toISOString() || '',
        event.eventType,
        event.severity,
        event.userId || '',
        event.userEmail || '',
        event.ipAddress || '',
        event.action,
        event.resource,
        event.success.toString(),
        event.riskScore?.toString() || '',
        event.tags?.join(';') || ''
      ]);
      
      return [headers, ...csvRows].map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');
    }
    
    return JSON.stringify(events, null, 2);
  }

  /**
   * Get events for a specific user
   */
  getUserActivity(userId: string, limit = 50): EnhancedAuditEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(0, limit);
  }

  /**
   * Get suspicious activity patterns
   */
  getSuspiciousActivity(): {
    multipleFailedLogins: { userId: string; count: number; lastAttempt: Date }[];
    unusualLocations: { userId: string; ipAddress: string; location?: string }[];
    offHoursActivity: EnhancedAuditEvent[];
    highRiskEvents: EnhancedAuditEvent[];
  } {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => 
      e.timestamp && e.timestamp >= last24Hours
    );
    
    // Multiple failed logins
    const failedLogins: Record<string, { count: number; lastAttempt: Date }> = {};
    recentEvents
      .filter(e => e.eventType === 'auth' && !e.success && e.userId)
      .forEach(event => {
        const userId = event.userId!;
        if (!failedLogins[userId]) {
          failedLogins[userId] = { count: 0, lastAttempt: event.timestamp! };
        }
        failedLogins[userId].count++;
        if (event.timestamp! > failedLogins[userId].lastAttempt) {
          failedLogins[userId].lastAttempt = event.timestamp!;
        }
      });
    
    const multipleFailedLogins = Object.entries(failedLogins)
      .filter(([_, data]) => data.count >= 3)
      .map(([userId, data]) => ({ userId, ...data }));
    
    // Off-hours activity
    const offHoursActivity = recentEvents.filter(event => {
      if (!event.timestamp) return false;
      const hour = event.timestamp.getHours();
      return hour < 6 || hour > 22;
    });
    
    // High-risk events
    const highRiskEvents = recentEvents.filter(event => 
      event.riskScore && event.riskScore > this.riskThresholds.high
    );
    
    return {
      multipleFailedLogins,
      unusualLocations: [], // Would need geolocation service
      offHoursActivity,
      highRiskEvents
    };
  }
}

export const enhancedAuditLogService = new EnhancedAuditLogService();
export default enhancedAuditLogService;