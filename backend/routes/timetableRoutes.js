const express = require('express');
const router = express.Router();
const {
  createTimetable,
  getTimetableByClass,
  getTeacherSchedule,
  updateTimetable,
  deleteTimetable,
  getAllTimetables,
} = require('../controllers/timetableController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

/* ================= ADMIN ROUTES ================= */
router.post('/', authorize('admin'), createTimetable);
router.get('/all', authorize('admin'), getAllTimetables);
router.put('/:id', authorize('admin'), updateTimetable);
router.delete('/:id', authorize('admin'), deleteTimetable);

/* ================= TEACHER & STUDENT ROUTES ================= */
router.get('/class/:classId', authorize('teacher', 'admin', 'student'), getTimetableByClass);
router.get('/teacher/:teacherId', authorize('teacher', 'admin'), getTeacherSchedule);

module.exports = router;
