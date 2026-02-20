const FeeTemplate = require('../models/FeeTemplate');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const FeeEngineService = require('../services/feeEngineService');
const asyncHandler = require('../middleware/asyncHandler');

/* ================= FEE TEMPLATE MANAGEMENT ================= */

// Create Fee Template
exports.createFeeTemplate = asyncHandler(async (req, res) => {
  const template = await FeeTemplate.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: template,
    message: 'Fee template created successfully',
  });
});

// Get All Fee Templates
exports.getAllFeeTemplates = asyncHandler(async (req, res) => {
  const { academicYear, class: classId, isActive } = req.query;
  
  const query = {};
  if (academicYear) query.academicYear = academicYear;
  if (classId) query.class = classId;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const templates = await FeeTemplate.find(query)
    .populate('class', 'name section')
    .populate('academicYear', 'year name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: templates.length,
    data: templates,
  });
});

// Get Single Fee Template
exports.getFeeTemplate = asyncHandler(async (req, res) => {
  const template = await FeeTemplate.findById(req.params.id)
    .populate('class', 'name section')
    .populate('academicYear', 'year name')
    .populate('createdBy', 'name email');

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Fee template not found',
    });
  }

  res.json({
    success: true,
    data: template,
  });
});

// Update Fee Template
exports.updateFeeTemplate = asyncHandler(async (req, res) => {
  let template = await FeeTemplate.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Fee template not found',
    });
  }

  template = await FeeTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: template,
    message: 'Fee template updated successfully',
  });
});

