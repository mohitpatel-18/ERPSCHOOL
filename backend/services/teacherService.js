/**
 * TeacherService - Business logic for teacher operations
 */

const BaseService = require('./BaseService');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateUsername, generatePassword } = require('../utils/generateCredentials');

class TeacherService extends BaseService {
  constructor() {
    super(Teacher);
  }

  /**
   * Create teacher with user account
   */
  async createTeacherWithUser(teacherData) {
    try {
      const { firstName, lastName, email } = teacherData;

      // Generate credentials
      const username = generateUsername(firstName, lastName);
      const tempPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user account
      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        role: 'teacher',
        isActive: true
      });

      // Create teacher profile
      const teacher = await Teacher.create({
        ...teacherData,
        userId: user._id,
        employeeId: await this.generateEmployeeId()
      });

      // Link teacher to user
      user.teacherId = teacher._id;
      await user.save();

      return {
        teacher,
        user,
        credentials: {
          username,
          tempPassword
        }
      };
    } catch (error) {
      throw this.handleError(error, 'createTeacherWithUser');
    }
  }

  /**
   * Get teachers with filters and pagination
   */
  async getTeachers(filters = {}, options = {}) {
    try {
      const { department, status, search } = filters;

      const query = {};

      if (department) query.department = department;
      if (status) query.status = status;

      // Search by name or employee ID
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      return await this.find(query, {
        ...options,
        populate: 'userId assignedClasses',
        select: '-__v'
      });
    } catch (error) {
      throw this.handleError(error, 'getTeachers');
    }
  }

  /**
   * Get teacher by ID with relations
   */
  async getTeacherById(id) {
    try {
      return await this.findById(id, {
        populate: 'userId assignedClasses'
      });
    } catch (error) {
      throw this.handleError(error, 'getTeacherById');
    }
  }

  /**
   * Update teacher profile
   */
  async updateTeacher(id, updateData) {
    try {
      // Don't allow updating userId or employeeId
      delete updateData.userId;
      delete updateData.employeeId;

      return await this.updateById(id, updateData);
    } catch (error) {
      throw this.handleError(error, 'updateTeacher');
    }
  }

  /**
   * Assign classes to teacher
   */
  async assignClasses(teacherId, classIds) {
    try {
      return await this.updateById(teacherId, {
        assignedClasses: classIds
      });
    } catch (error) {
      throw this.handleError(error, 'assignClasses');
    }
  }

  /**
   * Generate unique employee ID
   */
  async generateEmployeeId() {
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await this.count({});
      const serialNumber = (count + 1).toString().padStart(4, '0');
      return `EMP${year}${serialNumber}`;
    } catch (error) {
      throw this.handleError(error, 'generateEmployeeId');
    }
  }

  /**
   * Get teacher statistics
   */
  async getTeacherStats(filters = {}) {
    try {
      const { department } = filters;
      
      const matchStage = {};
      if (department) matchStage.department = department;

      const stats = await this.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            inactive: {
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            },
            maleCount: {
              $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] }
            },
            femaleCount: {
              $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        maleCount: 0,
        femaleCount: 0
      };
    } catch (error) {
      throw this.handleError(error, 'getTeacherStats');
    }
  }

  /**
   * Get teachers by department
   */
  async getTeachersByDepartment(department) {
    try {
      return await this.find(
        { department, status: 'active' },
        { sort: { firstName: 1 }, populate: 'userId' }
      );
    } catch (error) {
      throw this.handleError(error, 'getTeachersByDepartment');
    }
  }
}

module.exports = new TeacherService();
