/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines user roles and their permissions
 */

// Role definitions
const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

// Permission definitions
const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // File operations
  FILE_UPLOAD: 'file:upload',
  FILE_READ: 'file:read',
  FILE_UPDATE: 'file:update',
  FILE_DELETE: 'file:delete',
  FILE_SHARE: 'file:share',
  FILE_DOWNLOAD: 'file:download',
  
  // Folder operations
  FOLDER_CREATE: 'folder:create',
  FOLDER_READ: 'folder:read',
  FOLDER_UPDATE: 'folder:update',
  FOLDER_DELETE: 'folder:delete',
  FOLDER_SHARE: 'folder:share',
  
  // Collaboration
  COMMENT_CREATE: 'comment:create',
  COMMENT_READ: 'comment:read',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  
  // System
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_USERS: 'system:users',
  
  // Search
  SEARCH_ALL: 'search:all',
  SEARCH_OWN: 'search:own',
  SEARCH_SHARED: 'search:shared'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.EDITOR]: [
    // User
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE, // Own profile only
    
    // Files
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_READ,
    PERMISSIONS.FILE_UPDATE,
    PERMISSIONS.FILE_DELETE,
    PERMISSIONS.FILE_SHARE,
    PERMISSIONS.FILE_DOWNLOAD,
    
    // Folders
    PERMISSIONS.FOLDER_CREATE,
    PERMISSIONS.FOLDER_READ,
    PERMISSIONS.FOLDER_UPDATE,
    PERMISSIONS.FOLDER_DELETE,
    PERMISSIONS.FOLDER_SHARE,
    
    // Collaboration
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_READ,
    PERMISSIONS.COMMENT_UPDATE, // Own comments only
    PERMISSIONS.COMMENT_DELETE, // Own comments only
    
    // Search
    PERMISSIONS.SEARCH_ALL,
    PERMISSIONS.SEARCH_OWN,
    PERMISSIONS.SEARCH_SHARED
  ],
  
  [ROLES.VIEWER]: [
    // User
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE, // Own profile only
    
    // Files
    PERMISSIONS.FILE_READ,
    PERMISSIONS.FILE_DOWNLOAD,
    
    // Folders
    PERMISSIONS.FOLDER_READ,
    
    // Collaboration
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_READ,
    PERMISSIONS.COMMENT_UPDATE, // Own comments only
    
    // Search
    PERMISSIONS.SEARCH_OWN,
    PERMISSIONS.SEARCH_SHARED
  ]
};

/**
 * Check if a role has a specific permission
 */
function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false;
  }
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
function hasAnyPermission(role, permissions) {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
function hasAllPermissions(role, permissions) {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is valid
 */
function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
function getRoleLevel(role) {
  const levels = {
    [ROLES.ADMIN]: 3,
    [ROLES.EDITOR]: 2,
    [ROLES.VIEWER]: 1
  };
  return levels[role] || 0;
}

/**
 * Check if role1 has higher or equal level than role2
 */
function hasHigherOrEqualRole(role1, role2) {
  return getRoleLevel(role1) >= getRoleLevel(role2);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isValidRole,
  getRoleLevel,
  hasHigherOrEqualRole
};
