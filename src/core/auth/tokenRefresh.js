import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * Token Refresh Manager
 *
 * Handles automatic token refresh, request queuing, and session management.
 *
 * Features:
 * - Automatic refresh before token expiry
 * - Request queue during refresh (prevents duplicate refresh calls)
 * - Failed request retry after refresh
 * - Session expiry detection
 * - Configurable refresh timing
 */

class TokenRefreshManager {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.failedQueue = [];
    this.refreshTimer = null;

    this.TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes (from backend)
    this.REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry
    this.MAX_RETRY_ATTEMPTS = 1; // Number of times to retry after refresh

    logger.debug("TokenRefreshManager initialized", {
      tokenExpiry: this.TOKEN_EXPIRY_MS,
      refreshBefore: this.REFRESH_BEFORE_EXPIRY_MS,
    });
  }

  /**
   * Initialize automatic token refresh
   * Called after successful login or token refresh
   *
   * @param {string} token - Access token
   * @param {number} expiresIn - Token lifetime in seconds (optional, defaults to 15min)
   */
  scheduleRefresh(token, expiresIn = null) {
    this.clearRefreshTimer();

    if (!token) {
      logger.warn("Cannot schedule refresh - no token provided");
      return;
    }

    const expiryMs = expiresIn ? expiresIn * 1000 : this.TOKEN_EXPIRY_MS;
    const refreshIn = expiryMs - this.REFRESH_BEFORE_EXPIRY_MS;

    // Don't schedule if refresh time is negative or too short
    if (refreshIn <= 0 || refreshIn < 30000) {
      logger.warn("Token expiry too short to schedule refresh", { refreshIn });
      return;
    }

    logger.info("Scheduling token refresh", {
      expiryMs,
      refreshIn,
      refreshAt: new Date(Date.now() + refreshIn).toISOString(),
    });

    this.refreshTimer = setTimeout(() => {
      logger.info("Auto-refresh triggered");
      this.triggerRefresh();
    }, refreshIn);
  }

  /**
   * Clear the refresh timer
   */
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      logger.debug("Refresh timer cleared");
    }
  }

  /**
   * Trigger token refresh
   * This should be called by the auth store
   *
   * @returns {Promise} - Resolves when refresh completes
   */
  async triggerRefresh() {
    // If already refreshing, return existing promise
    if (this.isRefreshing && this.refreshPromise) {
      logger.debug("Refresh already in progress, returning existing promise");
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    // Create refresh promise
    this.refreshPromise = new Promise((resolve, reject) => {
      this._refreshResolve = resolve;
      this._refreshReject = reject;
    });

    logger.info("Token refresh started");

    return this.refreshPromise;
  }

  /**
   * Mark refresh as successful
   * Resolves all queued requests
   *
   * @param {string} newToken - New access token
   */
  onRefreshSuccess(newToken) {
    logger.info("Token refresh successful", { hasNewToken: !!newToken });

    this.isRefreshing = false;

    // Resolve the main promise
    if (this._refreshResolve) {
      this._refreshResolve(newToken);
    }

    // Process failed queue (retry all failed requests)
    this.processQueue(null, newToken);

    // Reset
    this.refreshPromise = null;
    this._refreshResolve = null;
    this._refreshReject = null;

    // Schedule next refresh
    this.scheduleRefresh(newToken);
  }

  /**
   * Mark refresh as failed
   * Rejects all queued requests
   *
   * @param {Error} error - Refresh error
   */
  onRefreshFailure(error) {
    logger.error("Token refresh failed", { error: error.message });

    this.isRefreshing = false;

    // Reject the main promise
    if (this._refreshReject) {
      this._refreshReject(error);
    }

    // Reject all queued requests
    this.processQueue(error, null);

    // Reset
    this.refreshPromise = null;
    this._refreshResolve = null;
    this._refreshReject = null;
    this.clearRefreshTimer();
  }

  /**
   * Add a failed request to the queue
   * These will be retried after successful refresh
   *
   * @param {Object} config - Axios request config
   * @returns {Promise} - Resolves when request is retried
   */
  addToQueue(config) {
    logger.debug("Adding request to queue", { url: config.url });

    return new Promise((resolve, reject) => {
      this.failedQueue.push({
        config,
        resolve,
        reject,
      });
    });
  }

  /**
   * Process the queue of failed requests
   *
   * @param {Error} error - If present, reject all requests
   * @param {string} token - If present, retry all requests with new token
   */
  processQueue(error, token = null) {
    logger.debug("Processing queue", {
      queueLength: this.failedQueue.length,
      hasError: !!error,
      hasToken: !!token,
    });

    this.failedQueue.forEach((promise) => {
      if (error) {
        // Refresh failed, reject all queued requests
        promise.reject(error);
      } else {
        // Refresh succeeded, resolve with updated config
        if (token) {
          promise.config.headers.Authorization = `Bearer ${token}`;
        }
        promise.resolve(promise.config);
      }
    });

    // Clear the queue
    this.failedQueue = [];
  }

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing() {
    return this.isRefreshing;
  }

  /**
   * Get the current refresh promise
   */
  getRefreshPromise() {
    return this.refreshPromise;
  }

  /**
   * Reset the manager (on logout)
   */
  reset() {
    logger.info("TokenRefreshManager reset");

    this.clearRefreshTimer();
    this.isRefreshing = false;
    this.refreshPromise = null;
    this._refreshResolve = null;
    this._refreshReject = null;

    // Reject all queued requests
    this.failedQueue.forEach((promise) => {
      promise.reject(new Error("Logout - clearing request queue"));
    });
    this.failedQueue = [];
  }

  /**
   * Calculate time remaining until token expiry
   *
   * @param {string} token - JWT token
   * @returns {number} - Milliseconds until expiry
   */
  getTimeUntilExpiry(token) {
    try {
      // Decode JWT (simple base64 decode, not validation)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const remaining = expiryTime - now;

      logger.debug("Token expiry check", {
        expiresAt: new Date(expiryTime).toISOString(),
        remainingMs: remaining,
        remainingMin: Math.round(remaining / 60000),
      });

      return remaining;
    } catch (error) {
      logger.error("Failed to decode token expiry", { error: error.message });
      return 0;
    }
  }

  /**
   * Check if token is expired or about to expire
   *
   * @param {string} token - JWT token
   * @returns {boolean} - True if expired or expiring soon
   */
  shouldRefresh(token) {
    const remaining = this.getTimeUntilExpiry(token);
    const shouldRefresh = remaining <= this.REFRESH_BEFORE_EXPIRY_MS;

    if (shouldRefresh) {
      logger.info("Token should be refreshed", { remainingMs: remaining });
    }

    return shouldRefresh;
  }
}

// Export singleton instance
export const tokenRefreshManager = new TokenRefreshManager();

/**
 * Helper function to check if error is due to token expiry
 */
export const isTokenExpiredError = (error) => {
  return (
    error?.response?.status === 401 &&
    (error?.response?.data?.error?.toLowerCase().includes("expired") ||
      error?.response?.data?.error?.toLowerCase().includes("invalid") ||
      error?.response?.data?.message?.toLowerCase().includes("expired") ||
      error?.response?.data?.message?.toLowerCase().includes("invalid"))
  );
};

/**
 * Helper function to check if error is due to session expiry
 */
export const isSessionExpiredError = (error) => {
  return (
    error?.response?.status === 401 &&
    error?.response?.data?.error?.toLowerCase().includes("session")
  );
};

export default tokenRefreshManager;
