const mongoose = require("mongoose");

/* ================= PAYMENT SCHEMA ================= */
const paymentSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    studentFee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
      index: true,
    },

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    /* ================= PAYMENT DETAILS ================= */
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    lateFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ================= PAYMENT MODE ================= */
    paymentMode: {
      type: String,
      enum: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card', 'Net Banking', 'Online Gateway'],
      required: true,
    },

    paymentType: {
      type: String,
      enum: ['Online', 'Offline'],
      required: true,
    },

    /* ================= PAYMENT METHOD DETAILS ================= */
    // For Cheque
    chequeNumber: String,
    chequeDate: Date,
    bankName: String,
    branchName: String,

    // For Bank Transfer
    transactionId: String,
    transferDate: Date,
    accountNumber: String,

    // For UPI/Card/Net Banking
    upiId: String,
    cardLast4Digits: String,
    cardType: {
      type: String,
      enum: ['Credit', 'Debit', 'Prepaid'],
    },

    /* ================= ONLINE PAYMENT GATEWAY ================= */
    gateway: {
      type: String,
      enum: ['Razorpay', 'Stripe', 'PayU', 'Paytm', 'PhonePe', 'Other'],
    },

    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // Store full gateway response
    },

    /* ================= INSTALLMENT ALLOCATION ================= */
    installmentAllocations: [{
      installmentNumber: Number,
      installmentName: String,
      allocatedAmount: Number,
      lateFeeAmount: Number,
    }],

    /* ================= PAYMENT STATUS ================= */
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed', 'Refunded', 'Cancelled'],
      default: 'Success',
      index: true,
    },

    /* ================= REFUND INFO ================= */
    isRefunded: {
      type: Boolean,
      default: false,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundDate: Date,

    refundReason: String,

    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    refundTransactionId: String,

    /* ================= COLLECTED BY ================= */
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    collectorName: String, // Cached for quick access

    /* ================= APPROVED BY ================= */
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    approvalDate: Date,

    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Approved', // Auto-approved for online payments
    },

    rejectionReason: String,

    /* ================= RECEIPT INFO ================= */
    receiptUrl: String, // PDF receipt URL

    receiptGenerated: {
      type: Boolean,
      default: false,
    },

    receiptGeneratedOn: Date,

    receiptEmailSent: {
      type: Boolean,
      default: false,
    },

    receiptEmailSentOn: Date,

    /* ================= ADDITIONAL INFO ================= */
    remarks: {
      type: String,
      maxlength: 500,
    },

    internalNotes: {
      type: String,
      maxlength: 1000,
    },

    /* ================= ACCOUNTING ================= */
    accountingEntryId: String, // Link to accounting system

    financialYear: String,

    /* ================= METADATA ================= */
    ipAddress: String,

    userAgent: String,

    deviceInfo: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    deletedOn: Date,

    deletionReason: String,
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
paymentSchema.index({ receiptNumber: 1 }, { unique: true });
paymentSchema.index({ student: 1, paymentDate: -1 });
paymentSchema.index({ studentFee: 1 });
paymentSchema.index({ paymentDate: 1, status: 1 });
paymentSchema.index({ academicYear: 1, status: 1 });
paymentSchema.index({ collectedBy: 1, paymentDate: -1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });

/* ================= VIRTUAL FIELDS ================= */
paymentSchema.virtual('netPayment').get(function() {
  return this.amount - this.discountAmount;
});

paymentSchema.virtual('isOnlinePayment').get(function() {
  return this.paymentType === 'Online';
});

paymentSchema.virtual('isPending').get(function() {
  return this.approvalStatus === 'Pending';
});

/* ================= STATIC METHODS ================= */

