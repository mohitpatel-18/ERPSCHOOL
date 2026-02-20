const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const profileController = require('../controllers/profileController');

/* =====================================================
   STUDENT PROFILE ROUTES
===================================================== */
router.get('/student', protect, profileController.getStudentProfile);
router.put('/student', protect, profileController.updateStudentProfile);
router.post('/student/photo', protect, uploadAvatar.single('photo'), profileController.uploadStudentPhoto);
router.post('/student/document', protect, uploadAvatar.single('document'), profileController.addStudentDocument);
router.post('/student/activity', protect, profileController.addStudentActivity);

/* =====================================================
   TEACHER PROFILE ROUTES
===================================================== */
router.get('/teacher', protect, profileController.getTeacherProfile);
router.put('/teacher', protect, profileController.updateTeacherProfile);
router.post('/teacher/photo', protect, uploadAvatar.single('photo'), profileController.uploadTeacherPhoto);
router.post('/teacher/certification', protect, uploadAvatar.single('certificate'), profileController.addTeacherCertification);
router.post('/teacher/training', protect, uploadAvatar.single('certificate'), profileController.addTeacherTraining);
router.post('/teacher/document', protect, uploadAvatar.single('document'), profileController.addTeacherDocument);

/* =====================================================
   ADMIN PROFILE ROUTES
===================================================== */
router.get('/admin', protect, profileController.getAdminProfile);
router.put('/admin', protect, profileController.updateAdminProfile);
router.post('/admin/photo', protect, uploadAvatar.single('photo'), profileController.uploadAdminPhoto);

module.exports = router;
