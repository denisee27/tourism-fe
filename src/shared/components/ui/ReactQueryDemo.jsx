import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../../features/users/hooks/index.js";
import { userKeys } from "../../../core/queries/queryKeys.js";
import { logger } from "../../../core/utils/logger.js";
import api from "../../../core/api/index.js";
import PermissionGuard from "../guards/PermissionGuard.jsx";
import PERMISSIONS from "../../../core/constants/permissions.js";

/**
 * React Query Patterns Demo
 *
 * Demonstrates React Query integration patterns:
 * - Query hooks with caching
 * - Mutations with optimistic updates
 * - Cache invalidation
 * - Infinite queries
 * - Prefetching
 */

const ReactQueryDemo = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [page, setPage] = useState(1);

  // Query hooks
  const {
    data: usersResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUsers({ page, limit: 5 });
  logger.info("usersResponse", usersResponse);

  const { data: selectedUser, isLoading: isLoadingUser } = useUser(selectedUserId);

  // Mutation hooks
  const createUser = useCreateUser({
    onSuccess: (user) => {
      logger.info("User created!", user);
      setSelectedUserId(user.id);
    },
  });

  const updateUser = useUpdateUser({
    onSuccess: (user) => {
      logger.info("User updated!", user);
    },
  });

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      logger.info("User deleted!");
      setSelectedUserId(null);
    },
  });

  // Handlers
  const handleCreateUser = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    createUser.mutate({
      name: `Test User ${randomNum}`,
      email: `test${randomNum}@example.com`,
      role: "user",
    });
  };

  const handleUpdateUser = (userId) => {
    updateUser.mutate({
      id: userId,
      name: `Updated User ${Date.now()}`,
    });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(userId);
    }
  };

  const handleInvalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    logger.info("Cache invalidated - all user queries will refetch");
  };

  const handleClearCache = () => {
    queryClient.removeQueries({ queryKey: userKeys.all });
    logger.info("Cache cleared - all user data removed");
  };

  const handlePrefetch = async () => {
    const users = usersResponse?.data || [];
    if (users.length > 0) {
      const userId = users[0].id;
      await queryClient.prefetchQuery({
        queryKey: userKeys.detail(userId),
        queryFn: () => api.get(`/users/${userId}`),
      });
      logger.info("Prefetched user data", { userId });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">React Query Patterns Demo</h1>
        <p className="text-gray-600 mb-8">
          Test React Query integration with caching, optimistic updates, and more.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Status */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">📊 Query Status</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Loading:</span>
                <span className={isLoading ? "text-blue-600" : "text-gray-500"}>
                  {isLoading ? "⏳ Yes" : "✓ No"}
                </span>
              </div>

              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Fetching:</span>
                <span className={isFetching ? "text-blue-600" : "text-gray-500"}>
                  {isFetching ? "🔄 Yes" : "✓ No"}
                </span>
              </div>

              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Error:</span>
                <span className={error ? "text-red-600" : "text-green-600"}>
                  {error ? "❌ Yes" : "✓ No"}
                </span>
              </div>

              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Users Loaded:</span>
                <span className="text-gray-700">{usersResponse?.data?.length || 0}</span>
              </div>

              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Total Users:</span>
                <span className="text-gray-700">{usersResponse?.meta?.total || 0}</span>
              </div>

              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Current Page:</span>
                <span className="text-gray-700">
                  {page} / {usersResponse?.meta?.totalPages || 1}
                </span>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-1"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  !usersResponse?.meta || page >= usersResponse.meta.totalPages || isLoading
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-1"
              >
                Next →
              </button>
            </div>
          </section>

          {/* Mutation Actions */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">🔧 Mutation Actions</h2>

            <div className="space-y-3">
              <button
                onClick={handleCreateUser}
                disabled={createUser.isPending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                {createUser.isPending ? "Creating..." : "➕ Create User (Optimistic)"}
              </button>

              <button
                onClick={refetch}
                disabled={isFetching}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                {isFetching ? "Refetching..." : "🔄 Refetch Query"}
              </button>

              <button
                onClick={handleInvalidateCache}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-left"
              >
                🗑️ Invalidate Cache
              </button>

              <button
                onClick={handleClearCache}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-left"
              >
                ❌ Clear Cache
              </button>

              <button
                onClick={handlePrefetch}
                disabled={!usersResponse?.data?.length}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                ⚡ Prefetch First User
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-900">
                <strong>Tip:</strong> Watch the console logs to see React Query in action. Notice
                how queries cache data and mutations trigger refetches.
              </p>
            </div>
          </section>

          {/* Users List */}
          <section className="bg-white rounded-lg p-6 shadow-md lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">👥 Users List</h2>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-900">
                <p className="font-semibold">Error loading users:</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}

            {!isLoading && !error && usersResponse?.data && (
              <div className="space-y-2">
                {usersResponse.data.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found. Create one to get started!
                  </div>
                ) : (
                  usersResponse.data.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-lg transition ${
                        selectedUserId === user.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{user.name || "Unknown User"}</h3>
                          <p className="text-sm text-gray-600">{user.email || "No email"}</p>
                          <div className="mt-1 flex gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {user.role?.name || "user"}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {user.status || "unknown"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUserId(user.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                          >
                            View
                          </button>
                          <PermissionGuard permission={PERMISSIONS.USERS_UPDATE}>
                            <button
                              onClick={() => handleUpdateUser(user.id)}
                              disabled={updateUser.isPending}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 transition text-sm"
                            >
                              {updateUser.isPending ? "..." : "Edit"}
                            </button>
                          </PermissionGuard>

                          <PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUser.isPending}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition text-sm"
                            >
                              {deleteUser.isPending ? "..." : "Delete"}
                            </button>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* Selected User Details */}
          {selectedUserId && (
            <section className="bg-white rounded-lg p-6 shadow-md lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">📋 Selected User Details</h2>

              {isLoadingUser && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}

              {!isLoadingUser && selectedUser && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(selectedUser, null, 2)}
                  </pre>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Patterns Documentation */}
        <section className="bg-gray-900 text-gray-100 rounded-lg p-6 shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">📚 React Query Patterns</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">Query Patterns</h3>
              <ul className="space-y-2">
                <li>
                  ✓ <code>useUsers(filters)</code> - Paginated list
                </li>
                <li>
                  ✓ <code>useUser(id)</code> - Single item
                </li>
                <li>
                  ✓ <code>useInfiniteUsers()</code> - Infinite scroll
                </li>
                <li>
                  ✓ <code>useSearchUsers(query)</code> - Search with debounce
                </li>
                <li>✓ Automatic caching (5 min stale time)</li>
                <li>✓ Background refetching</li>
                <li>✓ Error retry (3 attempts)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-green-400">Mutation Patterns</h3>
              <ul className="space-y-2">
                <li>
                  ✓ <code>useCreateUser()</code> - Create with cache update
                </li>
                <li>
                  ✓ <code>useUpdateUser()</code> - Update with optimistic UI
                </li>
                <li>
                  ✓ <code>useDeleteUser()</code> - Delete with rollback
                </li>
                <li>✓ Automatic cache invalidation</li>
                <li>✓ Success/error toasts</li>
                <li>✓ Loading states</li>
                <li>✓ Rollback on error</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-800 rounded">
            <p className="text-xs text-gray-400">
              <strong>Note:</strong> This demo uses mock/simulated data since the backend may not be
              available. The patterns shown work exactly the same with real API calls.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReactQueryDemo;
