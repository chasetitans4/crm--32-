/**
 * This utility file provides functions for exporting data in various formats.
 * It supports CSV and JSON export from an array of objects.
 */

export const importFromCSV = (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",")
        const data = lines.slice(1).map((line) => {
          const values = line.split(",")
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]
            return obj
          }, {} as Record<string, unknown>)
        })
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsText(file)
  })
}

/**
 * Converts an array of objects to a CSV string.
 * Assumes all objects have the same keys.
 * @param data The array of objects to convert.
 * @param filename The desired filename for the CSV.
 * @returns The CSV string.
 */
export function convertToCsv<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) {
    return ""
  }

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.map((header) => `"${header}"`).join(","))

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      // Handle null/undefined, escape double quotes, and wrap in quotes
      const stringValue = value === null || value === undefined ? "" : String(value)
      return `"${stringValue.replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}

/**
 * Converts an array of objects to a JSON string.
 * @param data The array of objects to convert.
 * @returns The JSON string.
 */
export function convertToJson<T extends Record<string, unknown>>(data: T[]): string {
  return JSON.stringify(data, null, 2) // Pretty print with 2 space indentation
}

/**
 * Initiates a download of a string as a file.
 * @param content The string content to download.
 * @param filename The desired filename (e.g., "data.csv", "data.json").
 * @param mimeType The MIME type of the file (e.g., "text/csv", "application/json").
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url) // Clean up the URL object
}

/**
 * Exports an array of objects to a CSV file.
 * @param data The array of objects to export.
 * @param filename The desired filename (e.g., "my_data.csv").
 */
export function exportToCsv<T extends Record<string, unknown>>(data: T[], filename = "export.csv"): void {
  const csvContent = convertToCsv(data)
  downloadFile(csvContent, filename, "text/csv")
}

/**
 * Exports an array of objects to a JSON file.
 * @param data The array of objects to export.
 * @param filename The desired filename (e.g., "my_data.json").
 */
export function exportToJson<T extends Record<string, unknown>>(data: T[], filename = "export.json"): void {
  const jsonContent = convertToJson(data)
  downloadFile(jsonContent, filename, "application/json")
}

/**
 * A simple function to demonstrate data export.
 */
export function testDataExport(): void {
  const mockUsers = [
    { id: 1, name: "Alice Smith", email: "alice@example.com", age: 30 },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", age: 24 },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 35, notes: 'Likes coffee, "very" particular.' },
    { id: 4, name: "Diana Prince", email: "diana@example.com", age: null }, // Test null value
  ]

  console.log("--- Testing Data Export ---")

  console.log("\nCSV Content Preview:")
  const csvPreview = convertToCsv(mockUsers)
  console.log(csvPreview)

  console.log("\nJSON Content Preview:")
  const jsonPreview = convertToJson(mockUsers)
  console.log(jsonPreview)

  // To actually test download, you'd need to call these in a browser environment
  // console.log("\nAttempting to download mock_users.csv...");
  // exportToCsv(mockUsers, "mock_users.csv");

  // console.log("\nAttempting to download mock_users.json...");
  // exportToJson(mockUsers, "mock_users.json");

  console.log("\nData export functions are ready. Check console for previews or uncomment download calls in a browser.")
}
