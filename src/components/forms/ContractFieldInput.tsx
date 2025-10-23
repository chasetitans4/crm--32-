"use client"

import type React from "react"

// Local utility function to avoid import issues
function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ")
}

interface ContractFieldInputProps {
  type: "text" | "email" | "tel" | "number" | "date" | "textarea"
  name: string
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
  step?: string
  rows?: number
  id?: string
  "data-testid"?: string
}

const ContractFieldInput: React.FC<ContractFieldInputProps> = ({
  type,
  name,
  value,
  onChange,
  className,
  placeholder,
  required,
  disabled,
  min,
  max,
  step,
  rows,
  id,
  "data-testid": dataTestId,
}) => {
  const baseClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"

  const inputClasses = cn(baseClasses, disabled && "bg-gray-100 cursor-not-allowed", className)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  if (type === "textarea") {
    return (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        className={inputClasses}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows || 3}
        data-testid={dataTestId}
      />
    )
  }

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      className={inputClasses}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      data-testid={dataTestId}
    />
  )
}

export default ContractFieldInput
