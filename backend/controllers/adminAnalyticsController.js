const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Announcement = require('../models/Announcement');

/* ================= DASHBOARD SUMMARY ================= */
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();

    const activeAnnouncements = await Announcement.countDocuments({
      expiryDate: { $gte: new Date() },
    });

    const unassignedTeachers = await Teacher.countDocuments({
      classes: { $size: 0 },
    });

    const unassignedStudents = await Student.countDocuments({
      class: { $exists: false },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today },
    });
// ===== OVERALL ATTENDANCE =====
const overallAttendanceAgg = await Attendance.aggregate([
  {
    $group: {
      _id: null,
      present: {
        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
      },
      total: { $sum: 1 },
    },
  },
]);

const overallAttendance =
  overallAttendanceAgg.length > 0
    ? (overallAttendanceAgg[0].present / overallAttendanceAgg[0].total) * 100
    : 0;

// ===== LATEST 3 ANNOUNCEMENTS =====
const latestAnnouncements = await Announcement.find()
  .sort({ createdAt: -1 })
  .limit(3);

res.json({
  success: true,
  data: {
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses,
      activeAnnouncements,
      overallAttendance,
    },
    alerts: {
      unassignedTeachers,
      unassignedStudents,
      todayAttendanceMarked: todayAttendance > 0,
    },
    latestAnnouncements,
  },
});

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false });
  }
};

/* ================= STUDENT GROWTH (MONTHLY) ================= */
exports.getStudentGrowth = async (req, res) => {
  try {
    const data = await Student.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          students: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* ================= ATTENDANCE TREND ================= */
exports.getAttendanceTrend = async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          percentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* ================= CLASS ATTENDANCE ================= */
exports.getClassAttendanceStats = async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$class',
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          classId: '$_id',
          percentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
    ]);

    await Class.populate(data, {
      path: 'classId',
      select: 'name section',
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* ================= RISK STUDENTS ================= */
exports.getRiskStudents = async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$student',
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          studentId: '$_id',
          attendance: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
      { $match: { attendance: { $lt: 75 } } },
    ]);

    await Student.populate(data, {
      path: 'studentId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'name',
      },
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
