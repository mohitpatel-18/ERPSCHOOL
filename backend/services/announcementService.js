/**
 * AnnouncementService - Business logic for announcement operations
 */

const BaseService = require('./BaseService');
const Announcement = require('../models/Announcement');

class AnnouncementService extends BaseService {
  constructor() {
    super(Announcement);
  }

  /**
   * Create announcement
   */
  async createAnnouncement(announcementData) {
    try {
      return await this.create(announcementData);
    } catch (error) {
      throw this.handleError(error, 'createAnnouncement');
    }
  }

  /**
   * Get announcements with filters
   */
  async getAnnouncements(filters = {}, options = {}) {
    try {
      const { target, targetClass, isActive } = filters;

      const query = {};
      if (target) query.target = target;
      if (targetClass) query.targetClass = targetClass;
      if (isActive !== undefined) query.isActive = isActive;

      // Only get non-expired announcements
      query.expiryDate = { $gte: new Date() };

      return await this.find(query, {
        ...options,
        populate: 'createdBy targetClass',
        sort: { createdAt: -1 }
      });
    } catch (error) {
      throw this.handleError(error, 'getAnnouncements');
    }
  }

  /**
   * Get announcements for a specific role
   */
  async getAnnouncementsForRole(role, classId = null, options = {}) {
    try {
      const query = {
        expiryDate: { $gte: new Date() },
        isActive: true,
        $or: [
          { target: 'All' },
          { target: role === 'teacher' ? 'Teachers' : 'Students' }
        ]
      };

      // If student and classId provided, include class-specific announcements
      if (role === 'student' && classId) {
        query.$or.push({ targetClass: classId });
      }

      return await this.find(query, {
        ...options,
        populate: 'createdBy targetClass',
        sort: { createdAt: -1 }
      });
    } catch (error) {
      throw this.handleError(error, 'getAnnouncementsForRole');
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id, updateData) {
    try {
      return await this.updateById(id, updateData);
    } catch (error) {
      throw this.handleError(error, 'updateAnnouncement');
    }
  }

  /**
   * Delete/Deactivate announcement
   */
  async deactivateAnnouncement(id) {
    try {
      return await this.updateById(id, { isActive: false });
    } catch (error) {
      throw this.handleError(error, 'deactivateAnnouncement');
    }
  }

  /**
   * Delete expired announcements (cleanup job)
   */
  async deleteExpiredAnnouncements() {
    try {
      const result = await Announcement.deleteMany({
        expiryDate: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Older than 30 days
      });
      return result;
    } catch (error) {
      throw this.handleError(error, 'deleteExpiredAnnouncements');
    }
  }
}

module.exports = new AnnouncementService();
