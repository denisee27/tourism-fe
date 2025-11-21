import React, { useState } from "react";
import api from "../../../core/api";
import { logger } from "../../../core/utils/logger";
import { useUIStore } from "../../../core/stores/uiStore";

/**
 * API Client Demo
 *
 * Demonstrates the enhanced API client features:
 * - Standard GET/POST/PUT/DELETE requests
 * - Paginated requests
 * - Retry logic
 * - Request cancellation
 * - Error handling
 * - Response transformation
 */

const APIDemo = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showSuccess, showError, showInfo } = useUIStore();

  const executeRequest = async (name, requestFn) => {
    setLoading(true);
    setResult(null);

    try {
      logger.info(`Executing: ${name}`);
      const data = await requestFn();

      setResult({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });

      showSuccess(`${name} succeeded!`);
    } catch (error) {
      setResult({
        success: false,
        error: {
          message: error.message,
          type: error.type,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      });

      logger.error(`${name} failed`, error);
    } finally {
      setLoading(false);
    }
  };

  // Test scenarios
  const handleGetRequest = () => {
    executeRequest("GET Request", () => api.get("/users"));
  };

  const handlePaginatedRequest = () => {
    executeRequest("Paginated GET", () =>
      api.getPaginated("/users", { params: { page: 1, limit: 10 } })
    );
  };

  const handlePostRequest = () => {
    executeRequest("POST Request", () =>
      api.post("/users", {
        name: "John Doe",
        email: "john@example.com",
      })
    );
  };

  const handlePutRequest = () => {
    executeRequest("PUT Request", () => api.put("/users/123", { name: "Jane Doe" }));
  };

  const handleDeleteRequest = () => {
    executeRequest("DELETE Request", () => api.delete("/users/123"));
  };

  const handleRetryableError = () => {
    showInfo("Simulating a 503 error (will retry automatically)");
    executeRequest("Retryable Error (503)", () => api.get("/simulate-503"));
  };

  const handleNonRetryableError = () => {
    showInfo("Simulating a 404 error (won't retry)");
    executeRequest("Non-Retryable Error (404)", () => api.get("/simulate-404"));
  };

  const handleValidationError = () => {
    showInfo("Simulating a 422 validation error");
    executeRequest("Validation Error (422)", () => api.post("/users", { invalid: "data" }));
  };

  const handleCancellableRequest = () => {
    showInfo("Making a cancellable request (cancel within 5 seconds)");

    // Make a slow request with cancel key
    executeRequest("Cancellable Request", async () => {
      const result = await api.get("/slow-endpoint", {
        cancelKey: "slow-request",
      });
      return result;
    });

    // Provide cancel option
    setTimeout(() => {
      const shouldCancel = window.confirm("Cancel the request?");
      if (shouldCancel) {
        api.cancelRequest("slow-request");
        showInfo("Request cancelled!");
        setLoading(false);
      }
    }, 2000);
  };

  const handleNoTransform = () => {
    executeRequest("Request Without Transform", () => api.get("/users", { transform: false }));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">API Client Demo</h1>
        <p className="text-gray-600 mb-8">
          Test the enhanced API client with automatic retries, error handling, and more.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Standard Requests */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">📡 Standard Requests</h2>

            <div className="space-y-3">
              <button
                onClick={handleGetRequest}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">GET</span> - Fetch users
              </button>

              <button
                onClick={handlePaginatedRequest}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">GET Paginated</span> - With meta data
              </button>

              <button
                onClick={handlePostRequest}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">POST</span> - Create user
              </button>

              <button
                onClick={handlePutRequest}
                disabled={loading}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">PUT</span> - Update user
              </button>

              <button
                onClick={handleDeleteRequest}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">DELETE</span> - Remove user
              </button>
            </div>
          </section>

          {/* Error Handling */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">⚠️ Error Handling</h2>

            <div className="space-y-3">
              <button
                onClick={handleRetryableError}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">503 Error</span> - Auto-retry
              </button>

              <button
                onClick={handleNonRetryableError}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">404 Error</span> - No retry
              </button>

              <button
                onClick={handleValidationError}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">422 Error</span> - Validation
              </button>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Note:</strong> These simulate different error scenarios. Check console for
                  retry logs.
                </p>
              </div>
            </div>
          </section>

          {/* Advanced Features */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">🚀 Advanced Features</h2>

            <div className="space-y-3">
              <button
                onClick={handleCancellableRequest}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">Cancel Request</span> - Abort in-flight
              </button>

              <button
                onClick={handleNoTransform}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <span className="font-medium">No Transform</span> - Raw response
              </button>

              <div className="pt-3 border-t">
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Automatic retry with backoff</li>
                  <li>✓ Request cancellation</li>
                  <li>✓ Response transformation</li>
                  <li>✓ Error mapping</li>
                  <li>✓ Upload/download support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Response Display */}
          <section className="bg-white rounded-lg p-6 shadow-md lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {loading ? "⏳ Loading..." : "📋 Response"}
            </h2>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {result.success ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <span className="text-2xl">❌</span>
                  )}
                  <span className="font-semibold">{result.success ? "Success" : "Error"}</span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <pre className="text-sm overflow-auto max-h-96 bg-white p-3 rounded">
                  {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                </pre>
              </div>
            )}

            {!loading && !result && (
              <div className="text-center py-8 text-gray-500">
                Click a button above to test the API client
              </div>
            )}
          </section>
        </div>

        {/* Features List */}
        <section className="bg-gray-900 text-gray-100 rounded-lg p-6 shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">✨ API Client Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">Request Methods</h3>
              <ul className="space-y-1">
                <li>
                  • <code>api.get(url, options)</code>
                </li>
                <li>
                  • <code>api.getPaginated(url, options)</code>
                </li>
                <li>
                  • <code>api.post(url, data, options)</code>
                </li>
                <li>
                  • <code>api.put(url, data, options)</code>
                </li>
                <li>
                  • <code>api.patch(url, data, options)</code>
                </li>
                <li>
                  • <code>api.delete(url, options)</code>
                </li>
                <li>
                  • <code>api.upload(url, formData, options)</code>
                </li>
                <li>
                  • <code>api.download(url, filename, options)</code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-green-400">Features</h3>
              <ul className="space-y-1">
                <li>✓ Automatic response transformation</li>
                <li>✓ Retry with exponential backoff</li>
                <li>✓ Request cancellation support</li>
                <li>✓ Error mapping (all HTTP codes)</li>
                <li>✓ Timeout handling</li>
                <li>✓ Upload progress tracking</li>
                <li>✓ File download helper</li>
                <li>✓ Automatic toast notifications</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-800 rounded">
            <p className="text-xs text-gray-400">
              <strong>Tip:</strong> Check the browser console to see detailed logs of API requests,
              responses, retries, and errors.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default APIDemo;
