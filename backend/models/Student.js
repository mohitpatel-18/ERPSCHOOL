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
      trim: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    rollNumber: {
      type: Number,
      required: true,
    },

    admissionNumber: {
      type: String,
      unique: true,
      index: true,
    },

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      index: true,
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      index: true,
    },

    bloodGroup: String,
    nationality: { type: String, default: 'Indian' },
    religion: String,
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
    
    /* ================= PARENT/GUARDIAN INFO (ENHANCED) ================= */
    father: {
      name: String,
      phone: String,
      email: String,
      occupation: String,
      annualIncome: Number,
      education: String,
      aadhaar: String,
    },
    mother: {
      name: String,
      phone: String,
      email: String,
      occupation: String,
      education: String,
      aadhaar: String,
    },
    guardian: {
      name: String,
      phone: String,
      email: String,
      relation: String,
      occupation: String,
      address: String,
    },
    primaryContact: { type: String, enum: ['father', 'mother', 'guardian'], default: 'father' },

    /* ================= ADDRESS ================= */
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

    /* ================= MEDICAL RECORDS ================= */
    medicalInfo: {
      height: Number, // in cm
      weight: Number, // in kg
      allergies: [String],
      chronicDiseases: [String],
      medications: [String],
      disabilities: String,
      vaccinationRecords: [{
        vaccineName: String,
        date: Date,
        nextDue: Date,
      }],
      lastCheckupDate: Date,
      doctorName: String,
      doctorContact: String,
      emergencyMedicalNotes: String,
    },

    /* ================= TRANSPORT DETAILS ================= */
    transportInfo: {
      required: { type: Boolean, default: false },
      route: String,
      pickupPoint: String,
      dropPoint: String,
      busNumber: String,
      distance: Number, // in km
    },

    /* ================= HOSTEL DETAILS ================= */
    hostelInfo: {
      required: { type: Boolean, default: false },
      hostelName: String,
      roomNumber: String,
      bedNumber: String,
      warden: String,
      checkInDate: Date,
    },

    /* ================= ACADEMIC PERFORMANCE ================= */
    academicPerformance: {
      overallGrade: String,
      overallPercentage: Number,
      rank: Number,
      totalSubjects: Number,
      attendance: Number,
      behaviorGrade: String,
      remarks: String,
    },

    /* ================= CO-CURRICULAR ACTIVITIES ================= */
    activities: [{
      activityName: String,
      category: { type: String, enum: ['Sports', 'Arts', 'Music', 'Dance', 'Drama', 'Debate', 'Other'] },
      level: { type: String, enum: ['School', 'District', 'State', 'National', 'International'] },
      achievements: String,
      year: Number,
    }],

    /* ================= PREVIOUS SCHOOL HISTORY ================= */
    previousSchool: {
      schoolName: String,
      board: String,
      lastClass: String,
      lastPercentage: Number,
      tcNumber: String,
      leavingDate: Date,
      reason: String,
    },

    /* ================= DOCUMENTS ================= */
    documents: [{
      documentType: { 
        type: String, 
        enum: ['Birth Certificate', 'Aadhaar', 'Transfer Certificate', 'Mark Sheet', 'Photo', 'Medical Certificate', 'Caste Certificate', 'Income Certificate', 'Other'] 
      },
      documentName: String,
      documentUrl: String, // Cloudinary URL
      uploadedAt: { type: Date, default: Date.now },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      isVerified: { type: Boolean, default: false },
    }],

    /* ================= BEHAVIOR & DISCIPLINE ================= */
    disciplineRecords: [{
      incidentDate: Date,
      incidentType: { type: String, enum: ['Warning', 'Minor', 'Major', 'Suspension'] },
      description: String,
      actionTaken: String,
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
      resolvedAt: Date,
      isResolved: { type: Boolean, default: false },
    }],

    /* ================= PROFILE METADATA ================= */
    profilePhoto: String, // Cloudinary URL
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'expelled', 'transferred'],
      default: 'active',
      index: true,
    },

    promotedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= COMPOUND INDEXES ================= */
// Prevent duplicate roll numbers in same class
studentSchema.index({ class: 1, rollNumber: 1 }, { unique: true });

// Fast search by class and section
studentSchema.index({ class: 1, section: 1, status: 1 });

// Fast search by academic year
studentSchema.index({ academicYear: 1, status: 1 });

// Text search on name and email
studentSchema.index({ firstName: 'text', lastName: 'text', email: 'text', admissionNumber: 'text' });

/* ================= VIRTUAL PROPERTIES ================= */
// Full name virtual property
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Age calculation
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtuals are included in JSON output
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

/* ================= STATIC METHODS ================= */
// Get active students by class
studentSchema.statics.getActiveByClass = function(classId) {
  return this.find({ class: classId, status: 'active' })
    .populate('userId', 'name email')
    .sort({ rollNumber: 1 });
};

// Get students by section
studentSchema.statics.getBySection = function(classId, section) {
  return this.find({ class: classId, section, status: 'active' })
    .sort({ rollNumber: 1 });
};

// Search students
studentSchema.statics.search = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active'
  }).select('firstName lastName email studentId class section');
};

// Get student count by class
studentSchema.statics.getClassStrength = async function(classId) {
  return await this.countDocuments({ class: classId, status: 'active' });
};

/* ================= INSTANCE METHODS ================= */
// Promote student to next class
studentSchema.methods.promoteToClass = async function(newClassId) {
  this.class = newClassId;
  this.promotedAt = new Date();
  return await this.save();
};

// Deactivate student
studentSchema.methods.deactivate = async function(reason) {
  this.status = 'inactive';
  this.metadata = { ...this.metadata, deactivationReason: reason, deactivatedAt: new Date() };
  return await this.save();
};

// Calculate profile completion percentage
studentSchema.methods.calculateProfileCompletion = function() {
  let score = 0;
  const totalFields = 15;
  
  // Basic info (3 points)
  if (this.firstName && this.lastName && this.email) score += 3;
  
  // Parent info (2 points)
  if (this.father?.name || this.mother?.name) score += 1;
  if (this.father?.phone || this.mother?.phone) score += 1;
  
  // Address (1 point)
  if (this.address?.street && this.address?.city) score += 1;
  
  // Personal info (2 points)
  if (this.dateOfBirth) score += 1;
  if (this.bloodGroup) score += 1;
  
  // Medical info (1 point)
  if (this.medicalInfo?.height || this.medicalInfo?.weight) score += 1;
  
  // Documents (2 points)
  if (this.documents && this.documents.length > 0) score += 1;
  if (this.profilePhoto) score += 1;
  
  // Academic info (2 points)
  if (this.academicPerformance?.overallPercentage) score += 1;
  if (this.rollNumber) score += 1;
  
  // Transport/Hostel (1 point)
  if (this.transportInfo?.required || this.hostelInfo?.required) score += 1;
  
  this.profileCompletion = Math.round((score / totalFields) * 100);
  return this.profileCompletion;
};

// Add document
studentSchema.methods.addDocument = async function(docData) {
  this.documents.push(docData);
  await this.save();
  return this;
};

// Add activity
studentSchema.methods.addActivity = async function(activityData) {
  this.activities.push(activityData);
  await this.save();
  return this;
};

// Add discipline record
studentSchema.methods.addDisciplineRecord = async function(recordData) {
  this.disciplineRecords.push(recordData);
  await this.save();
  return this;
};

/* ================= PRE-SAVE HOOK ================= */
studentSchema.pre('save', function(next) {
  // Auto-calculate profile completion
  this.calculateProfileCompletion();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
