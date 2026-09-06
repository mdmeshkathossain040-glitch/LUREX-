const { error, AppError } = require('../utils/response');
const config = require('../config/env');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return error(res, err.code, err.message, err.statusCode, err.details);
  }

  console.error('[Unhandled Server Error]:', err);

  const message = config.NODE_ENV === 'production' 
    ? 'An internal server error occurred' 
    : err.message;

  return error(res, 'INTERNAL_SERVER_ERROR', message, 500, config.NODE_ENV === 'development' ? err.stack : undefined);
}

module.exports = errorHandler;
