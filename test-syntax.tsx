import React, { memo } from "react"
import { EnhancedErrorBoundary } from "./src/components/EnhancedErrorBoundary"

const TestComponent = memo(() => {
  return (
    <div>
      <h1>Test</h1>
    </div>
  )
})

const TestWithErrorBoundary = () => (
  <EnhancedErrorBoundary>
    <TestComponent />
  </EnhancedErrorBoundary>
)

export default TestWithErrorBoundary