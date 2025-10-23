import { z } from "zod"

// Client schema
export const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  stage: z.string().min(1, "Stage is required"),
  value: z.string().min(1, "Value is required"),
  status: z.enum(["active", "potential", "inactive"]),
  source: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>

// Task schema
export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  relatedTo: z
    .object({
      type: z.enum(["client", "project", "internal"]),
      id: z.number().optional(),
      clientId: z.string().optional(),
      projectId: z.number().optional(),
    })
    .nullable()
    .optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

// Event schema
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["meeting", "call", "deadline", "internal"]),
  relatedTo: z
    .object({
      type: z.enum(["client", "internal"]),
      id: z.number().optional(),
    })
    .nullable()
    .optional(),
})

export type EventFormValues = z.infer<typeof eventSchema>

// Note schema
export const noteSchema = z.object({
  type: z.enum(["call", "email", "meeting"]),
  content: z.string().min(3, "Content must be at least 3 characters"),
})

export type NoteFormValues = z.infer<typeof noteSchema>

// Email template schema
export const emailTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(2, "Subject is required"),
  body: z.string().min(10, "Body must be at least 10 characters"),
})

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>

// Additional schema for Project
export const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["planned", "ongoing", "completed"]),
  client: z.number().optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
