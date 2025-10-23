// src/utils/startupValidator.ts

/**
 * This utility file provides functions for validating application startup conditions.
 * This can include checking environment variables, database connections, API availability, etc.
 */

/**
 * Represents the result of a single startup check.
 */
export interface StartupCheckResult {
  name: string
  status: "success" | "failure" | "warning"
  message: string
}

/**
 * Represents the overall report of startup validation.
 */
export interface StartupValidationReport {
  overallStatus: "success" | "failure" | "warning"
  checks: StartupCheckResult[]
  timestamp: string
}

/**
 * Performs a series of simulated startup checks.
 * @returns A promise that resolves with a StartupValidationReport.
 */
export async function validateStartup(): Promise<StartupValidationReport> {
  const checks: StartupCheckResult[] = []

  // Simulate environment variable check
  const envCheck = await simulateCheck(
    "Environment Variables Loaded",
    Math.random() > 0.1 ? "success" : "failure",
    "Required environment variables are present.",
  )
  checks.push(envCheck)

  // Simulate API connectivity check
  const apiCheck = await simulateCheck(
    "API Connectivity",
    Math.random() > 0.05 ? "success" : "failure",
    "Backend API is reachable.",
  )
  checks.push(apiCheck)

  // Simulate database connection check
  const dbCheck = await simulateCheck(
    "Database Connection",
    Math.random() > 0.02 ? "success" : "failure",
    "Database connection established.",
  )
  checks.push(dbCheck)

  // Simulate third-party service integration check
  const thirdPartyCheck = await simulateCheck(
    "Third-Party Service (e.g., Stripe)",
    Math.random() > 0.15 ? "success" : "warning",
    "Stripe API keys are configured, but connection might be slow.",
  )
  checks.push(thirdPartyCheck)

  // Determine overall status
  let overallStatus: StartupValidationReport["overallStatus"] = "success"
  if (checks.some((check) => check.status === "failure")) {
    overallStatus = "failure"
  } else if (checks.some((check) => check.status === "warning")) {
    overallStatus = "warning"
  }

  return {
    overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Helper function to simulate an asynchronous check.
 * @param name The name of the check.
 * @param status The simulated status ("success", "failure", "warning").
 * @param message The message for the check result.
 * @returns A promise that resolves with a StartupCheckResult.
 */
async function simulateCheck(
  name: string,
  status: StartupCheckResult["status"],
  message: string,
): Promise<StartupCheckResult> {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve({ name, status, message })
      },
      Math.random() * 300 + 50,
    ) // Simulate varying check times
  })
}

/**
 * Formats a startup validation report into a human-readable string.
 * @param report The StartupValidationReport to format.
 * @returns A formatted string summary of the report.
 */
export function formatStartupReport(report: StartupValidationReport): string {
  let summary = `Application Startup Validation Report (Generated: ${new Date(report.timestamp).toLocaleString()}):\n`
  summary += `Overall Status: ${report.overallStatus.toUpperCase()}\n\n`

  summary += "Individual Checks:\n"
  report.checks.forEach((check, index) => {
    summary += `${index + 1}. [${check.status.toUpperCase()}] ${check.name}: ${check.message}\n`
  })

  if (report.overallStatus === "failure") {
    summary +=
      "\nAction Required: Critical failures detected. Please review the logs and resolve the issues before proceeding."
  } else if (report.overallStatus === "warning") {
    summary +=
      "\nReview Recommended: Warnings detected. The application may function, but some features might be impacted or require attention."
  } else {
    summary += "\nAll essential services are running correctly. Application is ready."
  }

  return summary
}
