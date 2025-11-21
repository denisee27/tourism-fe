import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * HTTP Status Code Error Mapping
 *
 * Maps HTTP status codes to user-friendly error messages and types.
 * Provides consistent error handling across the application.
 */

/**
 * Error types for categorization
 * TODO: Add more if you want
 */
export const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  AUTHENTICATION: "AUTHENTICATION_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  RATE_LIMIT: "RATE_LIMIT_ERROR",
  SERVER: "SERVER_ERROR",
  TIMEOUT: "TIMEOUT_ERROR",
  CONFLICT: "CONFLICT_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * HTTP Status Code Configuration
 * Maps status codes to error types, messages, and retry strategies
 */
export const HTTP_STATUS_CONFIG = {
  // 4xx Client Errors
  400: {
    type: ERROR_TYPES.VALIDATION,
    message: "Bad request. Please check your input and try again.",
    userMessage: "Invalid request. Please check your information.",
    retry: false,
    showToast: true,
  },
  401: {
    type: ERROR_TYPES.AUTHENTICATION,
    message: "Unauthorized. Please log in to continue.",
    userMessage: "Your session has expired. Please log in again.",
    retry: false,
    showToast: true,
    redirect: "/login",
  },
  403: {
    type: ERROR_TYPES.AUTHORIZATION,
    message: "Forbidden. You don't have permission to access this resource.",
    userMessage: "You don't have permission to perform this action.",
    retry: false,
    showToast: true,
    redirect: "/forbidden",
  },
  404: {
    type: ERROR_TYPES.NOT_FOUND,
    message: "Resource not found.",
    userMessage: "The requested item could not be found.",
    retry: false,
    showToast: true,
  },
  405: {
    type: ERROR_TYPES.VALIDATION,
    message: "Method not allowed.",
    userMessage: "This action is not allowed.",
    retry: false,
    showToast: true,
  },
  408: {
    type: ERROR_TYPES.TIMEOUT,
    message: "Request timeout. The server took too long to respond.",
    userMessage: "Request timed out. Please try again.",
    retry: true,
    maxRetries: 2,
    showToast: true,
  },
  409: {
    type: ERROR_TYPES.CONFLICT,
    message: "Conflict. The resource already exists or is in use.",
    userMessage: "This item already exists or conflicts with existing data.",
    retry: false,
    showToast: true,
  },
  422: {
    type: ERROR_TYPES.VALIDATION,
    message: "Validation failed. Please check your input.",
    userMessage: "Please check your information and try again.",
    retry: false,
    showToast: true,
  },
  429: {
    type: ERROR_TYPES.RATE_LIMIT,
    message: "Too many requests. Please slow down.",
    userMessage: "You're making requests too quickly. Please wait a moment.",
    retry: true,
    retryDelay: 5000, // 5 seconds
    showToast: true,
  },

  // 5xx Server Errors
  500: {
    type: ERROR_TYPES.SERVER,
    message: "Internal server error. Something went wrong on our end.",
    userMessage: "Something went wrong. Our team has been notified.",
    retry: true,
    maxRetries: 3,
    retryDelay: 2000,
    showToast: true,
  },
  502: {
    type: ERROR_TYPES.SERVER,
    message: "Bad gateway. The server is temporarily unavailable.",
    userMessage: "Service temporarily unavailable. Please try again.",
    retry: true,
    maxRetries: 3,
    retryDelay: 3000,
    showToast: true,
  },
  503: {
    type: ERROR_TYPES.SERVER,
    message: "Service unavailable. The server is under maintenance.",
    userMessage: "Service is temporarily down for maintenance.",
    retry: true,
    maxRetries: 2,
    retryDelay: 5000,
    showToast: true,
  },
  504: {
    type: ERROR_TYPES.TIMEOUT,
    message: "Gateway timeout. The server took too long to respond.",
    userMessage: "Request timed out. Please try again.",
    retry: true,
    maxRetries: 2,
    retryDelay: 3000,
    showToast: true,
  },
};

/**
 * Get error configuration for a status code
 *
 * @param {number} status - HTTP status code
 * @returns {Object} - Error configuration
 */
