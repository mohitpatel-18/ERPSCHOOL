const Permission = require('../models/Permission');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Advanced Permission Controller
 * Industry-level permission management with comprehensive features
 */

/* ==================== PERMISSION CRUD ==================== */

/**
 * @desc    Get all permissions with filtering and pagination
 * @route   GET /api/permissions
 * @access  Private (Admin)
 */
exports.getAllPermissions = asyncHandler(async (req, res) => {
  const { role, module, status, scope, page = 1, limit = 50 } = req.query;
  
  // Build filter query
  const filter = {};
  if (role) filter.role = role;
  if (module) filter.module = module;
  if (status) filter.status = status;
  if (scope) filter.scope = scope;
  
  // Pagination
  const skip = (page - 1) * limit;
  
  const [permissions, total] = await Promise.all([
    Permission.find(filter)
      .sort({ role: 1, priority: -1, module: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Permission.countDocuments(filter)
  ]);
  
  res.json(successResponse(permissions, 'Permissions retrieved successfully', {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

/**
 * @desc    Get permissions by role
 * @route   GET /api/permissions/role/:role
 * @access  Private
 */
exports.getPermissionsByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { includeInherited = false } = req.query;
  
  let permissions;
  
  if (includeInherited === 'true') {
    // Get role and check for inheritance
    const roleDoc = await Role.findOne({ name: role });
    if (roleDoc && roleDoc.inheritPermissions) {
      permissions = await Role.getAllPermissions(roleDoc._id);
    } else {
      permissions = await Permission.getRolePermissions(role);
    }
  } else {
    permissions = await Permission.getRolePermissions(role);
  }
  
  res.json(successResponse(permissions, `Permissions for ${role} retrieved successfully`));
});

/**
 * @desc    Get permission matrix for role
 * @route   GET /api/permissions/matrix/:role
 * @access  Private
 */
exports.getPermissionMatrix = asyncHandler(async (req, res) => {
  const { role } = req.params;
  
  const matrix = await Permission.getPermissionMatrix(role);
  
  res.json(successResponse(matrix, 'Permission matrix retrieved successfully'));
});

/**
 * @desc    Get single permission by ID
 * @route   GET /api/permissions/:id
 * @access  Private (Admin)
 */
exports.getPermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  
  if (!permission) {
    return res.status(404).json(errorResponse('Permission not found'));
  }
  
  res.json(successResponse(permission, 'Permission retrieved successfully'));
});

/**
 * @desc    Create new permission
 * @route   POST /api/permissions
 * @access  Private (Admin)
 */
exports.createPermission = asyncHandler(async (req, res) => {
  const { role, module, actions, conditions, scope, fieldPermissions, resourceLimits, description } = req.body;
  
  // Check if permission already exists
  const existingPermission = await Permission.findOne({ role, module });
  if (existingPermission) {
    return res.status(400).json(errorResponse('Permission already exists for this role and module'));
  }
  
  const permission = await Permission.create({
    role,
    module,
    actions,
    conditions,
    scope,
    fieldPermissions: fieldPermissions ? new Map(Object.entries(fieldPermissions)) : new Map(),
    resourceLimits,
    description,
    createdBy: req.user._id,
    status: 'active'
  });
  
  // Log activity
  await AuditLog.create({
    action: 'CREATE_PERMISSION',
    module: 'permissions',
    performedBy: req.user._id,
    targetModel: 'Permission',
    targetId: permission._id,
    changes: { role, module, actions },
    ipAddress: req.ip,
    timestamp: new Date()
  });
  
  res.status(201).json(successResponse(permission, 'Permission created successfully'));
});

/**
 * @desc    Update permission
 * @route   PUT /api/permissions/:id
 * @access  Private (Admin)
 */
exports.updatePermission = asyncHandler(async (req, res) => {
  let permission = await Permission.findById(req.params.id);
  
  if (!permission) {
    return res.status(404).json(errorResponse('Permission not found'));
  }
  
  const oldData = { ...permission.toObject() };
  
  const { actions, conditions, scope, fieldPermissions, resourceLimits, status, description } = req.body;
  
  // Update fields
  if (actions) permission.actions = actions;
  if (conditions) permission.conditions = conditions;
  if (scope) permission.scope = scope;
  if (fieldPermissions) permission.fieldPermissions = new Map(Object.entries(fieldPermissions));
  if (resourceLimits) permission.resourceLimits = resourceLimits;
  if (status) permission.status = status;
  if (description !== undefined) permission.description = description;
  
  permission.updatedBy = req.user._id;
  permission.lastModified = {
    action: 'update',
    by: req.user._id,
    timestamp: new Date(),
    changes: { old: oldData, new: req.body }
  };
  
  await permission.save();
  
  res.json(successResponse(permission, 'Permission updated successfully'));
});

/**
 * @desc    Delete permission
 * @route   DELETE /api/permissions/:id
 * @access  Private (Admin)
 */
exports.deletePermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  
  if (!permission) {
    return res.status(404).json(errorResponse('Permission not found'));
  }
  
  // Log before deletion
  await AuditLog.create({
    action: 'DELETE_PERMISSION',
    module: 'permissions',
    performedBy: req.user._id,
    targetModel: 'Permission',
    targetId: permission._id,
    changes: { role: permission.role, module: permission.module },
    ipAddress: req.ip,
    timestamp: new Date()
  });
  
  await permission.deleteOne();
  
  res.json(successResponse(null, 'Permission deleted successfully'));
});

/* ==================== BULK OPERATIONS ==================== */

/**
 * @desc    Bulk update permissions
 * @route   POST /api/permissions/bulk-update
 * @access  Private (Admin)
 */
exports.bulkUpdatePermissions = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json(errorResponse('Updates array is required'));
  }
  
  const results = await Permission.bulkUpdatePermissions(updates, req.user._id);
  
  // Log bulk update
  await AuditLog.create({
    action: 'BULK_UPDATE_PERMISSIONS',
    module: 'permissions',
    performedBy: req.user._id,
    changes: { count: updates.length, updates },
    ipAddress: req.ip,
    timestamp: new Date()
  });
  
  res.json(successResponse(results, `${results.length} permissions updated successfully`));
});

