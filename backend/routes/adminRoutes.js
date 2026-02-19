const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

/* ================= ADMIN CORE CONTROLLERS ================= */
const {
  addTeacher,
  getAllTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  addStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/adminController');

/* ================= DASHBOARD ================= */
const {
  getDashboardStats,
  getWeeklyAttendance,
} = require('../controllers/adminDashboardController');

/* ================= ANALYTICS ================= */
const {
  getStudentGrowth,
  getAttendanceTrend,
  getClassAttendanceStats,
  getRiskStudents,
  getDashboardSummary, // 🔥 ADDED HERE
} = require('../controllers/adminAnalyticsController');

/* ================= ATTENDANCE ================= */
const {
  getAttendanceReports,
  downloadMonthlyAttendancePDF,
} = require('../controllers/attendanceController');

/* ================= DASHBOARD ROUTE ================= */
// 🔥 PROTECTED + ADMIN AUTHORIZED ROUTE
router.get('/dashboard', protect, authorize('admin'), getDashboardSummary);

router.get('/attendance/weekly', protect, authorize('admin'), getWeeklyAttendance);

/* ================= ATTENDANCE ROUTES ================= */
router.get('/attendance', protect, authorize('admin'), getAttendanceReports);
router.get('/attendance/report/pdf', protect, authorize('admin'), downloadMonthlyAttendancePDF);

/* ================= TEACHERS ================= */
router
  .route('/teachers')
  .get(protect, authorize('admin'), getAllTeachers)
  .post(protect, authorize('admin'), addTeacher);

router
  .route('/teachers/:id')
  .get(protect, authorize('admin'), getTeacher)
  .put(protect, authorize('admin'), updateTeacher)
  .delete(protect, authorize('admin'), deleteTeacher);

/* ================= STUDENTS ================= */
router
  .route('/students')
  .get(protect, authorize('admin'), getAllStudents)
  .post(protect, authorize('admin'), addStudent);

router
  .route('/students/:id')
  .get(protect, authorize('admin'), getStudent)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

/* ================= ANALYTICS ================= */
router.get('/analytics/students-growth', protect, authorize('admin'), getStudentGrowth);
router.get('/analytics/attendance-trend', protect, authorize('admin'), getAttendanceTrend);
router.get('/analytics/class-attendance', protect, authorize('admin'), getClassAttendanceStats);
router.get('/analytics/risk-students', protect, authorize('admin'), getRiskStudents);

module.exports = router;
