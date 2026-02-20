const mongoose = require("mongoose");

/* ================= FEE INSTALLMENT SUB-SCHEMA ================= */
const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true,
  },
  installmentName: {
    type: String, // "Q1 2024", "April 2024", etc.
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Waived'],
    default: 'Pending',
  },
  paidOn: Date,
  paymentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  }],
});

/* ================= COMPONENT FEE BREAKDOWN ================= */
const componentFeeSchema = new mongoose.Schema({
  componentName: {
    type: String,
    required: true,
  },
  baseAmount: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'One-Time'],
  },
  isOptional: {
    type: Boolean,
    default: false,
  },
});

/* ================= APPLIED DISCOUNT DETAILS ================= */
const appliedDiscountSchema = new mongoose.Schema({
  discountName: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['Sibling Discount', 'Merit Scholarship', 'Sports Quota', 'Staff Child', 'Financial Aid', 'Early Bird', 'Custom'],
  },
  amount: {
    type: Number,
    required: true,
  },
  appliedOn: {
    type: Date,
    default: Date.now,
  },
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: String,
});

/* ================= MAIN STUDENT FEE SCHEMA ================= */
const studentFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    feeTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeTemplate",
      required: true,
    },

    /* ================= FEE BREAKDOWN ================= */
    componentFees: [componentFeeSchema],

    /* ================= INSTALLMENT PLAN ================= */
    installmentPlan: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'One-Time'],
      required: true,
    },

    installments: [installmentSchema],

    /* ================= AMOUNTS ================= */
    totalFeeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    netFeeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalLateFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },

    /* ================= DISCOUNTS ================= */
    appliedDiscounts: [appliedDiscountSchema],

    /* ================= CONCESSIONS & WAIVERS ================= */
    concessionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    concessionReason: String,

    concessionApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    concessionApprovedOn: Date,

    /* ================= STATUS ================= */
    overallStatus: {
      type: String,
      enum: ['Not Started', 'Partially Paid', 'Paid', 'Overdue', 'Waived', 'Cancelled'],
      default: 'Not Started',
      index: true,
    },

    /* ================= PAYMENT TRACKING ================= */
    lastPaymentDate: Date,

    nextDueDate: Date,

    nextDueAmount: {
      type: Number,
      default: 0,
    },

    /* ================= REMINDER & NOTIFICATIONS ================= */
    remindersSent: {
      type: Number,
      default: 0,
    },

    lastReminderDate: Date,

    /* ================= ADDITIONAL INFO ================= */
    isTransportIncluded: {
      type: Boolean,
      default: false,
    },

    transportRoute: {
      type: String,
    },

    isHostelIncluded: {
      type: Boolean,
      default: false,
    },

    specialNotes: {
      type: String,
      maxlength: 1000,
    },

    /* ================= METADATA ================= */
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    assignedOn: {
      type: Date,
      default: Date.now,
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

/* ================= INDEXES ================= */
studentFeeSchema.index({ student: 1, academicYear: 1 }, { unique: true });
studentFeeSchema.index({ class: 1, academicYear: 1 });
studentFeeSchema.index({ overallStatus: 1, nextDueDate: 1 });
studentFeeSchema.index({ academicYear: 1, isActive: 1 });
// Payment tracking optimization
studentFeeSchema.index({ student: 1, lastPaymentDate: -1 });

/* ================= VIRTUAL FIELDS ================= */
studentFeeSchema.virtual('paymentPercentage').get(function() {
  if (this.netFeeAmount === 0) return 100;
  return ((this.totalPaid / this.netFeeAmount) * 100).toFixed(2);
});

studentFeeSchema.virtual('isDueToday').get(function() {
  if (!this.nextDueDate) return false;
  const today = new Date().setHours(0, 0, 0, 0);
  const dueDate = new Date(this.nextDueDate).setHours(0, 0, 0, 0);
  return today === dueDate;
});

studentFeeSchema.virtual('isOverdue').get(function() {
  if (!this.nextDueDate) return false;
  const today = new Date().setHours(0, 0, 0, 0);
  const dueDate = new Date(this.nextDueDate).setHours(0, 0, 0, 0);
  return today > dueDate && this.balance > 0;
});

studentFeeSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const dueDate = new Date(this.nextDueDate);
  const diffTime = today - dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/* ================= INSTANCE METHODS ================= */

// Update balance and status
studentFeeSchema.methods.updateBalance = function() {
  this.balance = this.netFeeAmount + this.totalLateFee - this.totalPaid - this.concessionAmount;
  
  if (this.balance <= 0) {
    this.overallStatus = 'Paid';
  } else if (this.totalPaid > 0) {
    this.overallStatus = 'Partially Paid';
  } else if (this.isOverdue) {
    this.overallStatus = 'Overdue';
  } else {
    this.overallStatus = 'Not Started';
  }
  
  return this.balance;
};

// Calculate late fee based on template settings
studentFeeSchema.methods.calculateLateFee = async function() {
  const FeeTemplate = mongoose.model('FeeTemplate');
  const template = await FeeTemplate.findById(this.feeTemplate);
  
  if (!template || !template.lateFeeSettings.enabled) {
    return 0;
  }

  let totalLateFee = 0;
  const today = new Date();
  
  this.installments.forEach(installment => {
    if (installment.status !== 'Paid' && installment.status !== 'Waived') {
      const dueDate = new Date(installment.dueDate);
      const gracePeriodEnd = new Date(dueDate);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + template.lateFeeSettings.graceDays);
      
      if (today > gracePeriodEnd) {
        const overdueAmount = installment.amount - installment.paidAmount;
        let lateFee = 0;
        
        if (template.lateFeeSettings.type === 'Per Day') {
          const daysOverdue = Math.floor((today - gracePeriodEnd) / (1000 * 60 * 60 * 24));
          lateFee = daysOverdue * template.lateFeeSettings.amountPerDay;
        } else if (template.lateFeeSettings.type === 'Flat') {
          lateFee = template.lateFeeSettings.flatAmount;
        } else if (template.lateFeeSettings.type === 'Percentage') {
          lateFee = (overdueAmount * template.lateFeeSettings.percentage) / 100;
        }
        
        // Apply max cap
        if (lateFee > template.lateFeeSettings.maxLateFee) {
          lateFee = template.lateFeeSettings.maxLateFee;
        }
        
        installment.lateFee = lateFee;
        totalLateFee += lateFee;
      }
    }
  });
  
  this.totalLateFee = totalLateFee;
  return totalLateFee;
};

