import { cn } from "./utils"

type VariantConfig = {
  variants?: Record<string, Record<string, string>>
  defaultVariants?: Record<string, string>
}

export type VariantProps<T extends (...args: any) => any> = {
  [K in keyof Parameters<T>[0]]?: Parameters<T>[0][K] extends Record<string, any> ? keyof Parameters<T>[0][K] : never
}

export function cva(base: string, config?: VariantConfig) {
  return (props?: Record<string, any>) => {
    if (!props || !config?.variants) return base

    const classes = [base]

    // Apply default variants first
    if (config.defaultVariants) {
      for (const [key, value] of Object.entries(config.defaultVariants)) {
        if (config.variants[key]?.[value]) {
          classes.push(config.variants[key][value])
        }
      }
    }

    // Apply provided variants (overrides defaults)
    for (const [key, value] of Object.entries(props)) {
      if (value && config.variants[key]?.[value]) {
        // Remove default variant if exists
        const defaultValue = config.defaultVariants?.[key]
        if (defaultValue && config.variants[key]?.[defaultValue]) {
          const defaultClass = config.variants[key][defaultValue]
          const index = classes.indexOf(defaultClass)
          if (index > -1) {
            classes.splice(index, 1)
          }
        }
        classes.push(config.variants[key][value])
      }
    }

    return cn(...classes)
  }
}
