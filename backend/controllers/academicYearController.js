const AcademicYear = require("../models/AcademicYear");

/* ================= CREATE YEAR ================= */
exports.createAcademicYear = async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;

    const existing = await AcademicYear.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Academic year already exists",
      });
    }

    const year = await AcademicYear.create({
      name,
      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      data: year,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET ALL YEARS ================= */
exports.getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: years,
    });
  } catch (error) {
    next(error);
  }
};
