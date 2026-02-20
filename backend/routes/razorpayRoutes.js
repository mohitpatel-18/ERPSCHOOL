const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  initiateRefund,
  handleWebhook,
} = require('../controllers/razorpayController');

/* ================= RAZORPAY ROUTES ================= */

// Create order (student can create for themselves)
router.post('/create-order', protect, authorize('student', 'admin'), createRazorpayOrder);

// Verify payment
router.post('/verify', protect, authorize('student', 'admin'), verifyRazorpayPayment);

// Get payment status
router.get('/payment/:paymentId', protect, authorize('admin'), getPaymentStatus);

// Initiate refund
router.post('/refund/:paymentId', protect, authorize('admin'), initiateRefund);

// Webhook (no auth required, signature verified in controller)
router.post('/webhook', handleWebhook);

module.exports = router;
