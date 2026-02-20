const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  message: {
    type: String,
    required: true,
    trim: true,
  },

  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'announcement'],
    default: 'info',
  },

  category: {
    type: String,
    enum: ['fee', 'exam', 'homework', 'attendance', 'announcement', 'general'],
    required: true,
    index: true,
  },

  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  relatedModel: {
    type: String,
    enum: ['Fee', 'Exam', 'Homework', 'Attendance', 'Leave'],
  },

  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

  readAt: {
    type: Date,
  },

  link: {
    type: String,
    trim: true,
  },

  icon: {
    type: String,
    default: 'bell',
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1 });
// Performance optimization for bulk operations
notificationSchema.index({ createdAt: -1 }); // For cleanup queries
notificationSchema.index({ recipient: 1, createdAt: -1 }); // For user notification history

/* ================= STATIC METHODS ================= */
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

notificationSchema.statics.getUserNotifications = function(userId, limit = 20) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

notificationSchema.statics.markAsRead = async function(notificationIds, userId) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

/* ================= HELPER FUNCTION TO CREATE NOTIFICATION ================= */
notificationSchema.statics.createNotification = async function(data) {
  return this.create({
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    category: data.category,
    recipient: data.recipient,
    relatedModel: data.relatedModel,
    relatedId: data.relatedId,
    link: data.link,
    icon: data.icon,
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
