"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface UseDataFetchingOptions<T> {
  initialData?: T
  fetchOnMount?: boolean
  retryAttempts?: number
  retryDelay?: number
  cacheKey?: string
  cacheDuration?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  dependencies?: any[]
}

export interface UseDataFetchingReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  mutate: (newData: T | ((prevData: T | null) => T)) => void
  reset: () => void
  retry: () => Promise<void>
  isRetrying: boolean
  retryCount: number
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; duration: number }>()

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  const isExpired = Date.now() - cached.timestamp > cached.duration
  if (isExpired) {
    cache.delete(key)
    return null
  }
  
  return cached.data
}

function setCachedData<T>(key: string, data: T, duration: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration
  })
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingReturn<T> {
  const {
    initialData = null,
    fetchOnMount = true,
    retryAttempts = 3,
    retryDelay = 1000,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError,
    dependencies = []
  } = options

  const [data, setData] = useState<T | null>(() => {
    if (cacheKey) {
      const cached = getCachedData<T>(cacheKey)
      if (cached) return cached
    }
    return initialData
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  const fetchFunctionRef = useRef(fetchFunction)
  const mountedRef = useRef(true)
  
  // Update function ref when it changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction
  }, [fetchFunction])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const executeWithRetry = useCallback(async (
    operation: () => Promise<T>,
    attempts: number = retryAttempts
  ): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 0; attempt <= attempts; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true)
          setRetryCount(attempt)
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        }
        
        const result = await operation()
        
        if (mountedRef.current) {
          setIsRetrying(false)
          setRetryCount(0)
        }
        
        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        
        if (attempt === attempts) {
          if (mountedRef.current) {
            setIsRetrying(false)
            setRetryCount(0)
          }
          throw lastError
        }
      }
    }
    
    throw lastError!
  }, [retryAttempts, retryDelay])

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await executeWithRetry(fetchFunctionRef.current)
      
      if (!mountedRef.current) return
      
      setData(result)
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        setCachedData(cacheKey, result, cacheDuration)
      }
      
      onSuccess?.(result)
    } catch (err) {
      if (!mountedRef.current) return
      
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [cacheKey, cacheDuration, onSuccess, onError, executeWithRetry])

  const refetch = useCallback(async () => {
    // Clear cache before refetching
    if (cacheKey) {
      cache.delete(cacheKey)
    }
    await fetchData()
  }, [fetchData, cacheKey])

  const mutate = useCallback((newData: T | ((prevData: T | null) => T)) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as (prevData: T | null) => T)(data)
      : newData
    
    setData(updatedData)
    
    // Update cache
    if (cacheKey) {
      setCachedData(cacheKey, updatedData, cacheDuration)
    }
  }, [data, cacheKey, cacheDuration])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
    setIsRetrying(false)
    setRetryCount(0)
    
    // Clear cache
    if (cacheKey) {
      cache.delete(cacheKey)
    }
  }, [initialData, cacheKey])

  const retry = useCallback(async () => {
    if (error) {
      await fetchData()
    }
  }, [error, fetchData])

  // Fetch data on mount or when dependencies change
  useEffect(() => {
    if (fetchOnMount) {
      fetchData()
    }
  }, [fetchOnMount, fetchData, dependencies])

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    reset,
    retry,
    isRetrying,
    retryCount
  }
}

// Specialized hooks for common patterns
export function useApiCall<T>(
  url: string,
  options: RequestInit = {},
  hookOptions: UseDataFetchingOptions<T> = {}
) {
  const optionsString = JSON.stringify(options)
  
  const fetchFunction = useCallback(async (): Promise<T> => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }, [url, options])

  return useDataFetching(fetchFunction, {
    cacheKey: `api-${url}-${optionsString}`,
    ...hookOptions
  })
}

export function useLocalStorageData<T>(
  key: string,
  defaultValue: T,
  hookOptions: Omit<UseDataFetchingOptions<T>, 'fetchOnMount'> = {}
) {
  const fetchFunction = useCallback(async (): Promise<T> => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Failed to parse localStorage item '${key}':`, error)
      return defaultValue
    }
  }, [key, defaultValue])

  const result = useDataFetching(fetchFunction, {
    fetchOnMount: true,
    ...hookOptions
  })

  // Override mutate to also update localStorage
  const originalMutate = result.mutate
  const mutate = useCallback((newData: T | ((prevData: T | null) => T)) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as (prevData: T | null) => T)(result.data)
      : newData
    
    try {
      localStorage.setItem(key, JSON.stringify(updatedData))
    } catch (error) {
      console.warn(`Failed to save to localStorage '${key}':`, error)
    }
    
    originalMutate(newData)
  }, [key, result.data, originalMutate])

  return {
    ...result,
    mutate
  }
}

// Hook for paginated data
export interface UsePaginatedDataOptions<T> extends UseDataFetchingOptions<T[]> {
  pageSize?: number
  initialPage?: number
}

export interface UsePaginatedDataReturn<T> extends Omit<UseDataFetchingReturn<T[]>, 'data'> {
  data: T[]
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
}

export function usePaginatedData<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataReturn<T> {
  const {
    pageSize: initialPageSize = 10,
    initialPage = 1,
    ...hookOptions
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)

  const paginatedFetchFunction = useCallback(async (): Promise<T[]> => {
    const result = await fetchFunction(currentPage, pageSize)
    setTotalItems(result.total)
    return result.data
  }, [fetchFunction, currentPage, pageSize])

  // Extract complex expression for dependency array
  const paginatedDependencies = [currentPage, pageSize, ...(hookOptions.dependencies || [])]
  
  const dataResult = useDataFetching(paginatedFetchFunction, {
    ...hookOptions,
    dependencies: paginatedDependencies
  })

  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  return {
    ...dataResult,
    data: dataResult.data || [],
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    pageSize,
    setPageSize: handleSetPageSize
  }
}

export default useDataFetching