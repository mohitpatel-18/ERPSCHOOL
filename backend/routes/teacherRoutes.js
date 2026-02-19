const express = require('express');

const {
  getTeacherDashboard,
  markAttendance,
  updateAttendance,
  getStudentsByClass,
  teacherAddStudent,
  updateStudentByTeacher,
  deleteStudentByTeacher,
  getAttendanceByClass,
  getTeacherProfile,
  getWeakStudents,
} = require('../controllers/teacherController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

/* =====================================================
   APPLY PROTECTION
===================================================== */
router.use(protect);
router.use(authorize('teacher'));

/* =====================================================
   DASHBOARD
===================================================== */
router.get('/dashboard', getTeacherDashboard);

/* =====================================================
   PROFILE
===================================================== */
router.get('/profile', getTeacherProfile);

/* =====================================================
   STUDENTS
===================================================== */
router.get('/students/:classId', getStudentsByClass);
router.post('/students', teacherAddStudent);
router.put('/students/:id', updateStudentByTeacher);
router.delete('/students/:id', deleteStudentByTeacher);

/* =====================================================
   ATTENDANCE
===================================================== */
router.post('/attendance/mark', markAttendance);
router.get('/attendance/:classId', getAttendanceByClass);
router.put('/attendance/:attendanceId', updateAttendance);

/* =====================================================
   WEAK STUDENTS
===================================================== */
router.get('/weak-students', getWeakStudents);

module.exports = router;
