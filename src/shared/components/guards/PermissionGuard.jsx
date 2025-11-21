import React from "react";
import { usePermissions } from "../../../core/auth/usePermissions";
import { logger } from "../../../core/utils/logger";

/**
 * Permission Guard Component
 *
 * Conditionally renders children based on permission checks.
 *
 * Usage:
 *
 * 1. Single permission:
 * <PermissionGuard permission="users.create">
 *   <CreateUserButton />
 * </PermissionGuard>
 *
 * 2. Multiple permissions (require ALL):
 * <PermissionGuard permissions={['users.view', 'users.update']} requireAll>
 *   <EditUserForm />
 * </PermissionGuard>
 *
 * 3. Multiple permissions (require ANY):
 * <PermissionGuard permissions={['users.create', 'users.update']}>
 *   <UserActions />
 * </PermissionGuard>
 *
 * 4. Role-based:
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * 5. Multiple roles:
 * <PermissionGuard roles={['admin', 'manager']}>
 *   <ManagerPanel />
 * </PermissionGuard>
 *
 * 6. With fallback:
 * <PermissionGuard permission="users.view" fallback={<NoAccessMessage />}>
 *   <UserList />
 * </PermissionGuard>
 *
 * 7. Invert logic (show when user does NOT have permission):
 * <PermissionGuard permission="premium.feature" invert fallback={<UpgradePrompt />}>
 *   <FreeUserContent />
 * </PermissionGuard>
 */

export const PermissionGuard = ({
  // Permission checks
  permission = null,
  permissions = null,
  requireAll = false,

  // Role checks
  role = null,
  roles = null,
  exactRole = false,

  // Component behavior
  children,
  fallback = null,
  invert = false,
  loading = null,

  // Debug
  debug = true,
}) => {
  const { can, hasAllPermissions, hasAnyPermission, hasRole, hasAnyRole, isAuthenticated } =
    usePermissions();

  // Show loading state if provided
  if (!isAuthenticated && loading) {
    return loading;
  }

  let hasAccess = false;

  // Check permissions
  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && Array.isArray(permissions)) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  // Check roles
  else if (role) {
    hasAccess = hasRole(role, exactRole);
  } else if (roles && Array.isArray(roles)) {
    hasAccess = hasAnyRole(roles, exactRole);
  }
  // If no checks provided, allow access by default (just authenticated)
  else {
    hasAccess = isAuthenticated;
  }

  // Invert logic if requested
  if (invert) {
    hasAccess = !hasAccess;
  }

  // Debug logging
  if (debug) {
    logger.debug("PermissionGuard check", {
      permission,
      permissions,
      role,
      roles,
      requireAll,
      exactRole,
      invert,
      hasAccess,
      isAuthenticated,
    });
  }

  // Render based on access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if no access
  return fallback ? <>{fallback}</> : null;
};

/**
 * Convenience wrapper for common use cases
 */

// Show only to admins
export const AdminOnly = ({ children, fallback = null }) => (
  <PermissionGuard role="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Show only to managers and above
export const ManagerOnly = ({ children, fallback = null }) => (
  <PermissionGuard role="manager" fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Show only to super admins
export const SuperAdminOnly = ({ children, fallback = null }) => (
  <PermissionGuard role="super_admin" exactRole fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Show to authenticated users (any role)
export const AuthenticatedOnly = ({ children, fallback = null }) => {
  const { isAuthenticated } = usePermissions();
  return isAuthenticated ? <>{children}</> : fallback ? <>{fallback}</> : null;
};

// Show to guests (not authenticated)
export const GuestOnly = ({ children }) => {
  const { isAuthenticated } = usePermissions();
  return !isAuthenticated ? <>{children}</> : null;
};

export default PermissionGuard;
