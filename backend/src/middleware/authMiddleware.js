const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: verify JWT Bearer token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'intellicart_super_secret_jwt_token_key_btech_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Authorization denied.',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
        });
      }

      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided. Access denied.',
    });
  }
};

// Authorize admin role
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires administrator privileges.',
  });
};

// Optional authentication middleware: attaches req.user if valid token provided, but proceeds if not
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'intellicart_super_secret_jwt_token_key_btech_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // In optional auth, invalid token simply leaves req.user null
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, authorizeAdmin, optionalAuth };
