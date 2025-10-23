// React hooks for advanced caching integration
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache, memoryCache, cacheUtils } from '@/utils/cache';

interface UseCacheOptions {
  ttl?: number;
  enabled?: boolean;
  staleWhileRevalidate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface CacheState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: number | null;
}

// Hook for API data caching
export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    staleWhileRevalidate = true,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isStale: false,
    lastUpdated: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheKey = `api:${key}`;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let data: T;
      
      if (forceRefresh) {
        // Force refresh - bypass cache
        data = await fetcher();
        apiCache.invalidate(key);
      } else {
        // Use cache with fallback to fetcher
        data = await apiCache.get(cacheKey, fetcher);
      }

      setState({
        data,
        isLoading: false,
        error: null,
        isStale: false,
        lastUpdated: Date.now()
      });

      onSuccess?.(data);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error
        }));
        onError?.(error as Error);
      }
    }
  }, [key, fetcher, enabled, onError, onSuccess, cacheKey]);

  const invalidate = useCallback(() => {
    apiCache.invalidate(key);
    fetchData(true);
  }, [key, fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, enabled]);

  // Stale-while-revalidate logic
  useEffect(() => {
    if (!staleWhileRevalidate || !state.lastUpdated) return;

    const checkStale = () => {
      const isStale = Date.now() - state.lastUpdated! > ttl;
      if (isStale && !state.isLoading) {
        setState(prev => ({ ...prev, isStale: true }));
        fetchData(); // Revalidate in background
      }
    };

    const interval = setInterval(checkStale, ttl / 4); // Check every quarter of TTL
    return () => clearInterval(interval);
  }, [state.lastUpdated, state.isLoading, ttl, staleWhileRevalidate, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    invalidate,
    refresh
  };
}

// Hook for memory caching (for frequently accessed small data)
export function useMemoryCache<T>(key: string, initialValue?: T) {
  const [data, setData] = useState<T | null>(() => {
    const cached = memoryCache.get(key);
    return cached || initialValue || null;
  });

  const setValue = useCallback((value: T, ttl?: number) => {
    memoryCache.set(key, value, ttl);
    setData(value);
  }, [key]);

  const getValue = useCallback(() => {
    const cached = memoryCache.get(key);
    if (cached !== null) {
      setData(cached);
      return cached;
    }
    return data;
  }, [key, data]);

  const clearValue = useCallback(() => {
    memoryCache.clear();
    setData(null);
  }, []);

  return {
    data,
    setValue,
    getValue,
    clearValue
  };
}

// Hook for cache statistics and monitoring
export function useCacheStats() {
  const [stats, setStats] = useState(() => cacheUtils.getAllStats());

  const refreshStats = useCallback(() => {
    setStats(cacheUtils.getAllStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearAllCaches: cacheUtils.invalidateAll
  };
}

// Hook for preloading data
export function usePreloader() {
  const [preloadedKeys, setPreloadedKeys] = useState<Set<string>>(new Set());

  const preload = useCallback(async (key: string, fetcher: () => Promise<any>) => {
    if (preloadedKeys.has(key)) return;

    try {
      await apiCache.get(`preload:${key}`, fetcher);
      setPreloadedKeys(prev => new Set([...prev, key]));
    } catch (error) {
      console.warn(`Failed to preload ${key}:`, error);
    }
  }, [preloadedKeys]);

  const preloadMultiple = useCallback(async (items: Array<{ key: string; fetcher: () => Promise<any> }>) => {
    const promises = items
      .filter(item => !preloadedKeys.has(item.key))
      .map(item => preload(item.key, item.fetcher));
    
    await Promise.allSettled(promises);
  }, [preload, preloadedKeys]);

  return {
    preload,
    preloadMultiple,
    preloadedKeys: Array.from(preloadedKeys)
  };
}

// Hook for cache invalidation patterns
export function useCacheInvalidation() {
  const invalidatePattern = useCallback((pattern: string) => {
    apiCache.invalidate(pattern);
  }, []);

  const invalidateMultiple = useCallback((patterns: string[]) => {
    patterns.forEach(pattern => apiCache.invalidate(pattern));
  }, []);

  const invalidateByTags = useCallback((tags: string[]) => {
    // Invalidate cache entries that match any of the provided tags
    const pattern = tags.map(tag => `.*${tag}.*`).join('|');
    apiCache.invalidate(`(${pattern})`);
  }, []);

  return {
    invalidatePattern,
    invalidateMultiple,
    invalidateByTags
  };
}

// Hook for optimistic updates with cache
export function useOptimisticCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  mutator: (data: T, optimisticData: Partial<T>) => Promise<T>
) {
  const { data, isLoading, error, refetch } = useApiCache(key, fetcher);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const optimisticUpdate = useCallback(async (optimisticData: Partial<T>) => {
    if (!data) return;

    const originalData = data;
    setIsOptimistic(true);

    try {
      // Apply optimistic update immediately
      const optimisticResult = { ...data, ...optimisticData };
      
      // Update cache with optimistic data
      apiCache['cache'].set(`api:${key}`, optimisticResult);
      
      // Perform actual mutation
      const result = await mutator(data, optimisticData);
      
      // Update cache with real result
      apiCache['cache'].set(`api:${key}`, result);
      
      setIsOptimistic(false);
      return result;
    } catch (error) {
      // Rollback on error
      apiCache['cache'].set(`api:${key}`, originalData);
      setIsOptimistic(false);
      throw error;
    }
  }, [data, key, mutator]);

  return {
    data,
    isLoading,
    error,
    isOptimistic,
    optimisticUpdate,
    refetch
  };
}