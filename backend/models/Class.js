const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  
  section: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  
  grade: {
    type: Number,
    required: true,
    index: true,
  },
  
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    index: true,
  },
  
  subjects: [
    {
      name: String,
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    },
  ],
  
  strength: {
    type: Number,
    default: 0,
  },
  
  maxStrength: {
    type: Number,
    default: 50,
  },
  
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
    index: true,
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
// Unique class per section per academic year
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

// Fast lookup by academic year
classSchema.index({ academicYear: 1, isActive: 1 });

/* ================= VIRTUAL PROPERTIES ================= */
// Full class name
classSchema.virtual('fullName').get(function() {
  return `${this.name} - ${this.section}`;
});

// Is class full
classSchema.virtual('isFull').get(function() {
  return this.strength >= this.maxStrength;
});

// Available seats
classSchema.virtual('availableSeats').get(function() {
  return Math.max(0, this.maxStrength - this.strength);
});

classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

/* ================= PRE HOOKS ================= */
// Update strength when querying (optional - can be updated manually)
classSchema.pre('save', async function(next) {
  // You can add auto-update strength logic here if needed
  next();
});

/* ================= STATIC METHODS ================= */
// Get active classes by academic year
classSchema.statics.getActiveByYear = function(academicYearId) {
  return this.find({ academicYear: academicYearId, isActive: true })
    .populate('classTeacher', 'firstName lastName employeeId')
    .sort({ grade: 1, section: 1 });
};

// Update class strength
classSchema.statics.updateStrength = async function(classId) {
  const Student = require('./Student');
  const count = await Student.countDocuments({ class: classId, status: 'active' });
  return await this.findByIdAndUpdate(classId, { strength: count }, { new: true });
};

module.exports = mongoose.model('Class', classSchema);
