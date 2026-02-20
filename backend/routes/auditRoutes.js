/**
 * Audit Log Routes
 * View audit logs (admin only)
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const AuditLog = require('../models/AuditLog');
const { formatPaginationResponse } = require('../middleware/pagination');

/**
 * @route   GET /api/audit
 * @desc    Get all audit logs (admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = req.pagination;
    
    // Build filter query
    const filter = {};
    
    if (req.query.user) filter.user = req.query.user;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.userRole) filter.userRole = req.query.userRole;
    if (req.query.status) filter.status = req.query.status;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) filter.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.timestamp.$lte = new Date(req.query.endDate);
    }
    
    const logs = await AuditLog.find(filter)
      .populate('user', 'username email role')
      .sort(sort)
      .limit(limit)
      .skip(skip);
    
    const total = await AuditLog.countDocuments(filter);
    
    res.json({
      success: true,
      ...formatPaginationResponse(logs, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/audit/user/:userId
 * @desc    Get audit logs for specific user
 * @access  Private/Admin
 */
router.get('/user/:userId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    
    const logs = await AuditLog.getUserActivity(req.params.userId, {
      limit,
      skip: (page - 1) * limit,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/audit/entity/:entity/:entityId
 * @desc    Get audit history for specific entity
 * @access  Private/Admin
 */
router.get('/entity/:entity/:entityId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.getEntityHistory(req.params.entity, req.params.entityId);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/audit/summary
 * @desc    Get audit activity summary
 * @access  Private/Admin
 */
router.get('/summary', protect, authorize('admin'), async (req, res, next) => {
  try {
    const summary = await AuditLog.getActivitySummary({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userRole: req.query.userRole,
      entity: req.query.entity
    });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
