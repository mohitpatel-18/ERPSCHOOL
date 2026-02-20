const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false, // Changed to optional since not all flows provide it
    unique: true,
    sparse: true, // Allow multiple null values
    trim: true,
    lowercase: true,
    index: true,
  },
  
  name: {
    type: String,
    trim: true,
  },
  
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email'],
    index: true,
  },
  
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false,
  },
  
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true,
    index: true,
  },
  
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide valid phone number'],
  },
  
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    index: true,
  },
  
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    index: true,
  },
  
  otp: {
    type: String,
    select: false,
  },
  
  otpExpire: {
    type: Date,
    select: false,
  },
  
  resetPasswordToken: {
    type: String,
    select: false,
  },
  
  resetPasswordExpire: {
    type: Date,
    select: false,
  },
  
  lastLogin: {
    type: Date,
    index: true,
  },
  
  loginAttempts: {
    type: Number,
    default: 0,
  },
  
  lockUntil: {
    type: Date,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

/* ================= INDEXES ================= */
// Fast role-based queries
userSchema.index({ role: 1, isActive: 1 });

// Account security
userSchema.index({ email: 1, isActive: 1 });

/* ================= PRE HOOKS ================= */
// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update lastLogin timestamp on successful login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.loginAttempts = 0; // Reset login attempts
  return await this.save({ validateBeforeSave: false });
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts >= 4) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  this.loginAttempts += 1;
  return await this.save({ validateBeforeSave: false });
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > new Date();
};

/* ================= INSTANCE METHODS ================= */
// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/* ================= STATIC METHODS ================= */
// Get active users by role
userSchema.statics.getByRole = function(role) {
  return this.find({ role, isActive: true })
    .select('-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire');
};

// Search users
userSchema.statics.searchUsers = function(searchTerm, role = null) {
  const query = {
    $or: [
      { username: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ],
    isActive: true
  };
  
  if (role) query.role = role;
  
  return this.find(query).select('-password -otp -otpExpire');
};

module.exports = mongoose.model('User', userSchema);