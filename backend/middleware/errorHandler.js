const {
  formatErrorResponse,
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError
} = require('../utils/errorHandler');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error with context
  logger.error('Request Error', {
    message: err.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    user: req.user?.username || 'Anonymous',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Format and send error response
  const response = formatErrorResponse(error, process.env.NODE_ENV);
  
  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;