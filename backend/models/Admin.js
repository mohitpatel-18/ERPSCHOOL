const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    adminId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: String,
    nationality: { type: String, default: 'Indian' },

    /* ================= PROFESSIONAL INFO ================= */
    designation: { 
      type: String, 
      enum: ['Principal', 'Vice Principal', 'Academic Coordinator', 'Admin Officer', 'System Admin', 'Super Admin'],
      default: 'Admin Officer'
    },
    
    department: String,
    qualification: String,
    experience: Number,

    joiningDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /* ================= PERMISSIONS & ROLES ================= */
    permissions: {
      manageStudents: { type: Boolean, default: true },
      manageTeachers: { type: Boolean, default: true },
      manageFees: { type: Boolean, default: true },
      manageExams: { type: Boolean, default: true },
      manageAttendance: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      systemSettings: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      bulkOperations: { type: Boolean, default: false },
    },

    /* ================= CONTACT INFO ================= */
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    /* ================= BANK DETAILS ================= */
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      panNumber: String,
    },

    /* ================= ACTIVITY TRACKING ================= */
    activityLog: [{
      action: String,
      module: String,
      description: String,
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
    }],

    /* ================= PERFORMANCE METRICS ================= */
    performanceMetrics: {
      totalActions: { type: Number, default: 0 },
      studentsManaged: { type: Number, default: 0 },
      teachersManaged: { type: Number, default: 0 },
      reportsGenerated: { type: Number, default: 0 },
      issuesResolved: { type: Number, default: 0 },
      averageResponseTime: Number, // in hours
    },

    /* ================= PROFILE METADATA ================= */
    profilePhoto: String,
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
adminSchema.index({ email: 1, status: 1 });
adminSchema.index({ designation: 1, status: 1 });

/* ================= VIRTUAL PROPERTIES ================= */
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

/* ================= INSTANCE METHODS ================= */
// Calculate profile completion
adminSchema.methods.calculateProfileCompletion = function() {
  let score = 0;
  const totalFields = 12;
  
  if (this.firstName && this.lastName && this.email) score += 3;
  if (this.phone) score += 1;
  if (this.dateOfBirth) score += 1;
  if (this.designation) score += 1;
  if (this.address?.street && this.address?.city) score += 1;
  if (this.emergencyContact?.name && this.emergencyContact?.phone) score += 1;
  if (this.profilePhoto) score += 1;
  if (this.bloodGroup) score += 1;
  if (this.bankDetails?.accountNumber) score += 1;
  if (this.qualification) score += 1;
  
  this.profileCompletion = Math.round((score / totalFields) * 100);
  return this.profileCompletion;
};

// Log activity
adminSchema.methods.logActivity = async function(action, module, description, ipAddress) {
  this.activityLog.push({
    action,
    module,
    description,
    ipAddress,
    timestamp: new Date(),
  });
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  this.performanceMetrics.totalActions += 1;
  await this.save();
  return this;
};

/* ================= PRE-SAVE HOOK ================= */
adminSchema.pre('save', function(next) {
  this.calculateProfileCompletion();
  next();
});

module.exports = mongoose.model('Admin', adminSchema);
