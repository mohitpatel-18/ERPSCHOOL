const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');

/* ================= CREATE EXAM ================= */
exports.createExam = asyncHandler(async (req, res) => {
  const {
    name,
    examType,
    class: classId,
    subject,
    academicYear,
    totalMarks,
    passingMarks,
    examDate,
    duration,
    syllabus,
    instructions,
  } = req.body;

  const exam = await Exam.create({
    name,
    examType,
    class: classId,
    subject,
    academicYear,
    totalMarks,
    passingMarks,
    examDate,
    duration,
    syllabus,
    instructions,
    createdBy: req.user.teacherId,
  });

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: exam,
  });
});

/* ================= GET ALL EXAMS ================= */
exports.getAllExams = asyncHandler(async (req, res) => {
  const { class: classId, subject, academicYear } = req.query;

  const query = {};
  if (classId) query.class = classId;
  if (subject) query.subject = subject;
  if (academicYear) query.academicYear = academicYear;

  const exams = await Exam.find(query)
    .populate('class', 'name section')
    .populate('academicYear', 'name')
    .populate('createdBy', 'firstName lastName')
    .sort({ examDate: -1 });

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams,
  });
});

/* ================= GET EXAM BY ID ================= */
exports.getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate('class', 'name section')
    .populate('academicYear', 'name')
    .populate('createdBy', 'firstName lastName');

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found',
    });
  }

  res.status(200).json({
    success: true,
    data: exam,
  });
});

/* ================= UPDATE EXAM ================= */
exports.updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Exam updated successfully',
    data: exam,
  });
});

/* ================= DELETE EXAM ================= */
exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Exam deleted successfully',
  });
});

/* ================= PUBLISH EXAM ================= */
exports.publishExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    { isPublished: true },
    { new: true }
  ).populate('class');

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found',
    });
  }

  // Notify students using bulk insert
  const students = await Student.find({ class: exam.class._id })
    .select('userId')
    .lean();
  
  if (students.length > 0) {
    const notifications = students
      .filter(s => s.userId)
      .map(student => ({
        title: 'New Exam Scheduled',
        message: `${exam.name} - ${exam.subject} scheduled on ${new Date(exam.examDate).toLocaleDateString()}`,
        type: 'info',
        category: 'exam',
        recipient: student.userId,
        relatedModel: 'Exam',
        relatedId: exam._id,
        link: '/student/exams',
        icon: 'clipboard-check',
        isRead: false
      }));
    
    await Notification.insertMany(notifications);
  }

  res.status(200).json({
    success: true,
    message: 'Exam published and students notified',
    data: exam,
  });
});

/* ================= ENTER MARKS (Bulk) ================= */
exports.enterMarks = asyncHandler(async (req, res) => {
  const { examId, results } = req.body; // results = [{ studentId, marksObtained, remarks }]

  if (!Array.isArray(results) || results.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Results array required',
    });
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found',
    });
  }

  const createdResults = [];

  for (const result of results) {
    const existingResult = await ExamResult.findOne({
      exam: examId,
      student: result.studentId,
    });

    if (existingResult) {
      // Update existing
      existingResult.marksObtained = result.marksObtained;
      existingResult.remarks = result.remarks;
      existingResult.evaluatedBy = req.user.teacherId;
      existingResult.evaluatedAt = new Date();
      await existingResult.save();
      createdResults.push(existingResult);
    } else {
      // Create new
      const examResult = await ExamResult.create({
        exam: examId,
        student: result.studentId,
        marksObtained: result.marksObtained,
        remarks: result.remarks,
        status: result.status || 'pass',
        evaluatedBy: req.user.teacherId,
      });
      createdResults.push(examResult);
    }
  }

  res.status(201).json({
    success: true,
    message: `Marks entered for ${createdResults.length} students`,
    data: createdResults,
  });
});

/* ================= PUBLISH RESULTS ================= */
exports.publishResults = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    {
      resultPublished: true,
      resultPublishedDate: new Date(),
    },
    { new: true }
  ).populate('class');

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found',
    });
  }

  // Notify students
  const students = await Student.find({ class: exam.class._id })
    .select('userId')
    .lean();
  
  if (students.length > 0) {
    const notifications = students
      .filter(s => s.userId)
      .map(student => ({
        title: 'Exam Results Published',
        message: `Results for ${exam.name} - ${exam.subject} are now available`,
        type: 'success',
        category: 'exam',
        recipient: student.userId,
        relatedModel: 'Exam',
        relatedId: exam._id,
        link: '/student/results',
        icon: 'award',
        isRead: false
      }));
    
    await Notification.insertMany(notifications);
  }

  res.status(200).json({
    success: true,
    message: 'Results published and students notified',
    data: exam,
  });
});

/* ================= GET STUDENT RESULTS ================= */
exports.getStudentResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;

  const results = await ExamResult.find({ student: studentId })
    .populate({
      path: 'exam',
      match: academicYear ? { academicYear } : {},
      populate: [
        { path: 'class', select: 'name section' },
        { path: 'academicYear', select: 'name' },
      ],
    })
    .sort({ createdAt: -1 });

  // Filter out null exams (from academicYear filter)
  const filteredResults = results.filter(r => r.exam);

  res.status(200).json({
    success: true,
    count: filteredResults.length,
    data: filteredResults,
  });
});

/* ================= GET EXAM RESULTS (Class Performance) ================= */
exports.getExamResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const results = await ExamResult.find({ exam: examId })
    .populate('student', 'firstName lastName studentId')
    .populate('evaluatedBy', 'firstName lastName')
    .sort({ marksObtained: -1 });

  const performance = await ExamResult.getClassPerformance(examId);

  res.status(200).json({
    success: true,
    count: results.length,
    data: {
      results,
      performance,
    },
  });
});

/* ================= GET UPCOMING EXAMS ================= */
exports.getUpcomingExams = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const exams = await Exam.getUpcomingExams(classId);

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams,
  });
});
