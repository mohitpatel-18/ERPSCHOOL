const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Example: 2025-26
      unique: true,
      trim: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
// Fast query for current active year
academicYearSchema.index({ isCurrent: 1, isActive: 1 });

/* ================= ENSURE ONLY ONE CURRENT YEAR ================= */
academicYearSchema.pre('save', async function(next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    // Set all other years to not current
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

module.exports = mongoose.model("AcademicYear", academicYearSchema);
