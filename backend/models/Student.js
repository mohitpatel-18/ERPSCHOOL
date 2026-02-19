const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },

    rollNumber: {
      type: Number,
      required: true,
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    bloodGroup: String,

    /* ================= PARENT INFO ================= */
    parentName: String,
    parentPhone: String,
    parentEmail: String,

    /* ================= ADDRESS ================= */
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    admissionDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= COMPOUND INDEX ================= */
// Prevent duplicate roll numbers in same class
studentSchema.index({ class: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
