const mongoose = require("mongoose");
const FeeStructure = require("./FeeStructure");

const studentFeeLedgerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    month: {
      type: Number,
    },

    year: {
      type: Number,
    },

    components: [
      {
        name: String,
        amount: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    lateFine: {
      type: Number,
      default: 0,
    },

    balance: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paymentHistory: [
      {
        amount: Number,
        method: {
          type: String,
          enum: ["cash", "online", "cheque"],
        },
        transactionId: String,
        paidAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

/* ======================================================
   🔥 AUTO LATE FINE ENGINE (SaaS Level)
====================================================== */

studentFeeLedgerSchema.methods.calculateLateFine = async function () {
  if (this.status === "paid") return;

  const structure = await FeeStructure.findOne({
    class: this.class,
    academicYear: this.academicYear,
    isActive: true,
  });

  if (!structure || !structure.enableLateFine) return;

  const today = new Date();
  if (today <= this.dueDate) return;

  let fineStartDate = new Date(this.dueDate);

  if (structure.fineStartMode === "after_grace") {
    fineStartDate.setDate(
      fineStartDate.getDate() + structure.graceDays
    );
  } else if (
    structure.fineStartMode === "fixed_date" &&
    structure.fixedFineStartDate
  ) {
    fineStartDate = new Date(structure.fixedFineStartDate);
  }

  if (today <= fineStartDate) return;

  const diffTime = today - fineStartDate;
  const lateDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let calculatedFine = 0;

  if (structure.lateFineType === "per_day") {
    calculatedFine = lateDays * structure.lateFinePerDay;
  } else if (structure.lateFineType === "percentage") {
    calculatedFine =
      (this.totalAmount * structure.lateFinePercentage) / 100;
  }

  if (structure.maxLateFine) {
    calculatedFine = Math.min(
      calculatedFine,
      structure.maxLateFine
    );
  }

  if (structure.roundFineToNearest > 1) {
    calculatedFine =
      Math.round(
        calculatedFine / structure.roundFineToNearest
      ) * structure.roundFineToNearest;
  }

  this.lateFine = calculatedFine;
  this.balance =
    this.totalAmount + this.lateFine - this.paidAmount;

  if (this.balance > 0 && today > this.dueDate) {
    this.status = "overdue";
  }
};

/* ======================================================
   🔥 AUTO STATUS + BALANCE UPDATE BEFORE SAVE
====================================================== */

studentFeeLedgerSchema.pre("save", function (next) {
  this.balance =
    this.totalAmount + this.lateFine - this.paidAmount;

  if (this.balance <= 0) {
    this.status = "paid";
  } else if (this.paidAmount > 0) {
    this.status = "partial";
  } else if (new Date() > this.dueDate) {
    this.status = "overdue";
  } else {
    this.status = "pending";
  }

  next();
});

/* ======================================================
   🔥 SAFE PAYMENT METHOD
====================================================== */

studentFeeLedgerSchema.methods.addPayment = async function (
  amount,
  method,
  transactionId
) {
  await this.calculateLateFine();

  this.paymentHistory.push({
    amount,
    method,
    transactionId,
  });

  this.paidAmount += amount;

  await this.save();
};

studentFeeLedgerSchema.index(
  { student: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "StudentFeeLedger",
  studentFeeLedgerSchema
);
