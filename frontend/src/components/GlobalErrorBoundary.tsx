import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { FortisLogo } from "./FortisLogo";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary
 * 
 * Wraps the entire application to catch any unhandled errors.
 * Shows a full-page error screen with recovery options.
 * This is the last line of defense against white screen crashes.
 */
export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Global Error Boundary caught an error:", error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // In production, send to error tracking service:
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Logo & Brand */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3 bg-[#001D3D] px-6 py-3 rounded-lg shadow-lg">
                <FortisLogo className="h-10 w-10" />
                <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
                  FortisBudget
                </h1>
              </div>
            </div>

            {/* Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-red-50 border-b border-red-200 px-8 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-900">
                    Oops! Something went wrong
                  </h2>
                </div>
                <p className="text-red-700">
                  We encountered an unexpected error. Don't worry — your data is safe.
                </p>
              </div>

              {/* Content */}
              <div className="px-8 py-6 space-y-6">
                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      Error Details (Development Mode):
                    </p>
                    <div className="space-y-2">
                      <div className="font-mono text-xs bg-white p-3 rounded border border-slate-200 break-all">
                        <span className="text-red-600 font-bold">Error:</span>{" "}
                        <span className="text-slate-900">{this.state.error.message}</span>
                      </div>
                      {this.state.error.stack && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium">
                            View Stack Trace
                          </summary>
                          <pre className="mt-2 p-3 bg-white rounded border border-slate-200 overflow-x-auto text-slate-700">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                {/* What to do */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">What you can do:</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Try reloading the page using the button below</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Clear your browser cache and reload</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>If the problem persists, try logging out and back in</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={this.handleReload}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Reload Application
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg border border-slate-300 transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    Go to Home
                  </button>
                </div>

                {/* Footer Note */}
                <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
                  <p>
                    <strong>Note:</strong> Your financial data is stored securely in our database
                    and has not been affected by this error.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Need help? Contact support or check our{" "}
              <a href="/help" className="text-blue-600 hover:underline">
                help center
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}