const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  section: {
    type: String,
    required: true,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
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
  academicYear: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Class', classSchema);
