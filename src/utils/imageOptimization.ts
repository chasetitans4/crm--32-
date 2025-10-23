// Advanced image optimization utilities

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number;
  progressive?: boolean;
  lossless?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'data:image/svg+xml';
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

interface ImageMetadata {
  src: string;
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
  dominantColor?: string;
  blurDataURL?: string;
}

interface ResponsiveImageSet {
  srcSet: string;
  sizes: string;
  src: string;
  placeholder?: string;
}

class ImageOptimizer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private supportedFormats: Set<string> = new Set();
  private imageCache: Map<string, ImageMetadata> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;
  private loadingImages: Set<string> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    // Create canvas for image processing
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
      // Detect supported formats
      await this.detectSupportedFormats();
      
      // Initialize intersection observer for lazy loading
      this.initIntersectionObserver();
    }
  }

  private async detectSupportedFormats() {
    const formats = [
      { format: 'webp', dataURL: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA' },
      { format: 'avif', dataURL: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=' }
    ];

    for (const { format, dataURL } of formats) {
      try {
        const img = new Image();
        const supported = await new Promise<boolean>((resolve) => {
          img.onload = () => resolve(img.width > 0 && img.height > 0);
          img.onerror = () => resolve(false);
          img.src = dataURL;
        });
        
        if (supported) {
          this.supportedFormats.add(format);
        }
      } catch {
        // Format not supported
      }
    }
  }

  private initIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.intersectionObserver?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  // Generate optimized image URL
  generateOptimizedUrl(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      quality = 80,
      format = 'auto',
      width,
      height,
      fit = 'cover'
    } = options;

    // For Next.js Image Optimization API
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    
    // Auto-detect best format
    const bestFormat = this.getBestFormat(format);
    if (bestFormat !== 'auto') {
      params.set('f', bestFormat);
    }
    
    // Use Next.js image optimization
    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }

  // Generate responsive image set
  generateResponsiveImageSet(src: string, options: ImageOptimizationOptions = {}): ResponsiveImageSet {
    const breakpoints = [640, 768, 1024, 1280, 1536, 1920];
    const { quality = 80, format = 'auto' } = options;
    
    const srcSet = breakpoints
      .map(width => {
        const url = this.generateOptimizedUrl(src, { ...options, width, quality, format });
        return `${url} ${width}w`;
      })
      .join(', ');
    
    const sizes = options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    const fallbackSrc = this.generateOptimizedUrl(src, { ...options, width: 1200 });
    
    return {
      srcSet,
      sizes,
      src: fallbackSrc
    };
  }

  // Get best supported format
  private getBestFormat(requestedFormat: string): string {
    if (requestedFormat !== 'auto') {
      return requestedFormat;
    }
    
    // Prefer AVIF, then WebP, then original
    if (this.supportedFormats.has('avif')) return 'avif';
    if (this.supportedFormats.has('webp')) return 'webp';
    return 'auto';
  }

  // Generate blur placeholder
  async generateBlurPlaceholder(src: string, width = 10, height = 10): Promise<string> {
    if (!this.canvas || !this.ctx) {
      return this.generateSvgPlaceholder(width, height);
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });

      this.canvas.width = width;
      this.canvas.height = height;
      
      this.ctx.drawImage(img, 0, 0, width, height);
      
      return this.canvas.toDataURL('image/jpeg', 0.1);
    } catch {
      return this.generateSvgPlaceholder(width, height);
    }
  }

  // Generate SVG placeholder
  private generateSvgPlaceholder(width: number, height: number, color = '#f3f4f6'): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Extract dominant color from image
  async extractDominantColor(src: string): Promise<string> {
    if (!this.canvas || !this.ctx) {
      return '#f3f4f6';
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });

      this.canvas.width = 1;
      this.canvas.height = 1;
      
      this.ctx.drawImage(img, 0, 0, 1, 1);
      
      const [r, g, b] = this.ctx.getImageData(0, 0, 1, 1).data;
      
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return '#f3f4f6';
    }
  }

  // Get image metadata
  async getImageMetadata(src: string): Promise<ImageMetadata> {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });

      const metadata: ImageMetadata = {
        src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: this.getImageFormat(src),
        size: 0, // Would need server-side info
        aspectRatio: img.naturalWidth / img.naturalHeight,
        dominantColor: await this.extractDominantColor(src),
        blurDataURL: await this.generateBlurPlaceholder(src)
      };

      this.imageCache.set(src, metadata);
      return metadata;
    } catch (error) {
      throw new Error(`Failed to load image metadata: ${error}`);
    }
  }

  private getImageFormat(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  // Lazy load image
  lazyLoad(img: HTMLImageElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (src && !this.loadingImages.has(src)) {
      this.loadingImages.add(src);
      
      const newImg = new Image();
      newImg.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        this.loadingImages.delete(src);
      };
      newImg.onerror = () => {
        this.loadingImages.delete(src);
      };
      newImg.src = src;
    }
  }

  // Preload critical images
  preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve();
      img.onerror = reject;
      
      // Set responsive attributes if provided
      if (options.sizes) {
        const responsive = this.generateResponsiveImageSet(src, options);
        img.srcset = responsive.srcSet;
        img.sizes = responsive.sizes;
      }
      
      img.src = this.generateOptimizedUrl(src, options);
    });
  }

  // Progressive image loading
  async loadProgressively(img: HTMLImageElement, src: string, options: ImageOptimizationOptions = {}) {
    try {
      // Load low quality placeholder first
      const placeholderSrc = this.generateOptimizedUrl(src, {
        ...options,
        quality: 10,
        width: Math.min(options.width || 100, 100)
      });
      
      img.src = placeholderSrc;
      img.style.filter = 'blur(5px)';
      
      // Load full quality image
      const fullSrc = this.generateOptimizedUrl(src, options);
      const fullImg = new Image();
      
      fullImg.onload = () => {
        img.src = fullSrc;
        img.style.filter = 'none';
        img.style.transition = 'filter 0.3s ease';
      };
      
      fullImg.src = fullSrc;
    } catch (error) {
      console.error('Progressive loading failed:', error);
      img.src = src; // Fallback to original
    }
  }

  // Clear cache
  clearCache() {
    this.imageCache.clear();
    this.loadingImages.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      cachedImages: this.imageCache.size,
      loadingImages: this.loadingImages.size,
      supportedFormats: Array.from(this.supportedFormats)
    };
  }
}

