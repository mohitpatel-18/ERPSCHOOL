const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },

  period: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },

  subject: {
    type: String,
    required: true,
    trim: true,
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },

  startTime: {
    type: String, // Format: "09:00"
    required: true,
  },

  endTime: {
    type: String, // Format: "09:45"
    required: true,
  },

  roomNumber: {
    type: String,
    trim: true,
  },
});

const timetableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true,
  },

  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
    index: true,
  },

  entries: [timetableEntrySchema],

  isActive: {
    type: Boolean,
    default: true,
  },

  effectiveFrom: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
timetableSchema.index({ class: 1, academicYear: 1, isActive: 1 });

/* ================= STATIC METHODS ================= */
timetableSchema.statics.getByClass = function(classId) {
  return this.findOne({ class: classId, isActive: true })
    .populate('class', 'name section')
    .populate('entries.teacher', 'firstName lastName');
};

timetableSchema.statics.getTeacherSchedule = function(teacherId) {
  return this.find({
    'entries.teacher': teacherId,
    isActive: true,
  })
    .populate('class', 'name section')
    .select('class entries');
};

module.exports = mongoose.model('Timetable', timetableSchema);
