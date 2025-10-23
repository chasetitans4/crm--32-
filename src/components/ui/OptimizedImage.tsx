import React, { useState, useRef, useEffect } from 'react'
import { performanceOptimizationService, ImageOptimizationOptions } from '../../services/performanceOptimization'
import { Loader2, AlertTriangle } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  lazy?: boolean
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  priority?: boolean // For above-the-fold images
  sizes?: string // Responsive sizes
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  format = 'webp',
  lazy = true,
  placeholder,
  fallback,
  onLoad,
  onError,
  priority = false,
  sizes
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Generate optimized image URL
  const optimizationOptions: Partial<ImageOptimizationOptions> = {
    quality,
    format,
    width,
    height,
    lazy
  }

  const optimizedSrc = performanceOptimizationService.optimizeImage(src, optimizationOptions)

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) {
      setIsInView(true)
      return
    }

    if (imgRef.current) {
      observerRef.current = performanceOptimizationService.createIntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true)
              observerRef.current?.disconnect()
            }
          })
        }
      )

      observerRef.current.observe(imgRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [lazy, priority])

  // Handle image loading
  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(optimizedSrc)
    }
  }, [isInView, optimizedSrc, currentSrc])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    const error = new Error(`Failed to load image: ${src}`)
    onError?.(error)

    // Try fallback image if provided
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback)
      setHasError(false)
    }
  }

  // Generate responsive srcSet for different screen densities
  const generateSrcSet = () => {
    if (!width || !height) return undefined

    const densities = [1, 1.5, 2, 3]
    return densities
      .map(density => {
        const scaledWidth = Math.round(width * density)
        const scaledHeight = Math.round(height * density)
        const scaledSrc = performanceOptimizationService.optimizeImage(src, {
          ...optimizationOptions,
          width: scaledWidth,
          height: scaledHeight
        })
        return `${scaledSrc} ${density}x`
      })
      .join(', ')
  }

  // Placeholder component
  const PlaceholderComponent = () => {
    if (placeholder) {
      return (
        <img
          src={placeholder}
          alt=""
          className={`${className} blur-sm transition-all duration-300`}
          style={{ width, height }}
        />
      )
    }

    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center transition-all duration-300`}
        style={{ width, height }}
      >
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  // Error component
  const ErrorComponent = () => (
    <div
      className={`${className} bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500`}
      style={{ width, height }}
    >
      <AlertTriangle className="h-6 w-6 mb-2" />
      <span className="text-sm text-center px-2">Failed to load image</span>
    </div>
  )

  // Don't render anything if not in view and lazy loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={className}
        style={{ width, height }}
      >
        <PlaceholderComponent />
      </div>
    )
  }

  // Show error state
  if (hasError && !fallback) {
    return <ErrorComponent />
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Placeholder while loading */}
      {!isLoaded && <PlaceholderComponent />}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={generateSrcSet()}
        sizes={sizes}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width,
          height,
          position: isLoaded ? 'static' : 'absolute',
          top: 0,
          left: 0
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  )
}

// Higher-order component for automatic optimization
export const withImageOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return <Component {...(props as any)} ref={ref} />
  })
}

// Hook for image preloading
export const useImagePreload = (src: string, options?: Partial<ImageOptimizationOptions>) => {
  const [isPreloaded, setIsPreloaded] = useState(false)

  useEffect(() => {
    const optimizedSrc = performanceOptimizationService.optimizeImage(src, options)
    
    const img = new Image()
    img.onload = () => setIsPreloaded(true)
    img.onerror = () => setIsPreloaded(false)
    img.src = optimizedSrc

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, JSON.stringify(options)])

  return isPreloaded
}

// Component for critical above-the-fold images
export const CriticalImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} priority={true} lazy={false} />
}

// Component for background images with optimization
interface OptimizedBackgroundProps {
  src: string
  className?: string
  children?: React.ReactNode
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  width?: number
  height?: number
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  src,
  className = '',
  children,
  quality = 80,
  format = 'webp',
  width,
  height
}) => {
  const optimizedSrc = performanceOptimizationService.optimizeImage(src, {
    quality,
    format,
    width,
    height
  })

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${optimizedSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </div>
  )
}

export default OptimizedImage