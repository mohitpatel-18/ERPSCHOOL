const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    employeeId: {
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

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    department: {
      type: String,
      required: true,
      index: true,
    },

    qualification: String,
    highestDegree: String,
    university: String,
    graduationYear: Number,
    experience: Number, // Total years
    previousExperience: Number, // Before joining this school
    subjects: [String],
    specialization: [String],
    
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],

    /* ================= PROFESSIONAL INFO ================= */
    designation: { type: String, enum: ['Teacher', 'Senior Teacher', 'Head Teacher', 'Principal', 'Vice Principal', 'Coordinator', 'TGT', 'PGT', 'PRT'] },
    teacherType: { type: String, enum: ['Permanent', 'Temporary', 'Contract', 'Visiting', 'Guest'] },
    employmentType: { type: String, enum: ['Full-Time', 'Part-Time'] },
    
    joiningDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    probationEndDate: Date,
    confirmationDate: Date,
    
    /* ================= CERTIFICATIONS & TRAINING ================= */
    certifications: [{
      certificationName: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      certificateUrl: String, // Cloudinary URL
      isVerified: { type: Boolean, default: false },
    }],

    trainings: [{
      trainingName: String,
      provider: String,
      startDate: Date,
      endDate: Date,
      duration: Number, // in hours
      certificateUrl: String,
      skills: [String],
    }],

    /* ================= DOCUMENTS ================= */
    documents: [{
      documentType: { 
        type: String, 
        enum: ['Resume', 'Degree Certificate', 'Experience Letter', 'Aadhaar', 'PAN Card', 'Police Verification', 'Medical Certificate', 'Photo', 'Offer Letter', 'Appointment Letter', 'Other'] 
      },
      documentName: String,
      documentUrl: String, // Cloudinary URL
      uploadedAt: { type: Date, default: Date.now },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      isVerified: { type: Boolean, default: false },
    }],

    /* ================= BANK & PAYROLL ================= */
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      branchName: String,
      ifscCode: String,
      panNumber: String,
      aadhaarNumber: String,
    },

    salary: {
      type: Number,
      select: false, // Don't include in regular queries
    },
    
    salaryStructure: {
      basicSalary: { type: Number, select: false },
      hra: { type: Number, select: false },
      da: { type: Number, select: false },
      ta: { type: Number, select: false },
      other: { type: Number, select: false },
      totalSalary: { type: Number, select: false },
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    permanentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
      sameAsPresent: { type: Boolean, default: true },
    },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
      address: String,
    },

    /* ================= PERFORMANCE METRICS ================= */
    performanceMetrics: {
      averageRating: { type: Number, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      studentSatisfaction: Number,
      punctuality: Number,
      classCompletionRate: Number,
      resultPercentage: Number,
      lastReviewDate: Date,
    },

    /* ================= ATTENDANCE & LEAVE ================= */
    attendanceStats: {
      totalPresent: { type: Number, default: 0 },
      totalAbsent: { type: Number, default: 0 },
      totalLeaves: { type: Number, default: 0 },
      attendancePercentage: Number,
    },

    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      earned: { type: Number, default: 15 },
      maternity: { type: Number, default: 180 },
      paternity: { type: Number, default: 15 },
    },

    /* ================= TEACHING LOAD ================= */
    teachingLoad: {
      totalClasses: { type: Number, default: 0 },
      totalStudents: { type: Number, default: 0 },
      periodsPerWeek: { type: Number, default: 0 },
      maxLoad: { type: Number, default: 40 },
    },

    /* ================= PROFILE METADATA ================= */
    profilePhoto: String, // Cloudinary URL
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    /* ================= PERSONAL INFO ================= */
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    nationality: { type: String, default: 'Indian' },
    religion: String,
    bloodGroup: String,

    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'suspended', 'resigned', 'retired'],
      default: 'active',
      index: true,
    },
    
    exitDate: Date,
    exitReason: String,
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
// Fast search by department and status
teacherSchema.index({ department: 1, status: 1 });

// Text search on name and email
teacherSchema.index({ firstName: 'text', lastName: 'text', email: 'text', employeeId: 'text' });

