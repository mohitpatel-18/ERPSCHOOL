const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Class = require('../models/Class');

const {
  generatePassword,
  generateEmployeeId,
} = require('../utils/generateCredentials');
const { sendCredentialsEmail } = require('../utils/sendEmail');

/* ================= TEACHERS ================= */
exports.addTeacher = async (req, res) => {
  const { name, email, phone, department, subjects } = req.body;

  if (await User.findOne({ email })) {
    return res.status(400).json({ success: false, message: 'User exists' });
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
    subjects,
  });

  await sendCredentialsEmail(email, name, 'teacher', employeeId, password);

  res.status(201).json({ success: true, data: teacher });
};

exports.getAllTeachers = async (req, res) => {
  const teachers = await Teacher.find()
    .populate('userId', 'name email phone')
    .populate('classes', 'name section');
  res.json({ success: true, data: teachers });
};

exports.getTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate('userId');
  res.json({ success: true, data: teacher });
};

exports.updateTeacher = async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, data: teacher });
};

exports.deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  await User.findByIdAndDelete(teacher.userId);
  await teacher.deleteOne();
  res.json({ success: true });
};

/* ================= STUDENTS ================= */
exports.addStudent = async (req, res) => {
  try {
    const { name, email, phone, classId, rollNumber } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const password = generatePassword();
    const studentId = generateEmployeeId(
      'student',
      await Student.countDocuments()
    );

    // ✅ CREATE USER
    const user = await User.create({
      name,
      email,
      phone,
      password, // (hashing already handled in User model)
      role: 'student',
      isVerified: true,
    });

    // ✅ CREATE STUDENT
    const student = await Student.create({
      userId: user._id,
      studentId,
      class: classId,
      rollNumber,
    });

    // ✅ SEND EMAIL (MISSING PART – FIXED)
    await sendCredentialsEmail(
      email,
      name,
      'student',
      studentId,
      password
    );

    res.status(201).json({
      success: true,
      message: 'Student added & credentials sent via email',
      data: student,
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student',
    });
  }
};

exports.getAllStudents = async (req, res) => {
  const students = await Student.find()
    .populate('userId', 'name email')
    .populate('class', 'name section');
  res.json({ success: true, data: students });
};

exports.getStudent = async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('userId')
    .populate('class');
  res.json({ success: true, data: student });
};

exports.updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, data: student });
};

exports.deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  await User.findByIdAndDelete(student.userId);
  await student.deleteOne();
  res.json({ success: true });
};
