import type { Database } from "../lib/supabase"

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]

export interface SearchResult {
  id: string
  type: "client" | "task" | "event" | "project" | "invoice" | "email" | "document" | "note"
  title: string
  subtitle?: string
  description?: string
  url: string
  relevance: number
  metadata?: Record<string, unknown>
  highlights?: string[]
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  types?: SearchResult["type"][]
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string[]
  assignedTo?: string[]
  tags?: string[]
  priority?: string[]
  clients?: string[]
  projects?: string[]
}

export interface SearchOptions {
  limit?: number
  offset?: number
  sortBy?: "relevance" | "date" | "title"
  sortOrder?: "asc" | "desc"
  includeArchived?: boolean
  fuzzySearch?: boolean
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  query: string
  filters: SearchFilters
  options: SearchOptions
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface SearchAnalytics {
  query: string
  user_id: string
  results_count: number
  clicked_result_id?: string
  search_time_ms: number
  timestamp: string
}

export interface SearchCache {
  key: string
  results: SearchResult[]
  timestamp: number
  ttl: number
}

export interface SearchSuggestion {
  text: string
  type: 'query' | 'filter' | 'entity'
  score: number
  metadata?: Record<string, unknown>
}

// Enhanced search service with intelligent algorithms
export interface SearchService {
  search: (query: string, filters?: SearchFilters, options?: SearchOptions) => Promise<SearchResult[]>
  searchWithSuggestions: (query: string) => Promise<{ results: SearchResult[], suggestions: SearchSuggestion[] }>
  saveSearch: (name: string, query: string, filters: SearchFilters, options?: SearchOptions) => Promise<SavedSearch>
  getSavedSearches: (userId?: string) => Promise<SavedSearch[]>
  deleteSavedSearch: (id: string) => Promise<void>
  getSearchSuggestions: (query: string) => Promise<SearchSuggestion[]>
  trackSearchAnalytics: (analytics: Omit<SearchAnalytics, 'timestamp'>) => Promise<void>
  getPopularSearches: (limit?: number) => Promise<string[]>
  clearCache: () => void
}

class SearchServiceImpl implements SearchService {
  private cache = new Map<string, SearchCache>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 100
  private searchHistory: string[] = []
  private popularQueries = new Map<string, number>()

  private generateCacheKey(query: string, filters?: SearchFilters, options?: SearchOptions): string {
    return btoa(JSON.stringify({ query, filters, options }))
  }

  private isValidCache(cache: SearchCache): boolean {
    return Date.now() - cache.timestamp < cache.ttl
  }

