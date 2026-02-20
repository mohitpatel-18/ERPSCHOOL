/**
 * ClassService - Business logic for class operations
 */

const BaseService = require('./BaseService');
const Class = require('../models/Class');

class ClassService extends BaseService {
  constructor() {
    super(Class);
  }

  /**
   * Get classes with filters
   */
  async getClasses(filters = {}, options = {}) {
    try {
      const { academicYear, isActive, grade } = filters;

      const query = {};
      if (academicYear) query.academicYear = academicYear;
      if (isActive !== undefined) query.isActive = isActive;
      if (grade) query.grade = grade;

      return await this.find(query, {
        ...options,
        populate: 'classTeacher academicYear subjects.teacher',
        sort: { grade: 1, section: 1 }
      });
    } catch (error) {
      throw this.handleError(error, 'getClasses');
    }
  }

  /**
   * Get class by ID with full details
   */
  async getClassById(id) {
    try {
      return await this.findById(id, {
        populate: 'classTeacher academicYear subjects.teacher'
      });
    } catch (error) {
      throw this.handleError(error, 'getClassById');
    }
  }

  /**
   * Create class
   */
  async createClass(classData) {
    try {
      return await this.create(classData);
    } catch (error) {
      throw this.handleError(error, 'createClass');
    }
  }

  /**
   * Update class
   */
  async updateClass(id, updateData) {
    try {
      return await this.updateById(id, updateData);
    } catch (error) {
      throw this.handleError(error, 'updateClass');
    }
  }

  /**
   * Assign class teacher
   */
  async assignClassTeacher(classId, teacherId) {
    try {
      return await this.updateById(classId, {
        classTeacher: teacherId
      });
    } catch (error) {
      throw this.handleError(error, 'assignClassTeacher');
    }
  }

  /**
   * Get classes by academic year
   */
  async getClassesByAcademicYear(academicYearId) {
    try {
      return await this.find(
        { academicYear: academicYearId, isActive: true },
        { sort: { grade: 1, section: 1 } }
      );
    } catch (error) {
      throw this.handleError(error, 'getClassesByAcademicYear');
    }
  }

  /**
   * Get class statistics
   */
  async getClassStats(filters = {}) {
    try {
      const { academicYear } = filters;
      
      const matchStage = { isActive: true };
      if (academicYear) matchStage.academicYear = academicYear;

      const stats = await this.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalClasses: { $sum: 1 },
            totalStrength: { $sum: '$strength' },
            avgStrength: { $avg: '$strength' },
            classesByGrade: {
              $push: {
                grade: '$grade',
                section: '$section',
                strength: '$strength'
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalClasses: 0,
        totalStrength: 0,
        avgStrength: 0,
        classesByGrade: []
      };
    } catch (error) {
      throw this.handleError(error, 'getClassStats');
    }
  }
}

module.exports = new ClassService();
