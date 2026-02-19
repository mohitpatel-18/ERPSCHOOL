const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const crypto = require('crypto');
const generateOTP = require('../utils/otpGenerator');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

/* ===================== REGISTER ===================== */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    await sendOTPEmail(email, name, otp);

    res.status(201).json({
      success: true,
      requiresOTP: true,
      email: user.email,
      message: 'OTP sent to email for verification',
    });
  } catch (error) {
    next(error);
  }
};

/* ===================== VERIFY OTP ===================== */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // ✅ verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    let details = {};
    if (user.role === 'teacher') {
      details = await Teacher.findOne({ userId: user._id }).populate('classes');
    } else if (user.role === 'student') {
      details = await Student.findOne({ userId: user._id }).populate('class');
    }

    sendTokenResponse(user, details, 200, res);
  } catch (error) {
    next(error);
  }
};

/* ===================== LOGIN ===================== */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/ID and password',
      });
    }

    let user = null;

    // 🔹 Email login
    if (email.includes('@')) {
      user = await User.findOne({ email }).select('+password');
    }
    // 🔹 ID login
    else {
      if (role === 'teacher') {
        const teacher = await Teacher.findOne({ employeeId: email }).populate('userId');
        if (teacher) {
          user = await User.findById(teacher.userId._id).select('+password');
        }
      }

      if (role === 'student') {
        const student = await Student.findOne({ studentId: email }).populate('userId');
        if (student) {
          user = await User.findById(student.userId._id).select('+password');
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 🔥 OTP REQUIRED FOR UNVERIFIED TEACHER / STUDENT
    if (user.role !== 'admin' && !user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      await sendOTPEmail(user.email, user.name, otp);

      return res.status(200).json({
        success: true,
        requiresOTP: true,
        email: user.email,
      });
    }

    // ✅ Direct login (admin OR verified user)
    sendTokenResponse(user, {}, 200, res);
  } catch (error) {
    next(error);
  }
};

/* ===================== GET ME ===================== */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/* ===================== FORGOT PASSWORD ===================== */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Reset link sent',
    });
  } catch (error) {
    next(error);
  }
};

/* ===================== RESET PASSWORD ===================== */
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, {}, 200, res);
  } catch (error) {
    next(error);
  }
};

/* ===================== UPDATE PASSWORD ===================== */
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* ===================== LOGOUT ===================== */
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/* ===================== TOKEN HELPER ===================== */
const sendTokenResponse = (user, details, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    details,
  });
};
