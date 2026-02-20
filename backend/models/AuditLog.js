/**
 * AuditLog Model
 * Tracks all important system activities for security and compliance
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // User role at the time of action
  userRole: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true
  },

  // What action was performed
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
      'PASSWORD_CHANGE', 'PASSWORD_RESET',
      'PERMISSION_CHANGE', 'STATUS_CHANGE',
      'EXPORT', 'IMPORT', 'BULK_OPERATION'
    ],
    index: true
  },

  // What entity was affected
  entity: {
    type: String,
    required: true,
    enum: [
      'User', 'Student', 'Teacher', 'Class',
      'Attendance', 'Fee', 'Payment', 'Grade',
      'Announcement', 'Leave', 'AcademicYear'
    ],
    index: true
  },

  // ID of the affected entity (if applicable)
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  // Description of the action
  description: {
    type: String,
    required: true
  },

  // Request details
  requestDetails: {
    method: String,
    url: String,
    ip: String,
    userAgent: String
  },

  // Changes made (for UPDATE operations)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Result of the action
  status: {
    type: String,
    enum: ['success', 'failure', 'partial'],
    default: 'success',
    index: true
  },

  // Error details (if action failed)
  error: {
    message: String,
    stack: String
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index - automatically delete logs older than 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Static method to log activity
auditLogSchema.statics.log = async function(logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging should never break the main flow
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const { limit = 50, skip = 0, startDate, endDate } = options;
  
  const query = { user: userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'username email role');
};

// Static method to get entity history
auditLogSchema.statics.getEntityHistory = async function(entity, entityId) {
  return await this.find({ entity, entityId })
    .sort({ timestamp: -1 })
    .populate('user', 'username email role');
};

// Static method to get activity summary
auditLogSchema.statics.getActivitySummary = async function(filters = {}) {
  const { startDate, endDate, userRole, entity } = filters;
  
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = new Date(startDate);
    if (endDate) matchStage.timestamp.$lte = new Date(endDate);
  }
  
  if (userRole) matchStage.userRole = userRole;
  if (entity) matchStage.entity = entity;
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          action: '$action',
          entity: '$entity'
        },
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        action: '$_id.action',
        entity: '$_id.entity',
        count: 1,
        successCount: 1,
        failureCount: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successCount', '$count'] },
            100
          ]
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
