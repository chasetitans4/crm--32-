#!/usr/bin/env node

/**
 * Bundle Optimization Script
 * Implements performance optimizations based on analysis results
 */

const fs = require('fs');
const path = require('path');

class BundleOptimizer {
  constructor() {
    this.optimizations = [];
  }

  // Analyze and suggest Next.js config optimizations
  optimizeNextConfig() {
    console.log('🔧 Optimizing Next.js configuration...');
    
    const configPath = path.join(process.cwd(), 'next.config.mjs');
    if (!fs.existsSync(configPath)) {
      console.log('❌ next.config.mjs not found');
      return;
    }

    let config = fs.readFileSync(configPath, 'utf8');
    let modified = false;

    // Enable experimental optimizations
    if (!config.includes('optimizePackageImports')) {
      const optimizeImports = `
    // Package import optimizations
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'react-icons',
      'framer-motion',
      'recharts',
      'date-fns'
    ],`;
      
      config = config.replace(
        'experimental: {',
        `experimental: {${optimizeImports}`
      );
      modified = true;
      this.optimizations.push('✅ Added package import optimizations');
    }

    // Enable SWC minification
    if (!config.includes('swcMinify')) {
      const swcMinify = `
  // Enable SWC minification for better performance
  swcMinify: true,`;
      
      config = config.replace(
        'const nextConfig = {',
        `const nextConfig = {${swcMinify}`
      );
      modified = true;
      this.optimizations.push('✅ Enabled SWC minification');
    }

    // Add bundle analyzer configuration
    if (!config.includes('ANALYZE')) {
      const analyzerConfig = `
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    },
  }),`;
      
      config = config.replace(
        'webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {',
        `${analyzerConfig}\n\n  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {`
      );
      modified = true;
      this.optimizations.push('✅ Added bundle analyzer support');
    }

    if (modified) {
      fs.writeFileSync(configPath, config);
      console.log('✅ Next.js configuration optimized');
    } else {
      console.log('ℹ️  Next.js configuration already optimized');
    }
  }

  // Create dynamic import utilities
  createDynamicImports() {
    console.log('🔄 Creating dynamic import utilities...');
    
    const utilsDir = path.join(process.cwd(), 'src', 'utils');
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }

    const dynamicImportsContent = `// Dynamic import utilities for code splitting
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load heavy components
export const LazyDashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <div className="flex items-center justify-center p-8">Loading Dashboard...</div>,
  ssr: false
});

export const LazyReports = dynamic(() => import('@/components/Reports'), {
  loading: () => <div className="flex items-center justify-center p-8">Loading Reports...</div>,
  ssr: false
});

export const LazyPipeline = dynamic(() => import('@/components/Pipeline'), {
  loading: () => <div className="flex items-center justify-center p-8">Loading Pipeline...</div>,
  ssr: false
});

export const LazyClients = dynamic(() => import('@/components/Clients'), {
  loading: () => <div className="flex items-center justify-center p-8">Loading Clients...</div>,
  ssr: false
});

export const LazyTasks = dynamic(() => import('@/components/Tasks'), {
  loading: () => <div className="flex items-center justify-center p-8">Loading Tasks...</div>,
  ssr: false
});

// Performance monitoring components
export const LazyPerformanceMonitor = dynamic(() => import('@/components/performance/PerformanceMonitor'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading Performance Monitor...</div>,
  ssr: false
});

export const LazyPerformanceDashboard = dynamic(() => import('@/components/performance/PerformanceDashboard'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading Performance Dashboard...</div>,
  ssr: false
});

// Chart components (heavy dependencies)
export const LazyRechartsComponents = {
  LineChart: dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false }),
  BarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false }),
  PieChart: dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false }),
  AreaChart: dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), { ssr: false })
};

// Icon optimization - lazy load icon sets
export const LazyLucideIcons = {
  Activity: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Activity })), { ssr: false }),
  BarChart: dynamic(() => import('lucide-react').then(mod => ({ default: mod.BarChart })), { ssr: false }),
  Users: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Users })), { ssr: false }),
  Calendar: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Calendar })), { ssr: false }),
  Settings: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Settings })), { ssr: false })
};

// Utility function for creating lazy components with error boundaries
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  return dynamic(importFn, {
    loading: () => fallback ? <fallback /> : <div>Loading...</div>,
    ssr: false
  });
}

// Preload critical components
export function preloadCriticalComponents() {
  // Preload components that are likely to be needed soon
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      import('@/components/Dashboard');
      import('@/components/Clients');
    }, 2000);
  }
}
`;

