// Dynamic import utilities for advanced code splitting
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Enhanced loading component with skeleton
const LoadingComponent = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-pulse space-y-4 w-full max-w-md">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="text-sm text-gray-500 text-center">Loading {name}...</div>
    </div>
  </div>
);

// Core CRM components with enhanced loading
export const LazyDashboard = dynamic(() => import('../components/Dashboard'), {
  loading: () => <LoadingComponent name="Dashboard" />,
  ssr: false
});

export const LazyReports = dynamic(() => import('../components/Reports'), {
  loading: () => <LoadingComponent name="Reports" />,
  ssr: false
});

export const LazyPipeline = dynamic(() => import('../components/Pipeline'), {
  loading: () => <LoadingComponent name="Pipeline" />,
  ssr: false
});

export const LazyClients = dynamic(() => import('../components/Clients'), {
  loading: () => <LoadingComponent name="Clients" />,
  ssr: false
});

export const LazyTasks = dynamic(() => import('../components/Tasks'), {
  loading: () => <LoadingComponent name="Tasks" />,
  ssr: false
});

// Advanced CRM features (lazy loaded)
export const LazyAdvancedAnalytics = dynamic(() => import('../components/AdvancedAnalytics'), {
  loading: () => <LoadingComponent name="Advanced Analytics" />,
  ssr: false
});

export const LazyAutomationWorkflows = dynamic(() => import('../components/AutomationWorkflows'), {
  loading: () => <LoadingComponent name="Automation Workflows" />,
  ssr: false
});

// MarketingCampaigns component not available - using AutomationWorkflows for marketing features
export const LazyMarketingCampaigns = dynamic(() => import('../components/AutomationWorkflows'), {
  loading: () => <LoadingComponent name="Marketing Campaigns" />,
  ssr: false
});

// Performance monitoring components
export const LazyPerformanceMonitor = dynamic(() => import('../components/performance/PerformanceMonitor'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading Performance Monitor...</div>,
  ssr: false
});

export const LazyPerformanceDashboard = dynamic(() => import('../components/performance/PerformanceDashboard'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading Performance Dashboard...</div>,
  ssr: false
});

// Chart components (heavy dependencies)
export const LazyRechartsComponents = {
  LineChart: dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart as ComponentType<any> })), { ssr: false }),
  BarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart as ComponentType<any> })), { ssr: false }),
  PieChart: dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart as ComponentType<any> })), { ssr: false }),
  AreaChart: dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart as ComponentType<any> })), { ssr: false }),
  ResponsiveContainer: dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer as ComponentType<any> })), { ssr: false }),
  XAxis: dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis as ComponentType<any> })), { ssr: false }),
  YAxis: dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis as ComponentType<any> })), { ssr: false }),
  CartesianGrid: dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid as ComponentType<any> })), { ssr: false }),
  Tooltip: dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip as ComponentType<any> })), { ssr: false }),
  Legend: dynamic(() => import('recharts').then(mod => ({ default: mod.Legend as ComponentType<any> })), { ssr: false }),
  Bar: dynamic(() => import('recharts').then(mod => ({ default: mod.Bar as any })), { ssr: false }),
  Line: dynamic(() => import('recharts').then(mod => ({ default: mod.Line as any })), { ssr: false }),
  Pie: dynamic(() => import('recharts').then(mod => ({ default: mod.Pie as any })), { ssr: false }),
  Cell: dynamic(() => import('recharts').then(mod => ({ default: mod.Cell as ComponentType<any> })), { ssr: false })
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
    loading: () => {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }
      return <div>Loading...</div>;
    },
    ssr: false
  });
}

// Enhanced preloading strategies
interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  delay: number;
  condition?: () => boolean;
}

const preloadMap: Record<string, PreloadConfig> = {
  dashboard: { priority: 'high', delay: 1000 },
  clients: { priority: 'high', delay: 1500 },
  pipeline: { priority: 'high', delay: 2000 },
  reports: { priority: 'medium', delay: 3000 },
  tasks: { priority: 'medium', delay: 2500 },
  analytics: { priority: 'low', delay: 5000 },
  automation: { priority: 'low', delay: 6000 },
  marketing: { priority: 'low', delay: 7000 }
};

