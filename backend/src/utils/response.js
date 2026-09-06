/**
 * Standard API Response utilities for LUREX
 */

function success(res, data = null, statusCode = 200, meta = null) {
  const payload = {
    success: true,
    data
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

function error(res, code = 'INTERNAL_SERVER_ERROR', message = 'An error occurred', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}

class AppError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = {
  success,
  error,
  AppError
};
