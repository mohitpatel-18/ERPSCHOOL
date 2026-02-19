const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const StudentFeeLedger = require("../models/StudentFeeLedger");

/* =====================================================
   STUDENT DASHBOARD
===================================================== */
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone avatar')
      .populate('class', 'name section classTeacher')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const attendanceRecords = await Attendance.find({
      student: student._id,
    })
      .sort({ date: 1 })
      .lean();

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      a => a.status === 'present'
    ).length;

    const attendancePercentage =
      totalDays > 0
        ? Number(((presentDays / totalDays) * 100).toFixed(2))
        : 0;

    const lowAttendance = attendancePercentage < 75;

    /* ================= STREAK LOGIC ================= */
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    attendanceRecords.forEach(record => {
      if (record.status === 'present') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    for (let i = attendanceRecords.length - 1; i >= 0; i--) {
      if (attendanceRecords[i].status === 'present') {
        currentStreak++;
      } else {
        break;
      }
    }

    /* ================= BADGE SYSTEM ================= */
    let badge = '🎯 Keep Going';
    if (attendancePercentage === 100) badge = '🥇 100% Champion';
    else if (attendancePercentage >= 90) badge = '🥈 Attendance Star';
    else if (attendancePercentage >= 75) badge = '🥉 Good Performer';

    /* ================= PERFORMANCE GRADE ================= */
    let grade = 'D';
    if (attendancePercentage >= 95) grade = 'A+';
    else if (attendancePercentage >= 85) grade = 'A';
    else if (attendancePercentage >= 75) grade = 'B';
    else if (attendancePercentage >= 60) grade = 'C';

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          presentDays,
          totalDays,
          attendancePercentage,
          lowAttendance,
          currentStreak,
          longestStreak,
          badge,
          grade,
        },
        calendarData: attendanceRecords.map(a => ({
          date: a.date,
          status: a.status,
        })),
        trendData: attendanceRecords.slice(-30),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET STUDENT ATTENDANCE
===================================================== */
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const attendance = await Attendance.find({
      student: student._id,
    })
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   APPLY LEAVE
===================================================== */
exports.applyLeave = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const leave = await Leave.create({
      student: student._id,
      fromDate,
      toDate,
      reason,
    });

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET MY LEAVES
===================================================== */
exports.getMyLeaves = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const leaves = await Leave.find({
      student: student._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};
/* ================= STUDENT FEES ================= */
exports.getStudentFees = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const ledgers = await StudentFeeLedger.find({
      student: student._id,
    }).sort({ year: -1, month: -1 });

    let totalPaid = 0;
    let totalPending = 0;

    ledgers.forEach((ledger) => {
      totalPaid += ledger.paidAmount;
      totalPending += ledger.balance;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPaid,
          totalPending,
        },
        ledgers,
      },
    });
  } catch (error) {
    next(error);
  }
};