// Intelligent preloading based on user behavior
export function preloadCriticalComponents() {
  if (typeof window === 'undefined') return;

  // Preload high priority components first
  Object.entries(preloadMap)
    .filter(([_, config]) => config.priority === 'high')
    .forEach(([component, config]) => {
      setTimeout(() => {
        switch (component) {
          case 'dashboard':
            import('../components/Dashboard');
            break;
          case 'clients':
            import('../components/Clients');
            break;
          case 'pipeline':
            import('../components/Pipeline');
            break;
        }
      }, config.delay);
    });

  // Preload medium priority components
  setTimeout(() => {
    Object.entries(preloadMap)
      .filter(([_, config]) => config.priority === 'medium')
      .forEach(([component, config]) => {
        setTimeout(() => {
          switch (component) {
            case 'reports':
              import('../components/Reports');
              break;
            case 'tasks':
              import('../components/Tasks');
              break;
          }
        }, config.delay - 3000);
      });
  }, 3000);

  // Preload heavy libraries after core components
  setTimeout(() => {
    import('recharts');
    import('lucide-react');
  }, 4000);
}

// Advanced route-based preloading with user behavior prediction
export function preloadBasedOnRoute(currentRoute: string, userHistory?: string[]) {
  if (typeof window === 'undefined') return;

  const routePreloadMap: Record<string, string[]> = {
    '/dashboard': ['reports', 'pipeline', 'clients'],
    '/clients': ['tasks', 'pipeline', 'reports'],
    '/reports': ['dashboard', 'analytics'],
    '/pipeline': ['clients', 'tasks'],
    '/tasks': ['clients', 'pipeline'],
    '/analytics': ['reports', 'dashboard'],
    '/automation': ['tasks', 'pipeline'],
    '/marketing': ['clients', 'analytics']
  };

  // Preload based on current route
  const componentsToPreload = routePreloadMap[currentRoute] || [];
  
  componentsToPreload.forEach((component, index) => {
    setTimeout(() => {
      switch (component) {
        case 'dashboard':
          import('../components/Dashboard');
          break;
        case 'clients':
          import('../components/Clients');
          break;
        case 'reports':
          import('../components/Reports');
          break;
        case 'pipeline':
          import('../components/Pipeline');
          break;
        case 'tasks':
          import('../components/Tasks');
          break;
        case 'analytics':
          import('../components/AdvancedAnalytics');
          break;
      }
    }, (index + 1) * 1000);
  });

  // Predictive preloading based on user history
  if (userHistory && userHistory.length > 0) {
    const mostVisited = userHistory
      .reduce((acc, route) => {
        acc[route] = (acc[route] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topRoutes = Object.entries(mostVisited)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([route]) => route);
    
    topRoutes.forEach((route, index) => {
      if (route !== currentRoute) {
        setTimeout(() => {
          preloadBasedOnRoute(route);
        }, (index + 3) * 1000);
      }
    });
  }
}

// Preload on user interaction (hover, focus)
export function preloadOnInteraction(componentName: string) {
  if (typeof window === 'undefined') return;
  
  const preloadFunctions: Record<string, () => Promise<any>> = {
    dashboard: () => import('../components/Dashboard'),
    clients: () => import('../components/Clients'),
    reports: () => import('../components/Reports'),
    pipeline: () => import('../components/Pipeline'),
    tasks: () => import('../components/Tasks'),
    analytics: () => import('../components/AdvancedAnalytics'),
    automation: () => import('../components/AutomationWorkflows'),
    marketing: () => import('../components/AutomationWorkflows')
  };
  
  const preloadFn = preloadFunctions[componentName];
  if (preloadFn) {
    preloadFn().catch(console.error);
  }
}

// Bundle size monitoring
export function getBundleMetrics() {
  if (typeof window === 'undefined') return null;
  
  return {
    loadedChunks: (window as any).__webpack_require__?.cache ? Object.keys((window as any).__webpack_require__.cache).length : 0,
    memoryUsage: (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
    } : null
  };
}
