// Zod validation schemas for WebDesignQuote component
import { z } from "zod"

export const requirementSchema = z.object({
  businessGoals: z.array(z.string()).min(1, "Please select at least one business goal"),
  targetAudience: z.string().min(1, "Please describe your target audience"),
  industry: z.string().min(1, "Please select your industry"),
  websiteType: z.string().min(1, "Please select a website type"),
  features: z.array(z.string()).min(1, "Please select at least one feature"),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  additionalRequirements: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
})

export const quoteSchema = z.object({
  requirements: requirementSchema,
  contact: contactSchema,
  estimatedCost: z.number().min(0),
  estimatedTimeline: z.string(),
  features: z.array(z.object({
    name: z.string(),
    description: z.string(),
    cost: z.number(),
    timeEstimate: z.string(),
  })),
  additionalNotes: z.string().optional(),
})

export type RequirementFormData = z.infer<typeof requirementSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type QuoteFormData = z.infer<typeof quoteSchema>