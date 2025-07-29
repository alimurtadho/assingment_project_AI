// Error handling middleware for Express applications
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom error class for application-specific errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Log error to file
const logError = (error, req) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req?.method,
    url: req?.url,
    userAgent: req?.get('User-Agent'),
    ip: req?.ip,
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    }
  };

  const logFilePath = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  
  try {
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  } catch (writeError) {
    console.error('Failed to write error log:', writeError);
  }
};

// Development error response
const sendErrorDev = (err, req, res) => {
  // Log error
  logError(err, req);
  
  // API Error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Rendered website error
  console.error('ERROR:', err);
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack
  });
};

// Production error response
const sendErrorProd = (err, req, res) => {
  // Log error
  logError(err, req);

  // API Error
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error('ERROR:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // Rendered website error
  if (err.isOperational) {
    console.error('ERROR:', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or other unknown error
  console.error('ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

// Handle specific error types
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Main error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// 404 Not Found handler
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation error handler
const validationErrorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors
    });
  }
  next(error);
};

// Rate limit error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  });
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
  validationErrorHandler,
  rateLimitHandler,
  logError
};
