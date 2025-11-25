import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import {
  transformResponse,
  transformPaginatedResponse,
  transformErrorResponse,
} from "./transformers.js";
import {
  mapHttpError,
  isRetryableError,
  getRetryDelay,
  getMaxRetries,
  handleErrorActions,
} from "./errorMapping.js";
import { useAuthStore } from "../../features/auth/stores/authStore.js";
import { tokenRefreshManager, isTokenExpiredError } from "../../core/auth/tokenRefresh.js";
import useUIStore from "../../core/stores/uiStore.js";
import { refreshToken } from "../../features/auth/api/index.js";

/**
 * Create axios instance
 */
const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // this is for refreshtoken, as i put it into the cookie
});

/**
 * Request interceptor: Add logging
 */
axiosInstance.interceptors.request.use(
  (config) => {
    logger.apiRequest(config.method?.toUpperCase(), config.url, {
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    logger.error("Request interceptor error", { error: error.message });
    return Promise.reject(error);
  }
);

/**
 * Request interceptor: Add Bearer token
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor:  Handle auth errors and token refresh
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter;
      const message = error.response.data?.error || "Too many requests. Please try again later.";

      logger.warn("Rate limit exceeded", {
        url: originalRequest.url,
        retryAfter: retryAfter ? new Date(retryAfter * 1000) : "unknown",
      });

      // Show toast notification
      useUIStore.getState().showError(message);
    }

    // token expired or invalid
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Don't try to refresh on login endpoint or if already retried
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest._retry
      ) {
        logger.warn("401 on auth endpoint or retry, forcing logout");

        // Don't logout if already on login page
        if (currentPath !== "/login") {
          useAuthStore.getState().logout("Authentication failed. Please log in again.", true);
        }

        return Promise.reject(error);
      }

      // Mark this request as retried
      originalRequest._retry = true;

      // Check if token is actually expired
      if (isTokenExpiredError(error)) {
        logger.info("Token expired, attempting refresh", {
          url: originalRequest.url,
        });

        // Queue this request so it resumes once refresh completes
        const queuedRequest = tokenRefreshManager.addToQueue(originalRequest);
        logger.info("Queueing request while token refresh runs", { url: originalRequest.url });

        try {
          // If already refreshing, wait for it
          if (tokenRefreshManager.isCurrentlyRefreshing()) {
            logger.debug("Refresh in progress, queueing request");

            // Wait for refresh to complete and retry with updated config
            const resolvedConfig = await queuedRequest;
            logger.info("Retrying request after queued refresh", { url: resolvedConfig.url });
            return axiosInstance(resolvedConfig);
          }

          // Start refresh process
          tokenRefreshManager.triggerRefresh();

          // Call refresh endpoint
          const refreshResponse = await refreshToken();

          // Update auth store
          useAuthStore.getState().setAuth({
            user: refreshResponse.user,
            accessToken: refreshResponse.accessToken,
          });

          // Notify refresh manager of success
          tokenRefreshManager.onRefreshSuccess(refreshResponse.accessToken);

          // Retry original request with updated config from queue
          logger.info("Token refreshed, retrying original request", {
            url: originalRequest.url,
          });

          const resolvedConfig = await queuedRequest;
          resolvedConfig.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;

          logger.info("Request resumed after refresh", { url: resolvedConfig.url });

          return axiosInstance(resolvedConfig);
        } catch (refreshError) {
          logger.error("Token refresh failed", {
            url: originalRequest.url,
            error: refreshError.message,
            status: refreshError.response?.status,
          });

          // Notify refresh manager of failure
          tokenRefreshManager.onRefreshFailure(refreshError);
          queuedRequest.catch(() => {
            // Swallow rejection to avoid unhandled promise if caller already handling error
          });

          // Show session expired modal and force logout
          if (currentPath !== "/login") {
            const errorMessage =
              refreshError.response?.data?.error || refreshError.message || "Session expired";
            const normalizedError =
              typeof errorMessage === "string" ? errorMessage.toLowerCase() : "";
            const reason = normalizedError.includes("session")
              ? "Your session has expired. Please log in again."
              : "Unable to refresh your session. Please log in again.";

            useAuthStore.getState().logout(reason, true);
          }

          return Promise.reject(refreshError);
        }
      } else {
        // 401 but not expired token (invalid credentials, etc.)
        logger.warn("401 unauthorized (not expired token)");

        if (currentPath !== "/login") {
          useAuthStore
            .getState()
            .logout("Your session is no longer valid. Please log in again.", true);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Transform responses and handle errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    logger.apiResponse(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      { success: true }
    );
    return response;
  },
  async (error) => {
    const appError = mapHttpError(error);
    logger.apiError(error.config?.method?.toUpperCase(), error.config?.url, appError);

    // Handle error actions (toast, redirect)
    await handleErrorActions(appError);

    return Promise.reject(appError);
  }
);

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute request with retry logic
 *
 * @param {Function} requestFn - Axios request function
 * @param {Object} options - Request options
 * @param {number} attempt - Current retry attempt
 * @returns {Promise} - Response data
 */
const executeWithRetry = async (requestFn, options = {}, attempt = 0) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    const maxRetries = options.maxRetries ?? getMaxRetries(error);
    const shouldRetry = options.retry !== false && isRetryableError(error) && attempt < maxRetries;

    if (shouldRetry) {
      const delay = getRetryDelay(error, attempt);

      logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`, {
        url: error.config?.url,
        error: error.message,
      });

      await sleep(delay);
      return executeWithRetry(requestFn, options, attempt + 1);
    }

    throw error;
  }
};

/**
 * API Client Class
 */
class APIClient {
  constructor(instance = axiosInstance) {
    this.instance = instance;
    this.cancelTokens = new Map();
  }

  /**
   * Generate cancel token for a request
   * Allows cancelling in-flight requests
   *
   * @param {string} key - Unique key for the request
   * @returns {CancelToken}
   */
  getCancelToken(key) {
    // Cancel previous request with same key
    if (this.cancelTokens.has(key)) {
      this.cancelTokens.get(key).cancel("Request cancelled due to new request");
    }

    const source = axios.CancelToken.source();
    this.cancelTokens.set(key, source);
    return source.token;
  }

  /**
   * Cancel a request by key
   *
   * @param {string} key - Request key
   */
  cancelRequest(key) {
    if (this.cancelTokens.has(key)) {
      this.cancelTokens.get(key).cancel("Request cancelled by user");
      this.cancelTokens.delete(key);
    }
  }

  /**
   * GET request
   *
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} - Response data
   *
   * @example
   * const users = await api.get('/users', { params: { page: 1 } });
   */
  async get(url, options = {}) {
    const { params, cancelKey, transform = true, ...axiosOptions } = options;

    const requestFn = () =>
      this.instance.get(url, {
        params,
        cancelToken: cancelKey ? this.getCancelToken(cancelKey) : undefined,
        ...axiosOptions,
      });

    const response = await executeWithRetry(requestFn, options);
    return transform ? transformResponse(response) : response.data;
  }

  /**
   * GET request for paginated data
   *
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} - { data: [], meta: {} }
   *
   * @example
   * const { data, meta } = await api.getPaginated('/users', {
   *   params: { page: 1, limit: 10 }
   * });
   */
  async getPaginated(url, options = {}) {
    const response = await this.get(url, { ...options, transform: false });
    return transformPaginatedResponse({ data: response });
  }

  /**
   * POST request
   *
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise} - Response data
   *
   * @example
   * const user = await api.post('/users', { name: 'John', email: 'john@example.com' });
   */
  async post(url, data, options = {}) {
    const { transform = true, ...axiosOptions } = options;

    const requestFn = () => this.instance.post(url, data, axiosOptions);

    const response = await executeWithRetry(requestFn, options);
    return transform ? transformResponse(response) : response.data;
  }

  /**
   * PUT request
   *
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise} - Response data
   *
   * @example
   * const user = await api.put('/users/123', { name: 'John Doe' });
   */
  async put(url, data, options = {}) {
    const { transform = true, ...axiosOptions } = options;

    const requestFn = () => this.instance.put(url, data, axiosOptions);

    const response = await executeWithRetry(requestFn, options);
    return transform ? transformResponse(response) : response.data;
  }

  /**
   * PATCH request
   *
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise} - Response data
   *
   * @example
   * const user = await api.patch('/users/123', { name: 'John Doe' });
   */
  async patch(url, data, options = {}) {
    const { transform = true, ...axiosOptions } = options;

    const requestFn = () => this.instance.patch(url, data, axiosOptions);

    const response = await executeWithRetry(requestFn, options);
    return transform ? transformResponse(response) : response.data;
  }

  /**
   * DELETE request
   *
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} - Response data
   *
   * @example
   * await api.delete('/users/123');
   */
  async delete(url, options = {}) {
    const { transform = true, ...axiosOptions } = options;

    const requestFn = () => this.instance.delete(url, axiosOptions);

    const response = await executeWithRetry(requestFn, options);
    return transform ? transformResponse(response) : response.data;
  }

  /**
   * Upload file(s)
   *
   * @param {string} url - Request URL
   * @param {FormData|Object} data - File data or form data
   * @param {Object} options - Request options
   * @returns {Promise} - Upload response
   *
   * @example
   * const formData = new FormData();
   * formData.append('file', file);
   * const result = await api.upload('/upload', formData, {
   *   onUploadProgress: (e) => console.log(e.loaded / e.total * 100)
   * });
   */
  async upload(url, data, options = {}) {
    const { onUploadProgress, ...axiosOptions } = options;

    const formData = data instanceof FormData ? data : this.toFormData(data);

    const response = await this.instance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
      ...axiosOptions,
    });

    return transformResponse(response);
  }

  /**
   * Download file
   *
   * @param {string} url - Request URL
   * @param {string} filename - Filename to save as
   * @param {Object} options - Request options
   *
   * @example
   * await api.download('/reports/123/pdf', 'report.pdf');
   */
  async download(url, filename, options = {}) {
    const response = await this.instance.get(url, {
      responseType: "blob",
      ...options,
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  /**
   * Convert object to FormData
   *
   * @param {Object} obj - Object to convert
   * @returns {FormData}
   */
  toFormData(obj) {
    const formData = new FormData();

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return formData;
  }
}

// Create singleton instance
export const api = new APIClient();

// Export the class for custom instances
export { APIClient };

// Export the raw axios instance for special cases
export { axiosInstance };

export default api;
