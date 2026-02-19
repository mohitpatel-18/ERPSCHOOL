const express = require("express");
const router = express.Router();

const {
  createFeeStructure,
  generateMonthlyLedger,
  getStudentLedger,
  recordManualPayment,
  applyLateFine,
  getClassCollectionReport,
  getAdminFeeSummary,
  getFeeTrend,
  getRecentPayments,
} = require("../controllers/feeController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

router.use(protect);

/* ================= ADMIN ROUTES ================= */

// 🏗 Create Fee Structure
router.post("/structure", authorize("admin"), createFeeStructure);

// 📅 Generate Monthly Ledger
router.post("/generate", authorize("admin"), generateMonthlyLedger);

// ⏰ Apply Late Fine
router.post("/late-fine", authorize("admin"), applyLateFine);

// 💰 Manual Payment
router.post("/pay/:ledgerId", authorize("admin"), recordManualPayment);

// 📊 Class Collection Report
router.get("/report/:classId", authorize("admin"), getClassCollectionReport);

// 📊 Dashboard Summary
router.get("/admin/summary", authorize("admin"), getAdminFeeSummary);

// 📈 Collection Trend
router.get("/admin/trend", authorize("admin"), getFeeTrend);

// 💳 Recent Payments
router.get("/admin/recent-payments", authorize("admin"), getRecentPayments);

/* ================= STUDENT ROUTES ================= */

router.get("/student/:studentId", authorize("student", "admin"), getStudentLedger);

module.exports = router;
