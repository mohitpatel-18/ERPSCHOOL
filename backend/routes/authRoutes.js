const express = require('express');
const {
  register,
  verifyOTP,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const router = express.Router();

/* ===================== AUTH FLOW ===================== */

// Register → OTP required
router.post('/register', register);

// Login → OTP required (Teacher / Student)
router.post('/login', login);

// OTP verification
router.post('/verify-otp', verifyOTP);

/* ===================== USER ===================== */

// Get logged-in user
router.get('/me', protect, getMe);

// Logout
router.get('/logout', protect, logout);

/* ===================== PASSWORD ===================== */

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.put('/reset-password/:resettoken', resetPassword);

// Update password
router.put('/update-password', protect, updatePassword);

module.exports = router;
