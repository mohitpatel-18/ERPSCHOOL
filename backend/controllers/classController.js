const Class = require('../models/Class');
const Student = require('../models/Student');

// @desc    Create class
// @route   POST /api/class
// @access  Private/Admin
exports.createClass = async (req, res, next) => {
  try {
    const { name, section, classTeacher, subjects, academicYear } = req.body;

    // Check if class already exists
    const classExists = await Class.findOne({ name, section, academicYear });

    if (classExists) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name and section already exists',
      });
    }

    const newClass = await Class.create({
      name,
      section,
      classTeacher,
      subjects: subjects || [],
      academicYear,
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all classes
// @route   GET /api/class
// @access  Private
exports.getAllClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate({
        path: 'classTeacher',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .sort({ name: 1, section: 1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class
// @route   GET /api/class/:id
// @access  Private
exports.getClass = async (req, res, next) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate({
        path: 'classTeacher',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const students = await Student.find({
      class: classData._id,
      status: 'active',
    }).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: {
        class: classData,
        students,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/class/:id
// @access  Private/Admin
exports.updateClass = async (req, res, next) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('classTeacher');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: classData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/class/:id
// @access  Private/Admin
exports.deleteClass = async (req, res, next) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const studentsCount = await Student.countDocuments({
      class: classData._id,
    });

    if (studentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with active students',
      });
    }

    await classData.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
