// PWA utilities for service worker registration and installation

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPrompt {
  isInstallable: boolean;
  isInstalled: boolean;
  prompt: (() => Promise<void>) | null;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> | null;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private installPromptShown = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Check if already installed
    this.isInstalled = this.checkIfInstalled();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallAvailable();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyAppInstalled();
    });

    // Register service worker
    await this.registerServiceWorker();
  }

  private checkIfInstalled(): boolean {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check if running as PWA on mobile
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // Check for TWA (Trusted Web Activity) on Android
    if (document.referrer.includes('android-app://')) {
      return true;
    }

    return false;
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.serviceWorkerRegistration = registration;

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async showInstallPrompt(): Promise<PWAInstallPrompt> {
    if (!this.deferredPrompt) {
      return {
        isInstallable: false,
        isInstalled: this.isInstalled,
        prompt: null,
        userChoice: null
      };
    }

    const prompt = async () => {
      if (this.deferredPrompt) {
        await this.deferredPrompt.prompt();
        this.installPromptShown = true;
      }
    };

    return {
      isInstallable: true,
      isInstalled: this.isInstalled,
      prompt,
      userChoice: this.deferredPrompt.userChoice
    };
  }

  getInstallationStatus() {
    return {
      isInstalled: this.isInstalled,
      isInstallable: !!this.deferredPrompt,
      promptShown: this.installPromptShown,
      serviceWorkerActive: !!this.serviceWorkerRegistration?.active
    };
  }

  async updateServiceWorker(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      await this.serviceWorkerRegistration.update();
      return true;
    } catch (error) {
      console.error('Service Worker update failed:', error);
      return false;
    }
  }

  async skipWaiting(): Promise<void> {
    if (this.serviceWorkerRegistration?.waiting) {
      this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private notifyInstallAvailable() {
    // Dispatch custom event for install availability
    window.dispatchEvent(new CustomEvent('pwa-install-available', {
      detail: { canInstall: true }
    }));
  }

  private notifyAppInstalled() {
    // Dispatch custom event for app installation
    window.dispatchEvent(new CustomEvent('pwa-installed', {
      detail: { installed: true }
    }));
  }

  private notifyUpdateAvailable() {
    // Dispatch custom event for update availability
    window.dispatchEvent(new CustomEvent('pwa-update-available', {
      detail: { updateAvailable: true }
    }));
  }

  // Offline detection
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Network information (if available)
  getNetworkInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }

    return null;
  }

  // Storage estimation
  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: estimate.quota ? (estimate.usage! / estimate.quota) * 100 : 0
        };
      } catch (error) {
        console.error('Storage estimate failed:', error);
      }
    }
    return null;
  }

  // Clear all caches
  async clearCaches(): Promise<boolean> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    } catch (error) {
      console.error('Cache clearing failed:', error);
      return false;
    }
  }

  // Get cache usage
  async getCacheUsage() {
    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            entries: keys.length,
            urls: keys.map(req => req.url)
          };
        })
      );
      return cacheInfo;
    } catch (error) {
      console.error('Cache usage check failed:', error);
      return [];
    }
  }
}

// Singleton instance
const pwaManager = new PWAManager();

// Export utilities
export { pwaManager, PWAManager };
export type { PWAInstallPrompt, BeforeInstallPromptEvent };

// Convenience functions
export const registerPWA = () => pwaManager.registerServiceWorker();
export const showInstallPrompt = () => pwaManager.showInstallPrompt();
export const getInstallationStatus = () => pwaManager.getInstallationStatus();
export const updateServiceWorker = () => pwaManager.updateServiceWorker();
export const isAppInstalled = () => pwaManager.getInstallationStatus().isInstalled;
export const isOnline = () => pwaManager.isOnline();
export const getNetworkInfo = () => pwaManager.getNetworkInfo();
export const getStorageEstimate = () => pwaManager.getStorageEstimate();
export const clearAllCaches = () => pwaManager.clearCaches();
export const getCacheUsage = () => pwaManager.getCacheUsage();

// React hook for PWA functionality
export function usePWA() {
  const [installPrompt, setInstallPrompt] = React.useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    // Initial status
    const status = getInstallationStatus();
    setIsInstalled(status.isInstalled);

    // Listen for PWA events
    const handleInstallAvailable = () => {
      showInstallPrompt().then(setInstallPrompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleAppInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleAppInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = async () => {
    if (installPrompt?.prompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    }
  };

  const update = async () => {
    await updateServiceWorker();
    await pwaManager.skipWaiting();
    setUpdateAvailable(false);
    window.location.reload();
  };

  return {
    isInstalled,
    installPrompt,
    updateAvailable,
    isOnline,
    install,
    update,
    getStorageEstimate,
    clearCaches: clearAllCaches,
    getCacheUsage
  };
}

// Add React import for the hook
import React from 'react';