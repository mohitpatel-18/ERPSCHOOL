const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

/* ================= GET USER NOTIFICATIONS ================= */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, category } = req.query;

  const query = { recipient: req.user._id };
  if (category) query.category = category;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  const unreadCount = await Notification.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

/* ================= MARK NOTIFICATION AS READ ================= */
exports.markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: req.user._id,
    },
    {
      isRead: true,
      readAt: new Date(),
    },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

/* ================= MARK ALL AS READ ================= */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

/* ================= DELETE NOTIFICATION ================= */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

/* ================= GET UNREAD COUNT ================= */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    data: { count },
  });
});

/* ================= CREATE NOTIFICATION (Admin/Teacher) ================= */
exports.createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, category, recipients } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Recipients array required',
    });
  }

  const notifications = [];

  for (const recipientId of recipients) {
    const notification = await Notification.createNotification({
      title,
      message,
      type,
      category,
      recipient: recipientId,
    });
    notifications.push(notification);
  }

  res.status(201).json({
    success: true,
    message: `Notification sent to ${notifications.length} users`,
    data: notifications,
  });
});
