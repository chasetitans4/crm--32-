// Temporary test file to verify cn function export
import { cn } from "./utils"

// This should work if cn is properly exported
console.log("cn function test:", cn("test-class", "another-class"))

export const testCn = () => {
  return cn("bg-red-500", "text-white")
}