// Get next pending installment
studentFeeSchema.methods.getNextPendingInstallment = function() {
  const pending = this.installments
    .filter(i => i.status === 'Pending' || i.status === 'Partially Paid' || i.status === 'Overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return pending.length > 0 ? pending[0] : null;
};

// Update next due date and amount
studentFeeSchema.methods.updateNextDue = function() {
  const nextInstallment = this.getNextPendingInstallment();
  
  if (nextInstallment) {
    this.nextDueDate = nextInstallment.dueDate;
    this.nextDueAmount = nextInstallment.amount - nextInstallment.paidAmount + nextInstallment.lateFee;
  } else {
    this.nextDueDate = null;
    this.nextDueAmount = 0;
  }
};

/* ================= STATIC METHODS ================= */

// Get overdue students
studentFeeSchema.statics.getOverdueStudents = function(filters = {}) {
  const query = {
    overallStatus: { $in: ['Overdue', 'Partially Paid'] },
    balance: { $gt: 0 },
    nextDueDate: { $lt: new Date() },
    isActive: true,
    ...filters,
  };
  
  return this.find(query)
    .populate('student', 'firstName lastName rollNumber studentId contactNumber parentContact')
    .populate('class', 'name section')
    .sort({ nextDueDate: 1 });
};

// Get collection summary
studentFeeSchema.statics.getCollectionSummary = async function(filters = {}) {
  const match = { isActive: true, ...filters };
  
  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        totalFeeAmount: { $sum: '$netFeeAmount' },
        totalCollected: { $sum: '$totalPaid' },
        totalPending: { $sum: '$balance' },
        totalLateFee: { $sum: '$totalLateFee' },
        totalDiscount: { $sum: '$totalDiscount' },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$overallStatus', 'Paid'] }, 1, 0] }
        },
        overdueCount: {
          $sum: { $cond: [{ $eq: ['$overallStatus', 'Overdue'] }, 1, 0] }
        },
        partialCount: {
          $sum: { $cond: [{ $eq: ['$overallStatus', 'Partially Paid'] }, 1, 0] }
        },
      }
    }
  ]);
  
  return summary.length > 0 ? summary[0] : {};
};

// Get defaulter list
studentFeeSchema.statics.getDefaulters = function(daysOverdue = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
  
  return this.find({
    overallStatus: { $in: ['Overdue', 'Partially Paid'] },
    balance: { $gt: 0 },
    nextDueDate: { $lt: cutoffDate },
    isActive: true,
  })
  .populate('student', 'firstName lastName rollNumber contactNumber parentContact')
  .populate('class', 'name section')
  .sort({ nextDueDate: 1 });
};

/* ================= HOOKS ================= */

// Before save: update balance and next due
studentFeeSchema.pre('save', function(next) {
  this.updateBalance();
  this.updateNextDue();
  next();
});

// After save: update installment statuses
studentFeeSchema.post('save', function(doc) {
  doc.installments.forEach(installment => {
    const remaining = installment.amount - installment.paidAmount;
    
    if (remaining <= 0) {
      installment.status = 'Paid';
    } else if (installment.paidAmount > 0) {
      installment.status = 'Partially Paid';
    } else if (new Date() > new Date(installment.dueDate)) {
      installment.status = 'Overdue';
    } else {
      installment.status = 'Pending';
    }
  });
});

studentFeeSchema.set('toJSON', { virtuals: true });
studentFeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("StudentFee", studentFeeSchema);
