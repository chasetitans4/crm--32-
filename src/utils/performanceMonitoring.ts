// Performance monitoring setup
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Web Vitals tracking
export function setupWebVitals() {
  if (typeof window === 'undefined') return;
  
  onCLS(console.log);
  onINP(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
}

// Performance observer for custom metrics
export function setupPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('Performance entry:', entry);
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return;
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('chunk') || entry.name.includes('bundle')) {
        const resourceEntry = entry as PerformanceResourceTiming;
        console.log('Bundle loaded:', {
          name: entry.name,
          size: resourceEntry.transferSize,
          loadTime: entry.duration
        });
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
}
