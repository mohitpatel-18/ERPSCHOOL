const Razorpay = require('razorpay');
const crypto = require('crypto');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/asyncHandler');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE RAZORPAY ORDER ================= */
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { studentFeeId, amount } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount',
    });
  }

  // Get student fee details
  const studentFee = await StudentFee.findById(studentFeeId)
    .populate('student')
    .populate('academicYear');

  if (!studentFee) {
    return res.status(404).json({
      success: false,
      message: 'Student fee record not found',
    });
  }

  // Create Razorpay order
  const options = {
    amount: Math.round(amount * 100), // Amount in paise
    currency: 'INR',
    receipt: `fee_${studentFeeId}_${Date.now()}`,
    notes: {
      studentFeeId: studentFeeId,
      studentId: studentFee.student._id.toString(),
      academicYear: studentFee.academicYear?.year || 'N/A',
    },
  };

  try {
    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        order,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
});

/* ================= VERIFY RAZORPAY PAYMENT ================= */
exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    studentFeeId,
  } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature',
    });
  }

  try {
    // Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // Get student fee details
    const studentFee = await StudentFee.findById(studentFeeId).populate('student');

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: 'Student fee record not found',
      });
    }

    // Calculate payment allocation
    const FeeEngineService = require('../services/feeEngineService');
    const amount = paymentDetails.amount / 100; // Convert paise to rupees

    const result = await FeeEngineService.processPayment(studentFeeId, {
      amount,
      paymentMode: paymentDetails.method || 'Online Gateway',
      paymentType: 'Online',
      paymentDate: new Date(paymentDetails.created_at * 1000),
      collectedBy: req.user.id,
      collectorName: 'Online Payment',
      gateway: 'Razorpay',
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      gatewayResponse: paymentDetails,
      status: paymentDetails.status === 'captured' ? 'Success' : 'Pending',
    });

    res.json({
      success: true,
      data: {
        payment: result.payment,
        studentFee: result.studentFee,
      },
      message: 'Payment verified and recorded successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
});

/* ================= GET PAYMENT STATUS ================= */
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentDetails = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: paymentDetails,
    });
  } catch (error) {
    console.error('Payment status fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
    });
  }
});

/* ================= INITIATE REFUND ================= */
exports.initiateRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  // Get payment record
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  if (!payment.gatewayPaymentId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot refund offline payment',
    });
  }

  try {
    // Create refund on Razorpay
    const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
      amount: Math.round(amount * 100), // Amount in paise
      notes: {
        reason: reason || 'Refund requested',
        refundedBy: req.user.id,
      },
    });

    // Update payment record
    await payment.refund(amount, reason, req.user.id);

    res.json({
      success: true,
      data: refund,
      message: 'Refund initiated successfully',
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate refund',
    });
  }
});

/* ================= WEBHOOK HANDLER ================= */
exports.handleWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload.payment.entity;

  console.log('Webhook received:', event);

  // Handle different events
  switch (event) {
    case 'payment.captured':
      // Payment successful
      console.log('Payment captured:', paymentEntity.id);
      break;

    case 'payment.failed':
      // Payment failed
      console.log('Payment failed:', paymentEntity.id);
      // TODO: Update payment status in database
      break;

    case 'refund.created':
      // Refund initiated
      console.log('Refund created:', paymentEntity.id);
      break;

    default:
      console.log('Unhandled event:', event);
  }

  res.json({ success: true });
});

module.exports = exports;
