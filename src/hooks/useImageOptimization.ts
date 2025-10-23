'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  imageOptimizer,
  optimizeImage,
  generateResponsiveImages,
  getImageMetadata,
  preloadImage,
  generateBlurPlaceholder,
  extractDominantColor,
  getImageCacheStats,
  clearImageCache,
  type ImageOptimizationOptions,
  type ImageMetadata,
  type ResponsiveImageSet
} from '@/utils/imageOptimization';

interface UseImageOptimizationOptions {
  preloadCritical?: boolean;
  enableMetrics?: boolean;
  cacheStrategy?: 'aggressive' | 'conservative' | 'minimal';
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
}

interface ImageOptimizationState {
  isLoading: boolean;
  metadata: ImageMetadata | null;
  error: string | null;
  dominantColor: string | null;
  blurDataURL: string | null;
  responsiveSet: ResponsiveImageSet | null;
  optimizedUrl: string | null;
}

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  cacheHitRate: number;
  totalBandwidthSaved: number;
}

// Hook for individual image optimization
export function useImageOptimization(
  src: string,
  options: ImageOptimizationOptions & UseImageOptimizationOptions = {}
) {
  const [state, setState] = useState<ImageOptimizationState>({
    isLoading: false,
    metadata: null,
    error: null,
    dominantColor: null,
    blurDataURL: null,
    responsiveSet: null,
    optimizedUrl: null
  });

  const loadStartTime = useRef<number>(0);
  const [loadTime, setLoadTime] = useState<number>(0);

  // Generate optimized URL
  const optimizedUrl = useCallback(() => {
    if (!src) return null;
    return optimizeImage(src, options);
  }, [src, options]);

  // Generate responsive image set
  const responsiveSet = useCallback(() => {
    if (!src) return null;
    return generateResponsiveImages(src, options);
  }, [src, options]);

  // Load image metadata and enhancements
  const loadImageData = useCallback(async () => {
    if (!src) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    loadStartTime.current = performance.now();

    try {
      const [metadata, dominantColor, blurDataURL, responsiveImages] = await Promise.all([
        getImageMetadata(src),
        extractDominantColor(src),
        generateBlurPlaceholder(src),
        generateResponsiveImages(src, options)
      ]);

      const loadEndTime = performance.now();
      setLoadTime(loadEndTime - loadStartTime.current);

      setState({
        isLoading: false,
        metadata,
        error: null,
        dominantColor,
        blurDataURL,
        responsiveSet: responsiveImages,
        optimizedUrl: optimizeImage(src, options)
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load image data'
      }));
    }
  }, [src, options]);

  // Preload image
  const preload = useCallback(async () => {
    if (!src) return;
    
    try {
      await preloadImage(src, options);
    } catch (error) {
      console.warn('Image preload failed:', error);
    }
  }, [src, options]);

  // Load data on mount or when src changes
  useEffect(() => {
    if (src) {
      loadImageData();
      
      if (options.preloadCritical) {
        preload();
      }
    }
  }, [src, loadImageData, preload, options.preloadCritical]);

  return {
    ...state,
    loadTime,
    optimizedUrl: state.optimizedUrl || optimizedUrl(),
    responsiveSet: state.responsiveSet || responsiveSet(),
    preload,
    reload: loadImageData
  };
}

// Hook for managing multiple images
export function useImageGallery(images: string[], options: UseImageOptimizationOptions = {}) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  // Preload all images
  const preloadAll = useCallback(async () => {
    if (isPreloading) return;
    
    setIsPreloading(true);
    
    try {
      await Promise.allSettled(
        images.map(async (src) => {
          try {
            await preloadImage(src, options);
            setLoadedImages(prev => new Set(prev).add(src));
          } catch (error) {
            setFailedImages(prev => new Set(prev).add(src));
          }
        })
      );
    } finally {
      setIsPreloading(false);
    }
  }, [images, options, isPreloading]);

  // Preload critical images on mount
  useEffect(() => {
    if (options.preloadCritical && images.length > 0) {
      preloadAll();
    }
  }, [images, options.preloadCritical, preloadAll]);

  return {
    loadedImages,
    failedImages,
    isPreloading,
    preloadAll,
    progress: {
      total: images.length,
      loaded: loadedImages.size,
      failed: failedImages.size,
      percentage: images.length > 0 ? (loadedImages.size / images.length) * 100 : 0
    }
  };
}

