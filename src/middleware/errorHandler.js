const { validationResult } = require('express-validator');

class APIError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends APIError {
  constructor(message) { super(message, 400); }
}
class NotFoundError extends APIError {
  constructor(message = 'Resource not found') { super(message, 404); }
}
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden access') { super(message, 403); }
}

const successResponse = (res, message, data = null, statusCode = 200, extra = {}) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json({ ...response, ...extra });
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = { success: false, message };
  if (error !== null) response.error = error;
  return res.status(statusCode).json(response);
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', errors.array(), 400);
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 'Validation failed', messages, 400);
  }
  if (err.code === 11000) return errorResponse(res, 'Duplicate field value entered', err.keyValue, 400);
  if (err.name === 'CastError') return errorResponse(res, `Resource not found with id of ${err.value}`, null, 404);
  if (err.name === 'JsonWebTokenError') return errorResponse(res, 'Unauthorized', 'Invalid token', 401);
  if (err.name === 'TokenExpiredError') return errorResponse(res, 'Unauthorized', 'Token expired', 401);
  if (err instanceof APIError) return errorResponse(res, err.message, null, err.statusCode);
  return errorResponse(res, 'Internal Server Error', null, 500);
};

module.exports = { errorHandler, successResponse, errorResponse, validateRequest, APIError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError };
