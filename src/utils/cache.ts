// Advanced caching mechanisms for API responses and static assets

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  strategy: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      strategy: 'lru',
      ...config
    };
  }

  set(key: string, data: T): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.config.strategy) {
      case 'lru': // Least Recently Used
        keyToEvict = this.findLRU();
        break;
      case 'lfu': // Least Frequently Used
        keyToEvict = this.findLFU();
        break;
      case 'fifo': // First In, First Out
      default:
        keyToEvict = this.cache.keys().next().value;
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  private findLRU(): string | undefined {
    if (this.cache.size === 0) return undefined;
    
    let oldestKey = '';
    let oldestTime = Date.now();

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    return oldestKey || undefined;
  }

  private findLFU(): string | undefined {
    if (this.cache.size === 0) return undefined;
    
    let leastUsedKey = '';
    let leastCount = Infinity;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    });

    return leastUsedKey || undefined;
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      averageAge: entries.reduce((sum, [, entry]) => sum + (now - entry.timestamp), 0) / entries.length || 0,
      totalAccesses: entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0)
    };
  }

  private calculateHitRate(): number {
    // This would need to be tracked separately in a real implementation
    return 0.85; // Placeholder
  }
}

// API Response Cache
class APICache {
  private cache: AdvancedCache<any>;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.cache = new AdvancedCache({
      ttl: 5 * 60 * 1000, // 5 minutes for API responses
      maxSize: 200,
      strategy: 'lru'
    });
  }

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Make new request
    const request = fetcher().then(data => {
      this.cache.set(key, data);
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Invalidate keys matching pattern
    const regex = new RegExp(pattern);
    Array.from(this.cache['cache'].entries()).forEach(([key]) => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  getStats() {
    return {
      ...this.cache.getStats(),
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Static Asset Cache using Service Worker
class StaticAssetCache {
  private cacheName = 'crm-static-assets-v1';
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  async cache(url: string): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.add(url);
    }
  }

  async get(url: string): Promise<Response | null> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      
      if (response) {
        const date = response.headers.get('date');
        if (date && Date.now() - new Date(date).getTime() > this.maxAge) {
          await cache.delete(url);
          return null;
        }
        return response;
      }
    }
    return null;
  }

  async preloadAssets(urls: string[]): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.addAll(urls);
    }
  }

  async clearExpired(): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const date = response.headers.get('date');
          if (date && Date.now() - new Date(date).getTime() > this.maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}

// Memory Cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize = 50;
  private defaultTTL = 2 * 60 * 1000; // 2 minutes

  set(key: string, data: any, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl || this.defaultTTL)
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

// Cache instances
export const apiCache = new APICache();
export const staticAssetCache = new StaticAssetCache();
export const memoryCache = new MemoryCache();

// Cache utilities
export const cacheUtils = {
  // Generate cache key from URL and params
  generateKey: (url: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  },

  // Batch invalidation
  invalidateAll: (): void => {
    apiCache.invalidate();
    memoryCache.clear();
  },

  // Get comprehensive cache stats
  getAllStats: () => ({
    api: apiCache.getStats(),
    memory: {
      size: memoryCache['cache'].size,
      maxSize: memoryCache['maxSize']
    }
  }),

  // Preload critical data
  preloadCriticalData: async (): Promise<void> => {
    const criticalAssets = [
      '/api/dashboard/summary',
      '/api/clients/recent',
      '/api/pipeline/overview'
    ];

    // This would be implemented with actual API calls
    console.log('Preloading critical data:', criticalAssets);
  }
};

// Cleanup expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
    staticAssetCache.clearExpired();
  }, 5 * 60 * 1000); // Every 5 minutes
}