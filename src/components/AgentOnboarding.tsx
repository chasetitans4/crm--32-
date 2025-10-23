import React, { useState } from 'react';
import {
  Mail,
  User,
  MapPin,
  Phone,
  Key,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  Send,
  UserPlus,
  Download,
  QrCode,
  Smartphone,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Settings,
  FileCheck,
  FileClock,
  FileX,
  Upload,
  Calendar,
  Users
} from 'lucide-react';

interface AgentInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'registered' | 'documents_signed' | 'completed';
  invitedAt: string;
  registeredAt?: string;
  documentsSignedAt?: string;
  completedAt?: string;
  invitedBy: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cellPhone: string;
  password: string;
  confirmPassword: string;
}

interface RequiredDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  required: boolean;
  signed: boolean;
  signedAt?: string;
  createdAt: string;
  createdBy: string;
  category: 'legal' | 'hr' | 'compliance' | 'training' | 'other';
  version: string;
}

interface AgentDocument {
  id: string;
  agentId: string;
  documentId: string;
  documentTitle: string;
  status: 'not_sent' | 'sent' | 'delivered' | 'viewed' | 'signed' | 'expired';
  sentAt?: string;
  deliveredAt?: string;
  viewedAt?: string;
  signedAt?: string;
  expiresAt?: string;
  remindersSent: number;
  lastReminderAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'legal' | 'hr' | 'compliance' | 'training' | 'other';
  required: boolean;
  version: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

const AgentOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invitations');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
  const [showDocumentTrackingModal, setShowDocumentTrackingModal] = useState(false);
  const [showAgentDocumentsModal, setShowAgentDocumentsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RequiredDocument | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentInvitation | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cellPhone: '',
    password: '',
    confirmPassword: ''
  });

  const [invitations, setInvitations] = useState<AgentInvitation[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'pending',
      invitedAt: '2024-01-15T10:30:00Z',
      invitedBy: 'Admin User'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'registered',
      invitedAt: '2024-01-14T09:15:00Z',
      registeredAt: '2024-01-14T14:20:00Z',
      invitedBy: 'Admin User'
    },
    {
      id: '3',
      email: 'mike.johnson@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      status: 'documents_signed',
      invitedAt: '2024-01-13T11:45:00Z',
      registeredAt: '2024-01-13T16:30:00Z',
      documentsSignedAt: '2024-01-13T17:15:00Z',
      invitedBy: 'Admin User'
    }
  ]);

  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([
    {
      id: '1',
      title: 'Independent Contractor Agreement',
      description: 'Standard 1099 contractor agreement outlining terms of service, deliverables, and payment.',
      content: 'This Independent Contractor Agreement (the "Agreement") is made and entered into as of the date of the last signature below (the "Effective Date"), by and between Pixel Works LLC, a [State of Incorporation] limited liability company (the "Company"), and the undersigned independent contractor (the "Contractor").\n\n1. SERVICES. The Contractor agrees to perform the services described in Exhibit A (the "Services").\n2. COMPENSATION. The Company agrees to pay the Contractor as set forth in Exhibit A. The Contractor is responsible for all taxes on income.\n3. TERM AND TERMINATION. This Agreement shall commence on the Effective Date and shall continue until terminated by either party upon [Number] days written notice. The Company may terminate this Agreement immediately for cause.\n4. CONFIDENTIALITY. The Contractor shall not disclose any proprietary or confidential information of the Company during or after the term of this Agreement.\n5. INDEPENDENT CONTRACTOR STATUS. The Contractor is an independent contractor and not an employee of the Company. The Company will not provide benefits, including health insurance, paid vacation, or any other employee benefits.\n6. INTELLECTUAL PROPERTY. All work product, ideas, and inventions created by the Contractor in connection with the Services shall be the sole and exclusive property of the Company (\'Work Product\').\n7. INDEMNIFICATION. The Contractor agrees to indemnify and hold harmless the Company from any and all claims, damages, and liabilities arising out of the Contractor\'s performance of the Services.\n8. INSURANCE. The Contractor is responsible for maintaining adequate liability, and other insurance, as appropriate for the services being provided.',
      required: true,
      signed: false,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'Admin User',
      category: 'legal',
      version: '1.2'
    },
    {
      id: '2',
      title: 'Non-Disclosure Agreement (NDA)',
      description: 'Confidentiality agreement to protect company and client information.',
      content: 'This Non-Disclosure Agreement (the "Agreement") is entered into by and between Pixel Works LLC (the "Disclosing Party") and the undersigned (the "Receiving Party").\n\n1. DEFINITION OF CONFIDENTIAL INFORMATION. "Confidential Information" includes, but is not limited to, all information not generally known to the public, in any form, including but not limited to business plans, customer lists, financial information, marketing strategies, and proprietary technology.\n2. OBLIGATIONS OF RECEIVING PARTY. The Receiving Party shall hold the Confidential Information in strict confidence and shall not disclose it to any third party without the prior written consent of the Disclosing Party. The Receiving Party shall use the Confidential Information only for the purpose of evaluating the business relationship between the parties.\n3. EXCLUSIONS. Confidential Information does not include information that (a) was publicly known at the time of disclosure, (b) becomes publicly known through no fault of the Receiving Party, (c) was in the Receiving Party\'s possession before disclosure by the Disclosing Party, or (d) is rightfully received from a third party without a duty of confidentiality.\n4. TERM. The obligations of this Agreement shall survive for a period of [Number] years from the date of disclosure.',
      required: true,
      signed: false,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'Admin User',
      category: 'legal',
      version: '1.1'
    },
    {
      id: '3',
      title: 'Form W-9',
      description: 'Request for Taxpayer Identification Number and Certification.',
      content: 'Please complete the attached Form W-9 and return it to the Company. This form is required for tax reporting purposes. Failure to provide a completed Form W-9 may result in backup withholding on payments made to you. The form can be downloaded from the IRS website.',
      required: true,
      signed: false,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'Admin User',
      category: 'compliance',
      version: '1.0'
    },
    {
      id: '4',
      title: 'Statement of Work (SOW) Template',
      description: 'A template for outlining the scope, deliverables, and timeline for specific projects.',
      content: 'This Statement of Work (\"SOW\") is entered into between Pixel Works LLC and the Contractor. This SOW is subject to the terms of the Independent Contractor Agreement.\n\n1. PROJECT NAME: [Project Name]\n2. SCOPE OF WORK: [Detailed description of work to be performed]\n3. DELIVERABLES: [List of deliverables]\n4. TIMELINE: [Project timeline and milestones]\n5. COMPENSATION: [Payment terms and schedule]',
      required: false,
      signed: false,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'Admin User',
      category: 'other',
      version: '1.0'
    },
    {
      id: '5',
      title: 'Direct Deposit Authorization',
      description: 'Authorization for direct deposit of payments for services rendered.',
      content: 'I hereby authorize Pixel Works LLC to initiate automatic deposits to my account at the financial institution named below. I also authorize the Company to make withdrawals from this account in the event that a credit entry is made in error.\n\nBank Name: [Bank Name]\nAccount Number: [Account Number]\nRouting Number: [Routing Number]\n\nThis authority will remain in effect until I have filed a new authorization, or I have given the Company [Number] days written notice.',
      required: true,
      signed: false,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'Admin User',
      category: 'hr',
      version: '1.0'
    },
    {
      id: '6',
      title: 'Data Protection Policy',
      description: 'Policy regarding the protection of personal and company data.',
      content: 'Pixel Works LLC is committed to protecting the data of our clients, contractors, and company. This policy outlines the procedures and responsibilities for managing and protecting data.\n\n1. SCOPE. This policy applies to all contractors and their handling of company, client, and personal data.\n2. DATA CLASSIFICATION. Data is classified as Public, Internal, or Confidential. All client data and non-public company data is considered Confidential.\n3. DATA HANDLING. Contractors must: (a) Only access data necessary for their work. (b) Not copy, store, or move data to unsecured or personal devices. (c) Use company-approved methods for data transfer and storage. (d) Securely delete data upon project completion.\n4. ACCESS CONTROL. Access to systems containing sensitive data is granted on a need-to-know basis and reviewed regularly.\n5. INCIDENT RESPONSE. Any suspected data breach must be reported immediately to [Contact Person/Department]. The company will follow a documented incident response plan to contain, investigate, and remediate the breach.\n6. COMPLIANCE. Contractors must comply with all applicable data protection laws and regulations (e.g., GDPR, CCPA).',
      required: true,
      signed: false,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
      category: 'compliance',
      version: '1.0'
    },
    {
      id: '7',
      title: 'Code of Conduct',
      description: 'Outlines the expected standards of behavior for all contractors.',
      content: 'This Code of Conduct applies to all independent contractors of Pixel Works LLC. We expect all contractors to maintain a high level of professionalism and integrity.\n\n1. PROFESSIONALISM AND RESPECT. Treat all clients, colleagues, and partners with respect, courtesy, and professionalism. Harassment, discrimination, and bullying in any form will not be tolerated.\n2. COMMUNICATION. All communications should be professional and timely. Use company-approved communication channels for all project-related discussions.\n3. CONFLICT OF INTEREST. Disclose any potential, actual, or perceived conflicts of interest to the Company immediately. Avoid situations where personal interests could conflict with the interests of the Company or its clients.\n4. CONFIDENTIALITY AND PRIVACY. Uphold the confidentiality and privacy of all company and client information, as outlined in the Non-Disclosure Agreement and Data Protection Policy.\n5. COMPLIANCE WITH LAWS. Comply with all applicable laws, regulations, and professional standards in the performance of your services.\n6. VIOLATIONS. Violations of this Code of Conduct may result in termination of your contract and legal action.',
      required: true,
      signed: false,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
      category: 'hr',
      version: '1.0'
    },
    {
      id: '8',
      title: 'Safety Training Manual',
      description: 'Provides essential safety guidelines for contractors.',
      content: 'This manual provides safety guidelines for contractors. While most work is remote, safety is paramount.\n\n1. ERGONOMICS. Set up your workspace to be comfortable and reduce risk of injury. This includes proper chair height, monitor placement, and keyboard/mouse positioning. Take regular breaks to stretch and move around.\n2. DIGITAL SECURITY. (a) Use strong, unique passwords for all systems and enable two-factor authentication (2FA) where available. (b) Keep your computer\'s operating system and software up to date. (c) Be vigilant against phishing scams and malware. (d) Do not install unauthorized software on devices used for company work.\n3. MENTAL HEALTH AND WELL-BEING. We encourage a healthy work-life balance. Set clear boundaries for your work hours. If you are feeling overwhelmed or stressed, please reach out to your point of contact at the company.\n4. EMERGENCY PROCEDURES. In case of a work-related emergency, contact your primary company contact. For digital security incidents, report immediately to the IT department.',
      required: true,
      signed: false,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
      category: 'training',
      version: '1.0'
    },
    {
      id: '9',
      title: 'Security Policy',
      description: 'Comprehensive guidelines for protecting sensitive information, systems, and responding to cyber threats.',
      content: 'This Security Policy outlines the mandatory requirements for protecting company, client, and personal data from unauthorized access, use, disclosure, alteration, or destruction. Compliance with this policy is a condition of your contract.\n\n1. ACCESS CONTROL & LOGIN INFORMATION\n  - 1.1. Password Security: All passwords must be a minimum of 14 characters and include a mix of uppercase letters, lowercase letters, numbers, and special symbols. Passwords must be changed every 90 days. Do not reuse passwords across different systems.\n  - 1.2. Two-Factor Authentication (2FA): 2FA must be enabled on all company-provided accounts and services (e.g., email, project management tools, code repositories). \n  - 1.3. Credential Secrecy: Never share your login credentials (passwords, API keys, access tokens) with anyone, including colleagues or IT support. Authorized support personnel will never ask for your password.\n  - 1.4. Principle of Least Privilege: You will only be granted access to the data and systems necessary to perform your job functions. Do not attempt to access unauthorized information.\n\n2. DATA HANDLING & PROTECTION\n  - 2.1. Sensitive Data: Handle all client data, financial information, intellectual property, and personal identifiable information (PII) as highly confidential. \n  - 2.2. Data Transmission: All sensitive data transmitted over public networks must be encrypted using company-approved protocols (e.g., TLS 1.2+, SSH, VPN).\n  - 2.3. Data Storage: Do not store sensitive company or client data on personal devices, personal cloud storage (e.g., personal Google Drive, Dropbox), or removable media (e.g., USB drives) unless explicitly authorized and encrypted.\n  - 2.4. Data Disposal: Securely delete all company and client data from your devices upon project completion or contract termination using approved data destruction methods.\n\n3. EMAIL & COMMUNICATION SECURITY\n  - 3.1. Phishing & Social Engineering: Be extremely vigilant against phishing attempts. Scrutinize emails for suspicious signs: unexpected sender, urgent requests for sensitive information, grammatical errors, and mismatched links. Hover over links to verify their destination before clicking.\n  - 3.2. Attachments: Do not open unexpected attachments, even from seemingly known contacts. Verify with the sender through a separate communication channel (e.g., phone call) if you are unsure.\n  - 3.3. Reporting: Immediately report any suspected phishing emails or security incidents to the designated IT Security contact. Do not forward suspicious emails to others.\n\n4. SYSTEM & DEVICE SECURITY\n  - 4.1. Software Updates: Keep the operating system, browser, and all software on your work-related devices continuously updated with the latest security patches.\n  - 4.2. Malware Protection: An approved and up-to-date antivirus and anti-malware solution must be installed and running on any device used to access company resources.\n  - 4.3. Secure Configuration: Use a firewall, disable unnecessary services, and secure your home Wi-Fi network with a strong password and WPA2/WPA3 encryption.\n  - 4.4. Unauthorized Software: Do not install or use any unauthorized or unlicensed software on devices used for work.\n\n5. PAYMENT & FINANCIAL INFORMATION\n  - 5.1. Handling: Access and handle payment information (credit cards, bank details) only within secure, designated company systems. \n  - 5.2. Communication: Never send or request payment information via unsecured channels like email, chat, or SMS. Use only approved payment processing platforms.\n\n6. INCIDENT RESPONSE\n  - 6.1. Immediate Reporting: If you suspect or confirm a security incident—such as a compromised account, malware infection, lost/stolen device, or data breach—you must report it immediately to the IT Security department within one hour of discovery.\n  - 6.2. Preserve Evidence: Do not attempt to investigate, delete, or modify files or systems after a suspected breach. Disconnect the affected device from the network if possible and await instructions.\n  - 6.3. Cooperation: Cooperate fully with the security team during any investigation.\n\n7. POLICY COMPLIANCE\n  - 7.1. Acknowledgment: You are required to read, understand, and acknowledge this policy.\n  - 7.2. Violations: Failure to comply with this Security Policy may result in disciplinary action, up to and including termination of your contract and potential legal action, depending on the severity of the violation.',
      required: true,
      signed: false,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
      category: 'compliance',
      version: '1.0'
    }
  ]);

  const [agentDocuments] = useState<AgentDocument[]>([
    {
      id: '1',
      agentId: '2',
      documentId: '1',
      documentTitle: 'Employment Agreement',
      status: 'signed',
      sentAt: '2024-01-14T15:00:00Z',
      deliveredAt: '2024-01-14T15:05:00Z',
      viewedAt: '2024-01-14T15:10:00Z',
      signedAt: '2024-01-14T16:30:00Z',
      remindersSent: 0,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: '2',
      agentId: '2',
      documentId: '2',
      documentTitle: 'Non-Disclosure Agreement',
      status: 'viewed',
      sentAt: '2024-01-14T15:00:00Z',
      deliveredAt: '2024-01-14T15:05:00Z',
      viewedAt: '2024-01-14T16:45:00Z',
      remindersSent: 1,
      lastReminderAt: '2024-01-16T10:00:00Z'
    },
    {
      id: '3',
      agentId: '3',
      documentId: '1',
      documentTitle: 'Employment Agreement',
      status: 'signed',
      sentAt: '2024-01-13T17:00:00Z',
      deliveredAt: '2024-01-13T17:02:00Z',
      viewedAt: '2024-01-13T17:05:00Z',
      signedAt: '2024-01-13T17:15:00Z',
      remindersSent: 0
    },
    {
      id: '4',
      agentId: '3',
      documentId: '2',
      documentTitle: 'Non-Disclosure Agreement',
      status: 'signed',
      sentAt: '2024-01-13T17:00:00Z',
      deliveredAt: '2024-01-13T17:02:00Z',
      viewedAt: '2024-01-13T17:05:00Z',
      signedAt: '2024-01-13T17:15:00Z',
      remindersSent: 0
    }
  ]);

  const generateUsername = (firstName: string, lastName: string): string => {
    if (!firstName || !lastName) return '';
    return `${firstName.toLowerCase()}${lastName ? lastName.charAt(0).toLowerCase() : ''}`;
  };

  const handleSendInvitation = () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) return;

    const newInvitation: AgentInvitation = {
      id: Date.now().toString(),
      email: inviteEmail,
      firstName: inviteFirstName,
      lastName: inviteLastName,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedBy: 'Current Admin'
    };

    setInvitations([...invitations, newInvitation]);
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setShowInviteModal(false);
  };

  const handleRegistration = () => {
    if (registrationData.password !== registrationData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Registration logic would go here
    // Process registration data

    setShowRegistrationForm(false);
  };

  const handleDocumentSign = (documentId: string) => {
    // Document signing logic would go here
    // Sign document
    setShowDocumentModal(false);
  };



  const handleAddDocument = (documentData: Omit<RequiredDocument, 'id'>) => {
    const newDocument: RequiredDocument = {
      ...documentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current Admin', // In real app, get from auth context
      version: '1.0',
    };
    setRequiredDocuments(prev => [...prev, newDocument]);
    setShowAddDocumentModal(false);
  };

  const handleEditDocument = (documentId: string, documentData: Partial<RequiredDocument>) => {
    setRequiredDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, ...documentData, version: (parseFloat(doc.version) + 0.1).toFixed(1) }
        : doc
    ));
    setShowEditDocumentModal(false);
  };

  const handleRemoveDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to remove this document? This action cannot be undone.')) {
      setRequiredDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  const handleSendDocumentReminder = (agentId: string, documentId: string) => {
    // Send document reminder
    // In real app, implement API call to send reminder
  };

  const getDocumentStatusForAgent = (agentId: string, documentId: string) => {
    return agentDocuments.find(ad => ad.agentId === agentId && ad.documentId === documentId);
  };

  const getAgentDocumentStats = (agentId: string) => {
    const agentDocs = agentDocuments.filter(ad => ad.agentId === agentId);
    const total = requiredDocuments.filter(doc => doc.required).length;
    const signed = agentDocs.filter(ad => ad.status === 'signed').length;
    const pending = agentDocs.filter(ad => ad.status === 'sent' || ad.status === 'delivered' || ad.status === 'viewed').length;
    
    return { total, signed, pending, completion: total > 0 ? Math.round((signed / total) * 100) : 0 };
  };

  const filteredAgentDocuments = agentDocuments.filter(ad => {
    const matchesAgent = !agentFilter || ad.agentId === agentFilter;
    const matchesDocument = !documentFilter || ad.status === documentFilter;
    return matchesAgent && matchesDocument;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      registered: { color: 'bg-blue-100 text-blue-800', icon: User, text: 'Registered' },
      documents_signed: { color: 'bg-purple-100 text-purple-800', icon: FileText, text: 'Documents Signed' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const renderInvitations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Agent Invitations</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus size={16} />
          Send Invitation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invited
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <tr key={invitation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invitation.firstName} {invitation.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invitation.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invitation.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(invitation.invitedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    Resend
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRegistrationForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Agent Registration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={registrationData.firstName}
              onChange={(e) => setRegistrationData({...registrationData, firstName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={registrationData.lastName}
              onChange={(e) => setRegistrationData({...registrationData, lastName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={registrationData.email}
              onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={registrationData.address}
              onChange={(e) => setRegistrationData({...registrationData, address: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter street address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={registrationData.city}
              onChange={(e) => setRegistrationData({...registrationData, city: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter city"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              value={registrationData.state}
              onChange={(e) => setRegistrationData({...registrationData, state: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter state"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              value={registrationData.zipCode}
              onChange={(e) => setRegistrationData({...registrationData, zipCode: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter ZIP code"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cell Phone *
            </label>
            <input
              type="tel"
              value={registrationData.cellPhone}
              onChange={(e) => setRegistrationData({...registrationData, cellPhone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter cell phone number"
            />
          </div>
          
          {registrationData.firstName && registrationData.lastName && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Username
              </label>
              <div className="p-3 bg-gray-100 rounded-lg text-gray-800 font-medium">
                {generateUsername(registrationData.firstName, registrationData.lastName)}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPasswordFields ? "text" : "password"}
                value={registrationData.password}
                onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Create password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswordFields ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type={showPasswordFields ? "text" : "password"}
              value={registrationData.confirmPassword}
              onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm password"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowRegistrationForm(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRegistration}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Register Agent
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Document Management</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {requiredDocuments.filter(doc => doc.signed).length} of {requiredDocuments.length} documents
          </span>
          <button
            onClick={() => setShowAddDocumentModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {requiredDocuments.map((document) => (
          <div key={document.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{document.title}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setShowEditDocumentModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit document"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveDocument(document.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{document.description}</p>

                <div className="flex items-center mt-2 space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    document.category === 'legal' ? 'bg-purple-100 text-purple-800' :
                    document.category === 'hr' ? 'bg-blue-100 text-blue-800' :
                    document.category === 'compliance' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {document.category}
                  </span>
                  {document.required && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                  )}
                  {document.signed ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Created by {document.createdBy} • Version {document.version} • {new Date(document.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedDocument(document);
                    setShowDocumentModal(true);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View
                </button>
                {!document.signed && (
                  <button
                    onClick={() => handleDocumentSign(document.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 inline mr-1" />
                    Sign
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocumentTracking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Document Tracking</h3>
        <div className="flex items-center space-x-4">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Agents</option>
            {invitations.filter(inv => inv.status === 'registered').map(agent => (
              <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>
            ))}
          </select>
          <select
            value={documentFilter}
            onChange={(e) => setDocumentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="viewed">Viewed</option>
            <option value="signed">Signed</option>
          </select>
        </div>
      </div>

      {/* Agent Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invitations.filter(inv => inv.status === 'registered').map(agent => {
          const stats = getAgentDocumentStats(agent.id);
          return (
            <div key={agent.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{agent.firstName} {agent.lastName}</h4>
                  <p className="text-sm text-gray-500">{agent.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedAgent(agent);
                    setShowAgentDocumentsModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span className="font-medium">{stats.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completion}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stats.signed}/{stats.total} signed</span>
                  <span>{stats.pending} pending</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Status Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Document Status Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgentDocuments.map((agentDoc) => {
                const agent = invitations.find(inv => inv.id === agentDoc.agentId);
                return (
                  <tr key={agentDoc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent?.firstName} {agent?.lastName}</div>
                        <div className="text-sm text-gray-500">{agent?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agentDoc.documentTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        agentDoc.status === 'signed' ? 'bg-green-100 text-green-800' :
                        agentDoc.status === 'viewed' ? 'bg-blue-100 text-blue-800' :
                        agentDoc.status === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {agentDoc.status === 'signed' && <FileCheck className="w-3 h-3 mr-1" />}
                        {agentDoc.status === 'viewed' && <FileClock className="w-3 h-3 mr-1" />}
                        {agentDoc.status === 'delivered' && <FileClock className="w-3 h-3 mr-1" />}
                        {agentDoc.status === 'sent' && <FileX className="w-3 h-3 mr-1" />}
                        {agentDoc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agentDoc.sentAt && new Date(agentDoc.sentAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agentDoc.signedAt ? new Date(agentDoc.signedAt).toLocaleDateString() :
                       agentDoc.viewedAt ? new Date(agentDoc.viewedAt).toLocaleDateString() :
                       agentDoc.deliveredAt ? new Date(agentDoc.deliveredAt).toLocaleDateString() :
                       'No activity'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {agentDoc.status !== 'signed' && (
                        <button
                          onClick={() => handleSendDocumentReminder(agentDoc.agentId, agentDoc.documentId)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Send Reminder
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAgent(agent!);
                          setShowDocumentTrackingModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View Details
                      </button>
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

  const renderGoogleAuth = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Google Authenticator Setup</h3>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <Shield className="mx-auto text-blue-600 mb-4" size={48} />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Two-Factor Authentication Required
              </h4>
              <p className="text-gray-600">
                For security purposes, all agents must use Google Authenticator for login verification.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone size={16} />
                Step 1: Install Google Authenticator
              </h5>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Download and install Google Authenticator on your mobile device:
                </p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
                    <Download size={14} />
                    App Store
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    <Download size={14} />
                    Google Play
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <QrCode size={16} />
                Step 2: Scan QR Code
              </h5>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Open Google Authenticator and scan this QR code:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode size={48} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">QR Code will appear here</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Key size={16} />
              Step 3: Enter Verification Code
            </h5>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
                maxLength={6}
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Verify & Complete Setup
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Enter the 6-digit code from your Google Authenticator app to complete setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Agent Onboarding</h2>
        <p className="text-gray-600 mt-2">
          Comprehensive onboarding system for new agents including invitations, registration, document signing, and security setup.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'invitations', label: 'Invitations', icon: Mail },
            { id: 'registration', label: 'Registration', icon: UserPlus },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'tracking', label: 'Document Tracking', icon: FileCheck },
            { id: 'security', label: 'Security Setup', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'invitations' && renderInvitations()}
        {activeTab === 'registration' && renderRegistrationForm()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'tracking' && renderDocumentTracking()}
        {activeTab === 'security' && renderGoogleAuth()}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Agent Invitation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send size={16} />
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Document</h3>
                <button
                  onClick={() => setShowAddDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleAddDocument({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  content: formData.get('content') as string,
                  required: formData.get('required') === 'on',
                  signed: false,
                  category: formData.get('category') as 'legal' | 'hr' | 'compliance' | 'training' | 'other',
                  version: '1.0',
                  createdAt: new Date().toISOString(),
                  createdBy: 'Admin User'
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="legal">Legal</option>
                    <option value="hr">HR</option>
                    <option value="compliance">Compliance</option>
                    <option value="training">Training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="required"
                    id="required"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                    Required for all agents
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDocumentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Document</h3>
                <button
                  onClick={() => setShowEditDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleEditDocument(selectedDocument.id, {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  content: formData.get('content') as string,
                  required: formData.get('required') === 'on',
                  category: formData.get('category') as 'legal' | 'hr' | 'compliance' | 'training' | 'other'
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedDocument.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedDocument.description}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={selectedDocument.category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="legal">Legal</option>
                    <option value="hr">HR</option>
                    <option value="compliance">Compliance</option>
                    <option value="training">Training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    defaultValue={selectedDocument.content}
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="required"
                    id="edit-required"
                    defaultChecked={selectedDocument.required}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-required" className="ml-2 block text-sm text-gray-900">
                    Required for all agents
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditDocumentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Agent Documents Modal */}
      {showAgentDocumentsModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Document Status - {selectedAgent.firstName} {selectedAgent.lastName}
                </h3>
                <button
                  onClick={() => setShowAgentDocumentsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {requiredDocuments.map(doc => {
                  const agentDoc = getDocumentStatusForAgent(selectedAgent.id, doc.id);
                  return (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          {agentDoc && (
                            <div className="mt-3 space-y-2 text-sm text-gray-500">
                              <div className="grid grid-cols-2 gap-4">
                                <div>Sent: {agentDoc.sentAt ? new Date(agentDoc.sentAt).toLocaleString() : 'Not sent'}</div>
                                <div>Delivered: {agentDoc.deliveredAt ? new Date(agentDoc.deliveredAt).toLocaleString() : 'Not delivered'}</div>
                                <div>Viewed: {agentDoc.viewedAt ? new Date(agentDoc.viewedAt).toLocaleString() : 'Not viewed'}</div>
                                <div>Signed: {agentDoc.signedAt ? new Date(agentDoc.signedAt).toLocaleString() : 'Not signed'}</div>
                              </div>
                              {agentDoc.remindersSent > 0 && (
                                <div>Reminders sent: {agentDoc.remindersSent} (Last: {agentDoc.lastReminderAt ? new Date(agentDoc.lastReminderAt).toLocaleString() : 'N/A'})</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            agentDoc?.status === 'signed' ? 'bg-green-100 text-green-800' :
                            agentDoc?.status === 'viewed' ? 'bg-blue-100 text-blue-800' :
                            agentDoc?.status === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                            agentDoc ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {agentDoc ? agentDoc.status : 'not sent'}
                          </span>
                          {agentDoc && agentDoc.status !== 'signed' && (
                            <button
                              onClick={() => handleSendDocumentReminder(selectedAgent.id, doc.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Send Reminder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAgentDocumentsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-600 mb-4">{selectedDocument.description}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedDocument.content}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {!selectedDocument.signed && (
                <button
                  onClick={() => handleDocumentSign(selectedDocument.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FileText size={16} />
                  Sign Document
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentOnboarding;
