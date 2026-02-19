const express = require('express');

const {
  getStudentDashboard,
  getStudentAttendance,
  applyLeave,
  getMyLeaves,
  getStudentFees
} = require('../controllers/studentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

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

// 🔒 Apply Leave
router.post(
  '/leave',
  protect,
  authorize('student'),
  applyLeave
);

// 🔒 My Leaves
router.get(
  '/leave',
  protect,
  authorize('student'),
  getMyLeaves
);

// 🔒 Student Fees
router.get(
  '/fees',
  protect,
  authorize('student'),
  getStudentFees
);

module.exports = router;
