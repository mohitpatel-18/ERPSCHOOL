const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const StudentFeeLedger = require("../models/StudentFeeLedger");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/* =====================================================
   1️⃣ CREATE ORDER (RAZORPAY)
===================================================== */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { ledgerId } = req.body;

    const ledger = await StudentFeeLedger.findById(ledgerId);

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    const options = {
      amount: ledger.balance * 100,
      currency: "INR",
      receipt: `receipt_${ledger._id}`,
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

    const ledger = await StudentFeeLedger.findById(ledgerId)
      .populate({
        path: "student",
        populate: { path: "userId", select: "name" },
      })
      .populate("class");

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    /* ===== Update Ledger ===== */
    ledger.paidAmount += ledger.balance;
    ledger.balance = 0;
    ledger.status = "paid";
    ledger.paymentHistory.push({
      amount: ledger.paidAmount,
      method: "online",
      transactionId: razorpay_payment_id,
    });

    ledger.receiptNumber = `RCPT-${Date.now()}`;
    ledger.paidDate = new Date();

    await ledger.save();

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
   3️⃣ DIRECT PAYMENT (CASH / ADMIN ENTRY)
===================================================== */
exports.payFee = async (req, res, next) => {
  try {
    const { ledgerId, amount, method } = req.body;

    const ledger = await StudentFeeLedger.findById(ledgerId);

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    if (amount > ledger.balance) {
      return res.status(400).json({
        success: false,
        message: "Amount exceeds balance",
      });
    }

    ledger.paidAmount += amount;
    ledger.balance -= amount;

    ledger.paymentHistory.push({
      amount,
      method,
      transactionId: `OFFLINE-${Date.now()}`,
    });

    if (ledger.balance === 0) {
      ledger.status = "paid";
    } else {
      ledger.status = "partial";
    }

    await ledger.save();

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};
