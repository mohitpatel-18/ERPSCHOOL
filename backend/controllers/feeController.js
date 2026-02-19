const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const StudentFeeLedger = require("../models/StudentFeeLedger");
/* ======================================================
   0️⃣ CREATE FEE STRUCTURE
====================================================== */
exports.createFeeStructure = async (req, res, next) => {
  try {
    const {
      class: classId,
      academicYear,
      components,
      lateFinePerDay,
      graceDays,
    } = req.body;

    // ✅ Basic validation
    if (!classId || !academicYear || !components || components.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Class, Academic Year and Components are required",
      });
    }

    // ✅ Prevent duplicate
    const existing = await FeeStructure.findOne({
      class: classId,
      academicYear,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Fee structure already exists for this class & year",
      });
    }

    // ✅ Create new structure
    const structure = await FeeStructure.create({
      class: classId,
      academicYear,
      components,
      lateFinePerDay,
      graceDays,
    });

    res.status(201).json({
      success: true,
      message: "Fee structure created successfully 🚀",
      data: structure,
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   1️⃣ CREATE MONTHLY LEDGER FOR STUDENT
====================================================== */
exports.generateMonthlyLedger = async (req, res, next) => {
  try {
    const { classId, academicYearId, month, year } = req.body;

    if (!classId || !academicYearId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // 1️⃣ Get Fee Structure
    const structure = await FeeStructure.findOne({
      class: classId,
      academicYear: academicYearId,
      isActive: true,
    });

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    // 2️⃣ Get all active students of class
    const students = await Student.find({
      class: classId,
      status: "active",
    });

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No students found in this class",
      });
    }

    const createdLedgers = [];

    for (let student of students) {
      // prevent duplicate
      const existing = await StudentFeeLedger.findOne({
        student: student._id,
        month,
        year,
      });

      if (existing) continue;

      const components = structure.components.map((c) => ({
        name: c.name,
        amount: c.amount,
      }));

      const totalAmount = components.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      const dueDate = new Date(year, month - 1, 5);

      const ledger = await StudentFeeLedger.create({
        student: student._id,
        class: classId,
        academicYear: academicYearId,
        month,
        year,
        components,
        totalAmount,
        balance: totalAmount,
        dueDate,
      });

      createdLedgers.push(ledger);
    }

    res.status(201).json({
      success: true,
      message: `${createdLedgers.length} ledgers generated`,
      data: createdLedgers,
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   2️⃣ GET STUDENT LEDGER
====================================================== */

exports.getStudentLedger = async (req, res, next) => {
  try {
    const ledger = await StudentFeeLedger.find({
      student: req.params.studentId,
    }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   3️⃣ ADMIN RECORD MANUAL PAYMENT
====================================================== */

exports.recordManualPayment = async (req, res, next) => {
  try {
    const { ledgerId } = req.params;
    const { amount, method } = req.body;

    const ledger = await StudentFeeLedger.findById(ledgerId);

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    await ledger.addPayment(amount, method, "MANUAL");

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   4️⃣ AUTO APPLY LATE FINE (ADMIN TRIGGER)
====================================================== */

exports.applyLateFine = async (req, res, next) => {
  try {
    const ledgers = await StudentFeeLedger.find({
      status: { $ne: "paid" },
    });

    for (let ledger of ledgers) {
      await ledger.calculateLateFine();
      await ledger.save();
    }

    res.status(200).json({
      success: true,
      message: "Late fine applied to pending ledgers",
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   5️⃣ GET CLASS COLLECTION REPORT
====================================================== */

exports.getClassCollectionReport = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const report = await StudentFeeLedger.aggregate([
      { $match: { class: require("mongoose").Types.ObjectId(classId) } },
      {
        $group: {
          _id: "$class",
          totalCollected: { $sum: "$paidAmount" },
          totalPending: { $sum: "$balance" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
const mongoose = require("mongoose");

/* ======================================================
   6️⃣ ADMIN SUMMARY
====================================================== */

exports.getAdminFeeSummary = async (req, res, next) => {
  try {
    const result = await StudentFeeLedger.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$paidAmount" },
          totalPending: { $sum: "$balance" },
          totalFees: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result[0] || {
        totalCollected: 0,
        totalPending: 0,
        totalFees: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   7️⃣ MONTHLY COLLECTION TREND
====================================================== */

exports.getFeeTrend = async (req, res, next) => {
  try {
    const trend = await StudentFeeLedger.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          collected: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   8️⃣ RECENT PAYMENTS
====================================================== */

exports.getRecentPayments = async (req, res, next) => {
  try {
    const payments = await StudentFeeLedger.find({
      paidAmount: { $gt: 0 },
    })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name" },
      })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
