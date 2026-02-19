const express = require("express");
const router = express.Router();

const {
  getStudentDashboard,
  getStudentAttendance,
  getAttendanceReports, // ✅ NEW
} = require("../controllers/attendanceController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

// ================= STUDENT ROUTES =================
router.get(
  "/student/dashboard",
  protect,
  authorize("student"),
  getStudentDashboard
);

router.get(
  "/student/attendance",
  protect,
  authorize("student"),
  getStudentAttendance
);

// ================= ADMIN ROUTES =================
router.get(
  "/reports",
  protect,
  authorize("admin"),
  getAttendanceReports
);

module.exports = router;