// Singleton instance
const imageOptimizer = new ImageOptimizer();

// Export utilities
export { imageOptimizer, ImageOptimizer };
export type { ImageOptimizationOptions, ImageMetadata, ResponsiveImageSet };

// Convenience functions
export const optimizeImage = (src: string, options?: ImageOptimizationOptions) => 
  imageOptimizer.generateOptimizedUrl(src, options);

export const generateResponsiveImages = (src: string, options?: ImageOptimizationOptions) => 
  imageOptimizer.generateResponsiveImageSet(src, options);

export const getImageMetadata = (src: string) => 
  imageOptimizer.getImageMetadata(src);

export const preloadImage = (src: string, options?: ImageOptimizationOptions) => 
  imageOptimizer.preloadImage(src, options);

export const generateBlurPlaceholder = (src: string, width?: number, height?: number) => 
  imageOptimizer.generateBlurPlaceholder(src, width, height);

export const extractDominantColor = (src: string) => 
  imageOptimizer.extractDominantColor(src);

export const lazyLoadImage = (img: HTMLImageElement) => 
  imageOptimizer.lazyLoad(img);

export const loadProgressively = (img: HTMLImageElement, src: string, options?: ImageOptimizationOptions) => 
  imageOptimizer.loadProgressively(img, src, options);

export const clearImageCache = () => imageOptimizer.clearCache();
export const getImageCacheStats = () => imageOptimizer.getCacheStats();