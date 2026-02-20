const mongoose = require("mongoose");

/* ================= FEE COMPONENT SUB-SCHEMA ================= */
const feeComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'Tuition Fee',
      'Admission Fee',
      'Development Fee',
      'Transport Fee',
      'Library Fee',
      'Sports Fee',
      'Lab Fee',
      'Computer Fee',
      'Activity Fee',
      'Exam Fee',
      'Uniform Fee',
      'Book Fee',
      'Hostel Fee',
      'Caution Money',
      'Other'
    ],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'One-Time'],
    required: true,
  },
  isOptional: {
    type: Boolean,
    default: false, // Transport, Hostel are optional
  },
  isTaxable: {
    type: Boolean,
    default: false,
  },
  taxPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
});

/* ================= INSTALLMENT PLAN SUB-SCHEMA ================= */
const installmentPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'],
  },
  numberOfInstallments: {
    type: Number,
    required: true,
    min: 1,
  },
  dueDates: [{
    installmentNumber: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    date: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    percentage: {
      type: Number, // What % of total fee
      required: true,
      min: 0,
      max: 100,
    },
  }],
  earlyPaymentDiscount: {
    enabled: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    validTillDays: {
      type: Number, // Discount valid if paid X days before due
      default: 0,
    },
  },
});

/* ================= DISCOUNT RULE SUB-SCHEMA ================= */
const discountRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Sibling Discount', 'Merit Scholarship', 'Sports Quota', 'Staff Child', 'Financial Aid', 'Early Bird', 'Custom'],
    required: true,
  },
  applicableTo: {
    type: [String], // Array of fee component names
    default: ['Tuition Fee'],
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Fixed Amount'],
    default: 'Percentage',
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  maxAmount: {
    type: Number, // Cap on discount amount
    default: null,
  },
  criteria: {
    minPercentage: Number, // For merit-based
    siblingCount: Number, // For sibling discount
    customConditions: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  validFrom: Date,
  validTill: Date,
});

/* ================= MAIN FEE TEMPLATE SCHEMA ================= */
const feeTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

    /* ================= FEE COMPONENTS ================= */
    components: [feeComponentSchema],

    /* ================= INSTALLMENT PLANS ================= */
    installmentPlans: [installmentPlanSchema],

    defaultInstallmentPlan: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'],
      default: 'Quarterly',
    },

    /* ================= DISCOUNT RULES ================= */
    discountRules: [discountRuleSchema],

    /* ================= LATE FEE SETTINGS ================= */
    lateFeeSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        enum: ['Per Day', 'Flat', 'Percentage'],
        default: 'Per Day',
      },
      amountPerDay: {
        type: Number,
        default: 10,
      },
      flatAmount: {
        type: Number,
        default: 100,
      },
      percentage: {
        type: Number,
        default: 1,
      },
      graceDays: {
        type: Number,
        default: 5,
      },
      maxLateFee: {
        type: Number,
        default: 5000,
      },
      startFrom: {
        type: String,
        enum: ['Due Date', 'Grace Period End'],
        default: 'Grace Period End',
      },
    },

    /* ================= PAYMENT SETTINGS ================= */
    paymentSettings: {
      allowPartialPayment: {
        type: Boolean,
        default: true,
      },
      minPartialAmount: {
        type: Number,
        default: 0,
      },
      allowOnlinePayment: {
        type: Boolean,
        default: true,
      },
      allowOfflinePayment: {
        type: Boolean,
        default: true,
      },
      acceptedPaymentModes: {
        type: [String],
        enum: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card', 'Net Banking'],
        default: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card'],
      },
    },

    /* ================= REFUND SETTINGS ================= */
    refundPolicy: {
      enabled: {
        type: Boolean,
        default: false,
      },
      refundableComponents: [String],
      refundPercentage: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      processingDays: {
        type: Number,
        default: 30,
      },
    },

    /* ================= STATUS & METADATA ================= */
    isActive: {
      type: Boolean,
      default: true,
    },

    totalAnnualFee: {
      type: Number,
      default: 0,
    },

    assignedStudentsCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
feeTemplateSchema.index({ class: 1, academicYear: 1 });
feeTemplateSchema.index({ isActive: 1, academicYear: 1 });
feeTemplateSchema.index({ templateName: 1 });

/* ================= VIRTUAL FIELDS ================= */
feeTemplateSchema.virtual('totalMandatoryFee').get(function() {
  return this.components
    .filter(c => !c.isOptional)
    .reduce((sum, c) => sum + c.amount, 0);
});

feeTemplateSchema.virtual('totalOptionalFee').get(function() {
  return this.components
    .filter(c => c.isOptional)
    .reduce((sum, c) => sum + c.amount, 0);
});

/* ================= INSTANCE METHODS ================= */
// Calculate total fee for a student based on selected components
feeTemplateSchema.methods.calculateStudentFee = function(selectedComponents = [], appliedDiscounts = []) {
  let totalFee = 0;
  let totalDiscount = 0;
  let componentBreakdown = [];

  // Calculate base fee
  this.components.forEach(component => {
    if (!component.isOptional || selectedComponents.includes(component.name)) {
      let componentAmount = component.amount;
      
      // Apply tax if applicable
      if (component.isTaxable) {
        componentAmount += (componentAmount * component.taxPercentage) / 100;
      }

      componentBreakdown.push({
        name: component.name,
        baseAmount: component.amount,
        taxAmount: component.isTaxable ? (component.amount * component.taxPercentage) / 100 : 0,
        finalAmount: componentAmount,
        frequency: component.frequency,
      });

      totalFee += componentAmount;
    }
  });

  // Apply discounts
  appliedDiscounts.forEach(discountId => {
    const discount = this.discountRules.id(discountId);
    if (discount && discount.isActive) {
      let discountAmount = 0;
      
      if (discount.discountType === 'Percentage') {
        discountAmount = (totalFee * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }

      // Apply max cap
      if (discount.maxAmount && discountAmount > discount.maxAmount) {
        discountAmount = discount.maxAmount;
      }

      totalDiscount += discountAmount;
    }
  });

  return {
    totalFee,
    totalDiscount,
    netFee: totalFee - totalDiscount,
    componentBreakdown,
  };
};

/* ================= HOOKS ================= */
// Calculate total annual fee before saving
feeTemplateSchema.pre('save', function(next) {
  this.totalAnnualFee = this.components
    .filter(c => !c.isOptional)
    .reduce((sum, c) => sum + c.amount, 0);
  next();
});

feeTemplateSchema.set('toJSON', { virtuals: true });
feeTemplateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("FeeTemplate", feeTemplateSchema);
