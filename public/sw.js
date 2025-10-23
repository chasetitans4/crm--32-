// Service Worker for Performance Optimization
const CACHE_NAME = 'crm-cache-v1'
const STATIC_CACHE = 'crm-static-v1'
const DYNAMIC_CACHE = 'crm-dynamic-v1'
const API_CACHE = 'crm-api-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
  '/favicon.ico'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth',
  '/api/contacts',
  '/api/companies',
  '/api/deals',
  '/api/quotes'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS.filter(asset => asset))
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Determine cache strategy based on request type
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST
  let cacheName = DYNAMIC_CACHE
  
  if (isStaticAsset(url)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST
    cacheName = STATIC_CACHE
  } else if (isAPIRequest(url)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
    cacheName = API_CACHE
  } else if (isImageRequest(url)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST
    cacheName = DYNAMIC_CACHE
  }
  
  event.respondWith(handleRequest(request, strategy, cacheName))
})

// Handle different caching strategies
async function handleRequest(request, strategy, cacheName) {
  const cache = await caches.open(cacheName)
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cache)
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cache)
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cache)
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request)
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cache.match(request)
      
    default:
      return networkFirst(request, cache)
  }
}

// Cache First Strategy
async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache First strategy failed:', error)
    return new Response('Network error', { status: 408 })
  }
}

// Network First Strategy
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response('Network error and no cache available', { status: 408 })
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request)
  
  // Start network request in background
  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch((error) => {
    console.log('Background network request failed:', error)
  })
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse
  }
  
  // If no cache, wait for network
  try {
    return await networkResponsePromise
  } catch (error) {
    return new Response('Network error and no cache available', { status: 408 })
  }
}

// Helper functions to determine request types
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.ttf') ||
         url.pathname.endsWith('.eot')
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))
}

function isImageRequest(url) {
  return url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.gif') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.avif') ||
         url.pathname.endsWith('.svg')
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Implement background sync logic here
    // For example, sync offline form submissions
    console.log('Service Worker: Performing background sync')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('CRM Notification', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handling for cache management
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      })
    )
  }
})

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(doPeriodicSync())
    }
  })
}

async function doPeriodicSync() {
  try {
    console.log('Service Worker: Performing periodic sync')
    // Implement periodic sync logic here
  } catch (error) {
    console.error('Periodic sync failed:', error)
  }
}