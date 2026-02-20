const express = require('express');

const {
  getStudentDashboard,
  getStudentAttendance,
  applyLeave,
  getMyLeaves,
  getStudentFees,
  getStudentExams,
  getStudentHomework,
  submitHomework,
} = require('../controllers/studentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

const router = express.Router();

/* =====================================================
   STUDENT ROUTES
===================================================== */

// 🔒 Dashboard
router.get(
  '/dashboard',
  protect,
  authorize('student'),
  getStudentDashboard
);

// 🔒 Attendance
router.get(
  '/attendance',
  protect,
  authorize('student'),
  getStudentAttendance
);

/* ================= LEAVE MANAGEMENT ================= */
// 🔒 Apply Leave
router.post(
  '/leave',
  protect,
  authorize('student'),
  upload.single('attachment'),
  applyLeave
);

// 🔒 My Leaves
router.get(
  '/leave',
  protect,
  authorize('student'),
  getMyLeaves
);

/* ================= FEES ================= */
// 🔒 Student Fees
router.get(
  '/fees',
  protect,
  authorize('student'),
  getStudentFees
);

/* ================= EXAMS ================= */
// 🔒 Get Exams and Results
router.get(
  '/exams',
  protect,
  authorize('student'),
  getStudentExams
);

/* ================= HOMEWORK ================= */
// 🔒 Get Homework
router.get(
  '/homework',
  protect,
  authorize('student'),
  getStudentHomework
);

// 🔒 Submit Homework
router.post(
  '/homework/submit',
  protect,
  authorize('student'),
  upload.single('attachment'),
  submitHomework
);

module.exports = router;
