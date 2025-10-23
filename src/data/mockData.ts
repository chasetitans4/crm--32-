import type { Client, Task, Event, EmailTemplate, SalesStage } from "../types"
import type { Quote } from "../schemas/contractInvoiceSchemas"

// Sales pipeline stages
export const salesStages: SalesStage[] = [
  { id: "lead", name: "Lead", order: 1, color: "bg-gray-200", description: "Initial lead", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "qualified", name: "Qualified", order: 2, color: "bg-blue-200", description: "Qualified lead", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "discovery", name: "Discovery", order: 3, color: "bg-yellow-200", description: "Discovery phase", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "proposal", name: "Proposal", order: 4, color: "bg-orange-200", description: "Proposal sent", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "negotiation", name: "Negotiation", order: 5, color: "bg-purple-200", description: "In negotiation", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "closed-won", name: "Closed Won", order: 6, color: "bg-green-200", description: "Deal won", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "closed-lost", name: "Closed Lost", order: 7, color: "bg-red-200", description: "Deal lost", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
]

// Mock clients data
export const initialClients: Client[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    email: "john@techcorp.com",
    phone: "(555) 123-4567",
    company: "TechCorp Solutions",
    stage: "proposal",
    value: 45000,
    status: "active",
    source: "Referral",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-08T00:00:00Z",
    projects: [
      {
        id: "1",
        name: "E-commerce Redesign",
        description: "Complete redesign of the e-commerce platform with modern UI/UX",
        status: "in-progress",
        startDate: "2025-04-01",
        endDate: "2025-07-15",
        progress: 65,
        budget: 45000,
        spent: 28000,
        teamMembers: ["Alex", "Maria", "Chris"],
        milestones: [
          { id: "1", name: "Requirements Gathering", dueDate: "2025-05-01", completed: true },
          { id: "2", name: "Wireframes", dueDate: "2025-05-20", completed: true },
          { id: "3", name: "Design Approval", dueDate: "2025-06-10", completed: false },
          { id: "4", name: "Development", dueDate: "2025-06-25", completed: false },
          { id: "5", name: "Testing", dueDate: "2025-07-05", completed: false },
          { id: "6", name: "Launch", dueDate: "2025-07-15", completed: false },
        ],
        documents: [
          { id: "1", name: "proposal.pdf", url: "/documents/proposal.pdf", uploadDate: "2025-04-20" },
          { id: "2", name: "wireframes.figma", url: "/documents/wireframes.figma", uploadDate: "2025-05-15" },
          { id: "3", name: "contract-signed.pdf", url: "/documents/contract-signed.pdf", uploadDate: "2025-05-25" },
        ],
      },
    ],
    notes: [
      {
        type: "call",
        content: "Discussed timeline and budget. Client approved proposal.",
        date: "2025-05-08"
      },
      {
        type: "email",
        content: "Sent initial proposal for e-commerce redesign.",
        date: "2025-05-09"
      }
    ],
    custom_fields: {},
  },
  {
    id: "2",
    name: "StartupXYZ",
    email: "sarah@startupxyz.com",
    phone: "(555) 987-6543",
    company: "StartupXYZ",
    stage: "discovery",
    value: 25000,
    status: "potential",
    source: "Website Inquiry",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-09T00:00:00Z",
    projects: [],
    notes: [
      {
        type: "call",
        content: "Discovery call completed. Gathering requirements for MVP.",
        date: "2025-05-09"
      }
    ],
    custom_fields: {},
  },
  {
    id: "3",
    name: "Global Enterprises",
    email: "michael@globalent.com",
    phone: "(555) 345-6789",
    company: "Global Enterprises",
    stage: "closed-won",
    value: 75000,
    status: "active",
    source: "Conference",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-06T00:00:00Z",
    projects: [
      {
        id: "1",
        name: "Corporate Website Rebuild",
        description: "Complete rebuild of corporate website with enhanced functionality",
        status: "in-progress",
        startDate: "2025-04-01",
        endDate: "2025-08-30",
        progress: 30,
        budget: 75000,
        spent: 22000,
        teamMembers: ["David", "Sophia", "James"],
        milestones: [
          { id: "7", name: "Requirements Gathering", dueDate: "2025-04-15", completed: true },
          { id: "8", name: "Wireframes", dueDate: "2025-05-01", completed: true },
          { id: "9", name: "Design Approval", dueDate: "2025-05-20", completed: true },
          { id: "10", name: "Development", dueDate: "2025-07-15", completed: false },
          { id: "11", name: "Testing", dueDate: "2025-08-15", completed: false },
          { id: "12", name: "Launch", dueDate: "2025-08-30", completed: false },
        ],
        documents: [
          { id: "4", name: "global-proposal.pdf", url: "/documents/global-proposal.pdf", uploadDate: "2025-04-10" },
          { id: "5", name: "sitemap.pdf", url: "/documents/sitemap.pdf", uploadDate: "2025-04-25" },
          { id: "6", name: "branding-guidelines.pdf", url: "/documents/branding-guidelines.pdf", uploadDate: "2025-05-05" },
          { id: "7", name: "contract-signed.pdf", url: "/documents/contract-signed.pdf", uploadDate: "2025-05-10" },
        ],
      },
    ],
    notes: [
      {
        type: "email",
        content: "Sent weekly progress report.",
        date: "2025-05-06"
      },
      {
        type: "meeting",
        content: "Review of design concepts. Client liked option #2.",
        date: "2025-05-07"
      },
      {
        type: "call",
        content: "Kick-off meeting scheduled for May 2nd.",
        date: "2025-05-01"
      }
    ],
    custom_fields: {},
  },
]

