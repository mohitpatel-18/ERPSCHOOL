// utils/apiResponse.js
// Standardized response format for all API endpoints
// Usage: res.success(data, 'Message') / res.fail('Error msg', 400)

const apiResponse = (req, res, next) => {

  // ✅ Success response
  res.success = (data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  // ❌ Error response
  res.fail = (message = 'Something went wrong', statusCode = 400, errors = null) => {
    const body = {
      success: false,
      message,
    };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
  };

  // 📋 Paginated response
  res.paginate = (data, total, page, limit) => {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  };

  next();
};

// ✅ Helper functions for use in controllers
const successResponse = (data = null, message = 'Success', meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...meta
  };
};

const errorResponse = (message = 'Error', code = 'ERROR', meta = {}) => {
  return {
    success: false,
    message,
    code,
    ...meta
  };
};

module.exports = apiResponse;
module.exports.successResponse = successResponse;
module.exports.errorResponse = errorResponse;