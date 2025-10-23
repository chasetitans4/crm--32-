"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AgentOnboarding from './AgentOnboarding';
import { formatCurrency, formatNumber } from '@/utils/safeFormatters';
import {
  Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Search, Filter, Calendar, FileText, BarChart3, PieChart, Target,
  Clock, Award, Briefcase, Settings, Shield, Database, Globe,
  MessageSquare, Star, ThumbsUp, ThumbsDown, Eye, Edit, Trash2,
  Plus, Download, Upload, RefreshCw, Bell, Activity, Zap, UserCheck,
  History, FileSpreadsheet, Mail, Plug, Server, BookOpen, Key,
  Monitor, Cpu, HardDrive, Wifi, AlertCircle, Info, Lock, Wrench,
  UserCog,
  Brain, TrendingDown, MapPin, Gauge, AlertOctagon, CheckSquare,
  MoreHorizontal, Paperclip, UserPlus, Phone
} from 'lucide-react';

// Interfaces
interface LeadSource {
  id: string;
  name: string;
  leads: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
}

interface Proposal {
  id: string;
  clientName: string;
  projectType: string;
  value: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdDate: string;
  expiryDate: string;
}

interface ProjectProfitability {
  id: string;
  name: string;
  client: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  status: 'active' | 'completed' | 'on-hold';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  capacity: number;
  utilization: number;
  currentProjects: number;
  availability: 'available' | 'busy' | 'overloaded';
}

interface ClientHealthScore {
  id: string;
  clientName: string;
  score: number;
  status: 'excellent' | 'good' | 'at-risk' | 'critical';
  lastContact: string;
  projectProgress: number;
  paymentStatus: 'current' | 'overdue' | 'pending';
}

interface QAChecklist {
  id: string;
  projectName: string;
  type: 'web-design' | 'seo-campaign';
  items: {
    id: string;
    description: string;
    completed: boolean;
    assignee: string;
  }[];
  overallProgress: number;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
}

interface NPSSurvey {
  id: string;
  clientName: string;
  projectName: string;
  score: number;
  feedback: string;
  date: string;
  category: 'promoter' | 'passive' | 'detractor';
}

interface Contract {
  id: string;
  clientName: string;
  type: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expired' | 'pending-renewal';
  renewalDate?: string;
}

interface ComplianceRecord {
  id: string;
  type: 'gdpr' | 'ccpa' | 'data-processing';
  description: string;
  status: 'compliant' | 'pending' | 'non-compliant';
  lastReview: string;
  nextReview: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
  description: string;
  category?: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

interface DataExport {
  id: string;
  type: 'clients' | 'projects' | 'invoices' | 'reports';
  format: 'csv' | 'xlsx' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
  downloadUrl?: string;
}

interface CustomReport {
  id: string;
  name: string;
  type: 'sales' | 'financial' | 'operational' | 'client';
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  recipients: string[];
  lastRun: string;
  status: 'active' | 'paused';
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  value: number;
  createdDate: string;
  assignedAgent?: string;
  lastContact?: string;
  notes?: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  leadsAssigned: number;
  leadsConverted: number;
  conversionRate: number;
  totalRevenue: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'follow-up' | 'onboarding';
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  recipients: number;
  openRate: number;
  clickRate: number;
  scheduledDate?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'accounting' | 'marketing' | 'analytics';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  apiCalls: number;
  monthlyLimit: number;
}

interface SystemHealth {
  id: string;
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  issues?: string[];
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: 'procedures' | 'training' | 'troubleshooting' | 'policies';
  author: string;
  lastUpdated: string;
  views: number;
  status: 'published' | 'draft' | 'archived';
}

// New Operational Features Interfaces
interface ManualTask {
  id: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeSpent: number; // minutes
  assignee: string;
  automationPotential: 'high' | 'medium' | 'low';
  estimatedSavings: number; // hours per month
  status: 'identified' | 'analyzing' | 'automating' | 'automated';
}

interface SalesKPI {
  id: string;
  name: string;
  currentValue: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastUpdated: string;
}

interface SkillMatrix {
  id: string;
  employeeId: string;
  employeeName: string;
  skills: {
    skillName: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    certified: boolean;
    lastAssessed: string;
  }[];
  availability: 'available' | 'busy' | 'training';
  currentProjects: string[];
}

interface VendorContractor {
  id: string;
  name: string;
  type: 'vendor' | 'contractor' | 'freelancer';
  services: string[];
  contractValue: number;
  contractStart: string;
  contractEnd: string;
  paymentStatus: 'current' | 'overdue' | 'pending';
  performanceScore: number;
  lastPayment: string;
  nextPayment: string;
}

interface ProcessBottleneck {
  id: string;
  processName: string;
  stage: string;
  avgWaitTime: number; // hours
  affectedProjects: number;
  impact: 'high' | 'medium' | 'low';
  rootCause: string;
  suggestedSolution: string;
  status: 'identified' | 'investigating' | 'resolving' | 'resolved';
}

interface ProjectRisk {
  id: string;
  projectId: string;
  projectName: string;
  riskType: 'budget' | 'timeline' | 'scope' | 'quality' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // percentage
  impact: string;
  mitigation: string;
  owner: string;
  status: 'open' | 'monitoring' | 'mitigated' | 'closed';
}

interface ClientPaymentRisk {
  id: string;
  clientId: string;
  clientName: string;
  riskScore: number;
  factors: string[];
  outstandingAmount: number;
  daysPastDue: number;
  paymentHistory: 'excellent' | 'good' | 'poor' | 'critical';
  recommendedAction: string;
  lastContact: string;
}

interface WorkflowPerformance {
  id: string;
  workflowName: string;
  type: 'automated' | 'manual';
  successRate: number;
  avgExecutionTime: number; // minutes
  errorCount: number;
  lastRun: string;
  status: 'healthy' | 'warning' | 'failing';
  improvements: string[];
}

interface ComplianceMonitoring {
  id: string;
  requirement: string;
  category: 'accessibility' | 'gdpr' | 'ccpa' | 'industry-specific';
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAudit: string;
  nextAudit: string;
  findings: string[];
  actionItems: string[];
  responsible: string;
}

interface InternalAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'policy' | 'system' | 'hr' | 'emergency';
  targetAudience: 'all' | 'management' | 'sales' | 'development' | 'support';
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  requiresAcknowledgment: boolean;
  attachments?: string[];
  readReceipts: ReadReceipt[];
}

interface ReadReceipt {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userRole: string;
  readAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  ipAddress?: string;
}

