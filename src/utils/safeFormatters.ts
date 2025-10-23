// utils/safeFormatters.ts
// Safe formatting utilities to prevent toLocaleString and other formatting errors

export const formatCurrency = (
  value: number | string | undefined | null,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    currency?: string
    locale?: string
  },
): string => {
  // Default options
  const defaultOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: "USD",
    locale: "en-US",
    ...options,
  }

  try {
    // Handle various input types
    if (value === null || value === undefined) {
      return "$0.00"
    }

    // Convert to number if string
    let numericValue: number
    if (typeof value === "string") {
      numericValue = Number.parseFloat(value)
      if (isNaN(numericValue)) {
        return "$0.00"
      }
    } else if (typeof value === "number") {
      numericValue = value
      if (isNaN(numericValue) || !isFinite(numericValue)) {
        return "$0.00"
      }
    } else {
      return "$0.00"
    }

    // Format the number
    if (defaultOptions.currency) {
      return new Intl.NumberFormat(defaultOptions.locale, {
        style: "currency",
        currency: defaultOptions.currency,
        minimumFractionDigits: defaultOptions.minimumFractionDigits,
        maximumFractionDigits: defaultOptions.maximumFractionDigits,
      }).format(numericValue)
    } else {
      return numericValue.toLocaleString(defaultOptions.locale, {
        minimumFractionDigits: defaultOptions.minimumFractionDigits,
        maximumFractionDigits: defaultOptions.maximumFractionDigits,
      })
    }
  } catch (error) {
    console.error("Error formatting currency:", error)
    return "$0.00"
  }
}

export const formatNumber = (
  value: number | string | undefined | null,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    locale?: string
  },
): string => {
  // Default options
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    locale: "en-US",
    ...options,
  }

  try {
    // Handle various input types
    if (value === null || value === undefined) {
      return "0"
    }

    // Convert to number if string
    let numericValue: number
    if (typeof value === "string") {
      numericValue = Number.parseFloat(value)
      if (isNaN(numericValue)) {
        return "0"
      }
    } else if (typeof value === "number") {
      numericValue = value
      if (isNaN(numericValue) || !isFinite(numericValue)) {
        return "0"
      }
    } else {
      return "0"
    }

    // Format the number
    return numericValue.toLocaleString(defaultOptions.locale, {
      minimumFractionDigits: defaultOptions.minimumFractionDigits,
      maximumFractionDigits: defaultOptions.maximumFractionDigits,
    })
  } catch (error) {
    console.error("Error formatting number:", error)
    return "0"
  }
}

// Safe date formatting
export const formatDate = (
  date: Date | string | undefined | null,
  options?: {
    dateStyle?: "full" | "long" | "medium" | "short"
    timeStyle?: "full" | "long" | "medium" | "short"
    locale?: string
  },
): string => {
  const defaultOptions = {
    dateStyle: "medium" as const,
    locale: "en-US",
    ...options,
  }

  try {
    if (!date) {
      return "No date"
    }

    let dateObj: Date
    if (typeof date === "string") {
      dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return "Invalid date"
      }
    } else if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      dateObj = date
    } else {
      return "Invalid date"
    }

    return dateObj.toLocaleDateString(defaultOptions.locale, {
      dateStyle: defaultOptions.dateStyle,
      timeStyle: options?.timeStyle,
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

// Safe calculation helper for arrays of items
export const safeCalculateTotal = <T extends Record<string, unknown>>(
  items: T[] | undefined | null,
  field: keyof T,
): number => {
  try {
    if (!items || !Array.isArray(items)) {
      return 0
    }

    return items.reduce((sum, item) => {
      if (!item || typeof item !== "object") {
        return sum
      }

      const value = item[field]
      if (value === null || value === undefined) {
        return sum
      }

      const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value))
      if (isNaN(numericValue) || !isFinite(numericValue)) {
        return sum
      }

      return sum + numericValue
    }, 0)
  } catch (error) {
    console.error("Error calculating total:", error)
    return 0
  }
}

// Safe percentage calculation
export const safeCalculatePercentage = (
  value: number | undefined | null,
  percentage: number | undefined | null,
): number => {
  try {
    const safeValue = typeof value === "number" && !isNaN(value) && isFinite(value) ? value : 0
    const safePercentage = typeof percentage === "number" && !isNaN(percentage) && isFinite(percentage) ? percentage : 0

    const result = (safeValue * safePercentage) / 100
    return isNaN(result) || !isFinite(result) ? 0 : result
  } catch (error) {
    console.error("Error calculating percentage:", error)
    return 0
  }
}

// Safe addition
export const safeAdd = (...numbers: (number | undefined | null)[]): number => {
  try {
    return numbers.reduce((sum: number, num) => {
      const safeNum = typeof num === "number" && !isNaN(num) && isFinite(num) ? num : 0
      return (sum || 0) + safeNum
    }, 0)
  } catch (error) {
    console.error("Error adding numbers:", error)
    return 0
  }
}

// Safe multiplication
export const safeMultiply = (a: number | undefined | null, b: number | undefined | null): number => {
  try {
    const safeA = typeof a === "number" && !isNaN(a) && isFinite(a) ? a : 0
    const safeB = typeof b === "number" && !isNaN(b) && isFinite(b) ? b : 0

    const result = safeA * safeB
    return isNaN(result) || !isFinite(result) ? 0 : result
  } catch (error) {
    console.error("Error multiplying numbers:", error)
    return 0
  }
}

