import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "../utils/logger.js";
import { useUIStore } from "../stores/uiStore.js";

/**
 * Mutation Helpers
 *
 * Reusable mutation patterns with:
 * - Optimistic updates
 * - Cache invalidation
 * - Error handling
 * - Success/error toasts
 * - Loading states
 *
 * @example
 * const createUser = useCreateMutation({
 *   mutationFn: (data) => api.post('/users', data),
 *   invalidateKeys: [userKeys.all],
 *   successMessage: 'User created successfully!',
 * });
 *
 * createUser.mutate({ name: 'John', email: 'john@example.com' });
 */

/**
 * Create mutation hook with common patterns
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.mutationFn - Function that performs the mutation
 * @param {Array} options.invalidateKeys - Query keys to invalidate on success
 * @param {string} options.successMessage - Toast message on success
 * @param {string} options.errorMessage - Toast message on error
 * @param {Function} options.onSuccess - Additional success handler
 * @param {Function} options.onError - Additional error handler
 * @param {boolean} options.showSuccessToast - Show success toast (default: true)
 * @param {boolean} options.showErrorToast - Show error toast (default: true)
 * @returns {UseMutationResult}
 */
export const useCreateMutation = (options) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useUIStore();

  const {
    mutationFn,
    invalidateKeys = [],
    successMessage = "Created successfully!",
    errorMessage = "Failed to create",
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Show success toast
      if (showSuccessToast) {
        showSuccess(successMessage);
      }

      // Log success
      logger.info("Create mutation succeeded", { data });

      // Call additional success handler
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (showErrorToast) {
        showError(errorMessage);
      }

      // Log error
      logger.error("Create mutation failed", { error, variables });

      // Call additional error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
  });
};

/**
 * Update mutation hook with optimistic updates
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.mutationFn - Function that performs the mutation
 * @param {Array} options.queryKey - Query key to update optimistically
 * @param {Function} options.updateCache - Function to update cache optimistically
 * @param {Array} options.invalidateKeys - Query keys to invalidate on success
 * @param {string} options.successMessage - Toast message on success
 * @param {string} options.errorMessage - Toast message on error
 * @param {boolean} options.optimistic - Enable optimistic updates (default: true)
 * @returns {UseMutationResult}
 */
export const useUpdateMutation = (options) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useUIStore();

  const {
    mutationFn,
    queryKey,
    updateCache,
    invalidateKeys = [],
    successMessage = "Updated successfully!",
    errorMessage = "Failed to update",
    onSuccess,
    onError,
    optimistic = true,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn,
    // Optimistic update
    onMutate: async (variables) => {
      if (!optimistic || !queryKey || !updateCache) {
        return;
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      queryClient.setQueryData(queryKey, (old) => updateCache(old, variables));

      // Return context with snapshot
      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Show success toast
      if (showSuccessToast) {
        showSuccess(successMessage);
      }

      // Log success
      logger.info("Update mutation succeeded", { data });

      // Call additional success handler
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Show error toast
      if (showErrorToast) {
        showError(errorMessage);
      }

      // Log error
      logger.error("Update mutation failed", { error, variables });

      // Call additional error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
};

/**
 * Delete mutation hook with optimistic updates
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.mutationFn - Function that performs the mutation
 * @param {Array} options.queryKey - Query key to update optimistically
 * @param {Function} options.removeFromCache - Function to remove item from cache
 * @param {Array} options.invalidateKeys - Query keys to invalidate on success
 * @param {string} options.successMessage - Toast message on success
 * @param {string} options.errorMessage - Toast message on error
 * @param {boolean} options.optimistic - Enable optimistic updates (default: true)
 * @returns {UseMutationResult}
 */
export const useDeleteMutation = (options) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useUIStore();

  const {
    mutationFn,
    queryKey,
    removeFromCache,
    invalidateKeys = [],
    successMessage = "Deleted successfully!",
    errorMessage = "Failed to delete",
    onSuccess,
    onError,
    optimistic = true,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn,
    // Optimistic update
    onMutate: async (variables) => {
      if (!optimistic || !queryKey || !removeFromCache) {
        return;
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically remove from cache
      queryClient.setQueryData(queryKey, (old) => removeFromCache(old, variables));

      // Return context with snapshot
      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Show success toast
      if (showSuccessToast) {
        showSuccess(successMessage);
      }

      // Log success
      logger.info("Delete mutation succeeded", { variables });

      // Call additional success handler
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Show error toast
      if (showErrorToast) {
        showError(errorMessage);
      }

      // Log error
      logger.error("Delete mutation failed", { error, variables });

      // Call additional error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
};

/**
 * Generic mutation hook
 * For mutations that don't fit create/update/delete pattern
 *
 * @param {Object} options - Mutation options
 * @returns {UseMutationResult}
 */
export const useGenericMutation = (options) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useUIStore();

  const {
    mutationFn,
    invalidateKeys = [],
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Show success toast
      if (showSuccessToast && successMessage) {
        showSuccess(successMessage);
      }

      // Log success
      logger.info("Mutation succeeded", { data });

      // Call additional success handler
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (showErrorToast && errorMessage) {
        showError(errorMessage);
      }

      // Log error
      logger.error("Mutation failed", { error, variables });

      // Call additional error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
  });
};