// StatCard Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <motion.div
    className="bg-white rounded-lg shadow-sm border p-6"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [showViewProposalModal, setShowViewProposalModal] = useState(false);
  const [showEditProposalModal, setShowEditProposalModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showViewAllReceiptsModal, setShowViewAllReceiptsModal] = useState(false);
  const [showNewExportModal, setShowNewExportModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditSkillModal, setShowEditSkillModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<InternalAnnouncement | null>(null);
  const [showUploadLeadsModal, setShowUploadLeadsModal] = useState(false);
  const [showAssignLeadModal, setShowAssignLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [leadFilter, setLeadFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  
  // Role management state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleCategory, setNewRoleCategory] = useState('');
  const [selectedBaseRole, setSelectedBaseRole] = useState<string | null>(null);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);



  const [userRoles, setUserRoles] = useState<UserRole[]>([
    { id: '1', name: 'Administrator', permissions: ['all'], userCount: 2, description: 'Has full access to all system features.' },
    { id: '2', name: 'Sales Manager', permissions: ['view-leads', 'assign-leads', 'view-reports'], userCount: 5, description: 'Manages sales team and performance.' },
    { id: '3', name: 'Agent', permissions: ['view-leads', 'edit-leads'], userCount: 20, description: 'Handles assigned leads.' },
  ]);





  // Sample data
  const [leadSources] = useState<LeadSource[]>([
    { id: '1', name: 'Google Ads', leads: 45, conversions: 12, revenue: 24000, cost: 3000, roi: 700 },
    { id: '2', name: 'Facebook Ads', leads: 32, conversions: 8, revenue: 16000, cost: 2000, roi: 700 },
    { id: '3', name: 'SEO Organic', leads: 28, conversions: 15, revenue: 30000, cost: 1000, roi: 2900 },
    { id: '4', name: 'Referrals', leads: 18, conversions: 12, revenue: 24000, cost: 500, roi: 4700 }
  ]);

  const [proposals] = useState<Proposal[]>([
    { id: '1', clientName: 'Tech Startup Inc', projectType: 'E-commerce Website', value: 15000, status: 'sent', createdDate: '2024-01-15', expiryDate: '2024-02-15' },
    { id: '2', clientName: 'Local Restaurant', projectType: 'Local SEO Package', value: 3000, status: 'approved', createdDate: '2024-01-10', expiryDate: '2024-02-10' },
    { id: '3', clientName: 'Medical Practice', projectType: 'Website Redesign', value: 8000, status: 'draft', createdDate: '2024-01-20', expiryDate: '2024-02-20' }
  ]);

  const [projectProfitability] = useState<ProjectProfitability[]>([
    { id: '1', name: 'E-commerce Platform', client: 'Tech Startup Inc', revenue: 15000, costs: 8000, profit: 7000, margin: 46.7, status: 'active' },
    { id: '2', name: 'SEO Campaign', client: 'Local Restaurant', revenue: 3000, costs: 1200, profit: 1800, margin: 60, status: 'completed' },
    { id: '3', name: 'Website Redesign', client: 'Medical Practice', revenue: 8000, costs: 4500, profit: 3500, margin: 43.8, status: 'active' }
  ]);

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Johnson', role: 'Web Designer', capacity: 40, utilization: 85, currentProjects: 3, availability: 'busy' },
    { id: '2', name: 'Mike Chen', role: 'SEO Specialist', capacity: 40, utilization: 70, currentProjects: 2, availability: 'available' },
    { id: '3', name: 'Emily Davis', role: 'Developer', capacity: 40, utilization: 95, currentProjects: 4, availability: 'overloaded' }
  ]);

  const [clientHealthScores] = useState<ClientHealthScore[]>([
    { id: '1', clientName: 'Tech Startup Inc', score: 85, status: 'good', lastContact: '2024-01-18', projectProgress: 75, paymentStatus: 'current' },
    { id: '2', clientName: 'Local Restaurant', score: 95, status: 'excellent', lastContact: '2024-01-20', projectProgress: 100, paymentStatus: 'current' },
    { id: '3', clientName: 'Medical Practice', score: 60, status: 'at-risk', lastContact: '2024-01-10', projectProgress: 45, paymentStatus: 'overdue' }
  ]);

  const [qaChecklists] = useState<QAChecklist[]>([
    {
      id: '1',
      projectName: 'E-commerce Platform',
      type: 'web-design',
      items: [
        { id: '1', description: 'Cross-browser compatibility', completed: true, assignee: 'Sarah Johnson' },
        { id: '2', description: 'Mobile responsiveness', completed: true, assignee: 'Sarah Johnson' },
        { id: '3', description: 'Performance optimization', completed: false, assignee: 'Emily Davis' }
      ],
      overallProgress: 67,
      status: 'in-review'
    }
  ]);

  const [npsSurveys] = useState<NPSSurvey[]>([
    { id: '1', clientName: 'Local Restaurant', projectName: 'SEO Campaign', score: 9, feedback: 'Excellent service and results!', date: '2024-01-15', category: 'promoter' },
    { id: '2', clientName: 'Tech Startup Inc', projectName: 'E-commerce Platform', score: 7, feedback: 'Good work, minor delays', date: '2024-01-12', category: 'passive' }
  ]);

  const [contracts] = useState<Contract[]>([
    { id: '1', clientName: 'Tech Startup Inc', type: 'Web Development', startDate: '2024-01-01', endDate: '2024-12-31', value: 50000, status: 'active' },
    { id: '2', clientName: 'Local Restaurant', type: 'SEO Services', startDate: '2023-06-01', endDate: '2024-05-31', value: 12000, status: 'pending-renewal', renewalDate: '2024-05-31' }
  ]);

  const [complianceRecords] = useState<ComplianceRecord[]>([
    { id: '1', type: 'gdpr', description: 'Data Processing Agreement Review', status: 'compliant', lastReview: '2024-01-01', nextReview: '2024-07-01' },
    { id: '2', type: 'ccpa', description: 'Privacy Policy Update', status: 'pending', lastReview: '2023-12-01', nextReview: '2024-06-01' }
  ]);

  const [leads] = useState<Lead[]>([
    { id: '1', name: 'John Smith', email: 'john@techcorp.com', phone: '+1-555-0101', company: 'TechCorp Solutions', source: 'Google Ads', status: 'new', value: 15000, createdDate: '2024-01-20', notes: 'Interested in e-commerce platform' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah@healthplus.com', phone: '+1-555-0102', company: 'HealthPlus Clinic', source: 'Referral', status: 'contacted', assignedAgent: 'agent1', value: 8000, createdDate: '2024-01-18', lastContact: '2024-01-19', notes: 'Needs website redesign urgently' },
    { id: '3', name: 'Mike Johnson', email: 'mike@retailstore.com', phone: '+1-555-0103', company: 'Retail Store Inc', source: 'Facebook Ads', status: 'qualified', assignedAgent: 'agent2', value: 5000, createdDate: '2024-01-15', lastContact: '2024-01-17', notes: 'Looking for SEO services' },
    { id: '4', name: 'Lisa Brown', email: 'lisa@startup.com', phone: '+1-555-0104', company: 'Startup Ventures', source: 'SEO Organic', status: 'new', value: 12000, createdDate: '2024-01-22', notes: 'Interested in full digital marketing package' },
    { id: '5', name: 'David Lee', email: 'david@restaurant.com', phone: '+1-555-0105', company: 'Fine Dining Restaurant', source: 'Referral', status: 'converted', assignedAgent: 'agent1', value: 3000, createdDate: '2024-01-10', lastContact: '2024-01-20', notes: 'Completed local SEO project' }
  ]);

  const [agents] = useState<Agent[]>([
    { id: 'agent1', name: 'Alex Thompson', email: 'alex@company.com', role: 'Senior Sales Agent', leadsAssigned: 8, leadsConverted: 3, conversionRate: 37.5, totalRevenue: 45000 },
    { id: 'agent2', name: 'Jessica Martinez', email: 'jessica@company.com', role: 'Sales Agent', leadsAssigned: 6, leadsConverted: 2, conversionRate: 33.3, totalRevenue: 28000 },
    { id: 'agent3', name: 'Ryan Davis', email: 'ryan@company.com', role: 'Junior Sales Agent', leadsAssigned: 4, leadsConverted: 1, conversionRate: 25.0, totalRevenue: 15000 }
  ]);

  // Enhanced role management with comprehensive permissions
  const [predefinedRoles] = useState<UserRole[]>([
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Complete system access with all administrative privileges',
      category: 'administrative',
      userCount: 1,
      permissions: ['all']
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access with user and system management',
      category: 'administrative',
      userCount: 3,
      permissions: [
        'user_management', 'role_management', 'system_settings',
        'audit_logs', 'security_settings', 'backup_restore'
      ]
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management level access for overseeing operations',
      category: 'management',
      userCount: 5,
      permissions: [
        'view_all_reports', 'manage_projects', 'manage_clients',
        'manage_team', 'approve_proposals', 'financial_reports'
      ]
    },
    {
      id: 'team_lead',
      name: 'Team Lead',
      description: 'Lead team members and manage project workflows',
      category: 'management',
      userCount: 8,
      permissions: [
        'manage_team_projects', 'assign_tasks', 'view_team_reports',
        'quality_assurance', 'client_communication'
      ]
    },
    {
      id: 'senior_employee',
      name: 'Senior Employee',
      description: 'Experienced team member with extended privileges',
      category: 'operational',
      userCount: 12,
      permissions: [
        'edit_all_projects', 'create_proposals', 'client_communication',
        'mentor_junior', 'quality_review'
      ]
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'Standard employee with basic operational access',
      category: 'operational',
      userCount: 25,
      permissions: [
        'view_assigned_projects', 'edit_own_tasks', 'time_tracking',
        'basic_reporting'
      ]
    },
    {
      id: 'contractor',
      name: 'Contractor',
      description: 'External contractor with limited project access',
      category: 'external',
      userCount: 7,
      permissions: [
        'view_assigned_projects', 'edit_assigned_tasks', 'time_tracking'
      ]
    },
    {
      id: 'client_admin',
      name: 'Client Administrator',
      description: 'Client with administrative access to their account',
      category: 'client',
      userCount: 15,
      permissions: [
        'view_own_projects', 'manage_client_users', 'client_reporting',
        'invoice_management'
      ]
    },
    {
      id: 'client_user',
      name: 'Client User',
      description: 'Standard client access to view their projects',
      category: 'client',
      userCount: 45,
      permissions: [
        'view_own_projects', 'basic_communication', 'view_invoices'
      ]
    }
  ]);

  const [availablePermissions] = useState([
    // User Management
    { id: 'user_management', name: 'User Management', category: 'Users', description: 'Create, edit, and delete user accounts' },
    { id: 'role_management', name: 'Role Management', category: 'Users', description: 'Manage user roles and permissions' },
    { id: 'manage_team', name: 'Team Management', category: 'Users', description: 'Manage team members and assignments' },
    
    // Project Management
    { id: 'manage_projects', name: 'Project Management', category: 'Projects', description: 'Create and manage all projects' },
    { id: 'manage_team_projects', name: 'Team Project Management', category: 'Projects', description: 'Manage projects assigned to team' },
    { id: 'view_assigned_projects', name: 'View Assigned Projects', category: 'Projects', description: 'View projects assigned to user' },
    { id: 'edit_all_projects', name: 'Edit All Projects', category: 'Projects', description: 'Edit any project in the system' },
    { id: 'view_own_projects', name: 'View Own Projects', category: 'Projects', description: 'View only own projects' },
    
    // Task Management
    { id: 'assign_tasks', name: 'Task Assignment', category: 'Tasks', description: 'Assign tasks to team members' },
    { id: 'edit_own_tasks', name: 'Edit Own Tasks', category: 'Tasks', description: 'Edit tasks assigned to user' },
    { id: 'edit_assigned_tasks', name: 'Edit Assigned Tasks', category: 'Tasks', description: 'Edit tasks assigned by others' },
    
    // Client Management
    { id: 'manage_clients', name: 'Client Management', category: 'Clients', description: 'Manage client accounts and information' },
    { id: 'client_communication', name: 'Client Communication', category: 'Clients', description: 'Communicate with clients' },
    { id: 'basic_communication', name: 'Basic Communication', category: 'Clients', description: 'Basic client communication' },
    { id: 'manage_client_users', name: 'Manage Client Users', category: 'Clients', description: 'Manage users within client account' },
    
    // Financial
    { id: 'financial_reports', name: 'Financial Reports', category: 'Financial', description: 'Access financial reports and data' },
    { id: 'invoice_management', name: 'Invoice Management', category: 'Financial', description: 'Manage invoices and billing' },
    { id: 'view_invoices', name: 'View Invoices', category: 'Financial', description: 'View invoice information' },
    
    // Reporting
    { id: 'view_all_reports', name: 'All Reports', category: 'Reporting', description: 'Access all system reports' },
    { id: 'view_team_reports', name: 'Team Reports', category: 'Reporting', description: 'View reports for team members' },
    { id: 'basic_reporting', name: 'Basic Reporting', category: 'Reporting', description: 'Access basic reports' },
    { id: 'client_reporting', name: 'Client Reporting', category: 'Reporting', description: 'Access client-specific reports' },
    
    // Quality & Proposals
    { id: 'quality_assurance', name: 'Quality Assurance', category: 'Quality', description: 'Perform quality assurance tasks' },
    { id: 'quality_review', name: 'Quality Review', category: 'Quality', description: 'Review and approve quality checks' },
    { id: 'create_proposals', name: 'Create Proposals', category: 'Sales', description: 'Create and edit proposals' },
    { id: 'approve_proposals', name: 'Approve Proposals', category: 'Sales', description: 'Approve and finalize proposals' },
    
    // System Administration
    { id: 'system_settings', name: 'System Settings', category: 'System', description: 'Configure system settings' },
    { id: 'security_settings', name: 'Security Settings', category: 'System', description: 'Manage security configurations' },
    { id: 'audit_logs', name: 'Audit Logs', category: 'System', description: 'View system audit logs' },
    { id: 'backup_restore', name: 'Backup & Restore', category: 'System', description: 'Manage system backups' },
    
    // Miscellaneous
    { id: 'time_tracking', name: 'Time Tracking', category: 'Productivity', description: 'Track time and productivity' },
    { id: 'mentor_junior', name: 'Mentor Junior Staff', category: 'Development', description: 'Mentor and guide junior team members' }
  ]);

  const permissionCategories = availablePermissions.reduce((acc, permission) => {
    const { category } = permission;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  const [auditLogs] = useState<AuditLog[]>([
    { id: '1', userId: '1', userName: 'John Admin', action: 'LOGIN', resource: 'System', timestamp: '2024-01-20 09:15:00', ipAddress: '192.168.1.100', details: 'Successful login' },
    { id: '2', userId: '2', userName: 'Sarah Manager', action: 'UPDATE', resource: 'Client Record', timestamp: '2024-01-20 10:30:00', ipAddress: '192.168.1.101', details: 'Updated client contact information' },
    { id: '3', userId: '3', userName: 'Mike Employee', action: 'CREATE', resource: 'Project Task', timestamp: '2024-01-20 11:45:00', ipAddress: '192.168.1.102', details: 'Created new task for Project #123' }
  ]);

  const [dataExports] = useState<DataExport[]>([
    { id: '1', type: 'clients', format: 'xlsx', status: 'completed', createdBy: 'John Admin', createdAt: '2024-01-20 08:00:00', downloadUrl: '/exports/clients_2024.xlsx' },
    { id: '2', type: 'projects', format: 'csv', status: 'processing', createdBy: 'Sarah Manager', createdAt: '2024-01-20 09:30:00' },
    { id: '3', type: 'invoices', format: 'pdf', status: 'pending', createdBy: 'John Admin', createdAt: '2024-01-20 10:15:00' }
  ]);

  const [customReports] = useState<CustomReport[]>([
    { id: '1', name: 'Weekly Sales Report', type: 'sales', schedule: 'weekly', recipients: ['manager@company.com'], lastRun: '2024-01-15', status: 'active' },
    { id: '2', name: 'Monthly Financial Summary', type: 'financial', schedule: 'monthly', recipients: ['cfo@company.com', 'manager@company.com'], lastRun: '2024-01-01', status: 'active' },
    { id: '3', name: 'Client Satisfaction Report', type: 'client', schedule: 'monthly', recipients: ['support@company.com'], lastRun: '2024-01-01', status: 'paused' }
  ]);

  const [emailCampaigns] = useState<EmailCampaign[]>([
    { id: '1', name: 'Monthly Newsletter', type: 'newsletter', status: 'sent', recipients: 150, openRate: 24.5, clickRate: 3.2 },
    { id: '2', name: 'New Service Promotion', type: 'promotional', status: 'scheduled', recipients: 200, openRate: 0, clickRate: 0, scheduledDate: '2024-01-25' },
    { id: '3', name: 'Client Onboarding Series', type: 'onboarding', status: 'draft', recipients: 0, openRate: 0, clickRate: 0 }
  ]);

  const [integrations] = useState<Integration[]>([
    { id: '1', name: 'Stripe Payment', type: 'accounting', status: 'connected', lastSync: '2024-01-20 12:00:00', apiCalls: 1250, monthlyLimit: 5000 },
    { id: '2', name: 'Google Analytics', type: 'analytics', status: 'connected', lastSync: '2024-01-20 11:30:00', apiCalls: 890, monthlyLimit: 10000 },
    { id: '3', name: 'Mailchimp', type: 'marketing', status: 'error', lastSync: '2024-01-19 15:45:00', apiCalls: 450, monthlyLimit: 2000 },
    { id: '4', name: 'QuickBooks', type: 'accounting', status: 'disconnected', lastSync: '2024-01-18 09:00:00', apiCalls: 0, monthlyLimit: 1000 }
  ]);

  const [systemHealth] = useState<SystemHealth[]>([
    { id: '1', component: 'Web Server', status: 'healthy', uptime: 99.9, responseTime: 120, lastCheck: '2024-01-20 12:00:00' },
    { id: '2', component: 'Database', status: 'healthy', uptime: 99.8, responseTime: 45, lastCheck: '2024-01-20 12:00:00' },
    { id: '3', component: 'Email Service', status: 'warning', uptime: 98.5, responseTime: 200, lastCheck: '2024-01-20 12:00:00', issues: ['High response time'] },
    { id: '4', component: 'File Storage', status: 'critical', uptime: 95.2, responseTime: 500, lastCheck: '2024-01-20 12:00:00', issues: ['Disk space low', 'Slow response'] }
  ]);

  const [knowledgeBase] = useState<KnowledgeBaseArticle[]>([
    { id: '1', title: 'Client Onboarding Process', category: 'procedures', author: 'Sarah Manager', lastUpdated: '2024-01-15', views: 45, status: 'published' },
    { id: '2', title: 'SEO Best Practices Guide', category: 'training', author: 'Mike SEO', lastUpdated: '2024-01-10', views: 78, status: 'published' },
    { id: '3', title: 'Troubleshooting Payment Issues', category: 'troubleshooting', author: 'John Admin', lastUpdated: '2024-01-18', views: 23, status: 'published' },
    { id: '4', title: 'Data Privacy Policy', category: 'policies', author: 'Legal Team', lastUpdated: '2024-01-05', views: 12, status: 'draft' }
  ]);

  // New Operational Features Data
  const [manualTasks] = useState<ManualTask[]>([
    { id: '1', description: 'Weekly client status report compilation', frequency: 'weekly', timeSpent: 120, assignee: 'Sarah Johnson', automationPotential: 'high', estimatedSavings: 8, status: 'identified' },
    { id: '2', description: 'Monthly invoice generation and sending', frequency: 'monthly', timeSpent: 180, assignee: 'Mike Chen', automationPotential: 'high', estimatedSavings: 12, status: 'analyzing' },
    { id: '3', description: 'Daily social media posting', frequency: 'daily', timeSpent: 30, assignee: 'Emily Davis', automationPotential: 'medium', estimatedSavings: 10, status: 'automating' },
    { id: '4', description: 'Client onboarding document preparation', frequency: 'weekly', timeSpent: 90, assignee: 'Sarah Johnson', automationPotential: 'medium', estimatedSavings: 6, status: 'identified' }
  ]);

  const [salesKPIs] = useState<SalesKPI[]>([
    { id: '1', name: 'Monthly Recurring Revenue', currentValue: 45000, target: 50000, unit: '$', trend: 'up', period: 'monthly', lastUpdated: '2024-01-20' },
    { id: '2', name: 'Lead Conversion Rate', currentValue: 24, target: 30, unit: '%', trend: 'up', period: 'monthly', lastUpdated: '2024-01-20' },
    { id: '3', name: 'Average Deal Size', currentValue: 8500, target: 10000, unit: '$', trend: 'stable', period: 'quarterly', lastUpdated: '2024-01-20' },
    { id: '4', name: 'Sales Cycle Length', currentValue: 45, target: 35, unit: 'days', trend: 'down', period: 'monthly', lastUpdated: '2024-01-20' },
    { id: '5', name: 'Customer Acquisition Cost', currentValue: 1200, target: 1000, unit: '$', trend: 'down', period: 'monthly', lastUpdated: '2024-01-20' }
  ]);

  const [skillMatrix] = useState<SkillMatrix[]>([
    {
      id: '1', employeeId: 'emp1', employeeName: 'Sarah Johnson',
      skills: [
        { skillName: 'Web Design', level: 'expert', certified: true, lastAssessed: '2024-01-15' },
        { skillName: 'UI/UX Design', level: 'advanced', certified: true, lastAssessed: '2024-01-10' },
        { skillName: 'React Development', level: 'intermediate', certified: false, lastAssessed: '2024-01-05' }
      ],
      availability: 'busy', currentProjects: ['E-commerce Platform', 'Website Redesign']
    },
    {
      id: '2', employeeId: 'emp2', employeeName: 'Mike Chen',
      skills: [
        { skillName: 'SEO Optimization', level: 'expert', certified: true, lastAssessed: '2024-01-12' },
        { skillName: 'Content Marketing', level: 'advanced', certified: true, lastAssessed: '2024-01-08' },
        { skillName: 'Google Analytics', level: 'expert', certified: true, lastAssessed: '2024-01-15' }
      ],
      availability: 'available', currentProjects: ['SEO Campaign']
    },
    {
      id: '3', employeeId: 'emp3', employeeName: 'Emily Davis',
      skills: [
        { skillName: 'Frontend Development', level: 'expert', certified: true, lastAssessed: '2024-01-18' },
        { skillName: 'Backend Development', level: 'advanced', certified: false, lastAssessed: '2024-01-10' },
        { skillName: 'Database Management', level: 'intermediate', certified: false, lastAssessed: '2024-01-05' }
      ],
      availability: 'training', currentProjects: ['E-commerce Platform', 'API Development']
    }
  ]);

  const [vendorContractors] = useState<VendorContractor[]>([
    { id: '1', name: 'CloudHost Solutions', type: 'vendor', services: ['Web Hosting', 'Domain Management'], contractValue: 12000, contractStart: '2024-01-01', contractEnd: '2024-12-31', paymentStatus: 'current', performanceScore: 95, lastPayment: '2024-01-15', nextPayment: '2024-02-15' },
    { id: '2', name: 'Design Freelancer Pro', type: 'freelancer', services: ['Graphic Design', 'Logo Creation'], contractValue: 5000, contractStart: '2024-01-10', contractEnd: '2024-06-10', paymentStatus: 'pending', performanceScore: 88, lastPayment: '2024-01-10', nextPayment: '2024-02-10' },
    { id: '3', name: 'Content Writing Agency', type: 'contractor', services: ['Content Creation', 'Copywriting'], contractValue: 8000, contractStart: '2023-12-01', contractEnd: '2024-11-30', paymentStatus: 'overdue', performanceScore: 72, lastPayment: '2023-12-15', nextPayment: '2024-01-15' }
  ]);

  const [processBottlenecks] = useState<ProcessBottleneck[]>([
    { id: '1', processName: 'Client Approval Workflow', stage: 'Design Review', avgWaitTime: 72, affectedProjects: 5, impact: 'high', rootCause: 'Client unavailability for reviews', suggestedSolution: 'Implement automated reminder system', status: 'identified' },
    { id: '2', processName: 'Content Creation Pipeline', stage: 'Content Review', avgWaitTime: 48, affectedProjects: 3, impact: 'medium', rootCause: 'Limited reviewer availability', suggestedSolution: 'Add additional content reviewers', status: 'investigating' },
    { id: '3', processName: 'Development Deployment', stage: 'Testing Phase', avgWaitTime: 24, affectedProjects: 2, impact: 'low', rootCause: 'Manual testing procedures', suggestedSolution: 'Implement automated testing', status: 'resolving' }
  ]);

  const [projectRisks] = useState<ProjectRisk[]>([
    { id: '1', projectId: 'proj1', projectName: 'E-commerce Platform', riskType: 'timeline', severity: 'high', probability: 75, impact: 'Project may delay by 2 weeks', mitigation: 'Add additional developer resources', owner: 'Sarah Johnson', status: 'open' },
    { id: '2', projectId: 'proj2', projectName: 'SEO Campaign', riskType: 'budget', severity: 'medium', probability: 40, impact: 'May exceed budget by 15%', mitigation: 'Renegotiate scope with client', owner: 'Mike Chen', status: 'monitoring' },
    { id: '3', projectId: 'proj3', projectName: 'Website Redesign', riskType: 'scope', severity: 'medium', probability: 60, impact: 'Scope creep affecting timeline', mitigation: 'Implement change request process', owner: 'Emily Davis', status: 'mitigated' }
  ]);

  const [clientPaymentRisks] = useState<ClientPaymentRisk[]>([
    { id: '1', clientId: 'client1', clientName: 'Tech Startup Inc', riskScore: 25, factors: ['New business', 'Limited credit history'], outstandingAmount: 0, daysPastDue: 0, paymentHistory: 'good', recommendedAction: 'Monitor closely', lastContact: '2024-01-18' },
    { id: '2', clientId: 'client2', clientName: 'Local Restaurant', riskScore: 10, factors: ['Established business', 'Excellent payment history'], outstandingAmount: 0, daysPastDue: 0, paymentHistory: 'excellent', recommendedAction: 'Continue normal terms', lastContact: '2024-01-20' },
    { id: '3', clientId: 'client3', clientName: 'Medical Practice', riskScore: 85, factors: ['Late payments', 'Financial difficulties'], outstandingAmount: 5000, daysPastDue: 15, paymentHistory: 'poor', recommendedAction: 'Require payment before work', lastContact: '2024-01-10' }
  ]);

  const [workflowPerformance] = useState<WorkflowPerformance[]>([
    { id: '1', workflowName: 'Client Onboarding', type: 'automated', successRate: 95, avgExecutionTime: 15, errorCount: 2, lastRun: '2024-01-20 10:30:00', status: 'healthy', improvements: ['Add email validation'] },
    { id: '2', workflowName: 'Invoice Generation', type: 'automated', successRate: 88, avgExecutionTime: 5, errorCount: 5, lastRun: '2024-01-20 09:00:00', status: 'warning', improvements: ['Fix tax calculation', 'Improve error handling'] },
    { id: '3', workflowName: 'Project Status Updates', type: 'manual', successRate: 75, avgExecutionTime: 30, errorCount: 8, lastRun: '2024-01-19 16:00:00', status: 'failing', improvements: ['Automate status collection', 'Add validation rules'] }
  ]);

  const [complianceMonitoring] = useState<ComplianceMonitoring[]>([
    { id: '1', requirement: 'WCAG 2.1 AA Compliance', category: 'accessibility', status: 'compliant', lastAudit: '2024-01-01', nextAudit: '2024-07-01', findings: [], actionItems: [], responsible: 'Sarah Johnson' },
    { id: '2', requirement: 'GDPR Data Processing', category: 'gdpr', status: 'partial', lastAudit: '2024-01-15', nextAudit: '2024-04-15', findings: ['Missing consent forms'], actionItems: ['Update privacy policy', 'Implement consent management'], responsible: 'Legal Team' },
    { id: '3', requirement: 'PCI DSS Compliance', category: 'industry-specific', status: 'non-compliant', lastAudit: '2023-12-01', nextAudit: '2024-03-01', findings: ['Outdated security protocols'], actionItems: ['Update payment processing', 'Security audit'], responsible: 'IT Team' }
  ]);

  const [announcements, setAnnouncements] = useState<InternalAnnouncement[]>([
    {
      id: '1',
      title: 'New Company Policy: Remote Work Guidelines',
      content: 'We are implementing new remote work guidelines effective immediately. All employees must review and acknowledge these changes by end of week.',
      author: 'HR Department',
      authorRole: 'Human Resources',
      priority: 'high',
      category: 'policy',
      targetAudience: 'all',
      createdAt: '2024-01-15T09:00:00Z',
      expiresAt: '2024-02-15T23:59:59Z',
      isActive: true,
      requiresAcknowledgment: true,
      attachments: ['remote-work-policy.pdf'],
      readReceipts: [
        { id: 'r1', announcementId: '1', userId: 'u1', userName: 'John Smith', userRole: 'Developer', readAt: '2024-01-15T10:30:00Z', acknowledged: true, acknowledgedAt: '2024-01-15T10:35:00Z' },
        { id: 'r2', announcementId: '1', userId: 'u2', userName: 'Sarah Johnson', userRole: 'Manager', readAt: '2024-01-15T11:00:00Z', acknowledged: false }
      ]
    },
    {
      id: '2',
      title: 'System Maintenance Scheduled',
      content: 'Our CRM system will undergo maintenance this Saturday from 2 AM to 6 AM EST. Please save your work and log out before this time.',
      author: 'IT Department',
      authorRole: 'System Administrator',
      priority: 'medium',
      category: 'system',
      targetAudience: 'all',
      createdAt: '2024-01-14T14:00:00Z',
      isActive: true,
      requiresAcknowledgment: false,
      readReceipts: [
        { id: 'r3', announcementId: '2', userId: 'u1', userName: 'John Smith', userRole: 'Developer', readAt: '2024-01-14T14:15:00Z', acknowledged: false },
        { id: 'r4', announcementId: '2', userId: 'u3', userName: 'Mike Wilson', userRole: 'Sales', readAt: '2024-01-14T15:30:00Z', acknowledged: false }
      ]
    },
    {
      id: '3',
      title: 'Q1 Sales Targets Released',
      content: 'The Q1 sales targets have been finalized and are now available in the sales dashboard. Team leads should review with their teams.',
      author: 'Sales Management',
      authorRole: 'Sales Director',
      priority: 'medium',
      category: 'general',
      targetAudience: 'sales',
      createdAt: '2024-01-13T08:00:00Z',
      isActive: true,
      requiresAcknowledgment: true,
      readReceipts: [
        { id: 'r5', announcementId: '3', userId: 'u3', userName: 'Mike Wilson', userRole: 'Sales', readAt: '2024-01-13T08:30:00Z', acknowledged: true, acknowledgedAt: '2024-01-13T08:45:00Z' }
      ]
    }
  ]);

  // Functions that depend on state variables
  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(selectedRole.permissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [selectedRole]);

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSavePermissions = () => {
    if (selectedRole) {
      // Save permissions for role
      // Here you would typically call an API to save the updated role permissions
      // For this example, we'll just update the local state
      const updatedRoles = userRoles.map(r => 
        r.id === selectedRole.id ? { ...r, permissions: selectedPermissions } : r
      );
      setUserRoles(updatedRoles);
      setShowPermissionModal(false);
      setSelectedRole(null);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$94,000"
          change="+12%"
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Active Projects"
          value="12"
          change="+3"
          icon={<Briefcase className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Team Utilization"
          value="83%"
          change="+5%"
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Client Satisfaction"
          value="8.2/10"
          change="+0.3"
          icon={<Star className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Source ROI</h3>
          <div className="space-y-3">
            {leadSources.map((source) => (
              <div key={source.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-sm text-gray-600">{source.leads} leads, {source.conversions} conversions</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{source.roi}% ROI</p>
                  <p className="text-sm text-gray-600">${source.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Project Profitability</h3>
          <div className="space-y-3">
            {projectProfitability.slice(0, 3).map((project) => (
              <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{project.margin.toFixed(1)}% margin</p>
                  <p className="text-sm text-green-600">${project.profit.toLocaleString()} profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesProcess = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales Process Management</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowUploadLeadsModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" /> Import Leads
          </button>
          <button 
            onClick={() => setShowNewProposalModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Proposal
          </button>
        </div>
      </div>

      {/* Sales Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Pipeline Value"
          value={`$${leads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString()}`}
          change="+12.5%"
          icon={<DollarSign className="h-5 w-5 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Active Leads"
          value={leads.filter(lead => ['new', 'contacted', 'qualified'].includes(lead.status)).length}
          change="+8"
          icon={<Users className="h-5 w-5 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Conversion Rate"
          value={`${Math.round((leads.filter(lead => lead.status === 'converted').length / leads.length) * 100)}%`}
          change="+2.3%"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Deal Size"
          value={`$${Math.round(leads.reduce((sum, lead) => sum + lead.value, 0) / leads.length).toLocaleString()}`}
          change="+5.2%"
          icon={<Target className="h-5 w-5 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Sales Pipeline Stages */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Sales Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['new', 'contacted', 'qualified', 'converted', 'lost'].map((status) => {
            const statusLeads = leads.filter(lead => lead.status === status);
            const statusValue = statusLeads.reduce((sum, lead) => sum + lead.value, 0);
            return (
              <div key={status} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium capitalize">{status}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status === 'new' ? 'bg-gray-100 text-gray-800' :
                    status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'converted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {statusLeads.length}
                  </span>
                </div>
                <p className="text-sm font-bold">{formatCurrency(statusValue)}</p>
                <div className="mt-2 space-y-1">
                  {statusLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                         onClick={() => {
                           setSelectedLead(lead);
                           setShowAssignLeadModal(true);
                         }}>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-gray-600">${lead.value.toLocaleString()}</p>
                    </div>
                  ))}
                  {statusLeads.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">+{statusLeads.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Lead Management</h3>
            <div className="flex gap-2">
              <select 
                value={leadFilter} 
                onChange={(e) => setLeadFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Leads</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {leads
              .filter(lead => leadFilter === 'all' || lead.status === leadFilter)
              .map((lead) => (
              <div key={lead.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <p className="text-sm text-gray-600">{lead.company}</p>
                    <p className="text-xs text-gray-500">{lead.source}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      lead.status === 'new' ? 'bg-gray-100 text-gray-800' :
                      lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status}
                    </span>
                    <p className="text-sm font-bold mt-1">${lead.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Created: {lead.createdDate}</span>
                  {lead.assignedAgent && (
                    <span>Agent: {agents.find(a => a.id === lead.assignedAgent)?.name}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowAssignLeadModal(true);
                    }}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
                  >
                    {lead.assignedAgent ? 'Reassign' : 'Assign'}
                  </button>
                  <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200">
                    Contact
                  </button>
                  <button className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs hover:bg-purple-200">
                    Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Agent Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Agent Performance</h3>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                  agent.conversionRate >= 35 ? 'text-green-600' :
                  agent.conversionRate >= 25 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                      {agent.conversionRate}%
                    </div>
                    <p className="text-xs text-gray-500">Conversion Rate</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Assigned: {agent.leadsAssigned}</p>
                    <p className="text-gray-600">Converted: {agent.leadsConverted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Active: {leads.filter(l => l.assignedAgent === agent.id && ['new', 'contacted', 'qualified'].includes(l.status)).length}</p>
                    <p className="text-gray-600">Pipeline: ${leads.filter(l => l.assignedAgent === agent.id).reduce((sum, l) => sum + l.value, 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${
                      agent.conversionRate >= 35 ? 'bg-green-500' :
                      agent.conversionRate >= 25 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(agent.conversionRate * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Source Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Source Performance</h3>
          <div className="space-y-4">
            {leadSources.map((source) => (
              <div key={source.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{source.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    source.roi > 1000 ? 'bg-green-100 text-green-800' :
                    source.roi > 500 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {source.roi}% ROI
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Leads: {source.leads}</p>
                    <p className="text-gray-600">Conversions: {source.conversions}</p>
                    <p className="text-gray-600">Conv. Rate: {Math.round((source.conversions / source.leads) * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue: {formatCurrency(source.revenue)}</p>
                    <p className="text-gray-600">Cost: {formatCurrency(source.cost)}</p>
                    <p className="text-gray-600">Profit: {formatCurrency(source.revenue - source.cost)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Performance</span>
                    <span>{Math.round((source.conversions / source.leads) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (source.conversions / source.leads) > 0.3 ? 'bg-green-500' :
                        (source.conversions / source.leads) > 0.2 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((source.conversions / source.leads) * 100 * 3, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proposals & Quotes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Proposals & Quotes</h3>
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{proposal.clientName}</h4>
                    <p className="text-sm text-gray-600">{proposal.projectType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                    proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <p className="font-bold">{formatCurrency(proposal.value)}</p>
                  <p className="text-gray-600">Expires: {proposal.expiryDate}</p>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  <p>Created: {proposal.createdDate}</p>
                  {proposal.status === 'sent' && (
                    <p className="text-yellow-600">⏰ Awaiting client response</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setShowViewProposalModal(true);
                    }}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                  >
                    View
                  </button>
                  {proposal.status === 'draft' && (
                    <button
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setShowEditProposalModal(true);
                      }}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200"
                    >
                      Edit
                    </button>
                  )}
                  {proposal.status === 'sent' && (
                    <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs hover:bg-yellow-200">
                      Follow Up
                    </button>
                  )}
                  <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-200">
                    Duplicate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Forecasting */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Sales Forecasting & Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Monthly Forecast</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Revenue</span>
                <span className="font-bold">${(leads.filter(l => l.status === 'qualified').reduce((sum, l) => sum + l.value, 0) * 0.7).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confidence Level</span>
                <span className="text-green-600 font-medium">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Deals</span>
                <span className="font-medium">{Math.round(leads.filter(l => l.status === 'qualified').length * 0.7)}</span>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Pipeline Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pipeline Velocity</span>
                <span className="font-bold">32 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Win Rate</span>
                <span className="text-green-600 font-medium">{Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Deal Size</span>
                <span className="font-medium">${Math.round(leads.reduce((sum, l) => sum + l.value, 0) / leads.length).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Performance Trends</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">MoM Growth</span>
                <span className="text-green-600 font-bold">+12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lead Quality</span>
                <span className="text-blue-600 font-medium">Improving</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Team Efficiency</span>
                <span className="text-green-600 font-medium">+8.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Management Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Team Capacity & Utilization</h3>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    member.availability === 'available' ? 'bg-green-100 text-green-800' :
                    member.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.availability}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span>{member.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        member.utilization > 90 ? 'bg-red-500' :
                        member.utilization > 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${member.utilization}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{member.currentProjects} active projects</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Client Health Scores</h3>
          <div className="space-y-3">
            {clientHealthScores.map((client) => (
              <div key={client.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{client.clientName}</h4>
                    <p className="text-sm text-gray-600">Last contact: {client.lastContact}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      client.status === 'excellent' ? 'text-green-600' :
                      client.status === 'good' ? 'text-blue-600' :
                      client.status === 'at-risk' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {client.score}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      client.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      client.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Project Progress: {client.projectProgress}%</p>
                  </div>
                  <div>
                    <p className={`${
                      client.paymentStatus === 'current' ? 'text-green-600' :
                      client.paymentStatus === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      Payment: {client.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuality = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quality Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">QA Checklists & Workflows</h3>
          <div className="space-y-4">
            {qaChecklists.map((checklist) => (
              <div key={checklist.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{checklist.projectName}</h4>
                    <p className="text-sm text-gray-600 capitalize">{checklist.type.replace('-', ' ')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    checklist.status === 'approved' ? 'bg-green-100 text-green-800' :
                    checklist.status === 'in-review' ? 'bg-blue-100 text-blue-800' :
                    checklist.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {checklist.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{checklist.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${checklist.overallProgress}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1">
                    {checklist.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={item.completed ? 'line-through text-gray-500' : ''}>
                            {item.description}
                          </span>
                        </div>
                        <span className="text-gray-500">{item.assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Client Satisfaction (NPS)</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">67%</div>
                <div className="text-sm text-gray-600">Promoters</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">25%</div>
                <div className="text-sm text-gray-600">Passives</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">8%</div>
                <div className="text-sm text-gray-600">Detractors</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {npsSurveys.map((survey) => (
                <div key={survey.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{survey.clientName}</h4>
                      <p className="text-sm text-gray-600">{survey.projectName}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        survey.category === 'promoter' ? 'text-green-600' :
                        survey.category === 'passive' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {survey.score}/10
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        survey.category === 'promoter' ? 'bg-green-100 text-green-800' :
                        survey.category === 'passive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {survey.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{survey.feedback}"</p>
                  <p className="text-xs text-gray-500 mt-2">{survey.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Contract & SOW Management</h3>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{contract.clientName}</h4>
                    <p className="text-sm text-gray-600">{contract.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    contract.status === 'active' ? 'bg-green-100 text-green-800' :
                    contract.status === 'pending-renewal' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {contract.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Start: {contract.startDate}</p>
                    <p className="text-gray-600">End: {contract.endDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Value: ${contract.value.toLocaleString()}</p>
                    {contract.renewalDate && (
                      <p className="text-yellow-600">Renewal: {contract.renewalDate}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">GDPR/CCPA Compliance</h3>
          <div className="space-y-3">
            {complianceRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium uppercase">{record.type}</h4>
                    <p className="text-sm text-gray-600">{record.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Last Review: {record.lastReview}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Next Review: {record.nextReview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security & Access Control</h2>

      {/* Role Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predefined Roles */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Predefined Roles</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCreateRoleModal(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Create Custom Role
              </button>
              <button 
                onClick={() => setShowAddRoleModal(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" /> Assign Role
              </button>
            </div>
          </div>
          
          {/* Role Categories */}
          {['administrative', 'management', 'operational', 'external', 'client'].map((category) => (
            <div key={category} className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3 capitalize">{category} Roles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predefinedRoles.filter(role => role.category === category).map((role) => (
                  <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium">{role.name}</h5>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setShowPermissionModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Settings className="h-3 w-3" /> Manage
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {permission === 'all' ? 'All Permissions' : permission.replace('_', ' ')}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current User Roles */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Active User Roles</h3>
          <div className="space-y-3">
            {userRoles.map((role) => (
              <div key={role.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{role.name}</h4>
                    <p className="text-xs text-gray-600">{role.description}</p>
                  </div>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                    {role.userCount} users
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.slice(0, 2).map((permission, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {permission === 'all' ? 'All' : permission.replace('_', ' ')}
                    </span>
                  ))}
                  {role.permissions.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{role.permissions.length - 2}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Logs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Security Audit Logs</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
              <Download className="h-3 w-3" /> Export Logs
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">{log.userName}</span>
                  </div>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">{log.action}</span> on {log.resource}
                </div>
                <div className="text-xs text-gray-500">
                  IP: {log.ipAddress} • {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Two-Factor Authentication</h4>
                <p className="text-xs text-gray-600">Require 2FA for all admin accounts</p>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-green-600 mr-2">Enabled</span>
                <div className="w-8 h-4 bg-green-500 rounded-full relative">
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Session Timeout</h4>
                <p className="text-xs text-gray-600">Auto-logout after inactivity</p>
              </div>
              <select className="text-xs border rounded px-2 py-1">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Password Policy</h4>
                <p className="text-xs text-gray-600">Minimum 8 chars, special characters</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-xs">
                Configure
              </button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">IP Whitelist</h4>
                <p className="text-xs text-gray-600">Restrict access by IP address</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-xs">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTools = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Data Import/Export Tools</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Data Exports</h3>
            <button 
              onClick={() => setShowNewExportModal(true)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
            >
              <Download className="h-3 w-3" /> New Export
            </button>
          </div>
          <div className="space-y-3">
            {dataExports.map((exportItem) => (
              <div key={exportItem.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium capitalize">{exportItem.type} Export</h4>
                    <p className="text-sm text-gray-600">Created by {exportItem.createdBy}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    exportItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                    exportItem.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    exportItem.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exportItem.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-600">Format: </span>
                    <span className="font-medium uppercase">{exportItem.format}</span>
                  </div>
                  <div>
                    {exportItem.status === 'completed' && exportItem.downloadUrl ? (
                      <button 
                        onClick={() => window.open(exportItem.downloadUrl, '_blank')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    ) : (
                      <span className="text-gray-500">{exportItem.createdAt}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Custom Reports</h3>
            <button 
              onClick={() => setShowCreateReportModal(true)}
              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Create Report
            </button>
          </div>
          <div className="space-y-3">
            {customReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{report.type} • {report.schedule}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Recipients: {report.recipients.length}</p>
                  <p>Last run: {report.lastRun}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Communications & Marketing</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Email Campaigns</h3>
            <button 
              onClick={() => setShowNewCampaignModal(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
            >
              <Mail className="h-3 w-3" /> New Campaign
            </button>
          </div>
          <div className="space-y-3">
            {emailCampaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{campaign.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Recipients</p>
                    <p className="font-medium">{campaign.recipients}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Open Rate</p>
                    <p className="font-medium">{campaign.openRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Click Rate</p>
                    <p className="font-medium">{campaign.clickRate}%</p>
                  </div>
                </div>
                {campaign.scheduledDate && (
                  <p className="text-xs text-blue-600 mt-2">Scheduled: {campaign.scheduledDate}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Knowledge Base</h3>
          <div className="space-y-3">
            {knowledgeBase.map((article) => (
              <div key={article.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-600">by {article.author}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    article.status === 'published' ? 'bg-green-100 text-green-800' :
                    article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {article.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 capitalize">{article.category}</span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {article.views}
                    </span>
                  </div>
                  <span className="text-gray-500">{article.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemMonitoring = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Monitoring</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            {systemHealth.map((component) => (
              <div key={component.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium">{component.component}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    component.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    component.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {component.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <p className="text-gray-600">Uptime: {component.uptime}%</p>
                    <p className="text-gray-600">Response: {component.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Check: {component.lastCheck}</p>
                  </div>
                </div>
                {component.issues && component.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600 font-medium">Issues:</p>
                    {component.issues.map((issue, index) => (
                      <p key={index} className="text-xs text-red-600">• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Integration Management</h3>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Plug className="h-4 w-4 text-gray-500" />
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{integration.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    integration.status === 'connected' ? 'bg-green-100 text-green-800' :
                    integration.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Last sync: {integration.lastSync}</p>
                  <div className="flex justify-between mt-1">
                    <span>API calls: {integration.apiCalls}/{integration.monthlyLimit}</span>
                    <span>{Math.round((integration.apiCalls / integration.monthlyLimit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full ${
                        (integration.apiCalls / integration.monthlyLimit) > 0.8 ? 'bg-red-500' :
                        (integration.apiCalls / integration.monthlyLimit) > 0.6 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(integration.apiCalls / integration.monthlyLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // New Operational Features Render Functions
  const renderOperationalIntelligence = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Operational Intelligence</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manual Task Identification</h3>
            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add Task
            </button>
          </div>
          <div className="space-y-3">
            {manualTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{task.description}</h4>
                    <p className="text-sm text-gray-600">{task.assignee} • {task.frequency}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.automationPotential === 'high' ? 'bg-red-100 text-red-800' :
                    task.automationPotential === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.automationPotential} potential
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Time spent: {task.timeSpent} min</p>
                    <p className="text-gray-600">Savings: {task.estimatedSavings}h/month</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'automated' ? 'bg-green-100 text-green-800' :
                      task.status === 'automating' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Sales KPIs</h3>
          <div className="space-y-3">
            {salesKPIs.map((kpi) => (
              <div key={kpi.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{kpi.name}</h4>
                    <p className="text-sm text-gray-600">{kpi.period}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : kpi.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Gauge className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{kpi.currentValue.toLocaleString()}{kpi.unit}</p>
                    <p className="text-sm text-gray-600">Target: {kpi.target.toLocaleString()}{kpi.unit}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      kpi.currentValue >= kpi.target ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.round((kpi.currentValue / kpi.target) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      kpi.currentValue >= kpi.target ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((kpi.currentValue / kpi.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamOptimization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team Optimization</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Skill Matrix Management</h3>
          <div className="space-y-4">
            {skillMatrix.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{employee.employeeName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      employee.availability === 'available' ? 'bg-green-100 text-green-800' :
                      employee.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {employee.availability}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEditSkillModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {employee.skills.map((skill, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span>{skill.skillName}</span>
                        {skill.certified && <CheckSquare className="h-3 w-3 text-green-500" />}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        skill.level === 'expert' ? 'bg-purple-100 text-purple-800' :
                        skill.level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>Current Projects: {employee.currentProjects.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Vendor/Contractor Management</h3>
          <div className="space-y-3">
            {vendorContractors.map((vendor) => (
              <div key={vendor.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{vendor.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{vendor.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    vendor.paymentStatus === 'current' ? 'bg-green-100 text-green-800' :
                    vendor.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vendor.paymentStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Services: {vendor.services.join(', ')}</p>
                  <p>Contract: ${vendor.contractValue.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p>Performance: {vendor.performanceScore}%</p>
                    <p>Next Payment: {vendor.nextPayment}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      vendor.performanceScore >= 90 ? 'text-green-600' :
                      vendor.performanceScore >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {vendor.performanceScore >= 90 ? 'Excellent' :
                     vendor.performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Risk Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Process Bottleneck Detection</h3>
          <div className="space-y-3">
            {processBottlenecks.map((bottleneck) => (
              <div key={bottleneck.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{bottleneck.processName}</h4>
                    <p className="text-sm text-gray-600">{bottleneck.stage}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bottleneck.impact === 'high' ? 'bg-red-100 text-red-800' :
                    bottleneck.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {bottleneck.impact} impact
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Avg Wait Time: {bottleneck.avgWaitTime}h</p>
                  <p>Affected Projects: {bottleneck.affectedProjects}</p>
                  <p>Root Cause: {bottleneck.rootCause}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Suggested Solution:</p>
                  <p className="text-gray-600">{bottleneck.suggestedSolution}</p>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    bottleneck.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    bottleneck.status === 'resolving' ? 'bg-blue-100 text-blue-800' :
                    bottleneck.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bottleneck.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Project Risk Assessment</h3>
          <div className="space-y-3">
            {projectRisks.map((risk) => (
              <div key={risk.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{risk.projectName}</h4>
                    <p className="text-sm text-gray-600 capitalize">{risk.riskType} risk</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    risk.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    risk.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Probability: {risk.probability}%</p>
                  <p>Impact: {risk.impact}</p>
                  <p>Owner: {risk.owner}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Mitigation:</p>
                  <p className="text-gray-600">{risk.mitigation}</p>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    risk.status === 'closed' ? 'bg-green-100 text-green-800' :
                    risk.status === 'mitigated' ? 'bg-blue-100 text-blue-800' :
                    risk.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {risk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Client Payment Risk</h3>
          <div className="space-y-3">
            {clientPaymentRisks.map((client) => (
              <div key={client.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{client.clientName}</h4>
                    <p className="text-sm text-gray-600">Risk Score: {client.riskScore}/100</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    client.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                      client.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {client.riskScore >= 70 ? 'High Risk' :
                     client.riskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Outstanding: ${client.outstandingAmount.toLocaleString()}</p>
                  <p>Days Past Due: {client.daysPastDue}</p>
                  <p>Payment History: {client.paymentHistory}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Recommended Action:</p>
                  <p className="text-gray-600">{client.recommendedAction}</p>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last Contact: {client.lastContact}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Performance Analytics</h3>
          <div className="space-y-3">
            {workflowPerformance.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{workflow.workflowName}</h4>
                    <p className="text-sm text-gray-600 capitalize">{workflow.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    workflow.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <p className="text-gray-600">Success Rate: {workflow.successRate}%</p>
                    <p className="text-gray-600">Avg Time: {workflow.avgExecutionTime}min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Errors: {workflow.errorCount}</p>
                    <p className="text-gray-600">Last Run: {workflow.lastRun}</p>
                  </div>
                </div>
                {workflow.improvements.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium text-blue-600">Improvements:</p>
                    <ul className="text-gray-600 list-disc list-inside">
                      {workflow.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedCompliance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advanced Compliance Monitoring</h2>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Requirements Tracking</h3>
        <div className="space-y-3">
          {complianceMonitoring.map((compliance) => (
            <div key={compliance.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{compliance.requirement}</h4>
                  <p className="text-sm text-gray-600 capitalize">{compliance.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  compliance.status === 'compliant' ? 'bg-green-100 text-green-800' :
                  compliance.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {compliance.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <p className="text-gray-600">Last Audit: {compliance.lastAudit}</p>
                  <p className="text-gray-600">Next Audit: {compliance.nextAudit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Responsible: {compliance.responsible}</p>
                </div>
              </div>
              {compliance.findings.length > 0 && (
                <div className="text-sm mb-2">
                  <p className="font-medium text-red-600">Findings:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    {compliance.findings.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}
              {compliance.actionItems.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Action Items:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    {compliance.actionItems.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeads = () => {
    const filteredLeads = leads.filter(lead => {
      const matchesStatus = leadFilter === 'all' || lead.status === leadFilter;
      const matchesAgent = agentFilter === 'all' || lead.assignedAgent === agentFilter;
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesAgent && matchesSearch;
    });

    const unassignedLeads = leads.filter(lead => !lead.assignedAgent);
    const totalLeadValue = filteredLeads.reduce((sum, lead) => sum + lead.value, 0);
    const conversionRate = leads.filter(lead => lead.status === 'converted').length / leads.length * 100;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowUploadLeadsModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Upload Leads
            </button>
            <button 
              onClick={() => setShowAssignLeadModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Assign Lead
            </button>
          </div>
        </div>

        {/* Lead Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={leads.length.toString()}
            icon={<Users className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Unassigned Leads"
            value={unassignedLeads.length.toString()}
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            color={unassignedLeads.length > 0 ? "bg-red-500" : "bg-green-500"}
            change={unassignedLeads.length > 0 ? `${unassignedLeads.length} need assignment` : "All assigned"}
          />
          <StatCard
            title="Total Value"
            value={`$${totalLeadValue.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="bg-purple-500"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Agents</option>
              <option value="">Unassigned</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map(agent => {
              const agentLeads = leads.filter(lead => lead.assignedAgent === agent.id);
              return (
                <div key={agent.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{agent.name}</h4>
                    <span className="text-sm text-gray-600">{agentLeads.length} leads</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Assigned:</span>
                      <span>{agent.leadsAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Converted:</span>
                      <span>{agent.leadsConverted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className={`${agent.conversionRate >= 35 ? 'text-green-600' : agent.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {agent.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Leads ({filteredLeads.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Assigned Agent</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const agent = agents.find(a => a.id === lead.assignedAgent);
                  return (
                    <tr key={lead.id} className={`border-b hover:bg-gray-50 ${!lead.assignedAgent ? 'bg-red-50' : ''}`}>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.email}</div>
                        </div>
                      </td>
                      <td className="p-2">{lead.company}</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{lead.phone}</div>
                          <div className="text-gray-600">{lead.email}</div>
                        </div>
                      </td>
                      <td className="p-2">{lead.source}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {agent ? (
                          <div className="text-sm">
                            <div>{agent.name}</div>
                            <div className="text-gray-600">{agent.email}</div>
                          </div>
                        ) : (
                          <span className="text-red-600 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="p-2">{formatCurrency(lead.value)}</td>
                      <td className="p-2 text-sm text-gray-600">{lead.createdDate}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowAssignLeadModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Assign/Reassign"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAnnouncementSystem = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Internal Announcement System</h2>
        <button 
          onClick={() => setShowCreateAnnouncementModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Active Announcements"
          value={announcements.filter(a => a.isActive).length.toString()}
          change="+2 this week"
          icon={<Bell className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Acknowledgments"
          value={announcements.reduce((acc, a) => acc + a.readReceipts.filter(r => a.requiresAcknowledgment && !r.acknowledged).length, 0).toString()}
          change="-5 from yesterday"
          icon={<CheckSquare className="h-6 w-6 text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Read Rate"
          value={`${Math.round((announcements.reduce((acc, a) => acc + a.readReceipts.length, 0) / (announcements.length * 10)) * 100)}%`}
          change="+8% this month"
          icon={<Eye className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Company Announcements</h3>
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const totalEmployees = 10; // Mock total employee count
            const readCount = announcement.readReceipts.length;
            const acknowledgedCount = announcement.readReceipts.filter(r => r.acknowledged).length;
            const readPercentage = Math.round((readCount / totalEmployees) * 100);
            const acknowledgedPercentage = announcement.requiresAcknowledgment ? Math.round((acknowledgedCount / totalEmployees) * 100) : 100;

            return (
              <div key={announcement.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{announcement.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        announcement.category === 'emergency' ? 'bg-red-100 text-red-800' :
                        announcement.category === 'policy' ? 'bg-blue-100 text-blue-800' :
                        announcement.category === 'system' ? 'bg-purple-100 text-purple-800' :
                        announcement.category === 'hr' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Target: {announcement.targetAudience}</span>
                      {announcement.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="flex gap-2">
                      {announcement.attachments.map((attachment, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                          <Paperclip className="h-3 w-3" />
                          {attachment}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Read Status</span>
                      <span className="text-sm text-gray-600">{readCount}/{totalEmployees} ({readPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${readPercentage}%` }}></div>
                    </div>
                  </div>

                  {announcement.requiresAcknowledgment && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Acknowledgment Status</span>
                        <span className="text-sm text-gray-600">{acknowledgedCount}/{totalEmployees} ({acknowledgedPercentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${acknowledgedPercentage}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">Read Receipts</h5>
                    <button 
                      onClick={() => setShowViewAllReceiptsModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {announcement.readReceipts.map((receipt) => (
                      <div key={receipt.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                            {receipt.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{receipt.userName}</span>
                          <span className="text-gray-500">({receipt.userRole})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{new Date(receipt.readAt).toLocaleString()}</span>
                          {announcement.requiresAcknowledgment && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              receipt.acknowledged ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {receipt.acknowledged ? 'Acknowledged' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'sales':
        return renderSalesProcess();
      case 'management':
        return renderManagement();
      case 'quality':
        return renderQuality();
      case 'compliance':
        return renderCompliance();
      case 'security':
        return renderSecurity();
      case 'data':
        return renderDataTools();
      case 'communications':
        return renderCommunications();
      case 'monitoring':
        return renderSystemMonitoring();
      case 'operational':
        return renderOperationalIntelligence();
      case 'team':
        return renderTeamOptimization();
      case 'risk':
        return renderRiskManagement();
      case 'advanced-compliance':
        return renderAdvancedCompliance();
      case 'leads':
        return renderLeads();
      case 'announcements':
        return renderAnnouncementSystem();
      case 'onboarding':
        return <AgentOnboarding />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal Components */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Role</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Role Name"
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Role Description"
                className="w-full p-2 border rounded h-20"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add role logic here
                    setShowAddRoleModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Export</h3>
            <div className="space-y-4">
              <select className="w-full p-2 border rounded">
                <option value="">Select Data Type</option>
                <option value="clients">Clients</option>
                <option value="projects">Projects</option>
                <option value="invoices">Invoices</option>
                <option value="contracts">Contracts</option>
              </select>
              <select className="w-full p-2 border rounded">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewExportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Export logic here
                    setShowNewExportModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Campaign Name"
                className="w-full p-2 border rounded"
              />
              <select className="w-full p-2 border rounded">
                <option value="">Campaign Type</option>
                <option value="newsletter">Newsletter</option>
                <option value="promotional">Promotional</option>
                <option value="follow-up">Follow-up</option>
              </select>
              <textarea
                placeholder="Campaign Description"
                className="w-full p-2 border rounded h-20"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Campaign creation logic here
                    setShowNewCampaignModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Manual Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Description"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Assignee"
                className="w-full p-2 border rounded"
              />
              <select className="w-full p-2 border rounded">
                <option value="">Frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="number"
                placeholder="Time Spent (minutes)"
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Task creation logic here
                    setShowAddTaskModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadLeadsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Leads</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  id="lead-upload"
                />
                <label
                  htmlFor="lead-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                >
                  Choose File
                </label>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Required columns:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name</li>
                  <li>Email</li>
                  <li>Phone</li>
                  <li>Company</li>
                  <li>Source</li>
                  <li>Value (optional)</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadLeadsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Upload logic here
                    setShowUploadLeadsModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Upload Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedLead ? `Assign Lead: ${selectedLead.name}` : 'Assign Lead'}
            </h3>
            <div className="space-y-4">
              {!selectedLead && (
                <select 
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    const lead = leads.find(l => l.id === e.target.value);
                    setSelectedLead(lead || null);
                  }}
                >
                  <option value="">Select a lead...</option>
                  {leads.filter(lead => !lead.assignedAgent).map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} - {lead.company}
                    </option>
                  ))}
                </select>
              )}
              
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.leadsAssigned} leads assigned)
                  </option>
                ))}
              </select>
              
              {selectedLead && (
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-2">Lead Details:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Company:</span> {selectedLead.company}</p>
                    <p><span className="font-medium">Email:</span> {selectedLead.email}</p>
                    <p><span className="font-medium">Value:</span> {formatCurrency(selectedLead.value)}</p>
                    <p><span className="font-medium">Status:</span> {selectedLead.status}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAssignLeadModal(false);
                    setSelectedLead(null);
                    setSelectedAgent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Assignment logic here
                    setShowAssignLeadModal(false);
                    setSelectedLead(null);
                    setSelectedAgent('');
                  }}
                  disabled={!selectedLead || !selectedAgent}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Assign Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditSkillModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Skills - {selectedEmployee.employeeName}</h3>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto">
                {selectedEmployee.skills.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded mb-2">
                    <input
                      type="text"
                      value={skill.skillName}
                      className="flex-1 p-1 border rounded"
                      readOnly
                    />
                    <select 
                      className="p-1 border rounded" 
                      value={skill.level}
                      onChange={(e) => {
                        const updatedSkills = [...selectedEmployee.skills];
                        updatedSkills[index] = { ...skill, level: e.target.value };
                        setSelectedEmployee({ ...selectedEmployee, skills: updatedSkills });
                      }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowEditSkillModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save skill changes logic here
                    setShowEditSkillModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive management for your digital agency</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sales', label: 'Sales Process', icon: Target },
              { id: 'management', label: 'Management', icon: Users },
              { id: 'quality', label: 'Quality', icon: Award },
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'security', label: 'Security & Access', icon: Lock },
              { id: 'data', label: 'Data Tools', icon: Database },
              { id: 'communications', label: 'Communications', icon: Mail },
              { id: 'monitoring', label: 'System Monitoring', icon: Activity },
              { id: 'operational', label: 'Operational Intelligence', icon: Brain },
              { id: 'team', label: 'Team Optimization', icon: Wrench },
              { id: 'risk', label: 'Risk Management', icon: AlertOctagon },
              { id: 'advanced-compliance', label: 'Advanced Compliance', icon: CheckSquare },
              { id: 'leads', label: 'Lead Management', icon: UserPlus },
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'onboarding', label: 'Agent Onboarding', icon: UserCog }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeSection === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Section Content */}
        {renderActiveSection()}
      </div>

      {/* Modals */}
      {showNewProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Proposal</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Client Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Project Type"
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Project Value"
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                placeholder="Expiry Date"
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Project Description"
                className="w-full p-2 border rounded h-20"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewProposalModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Proposal creation logic here
                    setShowNewProposalModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Announcement</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Announcement Title"
                className="w-full p-2 border rounded"
              />
              <select className="w-full p-2 border rounded">
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select className="w-full p-2 border rounded">
                <option value="">Select Category</option>
                <option value="general">General</option>
                <option value="policy">Policy</option>
                <option value="system">System</option>
                <option value="hr">HR</option>
                <option value="emergency">Emergency</option>
              </select>
              <select className="w-full p-2 border rounded">
                <option value="">Target Audience</option>
                <option value="all">All Staff</option>
                <option value="management">Management</option>
                <option value="sales">Sales Team</option>
                <option value="development">Development Team</option>
                <option value="support">Support Team</option>
              </select>
              <textarea
                placeholder="Announcement Content"
                className="w-full p-2 border rounded h-24"
              />
              <input
                type="date"
                placeholder="Expiry Date (Optional)"
                className="w-full p-2 border rounded"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresAck"
                  className="rounded"
                />
                <label htmlFor="requiresAck" className="text-sm text-gray-700">
                  Requires Acknowledgment
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateAnnouncementModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Announcement creation logic here
                    setShowCreateAnnouncementModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Custom Report</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Report Name"
                className="w-full p-2 border rounded"
              />
              <select className="w-full p-2 border rounded">
                <option value="">Select Report Type</option>
                <option value="sales">Sales</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="client">Client</option>
              </select>
              <select className="w-full p-2 border rounded">
                <option value="">Select Schedule</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="email"
                placeholder="Recipients (comma-separated emails)"
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Report Description"
                className="w-full p-2 border rounded h-20"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSend"
                  className="rounded"
                />
                <label htmlFor="autoSend" className="text-sm text-gray-700">
                  Auto-send reports
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateReportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Report creation logic here
                    setShowCreateReportModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Create Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Proposal Modal */}
      {showViewProposalModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">View Proposal</h3>
              <button
                onClick={() => setShowViewProposalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <p className="p-2 bg-gray-50 rounded border">{selectedProposal.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <p className="p-2 bg-gray-50 rounded border">{selectedProposal.projectType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <p className="p-2 bg-gray-50 rounded border">${selectedProposal.value.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className={`p-2 rounded border capitalize ${
                    selectedProposal.status === 'approved' ? 'bg-green-50 text-green-800' :
                    selectedProposal.status === 'sent' ? 'bg-blue-50 text-blue-800' :
                    selectedProposal.status === 'rejected' ? 'bg-red-50 text-red-800' :
                    'bg-gray-50 text-gray-800'
                  }`}>{selectedProposal.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <p className="p-2 bg-gray-50 rounded border">{selectedProposal.createdDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <p className="p-2 bg-gray-50 rounded border">{selectedProposal.expiryDate}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowViewProposalModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              {selectedProposal.status === 'draft' && (
                <button
                  onClick={() => {
                    setShowViewProposalModal(false);
                    setShowEditProposalModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Edit Proposal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Proposal Modal */}
      {showEditProposalModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Proposal</h3>
              <button
                onClick={() => setShowEditProposalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    defaultValue={selectedProposal.clientName}
                    className="w-full p-2 border rounded"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <input
                    type="text"
                    defaultValue={selectedProposal.projectType}
                    className="w-full p-2 border rounded"
                    placeholder="Enter project type"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                  <input
                    type="number"
                    defaultValue={selectedProposal.value}
                    className="w-full p-2 border rounded"
                    placeholder="Enter proposal value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={selectedProposal.status}
                    className="w-full p-2 border rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <input
                    type="date"
                    defaultValue={selectedProposal.createdDate}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    defaultValue={selectedProposal.expiryDate}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Details</label>
                <textarea
                  className="w-full p-2 border rounded h-32"
                  placeholder="Enter detailed proposal description, scope of work, deliverables, etc."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditProposalModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save proposal logic here
                  setShowEditProposalModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Manage Permissions - {selectedRole.name}</h3>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedRole(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">{selectedRole.description}</p>
            </div>
            
            {/* Permission Categories */}
            <div className="space-y-6">
              {Object.entries(permissionCategories).map(([category, permissions]) => {
                
                
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg mb-3 text-gray-800">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={permission.id}
                            checked={selectedPermissions.includes('all') || selectedPermissions.includes(permission.id)}
                            disabled={selectedPermissions.includes('all') && permission.id !== 'all'}
                            onChange={() => handlePermissionChange(permission.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={permission.id} className="ml-2 text-sm text-gray-700">{permission.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedRole(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Create Custom Role</h3>
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="Enter role name"
                  className="w-full p-3 border rounded-lg"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe the role and its responsibilities"
                  className="w-full p-3 border rounded-lg h-24"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full p-3 border rounded-lg"
                  value={newRoleCategory}
                  onChange={(e) => setNewRoleCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="administrative">Administrative</option>
                  <option value="management">Management</option>
                  <option value="operational">Operational</option>
                  <option value="external">External</option>
                  <option value="client">Client</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Role Template</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {predefinedRoles.slice(0, 6).map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        const baseRole = predefinedRoles.find(r => r.id === role.id);
                        if (baseRole) {
                          setSelectedBaseRole(role.id);
                          setNewRolePermissions(baseRole.permissions);
                        }
                      }}
                      className={`p-3 border rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 ${
                        selectedBaseRole === role.id ? 'bg-blue-100 border-blue-400' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">{role.name}</div>
                      <div className="text-xs text-gray-600">{role.permissions.length} permissions</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Basic validation
                  if (!newRoleName || !newRoleDescription || !newRoleCategory || !selectedBaseRole) {
                    alert('Please fill all fields and select a base role.');
                    return;
                  }

                  // Create new role object
                  const newRole = {
                    id: `role_${Date.now()}`,
                    name: newRoleName,
                    description: newRoleDescription,
                    category: newRoleCategory,
                    permissions: newRolePermissions
                  };

                  // Create new role
                  // Add role creation logic here (e.g., API call)

                  // Reset form and close modal
                  setNewRoleName('');
                  setNewRoleDescription('');
                  setNewRoleCategory('');
                  setSelectedBaseRole(null);
                  setNewRolePermissions([]);
                  setShowCreateRoleModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
