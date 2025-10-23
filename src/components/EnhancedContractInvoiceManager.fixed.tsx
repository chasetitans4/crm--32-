import React, { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Link,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

// Type/Interface definitions
interface Quote {
  id: string;
  businessName: string;
  status: "draft" | "sent" | "approved" | "rejected" | "accepted";
  total: number;
  createdAt: string;
  quoteId: string;
  features: string[];
  totalHours: number;
  finalPrice: number;
}

interface Contract {
  id: string;
  quoteId: string;
  contractTitle: string;
  status: "draft" | "sent" | "signed" | "active" | "completed" | "terminated";
  totalAmount: number;
  createdAt: string;
}

interface Invoice {
  id: string;
  contractId: string;
  invoiceNumber: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  totalAmount: number;
  dueDate: Date;
  items: any[];
  subtotal: number;
  tax: number;
  notes?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: Date;
  clientId: string;
}

interface DashboardStats {
  totalQuotes: number;
  totalContracts: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingPayments: number;
  activeProjects: number;
  conversionRate: number;
  averageProjectValue: number;
}

interface ConversionFlow {
  step: "select_quote" | "configure_contract" | "setup_payments" | "review" | "complete";
  selectedQuote?: Quote;
  conversionOptions: ConversionOptions;
  previewResult?: ConversionResult;
  errors: string[];
}

interface EnhancedContract {
  id: string;
  contractNumber: string;
  quoteId?: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  contractTitle: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paymentSchedule: string;
  scopeOfWork: string;
  projectDetails: {
    title: string;
    description: string;
    scope: string[];
    deliverables: string[];
    timeline: string;
    startDate: string;
    endDate: string;
  };
  paymentStructure: {
    type: "single" | "deposit_final" | "milestone" | "progress";
    totalAmount: number;
    currency: string;
    schedule: PaymentMilestone[];
  };
  updatedAt: string;
}

interface UnifiedInvoice {
  id: string;
  invoiceNumber: string;
  contractId?: string;
  quoteId?: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceType: "deposit" | "milestone" | "final" | "progress" | "custom";
  items: any[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  issueDate: Date;
  dueDate: Date;
  notes?: string;
}

interface ConversionResult {
  contract: EnhancedContract;
  invoices: UnifiedInvoice[];
  paymentSchedule: PaymentMilestone[];
  summary: {
    totalAmount: number;
    numberOfInvoices: number;
    firstInvoiceAmount: number;
    estimatedCompletionDate: string;
    preservedQuoteData: boolean;
  };
}

interface ConversionOptions {
  templateId?: string;
  paymentStructure?: "single" | "deposit_final" | "milestone" | "progress";
  customMilestones?: Partial<PaymentMilestone>[];
  taxRate?: number;
  paymentTerms?: string;
  includeDetailedItems?: boolean;
  autoGenerateInvoices?: boolean;
  userId?: string;
}

interface PaymentMilestone {
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "invoiced";
}

// Mock service implementations
const EnhancedContractTemplateService = {
  getTemplate: (id: string) => ({
    id,
    name: "Standard Web Development Contract",
    content: "This is a standard contract template.",
  }),
};

class EnhancedQuoteConverter {
  static validateConversionOptions(options: ConversionOptions) {
    const errors: string[] = [];
    if (!options.paymentStructure) {
      errors.push("Payment structure is required.");
    }
    if (options.taxRate === undefined || options.taxRate < 0) {
      errors.push("A valid tax rate is required.");
    }
    return { isValid: errors.length === 0, errors };
  }

  static convertQuoteToContractAndInvoices(
    quote: Quote,
    options: ConversionOptions
  ): ConversionResult {
    const contractId = `contract-${Date.now()}`;
    const contract: EnhancedContract = {
      id: contractId,
      contractNumber: `CN-${Date.now()}`,
      quoteId: quote.id,
      clientId: "client-123",
      clientName: "Client Name",
      clientEmail: "client@example.com",
      contractTitle: `Web Development for ${quote.businessName}`,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 90)),
      totalAmount: quote.total,
      paymentSchedule: "Milestones",
      scopeOfWork: "Scope of work based on quote.",
      projectDetails: {
        title: `Web Development for ${quote.businessName}`,
        description: "Project description.",
        scope: ["Design", "Development", "Deployment"],
        deliverables: ["Complete website", "Source code"],
        timeline: "90 days",
        startDate: new Date().toISOString(),
        endDate: new Date(
          new Date().setDate(new Date().getDate() + 90)
        ).toISOString(),
      },
      paymentStructure: {
        type: "milestone",
        totalAmount: quote.total,
        currency: "USD",
        schedule: [
          {
            name: "Deposit",
            percentage: 50,
            amount: quote.total / 2,
            dueDate: new Date().toISOString(),
            status: "pending",
          },
          {
            name: "Final Payment",
            percentage: 50,
            amount: quote.total / 2,
            dueDate: new Date(
              new Date().setDate(new Date().getDate() + 90)
            ).toISOString(),
            status: "pending",
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    };

    const invoices: UnifiedInvoice[] = contract.paymentStructure.schedule.map(
      (milestone, index) => ({
        id: `inv-${Date.now()}-${index}`,
        invoiceNumber: `INV-${Date.now()}-${index}`,
        contractId: contract.id,
        quoteId: quote.id,
        clientId: "client-123",
        clientName: "Client Name",
        clientEmail: "client@example.com",
        clientAddress: "123 Client St, City, State, 12345",
        invoiceType: "milestone",
        items: [
          {
            id: `item-${index}`,
            description: milestone.name,
            quantity: 1,
            unitPrice: milestone.amount,
            total: milestone.amount,
          },
        ],
        subtotal: milestone.amount,
        tax: 0,
        totalAmount: milestone.amount,
        amountPaid: 0,
        amountDue: milestone.amount,
        status: "draft",
        issueDate: new Date(),
        dueDate: new Date(milestone.dueDate),
      })
    );

    return {
      contract,
      invoices,
      paymentSchedule: contract.paymentStructure.schedule,
      summary: {
        totalAmount: contract.totalAmount,
        numberOfInvoices: invoices.length,
        firstInvoiceAmount: invoices[0]?.totalAmount || 0,
        estimatedCompletionDate: contract.projectDetails.endDate,
        preservedQuoteData: true,
      },
    };
  }
}

// Mock context/hook implementations
const mockDispatch = (action: any) => {
  console.log("Dispatching action:", action);
};

const useAppContext = () => ({
  state: {
    quotes: [
      {
        id: "quote-1",
        businessName: "Innovate LLC",
        status: "approved",
        total: 5000,
        createdAt: "2023-10-01",
        quoteId: "Q-001",
        features: ["Feature A", "Feature B"],
        totalHours: 100,
        finalPrice: 5000,
      },
      {
        id: "quote-2",
        businessName: "Synergy Corp",
        status: "accepted",
        total: 8000,
        createdAt: "2023-10-05",
        quoteId: "Q-002",
        features: ["Feature C", "Feature D"],
        totalHours: 150,
        finalPrice: 8000,
      },
    ] as Quote[],
    contracts: [] as Contract[],
    invoices: [] as Invoice[],
  },
  dispatch: mockDispatch,
});

const useAuth = () => ({
  user: { id: "user-123", name: "Test User", role: "admin" },
});

const useRoleAccess = (role: string) => ({
  hasAccess: role === "Admin",
});

const useToast = () => ({
  showSuccess: (message: string) => console.log(`Success: ${message}`),
  showError: (message: string) => console.error(`Error: ${message}`),
});

// UnifiedInvoiceSystem component removed - functionality integrated into main component

// Main component implementation
const EnhancedContractInvoiceManager: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user } = useAuth();
  const { hasAccess: isAdmin } = useRoleAccess("Admin");
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "quotes" | "contracts" | "invoices" | "conversion"
  >("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);

  const [conversionFlow, setConversionFlow] = useState<ConversionFlow>({
    step: "select_quote",
    conversionOptions: {
      paymentStructure: "milestone",
      taxRate: 0.0875,
      paymentTerms: "Net 30",
      includeDetailedItems: true,
      autoGenerateInvoices: true,
      userId: user?.id,
    },
    errors: [],
  });

  const [enhancedContracts, setEnhancedContracts] = useState<EnhancedContract[]>([]);
  const [unifiedInvoices, setUnifiedInvoices] = useState<UnifiedInvoice[]>([]);

  const dashboardStats = useMemo((): DashboardStats => {
    const totalQuotes = state.quotes.length;
    const totalContracts = state.contracts.length;
    const totalInvoices = state.invoices.length;
    const totalRevenue = state.invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((acc, inv) => acc + inv.totalAmount, 0);
    const pendingPayments = state.invoices
      .filter((inv) => inv.status === "Sent" || inv.status === "Overdue")
      .reduce((acc, inv) => acc + inv.totalAmount, 0);
    const activeProjects = state.contracts.filter(
      (c) => c.status === "active"
    ).length;
    const conversionRate =
      totalQuotes > 0 ? (totalContracts / totalQuotes) * 100 : 0;
    const averageProjectValue =
      totalContracts > 0
        ? state.contracts.reduce((acc, c) => acc + c.totalAmount, 0) /
          totalContracts
        : 0;

    return {
      totalQuotes,
      totalContracts,
      totalInvoices,
      totalRevenue,
      pendingPayments,
      activeProjects,
      conversionRate,
      averageProjectValue,
    };
  }, [state.quotes, state.contracts, state.invoices]);

  const availableQuotes = useMemo(() => {
    return state.quotes.filter((quote) => {
      const hasContract = state.contracts.some(
        (contract) => contract.quoteId === quote.id
      );
      return (
        (quote.status === "approved" || quote.status === "accepted") &&
        !hasContract
      );
    });
  }, [state.quotes, state.contracts]);

  const handleStartConversion = useCallback((quote: Quote) => {
    setConversionFlow((prev) => ({
      ...prev,
      step: "configure_contract",
      selectedQuote: quote,
      errors: [],
    }));
    setShowConversionModal(true);
  }, []);

  const processConversion = useCallback(async () => {
    if (!conversionFlow.selectedQuote) return;

    setIsLoading(true);
    try {
      const validation = EnhancedQuoteConverter.validateConversionOptions(
        conversionFlow.conversionOptions
      );
      if (!validation.isValid) {
        setConversionFlow((prev) => ({ ...prev, errors: validation.errors }));
        setIsLoading(false);
        return;
      }

      const result = EnhancedQuoteConverter.convertQuoteToContractAndInvoices(
        conversionFlow.selectedQuote,
        conversionFlow.conversionOptions
      );

      const convertedContract: Contract = {
        id: result.contract.id,
        quoteId: result.contract.quoteId || "",
        contractTitle: result.contract.contractTitle,
        status: "active",
        totalAmount: result.contract.totalAmount,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_CONTRACT", payload: convertedContract });

      result.invoices.forEach((invoice) => {
        const standardInvoice: Invoice = {
          id: invoice.id,
          contractId: invoice.contractId || "",
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId || "",
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          items: invoice.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            price: item.unitPrice,
            total: item.total,
          })),
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          totalAmount: invoice.totalAmount,
          notes: invoice.notes,
          status:
            invoice.status === "draft"
              ? "Draft"
              : invoice.status === "sent"
              ? "Sent"
              : invoice.status === "paid"
              ? "Paid"
              : invoice.status === "overdue"
              ? "Overdue"
              : "Draft",
        };
        dispatch({ type: "ADD_INVOICE", payload: standardInvoice });
      });

      setEnhancedContracts((prev) => [...prev, result.contract]);
      setUnifiedInvoices((prev) => [...prev, ...result.invoices]);

      setConversionFlow({
        step: "select_quote",
        conversionOptions: {
          paymentStructure: "milestone",
          taxRate: 0.0875,
          paymentTerms: "Net 30",
          includeDetailedItems: true,
          autoGenerateInvoices: true,
          userId: user?.id,
        },
        errors: [],
      });
      setShowConversionModal(false);
      showSuccess("Conversion successful!");
    } catch (error) {
      showError("Conversion failed. Please try again.");
      setConversionFlow((prev) => ({
        ...prev,
        errors: ["An unexpected error occurred."],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [conversionFlow, dispatch, showError, showSuccess, user?.id]);

  const generatePreview = useCallback(() => {
    if (!conversionFlow.selectedQuote) return;
    try {
      const result = EnhancedQuoteConverter.convertQuoteToContractAndInvoices(
        conversionFlow.selectedQuote,
        conversionFlow.conversionOptions
      );
      setConversionFlow((prev) => ({
        ...prev,
        previewResult: result,
        step: "review",
      }));
    } catch (error) {
      showError("Failed to generate preview.");
    }
  }, [conversionFlow, showError]);

  const renderDashboard = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Quotes</h3>
          <p className="text-2xl font-semibold">
            {dashboardStats.totalQuotes}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Contracts
          </h3>
          <p className="text-2xl font-semibold">
            {dashboardStats.totalContracts}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-semibold">
            ${dashboardStats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Conversion Rate
          </h3>
          <p className="text-2xl font-semibold">
            {dashboardStats.conversionRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );

  const renderConversionFlow = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Quote to Contract Conversion</h2>
      <div className="space-y-4">
        {availableQuotes.map((quote) => (
          <div
            key={quote.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-semibold">{quote.businessName}</p>
              <p className="text-sm text-gray-500">
                Total: ${quote.total.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleStartConversion(quote)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Convert
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contract & Invoice Manager</h1>
        {isAdmin && (
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="mr-2 h-4 w-4" /> New
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("conversion")}
              className={`${
                activeTab === "conversion"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Quote Conversion
            </button>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`${
                activeTab === "contracts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`${
                activeTab === "invoices"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Unified Invoices
            </button>
          </nav>
        </div>
      </div>

      <div>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "conversion" && renderConversionFlow()}
        {activeTab === "contracts" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contracts
            </h2>
            <p>Contracts management interface will be implemented here.</p>
          </div>
        )}
        {activeTab === "invoices" && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Management</h3>
            <p>Invoice management interface will be implemented here.</p>
          </div>
        )}
      </div>

      {showConversionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Convert Quote to Contract:{" "}
                {conversionFlow.selectedQuote?.businessName}
              </h3>
              <button
                onClick={() => setShowConversionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {conversionFlow.errors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <ul>
                  {conversionFlow.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {conversionFlow.step === "configure_contract" && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Structure
                  </label>
                  <select
                    value={conversionFlow.conversionOptions.paymentStructure}
                    onChange={(e) =>
                      setConversionFlow((prev) => ({
                        ...prev,
                        conversionOptions: {
                          ...prev.conversionOptions,
                          paymentStructure: e.target.value as any,
                        },
                      }))
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="deposit_final">Deposit + Final</option>
                    <option value="single">Single Payment</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={generatePreview}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Generate Preview
                  </button>
                </div>
              </div>
            )}
            {conversionFlow.step === "review" &&
              conversionFlow.previewResult && (
                <div>
                  <h4 className="font-semibold">Review Conversion</h4>
                  <p>
                    Total Amount: $
                    {conversionFlow.previewResult.summary.totalAmount.toLocaleString()}
                  </p>
                  <p>
                    Number of Invoices:{" "}
                    {conversionFlow.previewResult.summary.numberOfInvoices}
                  </p>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={processConversion}
                      disabled={isLoading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg"
                    >
                      {isLoading ? "Processing..." : "Confirm & Convert"}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components (StatusBadge, etc.)
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  const statusMap: { [key: string]: { text: string; bg: string } } = {
    draft: { text: "text-gray-800", bg: "bg-gray-100" },
    sent: { text: "text-blue-800", bg: "bg-blue-100" },
    paid: { text: "text-green-800", bg: "bg-green-100" },
    overdue: { text: "text-red-800", bg: "bg-red-100" },
    approved: { text: "text-green-800", bg: "bg-green-100" },
    accepted: { text: "text-green-800", bg: "bg-green-100" },
    active: { text: "text-blue-800", bg: "bg-blue-100" },
    completed: { text: "text-purple-800", bg: "bg-purple-100" },
  };

  const { text, bg } =
    statusMap[status.toLowerCase()] || statusMap["draft"];

  return <span className={`${baseClasses} ${text} ${bg}`}>{status}</span>;
};

export default EnhancedContractInvoiceManager;