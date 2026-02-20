/**
 * Request Validation Middleware
 * Provides reusable validation schemas for common operations
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // MongoDB ObjectId validation
  mongoId: (field = 'id') => 
    param(field)
      .isMongoId()
      .withMessage('Invalid ID format'),

  // Email validation
  email: (field = 'email', required = true) => {
    const validator = body(field)
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail();
    
    return required ? validator.notEmpty().withMessage('Email is required') : validator.optional();
  },

  // String validation
  string: (field, options = {}) => {
    const { required = true, min = 1, max = 255 } = options;
    const validator = body(field)
      .trim()
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`);
    
    return required 
      ? validator.notEmpty().withMessage(`${field} is required`)
      : validator.optional();
  },

  // Phone validation
  phone: (field = 'phone', required = true) => {
    const validator = body(field)
      .trim()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Invalid phone number format');
    
    return required ? validator.notEmpty().withMessage('Phone number is required') : validator.optional();
  },

  // Date validation
  date: (field, required = true) => {
    const validator = body(field)
      .isISO8601()
      .withMessage('Invalid date format (use ISO 8601)');
    
    return required ? validator.notEmpty().withMessage(`${field} is required`) : validator.optional();
  },

  // Number validation
  number: (field, options = {}) => {
    const { required = true, min, max } = options;
    let validator = body(field).isNumeric().withMessage(`${field} must be a number`);
    
    if (min !== undefined) {
      validator = validator.isFloat({ min }).withMessage(`${field} must be at least ${min}`);
    }
    if (max !== undefined) {
      validator = validator.isFloat({ max }).withMessage(`${field} must be at most ${max}`);
    }
    
    return required ? validator.notEmpty().withMessage(`${field} is required`) : validator.optional();
  },

  // Boolean validation
  boolean: (field, required = false) => {
    const validator = body(field).isBoolean().withMessage(`${field} must be true or false`);
    return required ? validator.notEmpty() : validator.optional();
  },

  // Array validation
  array: (field, options = {}) => {
    const { required = true, min, max } = options;
    let validator = body(field).isArray().withMessage(`${field} must be an array`);
    
    if (min !== undefined) {
      validator = validator.isArray({ min }).withMessage(`${field} must have at least ${min} items`);
    }
    if (max !== undefined) {
      validator = validator.isArray({ max }).withMessage(`${field} must have at most ${max} items`);
    }
    
    return required ? validator.notEmpty() : validator.optional();
  },

  // Enum validation
  enum: (field, values, required = true) => {
    const validator = body(field)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`);
    
    return required ? validator.notEmpty() : validator.optional();
  },

  // Password validation
  password: (field = 'password', required = true) => {
    const validator = body(field)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long');
    
    return required ? validator.notEmpty().withMessage('Password is required') : validator.optional();
  }
};

/**
 * Validation schemas for specific routes
 */
const validationSchemas = {
  // Student validation
  createStudent: [
    validationRules.string('firstName', { min: 2, max: 50 }),
    validationRules.string('lastName', { min: 2, max: 50 }),
    validationRules.email('email'),
    validationRules.phone('phone'),
    validationRules.date('dateOfBirth'),
    validationRules.enum('gender', ['male', 'female', 'other']),
    validationRules.mongoId('class').custom(value => value !== undefined).withMessage('Class is required'),
    validationRules.string('section', { min: 1, max: 10 }),
    handleValidationErrors
  ],

  updateStudent: [
    validationRules.mongoId(),
    validationRules.string('firstName', { min: 2, max: 50, required: false }),
    validationRules.string('lastName', { min: 2, max: 50, required: false }),
    validationRules.email('email', false),
    validationRules.phone('phone', false),
    validationRules.date('dateOfBirth', false),
    validationRules.enum('gender', ['male', 'female', 'other'], false),
    handleValidationErrors
  ],

  // Teacher validation
  createTeacher: [
    validationRules.string('firstName', { min: 2, max: 50 }),
    validationRules.string('lastName', { min: 2, max: 50 }),
    validationRules.email('email'),
    validationRules.phone('phone'),
    validationRules.date('dateOfBirth'),
    validationRules.enum('gender', ['male', 'female', 'other']),
    validationRules.string('department', { min: 2, max: 50 }),
    handleValidationErrors
  ],

  // Attendance validation
  markAttendance: [
    validationRules.date('date'),
    validationRules.mongoId('class').custom(value => value !== undefined).withMessage('Class is required'),
    validationRules.string('section', { min: 1, max: 10 }),
    validationRules.array('records', { min: 1 }),
    handleValidationErrors
  ],

  // Fee validation
  createFeeStructure: [
    validationRules.string('name', { min: 2, max: 100 }),
    validationRules.mongoId('class').custom(value => value !== undefined).withMessage('Class is required'),
    validationRules.number('amount', { min: 0 }),
    validationRules.enum('frequency', ['monthly', 'quarterly', 'half-yearly', 'annual', 'one-time']),
    handleValidationErrors
  ],

  // Authentication validation
  login: [
    validationRules.string('username', { min: 3, max: 50 }),
    validationRules.password(),
    handleValidationErrors
  ],

  register: [
    validationRules.string('username', { min: 3, max: 50 }),
    validationRules.email('email'),
    validationRules.password(),
    validationRules.enum('role', ['student', 'teacher', 'admin']),
    handleValidationErrors
  ],

  // Generic validation
  getById: [
    validationRules.mongoId(),
    handleValidationErrors
  ],

  // Query validation for pagination
  paginationQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ]
};

module.exports = {
  validationRules,
  validationSchemas,
  handleValidationErrors
};