// Delete Fee Template
exports.deleteFeeTemplate = asyncHandler(async (req, res) => {
  const template = await FeeTemplate.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Fee template not found',
    });
  }

  // Check if assigned to any students
  const assignedCount = await StudentFee.countDocuments({ feeTemplate: req.params.id });
  
  if (assignedCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete. Template is assigned to ${assignedCount} students. Please deactivate instead.`,
    });
  }

  await template.deleteOne();

  res.json({
    success: true,
    message: 'Fee template deleted successfully',
  });
});

/* ================= STUDENT FEE MANAGEMENT ================= */

// Assign Fee to Single Student
exports.assignFeeToStudent = asyncHandler(async (req, res) => {
  const { studentId, feeTemplateId, selectedComponents, appliedDiscounts, installmentPlan, notes } = req.body;

  const studentFee = await FeeEngineService.assignFeeToStudent(studentId, feeTemplateId, {
    selectedComponents,
    appliedDiscounts,
    installmentPlan,
    notes,
    assignedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: studentFee,
    message: 'Fee assigned successfully',
  });
});

// Bulk Assign Fee
exports.bulkAssignFee = asyncHandler(async (req, res) => {
  const { studentIds, feeTemplateId, selectedComponents, appliedDiscounts, installmentPlan } = req.body;

  const results = await FeeEngineService.bulkAssignFee(studentIds, feeTemplateId, {
    selectedComponents,
    appliedDiscounts,
    installmentPlan,
    assignedBy: req.user.id,
  });

  res.json({
    success: true,
    data: results,
    message: `Fee assigned to ${results.success.length} students. ${results.failed.length} failed.`,
  });
});

// Assign Fee to Entire Class
exports.assignFeeToClass = asyncHandler(async (req, res) => {
  const { classId, feeTemplateId, selectedComponents, appliedDiscounts, installmentPlan } = req.body;

  const students = await Student.find({ class: classId, isActive: true });
  const studentIds = students.map(s => s._id);

  const results = await FeeEngineService.bulkAssignFee(studentIds, feeTemplateId, {
    selectedComponents,
    appliedDiscounts,
    installmentPlan,
    assignedBy: req.user.id,
  });

  res.json({
    success: true,
    data: results,
    message: `Fee assigned to ${results.success.length} students in class. ${results.failed.length} failed.`,
  });
});

// Get All Student Fees
exports.getAllStudentFees = asyncHandler(async (req, res) => {
  const { academicYear, class: classId, status, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const query = { isActive: true };
  if (academicYear) query.academicYear = academicYear;
  if (classId) query.class = classId;
  if (status) query.overallStatus = status;

  let studentFees = await StudentFee.find(query)
    .populate('student', 'firstName lastName rollNumber studentId')
    .populate('class', 'name section')
    .populate('feeTemplate', 'templateName')
    .lean()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Search filter
  if (search) {
    studentFees = studentFees.filter(sf => {
      const fullName = `${sf.student.firstName} ${sf.student.lastName}`.toLowerCase();
      const rollNumber = sf.student.rollNumber?.toLowerCase() || '';
      const studentId = sf.student.studentId?.toLowerCase() || '';
      const searchTerm = search.toLowerCase();
      
      return fullName.includes(searchTerm) || 
             rollNumber.includes(searchTerm) || 
             studentId.includes(searchTerm);
    });
  }

  const total = await StudentFee.countDocuments(query);

  res.json({
    success: true,
    count: studentFees.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: studentFees,
  });
});

// Get Single Student Fee
exports.getStudentFee = asyncHandler(async (req, res) => {
  const studentFee = await StudentFee.findById(req.params.id)
    .populate('student')
    .populate('class', 'name section')
    .populate('feeTemplate')
    .populate('appliedDiscounts.appliedBy', 'name')
    .populate('assignedBy', 'name');

  if (!studentFee) {
    return res.status(404).json({
      success: false,
      message: 'Student fee record not found',
    });
  }

  // Get payment history
  const payments = await Payment.find({ studentFee: req.params.id })
    .populate('collectedBy', 'name')
    .sort({ paymentDate: -1 });

  res.json({
    success: true,
    data: {
      studentFee,
      payments,
    },
  });
});

// Update Student Fee
exports.updateStudentFee = asyncHandler(async (req, res) => {
  let studentFee = await StudentFee.findById(req.params.id);

  if (!studentFee) {
    return res.status(404).json({
      success: false,
      message: 'Student fee record not found',
    });
  }

  studentFee = await StudentFee.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastModifiedBy: req.user.id },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: studentFee,
    message: 'Student fee updated successfully',
  });
});

/* ================= PAYMENT MANAGEMENT ================= */

// Record Payment (Offline)
exports.recordPayment = asyncHandler(async (req, res) => {
  const { studentFeeId, amount, paymentMode, paymentDate, remarks, ...otherDetails } = req.body;

  const result = await FeeEngineService.processPayment(studentFeeId, {
    amount,
    paymentMode,
    paymentType: 'Offline',
    paymentDate: paymentDate || new Date(),
    collectedBy: req.user.id,
    collectorName: req.user.name,
    remarks,
    ...otherDetails,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Payment recorded successfully',
  });
});

// Get All Payments
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { academicYear, studentId, fromDate, toDate, status, paymentMode } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };
  if (academicYear) query.academicYear = academicYear;
  if (studentId) query.student = studentId;
  if (status) query.status = status;
  if (paymentMode) query.paymentMode = paymentMode;
  
  if (fromDate || toDate) {
    query.paymentDate = {};
    if (fromDate) query.paymentDate.$gte = new Date(fromDate);
    if (toDate) query.paymentDate.$lte = new Date(toDate);
  }

  const payments = await Payment.find(query)
    .populate('student', 'firstName lastName rollNumber studentId')
    .populate('collectedBy', 'name')
    .populate('approvedBy', 'name')
    .lean()
    .skip(skip)
    .limit(limit)
    .sort({ paymentDate: -1 });

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    count: payments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: payments,
  });
});

// Get Single Payment
exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('student')
    .populate('studentFee')
    .populate('collectedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  res.json({
    success: true,
    data: payment,
  });
});

// Approve Payment
exports.approvePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  payment.approvalStatus = 'Approved';
  payment.approvedBy = req.user.id;
  payment.approvalDate = new Date();
  await payment.save();

  res.json({
    success: true,
    data: payment,
    message: 'Payment approved successfully',
  });
});

// Reject Payment
exports.rejectPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  payment.approvalStatus = 'Rejected';
  payment.rejectionReason = reason;
  payment.approvedBy = req.user.id;
  payment.approvalDate = new Date();
  await payment.save();

  res.json({
    success: true,
    data: payment,
    message: 'Payment rejected',
  });
});

/* ================= DISCOUNT & CONCESSION ================= */

// Apply Discount to Student
exports.applyDiscount = asyncHandler(async (req, res) => {
  const { studentFeeId, discountName, discountType, amount, remarks } = req.body;

  const studentFee = await FeeEngineService.applyDiscount(studentFeeId, {
    name: discountName,
    type: discountType,
    amount,
    appliedBy: req.user.id,
    remarks,
  });

  res.json({
    success: true,
    data: studentFee,
    message: 'Discount applied successfully',
  });
});

// Waive Fee
exports.waiveFee = asyncHandler(async (req, res) => {
  const { studentFeeId, amount, reason } = req.body;

  const studentFee = await FeeEngineService.waiveFee(studentFeeId, {
    amount,
    reason,
    approvedBy: req.user.id,
  });

  res.json({
    success: true,
    data: studentFee,
    message: 'Fee waived successfully',
  });
});

/* ================= REPORTS & ANALYTICS ================= */

// Get Collection Summary
exports.getCollectionSummary = asyncHandler(async (req, res) => {
  const { academicYear, class: classId, fromDate, toDate } = req.query;

  const filters = {};
  if (academicYear) filters.academicYear = academicYear;
  if (classId) filters.class = classId;
  if (fromDate || toDate) {
    filters.createdAt = {};
    if (fromDate) filters.createdAt.$gte = new Date(fromDate);
    if (toDate) filters.createdAt.$lte = new Date(toDate);
  }

  const summary = await FeeEngineService.getCollectionSummary(filters);

  res.json({
    success: true,
    data: summary,
  });
});

// Get Overdue Students
exports.getOverdueStudents = asyncHandler(async (req, res) => {
  const { academicYear, class: classId } = req.query;

  const filters = {};
  if (academicYear) filters.academicYear = academicYear;
  if (classId) filters.class = classId;

  const overdueStudents = await FeeEngineService.getOverdueStudents(filters);

  res.json({
    success: true,
    count: overdueStudents.length,
    data: overdueStudents,
  });
});

// Get Defaulters
exports.getDefaulters = asyncHandler(async (req, res) => {
  const daysOverdue = parseInt(req.query.days) || 30;

  const defaulters = await FeeEngineService.getDefaulters(daysOverdue);

  res.json({
    success: true,
    count: defaulters.length,
    data: defaulters,
  });
});

// Generate Fee Report
exports.generateFeeReport = asyncHandler(async (req, res) => {
  const { academicYear, class: classId } = req.query;

  const filters = {};
  if (academicYear) filters.academicYear = academicYear;
  if (classId) filters.class = classId;

  const report = await FeeEngineService.generateFeeReport(filters);

  res.json({
    success: true,
    data: report,
  });
});

// Get Daily Collection Report
exports.getDailyCollection = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();

  const payments = await Payment.getDailyCollection(date);
  const summary = await Payment.getPaymentSummary({
    paymentDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999)),
    }
  });

  res.json({
    success: true,
    data: {
      date,
      payments,
      summary,
    },
  });
});

// Get Collector-wise Summary
exports.getCollectorSummary = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;

  const filters = {};
  if (fromDate || toDate) {
    filters.paymentDate = {};
    if (fromDate) filters.paymentDate.$gte = new Date(fromDate);
    if (toDate) filters.paymentDate.$lte = new Date(toDate);
  }

  const summary = await Payment.getCollectorSummary(filters);

  res.json({
    success: true,
    data: summary,
  });
});

// Calculate Late Fees
exports.calculateLateFees = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;

  const result = await FeeEngineService.calculateAllLateFees(academicYear);

  res.json({
    success: true,
    data: result,
    message: `Late fees calculated for ${result.updated} students`,
  });
});

// Send Fee Reminders
exports.sendFeeReminders = asyncHandler(async (req, res) => {
  const daysBeforeDue = parseInt(req.query.days) || 7;

  const reminders = await FeeEngineService.sendFeeReminders(daysBeforeDue);

  res.json({
    success: true,
    count: reminders.length,
    data: reminders,
    message: `Reminders sent to ${reminders.length} students`,
  });
});

module.exports = exports;
