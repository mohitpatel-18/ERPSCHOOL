const Leave = require("../models/Leave");
const Teacher = require("../models/Teacher");

/* ================= APPLY LEAVE ================= */
exports.applyLeave = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const { leaveType, fromDate, toDate, reason } = req.body;

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    // Overlapping leave check
    const overlap = await Leave.findOne({
      teacher: teacher._id,
      status: { $ne: "Rejected" },
      $or: [
        { fromDate: { $lte: end }, toDate: { $gte: start } },
      ],
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: "You already have leave during this period",
      });
    }

    const totalDays =
      (end - start) / (1000 * 60 * 60 * 24) + 1;

    const leave = await Leave.create({
      teacher: teacher._id,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      attachment: req.file ? req.file.path : null,
    });

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* ================= GET TEACHER LEAVES ================= */
exports.getMyLeaves = async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });

  const leaves = await Leave.find({ teacher: teacher._id })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
};

/* ================= ADMIN: GET ALL ================= */
exports.getAllLeaves = async (req, res) => {
  const leaves = await Leave.find()
    .populate({
      path: "teacher",
      populate: { path: "userId", select: "name email" },
    })
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
};

/* ================= ADMIN: APPROVE/REJECT ================= */
exports.updateLeaveStatus = async (req, res) => {
  const { status, adminRemark } = req.body;

  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: "Leave not found",
    });
  }

  leave.status = status;
  leave.adminRemark = adminRemark;
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();

  await leave.save();

  res.json({ success: true, data: leave });
};
