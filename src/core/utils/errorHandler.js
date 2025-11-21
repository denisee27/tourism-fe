import { logger } from "./logger";
import { isDevelopment } from "../config/env";

/**
 * Error types for better categorization
 */
export const ErrorTypes = {
  NETWORK: "NETWORK_ERROR",
  API: "API_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  AUTH: "AUTH_ERROR",
  PERMISSION: "PERMISSION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SERVER: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, statusCode = null, details = null) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Determine error type from HTTP status code
 */
const getErrorTypeFromStatus = (status) => {
  if (status >= 500) return ErrorTypes.SERVER;
  if (status === 404) return ErrorTypes.NOT_FOUND;
  if (status === 403) return ErrorTypes.PERMISSION;
  if (status === 401) return ErrorTypes.AUTH;
  if (status === 422 || status === 400) return ErrorTypes.VALIDATION;
  return ErrorTypes.API;
};

/**
 * Extract user-friendly error message
 */
const getUserFriendlyMessage = (error) => {
  // Network error
  if (!error.response && error.request) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Server error
  if (error.response?.status >= 500) {
    return "Something went wrong on our end. Please try again later.";
  }

  // Client error with message from backend
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Timeout
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  // Default
  return error.message || "An unexpected error occurred.";
};

/**
 * Handle API errors from Axios
 * Transforms axios errors into AppError instances
 *
 * @param {Error} error - Axios error object
 * @returns {AppError} Standardized application error
 */
export const handleApiError = (error) => {
  // Network error (no response from server)
  logger.info("error", error);
  if (!error.response) {
    logger.error("Network error", {
      message: error.message,
      config: isDevelopment ? error.config : undefined,
    });

    return new AppError(getUserFriendlyMessage(error), ErrorTypes.NETWORK, null, {
      originalError: error.message,
    });
  }

  // HTTP error response
  const { status, data } = error.response;
  const errorType = getErrorTypeFromStatus(status);

  logger.error(`API Error [${status}]`, {
    url: error.config?.url,
    method: error.config?.method,
    status,
    data,
    stack: isDevelopment ? error.stack : undefined,
  });

  return new AppError(getUserFriendlyMessage(error), errorType, status, {
    url: error.config?.url,
    method: error.config?.method,
    response: data,
    validationErrors: data?.details, // Backend validation errors
  });
};

/**
 * Handle validation errors from backend
 * Transforms backend validation errors to form-friendly format
 *
 * Backend format:
 * {
 *   success: false,
 *   error: "Validation failed",
 *   details: [
 *     { path: "body.username", message: "Invalid input", code: "invalid_type" }
 *   ]
 * }
 *
 * Output format (for React Hook Form):
 * {
 *   username: { message: "Invalid input" },
 *   email: { message: "Invalid email" }
 * }
 */
export const transformValidationErrors = (validationDetails) => {
  if (!validationDetails || !Array.isArray(validationDetails)) {
    return {};
  }

  return validationDetails.reduce((acc, error) => {
    // Extract field name from path (e.g., "body.username" -> "username")
    const fieldPath = error.path?.split(".").pop();

    if (fieldPath) {
      acc[fieldPath] = {
        type: error.code || "validation",
        message: error.message,
      };
    }

    return acc;
  }, {});
};

/**
 * Handle React errors (from Error Boundaries)
 */
export const handleReactError = (error, errorInfo) => {
  logger.error("React Error", {
    error: error.message,
    componentStack: isDevelopment ? errorInfo.componentStack : undefined,
    stack: isDevelopment ? error.stack : undefined,
  });

  // TODO: Send to error tracking service (Sentry)
  // Sentry.captureException(error, { contexts: { react: errorInfo } });

  return new AppError(
    isDevelopment ? error.message : "Something went wrong. Please refresh the page.",
    ErrorTypes.UNKNOWN,
    null,
    { componentStack: errorInfo.componentStack }
  );
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (event) => {
  logger.error("Unhandled Promise Rejection", {
    reason: event.reason,
    stack: isDevelopment ? event.reason?.stack : undefined,
  });

  // Prevent default browser error handling
  event.preventDefault();

  // TODO: Send to error tracking service
  // Sentry.captureException(event.reason);
};

/**
 * Handle global errors
 */
export const handleGlobalError = (event) => {
  logger.error("Global Error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: isDevelopment ? event.error?.stack : undefined,
  });

  // Prevent default browser error handling
  event.preventDefault();

  // TODO: Send to error tracking service
  // Sentry.captureException(event.error);
};

/**
 * Setup global error handlers
 * Call this once in your app initialization
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  // Handle global errors
  window.addEventListener("error", handleGlobalError);

  logger.info("Global error handlers initialized");
};

/**
 * Cleanup global error handlers
 * Call this when unmounting your app (testing, cleanup)
 */
export const cleanupGlobalErrorHandlers = () => {
  window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  window.removeEventListener("error", handleGlobalError);
};

/**
 * Helper to safely execute async operations with error handling
 *
 * Usage:
 * const [data, error] = await safeAsync(fetchUsers());
 * if (error) {
 *   showToast.error(error.message);
 *   return;
 * }
 * // use data
 */
export const safeAsync = async (promise) => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const appError = error instanceof AppError ? error : handleApiError(error);
    return [null, appError];
  }
};

/**
 * Helper to retry failed operations
 *
 * Usage:
 * const data = await retry(() => fetchUsers(), 3, 1000);
 */
export const retry = async (fn, maxAttempts = 3, delayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed`, {
        error: error.message,
      });

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};

export default {
  handleApiError,
  handleReactError,
  handleUnhandledRejection,
  handleGlobalError,
  setupGlobalErrorHandlers,
  cleanupGlobalErrorHandlers,
  transformValidationErrors,
  safeAsync,
  retry,
  ErrorTypes,
  AppError,
};
