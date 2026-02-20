/**
 * AttendanceService - Business logic for attendance operations
 */

const BaseService = require('./BaseService');
const Attendance = require('../models/Attendance');

class AttendanceService extends BaseService {
  constructor() {
    super(Attendance);
  }

  /**
   * Mark attendance for a class
   */
  async markAttendance(attendanceData) {
    try {
      const { date, class: classId, section, records } = attendanceData;

      // Check if attendance already exists for this date/class/section
      const existing = await this.findOne({
        date: new Date(date),
        class: classId,
        section
      });

      if (existing) {
        // Update existing attendance
        existing.records = records;
        existing.markedBy = attendanceData.markedBy;
        existing.updatedAt = new Date();
        return await existing.save();
      } else {
        // Create new attendance record
        return await this.create(attendanceData);
      }
    } catch (error) {
      throw this.handleError(error, 'markAttendance');
    }
  }

  /**
   * Get attendance for a specific date and class
   */
  async getAttendanceByDate(date, classId, section) {
    try {
      return await this.findOne(
        {
          date: new Date(date),
          class: classId,
          section
        },
        {
          populate: 'class markedBy records.student'
        }
      );
    } catch (error) {
      throw this.handleError(error, 'getAttendanceByDate');
    }
  }

  /**
   * Get attendance records with filters
   */
  async getAttendanceRecords(filters = {}, options = {}) {
    try {
      const {
        class: classId,
        section,
        startDate,
        endDate,
        markedBy
      } = filters;

      const query = {};

      if (classId) query.class = classId;
      if (section) query.section = section;
      if (markedBy) query.markedBy = markedBy;

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      return await this.find(query, {
        ...options,
        populate: 'class markedBy',
        sort: { date: -1 }
      });
    } catch (error) {
      throw this.handleError(error, 'getAttendanceRecords');
    }
  }

  /**
   * Get student attendance summary
   */
  async getStudentAttendanceSummary(studentId, filters = {}) {
    try {
      const { startDate, endDate } = filters;

      const matchStage = {
        'records.student': studentId
      };

      // Date range
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }

      const summary = await this.aggregate([
        { $match: matchStage },
        { $unwind: '$records' },
        { $match: { 'records.student': studentId } },
        {
          $group: {
            _id: null,
            totalDays: { $sum: 1 },
            presentDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
            },
            absentDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0] }
            },
            lateDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0] }
            },
            halfDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'half-day'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalDays: 1,
            presentDays: 1,
            absentDays: 1,
            lateDays: 1,
            halfDays: 1,
            attendancePercentage: {
              $multiply: [
                { $divide: ['$presentDays', '$totalDays'] },
                100
              ]
            }
          }
        }
      ]);

      return summary[0] || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        halfDays: 0,
        attendancePercentage: 0
      };
    } catch (error) {
      throw this.handleError(error, 'getStudentAttendanceSummary');
    }
  }

  /**
   * Get class attendance summary
   */
  async getClassAttendanceSummary(classId, section, date) {
    try {
      const attendance = await this.findOne(
        {
          date: new Date(date),
          class: classId,
          section
        },
        {
          populate: 'records.student'
        }
      );

      if (!attendance) {
        return {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          percentage: 0
        };
      }

      const total = attendance.records.length;
      const present = attendance.records.filter(r => r.status === 'present').length;
      const absent = attendance.records.filter(r => r.status === 'absent').length;
      const late = attendance.records.filter(r => r.status === 'late').length;
      const halfDay = attendance.records.filter(r => r.status === 'half-day').length;

      return {
        total,
        present,
        absent,
        late,
        halfDay,
        percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
        records: attendance.records
      };
    } catch (error) {
      throw this.handleError(error, 'getClassAttendanceSummary');
    }
  }

  /**
   * Get attendance trends for analytics
   */
  async getAttendanceTrends(filters = {}) {
    try {
      const {
        class: classId,
        section,
        startDate,
        endDate
      } = filters;

      const matchStage = {};
      if (classId) matchStage.class = classId;
      if (section) matchStage.section = section;
      
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }

      const trends = await this.aggregate([
        { $match: matchStage },
        { $unwind: '$records' },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
            },
            totalStudents: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            totalStudents: 1,
            present: 1,
            absent: 1,
            percentage: {
              $multiply: [
                { $divide: ['$present', '$totalStudents'] },
                100
              ]
            }
          }
        },
        { $sort: { date: 1 } }
      ]);

      return trends;
    } catch (error) {
      throw this.handleError(error, 'getAttendanceTrends');
    }
  }

  /**
   * Identify low attendance students
   */
  async getLowAttendanceStudents(threshold = 75, filters = {}) {
    try {
      const { class: classId, section, startDate, endDate } = filters;

      const matchStage = {};
      if (classId) matchStage.class = classId;
      if (section) matchStage.section = section;
      
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }

      const lowAttendance = await this.aggregate([
        { $match: matchStage },
        { $unwind: '$records' },
        {
          $group: {
            _id: '$records.student',
            totalDays: { $sum: 1 },
            presentDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            student: '$_id',
            totalDays: 1,
            presentDays: 1,
            percentage: {
              $multiply: [
                { $divide: ['$presentDays', '$totalDays'] },
                100
              ]
            }
          }
        },
        { $match: { percentage: { $lt: threshold } } },
        { $sort: { percentage: 1 } },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentDetails'
          }
        },
        { $unwind: '$studentDetails' }
      ]);

      return lowAttendance;
    } catch (error) {
      throw this.handleError(error, 'getLowAttendanceStudents');
    }
  }
}

module.exports = new AttendanceService();
