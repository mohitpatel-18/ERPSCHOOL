/**
 * Custom Error Classes for better error handling
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.resource = resource;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * Error response formatter
 */
const formatErrorResponse = (err, env = 'development') => {
  const response = {
    success: false,
    status: err.status || 'error',
    message: err.message || 'An error occurred',
  };

  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Add validation errors from Mongoose
  if (err.name === 'ValidationError' && err.errors) {
    response.errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
  }

  // Add duplicate key errors
  if (err.code === 11000 && err.keyPattern) {
    response.message = 'Duplicate entry found';
    response.duplicateFields = Object.keys(err.keyPattern);
  }

  // In development, include stack trace
  if (env === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  return response;
};

/**
 * Async error handler wrapper
 * Use this to wrap async route handlers
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle specific error types
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new BadRequestError(message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new ConflictError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message
  }));
  return new ValidationError('Validation failed', errors);
};

const handleJWTError = () => {
  return new UnauthorizedError('Invalid token. Please log in again.');
};

const handleJWTExpiredError = () => {
  return new UnauthorizedError('Your token has expired. Please log in again.');
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  formatErrorResponse,
  catchAsync,
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError
};
