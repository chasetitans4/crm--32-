"use client"

import * as React from "react"
import { FileCheck, DollarSign } from "lucide-react"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import FormSection from "./FormSection"
import FieldGroup from "./FieldGroup"

interface ContractTerms {
  value: number
  currency: string
  paymentSchedule: string
  terms: string
}

interface ContractTermsTabProps {
  contractTerms: ContractTerms | undefined
  errors: Record<string, string>
  warnings: Record<string, string>
  isReadOnly: boolean
  onUpdateContractTerms: (field: string, value: string | number) => void
  onBlur?: (field: string) => void
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
]

export const ContractTermsTab: React.FC<ContractTermsTabProps> = React.memo(({
  contractTerms,
  errors,
  warnings,
  isReadOnly,
  onUpdateContractTerms,
  onBlur,
}) => {
  const getFieldErrors = (section: string) => {
    return Object.keys(errors)
      .filter(key => key.startsWith(`${section}.`))
      .reduce((acc, key) => {
        acc[key] = errors[key]
        return acc
      }, {} as Record<string, string>)
  }

  const getFieldWarnings = (section: string) => {
    return Object.keys(warnings)
      .filter(key => key.startsWith(`${section}.`))
      .reduce((acc, key) => {
        acc[key] = warnings[key]
        return acc
      }, {} as Record<string, string>)
  }

  const handleFieldBlur = (field: string) => {
    if (onBlur) {
      onBlur(field)
    }
  }

  const handleValueChange = (value: string) => {
    const numericValue = parseFloat(value) || 0
    onUpdateContractTerms("value", numericValue)
  }

  return (
    <FormSection
      title="Contract Terms"
      description="Define the financial terms and conditions"
      icon={<FileCheck className="h-5 w-5" />}
      errors={getFieldErrors("contractTerms")}
      warnings={getFieldWarnings("contractTerms")}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup 
            label="Contract Value" 
            required 
            error={errors["contractTerms.value"]}
            warning={warnings["contractTerms.value"]}
          >
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                value={contractTerms?.value || ""}
                onChange={(e) => handleValueChange(e.target.value)}
                onBlur={() => handleFieldBlur("contractTerms.value")}
                placeholder="0.00"
                className="pl-10"
                min="0"
                step="0.01"
                disabled={isReadOnly}
              />
            </div>
          </FieldGroup>

          <FieldGroup 
            label="Currency" 
            required 
            error={errors["contractTerms.currency"]}
            warning={warnings["contractTerms.currency"]}
          >
            <Select
              value={contractTerms?.currency || "USD"}
              onValueChange={(value) => onUpdateContractTerms("currency", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

        <FieldGroup 
          label="Payment Schedule" 
          required 
          error={errors["contractTerms.paymentSchedule"]}
          warning={warnings["contractTerms.paymentSchedule"]}
        >
          <Textarea
            value={contractTerms?.paymentSchedule || ""}
            onChange={(e) => onUpdateContractTerms("paymentSchedule", e.target.value)}
            onBlur={() => handleFieldBlur("contractTerms.paymentSchedule")}
            placeholder="e.g., 50% upfront, 25% at milestone 1, 25% on completion"
            rows={3}
            disabled={isReadOnly}
          />
        </FieldGroup>

        <FieldGroup 
          label="Terms and Conditions" 
          required 
          error={errors["contractTerms.terms"]}
          warning={warnings["contractTerms.terms"]}
        >
          <Textarea
            value={contractTerms?.terms || ""}
            onChange={(e) => onUpdateContractTerms("terms", e.target.value)}
            onBlur={() => handleFieldBlur("contractTerms.terms")}
            placeholder="Enter detailed terms and conditions..."
            rows={6}
            disabled={isReadOnly}
          />
        </FieldGroup>
      </div>
    </FormSection>
  )
})

ContractTermsTab.displayName = "ContractTermsTab"

export default ContractTermsTab