/* ================= VIRTUAL PROPERTIES ================= */
// Full name virtual property
teacherSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Years of experience (calculated from joining date)
teacherSchema.virtual('yearsOfService').get(function() {
  if (!this.joiningDate) return 0;
  const today = new Date();
  const joining = new Date(this.joiningDate);
  return Math.floor((today - joining) / (1000 * 60 * 60 * 24 * 365.25));
});

// Ensure virtuals are included in JSON output
teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

/* ================= STATIC METHODS ================= */
// Get active teachers by department
teacherSchema.statics.getByDepartment = function(department) {
  return this.find({ department, status: 'active' })
    .populate('userId', 'name email')
    .populate('assignedClasses', 'name section');
};

// Search teachers
teacherSchema.statics.search = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active'
  }).select('firstName lastName email employeeId department');
};

// Get teachers by class assignment
teacherSchema.statics.getByClass = function(classId) {
  return this.find({
    assignedClasses: classId,
    status: 'active'
  }).select('firstName lastName email employeeId subjects');
};

/* ================= INSTANCE METHODS ================= */
// Assign class to teacher
teacherSchema.methods.assignClass = async function(classId) {
  if (!this.assignedClasses.includes(classId)) {
    this.assignedClasses.push(classId);
    return await this.save();
  }
  return this;
};

// Remove class assignment
teacherSchema.methods.unassignClass = async function(classId) {
  this.assignedClasses = this.assignedClasses.filter(
    id => id.toString() !== classId.toString()
  );
  return await this.save();
};

// Set leave status
teacherSchema.methods.setOnLeave = async function() {
  this.status = 'on-leave';
  return await this.save();
};

// Reactivate from leave
teacherSchema.methods.reactivate = async function() {
  this.status = 'active';
  return await this.save();
};

// Calculate profile completion
teacherSchema.methods.calculateProfileCompletion = function() {
  let score = 0;
  const totalFields = 18;
  
  // Basic info (4 points)
  if (this.firstName && this.lastName && this.email && this.phone) score += 4;
  
  // Professional info (3 points)
  if (this.qualification) score += 1;
  if (this.designation) score += 1;
  if (this.subjects && this.subjects.length > 0) score += 1;
  
  // Address (1 point)
  if (this.address?.street && this.address?.city) score += 1;
  
  // Personal info (2 points)
  if (this.dateOfBirth) score += 1;
  if (this.bloodGroup) score += 1;
  
  // Emergency contact (1 point)
  if (this.emergencyContact?.name && this.emergencyContact?.phone) score += 1;
  
  // Documents (2 points)
  if (this.documents && this.documents.length > 0) score += 1;
  if (this.profilePhoto) score += 1;
  
  // Bank details (2 points)
  if (this.bankDetails?.accountNumber) score += 1;
  if (this.bankDetails?.panNumber) score += 1;
  
  // Certifications (1 point)
  if (this.certifications && this.certifications.length > 0) score += 1;
  
  // Assigned classes (1 point)
  if (this.assignedClasses && this.assignedClasses.length > 0) score += 1;
  
  // Experience (1 point)
  if (this.experience) score += 1;
  
  this.profileCompletion = Math.round((score / totalFields) * 100);
  return this.profileCompletion;
};

// Add certification
teacherSchema.methods.addCertification = async function(certData) {
  this.certifications.push(certData);
  await this.save();
  return this;
};

// Add training
teacherSchema.methods.addTraining = async function(trainingData) {
  this.trainings.push(trainingData);
  await this.save();
  return this;
};

// Add document
teacherSchema.methods.addDocument = async function(docData) {
  this.documents.push(docData);
  await this.save();
  return this;
};

// Update performance metrics
teacherSchema.methods.updatePerformance = async function(metrics) {
  this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  await this.save();
  return this;
};

/* ================= PRE-SAVE HOOK ================= */
teacherSchema.pre('save', function(next) {
  // Auto-calculate profile completion
  this.calculateProfileCompletion();
  
  // Calculate total salary if salary structure exists
  if (this.salaryStructure) {
    this.salaryStructure.totalSalary = 
      (this.salaryStructure.basicSalary || 0) +
      (this.salaryStructure.hra || 0) +
      (this.salaryStructure.da || 0) +
      (this.salaryStructure.ta || 0) +
      (this.salaryStructure.other || 0);
  }
  
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
