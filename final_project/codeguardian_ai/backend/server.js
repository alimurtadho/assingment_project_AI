/**
 * Enhanced CodeGuardian AI Server
 * Refactored with improved architecture, error handling, and utility integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import enhanced utilities
const ResponseFormatter = require('./utils/responseFormatter');
const ValidationUtils = require('./utils/validationUtils');
const Logger = require('./utils/logger');
const ErrorHandler = require('./utils/errorHandler');

// Import refactored route handlers
const securityRoutes = require('./routes/security');
const aiReviewRoutes = require('./routes/ai-review');
const testGenerationRoutes = require('./routes/test-gen');

// Import original routes (will be gradually migrated)
const authRoutes = require('./routes/auth');

// Database connection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CodeGuardianServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize enhanced middleware stack
   */
  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-production-domain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: ResponseFormatter.error('Too many requests, please try again later.', 429),
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health';
      }
    });
    this.app.use('/api/', limiter);

    // Enhanced request logging with Winston
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => Logger.info(message.trim())
      }
    }));

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '50mb',
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf);
        } catch (e) {
          throw ErrorHandler.createError('INVALID_JSON', 'Invalid JSON in request body', 400);
        }
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Request ID middleware for tracking
    this.app.use((req, res, next) => {
      req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });

    // Request validation middleware
    this.app.use((req, res, next) => {
      // Log incoming requests
      Logger.info('Incoming request', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Add request start time for performance tracking
      req.startTime = Date.now();
      next();
    });

    // Serve static files (for production builds)
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static(path.join(__dirname, '../frontend/build')));
    }
  }

  /**
   * Initialize enhanced API routes
   */
  initializeRoutes() {
    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        services: {
          database: 'connected', // This could be dynamic based on actual DB connection
          ai: process.env.OPENAI_API_KEY ? 'configured' : 'not-configured'
        },
        features: {
          securityScanning: 'enhanced',
          aiReview: 'enhanced',
          testGeneration: 'enhanced',
          batchProcessing: 'enabled',
          realTimeAnalysis: 'enabled'
        }
      };

      res.json(ResponseFormatter.success(health, 'Service is healthy'));
    });

    // API route groups with enhanced handlers
    this.app.use('/api/security', securityRoutes);
    this.app.use('/api/ai-review', aiReviewRoutes);
    this.app.use('/api/test-generation', testGenerationRoutes);

    // Original routes (to be gradually migrated)
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/projects', projectRoutes);

    // API documentation endpoint
    this.app.get('/api/docs', (req, res) => {
      const apiDocs = {
        title: 'CodeGuardian AI API Documentation',
        version: '2.0.0',
        description: 'Enhanced DevSecOps platform with AI-powered code analysis',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        endpoints: {
          security: {
            path: '/security',
            methods: ['POST /scan', 'POST /batch-scan', 'GET /patterns', 'GET /health'],
            description: 'Security vulnerability scanning with enhanced detection'
          },
          aiReview: {
            path: '/ai-review',
            methods: ['POST /analyze', 'POST /batch-analyze', 'POST /refactor', 'POST /security-analysis', 'POST /performance-analysis'],
            description: 'AI-powered code review with multiple analysis types'
          },
          testGeneration: {
            path: '/test-generation',
            methods: ['POST /generate', 'POST /batch-generate', 'POST /unit-tests', 'POST /integration-tests', 'POST /e2e-tests'],
            description: 'AI-powered test generation for multiple test types'
          },
          auth: {
            path: '/auth',
            methods: ['POST /login', 'POST /register', 'POST /logout'],
            description: 'User authentication and authorization'
          },
          projects: {
            path: '/projects',
            methods: ['GET /', 'POST /', 'GET /:id', 'PUT /:id', 'DELETE /:id'],
            description: 'Project management and history'
          }
        },
        features: {
          batchProcessing: 'Process multiple files simultaneously',
          enhancedAnalysis: 'Comprehensive code analysis with AI insights',
          multipleTestTypes: 'Generate unit, integration, E2E, performance, and security tests',
          securityScanning: 'Advanced vulnerability detection with CWE mapping',
          realTimeReports: 'Instant analysis results with detailed recommendations'
        }
      };

      res.json(ResponseFormatter.success(apiDocs, 'API documentation retrieved'));
    });

    // Catch-all for React app (production)
    if (process.env.NODE_ENV === 'production') {
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
      });
    }

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      Logger.warn('API endpoint not found', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        ip: req.ip
      });

      res.status(404).json(
        ResponseFormatter.error(`API endpoint not found: ${req.method} ${req.path}`, 404, {
          availableEndpoints: [
            '/api/health',
            '/api/docs',
            '/api/security/*',
            '/api/ai-review/*',
            '/api/test-generation/*',
            '/api/auth/*',
            '/api/projects/*'
          ]
        })
      );
    });
  }

  /**
   * Initialize enhanced error handling
   */
  initializeErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      const requestId = req.requestId || 'unknown';
      const processingTime = req.startTime ? Date.now() - req.startTime : 0;

      // Log the error
      Logger.error('Request error', {
        requestId,
        error: error.message,
        stack: error.stack,
        method: req.method,
        path: req.path,
        ip: req.ip,
        processingTime
      });

      // Handle different types of errors
      let statusCode = error.statusCode || error.status || 500;
      let message = error.message || 'Internal server error';
      let details = null;

      // Handle specific error types
      if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        details = error.details;
      } else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
      } else if (error.code === 'ENOENT') {
        statusCode = 404;
        message = 'Resource not found';
      } else if (error.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Service temporarily unavailable';
      }

      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal server error';
        details = null;
      }

      // Send error response
      res.status(statusCode).json(
        ResponseFormatter.error(message, statusCode, details, {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime
        })
      );
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
      
      // Graceful shutdown
      this.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled promise rejection', {
        reason: reason?.toString(),
        promise: promise?.toString()
      });
      
      // Graceful shutdown
      this.gracefulShutdown('unhandledRejection');
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      Logger.info('SIGTERM received, starting graceful shutdown');
      this.gracefulShutdown('SIGTERM');
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      Logger.info('SIGINT received, starting graceful shutdown');
      this.gracefulShutdown('SIGINT');
    });
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Test database connection
      await this.testDatabaseConnection();

      // Start the server
      this.server = this.app.listen(this.port, () => {
        Logger.info('CodeGuardian AI Server started', {
          port: this.port,
          environment: process.env.NODE_ENV || 'development',
          version: '2.0.0',
          features: ['Enhanced Security Scanning', 'AI Code Review', 'Test Generation', 'Batch Processing'],
          timestamp: new Date().toISOString()
        });
      });

      return this.server;
    } catch (error) {
      Logger.error('Failed to start server', error);
      process.exit(1);
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    try {
      await prisma.$connect();
      Logger.info('Database connection established');
    } catch (error) {
      Logger.error('Database connection failed', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(signal) {
    Logger.info('Starting graceful shutdown', { signal });

    // Stop accepting new requests
    if (this.server) {
      this.server.close(() => {
        Logger.info('HTTP server closed');
      });
    }

    // Close database connection
    try {
      await prisma.$disconnect();
      Logger.info('Database connection closed');
    } catch (error) {
      Logger.error('Error closing database connection', error);
    }

    // Exit process
    setTimeout(() => {
      Logger.error('Forceful shutdown');
      process.exit(1);
    }, 10000);

    Logger.info('Graceful shutdown completed');
    process.exit(0);
  }
}

// Create and start server
const server = new CodeGuardianServer();

// Start server if this file is run directly
if (require.main === module) {
  server.start().catch((error) => {
    Logger.error('Failed to start server', error);
    process.exit(1);
  });
}

module.exports = server;
