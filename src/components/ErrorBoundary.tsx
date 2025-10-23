'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorTracker } from '@/utils/errorTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableReporting?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
  level?: 'page' | 'component' | 'feature';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  copied: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorTracker: ErrorTracker;
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      copied: false
    };
    
    this.errorTracker = new ErrorTracker();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true } = this.props;
    
    // Track error with our error tracking system
    if (enableReporting) {
      const errorId = this.errorTracker.captureError(error, {
        category: 'react',
        severity: this.determineSeverity(error),
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
          level: this.props.level || 'component',
          retryCount: this.state.retryCount,
          props: this.sanitizeProps(this.props)
        },
        tags: {
          errorBoundary: true,
          level: this.props.level || 'component'
        }
      });
      
      this.setState({ errorId });
    }
    
    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
    
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.children !== this.props.children) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
    
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const { level } = this.props;
    
    // Critical errors
    if (level === 'page' || error.name === 'ChunkLoadError') {
      return 'critical';
    }
    
    // High severity errors
    if (
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'TypeError'
    ) {
      return 'high';
    }
    
    // Medium severity for component level
    if (level === 'component') {
      return 'medium';
    }
    
    return 'low';
  }

  private sanitizeProps(props: ErrorBoundaryProps): Record<string, any> {
    const { children, onError, ...sanitizedProps } = props;
    return {
      ...sanitizedProps,
      hasChildren: !!children,
      hasOnError: !!onError
    };
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }
    
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      this.setState({ copied: true });
      
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  private renderErrorDetails() {
    const { error, errorInfo, errorId } = this.state;
    const { showErrorDetails = process.env.NODE_ENV === 'development' } = this.props;
    
    if (!showErrorDetails || !error) {
      return null;
    }
    
    return (
      <div className="mt-6 space-y-4">
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Error Details
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Message</label>
              <pre className="text-sm bg-muted p-3 rounded mt-1 overflow-auto">
                {error.message}
              </pre>
            </div>
            
            {errorId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Error ID</label>
                <pre className="text-sm bg-muted p-3 rounded mt-1 font-mono">
                  {errorId}
                </pre>
              </div>
            )}
            
            {error.stack && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stack Trace</label>
                <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </div>
            )}
            
            {errorInfo?.componentStack && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Component Stack</label>
                <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={this.copyErrorDetails}
              className="flex items-center"
            >
              {this.state.copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Details
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private renderFallbackUI() {
    const { level = 'component' } = this.props;
    const { retryCount, error } = this.state;
    const canRetry = retryCount < this.maxRetries;
    
    const getTitle = () => {
      switch (level) {
        case 'page': return 'Page Error';
        case 'feature': return 'Feature Unavailable';
        default: return 'Something went wrong';
      }
    };
    
    const getDescription = () => {
      switch (level) {
        case 'page':
          return 'This page encountered an error and cannot be displayed. Please try refreshing the page or go back to the homepage.';
        case 'feature':
          return 'This feature is temporarily unavailable due to an error. You can try again or continue using other parts of the application.';
        default:
          return 'This component encountered an error. You can try reloading it or refresh the page.';
      }
    };
    
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {getTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getDescription()}
              </AlertDescription>
            </Alert>
            
            {error && (
              <div className="text-sm text-muted-foreground">
                <strong>Error:</strong> {error.message}
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              {canRetry && (
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
            
            {retryCount >= this.maxRetries && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Maximum retry attempts reached. Please reload the page or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            )}
            
            {this.renderErrorDetails()}
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback, isolate = false } = this.props;
    
    if (hasError) {
      if (fallback) {
        return fallback;
      }
      
      if (isolate) {
        return (
          <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
            {this.renderFallbackUI()}
          </div>
        );
      }
      
      return this.renderFallbackUI();
    }
    
    return children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for programmatic error boundary reset
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { captureError, resetError };
};

export default ErrorBoundary;