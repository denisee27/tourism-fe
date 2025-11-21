/**
 * Query Key Factories
 *
 * Centralized query key management for React Query.
 * Provides consistent, organized keys for caching and invalidation.
 *
 * Benefits:
 * - Type-safe keys (can add TypeScript later)
 * - Easy to invalidate related queries
 * - Hierarchical structure for better organization
 * - Prevents key conflicts
 *
 * @example
 * // In a component
 * import { userKeys } from '@/core/queries/queryKeys';
 *
 * const { data } = useQuery({
 *   queryKey: userKeys.detail(userId),
 *   queryFn: () => api.get(`/users/${userId}`)
 * });
 *
 * // Invalidate all user queries
 * queryClient.invalidateQueries({ queryKey: userKeys.all });
 *
 * // Invalidate specific user
 * queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
 */

/**
 * User Query Keys
 * Hierarchical structure:
 * ['users'] - All user-related queries
 * ['users', 'list'] - All user list queries
 * ['users', 'list', { filters }] - Specific filtered list
 * ['users', 'detail'] - All user detail queries
 * ['users', 'detail', id] - Specific user
 */
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  search: (query) => [...userKeys.all, "search", query],
};

/**
 * Post Query Keys
 */
export const postKeys = {
  all: ["posts"],
  lists: () => [...postKeys.all, "list"],
  list: (filters) => [...postKeys.lists(), filters],
  details: () => [...postKeys.all, "detail"],
  detail: (id) => [...postKeys.details(), id],
  byUser: (userId) => [...postKeys.all, "by-user", userId],
};

/**
 * dashboard
 */
export const dashboardKeys = {
  all: ["dashboard"],
  userActivity: (filters = {}) => ["dashboard", "user-activity", filters],
};

/**
 * Asset Query Keys
 */
export const assetKeys = {
  all: ["assets"],
  lists: () => [...assetKeys.all, "list"],
  list: (filters) => [...assetKeys.lists(), filters],
  details: () => [...assetKeys.all, "detail"],
  detail: (id) => [...assetKeys.details(), id],
  byStatus: (status) => [...assetKeys.all, "by-status", status],
};

/**
 * Invoice Query Keys
 */
export const invoiceKeys = {
  all: ["invoices"],
  lists: () => [...invoiceKeys.all, "list"],
  list: (filters) => [...invoiceKeys.lists(), filters],
  details: () => [...invoiceKeys.all, "detail"],
  detail: (id) => [...invoiceKeys.details(), id],
  byStatus: (status) => [...invoiceKeys.all, "by-status", status],
  stats: () => [...invoiceKeys.all, "stats"],
};

/**
 * Role Query Keys
 */
export const roleKeys = {
  all: ["roles"],
  lists: () => [...roleKeys.all, "list"],
  list: (filters) => [...roleKeys.lists(), filters],
  details: () => [...roleKeys.all, "detail"],
  detail: (id) => [...roleKeys.details(), id],
};

/**
 * Permission Query Keys
 */
export const permissionKeys = {
  all: ["permissions"],
  lists: () => [...permissionKeys.all, "list"],
  list: () => [...permissionKeys.lists()],
  byRole: (roleId) => [...permissionKeys.all, "by-role", roleId],
};

/**
 * Authentication Query Keys
 */
export const authKeys = {
  all: ["auth"],
  me: () => [...authKeys.all, "me"],
  session: () => [...authKeys.all, "session"],
};

/**
 * Settings Query Keys
 */
export const settingsKeys = {
  all: ["settings"],
  general: () => [...settingsKeys.all, "general"],
  user: () => [...settingsKeys.all, "user"],
  system: () => [...settingsKeys.all, "system"],
};

/**
 * Analytics Query Keys
 */
export const analyticsKeys = {
  all: ["analytics"],
  dashboard: () => [...analyticsKeys.all, "dashboard"],
  reports: () => [...analyticsKeys.all, "reports"],
  report: (id) => [...analyticsKeys.reports(), id],
};

/**
 * Helper: Create query keys for a generic resource
 * Useful for new features
 *
 * @param {string} resource - Resource name (e.g., 'products', 'categories')
 * @returns {Object} - Query key factory
 *
 * @example
 * const productKeys = createResourceKeys('products');
 * productKeys.all // ['products']
 * productKeys.detail(123) // ['products', 'detail', 123]
 */
export const createResourceKeys = (resource) => ({
  all: [resource],
  lists: () => [resource, "list"],
  list: (filters) => [resource, "list", filters],
  details: () => [resource, "detail"],
  detail: (id) => [resource, "detail", id],
  search: (query) => [resource, "search", query],
});

/**
 * Helper: Get all query keys for invalidation
 * Useful for invalidating everything on logout
 *
 * @returns {Array} - All base query keys
 */
export const getAllQueryKeys = () => [
  userKeys.all,
  postKeys.all,
  assetKeys.all,
  invoiceKeys.all,
  roleKeys.all,
  permissionKeys.all,
  authKeys.all,
  settingsKeys.all,
  analyticsKeys.all,
  dashboardKeys.all,
];

/**
 * Helper: Invalidate all queries
 * Used on logout, major state changes, etc.
 *
 * @param {QueryClient} queryClient - React Query client
 */
export const invalidateAllQueries = (queryClient) => {
  getAllQueryKeys().forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};
