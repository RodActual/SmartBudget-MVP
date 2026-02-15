import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React errors in child components and displays a fallback UI
 * instead of crashing the entire app.
 * 
 * Usage:
 * <ErrorBoundary name="Charts">
 *   <ChartsInsights />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error tracking service:
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {this.props.name ? `${this.props.name} Error` : "Something went wrong"}
            </CardTitle>
            <CardDescription className="text-red-700">
              {this.props.name 
                ? `There was an error loading the ${this.props.name} section.`
                : "An unexpected error occurred."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error message (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="rounded-md bg-red-100 p-3 text-sm">
                <p className="font-semibold text-red-900 mb-1">Error Details:</p>
                <p className="text-red-700 font-mono text-xs break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="border-slate-300"
              >
                Reload Page
              </Button>
            </div>

            {/* Help text */}
            <p className="text-xs text-slate-600">
              If this problem persists, try refreshing the page or clearing your browser cache.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}