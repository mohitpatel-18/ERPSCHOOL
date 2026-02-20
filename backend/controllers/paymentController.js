const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const StudentFee = require("../models/StudentFee");
const Payment = require("../models/Payment");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/* =====================================================
   1️⃣ CREATE ORDER (RAZORPAY) - Updated for new system
===================================================== */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { studentFeeId, amount } = req.body;

    const studentFee = await StudentFee.findById(studentFeeId);

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${studentFee._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        order,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   2️⃣ VERIFY PAYMENT
===================================================== */
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      ledgerId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // This is now handled by razorpayController.js
    // For backward compatibility, redirect
    res.status(410).json({
      success: false,
      message: "This endpoint is deprecated. Use /api/fees/payments/razorpay/verify instead",
    });

    /* ===== Generate Receipt PDF ===== */
    const receiptDir = path.join(__dirname, "../receipts");

    if (!fs.existsSync(receiptDir)) {
      fs.mkdirSync(receiptDir);
    }

    const filePath = path.join(
      receiptDir,
      `${ledger.receiptNumber}.pdf`
    );

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("School Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Receipt No: ${ledger.receiptNumber}`);
    doc.text(`Student: ${ledger.student.userId.name}`);
    doc.text(`Class: ${ledger.class.name} ${ledger.class.section}`);
    doc.text(`Total Amount: ₹${ledger.totalAmount}`);
    doc.text(`Paid Amount: ₹${ledger.paidAmount}`);
    doc.text(`Payment ID: ${razorpay_payment_id}`);
    doc.text(`Date: ${ledger.paidDate}`);
    doc.end();

    res.status(200).json({
      success: true,
      message: "Payment successful",
      receipt: `/receipts/${ledger.receiptNumber}.pdf`,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   3️⃣ DIRECT PAYMENT (CASH / ADMIN ENTRY) - Updated
===================================================== */
exports.payFee = async (req, res, next) => {
  try {
    // This is now handled by feeController.js recordPayment
    // Redirect to new endpoint
    res.status(410).json({
      success: false,
      message: "This endpoint is deprecated. Use /api/fees/payments instead",
    });
  } catch (error) {
    next(error);
  }
};
