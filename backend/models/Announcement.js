const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      enum: ["All", "Teachers", "Students"],
      default: "All",
    },

    // 🔥 Future ready: class-specific announcements
    targetClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXING (Performance Boost) ================= */
announcementSchema.index({ target: 1 });
announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ isActive: 1 });

/* ================= AUTO EXPIRE LOGIC ================= */
announcementSchema.pre("find", function () {
  this.where({
    expiryDate: { $gte: new Date() },
    isActive: true,
  });
});

announcementSchema.pre("findOne", function () {
  this.where({
    expiryDate: { $gte: new Date() },
    isActive: true,
  });
});

module.exports = mongoose.model("Announcement", announcementSchema);
