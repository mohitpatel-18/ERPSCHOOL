const Announcement = require("../models/Announcement");

/* =========================================================
   CREATE (ADMIN ONLY)
========================================================= */
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, target, expiryDate, targetClass } = req.body;

    const announcement = await Announcement.create({
      title,
      description,
      target,
      expiryDate,
      targetClass: targetClass || null,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ANNOUNCEMENTS (ROLE BASED)
========================================================= */
exports.getAnnouncements = async (req, res, next) => {
  try {
    const role = req.user.role;

    let filter = {
      isActive: true,
      expiryDate: { $gte: new Date() },
    };

    if (role === "teacher") {
      filter.$or = [{ target: "All" }, { target: "Teachers" }];
    }

    if (role === "student") {
      filter.$or = [{ target: "All" }, { target: "Students" }];
    }

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   ADMIN: GET ALL (INCLUDING EXPIRED)
========================================================= */
exports.getAllAnnouncementsAdmin = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE
========================================================= */
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   TOGGLE ACTIVE (Soft Enable / Disable)
========================================================= */
exports.toggleAnnouncementStatus = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: "Announcement status updated",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE (SOFT DELETE)
========================================================= */
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.isActive = false;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: "Announcement deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};
