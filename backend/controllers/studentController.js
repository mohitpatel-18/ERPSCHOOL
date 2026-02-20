const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const StudentFee = require("../models/StudentFee");

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
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get student fee record
    const studentFee = await StudentFee.findOne({
      student: student._id,
    })
      .populate('feeTemplate', 'templateName totalAnnualFee')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });

    if (!studentFee) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No fee assigned yet",
      });
    }

    res.status(200).json({
      success: true,
      data: studentFee,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= STUDENT EXAMS ================= */
exports.getStudentExams = async (req, res, next) => {
  try {
    const ExamResult = require('../models/ExamResult');
    const Exam = require('../models/Exam');
    
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all exams for student's class
    const exams = await Exam.find({ class: student.class })
      .select('name examType totalMarks examDate subject')
      .sort({ examDate: -1 })
      .limit(10)
      .lean();

    // Get student's results
    const results = await ExamResult.find({ student: student._id })
      .populate('exam', 'name examType totalMarks examDate')
      .select('exam marksObtained grade percentage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        upcomingExams: exams.filter(e => new Date(e.date) > new Date()),
        pastExams: exams.filter(e => new Date(e.date) <= new Date()),
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ================= STUDENT HOMEWORK ================= */
exports.getStudentHomework = async (req, res, next) => {
  try {
    const Homework = require('../models/Homework');
    const HomeworkSubmission = require('../models/HomeworkSubmission');
    
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all homework for student's class
    const homework = await Homework.find({ class: student.class, isActive: true })
      .populate('teacher', 'firstName lastName')
      .select('title description subject dueDate maxMarks')
      .sort({ dueDate: -1 })
      .limit(20)
      .lean();

    // Get student's submissions
    const submissions = await HomeworkSubmission.find({ student: student._id })
      .populate('homework', 'title dueDate maxMarks')
      .select('homework submittedAt grade marksObtained status')
      .lean();

    // Create submission map for quick lookup
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.homework._id.toString()] = sub;
    });

    // Enrich homework with submission status
    const enrichedHomework = homework.map(hw => ({
      ...hw,
      submission: submissionMap[hw._id.toString()] || null,
      isPending: !submissionMap[hw._id.toString()] && new Date(hw.dueDate) > new Date(),
      isOverdue: !submissionMap[hw._id.toString()] && new Date(hw.dueDate) < new Date(),
    }));

    res.status(200).json({
      success: true,
      data: {
        pending: enrichedHomework.filter(h => h.isPending),
        overdue: enrichedHomework.filter(h => h.isOverdue),
        submitted: enrichedHomework.filter(h => h.submission),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ================= SUBMIT HOMEWORK ================= */
exports.submitHomework = async (req, res, next) => {
  try {
    const HomeworkSubmission = require('../models/HomeworkSubmission');
    
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { homeworkId, content, attachmentUrl } = req.body;

    // Check if already submitted
    const existing = await HomeworkSubmission.findOne({
      homework: homeworkId,
      student: student._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Homework already submitted",
      });
    }

    const submission = await HomeworkSubmission.create({
      homework: homeworkId,
      student: student._id,
      content,
      attachmentUrl,
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};