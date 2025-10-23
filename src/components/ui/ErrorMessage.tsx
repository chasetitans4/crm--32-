import * as React from "react"

// Local utility function to avoid import issues
function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ")
}

interface ErrorMessageProps {
  message: string
  className?: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return <div className={cn("text-red-600 text-sm mt-1", className)}>{message}</div>
}

export default ErrorMessage
