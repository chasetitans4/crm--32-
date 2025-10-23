'use client';

import React, { useState, useEffect } from 'react';
import { usePWA } from '@/utils/pwa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Smartphone, Monitor, Wifi, WifiOff, RefreshCw, Trash2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface PWAInstallPromptProps {
  className?: string;
  showInHeader?: boolean;
}

export function PWAInstallPrompt({ className, showInHeader = false }: PWAInstallPromptProps) {
  const {
    isInstalled,
    installPrompt,
    updateAvailable,
    isOnline,
    install,
    update,
    getStorageEstimate,
    clearCaches,
    getCacheUsage
  } = usePWA();

  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [cacheInfo, setCacheInfo] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStorageInfo();
    loadCacheInfo();
  }, []);

  const loadStorageInfo = async () => {
    const info = await getStorageEstimate();
    setStorageInfo(info);
  };

  const loadCacheInfo = async () => {
    const info = await getCacheUsage();
    setCacheInfo(info);
  };

  const handleClearCaches = async () => {
    await clearCaches();
    await loadStorageInfo();
    await loadCacheInfo();
  };

  // Header version - compact
  if (showInHeader) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Online/Offline indicator */}
        <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>

        {/* Update available */}
        {updateAvailable && (
          <Button
            size="sm"
            variant="outline"
            onClick={update}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Update
          </Button>
        )}

        {/* Install prompt */}
        {installPrompt && !isInstalled && (
          <Button
            size="sm"
            onClick={install}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Install App
          </Button>
        )}

        {/* PWA info dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>PWA Information</DialogTitle>
              <DialogDescription>
                Progressive Web App status and management
              </DialogDescription>
            </DialogHeader>
            <PWADetailsContent
              isInstalled={isInstalled}
              isOnline={isOnline}
              storageInfo={storageInfo}
              cacheInfo={cacheInfo}
              onClearCaches={handleClearCaches}
              onRefresh={() => {
                loadStorageInfo();
                loadCacheInfo();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full component version
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Progressive Web App
          <Badge variant={isInstalled ? 'default' : 'secondary'}>
            {isInstalled ? 'Installed' : 'Available'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Install this app on your device for a better experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection status */}
        <Alert>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <AlertDescription>
              {isOnline ? 'Connected to internet' : 'Working offline'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Update available */}
        {updateAvailable && (
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>App update available</span>
              <Button size="sm" onClick={update}>
                Update Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Install prompt */}
        {installPrompt && !isInstalled && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="text-sm font-medium">Install on your device</span>
            </div>
            <Button onClick={install} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install CRM App
            </Button>
            <p className="text-xs text-muted-foreground">
              Get faster access, offline support, and native app experience
            </p>
          </div>
        )}

        {/* Already installed */}
        {isInstalled && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              App is installed and ready to use offline
            </AlertDescription>
          </Alert>
        )}

        {/* PWA Details */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>PWA Details</DialogTitle>
              <DialogDescription>
                Progressive Web App information and management
              </DialogDescription>
            </DialogHeader>
            <PWADetailsContent
              isInstalled={isInstalled}
              isOnline={isOnline}
              storageInfo={storageInfo}
              cacheInfo={cacheInfo}
              onClearCaches={handleClearCaches}
              onRefresh={() => {
                loadStorageInfo();
                loadCacheInfo();
              }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface PWADetailsContentProps {
  isInstalled: boolean;
  isOnline: boolean;
  storageInfo: any;
  cacheInfo: any[];
  onClearCaches: () => void;
  onRefresh: () => void;
}

function PWADetailsContent({
  isInstalled,
  isOnline,
  storageInfo,
  cacheInfo,
  onClearCaches,
  onRefresh
}: PWADetailsContentProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
        <TabsTrigger value="cache">Cache</TabsTrigger>
      </TabsList>

      <TabsContent value="status" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? 'Installed' : 'Not Installed'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>✅ Offline support</li>
              <li>✅ Background sync</li>
              <li>✅ Push notifications</li>
              <li>✅ App shortcuts</li>
              <li>✅ Native app experience</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="storage" className="space-y-4">
        {storageInfo && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used</span>
                  <span>{formatBytes(storageInfo.usage || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available</span>
                  <span>{formatBytes(storageInfo.quota || 0)}</span>
                </div>
                <Progress value={storageInfo.usagePercentage || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {(storageInfo.usagePercentage || 0).toFixed(1)}% used
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="cache" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Cache Management</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button size="sm" variant="destructive" onClick={onClearCaches}>
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {cacheInfo.map((cache, index) => (
            <Card key={index}>
              <CardContent className="pt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{cache.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cache.entries} entries
                    </p>
                  </div>
                  <Badge variant="outline">{cache.entries}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cacheInfo.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No cache data available
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default PWAInstallPrompt;