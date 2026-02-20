/**
 * Database Backup and Restore Utilities
 * For production, use MongoDB Atlas automated backups or mongodump/mongorestore
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('./logger');

// Models to backup
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const FeeStructure = require('../models/FeeStructure');
const StudentFeeLedger = require('../models/StudentFeeLedger');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Grade = require('../models/Grade');
const AcademicYear = require('../models/AcademicYear');
const AuditLog = require('../models/AuditLog');

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create database backup
 */
const createBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    
    logger.info('Starting database backup...');
    
    // Fetch all data from collections
    const backup = {
      timestamp: new Date(),
      version: '1.0',
      data: {
        users: await User.find({}).lean(),
        students: await Student.find({}).lean(),
        teachers: await Teacher.find({}).lean(),
        classes: await Class.find({}).lean(),
        attendance: await Attendance.find({}).lean(),
        feeStructures: await FeeStructure.find({}).lean(),
        studentFeeLedgers: await StudentFeeLedger.find({}).lean(),
        leaves: await Leave.find({}).lean(),
        announcements: await Announcement.find({}).lean(),
        grades: await Grade.find({}).lean(),
        academicYears: await AcademicYear.find({}).lean(),
        auditLogs: await AuditLog.find({}).limit(1000).lean() // Last 1000 logs only
      },
      stats: {}
    };
    
    // Calculate statistics
    Object.keys(backup.data).forEach(key => {
      backup.stats[key] = backup.data[key].length;
    });
    
    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    const fileSize = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2);
    
    logger.success('Database backup completed', {
      path: backupPath,
      size: `${fileSize} MB`,
      stats: backup.stats
    });
    
    return {
      success: true,
      path: backupPath,
      size: fileSize,
      stats: backup.stats
    };
  } catch (error) {
    logger.error('Database backup failed', error);
    throw error;
  }
};

/**
 * Restore database from backup
 * WARNING: This will clear existing data!
 */
const restoreBackup = async (backupPath) => {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    logger.warn('Starting database restore - THIS WILL CLEAR EXISTING DATA!');
    
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    if (!backupData.data) {
      throw new Error('Invalid backup file format');
    }
    
    // Clear existing collections (in reverse order to avoid reference issues)
    await AuditLog.deleteMany({});
    await Grade.deleteMany({});
    await Announcement.deleteMany({});
    await Leave.deleteMany({});
    await StudentFeeLedger.deleteMany({});
    await FeeStructure.deleteMany({});
    await Attendance.deleteMany({});
    await Class.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await User.deleteMany({});
    await AcademicYear.deleteMany({});
    
    logger.info('Existing data cleared. Restoring from backup...');
    
    // Restore data (in correct order to maintain references)
    const results = {};
    
    if (backupData.data.users?.length > 0) {
      const users = await User.insertMany(backupData.data.users);
      results.users = users.length;
    }
    
    if (backupData.data.students?.length > 0) {
      const students = await Student.insertMany(backupData.data.students);
      results.students = students.length;
    }
    
    if (backupData.data.teachers?.length > 0) {
      const teachers = await Teacher.insertMany(backupData.data.teachers);
      results.teachers = teachers.length;
    }
    
    if (backupData.data.academicYears?.length > 0) {
      const academicYears = await AcademicYear.insertMany(backupData.data.academicYears);
      results.academicYears = academicYears.length;
    }
    
    if (backupData.data.classes?.length > 0) {
      const classes = await Class.insertMany(backupData.data.classes);
      results.classes = classes.length;
    }
    
    if (backupData.data.attendance?.length > 0) {
      const attendance = await Attendance.insertMany(backupData.data.attendance);
      results.attendance = attendance.length;
    }
    
    if (backupData.data.feeStructures?.length > 0) {
      const feeStructures = await FeeStructure.insertMany(backupData.data.feeStructures);
      results.feeStructures = feeStructures.length;
    }
    
    if (backupData.data.studentFeeLedgers?.length > 0) {
      const ledgers = await StudentFeeLedger.insertMany(backupData.data.studentFeeLedgers);
      results.studentFeeLedgers = ledgers.length;
    }
    
    if (backupData.data.leaves?.length > 0) {
      const leaves = await Leave.insertMany(backupData.data.leaves);
      results.leaves = leaves.length;
    }
    
    if (backupData.data.announcements?.length > 0) {
      const announcements = await Announcement.insertMany(backupData.data.announcements);
      results.announcements = announcements.length;
    }
    
    if (backupData.data.grades?.length > 0) {
      const grades = await Grade.insertMany(backupData.data.grades);
      results.grades = grades.length;
    }
    
    if (backupData.data.auditLogs?.length > 0) {
      const auditLogs = await AuditLog.insertMany(backupData.data.auditLogs);
      results.auditLogs = auditLogs.length;
    }
    
    logger.success('Database restore completed', results);
    
    return {
      success: true,
      restored: results
    };
  } catch (error) {
    logger.error('Database restore failed', error);
    throw error;
  }
};

/**
 * List available backups
 */
const listBackups = () => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);
    
    return files;
  } catch (error) {
    logger.error('Failed to list backups', error);
    return [];
  }
};

/**
 * Delete old backups (keep last N backups)
 */
const cleanOldBackups = (keepLast = 5) => {
  try {
    const backups = listBackups();
    
    if (backups.length <= keepLast) {
      logger.info(`No old backups to clean. Total backups: ${backups.length}`);
      return { deleted: 0 };
    }
    
    const toDelete = backups.slice(keepLast);
    let deleted = 0;
    
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      deleted++;
      logger.info(`Deleted old backup: ${backup.filename}`);
    });
    
    logger.success(`Cleaned ${deleted} old backups. Kept last ${keepLast}.`);
    
    return { deleted };
  } catch (error) {
    logger.error('Failed to clean old backups', error);
    throw error;
  }
};

/**
 * Export specific collection
 */
const exportCollection = async (collectionName, outputPath) => {
  try {
    const models = {
      users: User,
      students: Student,
      teachers: Teacher,
      classes: Class,
      attendance: Attendance,
      feeStructures: FeeStructure,
      studentFeeLedgers: StudentFeeLedger,
      leaves: Leave,
      announcements: Announcement,
      grades: Grade,
      academicYears: AcademicYear,
      auditLogs: AuditLog
    };
    
    const Model = models[collectionName];
    
    if (!Model) {
      throw new Error(`Unknown collection: ${collectionName}`);
    }
    
    const data = await Model.find({}).lean();
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    
    logger.success(`Exported ${collectionName}`, {
      path: outputPath,
      size: `${fileSize} KB`,
      count: data.length
    });
    
    return {
      success: true,
      path: outputPath,
      count: data.length
    };
  } catch (error) {
    logger.error(`Failed to export ${collectionName}`, error);
    throw error;
  }
};

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  cleanOldBackups,
  exportCollection
};
