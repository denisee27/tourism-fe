import { useAuthStore } from "../../features/auth/stores/authStore";
import { ROLE_HIERARCHY, isRoleHigherOrEqual } from "../constants/permissions";
import { logger } from "../utils/logger";

/**
 * Permissions Hook
 *
 * Provides permission checking functions for the authenticated user.
 *
 * Usage:
 * const { can, cannot, hasRole, hasAnyRole, hasAllRoles, user } = usePermissions();
 *
 * if (can('users.create')) {
 *   -> Show create button
 * }
 *
 * if (hasRole('admin')) {
 *   -> Show admin panel
 * }
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  // Derive isAuthenticated from status (like useAuth does)
  const isAuthenticated = status === "authenticated";

  // Get user's permissions array from auth store
  const permissions = user?.permissions || [];
  // Handle both string role and object role (from API)
  const role = typeof user?.role === "string" ? user.role : user?.role?.name || null;

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check (e.g., 'users.create')
   * @returns {boolean}
   */
  const can = (permission) => {
    if (!isAuthenticated || !user) {
      logger.debug("Permission check failed - user not authenticated", { permission });
      return false;
    }

    // Super admin bypass - has all permissions
    if (role === "super_admin") {
      return true;
    }
    const hasPermission = permissions.includes(permission);

    logger.info("hasPermission", { hasPermission, permission, permissions });

    if (!hasPermission) {
      logger.debug("Permission denied", {
        user: user.email,
        permission,
        userPermissions: permissions,
      });
    }

    return hasPermission;
  };

  /**
   * Check if user does NOT have a specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  const cannot = (permission) => {
    return !can(permission);
  };

  /**
   * Check if user has ALL of the provided permissions
   * @param {string[]} permissionsToCheck - Array of permissions
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionsToCheck) => {
    if (!Array.isArray(permissionsToCheck)) {
      logger.error("hasAllPermissions expects an array", { permissionsToCheck });
      return false;
    }

    return permissionsToCheck.every((permission) => can(permission));
  };

  /**
   * Check if user has ANY of the provided permissions
   * @param {string[]} permissionsToCheck - Array of permissions
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionsToCheck) => {
    if (!Array.isArray(permissionsToCheck)) {
      logger.error("hasAnyPermission expects an array", { permissionsToCheck });
      return false;
    }

    return permissionsToCheck.some((permission) => can(permission));
  };

  /**
   * Check if user has a specific role
   * Supports role hierarchy: admin check returns true for super_admin
   * @param {string} roleToCheck - Role to check
   * @param {boolean} exact - If true, checks exact role match (no hierarchy)
   * @returns {boolean}
   */
  const hasRole = (roleToCheck, exact = false) => {
    if (!isAuthenticated || !user || !role) {
      logger.debug("Role check failed - user not authenticated or role missing", {
        isAuthenticated,
        hasUser: !!user,
        role,
        roleToCheck,
      });
      return false;
    }

    if (exact) {
      return role === roleToCheck;
    }

    // Check role hierarchy: higher roles satisfy lower role checks
    return isRoleHigherOrEqual(role, roleToCheck);
  };

  /**
   * Check if user has ANY of the provided roles
   * @param {string[]} rolesToCheck - Array of roles
   * @param {boolean} exact - If true, checks exact role match (no hierarchy)
   * @returns {boolean}
   */
  const hasAnyRole = (rolesToCheck, exact = false) => {
    if (!Array.isArray(rolesToCheck)) {
      logger.error("hasAnyRole expects an array", { rolesToCheck });
      return false;
    }

    return rolesToCheck.some((roleToCheck) => hasRole(roleToCheck, exact));
  };

  /**
   * Check if user has ALL of the provided roles
   * Note: In most systems, a user has only one role, so this is rarely used
   * @param {string[]} rolesToCheck - Array of roles
   * @param {boolean} exact - If true, checks exact role match (no hierarchy)
   * @returns {boolean}
   */
  const hasAllRoles = (rolesToCheck, exact = false) => {
    if (!Array.isArray(rolesToCheck)) {
      logger.error("hasAllRoles expects an array", { rolesToCheck });
      return false;
    }

    return rolesToCheck.every((roleToCheck) => hasRole(roleToCheck, exact));
  };

  /**
   * Get user's role hierarchy level
   * @returns {number} - Hierarchy level (0 if not found)
   */
  const getRoleLevel = () => {
    return ROLE_HIERARCHY[role] || 0;
  };

  /**
   * Check if user is super admin
   * @returns {boolean}
   */
  const isSuperAdmin = () => {
    return role === "super_admin";
  };

  /**
   * Check if user is admin or higher
   * @returns {boolean}
   */
  const isAdmin = () => {
    return hasRole("admin");
  };

  /**
   * Check if user is manager or higher
   * @returns {boolean}
   */
  const isManager = () => {
    return hasRole("manager");
  };

  return {
    // Permission checks
    can,
    cannot,
    hasAllPermissions,
    hasAnyPermission,

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getRoleLevel,

    // Convenience role checks
    isSuperAdmin,
    isAdmin,
    isManager,

    // User data
    user,
    role,
    permissions,
    isAuthenticated,
  };
};

/**
 * Higher-order function to check permission before executing action
 *
 * Usage:
 * const deleteUser = withPermission('users.delete', () => {
 *   api.deleteUser(id);
 * });
 */
export const withPermission = (permission, action, fallback = null) => {
  return (...args) => {
    const { can } = usePermissions();

    if (can(permission)) {
      return action(...args);
    } else {
      logger.warn(`Action blocked - missing permission: ${permission}`);
      return fallback ? fallback(...args) : null;
    }
  };
};

export default usePermissions;