// Safe string to number conversion
export const safeParseFloat = (value: string | number | undefined | null): number => {
  try {
    if (value === null || value === undefined) {
      return 0
    }

    if (typeof value === "number") {
      return isNaN(value) || !isFinite(value) ? 0 : value
    }

    const parsed = Number.parseFloat(String(value))
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
  } catch (error) {
    console.error("Error parsing float:", error)
    return 0
  }
}

// Safe string to integer conversion
export const safeParseInt = (value: string | number | undefined | null, radix = 10): number => {
  try {
    if (value === null || value === undefined) {
      return 0
    }

    if (typeof value === "number") {
      return isNaN(value) || !isFinite(value) ? 0 : Math.floor(value)
    }

    const parsed = Number.parseInt(String(value), radix)
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
  } catch (error) {
    console.error("Error parsing integer:", error)
    return 0
  }
}

// Safe percentage formatting
export const formatPercentage = (
  value: number | string | undefined | null,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    locale?: string
  },
): string => {
  const defaultOptions = {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    locale: "en-US",
    ...options,
  }

  try {
    if (value === null || value === undefined) {
      return "0%"
    }

    let numericValue: number
    if (typeof value === "string") {
      numericValue = Number.parseFloat(value)
      if (isNaN(numericValue)) {
        return "0%"
      }
    } else if (typeof value === "number") {
      numericValue = value
      if (isNaN(numericValue) || !isFinite(numericValue)) {
        return "0%"
      }
    } else {
      return "0%"
    }

    return new Intl.NumberFormat(defaultOptions.locale, {
      style: "percent",
      minimumFractionDigits: defaultOptions.minimumFractionDigits,
      maximumFractionDigits: defaultOptions.maximumFractionDigits,
    }).format(numericValue / 100)
  } catch (error) {
    console.error("Error formatting percentage:", error)
    return "0%"
  }
}

// Safe decimal formatting with fixed decimal places
export const formatDecimal = (value: number | string | undefined | null, decimalPlaces = 2): string => {
  try {
    if (value === null || value === undefined) {
      return "0." + "0".repeat(decimalPlaces)
    }

    let numericValue: number
    if (typeof value === "string") {
      numericValue = Number.parseFloat(value)
      if (isNaN(numericValue)) {
        return "0." + "0".repeat(decimalPlaces)
      }
    } else if (typeof value === "number") {
      numericValue = value
      if (isNaN(numericValue) || !isFinite(numericValue)) {
        return "0." + "0".repeat(decimalPlaces)
      }
    } else {
      return "0." + "0".repeat(decimalPlaces)
    }

    return numericValue.toFixed(Math.max(0, Math.floor(decimalPlaces)))
  } catch (error) {
    console.error("Error formatting decimal:", error)
    return "0." + "0".repeat(decimalPlaces)
  }
}

// Safe duration formatting (milliseconds to human readable)
export const formatDuration = (
  milliseconds: number | undefined | null,
  options?: {
    format?: "short" | "long"
    maxUnits?: number
  },
): string => {
  const defaultOptions = {
    format: "short" as const,
    maxUnits: 2,
    ...options,
  }

  try {
    if (milliseconds === null || milliseconds === undefined || isNaN(milliseconds) || !isFinite(milliseconds)) {
      return "0ms"
    }

    const ms = Math.abs(milliseconds)
    const units = [
      { name: "year", short: "y", value: 365 * 24 * 60 * 60 * 1000 },
      { name: "day", short: "d", value: 24 * 60 * 60 * 1000 },
      { name: "hour", short: "h", value: 60 * 60 * 1000 },
      { name: "minute", short: "m", value: 60 * 1000 },
      { name: "second", short: "s", value: 1000 },
      { name: "millisecond", short: "ms", value: 1 },
    ]

    const parts: string[] = []
    let remaining = ms

    for (const unit of units) {
      if (remaining >= unit.value && parts.length < defaultOptions.maxUnits) {
        const count = Math.floor(remaining / unit.value)
        remaining %= unit.value

        if (defaultOptions.format === "long") {
          parts.push(`${count} ${unit.name}${count !== 1 ? "s" : ""}`)
        } else {
          parts.push(`${count}${unit.short}`)
        }
      }
    }

    return parts.length > 0 ? parts.join(" ") : "0ms"
  } catch (error) {
    console.error("Error formatting duration:", error)
    return "0ms"
  }
}

// Safe file size formatting (bytes to human readable)
export const formatFileSize = (
  bytes: number | undefined | null,
  options?: {
    decimals?: number
    binary?: boolean
  },
): string => {
  const defaultOptions = {
    decimals: 2,
    binary: false,
    ...options,
  }

  try {
    if (bytes === null || bytes === undefined || isNaN(bytes) || !isFinite(bytes)) {
      return "0 B"
    }

    const absBytes = Math.abs(bytes)
    if (absBytes === 0) return "0 B"

    const k = defaultOptions.binary ? 1024 : 1000
    const sizes = defaultOptions.binary ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"]

    const i = Math.floor(Math.log(absBytes) / Math.log(k))
    const size = absBytes / Math.pow(k, i)

    return `${size.toFixed(defaultOptions.decimals)} ${sizes[i]}`
  } catch (error) {
    console.error("Error formatting file size:", error)
    return "0 B"
  }
}

// Safe text truncation with ellipsis
export const truncateText = (text: string | undefined | null, maxLength = 50, ellipsis = "..."): string => {
  try {
    if (!text || typeof text !== "string") {
      return ""
    }

    if (maxLength <= 0) {
      return ""
    }

    if (text.length <= maxLength) {
      return text
    }

    const truncated = text.slice(0, Math.max(0, maxLength - ellipsis.length))
    return truncated + ellipsis
  } catch (error) {
    console.error("Error truncating text:", error)
    return text || ""
  }
}
