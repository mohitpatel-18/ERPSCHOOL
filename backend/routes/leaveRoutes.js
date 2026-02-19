const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

/* ================= TEACHER ================= */
router.post(
  "/apply",
  protect,
  authorize("teacher"),
  upload.single("attachment"),
  applyLeave
);

router.get(
  "/my",
  protect,
  authorize("teacher"),
  getMyLeaves
);

/* ================= ADMIN ================= */
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllLeaves
);

router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateLeaveStatus
);

module.exports = router;