// Generate unique receipt number
paymentSchema.statics.generateReceiptNumber = async function() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Format: RCP-YYYYMM-XXXX
  const prefix = `RCP-${year}${month}`;
  
  // Find the last receipt number for this month
  const lastPayment = await this.findOne({
    receiptNumber: new RegExp(`^${prefix}`),
  }).sort({ receiptNumber: -1 });
  
  let nextNumber = 1;
  if (lastPayment) {
    const lastNumber = parseInt(lastPayment.receiptNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
};

// Get payment summary by date range
paymentSchema.statics.getPaymentSummary = async function(filters = {}) {
  const match = { status: 'Success', isDeleted: false, ...filters };
  
  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalLateFee: { $sum: '$lateFeeAmount' },
        totalDiscount: { $sum: '$discountAmount' },
        cashPayments: {
          $sum: { $cond: [{ $eq: ['$paymentMode', 'Cash'] }, '$totalAmount', 0] }
        },
        onlinePayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'Online'] }, '$totalAmount', 0] }
        },
        chequePayments: {
          $sum: { $cond: [{ $eq: ['$paymentMode', 'Cheque'] }, '$totalAmount', 0] }
        },
      }
    }
  ]);
  
  return summary.length > 0 ? summary[0] : {};
};

// Get daily collection report
paymentSchema.statics.getDailyCollection = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    paymentDate: { $gte: startOfDay, $lte: endOfDay },
    status: 'Success',
    isDeleted: false,
  })
  .populate('student', 'firstName lastName rollNumber studentId')
  .populate('collectedBy', 'name')
  .sort({ paymentDate: -1 });
};

// Get collector-wise summary
paymentSchema.statics.getCollectorSummary = async function(filters = {}) {
  const match = { status: 'Success', isDeleted: false, ...filters };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$collectedBy',
        totalCollected: { $sum: '$totalAmount' },
        paymentCount: { $sum: 1 },
        cashAmount: {
          $sum: { $cond: [{ $eq: ['$paymentMode', 'Cash'] }, '$totalAmount', 0] }
        },
        onlineAmount: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'Online'] }, '$totalAmount', 0] }
        },
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'collector',
      }
    },
    { $unwind: '$collector' },
    {
      $project: {
        collectorName: '$collector.name',
        totalCollected: 1,
        paymentCount: 1,
        cashAmount: 1,
        onlineAmount: 1,
      }
    },
    { $sort: { totalCollected: -1 } },
  ]);
};

/* ================= INSTANCE METHODS ================= */

// Mark payment as refunded
paymentSchema.methods.refund = async function(refundAmount, reason, refundedBy) {
  this.isRefunded = true;
  this.refundAmount = refundAmount;
  this.refundDate = new Date();
  this.refundReason = reason;
  this.refundedBy = refundedBy;
  this.status = 'Refunded';
  
  await this.save();
  
  // Update StudentFee balance
  const StudentFee = mongoose.model('StudentFee');
  const studentFee = await StudentFee.findById(this.studentFee);
  
  if (studentFee) {
    studentFee.totalPaid -= refundAmount;
    studentFee.balance += refundAmount;
    await studentFee.save();
  }
  
  return this;
};

// Generate receipt
paymentSchema.methods.generateReceipt = async function() {
  // This will be implemented with PDF generation
  this.receiptGenerated = true;
  this.receiptGeneratedOn = new Date();
  await this.save();
  return this;
};

/* ================= HOOKS ================= */

// Before save: auto-generate receipt number if not present
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    this.receiptNumber = await this.constructor.generateReceiptNumber();
  }
  
  // Calculate total amount
  this.totalAmount = this.amount + this.lateFeeAmount - this.discountAmount;
  
  next();
});

// After save: update StudentFee balance
paymentSchema.post('save', async function(doc) {
  if (doc.status === 'Success' && !doc.isRefunded) {
    const StudentFee = mongoose.model('StudentFee');
    const studentFee = await StudentFee.findById(doc.studentFee);
    
    if (studentFee) {
      studentFee.totalPaid += doc.totalAmount;
      studentFee.lastPaymentDate = doc.paymentDate;
      
      // Update installment allocations
      if (doc.installmentAllocations && doc.installmentAllocations.length > 0) {
        doc.installmentAllocations.forEach(allocation => {
          const installment = studentFee.installments.find(
            i => i.installmentNumber === allocation.installmentNumber
          );
          
          if (installment) {
            installment.paidAmount += allocation.allocatedAmount;
            installment.paymentIds.push(doc._id);
            
            if (allocation.allocatedAmount > 0) {
              installment.paidOn = doc.paymentDate;
            }
          }
        });
      }
      
      await studentFee.save();
    }
  }
});

paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Payment", paymentSchema);
