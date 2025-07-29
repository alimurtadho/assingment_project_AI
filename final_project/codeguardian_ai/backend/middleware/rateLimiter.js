const rateLimit = require('express-rate-limit');

// General rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many file uploads, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// API rate limiting for analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 analysis requests per 10 minutes
  message: {
    error: 'Too many analysis requests, please try again later.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many analysis requests, please try again later.',
      retryAfter: '10 minutes'
    });
  }
});

// Dashboard API rate limiting (more lenient)
const dashboardLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 dashboard requests per 5 minutes
  message: {
    error: 'Too many dashboard requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many dashboard requests, please try again later.',
      retryAfter: '5 minutes'
    });
  }
});

// Create a rate limiter with custom options
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: options.message || 'Too many requests, please try again later.',
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Rate limiting middleware based on user type (if authenticated)
const createUserBasedLimiter = (premiumMax = 200, regularMax = 100) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
      // Check if user is premium (implement your own logic)
      if (req.user && req.user.isPremium) {
        return premiumMax;
      }
      return regularMax;
    },
    message: {
      error: 'Rate limit exceeded based on your account type.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user ? `user:${req.user.id}` : req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: 'Rate limit exceeded based on your account type.',
      });
    }
  });
};

// Rate limiting for specific endpoints with different rules
const endpointLimiters = {
  '/api/auth/login': authLimiter,
  '/api/auth/register': authLimiter,
  '/api/auth/forgot-password': authLimiter,
  '/api/scan/upload': uploadLimiter,
  '/api/analysis/*': analysisLimiter,
  '/api/dashboard/*': dashboardLimiter
};

// Middleware to apply rate limiting based on endpoint
const smartRateLimiter = (req, res, next) => {
  const path = req.path;
  
  // Check for specific endpoint limiters
  for (const [pattern, limiter] of Object.entries(endpointLimiters)) {
    if (pattern.includes('*')) {
      const basePattern = pattern.replace('*', '');
      if (path.startsWith(basePattern)) {
        return limiter(req, res, next);
      }
    } else if (path === pattern) {
      return limiter(req, res, next);
    }
  }
  
  // Default to general limiter
  return generalLimiter(req, res, next);
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  analysisLimiter,
  dashboardLimiter,
  createCustomLimiter,
  createUserBasedLimiter,
  smartRateLimiter,
  endpointLimiters
};