export const getErrorConfig = (status) => {
  return (
    HTTP_STATUS_CONFIG[status] || {
      type: ERROR_TYPES.UNKNOWN,
      message: `An unexpected error occurred (${status})`,
      userMessage: "Something went wrong. Please try again.",
      retry: false,
      showToast: true,
    }
  );
};

/**
 * Map Axios error to AppError with enhanced information
 *
 * @param {Object} error - Axios error object
 * @returns {AppError} - Enhanced error object
 */
export const mapHttpError = (error) => {
  // Network error (no response)
  if (!error.response) {
    logger.error("Network error occurred", {
      message: error.message,
      code: error.code,
    });

    return new AppError(
      "Network error. Please check your internet connection.",
      ERROR_TYPES.NETWORK,
      null,
      {
        originalError: error,
        retry: true,
        maxRetries: 3,
        retryDelay: 2000,
      }
    );
  }

  const { status, data, headers } = error.response;
  const config = getErrorConfig(status);

  // Extract error details from response
  const errorMessage = data?.error || data?.message || config.message;
  const userMessage = data?.userMessage || data?.error || data?.message || config.userMessage;
  const details = data?.details || null;
  const code = data?.code || `HTTP_${status}`;

  // Log the error
  logger.error(`HTTP ${status} error`, {
    url: error.config?.url,
    method: error.config?.method,
    status,
    message: errorMessage,
    details,
    code,
  });

  // Create AppError with all metadata
  const appError = new AppError(userMessage, config.type, details, {
    status,
    code,
    originalMessage: errorMessage,
    originalError: error,
    retry: config.retry,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay,
    showToast: config.showToast,
    redirect: config.redirect,
    retryAfter: headers?.["retry-after"]
      ? parseInt(headers["retry-after"]) * 1000
      : config.retryDelay,
  });

  return appError;
};

/**
 * Check if an error is retryable
 *
 * @param {AppError|Error} error - Error object
 * @returns {boolean}
 */
export const isRetryableError = (error) => {
  if (error.metadata?.retry === false) {
    return false;
  }

  // Retry on network errors
  if (error.type === ERROR_TYPES.NETWORK) {
    return true;
  }

  // Retry on timeouts
  if (error.type === ERROR_TYPES.TIMEOUT) {
    return true;
  }

  // Retry on server errors (5xx)
  if (error.type === ERROR_TYPES.SERVER) {
    return true;
  }

  // Retry on rate limiting
  if (error.type === ERROR_TYPES.RATE_LIMIT) {
    return true;
  }

  return false;
};

/**
 * Get retry delay for an error
 *
 * @param {AppError|Error} error - Error object
 * @param {number} attempt - Current retry attempt (0-indexed)
 * @returns {number} - Delay in milliseconds
 */
export const getRetryDelay = (error, attempt = 0) => {
  const baseDelay = error.metadata?.retryDelay || 1000;
  const retryAfter = error.metadata?.retryAfter;

  // Use server provided retry after if available
  if (retryAfter) {
    return retryAfter;
  }

  // Exponential backoff: baseDelay * 2^attempt
  // Capped at 30 seconds
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), 30000);

  // Add jitter to prevent thundering herd (±25%)
  const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);

  return Math.round(exponentialDelay + jitter);
};

/**
 * Get maximum retry attempts for an error
 *
 * @param {AppError|Error} error - Error object
 * @returns {number} - Maximum retry attempts
 */
export const getMaxRetries = (error) => {
  return error.metadata?.maxRetries || 0;
};

/**
 * Handle error based on its configuration
 * Shows toast, redirects, etc.
 *
 * @param {AppError} error - Error object
 */
export const handleErrorActions = async (error) => {
  const metadata = error.metadata || {};

  // Show toast notification
  if (metadata.showToast) {
    const { useUIStore } = await import("../stores/uiStore.js");
    useUIStore.getState().showError(error.message);
  }

  // Redirect if needed
  if (metadata.redirect) {
    // Wait a bit before redirecting so user can see the toast
    setTimeout(() => {
      window.location.href = metadata.redirect;
    }, 1500);
  }
};
