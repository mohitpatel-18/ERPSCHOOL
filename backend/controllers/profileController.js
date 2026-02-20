const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const cloudinary = require('../config/cloudinary');

/* =====================================================
   STUDENT PROFILE MANAGEMENT
===================================================== */

// Get complete student profile
exports.getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id })
    .populate('userId', 'name email phone avatar isVerified lastLogin')
    .populate('class', 'name section classTeacher')
    .populate('academicYear', 'year name')
    .populate('documents.verifiedBy', 'name')
    .populate('disciplineRecords.reportedBy', 'firstName lastName');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found',
    });
  }

  res.json({
    success: true,
    data: student,
  });
});

// Update student profile
exports.updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'phone', 'address', 'permanentAddress', 'father', 'mother', 'guardian',
    'medicalInfo', 'transportInfo', 'hostelInfo', 'bloodGroup', 'nationality', 'religion'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      student[field] = req.body[field];
    }
  });

  student.lastUpdatedBy = req.user.id;
  await student.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: student,
  });
});

// Upload student profile photo
exports.uploadStudentPhoto = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Delete old photo from cloudinary if exists
  if (student.profilePhoto) {
    const publicId = student.profilePhoto.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`students/${publicId}`);
  }

  student.profilePhoto = req.file.path; // Cloudinary URL
  await student.save();

  res.json({
    success: true,
    message: 'Profile photo uploaded successfully',
    data: { profilePhoto: student.profilePhoto },
  });
});

// Add student document
exports.addStudentDocument = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { documentType, documentName } = req.body;

  await student.addDocument({
    documentType,
    documentName,
    documentUrl: req.file.path,
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: student.documents,
  });
});

// Add student activity
exports.addStudentActivity = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found',
    });
  }

  await student.addActivity(req.body);

  res.status(201).json({
    success: true,
    message: 'Activity added successfully',
    data: student.activities,
  });
});

/* =====================================================
   TEACHER PROFILE MANAGEMENT
===================================================== */

// Get complete teacher profile
exports.getTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.id })
    .populate('userId', 'name email phone avatar isVerified lastLogin')
    .populate('assignedClasses', 'name section')
    .populate('documents.verifiedBy', 'name')
    .select('+salary +salaryStructure'); // Include salary for own profile

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found',
    });
  }

  res.json({
    success: true,
    data: teacher,
  });
});

// Update teacher profile
exports.updateTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'phone', 'address', 'permanentAddress', 'emergencyContact',
    'bloodGroup', 'maritalStatus', 'bankDetails', 'qualification', 'specialization'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      teacher[field] = req.body[field];
    }
  });

  teacher.lastUpdatedBy = req.user.id;
  await teacher.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: teacher,
  });
});

// Upload teacher profile photo
exports.uploadTeacherPhoto = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Delete old photo if exists
  if (teacher.profilePhoto) {
    const publicId = teacher.profilePhoto.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`teachers/${publicId}`);
  }

  teacher.profilePhoto = req.file.path;
  await teacher.save();

  res.json({
    success: true,
    message: 'Profile photo uploaded successfully',
    data: { profilePhoto: teacher.profilePhoto },
  });
});

// Add teacher certification
exports.addTeacherCertification = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found',
    });
  }

  if (req.file) {
    req.body.certificateUrl = req.file.path;
  }

  await teacher.addCertification(req.body);

  res.status(201).json({
    success: true,
    message: 'Certification added successfully',
    data: teacher.certifications,
  });
});

// Add teacher training
exports.addTeacherTraining = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found',
    });
  }

  if (req.file) {
    req.body.certificateUrl = req.file.path;
  }

  await teacher.addTraining(req.body);

  res.status(201).json({
    success: true,
    message: 'Training added successfully',
    data: teacher.trainings,
  });
});

// Add teacher document
exports.addTeacherDocument = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { documentType, documentName } = req.body;

  await teacher.addDocument({
    documentType,
    documentName,
    documentUrl: req.file.path,
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: teacher.documents,
  });
});

/* =====================================================
   ADMIN PROFILE MANAGEMENT
===================================================== */

// Get complete admin profile
exports.getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ userId: req.user.id })
    .populate('userId', 'name email phone avatar isVerified lastLogin');

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin profile not found',
    });
  }

  res.json({
    success: true,
    data: admin,
  });
});

// Update admin profile
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ userId: req.user.id });

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin profile not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'phone', 'address', 'emergencyContact', 'bloodGroup',
    'bankDetails', 'qualification', 'department'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      admin[field] = req.body[field];
    }
  });

  await admin.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: admin,
  });
});

// Upload admin profile photo
exports.uploadAdminPhoto = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ userId: req.user.id });

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin profile not found',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Delete old photo if exists
  if (admin.profilePhoto) {
    const publicId = admin.profilePhoto.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`admins/${publicId}`);
  }

  admin.profilePhoto = req.file.path;
  await admin.save();

  res.json({
    success: true,
    message: 'Profile photo uploaded successfully',
    data: { profilePhoto: admin.profilePhoto },
  });
});

module.exports = exports;
