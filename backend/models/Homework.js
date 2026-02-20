const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  subject: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true,
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    index: true,
  },

  dueDate: {
    type: Date,
    required: true,
    index: true,
  },

  maxMarks: {
    type: Number,
    default: 10,
  },

  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
  }],

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
homeworkSchema.index({ class: 1, dueDate: -1 });
homeworkSchema.index({ teacher: 1, createdAt: -1 });

/* ================= VIRTUAL PROPERTIES ================= */
homeworkSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

homeworkSchema.set('toJSON', { virtuals: true });
homeworkSchema.set('toObject', { virtuals: true });

/* ================= STATIC METHODS ================= */
homeworkSchema.statics.getActiveHomework = function(classId) {
  return this.find({
    class: classId,
    isActive: true,
    dueDate: { $gte: new Date() },
  })
    .populate('teacher', 'firstName lastName')
    .sort({ dueDate: 1 });
};

module.exports = mongoose.model('Homework', homeworkSchema);
