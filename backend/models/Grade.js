const mongoose = require('mongoose'); 

const gradeSchema = new mongoose.Schema({
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
  
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  
  examType: {
    type: String,
    enum: ['unit-test', 'mid-term', 'final', 'practical'],
    required: true,
    index: true,
  },
  
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },
  
  totalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  
  percentage: {
    type: Number,
  },
  
  grade: {
    type: String,
    trim: true,
  },
  
  remarks: {
    type: String,
    trim: true,
  },
  
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    index: true,
  },
  
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
    index: true,
  },
  
  examDate: {
    type: Date,
    index: true,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
// Fast queries by student and academic year
gradeSchema.index({ student: 1, academicYear: 1 });

// Fast queries by class and exam type
gradeSchema.index({ class: 1, examType: 1, academicYear: 1 });

// Fast queries by subject
gradeSchema.index({ subject: 1, examType: 1 });

/* ================= CALCULATE PERCENTAGE BEFORE SAVE ================= */
gradeSchema.pre('save', function(next) {
  if (this.totalMarks > 0) {
    this.percentage = ((this.marksObtained / this.totalMarks) * 100).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);