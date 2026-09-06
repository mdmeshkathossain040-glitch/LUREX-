const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { error } = require('../utils/response');
const { query } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'UNAUTHORIZED', 'Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'TOKEN_EXPIRED', 'Token has expired', 401);
      }
      return error(res, 'INVALID_TOKEN', 'Invalid authentication token', 401);
    }

    // Attach user information
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      phone: decoded.phone,
      email: decoded.email
    };

    next();
  } catch (err) {
    return error(res, 'AUTH_ERROR', 'Authentication failed', 401);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'FORBIDDEN', `Access restricted to ${allowedRoles.join(' or ')}`, 403);
    }
    next();
  };
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      phone: decoded.phone,
      email: decoded.email
    };
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}

module.exports = {
  authenticate,
  requireRole,
  optionalAuth
};
