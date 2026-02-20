/**
 * Permission Helper Utilities
 * Industry-level helper functions for permission management
 */

/**
 * Permission action types
 */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  EXPORT: 'export',
  IMPORT: 'import',
  PRINT: 'print',
  APPROVE: 'approve',
  REJECT: 'reject',
  PUBLISH: 'publish',
  ARCHIVE: 'archive'
};

/**
 * Permission scopes
 */
export const SCOPES = {
  GLOBAL: 'global',
  ORGANIZATION: 'organization',
  DEPARTMENT: 'department',
  CLASS: 'class',
  SELF: 'self'
};

/**
 * Role categories
 */
export const ROLE_CATEGORIES = {
  ADMINISTRATIVE: 'administrative',
  ACADEMIC: 'academic',
  SUPPORT: 'support',
  STUDENT: 'student',
  PARENT: 'parent',
  OTHER: 'other'
};

/**
 * Check if action is a read-only action
 */
export const isReadOnlyAction = (action) => {
  return ['read', 'list', 'export', 'print'].includes(action);
};

/**
 * Check if action is a write action
 */
export const isWriteAction = (action) => {
  return ['create', 'update', 'delete', 'import'].includes(action);
};

/**
 * Get action color for UI
 */
export const getActionColor = (action) => {
  const colors = {
    create: 'green',
    read: 'blue',
    update: 'yellow',
    delete: 'red',
    list: 'indigo',
    export: 'purple',
    import: 'pink',
    print: 'gray',
    approve: 'teal',
    reject: 'orange',
    publish: 'cyan',
    archive: 'slate'
  };
  return colors[action] || 'gray';
};

/**
 * Get scope priority (higher number = more permissive)
 */
export const getScopePriority = (scope) => {
  const priorities = {
    global: 5,
    organization: 4,
    department: 3,
    class: 2,
    self: 1
  };
  return priorities[scope] || 0;
};

/**
 * Compare two scopes
 */
export const isScopeMorePermissive = (scope1, scope2) => {
  return getScopePriority(scope1) > getScopePriority(scope2);
};

/**
 * Format permission for display
 */
export const formatPermission = (permission) => {
  return {
    ...permission,
    displayName: permission.module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    actionCount: Object.values(permission.actions || {}).filter(Boolean).length,
    isActive: permission.status === 'active'
  };
};

/**
 * Group permissions by module
 */
export const groupPermissionsByModule = (permissions) => {
  return permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});
};

/**
 * Group permissions by role
 */
export const groupPermissionsByRole = (permissions) => {
  return permissions.reduce((acc, perm) => {
    if (!acc[perm.role]) {
      acc[perm.role] = [];
    }
    acc[perm.role].push(perm);
    return acc;
  }, {});
};

/**
 * Calculate permission coverage (percentage of allowed actions)
 */
export const calculatePermissionCoverage = (permission) => {
  const actions = permission.actions || {};
  const totalActions = Object.keys(actions).length;
  const allowedActions = Object.values(actions).filter(Boolean).length;
  
  if (totalActions === 0) return 0;
  return Math.round((allowedActions / totalActions) * 100);
};

/**
 * Get permission summary for a role
 */
export const getPermissionSummary = (permissions) => {
  const total = permissions.length;
  const modules = new Set(permissions.map(p => p.module)).size;
  const activePerms = permissions.filter(p => p.status === 'active').length;
  
  const actionStats = {};
  permissions.forEach(perm => {
    Object.entries(perm.actions || {}).forEach(([action, allowed]) => {
      if (!actionStats[action]) {
        actionStats[action] = { total: 0, allowed: 0 };
      }
      actionStats[action].total++;
      if (allowed) actionStats[action].allowed++;
    });
  });
  
  return {
    total,
    modules,
    active: activePerms,
    inactive: total - activePerms,
    actionStats,
    coverage: total > 0 ? Math.round((activePerms / total) * 100) : 0
  };
};

/**
 * Validate permission object
 */
export const validatePermission = (permission) => {
  const errors = [];
  
  if (!permission.role) {
    errors.push('Role is required');
  }
  
  if (!permission.module) {
    errors.push('Module is required');
  }
  
  if (!permission.actions || Object.keys(permission.actions).length === 0) {
    errors.push('At least one action must be defined');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge permissions (for inheritance)
 * More permissive permission wins
 */
export const mergePermissions = (perm1, perm2) => {
  const merged = { ...perm1 };
  
  // Merge actions (OR logic - if either allows, merged allows)
  if (perm2.actions) {
    merged.actions = { ...perm1.actions };
    Object.entries(perm2.actions).forEach(([action, allowed]) => {
      merged.actions[action] = merged.actions[action] || allowed;
    });
  }
  
  // Use more permissive scope
  if (perm2.scope && isScopeMorePermissive(perm2.scope, perm1.scope)) {
    merged.scope = perm2.scope;
  }
  
  return merged;
};

/**
 * Check if user can perform action based on conditions
 */
export const evaluateConditions = (permission, context) => {
  const conditions = permission.conditions || {};
  
  // Check own data only
  if (conditions.ownDataOnly && !context.isOwnData) {
    return false;
  }
  
  // Check assigned only
  if (conditions.assignedOnly && !context.isAssigned) {
    return false;
  }
  
  // Check department
  if (conditions.departmentOnly && context.userDepartment !== context.resourceDepartment) {
    return false;
  }
  
  // Check time restrictions
  if (conditions.timeRestrictions?.enabled) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const { allowedDays, startTime, endTime } = conditions.timeRestrictions;
    
    if (allowedDays?.length > 0 && !allowedDays.includes(currentDay)) {
      return false;
    }
    
    if (startTime && endTime && (currentTime < startTime || currentTime > endTime)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Generate permission matrix for visualization
 */
export const generatePermissionMatrix = (permissions, roles, modules) => {
  const matrix = {};
  
  roles.forEach(role => {
    matrix[role] = {};
    modules.forEach(module => {
      const perm = permissions.find(p => p.role === role && p.module === module);
      matrix[role][module] = perm ? perm.actions : {};
    });
  });
  
  return matrix;
};

/**
 * Export utilities
 */
export default {
  ACTIONS,
  SCOPES,
  ROLE_CATEGORIES,
  isReadOnlyAction,
  isWriteAction,
  getActionColor,
  getScopePriority,
  isScopeMorePermissive,
  formatPermission,
  groupPermissionsByModule,
  groupPermissionsByRole,
  calculatePermissionCoverage,
  getPermissionSummary,
  validatePermission,
  mergePermissions,
  evaluateConditions,
  generatePermissionMatrix
};
