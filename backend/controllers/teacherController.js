const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');

/* =====================================================
   HELPER
===================================================== */
const getActiveTeacher = async (userId) => {
  const teacher = await Teacher.findOne({ userId }).populate('classes');
  if (!teacher) return { error: 'Teacher not found' };
  if (teacher.status && teacher.status !== 'active') {
    return { error: 'Teacher account is inactive' };
  }
  return { teacher };
};

/* =====================================================
   TEACHER DASHBOARD
===================================================== */
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const { teacher, error } = await getActiveTeacher(req.user.id);
    if (error) {
      return res.status(403).json({ success: false, message: error });
    }

    const classIds = teacher.classes.map((c) => c._id);

    const totalStudents = await Student.countDocuments({
      class: { $in: classIds },
      status: 'active',
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.find({
      class: { $in: classIds },
      date: { $gte: today },
    });

    const markedClassIds = [
      ...new Set(todayAttendance.map((a) => a.class.toString())),
    ];

    const pendingAttendance =
      teacher.classes.length - markedClassIds.length;

    const absentToday = todayAttendance.filter(
      (a) => a.status === 'absent'
    ).length;

    const todayAttendancePercentage =
      todayAttendance.length > 0
        ? (
            ((todayAttendance.length - absentToday) /
              todayAttendance.length) *
            100
          ).toFixed(2)
        : 0;

    /* Weak Students Count */
    const allAttendance = await Attendance.find({
      class: { $in: classIds },
    });

    const map = {};
    allAttendance.forEach((a) => {
      const id = a.student.toString();
      if (!map[id]) map[id] = { total: 0, present: 0 };
      map[id].total++;
      if (a.status === 'present') map[id].present++;
    });

    const weakStudentsCount = Object.values(map).filter(
      (s) => s.total > 0 && (s.present / s.total) * 100 < 75
    ).length;

    res.status(200).json({
      success: true,
      data: {
        teacher,
        stats: {
          totalClasses: teacher.classes.length,
          totalStudents,
          attendanceMarkedToday: markedClassIds.length,
          pendingAttendance,
          todayAttendancePercentage,
          absentToday,
          weakStudentsCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   MARK ATTENDANCE
===================================================== */
exports.markAttendance = async (req, res, next) => {
  try {
    const { teacher, error } = await getActiveTeacher(req.user.id);
    if (error) {
      return res.status(403).json({ success: false, message: error });
    }

    const { classId, date, attendanceData } = req.body;

    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance data',
      });
    }

    const allowedStatuses = ['present', 'absent', 'late', 'half-day'];

    for (let item of attendanceData) {
      if (!allowedStatuses.includes(item.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance status',
        });
      }
    }

    const exists = await Attendance.findOne({
      class: classId,
      date: new Date(date),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked',
      });
    }

    const records = attendanceData.map((r) => ({
      student: r.studentId,
      class: classId,
      date: new Date(date),
      status: r.status,
      markedBy: teacher._id,
    }));

    await Attendance.insertMany(records);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE ATTENDANCE
===================================================== */
exports.updateAttendance = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is mandatory',
      });
    }

    const allowedStatuses = ['present', 'absent', 'late', 'half-day'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status',
      });
    }

    const attendance = await Attendance.findById(
      req.params.attendanceId
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance not found',
      });
    }

    const diffHours =
      (Date.now() - new Date(attendance.date)) /
      (1000 * 60 * 60);

    if (diffHours > 24) {
      return res.status(403).json({
        success: false,
        message: 'Attendance edit window expired',
      });
    }

    attendance.auditLogs.push({
      oldStatus: attendance.status,
      newStatus: status,
      reason,
      changedBy: req.user.id,
    });

    attendance.status = status;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   VIEW STUDENTS
===================================================== */
exports.getStudentsByClass = async (req, res, next) => {
  try {
    const { teacher, error } = await getActiveTeacher(req.user.id);
    if (error)
      return res.status(403).json({ success: false, message: error });

    const classId = req.params.classId;

    if (!teacher.classes.some((c) => c._id.toString() === classId)) {
      return res.status(403).json({
        success: false,
        message: 'Not assigned to this class',
      });
    }

    const students = await Student.find({
      class: classId,
      status: 'active',
    })
      .populate('userId', 'name email phone')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   ADD STUDENT
===================================================== */
exports.teacherAddStudent = async (req, res, next) => {
  try {
    const { teacher, error } = await getActiveTeacher(req.user.id);
    if (error)
      return res.status(403).json({ success: false, message: error });

    const {
      name,
      email,
      phone,
      classId,
      rollNumber,
      parentName,
      parentPhone,
      parentEmail,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    } = req.body;

    // ✅ Validate class selected
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class is required",
      });
    }

    // ✅ OPTIONAL: If teacher has assigned classes, validate them
    if (teacher.classes.length > 0) {
      const isAssigned = teacher.classes.some(
        (c) => c._id.toString() === classId
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "Not assigned to this class",
        });
      }
    }

    // ✅ Check duplicate email
    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 🔐 Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
      name,
      email,
      phone,
      role: "student",
      password: tempPassword,
    });

    const student = await Student.create({
      userId: user._id,
      studentId: `STD${Date.now()}`,
      class: classId,
      rollNumber,
      parentName,
      parentPhone,
      parentEmail,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    });

    res.status(201).json({
      success: true,
      data: {
        student,
        credentials: {
          email,
          studentId: student.studentId,
          temporaryPassword: tempPassword,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE / DELETE STUDENT (RESTRICTED)
===================================================== */
exports.updateStudentByTeacher = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Restricted to admin',
  });
};

exports.deleteStudentByTeacher = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Restricted to admin',
  });
};

/* =====================================================
   VIEW ATTENDANCE BY CLASS
===================================================== */
exports.getAttendanceByClass = async (req, res, next) => {
  try {
    const { teacher, error } = await getActiveTeacher(req.user.id);
    if (error)
      return res.status(403).json({ success: false, message: error });

    const classId = req.params.classId;

    if (!teacher.classes.some((c) => c._id.toString() === classId)) {
      return res.status(403).json({
        success: false,
        message: 'Not assigned to this class',
      });
    }

    const { startDate, endDate } = req.query;
    let query = { class: classId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   TEACHER PROFILE
===================================================== */
exports.getTeacherProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({
      userId: req.user.id,
    })
      .populate('userId', 'name email phone role lastLogin')
      .populate('classes', 'name section');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   WEAK STUDENTS (LAST 7 DAYS)
===================================================== */
exports.getWeakStudents = async (req, res, next) => {
  try {
    const { teacher, error } = await getActiveTeacher(req.user.id);
    if (error)
      return res.status(403).json({ success: false, message: error });

    const classIds = teacher.classes.map((c) => c._id);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendance = await Attendance.find({
      class: { $in: classIds },
      date: { $gte: sevenDaysAgo },
    }).populate({
      path: 'student',
      populate: { path: 'userId', select: 'name' },
    });

    const map = {};

    attendance.forEach((a) => {
      const id = a.student._id.toString();
      if (!map[id]) map[id] = { student: a.student, total: 0, present: 0 };
      map[id].total++;
      if (a.status === 'present') map[id].present++;
    });

    const weakStudents = Object.values(map)
      .map((s) => ({
        student: s.student,
        percentage: ((s.present / s.total) * 100).toFixed(2),
      }))
      .filter((s) => s.percentage < 75);

    res.status(200).json({
      success: true,
      data: weakStudents,
    });
  } catch (err) {
    next(err);
  }
};
