const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

const {
  createAcademicYear,
  getAcademicYears,
} = require("../controllers/academicYearController");

router.use(protect);

router.post("/", authorize("admin"), createAcademicYear);
router.get("/", authorize("admin"), getAcademicYears);

module.exports = router;