// Hook for image performance monitoring
export function useImageMetrics() {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
    totalBandwidthSaved: 0
  });

  const loadTimes = useRef<number[]>([]);
  const cacheStats = useRef({ hits: 0, misses: 0 });

  // Record image load
  const recordImageLoad = useCallback((loadTime: number, fromCache: boolean = false) => {
    loadTimes.current.push(loadTime);
    
    if (fromCache) {
      cacheStats.current.hits++;
    } else {
      cacheStats.current.misses++;
    }

    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1,
      loadedImages: prev.loadedImages + 1,
      averageLoadTime: loadTimes.current.reduce((a, b) => a + b, 0) / loadTimes.current.length,
      cacheHitRate: cacheStats.current.hits / (cacheStats.current.hits + cacheStats.current.misses) * 100
    }));
  }, []);

  // Record image failure
  const recordImageFailure = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1,
      failedImages: prev.failedImages + 1
    }));
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(async () => {
    try {
      const stats = getImageCacheStats();
      return stats;
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return null;
    }
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    loadTimes.current = [];
    cacheStats.current = { hits: 0, misses: 0 };
    setMetrics({
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
      totalBandwidthSaved: 0
    });
  }, []);

  return {
    metrics,
    recordImageLoad,
    recordImageFailure,
    getCacheStats,
    clearMetrics
  };
}

// Hook for lazy loading with intersection observer
export function useLazyLoading(threshold: number = 0.1, rootMargin: string = '50px') {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasLoaded]);

  return {
    elementRef,
    isInView,
    hasLoaded
  };
}

// Hook for progressive image loading
export function useProgressiveLoading(src: string, options: ImageOptimizationOptions = {}) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'placeholder' | 'lowQuality' | 'highQuality'>('placeholder');

  useEffect(() => {
    if (!src) return;

    const loadProgressive = async () => {
      setIsLoading(true);
      setLoadingStage('placeholder');

      try {
        // Stage 1: Load low quality placeholder
        const lowQualitySrc = optimizeImage(src, {
          ...options,
          quality: 10,
          width: Math.min(options.width || 100, 100)
        });

        setCurrentSrc(lowQualitySrc);
        setLoadingStage('lowQuality');

        // Stage 2: Load high quality image
        const highQualitySrc = optimizeImage(src, options);
        
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(highQualitySrc);
          setLoadingStage('highQuality');
          setIsLoading(false);
        };
        img.onerror = () => {
          setIsLoading(false);
        };
        img.src = highQualitySrc;
      } catch (error) {
        console.warn('Progressive loading failed:', error);
        setCurrentSrc(src);
        setIsLoading(false);
      }
    };

    loadProgressive();
  }, [src, options]);

  return {
    currentSrc,
    isLoading,
    loadingStage,
    isLowQuality: loadingStage === 'lowQuality',
    isHighQuality: loadingStage === 'highQuality'
  };
}

// Hook for image cache management
export function useImageCache() {
  const [cacheSize, setCacheSize] = useState(0);
  const [cacheEntries, setCacheEntries] = useState(0);

  // Update cache stats
  const updateCacheStats = useCallback(async () => {
    try {
      const stats = getImageCacheStats();
      setCacheEntries(stats.cachedImages);
      // Cache size would need to be calculated differently
    } catch (error) {
      console.warn('Failed to update cache stats:', error);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      clearImageCache();
      await updateCacheStats();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [updateCacheStats]);

  // Update stats on mount
  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  return {
    cacheSize,
    cacheEntries,
    updateCacheStats,
    clearCache
  };
}

// Export types
export type {
  UseImageOptimizationOptions,
  ImageOptimizationState,
  ImageMetrics
};