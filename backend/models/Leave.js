const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    // Support both teacher and student leaves
    userType: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      index: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },

    leaveType: {
      type: String,
      enum: ["Sick", "Casual", "Emergency", "Maternity", "Paternity", "Bereavement", "Medical", "Personal", "Other"],
      required: true,
      index: true,
    },

    fromDate: {
      type: Date,
      required: true,
      index: true,
    },

    toDate: {
      type: Date,
      required: true,
      index: true,
    },

    halfDay: {
      type: Boolean,
      default: false,
    },

    session: {
      type: String,
      enum: ["First Half", "Second Half", "Full Day"],
      default: "Full Day",
    },

    totalDays: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    attachment: {
      type: String, // Cloudinary URL
    },

    attachmentType: {
      type: String,
      enum: ["image", "pdf", "document"],
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    alternativeEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    adminRemark: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    // New: Workflow and history
    approvalWorkflow: [
      {
        approver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
        },
        remark: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Notification tracking
    notificationSent: {
      type: Boolean,
      default: false,
    },

    // Cancellation
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancellationReason: {
      type: String,
      trim: true,
    },

    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
// Fast queries by teacher and status
leaveSchema.index({ teacher: 1, status: 1 });
leaveSchema.index({ student: 1, status: 1 });

// Fast date range queries
leaveSchema.index({ fromDate: 1, toDate: 1 });

// Fast pending leaves lookup
leaveSchema.index({ status: 1, createdAt: -1 });

// User type and status
leaveSchema.index({ userType: 1, status: 1 });

/* ================= VIRTUAL FIELDS ================= */
leaveSchema.virtual('applicant', {
  ref: function() {
    return this.userType === 'teacher' ? 'Teacher' : 'Student';
  },
  localField: function() {
    return this.userType === 'teacher' ? 'teacher' : 'student';
  },
  foreignField: '_id',
  justOne: true
});

/* ================= INSTANCE METHODS ================= */
// Calculate working days (excluding weekends)
leaveSchema.methods.calculateWorkingDays = function() {
  const start = new Date(this.fromDate);
  const end = new Date(this.toDate);
  let workingDays = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) { // Not Sunday or Saturday
      workingDays++;
    }
  }
  
  if (this.halfDay) {
    return workingDays - 0.5;
  }
  
  return workingDays;
};

// Check if leave overlaps with another
leaveSchema.methods.hasOverlap = async function() {
  const query = {
    _id: { $ne: this._id },
    status: { $ne: 'Rejected' },
    $or: [
      { fromDate: { $lte: this.toDate }, toDate: { $gte: this.fromDate } }
    ]
  };

  if (this.userType === 'teacher') {
    query.teacher = this.teacher;
  } else {
    query.student = this.student;
  }

  const overlap = await this.constructor.findOne(query);
  return !!overlap;
};

/* ================= STATIC METHODS ================= */
// Get leave balance for a user
leaveSchema.statics.getLeaveBalance = async function(userId, userType) {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);

  const query = {
    userType,
    status: 'Approved',
    fromDate: { $gte: yearStart, $lte: yearEnd }
  };

  if (userType === 'teacher') {
    query.teacher = userId;
  } else {
    query.student = userId;
  }

  const leaves = await this.find(query);
  
  const balance = {
    Sick: { used: 0, total: 10 },
    Casual: { used: 0, total: 12 },
    Emergency: { used: 0, total: 5 },
    Maternity: { used: 0, total: 90 },
    Paternity: { used: 0, total: 15 },
    Medical: { used: 0, total: 10 },
    Personal: { used: 0, total: 5 },
    Other: { used: 0, total: 0 }
  };

  leaves.forEach(leave => {
    if (balance[leave.leaveType]) {
      balance[leave.leaveType].used += leave.totalDays;
    }
  });

  return balance;
};

// Get leave statistics
leaveSchema.statics.getStatistics = async function(filters = {}) {
  const stats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDays: { $sum: '$totalDays' }
      }
    }
  ]);

  const typeStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$leaveType',
        count: { $sum: 1 },
        totalDays: { $sum: '$totalDays' }
      }
    }
  ]);

  return { statusStats: stats, typeStats };
};

/* ================= HOOKS ================= */
// Before save: calculate total days
leaveSchema.pre('save', function(next) {
  if (this.isModified('fromDate') || this.isModified('toDate')) {
    const days = this.calculateWorkingDays();
    this.totalDays = days;
  }
  next();
});

// After save: send notification
leaveSchema.post('save', async function(doc) {
  if (!doc.notificationSent && doc.status === 'Pending') {
    // TODO: Send email notification
    // await sendLeaveNotification(doc);
    doc.notificationSent = true;
    await doc.save();
  }
});

module.exports = mongoose.model("Leave", leaveSchema);
