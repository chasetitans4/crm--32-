// Temporary diagnostic file to isolate the cn function
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Test export to verify it works
export const testCnFunction = () => {
  console.log("cn function is working:", cn("test", "class"))
  return cn("bg-blue-500", "text-white", "p-4")
}
