const express = require('express');
const {
  createClass,
  getAllClasses,
  getClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getAllClasses)
  .post(authorize('admin'), createClass);

router.route('/:id')
  .get(getClass)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

module.exports = router;
