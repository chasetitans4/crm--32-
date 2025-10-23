"use client"

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, Home, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isDetailsExpanded: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private errorReportingEndpoint = '/api/error-reports';

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isDetailsExpanded: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID with extra safety
    let errorId = 'ERR_UNKNOWN';
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36);
      const randomPart = randomStr && randomStr.length > 2 ? randomStr.substring(2, 11) : 'fallback';
      errorId = `ERR_${timestamp}_${randomPart}`;
    } catch (e) {
      console.error('Failed to generate error ID:', e);
    }
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      // Create a safe error object to log
      const safeError = {
        errorId: this.state.errorId || 'no-id',
        message: this.getSafeErrorMessage(error),
        stack: this.getSafeErrorStack(error),
        componentStack: this.getSafeComponentStack(errorInfo),
        timestamp: this.getSafeTimestamp(),
        url: this.getSafeUrl(),
        userAgent: this.getSafeUserAgent()
      };

      console.error('Enhanced Error Boundary caught an error:', safeError);

      this.setState({ errorInfo });

      // Call custom error handler with safety check
      if (this.props.onError && typeof this.props.onError === 'function') {
        try {
          this.props.onError(error, errorInfo);
        } catch (handlerError) {
          console.error('Error in custom error handler:', handlerError);
        }
      }

      // Report error to monitoring service
      if (this.props.enableReporting) {
        this.reportError(error, errorInfo).catch(reportError => {
          console.error('Failed to report error:', reportError);
        });
      }
    } catch (catchError) {
      console.error('Critical error in componentDidCatch:', catchError);
      // Even if everything fails, at least update the state
      this.setState({ errorInfo });
    }
  }

  // Safe getter methods to prevent any undefined errors
  private getSafeErrorMessage(error: any): string {
    try {
      if (!error) return 'Unknown error';
      if (typeof error === 'string') return error;
      if (error.message && typeof error.message === 'string') return error.message;
      if (error.toString && typeof error.toString === 'function') {
        return error.toString();
      }
      return 'Unknown error';
    } catch {
      return 'Unknown error';
    }
  }

  private getSafeErrorStack(error: any): string {
    try {
      if (!error) return 'No stack trace';
      if (error.stack && typeof error.stack === 'string') return error.stack;
      return 'No stack trace';
    } catch {
      return 'No stack trace';
    }
  }

  private getSafeComponentStack(errorInfo: any): string {
    try {
      if (!errorInfo) return 'No component stack';
      if (errorInfo.componentStack && typeof errorInfo.componentStack === 'string') {
        return errorInfo.componentStack;
      }
      return 'No component stack';
    } catch {
      return 'No component stack';
    }
  }

  private getSafeTimestamp(): string {
    try {
      return new Date().toISOString();
    } catch {
      return 'Unknown time';
    }
  }

  private getSafeUrl(): string {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.href) {
        return window.location.href;
      }
      return 'SSR';
    } catch {
      return 'Unknown URL';
    }
  }

  private getSafeUserAgent(): string {
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
        return window.navigator.userAgent;
      }
      return 'SSR';
    } catch {
      return 'Unknown User Agent';
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    if (!this.props.enableReporting || typeof window === 'undefined') return;

    try {
      const errorReport = {
        errorId: this.state.errorId || 'unknown',
        message: this.getSafeErrorMessage(error),
        stack: this.getSafeErrorStack(error),
        componentStack: this.getSafeComponentStack(errorInfo),
        timestamp: this.getSafeTimestamp(),
        userAgent: this.getSafeUserAgent(),
        url: this.getSafeUrl(),
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'
      };

      const response = await fetch(this.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });

      if (!response.ok) {
        console.warn('Error report failed with status:', response.status);
      }
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  };

  private getUserId = (): string => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const userId = localStorage.getItem('userId');
        return userId || 'anonymous';
      }
      return 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  private getSessionId = (): string => {
    try {
      if (typeof window === 'undefined') return 'ssr-session';
      
      if (typeof sessionStorage !== 'undefined') {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36);
          const randomPart = randomStr && randomStr.length > 2 ? randomStr.substring(2, 11) : 'fallback';
          sessionId = `session_${timestamp}_${randomPart}`;
          try {
            sessionStorage.setItem('sessionId', sessionId);
          } catch {
            // Session storage might be disabled
          }
        }
        return sessionId || `fallback_${Date.now()}`;
      }
      return `fallback_${Date.now()}`;
    } catch {
      return `fallback_${Date.now()}`;
    }
  };

  private handleRetry = () => {
    try {
      if (this.state.retryCount < this.maxRetries) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: this.state.retryCount + 1,
          isDetailsExpanded: false
        });
      }
    } catch (e) {
      console.error('Error in handleRetry:', e);
    }
  };

  private handleGoHome = () => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/';
      }
    } catch (e) {
      console.error('Error navigating home:', e);
    }
  };

  private handleReportIssue = () => {
    try {
      if (typeof window === 'undefined') return;
      
      const errorId = this.state.errorId || 'unknown';
      const errorMessage = this.getSafeErrorMessage(this.state.error);
      const timestamp = this.getSafeTimestamp();
      const url = this.getSafeUrl();
      
      const subject = encodeURIComponent(`Error Report: ${errorId}`);
      const body = encodeURIComponent(
        `Error ID: ${errorId}\n` +
        `Timestamp: ${timestamp}\n` +
        `Error: ${errorMessage}\n` +
        `URL: ${url}\n\n` +
        `Please describe what you were doing when this error occurred:\n\n`
      );
      
      window.open(`mailto:support@yourcompany.com?subject=${subject}&body=${body}`);
    } catch (e) {
      console.error('Error opening email client:', e);
    }
  };

  private toggleDetails = () => {
    try {
      this.setState(prevState => ({ 
        isDetailsExpanded: !prevState.isDetailsExpanded 
      }));
    } catch (e) {
      console.error('Error toggling details:', e);
    }
  };

  private getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    try {
      const error = this.state.error;
      if (!error) return 'low';

      const errorMessage = this.getSafeErrorMessage(error);
      const errorName = error.name || '';

      if (errorName === 'ChunkLoadError' || errorMessage.includes('Loading chunk')) {
        return 'low';
      }
      
      if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
        return 'medium';
      }
      
      if (errorName === 'TypeError' || errorName === 'ReferenceError') {
        return 'high';
      }
      
      return 'medium';
    } catch {
      return 'medium';
    }
  };

  private getErrorMessage = (): { title: string; description: string; suggestion: string } => {
    try {
      const error = this.state.error;
      const severity = this.getErrorSeverity();
      
      if (!error) {
        return {
          title: 'Something went wrong',
          description: 'An unexpected error occurred.',
          suggestion: 'Please try refreshing the page.'
        };
      }

      const errorMessage = this.getSafeErrorMessage(error);
      const errorName = error.name || '';

      if (errorName === 'ChunkLoadError' || errorMessage.includes('Loading chunk')) {
        return {
          title: 'Loading Error',
          description: 'Failed to load application resources.',
          suggestion: 'This usually happens after an app update. Please refresh the page.'
        };
      }
      
      if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
        return {
          title: 'Connection Error',
          description: 'Unable to connect to the server.',
          suggestion: 'Please check your internet connection and try again.'
        };
      }
      
      if (severity === 'high') {
        return {
          title: 'Application Error',
          description: 'A critical error occurred in the application.',
          suggestion: 'Please report this issue to our support team.'
        };
      }
      
      return {
        title: 'Unexpected Error',
        description: errorMessage || 'An unexpected error occurred.',
        suggestion: 'Please try again or contact support if the problem persists.'
      };
    } catch {
      return {
        title: 'Something went wrong',
        description: 'An unexpected error occurred.',
        suggestion: 'Please try refreshing the page.'
      };
    }
  };

  private getSafeDate(): string {
    try {
      return new Date().toLocaleString();
    } catch {
      return 'Unknown date';
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description, suggestion } = this.getErrorMessage();
      const severity = this.getErrorSeverity();
      const canRetry = this.props.enableRetry !== false && this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <AlertTriangle 
                  className={`h-16 w-16 ${
                    severity === 'high' ? 'text-red-500' :
                    severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} 
                />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {title}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription className="text-center">
                  {suggestion}
                </AlertDescription>
              </Alert>

              <div className="text-center text-sm text-gray-500">
                Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId || 'unknown'}</code>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                
                {this.props.enableReporting && (
                  <Button variant="outline" onClick={this.handleReportIssue} className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Report Issue
                  </Button>
                )}
              </div>

              {this.props.showErrorDetails !== false && this.state.error && (
                <Collapsible>
                  <CollapsibleTrigger 
                    onClick={this.toggleDetails}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mx-auto cursor-pointer"
                  >
                    {this.state.isDetailsExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {this.state.isDetailsExpanded ? 'Hide' : 'Show'} Technical Details
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className="bg-gray-100 p-4 rounded-lg text-sm">
                      <div className="mb-3">
                        <strong>Error Message:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-red-600">
                          {this.getSafeErrorMessage(this.state.error)}
                        </pre>
                      </div>
                      
                      {this.state.error && (
                        <div className="mb-3">
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-600 max-h-40 overflow-y-auto">
                            {this.getSafeErrorStack(this.state.error)}
                          </pre>
                        </div>
                      )}
                      
                      {this.state.errorInfo && (
                        <div className="mb-3">
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-600 max-h-40 overflow-y-auto">
                            {this.getSafeComponentStack(this.state.errorInfo)}
                          </pre>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <strong>Timestamp:</strong>
                        <span className="ml-2">{this.getSafeDate()}</span>
                      </div>
                      
                      <div>
                        <strong>URL:</strong>
                        <span className="ml-2 break-all">{this.getSafeUrl()}</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

// Hook for error reporting in functional components
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    try {
      console.error('Manual error report:', { 
        error: error || 'Unknown error', 
        context: context || 'No context',
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  };
  
  return { reportError };
};
