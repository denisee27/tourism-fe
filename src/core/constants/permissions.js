/**
 * Permission Constants
 *
 * Defines all permissions in the system.
 * Permissions follow the pattern: resource:action
 *
 * Backend contract:
 * User object includes: { permissions: ['users:create'], role: 'admin' }
 */
//! All permissions' key, if added must be using colon

export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_EXPORT: "users:export",

  // Roles & Permissions Management
  ROLES_VIEW: "roles:view",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",

  // Invoices
  INVOICES_VIEW: "invoices:view",
  INVOICES_CREATE: "invoices:create",
  INVOICES_UPDATE: "invoices:update",
  INVOICES_DELETE: "invoices:delete",
  INVOICES_APPROVE: "invoices:approve",
  INVOICES_EXPORT: "invoices:export",

  // Products
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",
  PRODUCTS_IMPORT: "products:import",
  PRODUCTS_EXPORT: "products:export",

  // Reports
  REPORTS_VIEW: "reports:view",
  REPORTS_CREATE: "reports:create",
  REPORTS_EXPORT: "reports:export",
  REPORTS_FINANCIAL: "reports:financial",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
  SETTINGS_SYSTEM: "settings:system",

  // Audit Logs
  AUDIT_VIEW: "audit:view",
  AUDIT_EXPORT: "audit:export",
};

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  GUEST: "guest",
};

/**
 * Role hierarchy: higher roles inherit permissions from lower roles
 * Used for role-based checks: hasRole('admin') also returns true for 'super_admin'
 */
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.MANAGER]: 3,
  [ROLES.USER]: 2,
  [ROLES.GUEST]: 1,
};

/**
 * Check if roleA is higher or equal to roleB in hierarchy
 */
export const isRoleHigherOrEqual = (roleA, roleB) => {
  const levelA = ROLE_HIERARCHY[roleA] || 0;
  const levelB = ROLE_HIERARCHY[roleB] || 0;
  return levelA >= levelB;
};

/**
 * Default permissions per role
 * Note: Backend should be the source of truth
 * This is for documentation and testing purposes
 */
export const ROLE_PERMISSIONS_MAP = {
  [ROLES.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.ADMIN]: [
    // Users
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_EXPORT,

    // Roles (view only)
    PERMISSIONS.ROLES_VIEW,

    // Invoices
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_UPDATE,
    PERMISSIONS.INVOICES_DELETE,
    PERMISSIONS.INVOICES_APPROVE,
    PERMISSIONS.INVOICES_EXPORT,

    // Products
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_IMPORT,
    PERMISSIONS.PRODUCTS_EXPORT,

    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_FINANCIAL,

    // Settings
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,

    // Audit
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
  ],

  [ROLES.MANAGER]: [
    // Users (view only)
    PERMISSIONS.USERS_VIEW,

    // Invoices
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_UPDATE,
    PERMISSIONS.INVOICES_APPROVE,
    PERMISSIONS.INVOICES_EXPORT,

    // Products
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,

    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_EXPORT,

    // Settings (view only)
    PERMISSIONS.SETTINGS_VIEW,
  ],

  [ROLES.USER]: [
    // Invoices (view and create only)
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,

    // Products (view only)
    PERMISSIONS.PRODUCTS_VIEW,

    // Reports (view only)
    PERMISSIONS.REPORTS_VIEW,
  ],

  [ROLES.GUEST]: [
    // Very limited access
    PERMISSIONS.PRODUCTS_VIEW,
  ],
};

export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: {
    label: "User Management",
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_EXPORT,
    ],
  },

  ROLE_MANAGEMENT: {
    label: "Role Management",
    permissions: [
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.ROLES_DELETE,
    ],
  },

  INVOICE_MANAGEMENT: {
    label: "Invoice Management",
    permissions: [
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_DELETE,
      PERMISSIONS.INVOICES_APPROVE,
      PERMISSIONS.INVOICES_EXPORT,
    ],
  },

  PRODUCT_MANAGEMENT: {
    label: "Product Management",
    permissions: [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.PRODUCTS_IMPORT,
      PERMISSIONS.PRODUCTS_EXPORT,
    ],
  },

  REPORTING: {
    label: "Reporting",
    permissions: [
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_CREATE,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.REPORTS_FINANCIAL,
    ],
  },

  SETTINGS: {
    label: "Settings",
    permissions: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,
      PERMISSIONS.SETTINGS_SYSTEM,
    ],
  },

  AUDIT: {
    label: "Audit & Logs",
    permissions: [PERMISSIONS.AUDIT_VIEW, PERMISSIONS.AUDIT_EXPORT],
  },
};

/**
 * Get human-readable label for a permission
 */
export const getPermissionLabel = (permission) => {
  const labels = {
    // Users
    [PERMISSIONS.USERS_VIEW]: "View Users",
    [PERMISSIONS.USERS_CREATE]: "Create Users",
    [PERMISSIONS.USERS_UPDATE]: "Update Users",
    [PERMISSIONS.USERS_DELETE]: "Delete Users",
    [PERMISSIONS.USERS_EXPORT]: "Export Users",

    // Roles
    [PERMISSIONS.ROLES_VIEW]: "View Roles",
    [PERMISSIONS.ROLES_CREATE]: "Create Roles",
    [PERMISSIONS.ROLES_UPDATE]: "Update Roles",
    [PERMISSIONS.ROLES_DELETE]: "Delete Roles",

    // Invoices
    [PERMISSIONS.INVOICES_VIEW]: "View Invoices",
    [PERMISSIONS.INVOICES_CREATE]: "Create Invoices",
    [PERMISSIONS.INVOICES_UPDATE]: "Update Invoices",
    [PERMISSIONS.INVOICES_DELETE]: "Delete Invoices",
    [PERMISSIONS.INVOICES_APPROVE]: "Approve Invoices",
    [PERMISSIONS.INVOICES_EXPORT]: "Export Invoices",

    // Products
    [PERMISSIONS.PRODUCTS_VIEW]: "View Products",
    [PERMISSIONS.PRODUCTS_CREATE]: "Create Products",
    [PERMISSIONS.PRODUCTS_UPDATE]: "Update Products",
    [PERMISSIONS.PRODUCTS_DELETE]: "Delete Products",
    [PERMISSIONS.PRODUCTS_IMPORT]: "Import Products",
    [PERMISSIONS.PRODUCTS_EXPORT]: "Export Products",

    // Reports
    [PERMISSIONS.REPORTS_VIEW]: "View Reports",
    [PERMISSIONS.REPORTS_CREATE]: "Create Reports",
    [PERMISSIONS.REPORTS_EXPORT]: "Export Reports",
    [PERMISSIONS.REPORTS_FINANCIAL]: "View Financial Reports",

    // Settings
    [PERMISSIONS.SETTINGS_VIEW]: "View Settings",
    [PERMISSIONS.SETTINGS_UPDATE]: "Update Settings",
    [PERMISSIONS.SETTINGS_SYSTEM]: "Manage System Settings",

    // Audit
    [PERMISSIONS.AUDIT_VIEW]: "View Audit Logs",
    [PERMISSIONS.AUDIT_EXPORT]: "Export Audit Logs",
  };

  return labels[permission] || permission;
};

/**
 * Get human-readable label for a role
 */
export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.SUPER_ADMIN]: "Super Administrator",
    [ROLES.ADMIN]: "Administrator",
    [ROLES.MANAGER]: "Manager",
    [ROLES.USER]: "User",
    [ROLES.GUEST]: "Guest",
  };

  return labels[role] || role;
};

export default PERMISSIONS;