// Mock tasks data
export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Prepare proposal for StartupXYZ",
    description: "Create detailed proposal for StartupXYZ project",
    assigned_to: "You",
    due_date: "2025-05-14",
    status: "pending",
    priority: "high",
    client_id: "2",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-10T00:00:00Z",
    tags: ["proposal", "client"],
    time_estimate: 4,
    time_spent: 0,
  },
  {
    id: "2",
    title: "Review design mockups for TechCorp",
    description: "Review and provide feedback on design mockups",
    assigned_to: "Maria",
    due_date: "2025-05-13",
    status: "in-progress",
    priority: "medium",
    client_id: "1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-11T00:00:00Z",
    tags: ["design", "review"],
    time_estimate: 2,
    time_spent: 1,
  },
  {
    id: "3",
    title: "Weekly progress report for Global Enterprises",
    description: "Prepare weekly progress report",
    assigned_to: "You",
    due_date: "2025-05-13",
    status: "completed",
    priority: "medium",
    client_id: "3",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-13T00:00:00Z",
    tags: ["report", "weekly"],
    time_estimate: 1,
    time_spent: 1,
  },
  {
    id: "4",
    title: "Update sitemap for Global Enterprises",
    description: "Update website sitemap structure",
    assigned_to: "James",
    due_date: "2025-05-16",
    status: "pending",
    priority: "low",
    client_id: "3",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-12T00:00:00Z",
    tags: ["sitemap", "website"],
    time_estimate: 3,
    time_spent: 0,
  },
]

// Mock events data
export const initialEvents: Event[] = [
  {
    id: "1",
    title: "Kickoff Meeting - TechCorp",
    date: "2025-05-14",
    time: "10:00 AM",
    type: "meeting",
    relatedTo: { type: "client", id: "1" },
  },
  {
    id: "2",
    title: "Discovery Call - StartupXYZ",
    date: "2025-05-15",
    time: "2:00 PM",
    type: "call",
    relatedTo: { type: "client", id: "2" },
  },
  {
    id: "3",
    title: "Design Review - Global Enterprises",
    date: "2025-05-16",
    time: "11:00 AM",
    type: "meeting",
    relatedTo: { type: "client", id: "3" },
  },
  {
    id: "4",
    title: "Weekly Team Standup",
    date: "2025-05-13",
    time: "9:30 AM",
    type: "internal",
    relatedTo: { type: "internal", id: "0" },
  },
]

// Mock quotes data
export const initialQuotes: Quote[] = [
  {
    id: "quote-1",
    status: "approved",
    businessName: "Innovate LLC",
    industry: "SaaS",
    pageCount: 10,
    features: ["User Authentication", "Dashboard", "Payment Integration"],
    timeline: "6-8 weeks",
    budget: "$20,000 - $25,000",
    finalPrice: 22500,
    totalHours: 150,
    requirements: "Build a modern, responsive web application with a focus on user experience.",
    additionalNotes: "Client wants to use a specific color palette.",
    clientId: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "quote-2",
    status: "sent",
    businessName: "Marketing Pro",
    industry: "Digital Marketing",
    pageCount: 5,
    features: ["Landing Page", "Contact Form", "Blog"],
    timeline: "2-3 weeks",
    budget: "$5,000 - $7,000",
    finalPrice: 6000,
    totalHours: 40,
    requirements: "A simple, fast-loading marketing website.",
    additionalNotes: "",
    clientId: "2",
    createdAt: new Date().toISOString(),
  },
];

// Email templates
export const initialEmailTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Initial Outreach",
    subject: "Web Development Services | [Your Company]",
    body: "Dear [Name],\n\nI hope this email finds you well. I came across [Company Name] and was impressed by your [specific detail about their business].\n\nI'm reaching out from [Your Company], where we specialize in creating custom web solutions for [industry/niche].\n\nWould you be available for a brief 15-minute call to discuss how we might be able to help improve your web presence?\n\nBest regards,\n[Your Name]",
    bodyType: "text",
    category: "client",
    variables: ["Name", "Company Name", "Your Company", "Your Name"],
    isActive: true,
    usage_count: 0,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Follow-up After Meeting",
    subject: "Thank You for Your Time | Next Steps",
    body: "Dear [Name],\n\nThank you for taking the time to meet with me today. I enjoyed learning more about [Company Name] and your specific needs regarding [specific project].\n\nAs discussed, I'll prepare a proposal outlining [specific deliverables] by [date].\n\nIn the meantime, please don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Your Name]",
    bodyType: "text",
    category: "client",
    variables: ["Name", "Company Name", "specific project", "specific deliverables", "date", "Your Name"],
    isActive: true,
    usage_count: 0,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Project Update",
    subject: "Project Update: [Project Name]",
    body: "Dear [Name],\n\nI wanted to provide you with an update on your project:\n\nCompleted:\n- [Task 1]\n- [Task 2]\n\nIn Progress:\n- [Task 3]\n- [Task 4]\n\nUp Next:\n- [Task 5]\n\nIs there anything specific you'd like us to focus on or address in the next sprint?\n\nBest regards,\n[Your Name]",
    bodyType: "text",
    category: "project",
    variables: ["Name", "Project Name", "Task 1", "Task 2", "Task 3", "Task 4", "Task 5", "Your Name"],
    isActive: true,
    usage_count: 0,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
