const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
  getLeaveBalance,
  getLeaveAnalytics,
} = require("../controllers/leaveController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

/* ================= TEACHER & STUDENT ================= */
router.post(
  "/apply",
  protect,
  authorize("teacher", "student"),
  upload.single("attachment"),
  applyLeave
);

router.get(
  "/my",
  protect,
  authorize("teacher", "student"),
  getMyLeaves
);

router.get(
  "/balance",
  protect,
  authorize("teacher", "student"),
  getLeaveBalance
);

router.put(
  "/:id/cancel",
  protect,
  authorize("teacher", "student"),
  cancelLeave
);

/* ================= ADMIN ================= */
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllLeaves
);

router.get(
  "/analytics",
  protect,
  authorize("admin"),
  getLeaveAnalytics
);

router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateLeaveStatus
);

module.exports = router;
