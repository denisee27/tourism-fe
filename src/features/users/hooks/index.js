/**
 * User Hooks
 * * Could be changed this is just another preference
 * Centralized exports for all user-related hooks.
 * Import from this file in components.
 *
 * @example
 * import { useUsers, useCreateUser, useUpdateUser } from '@/features/users/hooks';
 */

// Query hooks
export {
  useUsers,
  useInfiniteUsers,
  useUser,
  useSearchUsers,
  prefetchUser,
  prefetchUsers,
} from "./useUserQueries.js";

// Mutation hooks
export {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  useResetUserPassword,
  useUploadUserAvatar,
} from "./useUserMutations.js";
