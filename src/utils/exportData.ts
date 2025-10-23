import type { Client, Task, Event } from "../types"

export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  // Convert data to CSV format
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const cell = row[header]
          // Handle special cases like objects, arrays, etc.
          const value = typeof cell === "object" && cell !== null ? JSON.stringify(cell).replace(/"/g, '""') : cell
          return `"${value}"`
        })
        .join(","),
    ),
  ]

  const csvString = csvRows.join("\n")
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })

  // Create download link
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportClientsToCSV = (clients: Client[]) => {
  // Flatten client data for CSV export
  const flattenedData = clients.map((client) => ({
    id: client.id,
    name: client.name,
    contact: 'No contact info',
    email: client.email,
    phone: client.phone,
    stage: client.stage,
    value: client.value,
    lastContact: 'Never',
    nextFollowup: 'Not scheduled',
    status: client.status,
    source: client.source,
    projectCount: client.projects.length,
    noteCount: client.notes.length,
  }))

  exportToCSV(flattenedData, "clients-export")
}

export const exportTasksToCSV = (tasks: Task[]) => {
  // Flatten task data for CSV export
  const flattenedData = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    assignee: task.assigned_to || 'Unassigned',
    dueDate: task.due_date || 'No due date',
    status: task.status,
    priority: task.priority,
    relatedToType: (task as any).relatedTo?.type || "none",
    relatedToId: (task as any).relatedTo?.id || "",
  }))

  exportToCSV(flattenedData, "tasks-export")
}

export const exportEventsToCSV = (events: Event[]) => {
  // Flatten event data for CSV export
  const flattenedData = events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    type: event.type,
    relatedToType: event.relatedTo?.type || "none",
    relatedToId: event.relatedTo?.id || "",
  }))

  exportToCSV(flattenedData, "events-export")
}
