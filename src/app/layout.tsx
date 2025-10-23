import React, { Suspense } from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { PerformanceMonitoring } from "@/components/PerformanceMonitoring";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "CRM Application",
    template: "%s | CRM"
  },
  description: "A comprehensive Customer Relationship Management application with advanced security and performance features",
  keywords: ["CRM", "Customer Management", "Sales", "Business", "Productivity"],
  authors: [{ name: "CRM Team" }],
  creator: "CRM Team",
  publisher: "CRM Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'CRM Application',
    description: 'A comprehensive Customer Relationship Management application',
    siteName: 'CRM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRM Application',
    description: 'A comprehensive Customer Relationship Management application',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://api.example.com" />
        
        {/* Critical CSS will be inlined here by the performance service */}
        <style id="critical-css" />
        
        {/* Preload critical resources */}

      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Main content */}
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        <PerformanceMonitoring />
        <Toaster />
      </body>
    </html>
  )
}
