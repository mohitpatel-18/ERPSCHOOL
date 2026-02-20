const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

/* ================= CREATE HOMEWORK ================= */
exports.createHomework = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    class: classId,
    dueDate,
    maxMarks,
    attachments,
  } = req.body;

  const homework = await Homework.create({
    title,
    description,
    subject,
    class: classId,
    teacher: req.user.teacherId,
    dueDate,
    maxMarks,
    attachments: attachments || [],
  });

  // Notify students using bulk insert (much faster for 100+ students)
  const students = await Student.find({ class: classId })
    .select('userId')
    .lean();
  
  if (students.length > 0) {
    const notifications = students
      .filter(s => s.userId)
      .map(student => ({
        title: 'New Homework Assigned',
        message: `${subject}: ${title} - Due: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'info',
        category: 'homework',
        recipient: student.userId,
        relatedModel: 'Homework',
        relatedId: homework._id,
        link: '/student/homework',
        icon: 'book-open',
        isRead: false
      }));
    
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    message: 'Homework created and students notified',
    data: homework,
  });
});

/* ================= GET ALL HOMEWORK ================= */
exports.getAllHomework = asyncHandler(async (req, res) => {
  const { class: classId, subject, teacherId } = req.query;

  const query = { isActive: true };
  if (classId) query.class = classId;
  if (subject) query.subject = subject;
  if (teacherId) query.teacher = teacherId;

  const homework = await Homework.find(query)
    .populate('class', 'name section')
    .populate('teacher', 'firstName lastName')
    .sort({ dueDate: -1 });

  res.status(200).json({
    success: true,
    count: homework.length,
    data: homework,
  });
});

/* ================= GET HOMEWORK BY ID ================= */
exports.getHomeworkById = asyncHandler(async (req, res) => {
  const homework = await Homework.findById(req.params.id)
    .populate('class', 'name section')
    .populate('teacher', 'firstName lastName');

  if (!homework) {
    return res.status(404).json({
      success: false,
      message: 'Homework not found',
    });
  }

  res.status(200).json({
    success: true,
    data: homework,
  });
});

/* ================= UPDATE HOMEWORK ================= */
exports.updateHomework = asyncHandler(async (req, res) => {
  const homework = await Homework.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!homework) {
    return res.status(404).json({
      success: false,
      message: 'Homework not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Homework updated successfully',
    data: homework,
  });
});

/* ================= DELETE HOMEWORK ================= */
exports.deleteHomework = asyncHandler(async (req, res) => {
  const homework = await Homework.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!homework) {
    return res.status(404).json({
      success: false,
      message: 'Homework not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Homework deleted successfully',
  });
});

/* ================= SUBMIT HOMEWORK (Student) ================= */
exports.submitHomework = asyncHandler(async (req, res) => {
  const { homeworkId } = req.params;
  const { submissionText, attachments } = req.body;

  const homework = await Homework.findById(homeworkId);

  if (!homework) {
    return res.status(404).json({
      success: false,
      message: 'Homework not found',
    });
  }

  // Check if already submitted
  const existing = await HomeworkSubmission.findOne({
    homework: homeworkId,
    student: req.user.studentId,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Homework already submitted',
    });
  }

  const submission = await HomeworkSubmission.create({
    homework: homeworkId,
    student: req.user.studentId,
    submissionText,
    attachments: attachments || [],
  });

  // Notify teacher
  const populatedSubmission = await submission.populate([
    { path: 'homework', populate: { path: 'teacher', populate: 'userId' } },
    { path: 'student', populate: 'userId' },
  ]);

  if (populatedSubmission.homework.teacher?.userId) {
    await Notification.createNotification({
      title: 'Homework Submitted',
      message: `${populatedSubmission.student.userId.name} submitted: ${populatedSubmission.homework.title}`,
      type: 'info',
      category: 'homework',
      recipient: populatedSubmission.homework.teacher.userId._id,
      relatedModel: 'Homework',
      relatedId: homeworkId,
      link: '/teacher/homework',
      icon: 'check-circle',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Homework submitted successfully',
    data: submission,
  });
});

/* ================= GRADE HOMEWORK (Teacher) ================= */
exports.gradeHomework = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { marksObtained, feedback } = req.body;

  const submission = await HomeworkSubmission.findById(submissionId)
    .populate('homework')
    .populate('student', 'userId');

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found',
    });
  }

  if (marksObtained > submission.homework.maxMarks) {
    return res.status(400).json({
      success: false,
      message: 'Marks cannot exceed maximum marks',
    });
  }

  submission.marksObtained = marksObtained;
  submission.feedback = feedback;
  submission.gradedBy = req.user.teacherId;
  submission.gradedAt = new Date();
  await submission.save();

  // Notify student
  if (submission.student?.userId) {
    await Notification.createNotification({
      title: 'Homework Graded',
      message: `Your homework has been graded. Marks: ${marksObtained}/${submission.homework.maxMarks}`,
      type: 'success',
      category: 'homework',
      recipient: submission.student.userId,
      relatedModel: 'Homework',
      relatedId: submission.homework._id,
      link: '/student/homework',
      icon: 'star',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Homework graded successfully',
    data: submission,
  });
});

/* ================= GET STUDENT SUBMISSIONS ================= */
exports.getStudentSubmissions = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const submissions = await HomeworkSubmission.getStudentSubmissions(studentId);

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions,
  });
});

/* ================= GET HOMEWORK SUBMISSIONS (Teacher) ================= */
exports.getHomeworkSubmissions = asyncHandler(async (req, res) => {
  const { homeworkId } = req.params;

  const submissions = await HomeworkSubmission.getHomeworkSubmissions(homeworkId);

  // Get total students in class
  const homework = await Homework.findById(homeworkId);
  const totalStudents = await Student.countDocuments({ class: homework.class });

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions,
      stats: {
        submitted: submissions.length,
        pending: totalStudents - submissions.length,
        graded: submissions.filter(s => s.status === 'graded').length,
      },
    },
  });
});

/* ================= GET PENDING HOMEWORK (Student) ================= */
exports.getPendingHomework = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found',
    });
  }

  const homework = await Homework.find({
    class: student.class,
    isActive: true,
    dueDate: { $gte: new Date() },
  }).sort({ dueDate: 1 });

  // Get submitted homework IDs
  const submissions = await HomeworkSubmission.find({
    student: student._id,
  }).select('homework');

  const submittedIds = submissions.map(s => s.homework.toString());

  // Filter pending
  const pending = homework.filter(h => !submittedIds.includes(h._id.toString()));

  res.status(200).json({
    success: true,
    count: pending.length,
    data: pending,
  });
});
