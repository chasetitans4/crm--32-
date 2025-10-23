// src/utils/testRunner.ts

/**
 * This utility file provides functions for simulating and managing test runs.
 * In a real application, this would integrate with a testing framework like Jest or React Testing Library.
 */

/**
 * Represents the result of a single test case.
 */
export interface TestCaseResult {
  name: string
  status: "passed" | "failed" | "skipped"
  duration: number // in milliseconds
  errorMessage?: string
}

/**
 * Represents the overall report of a test run.
 */
export interface TestRunReport {
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  totalDuration: number // in milliseconds
  results: TestCaseResult[]
  timestamp: string
}

/**
 * Simulates running a set of test cases.
 * @param testCases An array of test case names to simulate.
 * @returns A promise that resolves with a TestRunReport.
 */
export async function runTests(testCases: string[]): Promise<TestRunReport> {
  return new Promise((resolve) => {
    const results: TestCaseResult[] = []
    let passedCount = 0
    let failedCount = 0
    let skippedCount = 0
    let totalDuration = 0

    testCases.forEach((testName) => {
      const duration = Math.floor(Math.random() * 100) + 10 // 10-110ms
      totalDuration += duration

      const randomStatus = Math.random()
      let status: TestCaseResult["status"]
      let errorMessage: string | undefined

      if (randomStatus < 0.8) {
        // 80% pass rate
        status = "passed"
        passedCount++
      } else if (randomStatus < 0.95) {
        // 15% fail rate
        status = "failed"
        failedCount++
        errorMessage = `Assertion failed for ${testName}: Expected true to be false.`
      } else {
        // 5% skip rate
        status = "skipped"
        skippedCount++
      }

      results.push({
        name: testName,
        status,
        duration,
        errorMessage,
      })
    })

    const report: TestRunReport = {
      totalTests: testCases.length,
      passedTests: passedCount,
      failedTests: failedCount,
      skippedTests: skippedCount,
      totalDuration: Number.parseFloat(totalDuration.toFixed(2)),
      results: results,
      timestamp: new Date().toISOString(),
    }

    setTimeout(() => resolve(report), 1000) // Simulate test run duration
  })
}

/**
 * Formats a test run report into a human-readable string.
 * @param report The TestRunReport to format.
 * @returns A formatted string summary of the test run.
 */
export function formatTestRunReport(report: TestRunReport): string {
  let summary = `Test Run Report (Generated: ${new Date(report.timestamp).toLocaleString()}):\n`
  summary += `Total Tests: ${report.totalTests}\n`
  summary += `Passed: ${report.passedTests}\n`
  summary += `Failed: ${report.failedTests}\n`
  summary += `Skipped: ${report.skippedTests}\n`
  summary += `Total Duration: ${report.totalDuration}ms\n\n`

  if (report.results.length > 0) {
    summary += "Individual Test Results:\n"
    report.results.forEach((result, index) => {
      summary += `${index + 1}. [${result.status.toUpperCase()}] ${result.name} (${result.duration}ms)`
      if (result.errorMessage) {
        summary += ` - Error: ${result.errorMessage}`
      }
      summary += "\n"
    })
  } else {
    summary += "No test results to display.\n"
  }
  return summary
}

/**
 * Determines if a test run was successful (all tests passed).
 * @param report The TestRunReport to check.
 * @returns True if all tests passed, false otherwise.
 */
export function isTestRunSuccessful(report: TestRunReport): boolean {
  return report.failedTests === 0 && report.totalTests > 0
}
