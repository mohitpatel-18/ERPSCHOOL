const mongoose = require("mongoose");

const feeComponentSchema = new mongoose.Schema({
  name: {
    type: String, // Tuition / Exam / Transport
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["monthly", "yearly", "one-time"],
    default: "monthly",
  },
});

/* ================= MAIN SCHEMA ================= */

const feeStructureSchema = new mongoose.Schema(
  {
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

    components: [feeComponentSchema],

    /* ================= PAYMENT SETTINGS ================= */

    monthlyDueDay: {
      type: Number, // Example: 5 = 5th of every month
      default: 5,
      min: 1,
      max: 28,
    },

    /* ================= LATE FINE SETTINGS ================= */

    enableLateFine: {
      type: Boolean,
      default: true,
    },

    lateFineType: {
      type: String,
      enum: ["per_day", "percentage"],
      default: "per_day",
    },

    lateFinePerDay: {
      type: Number,
      default: 10,
    },

    lateFinePercentage: {
      type: Number,
      default: 0, // Used only if type = percentage
    },

    graceDays: {
      type: Number,
      default: 3,
    },

    maxLateFine: {
      type: Number,
      default: 2000, // Maximum cap protection
    },

    fineStartMode: {
      type: String,
      enum: ["after_grace", "fixed_date"],
      default: "after_grace",
    },

    fixedFineStartDate: {
      type: Date,
    },

    roundFineToNearest: {
      type: Number,
      default: 1, // 1 = no rounding, 10 = round to nearest 10
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEX ================= */

feeStructureSchema.index(
  { class: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
