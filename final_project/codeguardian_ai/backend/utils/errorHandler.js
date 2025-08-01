// Backend Utilities - Error Handler
const ResponseFormatter = require('./responseFormatter');
const Logger = require('./logger');

class ErrorHandler {
  // Global error handler middleware
  static globalErrorHandler(err, req, res, next) {
    Logger.error('Global error caught', err, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(
        ResponseFormatter.error('Validation Error', 400, errors)
      );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json(
        ResponseFormatter.error('Invalid token', 401)
      );
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(
        ResponseFormatter.error('Token expired', 401)
      );
    }

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        ResponseFormatter.error('File too large', 400, 'Maximum file size is 5MB')
      );
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json(
        ResponseFormatter.error('Unexpected file field', 400)
      );
    }

    // OpenAI API errors
    if (err.response && err.response.status === 401) {
      return res.status(500).json(
        ResponseFormatter.error('AI service configuration error', 500)
      );
    }

    if (err.response && err.response.status === 429) {
      return res.status(429).json(
        ResponseFormatter.error('AI service rate limit exceeded', 429)
      );
    }

    // Database errors
    if (err.code === 'P2002') { // Prisma unique constraint
      return res.status(409).json(
        ResponseFormatter.error('Resource already exists', 409)
      );
    }

    // Default error
    const statusCode = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;

    res.status(statusCode).json(
      ResponseFormatter.error(message, statusCode, 
        process.env.NODE_ENV === 'development' ? err.stack : null
      )
    );
  }

  // Async error wrapper
  static asyncWrapper(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // 404 handler
  static notFoundHandler(req, res) {
    res.status(404).json(
      ResponseFormatter.error(
        `Route ${req.originalUrl} not found`, 
        404
      )
    );
  }
}

module.exports = ErrorHandler;
