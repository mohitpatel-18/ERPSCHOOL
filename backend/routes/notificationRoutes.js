const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

/* ================= ALL USERS ================= */
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

/* ================= ADMIN/TEACHER ONLY ================= */
router.post('/', authorize('admin', 'teacher'), createNotification);

module.exports = router;
