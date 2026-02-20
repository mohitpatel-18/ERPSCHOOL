const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  examType: {
    type: String,
    enum: ['unit-test', 'mid-term', 'final', 'practical', 'quiz'],
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

  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
    index: true,
  },

  totalMarks: {
    type: Number,
    required: true,
    min: 0,
  },

  passingMarks: {
    type: Number,
    required: true,
    min: 0,
  },

  examDate: {
    type: Date,
    required: true,
    index: true,
  },

  duration: {
    type: Number, // in minutes
    default: 60,
  },

  syllabus: {
    type: String,
    trim: true,
  },

  instructions: {
    type: String,
    trim: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },

  isPublished: {
    type: Boolean,
    default: false,
  },

  resultPublished: {
    type: Boolean,
    default: false,
  },

  resultPublishedDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
examSchema.index({ class: 1, academicYear: 1, examType: 1 });
examSchema.index({ subject: 1, examDate: 1 });
examSchema.index({ createdBy: 1, examDate: -1 });

/* ================= STATIC METHODS ================= */
examSchema.statics.getUpcomingExams = function(classId) {
  return this.find({
    class: classId,
    examDate: { $gte: new Date() },
    isPublished: true,
  }).sort({ examDate: 1 });
};

examSchema.statics.getByClassAndSubject = function(classId, subject) {
  return this.find({ class: classId, subject })
    .populate('createdBy', 'firstName lastName')
    .sort({ examDate: -1 });
};

module.exports = mongoose.model('Exam', examSchema);
