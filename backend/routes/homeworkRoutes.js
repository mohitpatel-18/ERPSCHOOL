const express = require('express');
const router = express.Router();
const {
  createHomework,
  getAllHomework,
  getHomeworkById,
  updateHomework,
  deleteHomework,
  submitHomework,
  gradeHomework,
  getStudentSubmissions,
  getHomeworkSubmissions,
  getPendingHomework,
} = require('../controllers/homeworkController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

/* ================= TEACHER ROUTES ================= */
router.post('/', authorize('teacher', 'admin'), createHomework);
router.get('/', authorize('teacher', 'admin', 'student'), getAllHomework);
router.get('/:id', authorize('teacher', 'admin', 'student'), getHomeworkById);
router.put('/:id', authorize('teacher', 'admin'), updateHomework);
router.delete('/:id', authorize('teacher', 'admin'), deleteHomework);

router.get('/:homeworkId/submissions', authorize('teacher', 'admin'), getHomeworkSubmissions);
router.post('/submissions/:submissionId/grade', authorize('teacher', 'admin'), gradeHomework);

/* ================= STUDENT ROUTES ================= */
router.post('/:homeworkId/submit', authorize('student'), submitHomework);
router.get('/student/:studentId/submissions', authorize('student', 'admin'), getStudentSubmissions);
router.get('/student/pending', authorize('student'), getPendingHomework);

module.exports = router;
