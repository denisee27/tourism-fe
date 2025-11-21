import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "../../../core/api/index.js";
import { userKeys } from "../../../core/queries/queryKeys.js";
import { logger } from "../../../core/utils/logger.js";

/**
 * User Query Hooks
 *
 * Custom hooks for fetching user data with React Query.
 * Provides consistent query configuration and error handling.
 */

/**
 * Fetch all users (paginated)
 *
 * @param {Object} filters - Filter parameters
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @param {string} filters.search - Search query
 * @param {string} filters.role - Filter by role
 * @param {string} filters.status - Filter by status
 * @param {Object} options - React Query options
 * @returns {UseQueryResult}
 *
 * @example
 * const { data, isLoading, error } = useUsers({
 *   page: 1,
 *   limit: 10,
 *   role: 'admin'
 * });
 */
export const useUsers = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      logger.info("Fetching users", { filters });
      const result = await api.getPaginated("/users", { params: filters });
      logger.info("Fetched users", { result });
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Fetch infinite users (for infinite scroll)
 *
 * @param {Object} filters - Filter parameters
 * @param {Object} options - React Query options
 * @returns {UseInfiniteQueryResult}
 *
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteUsers({ limit: 20 });
 */
export const useInfiniteUsers = (filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: userKeys.list({ ...filters, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      logger.info("Fetching users page", { page: pageParam, filters });
      const result = await api.getPaginated("/users", {
        params: { ...filters, page: pageParam },
      });
      return result;
    },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      if (!meta) return undefined;

      const hasMore = meta.page < meta.totalPages;
      return hasMore ? meta.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Fetch single user by ID
 *
 * @param {string} userId - User ID
 * @param {Object} options - React Query options
 * @returns {UseQueryResult}
 *
 * @example
 * const { data: user, isLoading } = useUser(userId);
 */
export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      logger.info("Fetching user", { userId });
      const user = await api.get(`/users/${userId}`);
      return user;
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Search users
 *
 * @param {string} query - Search query
 * @param {Object} options - React Query options
 * @returns {UseQueryResult}
 *
 * @example
 * const { data: results } = useSearchUsers(searchTerm, {
 *   enabled: searchTerm.length > 2
 * });
 */
export const useSearchUsers = (query, options = {}) => {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: async () => {
      logger.info("Searching users", { query });
      const results = await api.get("/users/search", {
        params: { q: query },
      });
      return results;
    },
    enabled: query && query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes (searches get stale faster)
    ...options,
  });
};

/**
 * Prefetch user data
 * Useful for hover states, navigation preparation, etc.
 *
 * @param {QueryClient} queryClient - React Query client
 * @param {string} userId - User ID to prefetch
 *
 * @example
 * <Link
 *   to={`/users/${userId}`}
 *   onMouseEnter={() => prefetchUser(queryClient, userId)}
 * >
 *   View User
 * </Link>
 */
export const prefetchUser = async (queryClient, userId) => {
  await queryClient.prefetchQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => api.get(`/users/${userId}`),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Prefetch users list
 *
 * @param {QueryClient} queryClient - React Query client
 * @param {Object} filters - Filter parameters
 */
export const prefetchUsers = async (queryClient, filters = {}) => {
  await queryClient.prefetchQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => api.getPaginated("/users", { params: filters }),
    staleTime: 1000 * 60 * 5,
  });
};
