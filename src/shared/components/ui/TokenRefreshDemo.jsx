import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../features/auth/stores/authStore";
import { tokenRefreshManager } from "../../../core/auth/tokenRefresh";
import { useUIStore } from "../../../core/stores/uiStore";
import { logger } from "../../../core/utils/logger";
import api from "../../../core/api";

/**
 * Token Refresh Demo Component
 *
 * Demonstrates and tests the token refresh system:
 * - Token expiry countdown
 * - Manual refresh trigger
 * - Automatic refresh scheduling
 * - Failed request retry after refresh
 * - Token decode visualization
 */

const TokenRefreshDemo = () => {
  const { accessToken, user } = useAuthStore();
  const showSuccess = useUIStore((state) => state.showSuccess);
  const showError = useUIStore((state) => state.showError);
  const showInfo = useUIStore((state) => state.showInfo);

  const [tokenInfo, setTokenInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Decode token and calculate expiry
  useEffect(() => {
    if (!accessToken) {
      setTokenInfo(null);
      setTimeRemaining(null);
      return;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      setTokenInfo(payload);

      // Calculate time remaining
      const updateTimer = () => {
        const remaining = tokenRefreshManager.getTimeUntilExpiry(accessToken);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    } catch (error) {
      logger.error("Failed to decode token", { error });
      setTokenInfo(null);
    }
  }, [accessToken]);

  // Manual refresh trigger
  const handleManualRefresh = async () => {
    setIsRefreshing(true);

    try {
      logger.info("Manual refresh triggered");

      // Trigger refresh
      tokenRefreshManager.triggerRefresh();

      // Call the refresh API
      const { refreshToken } = await import("../../../features/auth/api");
      const newTokenData = await refreshToken();

      // Update auth store
      useAuthStore.getState().setAuth({
        user: newTokenData.user,
        accessToken: newTokenData.accessToken,
      });

      // Notify manager
      tokenRefreshManager.onRefreshSuccess(newTokenData.accessToken);

      showSuccess("Token refreshed successfully!");
      addTestResult("Manual Refresh", "Success", "Token refreshed manually");
    } catch (error) {
      logger.error("Manual refresh failed", { error });
      tokenRefreshManager.onRefreshFailure(error);
      showError(`Refresh failed: ${error.message}`);
      addTestResult("Manual Refresh", "Failed", error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test API call that might fail and retry
  const handleTestApiCall = async () => {
    try {
      logger.info("Testing API call");
      showInfo("Making test API call...");

      // This should work or trigger token refresh if expired
      const response = await api.get("/test/protected");

      showSuccess("API call successful!");
      addTestResult("API Call", "Success", "Protected endpoint accessed");
    } catch (error) {
      logger.error("API call failed", { error });
      showError(`API call failed: ${error.message}`);
      addTestResult("API Call", "Failed", error.message);
    }
  };

  // Simulate expired token (for testing)
  const handleSimulateExpiry = () => {
    logger.warn("Simulating token expiry (for demo)");

    // This is just for demo - in real scenario, token expires on backend
    showInfo("Simulated expiry - next API call will trigger refresh");
    addTestResult("Simulate", "Info", "Next 401 will trigger refresh");
  };

  // Add test result to history
  const addTestResult = (action, status, message) => {
    setTestResults((prev) => [
      {
        id: Date.now(),
        action,
        status,
        message,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 9), // Keep last 10
    ]);
  };

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    if (ms === null || ms <= 0) return "Expired";

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  // Get status color
  const getStatusColor = (ms) => {
    if (!ms || ms <= 0) return "text-red-600";
    if (ms < 2 * 60 * 1000) return "text-yellow-600"; // Less than 2 min
    return "text-green-600";
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Token Refresh Demo</h1>
        <p className="text-gray-600 mb-8">
          Test automatic token refresh, manual refresh, and API retry logic.
        </p>

        {/* Token Info */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🎫 Current Token</h2>

          {accessToken ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Status:</span>
                <span className={`font-semibold ${getStatusColor(timeRemaining)}`}>
                  {timeRemaining && timeRemaining > 0 ? "Active" : "Expired"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Time Remaining:</span>
                <span className={`font-semibold text-lg ${getStatusColor(timeRemaining)}`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>

              {tokenInfo && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">User ID:</span>
                    <span className="text-gray-600">
                      {tokenInfo.userId || tokenInfo.sub || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Issued At:</span>
                    <span className="text-gray-600 text-sm">
                      {tokenInfo.iat ? new Date(tokenInfo.iat * 1000).toLocaleString() : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Expires At:</span>
                    <span className="text-gray-600 text-sm">
                      {tokenInfo.exp ? new Date(tokenInfo.exp * 1000).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  View Token (truncated)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {accessToken.substring(0, 100)}...
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-gray-500">No active token. Please log in.</p>
          )}
        </section>

        {/* Actions */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={!accessToken || isRefreshing}
              className={`px-4 py-3 rounded font-medium transition ${
                !accessToken || isRefreshing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isRefreshing ? "Refreshing..." : "🔄 Manual Refresh"}
            </button>

            <button
              onClick={handleTestApiCall}
              disabled={!accessToken}
              className={`px-4 py-3 rounded font-medium transition ${
                !accessToken
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              🌐 Test API Call
            </button>

            <button
              onClick={handleSimulateExpiry}
              disabled={!accessToken}
              className={`px-4 py-3 rounded font-medium transition ${
                !accessToken
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }`}
            >
              ⚠️ Simulate Expiry
            </button>

            <button
              onClick={() => {
                const { showInfo } = useUIStore.getState();
                showInfo(
                  `Refresh scheduled ${
                    timeRemaining && timeRemaining > 0
                      ? formatTimeRemaining(Math.max(0, timeRemaining - 2 * 60 * 1000))
                      : "soon"
                  }`
                );
              }}
              disabled={!accessToken}
              className={`px-4 py-3 rounded font-medium transition ${
                !accessToken
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              ⏰ Check Schedule
            </button>
          </div>
        </section>

        {/* Test Results */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>

          {testResults.length > 0 ? (
            <div className="space-y-2">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded border ${
                    result.status === "Success"
                      ? "bg-green-50 border-green-200"
                      : result.status === "Failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{result.action}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            result.status === "Success"
                              ? "bg-green-200 text-green-800"
                              : result.status === "Failed"
                              ? "bg-red-200 text-red-800"
                              : "bg-blue-200 text-blue-800"
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No test results yet. Try the actions above!</p>
          )}

          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Results
            </button>
          )}
        </section>

        {/* How It Works */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4">📚 How It Works</h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">1. Automatic Refresh:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Token automatically refreshes 2 minutes before expiry (at 13 min mark for 15 min
                tokens).
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">2. Manual Refresh:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Click "Manual Refresh" to immediately refresh the token.
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">3. API Call Retry:</p>
              <p className="text-gray-700 dark:text-gray-300">
                If an API call fails with 401 (expired token), the system automatically: - Refreshes
                the token - Retries the failed request with the new token - Returns the result
                seamlessly
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">4. Request Queuing:</p>
              <p className="text-gray-700 dark:text-gray-300">
                If multiple requests fail during refresh, they're queued and retried after refresh
                completes.
              </p>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Note: This demo requires a backend with /auth/refresh endpoint
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TokenRefreshDemo;
