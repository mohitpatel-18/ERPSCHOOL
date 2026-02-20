const Permission = require('../models/Permission');
const Role = require('../models/Role');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Advanced Permission Middleware
 * Industry-level permission checking with context-aware validation
 */

/**
 * Check if user has permission for specific action with context
 * Usage: checkPermission('students', 'create', { contextBuilder: (req) => ({...}) })
 */
const checkPermission = (module, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      // Super admin always has full access
      if (userRole === 'super_admin') {
        return next();
      }
      
      // Build context for attribute-based checks
      const context = {
        ipAddress: req.ip,
        userId: req.user._id,
        userRole: req.user.role,
        userDepartment: req.user.department,
        ...(options.contextBuilder ? options.contextBuilder(req) : {})
      };
      
      // Check permission with context
      const hasPermission = await Permission.hasPermission(userRole, module, action, context);
      
      if (!hasPermission) {
        return res.status(403).json(errorResponse(
          `Access Denied: You don't have permission to ${action} ${module}`,
          'PERMISSION_DENIED',
          { module, action, role: userRole }
        ));
      }
      
      // Additional custom validation
      if (options.customValidator) {
        const customCheck = await options.customValidator(req, res);
        if (!customCheck) {
          return res.status(403).json(errorResponse(
            'Access denied by custom validation',
            'CUSTOM_VALIDATION_FAILED'
          ));
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check multiple permissions (OR logic - user needs at least one)
 * Usage: checkAnyPermission([['students', 'read'], ['teachers', 'read']])
 */
const checkAnyPermission = (permissionPairs) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (userRole === 'super_admin') {
        return next();
      }
      
      const context = { ipAddress: req.ip, userId: req.user._id };
      
      // Check if user has any of the required permissions
      const checks = await Promise.all(
        permissionPairs.map(([module, action]) =>
          Permission.hasPermission(userRole, module, action, context)
        )
      );
      
      const hasAnyPermission = checks.some(result => result === true);
      
      if (!hasAnyPermission) {
        return res.status(403).json(errorResponse(
          'Access Denied: You don\'t have any of the required permissions',
          'PERMISSION_DENIED'
        ));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check multiple permissions (AND logic - user needs all)
 * Usage: checkAllPermissions([['students', 'read'], ['students', 'update']])
 */
const checkAllPermissions = (permissionPairs) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (userRole === 'super_admin') {
        return next();
      }
      
      const context = { ipAddress: req.ip, userId: req.user._id };
      
      // Check if user has all required permissions
      const checks = await Promise.all(
        permissionPairs.map(([module, action]) =>
          Permission.hasPermission(userRole, module, action, context)
        )
      );
      
      const hasAllPermissions = checks.every(result => result === true);
      
      if (!hasAllPermissions) {
        return res.status(403).json(errorResponse(
          'Access Denied: You don\'t have all required permissions',
          'PERMISSION_DENIED'
        ));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check ownership or permission
 * Allows access if user owns the resource OR has the permission
 * Usage: checkOwnershipOrPermission('students', 'update', { ownerField: 'userId' })
 */
const checkOwnershipOrPermission = (module, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (userRole === 'super_admin') {
        return next();
      }
      
      // Check ownership
      const ownerField = options.ownerField || 'userId';
      const resourceId = req.params.id;
      
      let isOwner = false;
      if (options.ownershipChecker) {
        isOwner = await options.ownershipChecker(req.user._id, resourceId, req);
      } else if (req.body && req.body[ownerField]) {
        isOwner = req.body[ownerField].toString() === req.user._id.toString();
      }
      
      if (isOwner) {
        return next();
      }
      
      // If not owner, check permission
      const context = { ipAddress: req.ip, userId: req.user._id, isOwnData: false };
      const hasPermission = await Permission.hasPermission(userRole, module, action, context);
      
      if (!hasPermission) {
        return res.status(403).json(errorResponse(
          'Access Denied: You can only access your own data or need additional permissions',
          'PERMISSION_DENIED'
        ));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check field-level permissions
 * Filters response fields based on user's field-level permissions
 */
const filterFieldsByPermission = (module) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (userRole === 'super_admin') {
        return next();
      }
      
      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to filter fields
      res.json = async function(data) {
        if (data && data.success && data.data) {
          const permission = await Permission.findOne({ 
            role: userRole, 
            module, 
            status: 'active' 
          });
          
          if (permission && permission.fieldPermissions && permission.fieldPermissions.size > 0) {
            const filterObject = (obj) => {
              const filtered = { ...obj };
              permission.fieldPermissions.forEach((perm, field) => {
                if (!perm.read && filtered[field] !== undefined) {
                  delete filtered[field];
                }
              });
              return filtered;
            };
            
            if (Array.isArray(data.data)) {
              data.data = data.data.map(filterObject);
            } else {
              data.data = filterObject(data.data);
            }
          }
        }
        
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Rate limiting based on permission limits
 */
const checkRateLimit = (module, action) => {
  const requestCounts = new Map(); // In production, use Redis
  
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (userRole === 'super_admin') {
        return next();
      }
      
      const permission = await Permission.findOne({ 
        role: userRole, 
        module, 
        status: 'active' 
      });
      
      if (!permission || !permission.resourceLimits?.rateLimit?.requests) {
        return next();
      }
      
      const { requests, duration } = permission.resourceLimits.rateLimit;
      const key = `${req.user._id}-${module}-${action}`;
      const now = Date.now();
      
      if (!requestCounts.has(key)) {
        requestCounts.set(key, { count: 1, startTime: now });
        return next();
      }
      
      const userData = requestCounts.get(key);
      const timeElapsed = (now - userData.startTime) / 1000; // seconds
      
      if (timeElapsed > duration) {
        // Reset counter
        requestCounts.set(key, { count: 1, startTime: now });
        return next();
      }
      
      if (userData.count >= requests) {
        return res.status(429).json(errorResponse(
          `Rate limit exceeded. Maximum ${requests} requests per ${duration} seconds`,
          'RATE_LIMIT_EXCEEDED'
        ));
      }
      
      userData.count++;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Attach user permissions to request
 * Adds full permission matrix to req.userPermissions
 */
const attachPermissions = async (req, res, next) => {
  try {
    if (req.user) {
      const role = await Role.findOne({ name: req.user.role });
      
      if (role) {
        // Get effective permissions (including inherited)
        const effectivePerms = await Role.getEffectivePermissions(role._id);
        req.userPermissions = effectivePerms;
        req.userRole = role;
      } else {
        // Fallback to direct permission lookup
        const permissions = await Permission.getRolePermissions(req.user.role);
        req.userPermissions = permissions;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can delegate permissions
 */
const checkCanDelegate = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    if (userRole === 'super_admin') {
      return next();
    }
    
    const role = await Role.findOne({ name: userRole });
    
    if (!role || !role.restrictions?.canModifyRoles) {
      return res.status(403).json(errorResponse(
        'Access Denied: You cannot delegate permissions',
        'DELEGATION_NOT_ALLOWED'
      ));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Scope-based access control
 * Limits data access based on permission scope
 */
const applyScopeFilter = (module) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (userRole === 'super_admin') {
        return next();
      }
      
      const permission = await Permission.findOne({ 
        role: userRole, 
        module, 
        status: 'active' 
      });
      
      if (!permission) {
        return next();
      }
      
      // Apply scope-based filters to query
      switch (permission.scope) {
        case 'self':
          req.scopeFilter = { userId: req.user._id };
          break;
        case 'class':
          if (req.user.assignedClass) {
            req.scopeFilter = { class: req.user.assignedClass };
          }
          break;
        case 'department':
          if (req.user.department) {
            req.scopeFilter = { department: req.user.department };
          }
          break;
        case 'organization':
        case 'global':
          req.scopeFilter = {};
          break;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkOwnershipOrPermission,
  filterFieldsByPermission,
  checkRateLimit,
  attachPermissions,
  checkCanDelegate,
  applyScopeFilter
};