/**
 * @desc    Bulk create permissions for role
 * @route   POST /api/permissions/bulk-create
 * @access  Private (Admin)
 */
exports.bulkCreatePermissions = asyncHandler(async (req, res) => {
  const { role, permissions } = req.body;
  
  if (!role || !Array.isArray(permissions)) {
    return res.status(400).json(errorResponse('Role and permissions array are required'));
  }
  
  const permissionDocs = permissions.map(perm => ({
    role,
    module: perm.module,
    actions: perm.actions || {},
    conditions: perm.conditions || {},
    scope: perm.scope || 'self',
    fieldPermissions: perm.fieldPermissions ? new Map(Object.entries(perm.fieldPermissions)) : new Map(),
    resourceLimits: perm.resourceLimits || {},
    description: perm.description,
    createdBy: req.user._id,
    status: 'active'
  }));
  
  const created = await Permission.insertMany(permissionDocs, { ordered: false });
  
  res.status(201).json(successResponse(created, `${created.length} permissions created successfully`));
});

/**
 * @desc    Clone permissions from one role to another
 * @route   POST /api/permissions/clone
 * @access  Private (Admin)
 */
exports.clonePermissions = asyncHandler(async (req, res) => {
  const { fromRole, toRole } = req.body;
  
  if (!fromRole || !toRole) {
    return res.status(400).json(errorResponse('Source and target roles are required'));
  }
  
  if (fromRole === toRole) {
    return res.status(400).json(errorResponse('Source and target roles cannot be the same'));
  }
  
  const clonedPermissions = await Permission.cloneRolePermissions(fromRole, toRole, req.user._id);
  
  // Log cloning
  await AuditLog.create({
    action: 'CLONE_PERMISSIONS',
    module: 'permissions',
    performedBy: req.user._id,
    changes: { fromRole, toRole, count: clonedPermissions.length },
    ipAddress: req.ip,
    timestamp: new Date()
  });
  
  res.json(successResponse(clonedPermissions, `Permissions cloned from ${fromRole} to ${toRole} successfully`));
});

/* ==================== PERMISSION CHECKS ==================== */

/**
 * @desc    Check if user has specific permission
 * @route   POST /api/permissions/check
 * @access  Private
 */
exports.checkPermission = asyncHandler(async (req, res) => {
  const { module, action, context = {} } = req.body;
  
  const hasPermission = await Permission.hasPermission(
    req.user.role, 
    module, 
    action,
    {
      ...context,
      ipAddress: req.ip
    }
  );
  
  res.json(successResponse({ hasPermission, module, action }, 'Permission check completed'));
});

/**
 * @desc    Batch check permissions
 * @route   POST /api/permissions/batch-check
 * @access  Private
 */
exports.batchCheckPermissions = asyncHandler(async (req, res) => {
  const { checks } = req.body;
  
  if (!Array.isArray(checks)) {
    return res.status(400).json(errorResponse('Checks array is required'));
  }
  
  const results = await Promise.all(
    checks.map(async ({ module, action, context = {} }) => ({
      module,
      action,
      hasPermission: await Permission.hasPermission(
        req.user.role,
        module,
        action,
        { ...context, ipAddress: req.ip }
      )
    }))
  );
  
  res.json(successResponse(results, 'Batch permission check completed'));
});

/**
 * @desc    Check field-level permission
 * @route   POST /api/permissions/check-field
 * @access  Private
 */
exports.checkFieldPermission = asyncHandler(async (req, res) => {
  const { module, field, accessType = 'read' } = req.body;
  
  const canAccess = await Permission.canAccessField(
    req.user.role,
    module,
    field,
    accessType
  );
  
  res.json(successResponse({ canAccess, module, field, accessType }, 'Field permission check completed'));
});

/* ==================== ANALYTICS & REPORTING ==================== */

