const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

/* ================= DASHBOARD STATS ================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalTeachers, totalStudents, totalClasses] =
      await Promise.all([
        Teacher.countDocuments(),
        Student.countDocuments(),
        Class.countDocuments(),
      ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceToday = await Attendance.find({
      date: { $gte: today },
    }).lean();

    let presentToday = 0;
    let absentToday = 0;

    attendanceToday.forEach(a => {
      if (a.status === 'present') presentToday++;
      if (a.status === 'absent') absentToday++;
    });

    const recentTeachers = await Teacher.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentStudents = await Student.find()
      .populate('userId', 'name email')
      .populate('class', 'name section')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalTeachers,
          totalStudents,
          totalClasses,
          presentToday,
          absentToday,
        },
        recentActivities: {
          teachers: recentTeachers,
          students: recentStudents,
        },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false });
  }
};

/* ================= WEEKLY ATTENDANCE ================= */
exports.getWeeklyAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const data = await Attendance.aggregate([
      { $match: { date: { $gte: last7Days, $lte: today } } },
      {
        $group: {
          _id: {
            day: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' },
            },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.day',
          present: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'present'] }, '$count', 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'absent'] }, '$count', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = data.map(d => ({
      day: new Date(d._id).toLocaleDateString('en-US', {
        weekday: 'short',
      }),
      present: d.present,
      absent: d.absent,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Weekly attendance error:', err);
    res.status(500).json({ success: false });
  }
};
