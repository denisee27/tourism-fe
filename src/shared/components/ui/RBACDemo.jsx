import React from "react";
import { usePermissions } from "../../../core/auth/usePermissions";
import { PermissionGuard, AdminOnly, ManagerOnly, SuperAdminOnly } from "../guards/PermissionGuard";
import {
  PERMISSIONS,
  ROLES,
  getPermissionLabel,
  getRoleLabel,
} from "../../../core/constants/permissions";
import logger from "../../../core/utils/logger";

/**
 * RBAC Demo Component
 *
 * Comprehensive demo of the Role-Based Access Control system.
 * Shows permission checks, role checks, and guard components.
 */

const RBACDemo = () => {
  const {
    can,
    cannot,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    isSuperAdmin,
    isAdmin,
    isManager,
    user,
    role,
    permissions,
    getRoleLevel,
  } = usePermissions();

  logger.info("role", role);
  logger.info("user", user);
  logger.info("permissions", permissions);

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">RBAC System Demo</h1>
        <p className="text-gray-600 mb-8">
          Test the Role-Based Access Control system. Components appear/disappear based on your
          permissions.
        </p>

        {/* Current User Info */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Current User</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span className="text-gray-600">{user?.email || "Not logged in"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span className="text-gray-600">{user?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Role:</span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">
                {role ? getRoleLabel(role) : "N/A"}
              </span>
            </div>
            {user?.roleDetails && (
              <div className="flex justify-between">
                <span className="font-medium">Role Description:</span>
                <span className="text-gray-600 text-xs">{user.roleDetails.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Role Level:</span>
              <span className="text-gray-600">{getRoleLevel()}</span>
            </div>
            <div className="mt-4">
              <p className="font-medium mb-2">Permissions ({permissions.length}):</p>
              <div className="flex flex-wrap gap-1">
                {permissions.length > 0 ? (
                  permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No permissions</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Role Checks */}
        <section className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🎭 Role Checks</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Is Super Admin?</span>
              <span
                className={`font-semibold ${isSuperAdmin() ? "text-green-600" : "text-red-600"}`}
              >
                {isSuperAdmin() ? "✓ Yes" : "✗ No"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Is Admin (or higher)?</span>
              <span className={`font-semibold ${isAdmin() ? "text-green-600" : "text-red-600"}`}>
                {isAdmin() ? "✓ Yes" : "✗ No"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Is Manager (or higher)?</span>
              <span className={`font-semibold ${isManager() ? "text-green-600" : "text-red-600"}`}>
                {isManager() ? "✓ Yes" : "✗ No"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Has Admin role (exact)?</span>
              <span
                className={`font-semibold ${
                  hasRole("admin", true) ? "text-green-600" : "text-red-600"
                }`}
              >
                {hasRole("admin", true) ? "✓ Yes" : "✗ No"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Has any: [admin, manager]?</span>
              <span
                className={`font-semibold ${
                  hasAnyRole(["admin", "manager"]) ? "text-green-600" : "text-red-600"
                }`}
              >
                {hasAnyRole(["admin", "manager"]) ? "✓ Yes" : "✗ No"}
              </span>
            </div>
          </div>
        </section>

        {/* Permission Checks */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🔐 Permission Checks</h2>

          <div className="space-y-3">
            {[
              PERMISSIONS.USERS_VIEW,
              PERMISSIONS.USERS_CREATE,
              PERMISSIONS.USERS_DELETE,
              PERMISSIONS.INVOICES_VIEW,
              PERMISSIONS.INVOICES_APPROVE,
              PERMISSIONS.SETTINGS_SYSTEM,
            ].map((perm) => (
              <div key={perm} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm">{getPermissionLabel(perm)}</span>
                <span className={`font-semibold ${can(perm) ? "text-green-600" : "text-red-600"}`}>
                  {can(perm) ? "✓ Allowed" : "✗ Denied"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm font-medium mb-2">Complex Checks:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Has ALL: [users.view, users.create]?</span>
                <span
                  className={
                    hasAllPermissions([PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE])
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {hasAllPermissions([PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE])
                    ? "✓"
                    : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has ANY: [users.delete, invoices.delete]?</span>
                <span
                  className={
                    hasAnyPermission([PERMISSIONS.USERS_DELETE, PERMISSIONS.INVOICES_DELETE])
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {hasAnyPermission([PERMISSIONS.USERS_DELETE, PERMISSIONS.INVOICES_DELETE])
                    ? "✓"
                    : "✗"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Guard Components */}
        <section className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🛡️ Guard Components</h2>
          <p className="text-sm text-gray-600 mb-4">
            These sections appear/disappear based on permissions:
          </p>

          <div className="space-y-4">
            {/* Single Permission Guard */}
            <PermissionGuard
              permission={PERMISSIONS.USERS_CREATE}
              fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                  ✗ You need "users.create" permission to see this content
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                ✓ You have "users.create" permission! This content is visible.
              </div>
            </PermissionGuard>

            {/* Multiple Permissions (require ALL) */}
            <PermissionGuard
              permissions={[PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_UPDATE]}
              requireAll
              fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                  ✗ You need BOTH "users.view" AND "users.update" to see this
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                ✓ You have both "users.view" and "users.update" permissions!
              </div>
            </PermissionGuard>

            {/* Multiple Permissions (require ANY) */}
            <PermissionGuard
              permissions={[PERMISSIONS.INVOICES_CREATE, PERMISSIONS.INVOICES_UPDATE]}
              fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                  ✗ You need either "invoices.create" OR "invoices.update" to see this
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                ✓ You have at least one invoice permission!
              </div>
            </PermissionGuard>

            {/* Role-Based Guards */}
            <SuperAdminOnly
              fallback={
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠ Super Admin only content hidden
                </div>
              }
            >
              <div className="p-4 bg-purple-50 border border-purple-200 rounded text-purple-800">
                👑 Super Admin exclusive content!
              </div>
            </SuperAdminOnly>

            <AdminOnly
              fallback={
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠ Admin-only content hidden
                </div>
              }
            >
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded text-indigo-800">
                🔧 Admin panel access granted!
              </div>
            </AdminOnly>

            <ManagerOnly
              fallback={
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠ Manager-only content hidden
                </div>
              }
            >
              <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
                📊 Manager dashboard available!
              </div>
            </ManagerOnly>
          </div>
        </section>

        {/* Button Examples */}
        <section className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🔘 Conditional UI Elements</h2>

          <div className="flex flex-wrap gap-3">
            <PermissionGuard permission={PERMISSIONS.USERS_CREATE}>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                + Create User
              </button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                🗑 Delete User
              </button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.INVOICES_APPROVE}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                ✓ Approve Invoice
              </button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.SETTINGS_SYSTEM}>
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                ⚙ System Settings
              </button>
            </PermissionGuard>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Buttons only appear if you have the required permissions.
          </p>
        </section>

        {/* Testing Instructions */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4">🧪 Testing RBAC</h2>
          <div className="space-y-2 text-sm">
            <p>To test different roles, your backend should return different permissions:</p>
            <pre className="mt-2 p-3 bg-white rounded overflow-auto text-xs">
              {`// Login response should include:
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": [
      "users.view",
      "users.create",
      "users.update",
      "invoices.view",
      // ... more permissions
    ]
  },
  "accessToken": "..."
}`}
            </pre>
            <p className="mt-3">Navigate to protected routes to test:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <code>/users</code> - Requires users.view permission
              </li>
              <li>
                <code>/admin</code> - Requires admin role
              </li>
              <li>
                <code>/forbidden</code> - See the 403 page
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RBACDemo;