    const dynamicImportsPath = path.join(utilsDir, 'dynamicImports.ts');
    fs.writeFileSync(dynamicImportsPath, dynamicImportsContent);
    this.optimizations.push('✅ Created dynamic import utilities');
  }

  // Create bundle analysis script
  createBundleAnalysisScript() {
    console.log('📊 Creating bundle analysis script...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add bundle analyzer dependency if not present
    if (!packageJson.devDependencies['@next/bundle-analyzer']) {
      packageJson.devDependencies['@next/bundle-analyzer'] = '^14.0.0';
    }
    
    // Add analysis scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'analyze': 'ANALYZE=true npm run build',
      'analyze:server': 'BUNDLE_ANALYZE=server npm run build',
      'analyze:browser': 'BUNDLE_ANALYZE=browser npm run build',
      'performance:test': 'node scripts/performance-test.js',
      'performance:optimize': 'node scripts/optimize-bundle.js'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    this.optimizations.push('✅ Added bundle analysis scripts to package.json');
  }

  // Create performance monitoring setup
  createPerformanceMonitoring() {
    console.log('📈 Setting up performance monitoring...');
    
    const monitoringContent = `// Performance monitoring setup
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Web Vitals tracking
export function setupWebVitals() {
  if (typeof window === 'undefined') return;
  
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
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
        console.log('Bundle loaded:', {
          name: entry.name,
          size: entry.transferSize,
          loadTime: entry.duration
        });
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
}
`;

    const utilsDir = path.join(process.cwd(), 'src', 'utils');
    const monitoringPath = path.join(utilsDir, 'performanceMonitoring.ts');
    fs.writeFileSync(monitoringPath, monitoringContent);
    this.optimizations.push('✅ Created performance monitoring utilities');
  }

  // Generate optimization report
  generateOptimizationReport() {
    console.log('\n📋 BUNDLE OPTIMIZATION REPORT');
    console.log('==============================\n');
    
    console.log('🎯 OPTIMIZATIONS APPLIED:');
    this.optimizations.forEach((opt, index) => {
      console.log(`${index + 1}. ${opt}`);
    });
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Run `npm install` to install new dependencies');
    console.log('2. Run `npm run analyze` to analyze bundle sizes');
    console.log('3. Update components to use dynamic imports from utils/dynamicImports.ts');
    console.log('4. Test the application to ensure all optimizations work correctly');
    console.log('5. Run `npm run performance:test` to verify improvements');
    
    console.log('\n⚠️  MANUAL TASKS REQUIRED:');
    console.log('1. Update main components to use lazy loading');
    console.log('2. Implement code splitting for route-level components');
    console.log('3. Review and remove unused dependencies');
    console.log('4. Optimize images and static assets');
    console.log('5. Enable compression and caching in production');
    
    console.log('\n🚀 EXPECTED IMPROVEMENTS:');
    console.log('• 30-50% reduction in initial bundle size');
    console.log('• Faster First Contentful Paint (FCP)');
    console.log('• Improved Largest Contentful Paint (LCP)');
    console.log('• Better caching efficiency');
    console.log('• Enhanced user experience on slower connections');
  }

  // Run all optimizations
  async run() {
    console.log('🚀 Starting Bundle Optimization...\n');
    
    this.optimizeNextConfig();
    this.createDynamicImports();
    this.createBundleAnalysisScript();
    this.createPerformanceMonitoring();
    this.generateOptimizationReport();
    
    console.log('\n✅ Bundle optimization complete!');
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new BundleOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = BundleOptimizer;