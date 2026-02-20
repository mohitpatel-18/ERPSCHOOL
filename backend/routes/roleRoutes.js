const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { checkPermission, checkCanDelegate } = require('../middleware/checkPermission');

/**
 * Advanced Role Routes
 * Industry-level role management endpoints
 */

// ==================== ROLE CRUD ====================

// Get all roles
router.get(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('roles', 'list'),
  roleController.getAllRoles
);

// Get role hierarchy
router.get(
  '/hierarchy',
  protect,
  authorize('admin', 'super_admin'),
  roleController.getRoleHierarchy
);

// Get roles by category
router.get(
  '/category/:category',
  protect,
  authorize('admin', 'super_admin'),
  roleController.getRolesByCategory
);

// Get single role
router.get(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('roles', 'read'),
  roleController.getRole
);

// Create new role
router.post(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('roles', 'create'),
  roleController.createRole
);

// Create role from template
router.post(
  '/from-template',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('roles', 'create'),
  roleController.createFromTemplate
);

// Update role
router.put(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('roles', 'update'),
  roleController.updateRole
);

// Delete role
router.delete(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('roles', 'delete'),
  roleController.deleteRole
);

// ==================== ROLE PERMISSIONS ====================

// Get all permissions for role
router.get(
  '/:id/permissions',
  protect,
  authorize('admin', 'super_admin'),
  roleController.getRolePermissions
);

// Get effective permissions for role
router.get(
  '/:id/effective-permissions',
  protect,
  authorize('admin', 'super_admin'),
  roleController.getEffectivePermissions
);

// Assign permission to role
router.post(
  '/:id/permissions',
  protect,
  authorize('admin', 'super_admin'),
  checkCanDelegate,
  roleController.assignPermission
);

// Remove permission from role
router.delete(
  '/:id/permissions/:permissionId',
  protect,
  authorize('admin', 'super_admin'),
  checkCanDelegate,
  roleController.removePermission
);

module.exports = router;
