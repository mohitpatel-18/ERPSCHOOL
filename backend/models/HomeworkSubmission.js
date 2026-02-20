const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema({
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: true,
    index: true,
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },

  submissionText: {
    type: String,
    trim: true,
  },

  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
  }],

  submittedAt: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ['submitted', 'late', 'pending', 'graded'],
    default: 'submitted',
  },

  marksObtained: {
    type: Number,
    min: 0,
  },

  feedback: {
    type: String,
    trim: true,
  },

  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },

  gradedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
// Prevent duplicate submissions
homeworkSubmissionSchema.index({ homework: 1, student: 1 }, { unique: true });
homeworkSubmissionSchema.index({ student: 1, createdAt: -1 });
homeworkSubmissionSchema.index({ homework: 1, status: 1 });

/* ================= PRE SAVE HOOK ================= */
homeworkSubmissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if submission is late
    await this.populate('homework');
    if (this.homework && new Date() > this.homework.dueDate) {
      this.status = 'late';
    }
  }
  
  if (this.marksObtained !== undefined) {
    this.status = 'graded';
  }
  
  next();
});

/* ================= STATIC METHODS ================= */
homeworkSubmissionSchema.statics.getStudentSubmissions = function(studentId) {
  return this.find({ student: studentId })
    .populate('homework', 'title subject dueDate maxMarks')
    .sort({ createdAt: -1 });
};

homeworkSubmissionSchema.statics.getHomeworkSubmissions = function(homeworkId) {
  return this.find({ homework: homeworkId })
    .populate('student', 'firstName lastName studentId')
    .sort({ submittedAt: 1 });
};

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
