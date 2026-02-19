const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncements,
  getAllAnnouncementsAdmin,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
} = require("../controllers/announcementController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

/* =========================================================
   PUBLIC ROLE-BASED FETCH (TEACHER / STUDENT / ADMIN)
========================================================= */
router.get("/", protect, getAnnouncements);

/* =========================================================
   ADMIN ROUTES
========================================================= */
router.post("/", protect, authorize("admin"), createAnnouncement);

router.get("/admin/all", protect, authorize("admin"), getAllAnnouncementsAdmin);

router.put("/:id", protect, authorize("admin"), updateAnnouncement);

router.delete("/:id", protect, authorize("admin"), deleteAnnouncement);

router.patch(
  "/:id/toggle",
  protect,
  authorize("admin"),
  toggleAnnouncementStatus
);

module.exports = router;
