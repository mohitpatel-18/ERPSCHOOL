// backend/controllers/leaveController.js
const Leave = require("../models/Leave");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");

/* ================= APPLY LEAVE (TEACHER) ================= */
exports.applyLeave = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });

  if (!teacher) {
    return res.status(404).json({ success: false, message: "Teacher not found" });
  }

  const { leaveType, fromDate, toDate, reason, halfDay, session, contactNumber, alternativeEmail, priority } = req.body;

  if (!leaveType || !fromDate || !toDate || !reason) {
    return res.status(400).json({ success: false, message: "All required fields must be provided" });
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (start > end) {
    return res.status(400).json({ success: false, message: "Invalid date range" });
  }

  // Check if applying for past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) {
    return res.status(400).json({ success: false, message: "Cannot apply for past dates" });
  }

  // Create leave object
  const leave = new Leave({
    userType: 'teacher',
    teacher: teacher._id,
    leaveType,
    fromDate: start,
    toDate: end,
    reason,
    halfDay: halfDay === 'true' || halfDay === true,
    session: session || 'Full Day',
    contactNumber,
    alternativeEmail,
    priority: priority || 'Medium',
    attachment: req.file ? req.file.path : null,
    attachmentType: req.file ? (req.file.mimetype.includes('pdf') ? 'pdf' : 'image') : null,
  });

  // Check for overlapping leaves
  const hasOverlap = await leave.hasOverlap();
  if (hasOverlap) {
    return res.status(400).json({
      success: false,
      message: "You already have a leave request during this period",
    });
  }

  // Check leave balance
  const balance = await Leave.getLeaveBalance(teacher._id, 'teacher');
  const leaveBalance = balance[leaveType];
  
  if (leaveBalance && (leaveBalance.used + leave.totalDays > leaveBalance.total)) {
    return res.status(400).json({
      success: false,
      message: `Insufficient ${leaveType} leave balance. Available: ${leaveBalance.total - leaveBalance.used} days`,
    });
  }

  await leave.save();

  res.status(201).json({ 
    success: true, 
    data: leave,
    message: 'Leave application submitted successfully'
  });
});

/* ================= GET MY LEAVES (TEACHER/STUDENT) ================= */
exports.getMyLeaves = asyncHandler(async (req, res) => {
  let userId, userType;

  // Check if teacher
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (teacher) {
    userId = teacher._id;
    userType = 'teacher';
  } else {
    // Check if student
    const student = await Student.findOne({ userId: req.user._id });
    if (student) {
      userId = student._id;
      userType = 'student';
    }
  }

  if (!userId) {
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  const { status, leaveType, year } = req.query;

  const query = { userType };
  query[userType] = userId;

  if (status) query.status = status;
  if (leaveType) query.leaveType = leaveType;
  if (year) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    query.fromDate = { $gte: yearStart, $lte: yearEnd };
  }

  const leaves = await Leave.find(query)
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Get leave balance
  const balance = await Leave.getLeaveBalance(userId, userType);

  res.json({ 
    success: true, 
    data: leaves,
    balance,
    stats: {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'Pending').length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
    }
  });
});

/* ================= CANCEL LEAVE ================= */
exports.cancelLeave = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  if (leave.status !== 'Pending') {
    return res.status(400).json({ success: false, message: "Can only cancel pending leaves" });
  }

  leave.status = 'Cancelled';
  leave.cancelledBy = req.user._id;
  leave.cancellationReason = cancellationReason;
  leave.cancelledAt = new Date();

  await leave.save();

  res.json({ success: true, data: leave, message: 'Leave cancelled successfully' });
});

/* ================= GET LEAVE BALANCE ================= */
exports.getLeaveBalance = asyncHandler(async (req, res) => {
  let userId, userType;

  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (teacher) {
    userId = teacher._id;
    userType = 'teacher';
  } else {
    const student = await Student.findOne({ userId: req.user._id });
    if (student) {
      userId = student._id;
      userType = 'student';
    }
  }

  if (!userId) {
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  const balance = await Leave.getLeaveBalance(userId, userType);

  res.json({ success: true, data: balance });
});

/* ================= ADMIN: GET ALL LEAVES ================= */
exports.getAllLeaves = asyncHandler(async (req, res) => {
  const { status, leaveType, userType, fromDate, toDate, priority } = req.query;

  const query = {};

  if (status) query.status = status;
  if (leaveType) query.leaveType = leaveType;
  if (userType) query.userType = userType;
  if (priority) query.priority = priority;
  
  if (fromDate && toDate) {
    query.fromDate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  }

  const leaves = await Leave.find(query)
    .populate({
      path: "teacher",
      populate: { path: "userId", select: "name email" },
    })
    .populate({
      path: "student",
      populate: { path: "userId", select: "name email" },
    })
    .populate("reviewedBy", "name email")
    .populate("cancelledBy", "name")
    .sort({ priority: -1, createdAt: -1 })
    .lean();

  // Get statistics
  const stats = await Leave.getStatistics(query);

  res.json({ 
    success: true, 
    data: leaves,
    stats,
    count: leaves.length 
  });
});

/* ================= ADMIN: APPROVE/REJECT ================= */
exports.updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, adminRemark } = req.body;

  const validStatuses = ["Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  if (status === "Rejected" && !adminRemark) {
    return res.status(400).json({ success: false, message: "Remark required for rejection" });
  }

  const leave = await Leave.findById(req.params.id)
    .populate({
      path: "teacher",
      populate: { path: "userId", select: "name email" },
    })
    .populate({
      path: "student",
      populate: { path: "userId", select: "name email" },
    });

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  if (leave.status !== 'Pending') {
    return res.status(400).json({ success: false, message: "Can only update pending leaves" });
  }

  leave.status = status;
  leave.adminRemark = adminRemark;
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();

  // Add to workflow
  leave.approvalWorkflow.push({
    approver: req.user._id,
    status,
    remark: adminRemark,
    timestamp: new Date()
  });

  await leave.save();

  // TODO: Send email notification to applicant
  
  res.json({ 
    success: true, 
    data: leave,
    message: `Leave ${status.toLowerCase()} successfully`
  });
});

/* ================= ADMIN: GET LEAVE ANALYTICS ================= */
exports.getLeaveAnalytics = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear();
  
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);

  const query = {
    fromDate: { $gte: yearStart, $lte: yearEnd }
  };

  // Overall statistics
  const stats = await Leave.getStatistics(query);

  // Monthly breakdown
  const monthlyStats = await Leave.aggregate([
    { 
      $match: { 
        fromDate: { $gte: yearStart, $lte: yearEnd }
      }
    },
    {
      $group: {
        _id: { $month: '$fromDate' },
        count: { $sum: 1 },
        totalDays: { $sum: '$totalDays' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top leave applicants
  const topApplicants = await Leave.aggregate([
    { 
      $match: { 
        fromDate: { $gte: yearStart, $lte: yearEnd },
        status: 'Approved'
      }
    },
    {
      $group: {
        _id: { userType: '$userType', userId: { $ifNull: ['$teacher', '$student'] } },
        totalLeaves: { $sum: 1 },
        totalDays: { $sum: '$totalDays' }
      }
    },
    { $sort: { totalDays: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overall: stats,
      monthly: monthlyStats,
      topApplicants,
      year: currentYear
    }
  });
});