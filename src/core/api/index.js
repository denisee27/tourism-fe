/**
 * Core API Module
 *
 * Enhanced API client with:
 * - Automatic response transformation
 * - Retry logic for failed requests
 * - Request cancellation
 * - Error mapping and handling
 * - Upload/download support
 *
 * @example
 * // Simple GET request
 * const users = await api.get('/users');
 *
 * // GET with pagination
 * const { data, meta } = await api.getPaginated('/users', {
 *   params: { page: 1, limit: 10 }
 * });
 *
 * // POST request
 * const user = await api.post('/users', { name: 'John' });
 *
 * // Request with retry disabled
 * const data = await api.get('/users', { retry: false });
 *
 * // Cancelable request
 * const data = await api.get('/search', {
 *   params: { q: 'query' },
 *   cancelKey: 'search'
 * });
 * api.cancelRequest('search'); // Cancel if needed
 */

// Export the enhanced API client
export { api as default } from "./client.js";

// Export utilities for advanced usage
export { APIClient, axiosInstance } from "./client.js";
export * from "./transformers.js";
export * from "./errorMapping.js";
