/**
 * LeaveService - Business logic for leave management
 */

const BaseService = require('./BaseService');
const Leave = require('../models/Leave');

class LeaveService extends BaseService {
  constructor() {
    super(Leave);
  }

  /**
   * Apply for leave
   */
  async applyLeave(leaveData) {
    try {
      // Calculate total days
      const fromDate = new Date(leaveData.fromDate);
      const toDate = new Date(leaveData.toDate);
      const diffTime = Math.abs(toDate - fromDate);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return await this.create({
        ...leaveData,
        totalDays,
        status: 'Pending'
      });
    } catch (error) {
      throw this.handleError(error, 'applyLeave');
    }
  }

  /**
   * Get leaves with filters
   */
  async getLeaves(filters = {}, options = {}) {
    try {
      const { teacher, status, startDate, endDate, leaveType } = filters;

      const query = {};
      if (teacher) query.teacher = teacher;
      if (status) query.status = status;
      if (leaveType) query.leaveType = leaveType;

      // Date range filter
      if (startDate || endDate) {
        query.$or = [];
        if (startDate) {
          query.$or.push({ fromDate: { $gte: new Date(startDate) } });
        }
        if (endDate) {
          query.$or.push({ toDate: { $lte: new Date(endDate) } });
        }
      }

      return await this.find(query, {
        ...options,
        populate: 'teacher reviewedBy',
        sort: { createdAt: -1 }
      });
    } catch (error) {
      throw this.handleError(error, 'getLeaves');
    }
  }

  /**
   * Get teacher leaves
   */
  async getTeacherLeaves(teacherId, options = {}) {
    try {
      return await this.find(
        { teacher: teacherId },
        {
          ...options,
          populate: 'reviewedBy',
          sort: { createdAt: -1 }
        }
      );
    } catch (error) {
      throw this.handleError(error, 'getTeacherLeaves');
    }
  }

  /**
   * Get pending leaves
   */
  async getPendingLeaves(options = {}) {
    try {
      return await this.find(
        { status: 'Pending' },
        {
          ...options,
          populate: 'teacher',
          sort: { createdAt: -1 }
        }
      );
    } catch (error) {
      throw this.handleError(error, 'getPendingLeaves');
    }
  }

  /**
   * Approve/Reject leave
   */
  async reviewLeave(leaveId, reviewData) {
    try {
      const { status, adminRemark, reviewedBy } = reviewData;

      return await this.updateById(leaveId, {
        status,
        adminRemark,
        reviewedBy,
        reviewedAt: new Date()
      });
    } catch (error) {
      throw this.handleError(error, 'reviewLeave');
    }
  }

  /**
   * Get leave statistics for a teacher
   */
  async getTeacherLeaveStats(teacherId, filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      const matchStage = { teacher: teacherId };
      
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const stats = await this.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalLeaves: { $sum: 1 },
            totalDays: { $sum: '$totalDays' },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
            },
            byType: {
              $push: {
                type: '$leaveType',
                days: '$totalDays'
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalLeaves: 0,
        totalDays: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        byType: []
      };
    } catch (error) {
      throw this.handleError(error, 'getTeacherLeaveStats');
    }
  }
}

module.exports = new LeaveService();
