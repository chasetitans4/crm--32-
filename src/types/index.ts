// Re-export utils from lib directory
export { cn } from '../lib/utils';

// Re-export types from database service
export type { Task, User, CustomField, ApiKey, SalesStage, Email } from '../services/database';
export type { Event as DatabaseEvent } from '../services/database';

// Note interface for client notes
export interface Note {
  type: 'call' | 'email' | 'meeting';
  content: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  teamMembers: string[];
  milestones: {
    id: string;
    name: string;
    dueDate: string;
    completed: boolean;
  }[];
  documents: {
    id: string;
    name: string;
    url: string;
    uploadDate: string;
  }[];
  progress: number;
  budget: number;
  spent: number;
}

// LocalSEO Profile interface
export interface LocalSEOProfile {
  businessName: string;
  address: string;
  phone: string;
  website: string;
  categories: string[];
  description: string;
  hours: Record<string, string>;
  photos: string[];
  reviews: {
    rating: number;
    count: number;
  };
  citations: {
    name: string;
    url: string;
    status: 'verified' | 'pending' | 'error';
  }[];
  rankings: {
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
    lastChecked?: string;
  }[];
  localDirectories: {
    name: string;
    claimed: boolean;
    url?: string;
  }[];
  localRankings: {
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
    lastChecked?: string;
  }[];
  googleBusinessProfile: {
    name: string;
    address: string;
    phone: string;
    website: string;
    categories: string[];
    description: string;
    hours: Record<string, string>;
    photos: string[];
    reviews: {
      rating: number;
      count: number;
    };
    lastUpdated: string;
    url: string;
    claimed: boolean;
    rating: number;
    reviewCount: number;
  };
}

// Client interface that overrides the database Client type to have notes as an array
export interface Client {
  id: string;
  name: string;
  contact?: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  value: number;
  stage: string;
  source: string;
  created_at: string;
  updated_at: string;
  notes: Note[];
  projects: Project[];
  custom_fields: Record<string, unknown>;
  websiteUrl?: string; // Website URL for auditing purposes
  daysInStage?: number; // Optional property for pipeline analytics
  lastContact?: string; // Last contact date
  portal?: {
    status: 'active' | 'inactive';
    lastLogin?: string;
  };
  businessType?: string;
  serviceArea?: string;
  localSEO?: LocalSEOProfile;
}

// Frontend Event type that extends database Event with additional properties
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description?: string;
  relatedTo?: {
    type: 'client' | 'internal' | 'project';
    id: string;
    clientId?: string;
    projectId?: string;
  } | null;
}

// Re-export EmailTemplate from email services
export type { EmailTemplate } from '../services/emailService';

// Define NewTask and NewEvent types for creating new records
export interface NewTask {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assignee?: string;
  status?: string;
  category?: string;
  tags?: string[];
  estimatedHours?: number;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  dependencies?: string[];
}

export interface NewEvent {
  title: string;
  date: string;
  time: string;
  type: string;
  description?: string;
  relatedTo?: {
    type: 'client' | 'internal' | 'project';
    id: string;
    clientId?: string;
    projectId?: string;
  } | null;
}

// Sales performance metrics interface
export interface SalesMetric {
  id: number;
  agentId: number;
  period: string;
  leads: number;
  calls: number;
  meetings: number;
  proposals: number;
  closedDeals: number;
  revenue: number;
  conversionRate: number;
}