  private addToCache(key: string, results: SearchResult[]): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      key,
      results,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    })
  }

  private calculateRelevanceScore(item: any, query: string): number {
    const queryLower = query.toLowerCase()
    let score = 0

    // Title match (highest weight)
    if (item.title?.toLowerCase().includes(queryLower)) {
      score += 10
      if (item.title?.toLowerCase().startsWith(queryLower)) {
        score += 5
      }
    }

    // Description match
    if (item.description?.toLowerCase().includes(queryLower)) {
      score += 5
    }

    // Exact match bonus
    if (item.title?.toLowerCase() === queryLower) {
      score += 20
    }

    // Recent activity bonus
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at || item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) {
      score += 3
    } else if (daysSinceUpdate < 30) {
      score += 1
    }

    return score
  }

  private fuzzyMatch(text: string, query: string): boolean {
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    
    // Simple fuzzy matching - allows for 1 character difference per 4 characters
    const maxErrors = Math.floor(queryLower.length / 4)
    let errors = 0
    let textIndex = 0
    
    for (let i = 0; i < queryLower.length; i++) {
      let found = false
      for (let j = textIndex; j < textLower.length && j < textIndex + 2; j++) {
        if (textLower[j] === queryLower[i]) {
          textIndex = j + 1
          found = true
          break
        }
      }
      if (!found) {
        errors++
        if (errors > maxErrors) return false
      }
    }
    
    return true
  }

  private mockSearchData(): SearchResult[] {
    return [
      {
        id: '1',
        type: 'client',
        title: 'Acme Corporation',
        description: 'Large enterprise client with multiple projects',
        url: '/clients/1',
        relevance: 0.95,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      {
        id: '2',
        type: 'project',
        title: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        url: '/projects/2',
        relevance: 0.88,
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-25T11:45:00Z'
      },
      {
        id: '3',
        type: 'task',
        title: 'Design Homepage Mockup',
        description: 'Create initial design concepts for homepage',
        url: '/tasks/3',
        relevance: 0.82,
        created_at: '2024-01-12T14:00:00Z',
        updated_at: '2024-01-18T16:20:00Z'
      }
    ]
  }

  async search(query: string, filters?: SearchFilters, options?: SearchOptions): Promise<SearchResult[]> {
    const cacheKey = this.generateCacheKey(query, filters, options)
    const cached = this.cache.get(cacheKey)
    
    if (cached && this.isValidCache(cached)) {
      return cached.results
    }

    // Track query popularity
    const currentCount = this.popularQueries.get(query) || 0
    this.popularQueries.set(query, currentCount + 1)
    
    // Add to search history
    this.searchHistory.unshift(query)
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50)
    }

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const mockData = this.mockSearchData()
    let results: SearchResult[] = []

    if (query.trim()) {
      results = mockData
        .filter(item => {
          const matchesQuery = options?.fuzzySearch 
            ? this.fuzzyMatch(item.title + ' ' + (item.description || ''), query)
            : (item.title?.toLowerCase().includes(query.toLowerCase()) || 
               item.description?.toLowerCase().includes(query.toLowerCase()))
          
          const matchesType = !filters?.types || filters.types.includes(item.type)
          
          return matchesQuery && matchesType
        })
        .map(item => ({
          ...item,
          url: `/${item.type}/${item.id}`,
          relevance: this.calculateRelevanceScore(item, query),
          highlights: [query]
        }))
        .sort((a, b) => {
          if (options?.sortBy === 'date') {
            const dateA = new Date(a.updated_at).getTime()
            const dateB = new Date(b.updated_at).getTime()
            return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA
          }
          return b.relevance - a.relevance
        })
    }

    if (options?.limit) {
      results = results.slice(options.offset || 0, (options.offset || 0) + options.limit)
    }

    this.addToCache(cacheKey, results)
    return results
  }

  async searchWithSuggestions(query: string): Promise<{ results: SearchResult[], suggestions: SearchSuggestion[] }> {
    const [results, suggestions] = await Promise.all([
      this.search(query),
      this.getSearchSuggestions(query)
    ])

    return { results, suggestions }
  }

  async saveSearch(name: string, query: string, filters: SearchFilters, options?: SearchOptions): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      user_id: 'current-user',
      name,
      query,
      filters,
      options: options || {},
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // In a real implementation, this would save to a database
    const existing = JSON.parse(localStorage.getItem('savedSearches') || '[]')
    existing.push(savedSearch)
    localStorage.setItem('savedSearches', JSON.stringify(existing))

    return savedSearch
  }

  async getSavedSearches(userId?: string): Promise<SavedSearch[]> {
    // In a real implementation, this would fetch from a database
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]')
    return userId ? saved.filter((s: SavedSearch) => s.user_id === userId) : saved
  }

  async deleteSavedSearch(id: string): Promise<void> {
    const existing = JSON.parse(localStorage.getItem('savedSearches') || '[]')
    const filtered = existing.filter((s: SavedSearch) => s.id !== id)
    localStorage.setItem('savedSearches', JSON.stringify(filtered))
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = []
    
    // Query suggestions from history
    const historySuggestions = this.searchHistory
      .filter(h => h.toLowerCase().includes(query.toLowerCase()) && h !== query)
      .slice(0, 3)
      .map(h => ({ text: h, type: 'query' as const, score: 0.8 }))
    
    suggestions.push(...historySuggestions)
    
    // Entity suggestions
    const entitySuggestions = [
      { text: 'clients', type: 'filter' as const, score: 0.6 },
      { text: 'projects', type: 'filter' as const, score: 0.6 },
      { text: 'tasks', type: 'filter' as const, score: 0.6 }
    ].filter(s => s.text.includes(query.toLowerCase()))
    
    suggestions.push(...entitySuggestions)
    
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5)
  }

  async trackSearchAnalytics(analytics: Omit<SearchAnalytics, 'timestamp'>): Promise<void> {
    const fullAnalytics: SearchAnalytics = {
      ...analytics,
      timestamp: new Date().toISOString()
    }
    
    // In a real implementation, this would send to analytics service
    // Silent logging - Search Analytics tracked
  }

  async getPopularSearches(limit = 10): Promise<string[]> {
    return Array.from(this.popularQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query)
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const searchService = new SearchServiceImpl()
