const Timetable = require('../models/Timetable');
const asyncHandler = require('../middleware/asyncHandler');

/* ================= CREATE TIMETABLE ================= */
exports.createTimetable = asyncHandler(async (req, res) => {
  const { class: classId, academicYear, entries, effectiveFrom } = req.body;

  // Check if timetable already exists
  const existing = await Timetable.findOne({
    class: classId,
    academicYear,
    isActive: true,
  });

  if (existing) {
    // Deactivate old timetable
    existing.isActive = false;
    await existing.save();
  }

  const timetable = await Timetable.create({
    class: classId,
    academicYear,
    entries,
    effectiveFrom: effectiveFrom || new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Timetable created successfully',
    data: timetable,
  });
});

/* ================= GET TIMETABLE BY CLASS ================= */
exports.getTimetableByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const timetable = await Timetable.getByClass(classId);

  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'No active timetable found for this class',
    });
  }

  // Group entries by day
  const grouped = {};
  timetable.entries.forEach(entry => {
    if (!grouped[entry.day]) {
      grouped[entry.day] = [];
    }
    grouped[entry.day].push(entry);
  });

  // Sort by period
  Object.keys(grouped).forEach(day => {
    grouped[day].sort((a, b) => a.period - b.period);
  });

  res.status(200).json({
    success: true,
    data: {
      ...timetable.toObject(),
      groupedEntries: grouped,
    },
  });
});

/* ================= GET TEACHER SCHEDULE ================= */
exports.getTeacherSchedule = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  const schedules = await Timetable.getTeacherSchedule(teacherId);

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules,
  });
});

/* ================= UPDATE TIMETABLE ================= */
exports.updateTimetable = asyncHandler(async (req, res) => {
  const timetable = await Timetable.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('class', 'name section')
   .populate('entries.teacher', 'firstName lastName');

  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Timetable updated successfully',
    data: timetable,
  });
});

/* ================= DELETE TIMETABLE ================= */
exports.deleteTimetable = asyncHandler(async (req, res) => {
  const timetable = await Timetable.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Timetable deleted successfully',
  });
});

/* ================= GET ALL TIMETABLES ================= */
exports.getAllTimetables = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;

  const query = { isActive: true };
  if (academicYear) query.academicYear = academicYear;

  const timetables = await Timetable.find(query)
    .populate('class', 'name section')
    .populate('academicYear', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: timetables.length,
    data: timetables,
  });
});
