import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { usePermissions } from "../../../core/auth/usePermissions";
import { logger } from "../../../core/utils/logger";

/**
 * Protected Route Component
 *
 * Protects routes from unauthenticated users and optionally checks permissions.
 *
 * Usage:
 *
 * 1. Basic authentication check (default):
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/" element={<Dashboard />} />
 * </Route>
 *
 * 2. With permission requirement:
 * <Route element={<ProtectedRoute permission="users.view" />}>
 *   <Route path="/users" element={<UserList />} />
 * </Route>
 *
 * 3. With multiple permissions (require ALL):
 * <Route element={<ProtectedRoute permissions={['users.view', 'users.update']} requireAll />}>
 *   <Route path="/users/edit/:id" element={<EditUser />} />
 * </Route>
 *
 * 4. With role requirement:
 * <Route element={<ProtectedRoute role="admin" />}>
 *   <Route path="/admin" element={<AdminPanel />} />
 * </Route>
 *
 * 5. With multiple roles:
 * <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
 *   <Route path="/reports" element={<Reports />} />
 * </Route>
 */

export default function ProtectedRoute({
  children,
  permission = null,
  permissions = null,
  requireAll = false,
  role = null,
  roles = null,
  exactRole = false,
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { can, hasAllPermissions, hasAnyPermission, hasRole, hasAnyRole } = usePermissions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    logger.info("Redirecting to login - user not authenticated");
    return <Navigate to="/home" replace />;
  }

  // Check permissions if specified
  let hasAccess = true;

  if (permission) {
    hasAccess = can(permission);
    if (!hasAccess) {
      logger.warn("Access denied - missing permission", { permission });
    }
  } else if (permissions && Array.isArray(permissions)) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    if (!hasAccess) {
      logger.warn("Access denied - missing permissions", { permissions, requireAll });
    }
  }

  // Check roles if specified
  if (hasAccess && role) {
    hasAccess = hasRole(role, exactRole);
    if (!hasAccess) {
      logger.warn("Access denied - insufficient role", { requiredRole: role, exactRole });
    }
  } else if (hasAccess && roles && Array.isArray(roles)) {
    hasAccess = hasAnyRole(roles, exactRole);
    if (!hasAccess) {
      logger.warn("Access denied - insufficient roles", { requiredRoles: roles, exactRole });
    }
  }

  // Redirect to 403 if access denied
  if (!hasAccess) {
    return <Navigate to="/forbidden" replace />;
  }

  // Render children or outlet
  return children ? children : <Outlet />;
}
