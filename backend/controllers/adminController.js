// backend/controllers/adminController.js
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Class = require('../models/Class');
const asyncHandler = require('../middleware/asyncHandler');

const {
  generatePassword,
  generateEmployeeId,
} = require('../utils/generateCredentials');
const { sendCredentialsEmail } = require('../utils/sendEmail');

/* ================= TEACHERS ================= */

exports.addTeacher = asyncHandler(async (req, res) => {
  const { name, email, phone, department, subjects, classes } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ success: false, message: 'Name, email and department are required' });
  }

  if (await User.findOne({ email })) {
    return res.status(400).json({ success: false, message: 'User already exists with this email' });
  }

  const password = generatePassword();
  const employeeId = generateEmployeeId('teacher', await Teacher.countDocuments());

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'teacher',
    isVerified: true,
  });

  const teacher = await Teacher.create({
    userId: user._id,
    employeeId,
    department,
    subjects: subjects || [],
    classes: classes || [],
  });

  // Assign teacher to classes if provided
  if (classes && classes.length > 0) {
    await Class.updateMany(
      { _id: { $in: classes } },
      { $set: { classTeacher: teacher._id } }
    );
  }

  await sendCredentialsEmail(email, name, 'teacher', employeeId, password);

  res.status(201).json({
    success: true,
    message: 'Teacher added & credentials sent via email',
    data: {
      teacher,
      credentials: {
        email,
        employeeId,
        temporaryPassword: password,
      },
    },
  });
});

exports.getAllTeachers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.department) filter.department = req.query.department;
  
  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .select('firstName lastName email employeeId department status')
      .populate('userId', 'name email')
      .populate('assignedClasses', 'name section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Teacher.countDocuments(filter)
  ]);

  res.json({ 
    success: true, 
    data: teachers,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
});

exports.getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('classes', 'name section');

  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }

  res.json({ success: true, data: teacher });
});

exports.updateTeacher = asyncHandler(async (req, res) => {
  // Map 'classes' to 'assignedClasses' for compatibility
  const updateData = { ...req.body };
  if (req.body.classes) {
    updateData.assignedClasses = req.body.classes;
    delete updateData.classes;
  }
  
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email phone')
    .populate('assignedClasses', 'name section');

  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }

  // Sync class assignments if classes array updated
  if (req.body.classes) {
    await Class.updateMany(
      { classTeacher: teacher._id },
      { $unset: { classTeacher: 1 } }
    );
    if (req.body.classes.length > 0) {
      await Class.updateMany(
        { _id: { $in: req.body.classes } },
        { $set: { classTeacher: teacher._id } }
      );
    }
  }

  res.json({ success: true, data: teacher });
});

exports.deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }

  await User.findByIdAndDelete(teacher.userId);
  await teacher.deleteOne();

  res.json({ success: true, message: 'Teacher deleted successfully' });
});

/* ================= STUDENTS ================= */

exports.addStudent = asyncHandler(async (req, res) => {
  const { name, email, phone, classId, rollNumber } = req.body;

  if (!name || !email || !classId || !rollNumber) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, class and roll number are required',
    });
  }

  if (await User.findOne({ email })) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  const password = generatePassword();
  const studentId = generateEmployeeId('student', await Student.countDocuments());

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'student',
    isVerified: true,
  });

  const student = await Student.create({
    userId: user._id,
    studentId,
    class: classId,
    rollNumber,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    bloodGroup: req.body.bloodGroup,
    parentName: req.body.parentName,
    parentPhone: req.body.parentPhone,
    parentEmail: req.body.parentEmail,
    address: req.body.address,
  });

  await sendCredentialsEmail(email, name, 'student', studentId, password);

  res.status(201).json({
    success: true,
    message: 'Student added & credentials sent via email',
    data: {
      student,
      credentials: {
        email,
        studentId,
        temporaryPassword: password,
      },
    },
  });
});

exports.getAllStudents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.classId) filter.class = req.query.classId;
  if (req.query.status) filter.status = req.query.status;

  // ✅ PAGINATION
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('userId', 'name email phone')
      .populate('class', 'name section')
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

exports.getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('class', 'name section');

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.json({ success: true, data: student });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.json({ success: true, data: student });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  await User.findByIdAndDelete(student.userId);
  await student.deleteOne();

  res.json({ success: true, message: 'Student deleted successfully' });
});