export interface CreditRepairClient {
  creditScore: number
  negativeItems: number
  status: "active" | "inactive" | "completed"
  enrollmentDate: string
  completionDate?: string
  // Additional fields can be added here if necessary
}
