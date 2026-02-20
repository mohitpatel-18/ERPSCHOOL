const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { checkPermission } = require('../middleware/checkPermission');

/**
 * Advanced Permission Routes
 * Industry-level permission management endpoints
 */

// ==================== PERMISSION CRUD ====================

// Get all permissions with filtering
router.get(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'list'),
  permissionController.getAllPermissions
);

// Get permission matrix for role
router.get(
  '/matrix/:role',
  protect,
  authorize('admin', 'super_admin'),
  permissionController.getPermissionMatrix
);

// Get permissions by role
router.get(
  '/role/:role',
  protect,
  authorize('admin', 'super_admin'),
  permissionController.getPermissionsByRole
);

// Get single permission
router.get(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'read'),
  permissionController.getPermission
);

// Create new permission
router.post(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'create'),
  permissionController.createPermission
);

// Update permission
router.put(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'update'),
  permissionController.updatePermission
);

// Delete permission
router.delete(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'delete'),
  permissionController.deletePermission
);

// ==================== BULK OPERATIONS ====================

// Bulk update permissions
router.post(
  '/bulk-update',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'update'),
  permissionController.bulkUpdatePermissions
);

// Bulk create permissions
router.post(
  '/bulk-create',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'create'),
  permissionController.bulkCreatePermissions
);

// Clone permissions from one role to another
router.post(
  '/clone',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'create'),
  permissionController.clonePermissions
);

// ==================== PERMISSION CHECKS ====================

// Check single permission (for frontend)
router.post(
  '/check',
  protect,
  permissionController.checkPermission
);

// Batch check permissions
router.post(
  '/batch-check',
  protect,
  permissionController.batchCheckPermissions
);

// Check field-level permission
router.post(
  '/check-field',
  protect,
  permissionController.checkFieldPermission
);

// ==================== ANALYTICS & REPORTING ====================

// Get permission statistics
router.get(
  '/analytics/stats',
  protect,
  authorize('admin', 'super_admin'),
  permissionController.getPermissionStats
);

// Get permission conflicts
router.get(
  '/analytics/conflicts',
  protect,
  authorize('admin', 'super_admin'),
  permissionController.getPermissionConflicts
);

// Compare permissions between roles
router.post(
  '/analytics/compare',
  protect,
  authorize('admin', 'super_admin'),
  permissionController.comparePermissions
);

// ==================== IMPORT/EXPORT ====================

// Export permissions
router.get(
  '/export',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'export'),
  permissionController.exportPermissions
);

// Import permissions
router.post(
  '/import',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('permissions', 'import'),
  permissionController.importPermissions
);

module.exports = router;
