const express = require('express');
const router = express.Router();
const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  publishExam,
  enterMarks,
  publishResults,
  getStudentResults,
  getExamResults,
  getUpcomingExams,
} = require('../controllers/examController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

/* ================= TEACHER & ADMIN ROUTES ================= */
router.post('/', authorize('teacher', 'admin'), createExam);
router.get('/', authorize('teacher', 'admin', 'student'), getAllExams);
router.get('/:id', authorize('teacher', 'admin', 'student'), getExamById);
router.put('/:id', authorize('teacher', 'admin'), updateExam);
router.delete('/:id', authorize('teacher', 'admin'), deleteExam);

router.post('/:id/publish', authorize('teacher', 'admin'), publishExam);
router.post('/marks', authorize('teacher', 'admin'), enterMarks);
router.post('/:id/publish-results', authorize('teacher', 'admin'), publishResults);

/* ================= STUDENT ROUTES ================= */
router.get('/student/:studentId/results', authorize('student', 'admin'), getStudentResults);
router.get('/upcoming/:classId', authorize('student', 'teacher', 'admin'), getUpcomingExams);

/* ================= ADMIN/TEACHER ROUTES ================= */
router.get('/:examId/results', authorize('teacher', 'admin'), getExamResults);

module.exports = router;
