const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    /* ================= AUDIT TRAIL ================= */
    auditLogs: [
      {
        oldStatus: {
          type: String,
          enum: ['present', 'absent', 'late', 'half-day'],
        },
        newStatus: {
          type: String,
          enum: ['present', 'absent', 'late', 'half-day'],
        },
        reason: {
          type: String,
          required: true,
          trim: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Teacher',
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   INDEXES (Performance + Safety)
===================================================== */

// Prevent duplicate attendance per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Fast class + date queries (reports / dashboard)
attendanceSchema.index({ class: 1, date: 1 });

// Fast student attendance history queries
attendanceSchema.index({ student: 1, createdAt: -1 });

// Performance optimization for 1000+ students
attendanceSchema.index({ date: 1, status: 1 }); // For daily reports
attendanceSchema.index({ class: 1, date: 1, status: 1 }); // For class-wise reports

module.exports = mongoose.model('Attendance', attendanceSchema);
