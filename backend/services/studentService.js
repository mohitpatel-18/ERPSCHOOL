/**
 * StudentService - Business logic for student operations
 */

const BaseService = require('./BaseService');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateUsername, generatePassword } = require('../utils/generateCredentials');

class StudentService extends BaseService {
  constructor() {
    super(Student);
  }

  /**
   * Create student with user account
   */
  async createStudentWithUser(studentData) {
    try {
      const { firstName, lastName, email, class: classId, section } = studentData;

      // Generate credentials
      const username = generateUsername(firstName, lastName);
      const tempPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user account
      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        role: 'student',
        isActive: true
      });

      // Create student profile
      const student = await Student.create({
        ...studentData,
        userId: user._id,
        admissionNumber: await this.generateAdmissionNumber()
      });

      // Link student to user
      user.studentId = student._id;
      await user.save();

      return {
        student,
        user,
        credentials: {
          username,
          tempPassword
        }
      };
    } catch (error) {
      throw this.handleError(error, 'createStudentWithUser');
    }
  }

  /**
   * Get students with filters and pagination
   */
  async getStudents(filters = {}, options = {}) {
    try {
      const {
        class: classId,
        section,
        status,
        search,
        academicYear
      } = filters;

      const query = {};

      if (classId) query.class = classId;
      if (section) query.section = section;
      if (status) query.status = status;
      if (academicYear) query.academicYear = academicYear;

      // Search by name or admission number
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { admissionNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const populateOptions = 'class userId';
      
      return await this.find(query, {
        ...options,
        populate: populateOptions,
        select: '-__v'
      });
    } catch (error) {
      throw this.handleError(error, 'getStudents');
    }
  }

  /**
   * Get student by ID with relations
   */
  async getStudentById(id) {
    try {
      return await this.findById(id, {
        populate: 'class userId academicYear'
      });
    } catch (error) {
      throw this.handleError(error, 'getStudentById');
    }
  }

  /**
   * Update student profile
   */
  async updateStudent(id, updateData) {
    try {
      // Don't allow updating userId or admissionNumber
      delete updateData.userId;
      delete updateData.admissionNumber;

      return await this.updateById(id, updateData);
    } catch (error) {
      throw this.handleError(error, 'updateStudent');
    }
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId, section = null) {
    try {
      const filter = { class: classId, status: 'active' };
      if (section) filter.section = section;

      return await this.find(filter, {
        sort: { rollNumber: 1 },
        populate: 'userId'
      });
    } catch (error) {
      throw this.handleError(error, 'getStudentsByClass');
    }
  }

  /**
   * Generate unique admission number
   */
  async generateAdmissionNumber() {
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await this.count({});
      const serialNumber = (count + 1).toString().padStart(4, '0');
      return `ADM${year}${serialNumber}`;
    } catch (error) {
      throw this.handleError(error, 'generateAdmissionNumber');
    }
  }

  /**
   * Get student statistics
   */
  async getStudentStats(filters = {}) {
    try {
      const { academicYear, class: classId } = filters;
      
      const matchStage = {};
      if (academicYear) matchStage.academicYear = academicYear;
      if (classId) matchStage.class = classId;

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
      throw this.handleError(error, 'getStudentStats');
    }
  }

  /**
   * Promote students to next class
   */
  async promoteStudents(studentIds, newClassId, newAcademicYear) {
    try {
      const operations = studentIds.map(id => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              class: newClassId,
              academicYear: newAcademicYear,
              promotedAt: new Date()
            }
          }
        }
      }));

      return await this.bulkWrite(operations);
    } catch (error) {
      throw this.handleError(error, 'promoteStudents');
    }
  }
}

module.exports = new StudentService();
