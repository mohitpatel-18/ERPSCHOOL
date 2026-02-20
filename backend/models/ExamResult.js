const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },

  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },

  percentage: {
    type: Number,
  },

  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
  },

  status: {
    type: String,
    enum: ['pass', 'fail', 'absent'],
    default: 'pass',
  },

  remarks: {
    type: String,
    trim: true,
  },

  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },

  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
// Prevent duplicate results
examResultSchema.index({ exam: 1, student: 1 }, { unique: true });
examResultSchema.index({ student: 1, createdAt: -1 });
// Performance optimization for 1000+ students
examResultSchema.index({ exam: 1, marksObtained: -1 }); // For result ranking
examResultSchema.index({ student: 1, exam: 1, status: 1 }); // For quick lookups

/* ================= PRE SAVE HOOK ================= */
examResultSchema.pre('save', async function(next) {
  // Populate exam to get total marks
  await this.populate('exam');
  
  if (this.exam && this.exam.totalMarks) {
    // Calculate percentage
    this.percentage = ((this.marksObtained / this.exam.totalMarks) * 100).toFixed(2);

    // Calculate grade
    const percentage = parseFloat(this.percentage);
    if (percentage >= 90) this.grade = 'A+';
    else if (percentage >= 80) this.grade = 'A';
    else if (percentage >= 70) this.grade = 'B+';
    else if (percentage >= 60) this.grade = 'B';
    else if (percentage >= 50) this.grade = 'C+';
    else if (percentage >= 40) this.grade = 'C';
    else if (percentage >= 33) this.grade = 'D';
    else this.grade = 'F';

    // Determine pass/fail
    if (this.marksObtained >= this.exam.passingMarks) {
      this.status = 'pass';
    } else {
      this.status = 'fail';
    }
  }

  next();
});

/* ================= STATIC METHODS ================= */
examResultSchema.statics.getStudentResults = function(studentId, academicYear) {
  return this.find({ student: studentId })
    .populate({
      path: 'exam',
      match: academicYear ? { academicYear } : {},
      populate: { path: 'class academicYear' },
    })
    .sort({ createdAt: -1 });
};

examResultSchema.statics.getClassPerformance = async function(examId) {
  const results = await this.aggregate([
    { $match: { exam: examId } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        averageMarks: { $avg: '$marksObtained' },
        highestMarks: { $max: '$marksObtained' },
        lowestMarks: { $min: '$marksObtained' },
      },
    },
  ]);

  return results[0] || {};
};

module.exports = mongoose.model('ExamResult', examResultSchema);
