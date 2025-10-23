'use client';

import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  optimizeImage,
  generateResponsiveImages,
  generateBlurPlaceholder,
  extractDominantColor,
  lazyLoadImage,
  loadProgressively,
  getImageMetadata,
  type ImageOptimizationOptions,
  type ImageMetadata
} from '../utils/imageOptimization';
import { Skeleton } from './ui/skeleton';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  progressive?: boolean;
  responsive?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  containerClassName?: string;
  overlayClassName?: string;
  showLoadingState?: boolean;
  enableDominantColor?: boolean;
  optimizationOptions?: ImageOptimizationOptions;
}

interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  metadata?: ImageMetadata;
  dominantColor?: string;
  blurDataURL?: string;
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>((
  {
    src,
    alt,
    width,
    height,
    quality = 80,
    priority = false,
    placeholder = 'skeleton',
    blurDataURL,
    sizes,
    fill = false,
    objectFit = 'cover',
    objectPosition = 'center',
    loading = 'lazy',
    progressive = false,
    responsive = true,
    fallback,
    onLoad,
    onError,
    className,
    containerClassName,
    overlayClassName,
    showLoadingState = true,
    enableDominantColor = false,
    optimizationOptions = {},
    ...props
  },
  ref
) => {
  const [state, setState] = useState<ImageState>({
    isLoading: true,
    isLoaded: false,
    hasError: false
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');

  // Combine refs
  const combinedRef = useCallback((node: HTMLImageElement | null) => {
    // Update our internal ref
    (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    
    // Forward to the external ref
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Load image metadata and enhancements
  useEffect(() => {
    if (!isInView) return;

    const loadEnhancements = async () => {
      try {
        const metadata = await getImageMetadata(src);
        const updates: Partial<ImageState> = { metadata };

        if (enableDominantColor && !state.dominantColor) {
          updates.dominantColor = await extractDominantColor(src);
        }

        if (placeholder === 'blur' && !blurDataURL && !state.blurDataURL) {
          updates.blurDataURL = await generateBlurPlaceholder(src);
        }

        setState(prev => ({ ...prev, ...updates }));
      } catch (error) {
        console.warn('Failed to load image enhancements:', error);
      }
    };

    loadEnhancements();
  }, [isInView, src, placeholder, blurDataURL, enableDominantColor, state.dominantColor, state.blurDataURL]);

  // Generate optimized image props
  const getOptimizedProps = () => {
    const options: ImageOptimizationOptions = {
      quality,
      width,
      height,
      priority,
      ...optimizationOptions
    };

    if (responsive && !fill) {
      const responsiveSet = generateResponsiveImages(src, options);
      return {
        src: responsiveSet.src,
        srcSet: responsiveSet.srcSet,
        sizes: sizes || responsiveSet.sizes
      };
    }

    return {
      src: optimizeImage(src, options)
    };
  };

  // Handle image load
  const handleLoad = () => {
    setState(prev => ({ ...prev, isLoading: false, isLoaded: true }));
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setState(prev => ({ ...prev, isLoading: false, hasError: true }));
    onError?.();
  };

  // Progressive loading effect
  useEffect(() => {
    if (progressive && imgRef.current && isInView && !state.isLoaded) {
      loadProgressively(imgRef.current, src, {
        quality,
        width,
        height,
        ...optimizationOptions
      });
    }
  }, [progressive, isInView, src, quality, width, height, JSON.stringify(optimizationOptions), state.isLoaded]);

  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder === 'empty') return null;

    if (placeholder === 'skeleton') {
      return (
        <Skeleton 
          className={cn(
            'absolute inset-0 rounded-md',
            !state.isLoaded && 'animate-pulse'
          )}
          style={{
            backgroundColor: state.dominantColor || '#f3f4f6'
          }}
        />
      );
    }

    if (placeholder === 'blur' && (blurDataURL || state.blurDataURL)) {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
          style={{
            backgroundImage: `url(${blurDataURL || state.blurDataURL})`,
            backgroundColor: state.dominantColor || '#f3f4f6'
          }}
        />
      );
    }

    return (
      <div 
        className="absolute inset-0 bg-gray-200 animate-pulse"
        style={{
          backgroundColor: state.dominantColor || '#f3f4f6'
        }}
      />
    );
  };

  // Render error fallback
  const renderError = () => {
    if (fallback) {
      return (
        <img
          src={fallback}
          alt={alt}
          className={cn('object-cover', className)}
          {...props}
        />
      );
    }

    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        className
      )}>
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  };

  // Container styles
  const containerStyle = {
    backgroundColor: state.dominantColor || 'transparent'
  };

  if (state.hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn('relative overflow-hidden', containerClassName)}
        style={fill ? { position: 'relative' } : { width, height }}
      >
        {renderError()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={fill ? { position: 'relative', ...containerStyle } : { width, height, ...containerStyle }}
    >
      {/* Placeholder */}
      {(state.isLoading || !isInView) && showLoadingState && renderPlaceholder()}
      
      {/* Overlay */}
      {overlayClassName && (
        <div className={cn('absolute inset-0 z-10', overlayClassName)} />
      )}

      {/* Main image */}
      {isInView && (
        <Image
          ref={combinedRef}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder === 'blur' && (blurDataURL || state.blurDataURL) ? 'blur' : 'empty'}
          blurDataURL={blurDataURL || state.blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            state.isLoaded ? 'opacity-100' : 'opacity-0',
            fill && `object-${objectFit}`,
            className
          )}
          style={{
            objectPosition: fill ? objectPosition : undefined,
            ...(!fill && { objectFit, objectPosition })
          }}
          {...getOptimizedProps()}
          {...props}
        />
      )}

      {/* Loading indicator */}
      {state.isLoading && showLoadingState && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Gallery component for multiple images
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: number;
  aspectRatio?: string;
  className?: string;
  imageProps?: Partial<OptimizedImageProps>;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  aspectRatio = '1/1',
  className,
  imageProps = {}
}: ImageGalleryProps) {
  return (
    <div 
      className={cn(
        'grid auto-rows-fr',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            fill
            className="rounded-lg transition-transform group-hover:scale-105"
            containerClassName="relative overflow-hidden rounded-lg"
            style={{ aspectRatio }}
            {...imageProps}
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Avatar component with optimized images
interface OptimizedAvatarProps extends OptimizedImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
}

export function OptimizedAvatar({
  size = 'md',
  fallbackText,
  className,
  ...props
}: OptimizedAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizePx = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  return (
    <OptimizedImage
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      objectFit="cover"
      fallback={fallbackText ? `data:image/svg+xml;base64,${btoa(
        `<svg width="${sizePx[size]}" height="${sizePx[size]}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="${sizePx[size] * 0.4}" fill="#9ca3af">
            ${fallbackText.charAt(0).toUpperCase()}
          </text>
        </svg>`
      )}` : undefined}
      {...props}
    />
  );
}

export default OptimizedImage;
export type { OptimizedImageProps, ImageGalleryProps, OptimizedAvatarProps };