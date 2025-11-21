import React from "react";
import { handleReactError } from "../../../core/utils/errorHandler";
import { isDevelopment } from "../../../core/config/env";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 *
 * With custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourApp />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    const appError = handleReactError(error, errorInfo);

    // Store error details in state
    this.setState({
      error: appError,
      errorInfo,
    });

    // TODO: Send to error tracking service (Sentry)
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h1>

            <p className="mb-6 text-center text-gray-600">
              {isDevelopment
                ? this.state.error?.message || "An unexpected error occurred"
                : "We're sorry for the inconvenience. Please try refreshing the page."}
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <details className="mb-6 rounded-md bg-gray-100 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                  Error Details
                </summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Message:</p>
                    <pre className="mt-1 overflow-auto text-xs text-red-600">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.details?.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Component Stack:</p>
                      <pre className="mt-1 max-h-40 overflow-auto text-xs text-gray-700">
                        {this.state.error.details.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-center text-xs text-gray-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to reset error boundary from child components
 * Useful for retry functionality
 *
 * Note: This requires the error boundary to expose a reset function
 * via a ref or context. For now, page reload is simpler.
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

export default ErrorBoundary;
