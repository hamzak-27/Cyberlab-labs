import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

// Reference to User model (shared with frontend-team)
// We'll dynamically import it to avoid circular dependencies
let User = null;

const getUserModel = async () => {
  if (!User) {
    try {
      // Try to import from frontend-team models first, fallback to our own reference
      User = (await import('../../frontend-team/backend/src/models/User.js')).default;
    } catch (error) {
      // Create our own User reference that matches frontend-team structure
      const mongoose = await import('mongoose');
      
      // Check if model already exists to avoid OverwriteModelError
      if (mongoose.default.models.User) {
        User = mongoose.default.models.User;
      } else {
        const userSchema = new mongoose.Schema({
          username: String,
          fullName: String,
          email: String,
          role: { type: String, enum: ['user', 'admin'], default: 'user' },
          avatar: String,
          token: Number
        });
        User = mongoose.default.model('User', userSchema);
      }
    }
  }
  return User;
};

// Main authentication middleware (compatible with frontend-team)
const authorization = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check for token in cookies first (frontend-team pattern)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 2️⃣ Fallback to Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        error: 'UNAUTHORIZED'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from database
    const UserModel = await getUserModel();
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token - user not found',
        error: 'INVALID_TOKEN'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
};

// Optional authentication (sets user if token exists, but doesn't require it)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const UserModel = await getUserModel();
        const user = await UserModel.findById(decoded.userId);
        
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
          req.userRole = user.role;
        }
      } catch (tokenError) {
        // Token invalid, but continue without user
        console.warn('Optional auth token invalid:', tokenError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if optional auth fails
  }
};

// Admin-only middleware
const adminOnly = async (req, res, next) => {
  try {
    // Must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required',
        error: 'FORBIDDEN'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      message: 'Authorization error',
      error: 'AUTH_ERROR'
    });
  }
};

// User ownership or admin middleware
const userOrAdmin = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      // Admin can access anything
      if (req.user.role === 'admin') {
        return next();
      }

      // Get resource user ID from params, body, or query
      const resourceUserId = req.params[resourceUserIdField] || 
                           req.body[resourceUserIdField] || 
                           req.query[resourceUserIdField];

      // Check if user owns the resource
      if (resourceUserId && resourceUserId.toString() === req.userId) {
        return next();
      }

      return res.status(403).json({
        message: 'Access denied - insufficient permissions',
        error: 'FORBIDDEN'
      });
    } catch (error) {
      console.error('User or admin middleware error:', error);
      return res.status(500).json({
        message: 'Authorization error',
        error: 'AUTH_ERROR'
      });
    }
  };
};

// Rate limiting by user
const rateLimitByUser = (maxRequests = 100, windowMs = 60 * 60 * 1000) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.userId) {
      return next(); // Skip rate limiting for unauthenticated users
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or initialize user request tracking
    if (!userRequests.has(req.userId)) {
      userRequests.set(req.userId, []);
    }
    
    const requests = userRequests.get(req.userId);
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per hour.`,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    userRequests.set(req.userId, recentRequests);
    
    next();
  };
};

// Validate API key for admin operations
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== config.admin.setupKey) {
    return res.status(401).json({
      message: 'Invalid API key',
      error: 'INVALID_API_KEY'
    });
  }
  
  next();
};

// Middleware to ensure user has lab statistics
const ensureUserStats = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      });
    }

    // Dynamically import UserLabStats
    const { default: UserLabStats } = await import('../models/UserExtension.js');
    
    // Find or create user stats
    req.userStats = await UserLabStats.findOrCreate(req.userId);
    
    next();
  } catch (error) {
    console.error('User stats middleware error:', error);
    return res.status(500).json({
      message: 'Failed to load user statistics',
      error: 'STATS_ERROR'
    });
  }
};

export {
  authorization,
  optionalAuth,
  adminOnly,
  userOrAdmin,
  rateLimitByUser,
  validateApiKey,
  ensureUserStats
};

export default authorization;