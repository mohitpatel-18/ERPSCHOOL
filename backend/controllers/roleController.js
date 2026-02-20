const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Advanced Role Controller
 * Industry-level role management with hierarchy support
 */

/* ==================== ROLE CRUD ==================== */

/**
 * @desc    Get all roles
 * @route   GET /api/roles
 * @access  Private (Admin)
 */
exports.getAllRoles = asyncHandler(async (req, res) => {
  const { type, category, status, page = 1, limit = 50 } = req.query;
  
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;
  
  const skip = (page - 1) * limit;
  
  const [roles, total] = await Promise.all([
    Role.find(filter)
      .populate('parentRole', 'name displayName')
      .sort({ level: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Role.countDocuments(filter)
  ]);
  
  res.json(successResponse(roles, 'Roles retrieved successfully', {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

/**
 * @desc    Get role by ID
 * @route   GET /api/roles/:id
 * @access  Private (Admin)
 */
exports.getRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id)
    .populate('parentRole', 'name displayName')
    .populate('permissions');
  
  if (!role) {
    return res.status(404).json(errorResponse('Role not found'));
  }
  
  res.json(successResponse(role, 'Role retrieved successfully'));
});

/**
 * @desc    Create new role
 * @route   POST /api/roles
 * @access  Private (Admin)
 */
exports.createRole = asyncHandler(async (req, res) => {
  const {
    name,
    displayName,
    description,
    category,
    level,
    parentRole,
    inheritPermissions,
    maxUsers,
    features,
    dashboardConfig,
    restrictions,
    color,
    icon
  } = req.body;
  
  // Check if role already exists
  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    return res.status(400).json(errorResponse('Role with this name already exists'));
  }
  
  const role = await Role.create({
    name,
    displayName,
    description,
    type: 'custom',
    category,
    level,
    parentRole: parentRole || null,
    inheritPermissions: inheritPermissions || false,
    maxUsers,
    features,
    dashboardConfig,
    restrictions,
    color,
    icon,
    createdBy: req.user._id,
    status: 'active'
  });
  
  // Log activity
  await AuditLog.create({
    action: 'CREATE_ROLE',
    module: 'roles',
    performedBy: req.user._id,
    targetModel: 'Role',
    targetId: role._id,
    changes: { name, displayName },
    ipAddress: req.ip,
    timestamp: new Date()
  });
  
  res.status(201).json(successResponse(role, 'Role created successfully'));
});

/**
 * @desc    Update role
 * @route   PUT /api/roles/:id
 * @access  Private (Admin)
 */
exports.updateRole = asyncHandler(async (req, res) => {
  let role = await Role.findById(req.params.id);
  
  if (!role) {
    return res.status(404).json(errorResponse('Role not found'));
  }
  
  if (role.type === 'system') {
    return res.status(403).json(errorResponse('Cannot modify system roles'));
  }
  
  const allowedFields = [
    'displayName', 'description', 'level', 'parentRole', 'inheritPermissions',
    'maxUsers', 'features', 'dashboardConfig', 'restrictions', 'status', 'color', 'icon'
  ];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      role[field] = req.body[field];
    }
  });
  
  role.updatedBy = req.user._id;
  role.lastModified = {
    action: 'update',
    by: req.user._id,
    timestamp: new Date(),
    changes: req.body
  };
  
  await role.save();
  
  res.json(successResponse(role, 'Role updated successfully'));
});

/**
 * @desc    Delete role
 * @route   DELETE /api/roles/:id
 * @access  Private (Admin)
 */
exports.deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return res.status(404).json(errorResponse('Role not found'));
  }
  
  const canDeleteResult = await Role.canDelete(req.params.id);
  
  if (!canDeleteResult.canDelete) {
    return res.status(400).json(errorResponse(canDeleteResult.reason));
  }
  
  await role.deleteOne();
  
  res.json(successResponse(null, 'Role deleted successfully'));
});

/* ==================== ROLE HIERARCHY ==================== */

/**
 * @desc    Get role hierarchy tree
 * @route   GET /api/roles/hierarchy
 * @access  Private (Admin)
 */
exports.getRoleHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await Role.getRoleHierarchy();
  res.json(successResponse(hierarchy, 'Role hierarchy retrieved successfully'));
});

/**
 * @desc    Get roles by category
 * @route   GET /api/roles/category/:category
 * @access  Private (Admin)
 */
exports.getRolesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const roles = await Role.getRolesByCategory(category);
  res.json(successResponse(roles, `Roles in ${category} category retrieved successfully`));
});

/* ==================== ROLE PERMISSIONS ==================== */

/**
 * @desc    Get all permissions for role (including inherited)
 * @route   GET /api/roles/:id/permissions
 * @access  Private (Admin)
 */
exports.getRolePermissions = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return res.status(404).json(errorResponse('Role not found'));
  }
  
  const permissions = await Role.getAllPermissions(req.params.id);
  
  res.json(successResponse(permissions, 'Role permissions retrieved successfully'));
});

/**
 * @desc    Get effective permissions for role
 * @route   GET /api/roles/:id/effective-permissions
 * @access  Private (Admin)
 */
exports.getEffectivePermissions = asyncHandler(async (req, res) => {
  const effectivePerms = await Role.getEffectivePermissions(req.params.id);
  res.json(successResponse(effectivePerms, 'Effective permissions retrieved successfully'));
});

/**
 * @desc    Assign permission to role
 * @route   POST /api/roles/:id/permissions
 * @access  Private (Admin)
 */
exports.assignPermission = asyncHandler(async (req, res) => {
  const { permissionId } = req.body;
  
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json(errorResponse('Role not found'));
  }
  
  await role.addPermission(permissionId);
  
  res.json(successResponse(role, 'Permission assigned to role successfully'));
});

/**
 * @desc    Remove permission from role
 * @route   DELETE /api/roles/:id/permissions/:permissionId
 * @access  Private (Admin)
 */
exports.removePermission = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json(errorResponse('Role not found'));
  }
  
  await role.removePermission(req.params.permissionId);
  
  res.json(successResponse(role, 'Permission removed from role successfully'));
});

/**
 * @desc    Create role from template
 * @route   POST /api/roles/from-template
 * @access  Private (Admin)
 */
exports.createFromTemplate = asyncHandler(async (req, res) => {
  const { templateName, customName } = req.body;
  
  const role = await Role.createFromTemplate(templateName, customName, req.user._id);
  
  res.status(201).json(successResponse(role, 'Role created from template successfully'));
});

module.exports = exports;