/**
 * @desc    Get permission statistics
 * @route   GET /api/permissions/stats
 * @access  Private (Admin)
 */
exports.getPermissionStats = asyncHandler(async (req, res) => {
  const stats = await Permission.aggregate([
    {
      $facet: {
        byRole: [
          { $group: { _id: '$role', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byModule: [
          { $group: { _id: '$module', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byScope: [
          { $group: { _id: '$scope', count: { $sum: 1 } } }
        ],
        total: [
          { $count: 'count' }
        ]
      }
    }
  ]);
  
  res.json(successResponse(stats[0], 'Permission statistics retrieved successfully'));
});

/**
 * @desc    Get permission conflicts
 * @route   GET /api/permissions/conflicts
 * @access  Private (Admin)
 */
exports.getPermissionConflicts = asyncHandler(async (req, res) => {
  const conflicts = await Permission.getConflicts();
  
  res.json(successResponse(conflicts, 'Permission conflicts retrieved successfully'));
});

/**
 * @desc    Compare permissions between roles
 * @route   POST /api/permissions/compare
 * @access  Private (Admin)
 */
exports.comparePermissions = asyncHandler(async (req, res) => {
  const { role1, role2 } = req.body;
  
  if (!role1 || !role2) {
    return res.status(400).json(errorResponse('Two roles are required for comparison'));
  }
  
  const [perms1, perms2] = await Promise.all([
    Permission.getPermissionMatrix(role1),
    Permission.getPermissionMatrix(role2)
  ]);
  
  const comparison = {
    role1: { name: role1, permissions: perms1 },
    role2: { name: role2, permissions: perms2 },
    differences: {}
  };
  
  // Find differences
  const allModules = new Set([...Object.keys(perms1), ...Object.keys(perms2)]);
  
  allModules.forEach(module => {
    const perm1 = perms1[module];
    const perm2 = perms2[module];
    
    if (!perm1 || !perm2) {
      comparison.differences[module] = {
        inRole1: !!perm1,
        inRole2: !!perm2,
        type: 'missing'
      };
    } else {
      const actionDiffs = {};
      const allActions = new Set([
        ...Object.keys(perm1.actions),
        ...Object.keys(perm2.actions)
      ]);
      
      allActions.forEach(action => {
        if (perm1.actions[action] !== perm2.actions[action]) {
          actionDiffs[action] = {
            role1: perm1.actions[action],
            role2: perm2.actions[action]
          };
        }
      });
      
      if (Object.keys(actionDiffs).length > 0) {
        comparison.differences[module] = {
          type: 'action_mismatch',
          actions: actionDiffs
        };
      }
    }
  });
  
  res.json(successResponse(comparison, 'Permission comparison completed'));
});

/**
 * @desc    Export permissions to JSON
 * @route   GET /api/permissions/export
 * @access  Private (Admin)
 */
exports.exportPermissions = asyncHandler(async (req, res) => {
  const { role, format = 'json' } = req.query;
  
  const filter = role ? { role } : {};
  const permissions = await Permission.find(filter).lean();
  
  if (format === 'json') {
    res.json(successResponse(permissions, 'Permissions exported successfully'));
  } else if (format === 'csv') {
    // Convert to CSV format
    const csvData = permissions.map(perm => ({
      role: perm.role,
      module: perm.module,
      create: perm.actions.create,
      read: perm.actions.read,
      update: perm.actions.update,
      delete: perm.actions.delete,
      scope: perm.scope,
      status: perm.status
    }));
    
    res.json(successResponse(csvData, 'Permissions exported as CSV'));
  }
});

/**
 * @desc    Import permissions from JSON
 * @route   POST /api/permissions/import
 * @access  Private (Admin)
 */
exports.importPermissions = asyncHandler(async (req, res) => {
  const { permissions, mode = 'merge' } = req.body;
  
  if (!Array.isArray(permissions)) {
    return res.status(400).json(errorResponse('Permissions array is required'));
  }
  
  let imported = 0;
  let updated = 0;
  let errors = [];
  
  for (const perm of permissions) {
    try {
      if (mode === 'merge') {
        const existing = await Permission.findOne({ role: perm.role, module: perm.module });
        
        if (existing) {
          existing.actions = perm.actions;
          existing.conditions = perm.conditions;
          existing.scope = perm.scope;
          existing.updatedBy = req.user._id;
          await existing.save();
          updated++;
        } else {
          await Permission.create({
            ...perm,
            createdBy: req.user._id
          });
          imported++;
        }
      } else if (mode === 'replace') {
        await Permission.findOneAndUpdate(
          { role: perm.role, module: perm.module },
          { ...perm, updatedBy: req.user._id },
          { upsert: true }
        );
        imported++;
      }
    } catch (error) {
      errors.push({ permission: perm, error: error.message });
    }
  }
  
  res.json(successResponse(
    { imported, updated, errors },
    `Import completed: ${imported} imported, ${updated} updated, ${errors.length} errors`
  ));
});

module.exports = exports;
