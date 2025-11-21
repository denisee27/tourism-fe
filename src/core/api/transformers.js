import { logger } from "../utils/logger.js";

/**
 * API Response Transformers
 *
 * Standardizes API responses across the application.
 * ! backend returns: { success: boolean, data?: any, error?: string, details?: array }
 * We extract and normalize this to a consistent format.
 */

/**
 * Transform a successful API response
 * Extracts data from the standard API response format
 *
 * @param {Object} response - Axios response object
 * @returns {any} - The actual data payload
 *
 * @example
 * ? change this as you wish
 * // Backend returns: { success: true, data: { id: 1, name: "John" } }
 * // Transform returns: { id: 1, name: "John" }
 */
export const transformResponse = (response) => {
  // If response has our standard format, extract data
  if (response.data && typeof response.data === "object") {
    if ("success" in response.data && "data" in response.data) {
      // Standard format: { success: true, data: {...} }
      return response.data.data;
    }

    // If just data object without wrapper
    return response.data;
  }

  // Fallback: return as-is
  return response.data;
};

/**
 * Transform a paginated API response
 * Extracts both data and pagination metadata
 *
 * @param {Object} response - Axios response object
 * @returns {Object} - { data: [], meta: { page, limit, total, totalPages } }
 *
 * @example
 * ? Meta is newly added, some backend response spread the meta
 * ? Change accordingly
 * // Backend returns:
 * // { success: true, data: [...], meta: { page: 1, limit: 10, total: 100 } }
 * // Transform returns:
 * // { data: [...], meta: { page: 1, limit: 10, total: 100, totalPages: 10 } }
 */
export const transformPaginatedResponse = (response) => {
  const data = response.data;
  logger.info("response.data", data);

  if (!data || typeof data !== "object") {
    logger.warn("Invalid paginated response format", { data });
    return { data: [], meta: null };
  }

  // Standard format with meta

  if (data.data) {
    const items = Array.isArray(data.data) ? data.data : [];
    logger.info("items", items);
    const meta = data.meta
      ? data.meta
      : { total: items.length, page: 1, limit: items.length, totalPages: 1 };

    return { data: items, meta };
  }

  // Fallback: assume data is the array
  return {
    data: Array.isArray(data) ? data : [],
    meta: null,
  };
};

/**
 * Transform API error response
 * Extracts error information from standard error format
 *
 * @param {Object} error - Axios error object
 * @returns {Object} - { message: string, details?: array, code?: string }
 *
 * @example
 * // Backend returns:
 * // { success: false, error: "Validation failed", details: [...] }
 * // Transform returns:
 * // { message: "Validation failed", details: [...] }
 */
export const transformErrorResponse = (error) => {
  // Network error (no response)
  if (!error.response) {
    return {
      message: error.message || "Network error. Please check your connection.",
      code: "NETWORK_ERROR",
      details: null,
    };
  }

  const { status, data } = error.response;

  // Standard error format
  if (data && typeof data === "object") {
    return {
      message: data.error || data.message || getDefaultErrorMessage(status),
      details: data.details || null,
      code: data.code || `HTTP_${status}`,
      status,
    };
  }

  // Fallback
  return {
    message: getDefaultErrorMessage(status),
    code: `HTTP_${status}`,
    status,
    details: null,
  };
};

/**
 * Get default error message for HTTP status code
 *
 * @param {number} status - HTTP status code
 * @returns {string} - User-friendly error message
 */
const getDefaultErrorMessage = (status) => {
  const messages = {
    400: "Bad request. Please check your input.",
    401: "Unauthorized. Please log in.",
    403: "Forbidden. You don't have permission.",
    404: "Resource not found.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please try again later.",
    500: "Server error. Please try again later.",
    502: "Bad gateway. Please try again later.",
    503: "Service unavailable. Please try again later.",
    504: "Gateway timeout. Please try again later.",
  };

  return messages[status] || `An error occurred (${status})`;
};

/**
 * Transform file upload response
 * Handles multipart/form-data responses
 *
 * @param {Object} response - Axios response object
 * @returns {Object} - { url: string, filename: string, size: number, ... }
 */
export const transformUploadResponse = (response) => {
  const data = transformResponse(response);

  // Ensure we have file metadata
  if (!data || typeof data !== "object") {
    logger.warn("Invalid upload response format", { data });
    return null;
  }

  return {
    url: data.url || data.path,
    filename: data.filename || data.name,
    size: data.size,
    type: data.type || data.mimeType,
    ...data,
  };
};

/**
 * Transform bulk operation response
 * Handles responses from bulk create/update/delete operations
 *
 * @param {Object} response - Axios response object
 * @returns {Object} - { success: number, failed: number, errors?: array }
 */
export const transformBulkResponse = (response) => {
  const data = transformResponse(response);

  if (!data || typeof data !== "object") {
    logger.warn("Invalid bulk response format", { data });
    return { success: 0, failed: 0, errors: [] };
  }

  return {
    success: data.success || data.successCount || 0,
    failed: data.failed || data.failedCount || 0,
    errors: data.errors || data.failures || [],
    total: data.total || 0,
  };
};
