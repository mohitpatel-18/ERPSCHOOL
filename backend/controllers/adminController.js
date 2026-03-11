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
  const { name, email, phone, classId, rollNumber, firstName, lastName, section } = req.body;

  // ✅ Support both 'name' and 'firstName/lastName' formats
  const fName = firstName || name?.split(' ')[0] || '';
  const lName = lastName || name?.split(' ').slice(1).join(' ') || '';

  if (!email || !classId || !rollNumber) {
    return res.status(400).json({
      success: false,
      message: 'Email, class and roll number are required',
    });
  }

  if (!fName) {
    return res.status(400).json({
      success: false,
      message: 'First name is required',
    });
  }

  // ✅ Check if student already exists
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    return res.status(400).json({
      success: false,
      message: 'Student already exists with this email',
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
    name: `${fName} ${lName}`.trim(),
    email,
    phone,
    password,
    role: 'student',
    isVerified: true,
  });

  const student = await Student.create({
    userId: user._id,
    studentId,
    firstName: fName,
    lastName: lName,
    email,
    phone: phone || '',
    class: classId,
    section: section || 'A',
    rollNumber,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    bloodGroup: req.body.bloodGroup,
    // ✅ Handle both old and new parent field formats
    father: {
      name: req.body.parentName || req.body.father?.name || '',
      phone: req.body.parentPhone || req.body.father?.phone || '',
      email: req.body.parentEmail || req.body.father?.email || '',
    },
    address: req.body.address,
    status: 'active',
  });

  await sendCredentialsEmail(email, `${fName} ${lName}`, 'student', studentId, password);

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
      .populate('academicYear', 'year')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  // ✅ ALIGN DATA: Merge userId fields and add contactNumber for frontend compatibility
  const alignedStudents = students.map(student => ({
    ...student,
    // Ensure firstName and lastName are available
    firstName: student.firstName || student.userId?.name?.split(' ')[0] || '',
    lastName: student.lastName || student.userId?.name?.split(' ').slice(1).join(' ') || '',
    // Add email and phone from userId if not in student
    email: student.email || student.userId?.email || '',
    phone: student.phone || student.userId?.phone || '',
    // Add contactNumber for frontend compatibility (same as phone)
    contactNumber: student.phone || student.userId?.phone || '',
    // Ensure status and isActive are both available
    status: student.status || 'active',
    isActive: student.status === 'active',
  }));

  res.json({
    success: true,
    data: alignedStudents,
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
    .populate('class', 'name section')
    .populate('academicYear', 'year')
    .lean();

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // ✅ ALIGN DATA: Merge userId fields and add contactNumber for frontend compatibility
  const alignedStudent = {
    ...student,
    firstName: student.firstName || student.userId?.name?.split(' ')[0] || '',
    lastName: student.lastName || student.userId?.name?.split(' ').slice(1).join(' ') || '',
    email: student.email || student.userId?.email || '',
    phone: student.phone || student.userId?.phone || '',
    contactNumber: student.phone || student.userId?.phone || '',
    status: student.status || 'active',
    isActive: student.status === 'active',
  };

  res.json({ success: true, data: alignedStudent });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('userId', 'name email phone')
    .populate('class', 'name section')
    .populate('academicYear', 'year')
    .lean();

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // ✅ ALIGN DATA for consistency
  const alignedStudent = {
    ...student,
    firstName: student.firstName || student.userId?.name?.split(' ')[0] || '',
    lastName: student.lastName || student.userId?.name?.split(' ').slice(1).join(' ') || '',
    email: student.email || student.userId?.email || '',
    phone: student.phone || student.userId?.phone || '',
    contactNumber: student.phone || student.userId?.phone || '',
    status: student.status || 'active',
    isActive: student.status === 'active',
  };

  res.json({ success: true, data: alignedStudent });
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