const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const {
  // Fee Template
  createFeeTemplate,
  getAllFeeTemplates,
  getFeeTemplate,
  updateFeeTemplate,
  deleteFeeTemplate,
  
  // Student Fee
  assignFeeToStudent,
  bulkAssignFee,
  assignFeeToClass,
  getAllStudentFees,
  getStudentFee,
  updateStudentFee,
  
  // Payment
  recordPayment,
  getAllPayments,
  getPayment,
  approvePayment,
  rejectPayment,
  
  // Discount & Concession
  applyDiscount,
  waiveFee,
  
  // Reports & Analytics
  getCollectionSummary,
  getOverdueStudents,
  getDefaulters,
  generateFeeReport,
  getDailyCollection,
  getCollectorSummary,
  calculateLateFees,
  sendFeeReminders,
} = require('../controllers/feeController');

/* ================= FEE TEMPLATE ROUTES ================= */
router.route('/templates')
  .get(protect, authorize('admin'), getAllFeeTemplates)
  .post(protect, authorize('admin'), createFeeTemplate);

router.route('/templates/:id')
  .get(protect, authorize('admin'), getFeeTemplate)
  .put(protect, authorize('admin'), updateFeeTemplate)
  .delete(protect, authorize('admin'), deleteFeeTemplate);

/* ================= STUDENT FEE ASSIGNMENT ================= */
router.post('/assign', protect, authorize('admin'), assignFeeToStudent);
router.post('/assign/bulk', protect, authorize('admin'), bulkAssignFee);
router.post('/assign/class', protect, authorize('admin'), assignFeeToClass);

/* ================= STUDENT FEE MANAGEMENT ================= */
router.route('/student-fees')
  .get(protect, authorize('admin'), getAllStudentFees);

router.route('/student-fees/:id')
  .get(protect, authorize('admin', 'student'), getStudentFee)
  .put(protect, authorize('admin'), updateStudentFee);

/* ================= PAYMENT ROUTES ================= */
router.route('/payments')
  .get(protect, authorize('admin'), getAllPayments)
  .post(protect, authorize('admin'), recordPayment);

router.route('/payments/:id')
  .get(protect, authorize('admin'), getPayment);

router.put('/payments/:id/approve', protect, authorize('admin'), approvePayment);
router.put('/payments/:id/reject', protect, authorize('admin'), rejectPayment);

/* ================= DISCOUNT & CONCESSION ================= */
router.post('/discount', protect, authorize('admin'), applyDiscount);
router.post('/waive', protect, authorize('admin'), waiveFee);

/* ================= REPORTS & ANALYTICS ================= */
router.get('/reports/summary', protect, authorize('admin'), getCollectionSummary);
router.get('/reports/overdue', protect, authorize('admin'), getOverdueStudents);
router.get('/reports/defaulters', protect, authorize('admin'), getDefaulters);
router.get('/reports/full', protect, authorize('admin'), generateFeeReport);
router.get('/reports/daily', protect, authorize('admin'), getDailyCollection);
router.get('/reports/collectors', protect, authorize('admin'), getCollectorSummary);

/* ================= UTILITIES ================= */
router.post('/calculate-late-fees', protect, authorize('admin'), calculateLateFees);
router.post('/send-reminders', protect, authorize('admin'), sendFeeReminders);

module.exports = router;
