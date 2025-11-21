import api from "../../../core/api/index.js";
import { userKeys } from "../../../core/queries/queryKeys.js";
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useGenericMutation,
} from "../../../core/queries/mutationHelpers.js";

//* This is used in multiple of files, preferably use it in /feature/users

/**
 * User Mutation Hooks
 *
 * Custom hooks for user CRUD operations with:
 * - Optimistic updates
 * - Cache invalidation
 * - Success/error toasts
 * - Automatic refetching
 */

/**
 * Create user mutation
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const createUser = useCreateUser();
 *
 * createUser.mutate({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   role: 'user'
 * }, {
 *   onSuccess: (user) => navigate(`/users/${user.id}`)
 * });
 */
export const useCreateUser = (options = {}) => {
  return useCreateMutation({
    mutationFn: (data) => api.post("/users", data),
    invalidateKeys: [userKeys.all],
    successMessage: "User created successfully!",
    errorMessage: "Failed to create user",
    ...options,
  });
};

/**
 * Update user mutation with optimistic updates
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const updateUser = useUpdateUser();
 *
 * updateUser.mutate({
 *   id: '123',
 *   name: 'Jane Doe',
 *   status: 'active'
 * });
 */
export const useUpdateUser = (options = {}) => {
  return useUpdateMutation({
    mutationFn: ({ id, ...data }) => api.put(`/users/${id}`, data),
    queryKey: userKeys.all, // Will update all user queries
    updateCache: (old, variables) => {
      // Optimistically update the user in cache
      if (!old) return old;

      // If it's a list response (paginated)
      if (old.data && Array.isArray(old.data)) {
        return {
          ...old,
          data: old.data.map((user) =>
            user.id === variables.id ? { ...user, ...variables } : user
          ),
        };
      }

      // If it's a single user response
      if (old.id === variables.id) {
        return { ...old, ...variables };
      }

      return old;
    },
    invalidateKeys: [userKeys.all],
    successMessage: "User updated successfully!",
    errorMessage: "Failed to update user",
    ...options,
  });
};

/**
 * Delete user mutation with optimistic updates
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const deleteUser = useDeleteUser();
 *
 * deleteUser.mutate('123', {
 *   onSuccess: () => navigate('/users')
 * });
 */
export const useDeleteUser = (options = {}) => {
  return useDeleteMutation({
    mutationFn: (userId) => api.delete(`/users/${userId}`),
    queryKey: userKeys.all,
    removeFromCache: (old, userId) => {
      // Optimistically remove the user from cache
      if (!old) return old;

      // If it's a list response (paginated)
      if (old.data && Array.isArray(old.data)) {
        return {
          ...old,
          data: old.data.filter((user) => user.id !== userId),
          meta: old.meta ? { ...old.meta, total: old.meta.total - 1 } : null,
        };
      }

      return old;
    },
    invalidateKeys: [userKeys.all],
    successMessage: "User deleted successfully!",
    errorMessage: "Failed to delete user",
    ...options,
  });
};

/**
 * Bulk delete users mutation
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const bulkDelete = useBulkDeleteUsers();
 *
 * bulkDelete.mutate(['123', '456', '789']);
 */
export const useBulkDeleteUsers = (options = {}) => {
  return useGenericMutation({
    mutationFn: (userIds) => api.post("/users/bulk-delete", { ids: userIds }),
    invalidateKeys: [userKeys.all],
    successMessage: "Users deleted successfully!",
    errorMessage: "Failed to delete users",
    ...options,
  });
};

/**
 * Update user status (activate/deactivate)
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const updateStatus = useUpdateUserStatus();
 *
 * updateStatus.mutate({
 *   userId: '123',
 *   status: 'inactive'
 * });
 */
export const useUpdateUserStatus = (options = {}) => {
  return useUpdateMutation({
    mutationFn: ({ userId, status }) => api.patch(`/users/${userId}/status`, { status }),
    queryKey: userKeys.all,
    updateCache: (old, variables) => {
      if (!old) return old;

      // Update status in list
      if (old.data && Array.isArray(old.data)) {
        return {
          ...old,
          data: old.data.map((user) =>
            user.id === variables.userId ? { ...user, status: variables.status } : user
          ),
        };
      }

      // Update status for single user
      if (old.id === variables.userId) {
        return { ...old, status: variables.status };
      }

      return old;
    },
    invalidateKeys: [userKeys.all],
    successMessage: "User status updated!",
    errorMessage: "Failed to update status",
    ...options,
  });
};

/**
 * Update user role
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const updateRole = useUpdateUserRole();
 *
 * updateRole.mutate({
 *   userId: '123',
 *   roleId: 'admin'
 * });
 */
export const useUpdateUserRole = (options = {}) => {
  return useUpdateMutation({
    mutationFn: ({ userId, roleId }) => api.patch(`/users/${userId}/role`, { roleId }),
    queryKey: userKeys.all,
    invalidateKeys: [userKeys.all],
    successMessage: "User role updated!",
    errorMessage: "Failed to update role",
    ...options,
  });
};

/**
 * Reset user password
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const resetPassword = useResetUserPassword();
 *
 * resetPassword.mutate({ userId: '123' });
 */
export const useResetUserPassword = (options = {}) => {
  return useGenericMutation({
    mutationFn: ({ userId }) => api.post(`/users/${userId}/reset-password`),
    successMessage: "Password reset email sent!",
    errorMessage: "Failed to reset password",
    ...options,
  });
};

/**
 * Upload user avatar
 *
 * @param {Object} options - Additional mutation options
 * @returns {UseMutationResult}
 *
 * @example
 * const uploadAvatar = useUploadUserAvatar();
 *
 * const handleFileChange = (e) => {
 *   const file = e.target.files[0];
 *   uploadAvatar.mutate({ userId: '123', file });
 * };
 */
export const useUploadUserAvatar = (options = {}) => {
  return useUpdateMutation({
    mutationFn: ({ userId, file }) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return api.upload(`/users/${userId}/avatar`, formData);
    },
    queryKey: userKeys.all,
    invalidateKeys: [userKeys.all],
    successMessage: "Avatar uploaded successfully!",
    errorMessage: "Failed to upload avatar",
    ...options,
  });
};
