"use client"

import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle, RefreshCw, BarChart2, Code, FlaskConical, Clock } from "lucide-react"
import { analyzeCodeQuality, formatCodeQualityReport, CodeQualityReport } from "../utils/codeQuality"
import { runTests, formatTestRunReport, TestRunReport } from "../utils/testRunner"
import { validateStartup, formatStartupReport, StartupValidationReport } from "../utils/startupValidator"
import { getPerformanceSnapshot, logPerformanceSnapshot, PerformanceSnapshot } from "../utils/performance"
import LoadingIndicator from "./LoadingIndicator" // Assuming you have a LoadingIndicator component

const MOCK_CODE_SNIPPET = `

interface User {
  id: string;
  name: string;
  email: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Mock fetchData since it's not available in this context
        const fetchData = async (url: string): Promise<User[]> => {
          console.log('Fetching from ' + url);
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (url === '/users') {
            return [
              { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
              { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
            ];
          }
          throw new Error('Failed to fetch data');
        };
        
        const data = await fetchData('/users');
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
`;

const MOCK_TEST_CASES = [
  "User authentication flow",
  "Data fetching and display",
  "Form submission validation",
  "API error handling",
  "Component rendering performance",
  "Database query efficiency",
  "Edge case: empty data set",
  "Edge case: invalid input",
]

const SystemStatus: React.FC = () => {
  const [startupReport, setStartupReport] = useState<StartupValidationReport | null>(null)
  const [codeQualityReport, setCodeQualityReport] = useState<CodeQualityReport | null>(null)
  const [testRunReport, setTestRunReport] = useState<TestRunReport | null>(null)
  const [performanceSnapshots, setPerformanceSnapshots] = useState<PerformanceSnapshot[]>([])
  const [loadingSection, setLoadingSection] = useState<string | null>(null)

  const runAllChecks = async () => {
    setStartupReport(null)
    setCodeQualityReport(null)
    setTestRunReport(null)
    setPerformanceSnapshots([])

    setLoadingSection("startup")
    const startup = await validateStartup()
    setStartupReport(startup)

    setLoadingSection("codeQuality")
    const codeQuality = await analyzeCodeQuality(MOCK_CODE_SNIPPET)
    setCodeQualityReport(codeQuality)

    setLoadingSection("tests")
    const tests = await runTests(MOCK_TEST_CASES)
    setTestRunReport(tests)

    setLoadingSection("performance")
    // Collect a few performance snapshots
    const snapshots = []
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate delay between snapshots
      snapshots.push(getPerformanceSnapshot(`Snapshot ${i + 1}`))
    }
    setPerformanceSnapshots(snapshots)
    // Performance snapshot collected for display

    setLoadingSection(null)
  }

  useEffect(() => {
    runAllChecks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "failure":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const renderReportSection = (title: string, icon: React.ComponentType<any>, report: any, loadingKey: string, formatFn: (report: any) => string) => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          {React.createElement(icon, { className: "w-6 h-6 text-blue-600" })}
          <span>{title}</span>
        </h2>
        {loadingSection === loadingKey && <LoadingIndicator message="Analyzing..." />}
        {report && getStatusIcon(report.overallStatus || (report.failedTests === 0 ? "success" : "failure"))}
      </div>
      {report ? (
        <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-96">{formatFn(report)}</pre>
      ) : (
        <p className="text-gray-500">Click "Run All Checks" to generate the report.</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">System Status Dashboard</h1>
          <button
            onClick={runAllChecks}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={!!loadingSection}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {loadingSection ? `Running ${loadingSection}...` : "Run All Checks"}
          </button>
        </div>

        {renderReportSection("Startup Validation", FlaskConical, startupReport, "startup", formatStartupReport)}
        {renderReportSection("Code Quality Analysis", Code, codeQualityReport, "codeQuality", formatCodeQualityReport)}
        {renderReportSection("Test Run Results", FlaskConical, testRunReport, "tests", formatTestRunReport)}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart2 className="w-6 h-6 text-blue-600" />
              <span>Performance Monitoring</span>
            </h2>
            {loadingSection === "performance" && <LoadingIndicator message="Collecting..." />}
          </div>
          {performanceSnapshots.length > 0 ? (
            <div className="space-y-4">
              {performanceSnapshots.map((snapshot, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md text-sm">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {snapshot.event || "Performance Snapshot"} ({new Date(snapshot.snapshotTime).toLocaleTimeString()}
                      )
                    </span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {snapshot.metrics.map((metric, metricIndex) => (
                      <li key={metricIndex}>
                        {metric.name}:{" "}
                        <span className="font-semibold">
                          {metric.value}
                          {metric.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Click "Run All Checks" to collect performance data.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemStatus
