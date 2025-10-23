import { NextRequest, NextResponse } from 'next/server'
import { securityService } from './src/utils/security'

// Security middleware for Next.js
export function middleware(request: NextRequest) {
  // HTTPS redirect for production
  if (process.env.NODE_ENV === 'production') {
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host')
    
    // Redirect HTTP to HTTPS in production
    if (protocol === 'http' && host) {
      const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
      console.log(`Redirecting HTTP to HTTPS: ${request.url} -> ${httpsUrl}`)
      return NextResponse.redirect(httpsUrl, 301)
    }
    
    // Validate that we're using HTTPS in production
    if (!request.url.startsWith('https://') && !request.nextUrl.pathname.startsWith('/_next/')) {
      console.warn(`Non-HTTPS request in production: ${request.url}`)
    }
  }

  // Create response
  const response = NextResponse.next()

  // Apply security headers
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': securityService.generateCSPHeader(),
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
    
    // Remove server information
    'Server': '',
    'X-Powered-By': '',
  }

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Log API access for security monitoring
    console.log(`API Access: ${request.method} ${request.nextUrl.pathname} from ${ip}`)
    
    // Add additional security headers for API routes
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Enhanced HTTPS enforcement for API routes in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    }
  }

  // CSRF protection for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Verify origin matches host for CSRF protection
    if (origin && host && !origin.includes(host)) {
      console.warn(`CSRF attempt detected: Origin ${origin} does not match host ${host}`)
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // In production, ensure HTTPS for state-changing requests
    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
      console.error(`Insecure state-changing request in production: ${request.method} ${request.url}`)
      return new NextResponse('HTTPS Required', { status: 426 })
    }
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}