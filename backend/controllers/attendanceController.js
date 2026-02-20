const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const PDFDocument = require("pdfkit");

/* =====================================================
   STUDENT DASHBOARD
===================================================== */
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id })
      .populate("userId", "name email phone avatar")
      .populate("class", "name section")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const records = await Attendance.find({
      student: student._id,
      date: { $gte: startOfMonth },
    });

    const presentDays = records.filter(
      r => r.status === "present"
    ).length;

    const totalDays = records.length;

    const attendancePercentage =
      totalDays > 0
        ? ((presentDays / totalDays) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          presentDays,
          totalDays,
          attendancePercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   STUDENT ATTENDANCE LIST
===================================================== */
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const query = { student: student._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: "markedBy",
        populate: { path: "userId", select: "name" },
      })
      .sort({ date: -1 });

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
   ADMIN ATTENDANCE REPORTS (STATS)
===================================================== */
exports.getAttendanceReports = async (req, res, next) => {
  try {
    const { classId, startDate, endDate } = req.query;

    const match = {};

    if (classId && classId !== "all") {
      match.class = classId;
    }

    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = {
      present: 0,
      absent: 0,
      late: 0,
      "half-day": 0,
    };

    stats.forEach(s => {
      formatted[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      stats: formatted,
      total: Object.values(formatted).reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   ADMIN MONTHLY ATTENDANCE PDF
===================================================== */
exports.downloadMonthlyAttendancePDF = async (req, res, next) => {
  try {
    const { classId, month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const query = { date: { $gte: start, $lte: end } };

    if (classId && classId !== "all") {
      query.class = classId;
    }

    const records = await Attendance.find(query)
      .populate({
        path: "student",
        populate: { path: "userId", select: "name" },
      })
      .populate("class", "name section")
      .sort({ date: 1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-${month}-${year}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Samrose Nalanda School", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text("Monthly Attendance Report", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(10).text(`Month: ${month}-${year}`);
    doc.moveDown(1);

    if (records.length > 0 && records[0].class) {
      doc.text(
        `Class: ${records[0].class.name} ${records[0].class.section}`
      );
      doc.moveDown(1);
    }

    doc.text(
      "Date        Student Name           Class        Status"
    );
    doc.text(
      "-------------------------------------------------------------"
    );

    records.forEach(r => {
      doc.text(
        `${r.date.toISOString().slice(0, 10)}   ${
          r.student?.userId?.name || "-"
        }   ${r.class?.name} ${r.class?.section}   ${r.status}`
      );
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
