/**
 * Enhanced AI Review Route Handler
 * Handles AI code review requests with improved architecture and validation
 */

const express = require('express');
const multer = require('multer');
const AIReviewer = require('../services/aiReviewer.refactored');
const ResponseFormatter = require('../utils/responseFormatter');
const ValidationUtils = require('../utils/validationUtils');
const Logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    try {
      ValidationUtils.validateUploadedFile(file);
      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  }
});

/**
 * POST /api/ai-review/analyze
 * Perform AI-powered code review
 */
router.post('/analyze', upload.single('file'), async (req, res, next) => {
  const requestId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('AI code review request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code,
      reviewType: req.body.type || 'codeReview',
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Extract code from file or request body
    let code, fileName;
    
    if (req.file) {
      code = req.file.buffer.toString('utf8');
      fileName = req.file.originalname;
      
      // Validate file content
      if (!ValidationUtils.validateCodeInput(code)) {
        throw ErrorHandler.createError(
          'INVALID_FILE_CONTENT',
          'File contains invalid or empty code content',
          400
        );
      }
    } else if (req.body.code) {
      code = req.body.code;
      fileName = req.body.fileName || 'uploaded_code';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for review. Include code in request body or upload a file.',
        400
      );
    }

    // Validate code input
    ValidationUtils.validateCodeInput(code);

    // Parse review options
    const reviewOptions = {
      type: req.body.type || 'codeReview',
      language: req.body.language,
      framework: req.body.framework,
      focus: req.body.focus ? req.body.focus.split(',').map(f => f.trim()) : undefined,
      includeRefactoring: req.body.includeRefactoring === 'true',
      includeSecurity: req.body.includeSecurity === 'true',
      includePerformance: req.body.includePerformance === 'true',
      requestId,
      fileName
    };

    // Validate review type
    const validTypes = ['codeReview', 'refactoring', 'security', 'performance'];
    if (!validTypes.includes(reviewOptions.type)) {
      throw ErrorHandler.createError(
        'INVALID_REVIEW_TYPE',
        `Invalid review type: ${reviewOptions.type}. Valid types: ${validTypes.join(', ')}`,
        400
      );
    }

    Logger.debug('Starting AI code review', { 
      requestId,
      codeLength: code.length,
      fileName,
      reviewOptions 
    });

    // Perform AI code review
    const reviewResult = await AIReviewer.review(code, reviewOptions);

    // Add request metadata to response
    const response = {
      ...reviewResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: reviewOptions
      }
    };

    Logger.info('AI code review completed successfully', {
      requestId,
      reviewType: reviewOptions.type,
      issuesFound: response.issues?.length || 0,
      overallScore: response.reviewSummary?.overallScore,
      processingTime: response.metadata?.processingTime
    });

    res.json(ResponseFormatter.success(response, 'AI code review completed successfully'));

  } catch (error) {
    Logger.error('AI code review failed', { 
      requestId,
      error: error.message,
      stack: error.stack 
    });

    next(error);
  }
});

/**
 * POST /api/ai-review/batch-analyze
 * Batch AI code review for multiple files
 */
router.post('/batch-analyze', upload.array('files', 10), async (req, res, next) => {
  const requestId = `batch_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Batch AI code review request received', { 
      requestId,
      fileCount: req.files?.length || 0,
      reviewType: req.body.type || 'codeReview',
      ip: req.ip
    });

    if (!req.files || req.files.length === 0) {
      throw ErrorHandler.createError(
        'NO_FILES_PROVIDED',
        'No files provided for batch review',
        400
      );
    }

    // Process files
    const files = req.files.map(file => ({
      name: file.originalname,
      content: file.buffer.toString('utf8'),
      size: file.size
    }));

    // Validate all files
    for (const file of files) {
      if (!ValidationUtils.validateCodeInput(file.content)) {
        throw ErrorHandler.createError(
          'INVALID_FILE_CONTENT',
          `File ${file.name} contains invalid or empty code content`,
          400
        );
      }
    }

    const reviewOptions = {
      type: req.body.type || 'codeReview',
      language: req.body.language,
      framework: req.body.framework,
      focus: req.body.focus ? req.body.focus.split(',').map(f => f.trim()) : undefined,
      requestId
    };

    Logger.debug('Starting batch AI code review', { 
      requestId,
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      reviewOptions 
    });

    // Perform batch review using the AIReviewer's batch method
    const batchResult = await AIReviewer.batchReview(files, reviewOptions);

    // Add request metadata
    const response = {
      ...batchResult.data,
      requestInfo: {
        requestId,
        timestamp: new Date().toISOString(),
        options: reviewOptions
      }
    };

    Logger.info('Batch AI code review completed', {
      requestId,
      ...response.summary
    });

    res.json(ResponseFormatter.success(response, 'Batch AI code review completed'));

  } catch (error) {
    Logger.error('Batch AI code review failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/ai-review/refactor
 * Get refactoring suggestions for code
 */
router.post('/refactor', upload.single('file'), async (req, res, next) => {
  const requestId = `refactor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Refactoring suggestions request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code
    });

    // Extract code
    let code, fileName;
    
    if (req.file) {
      code = req.file.buffer.toString('utf8');
      fileName = req.file.originalname;
    } else if (req.body.code) {
      code = req.body.code;
      fileName = req.body.fileName || 'code_to_refactor';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for refactoring analysis',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const refactorOptions = {
      type: 'refactoring',
      language: req.body.language,
      framework: req.body.framework,
      focus: req.body.focus ? req.body.focus.split(',').map(f => f.trim()) : ['structure', 'patterns', 'performance'],
      requestId,
      fileName
    };

    Logger.debug('Starting refactoring analysis', { 
      requestId,
      codeLength: code.length,
      fileName,
      refactorOptions 
    });

    const refactorResult = await AIReviewer.review(code, refactorOptions);

    const response = {
      ...refactorResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: refactorOptions
      }
    };

    Logger.info('Refactoring analysis completed', {
      requestId,
      refactoringsFound: response.refactorings?.length || 0,
      estimatedEffort: response.refactoringPlan?.estimatedEffort
    });

    res.json(ResponseFormatter.success(response, 'Refactoring analysis completed successfully'));

  } catch (error) {
    Logger.error('Refactoring analysis failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/ai-review/security-analysis
 * Perform security-focused AI analysis
 */
router.post('/security-analysis', upload.single('file'), async (req, res, next) => {
  const requestId = `security_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('AI security analysis request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code
    });

    // Extract code
    let code, fileName;
    
    if (req.file) {
      code = req.file.buffer.toString('utf8');
      fileName = req.file.originalname;
    } else if (req.body.code) {
      code = req.body.code;
      fileName = req.body.fileName || 'code_security_analysis';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for security analysis',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const securityOptions = {
      type: 'security',
      language: req.body.language,
      framework: req.body.framework,
      focus: ['vulnerabilities', 'authentication', 'authorization', 'data-protection'],
      requestId,
      fileName
    };

    Logger.debug('Starting AI security analysis', { 
      requestId,
      codeLength: code.length,
      fileName,
      securityOptions 
    });

    const securityResult = await AIReviewer.review(code, securityOptions);

    const response = {
      ...securityResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: securityOptions
      }
    };

    Logger.info('AI security analysis completed', {
      requestId,
      vulnerabilitiesFound: response.vulnerabilities?.length || 0,
      riskLevel: response.securityAssessment?.overallRiskLevel,
      complianceScore: response.securityAssessment?.complianceScore
    });

    res.json(ResponseFormatter.success(response, 'AI security analysis completed successfully'));

  } catch (error) {
    Logger.error('AI security analysis failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/ai-review/performance-analysis
 * Perform performance-focused AI analysis
 */
router.post('/performance-analysis', upload.single('file'), async (req, res, next) => {
  const requestId = `perf_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('AI performance analysis request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code
    });

    // Extract code
    let code, fileName;
    
    if (req.file) {
      code = req.file.buffer.toString('utf8');
      fileName = req.file.originalname;
    } else if (req.body.code) {
      code = req.body.code;
      fileName = req.body.fileName || 'code_performance_analysis';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for performance analysis',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const performanceOptions = {
      type: 'performance',
      language: req.body.language,
      framework: req.body.framework,
      focus: ['algorithms', 'memory', 'database', 'concurrency'],
      requestId,
      fileName
    };

    Logger.debug('Starting AI performance analysis', { 
      requestId,
      codeLength: code.length,
      fileName,
      performanceOptions 
    });

    const performanceResult = await AIReviewer.review(code, performanceOptions);

    const response = {
      ...performanceResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: performanceOptions
      }
    };

    Logger.info('AI performance analysis completed', {
      requestId,
      optimizationsFound: response.optimizations?.length || 0,
      overallScore: response.performanceAssessment?.overallScore,
      bottlenecks: response.performanceAssessment?.bottlenecks
    });

    res.json(ResponseFormatter.success(response, 'AI performance analysis completed successfully'));

  } catch (error) {
    Logger.error('AI performance analysis failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * GET /api/ai-review/capabilities
 * Get AI review service capabilities and configuration
 */
router.get('/capabilities', async (req, res, next) => {
  try {
    Logger.info('AI review capabilities request received');

    const capabilities = {
      reviewTypes: [
        {
          type: 'codeReview',
          name: 'Comprehensive Code Review',
          description: 'Full code quality, security, and performance analysis',
          features: ['Code quality assessment', 'Bug detection', 'Best practices validation', 'Maintainability scoring']
        },
        {
          type: 'refactoring',
          name: 'Refactoring Suggestions',
          description: 'Structural improvements and code optimization',
          features: ['Design pattern recommendations', 'Code organization', 'Performance optimizations', 'Maintainability improvements']
        },
        {
          type: 'security',
          name: 'Security Analysis',
          description: 'Security vulnerability assessment and recommendations',
          features: ['Vulnerability detection', 'Security best practices', 'Compliance checking', 'Risk assessment']
        },
        {
          type: 'performance',
          name: 'Performance Analysis',
          description: 'Performance optimization and bottleneck identification',
          features: ['Algorithm analysis', 'Memory optimization', 'Database query optimization', 'Scalability assessment']
        }
      ],
      supportedLanguages: [
        'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'php', 'ruby', 'swift'
      ],
      supportedFrameworks: [
        'react', 'vue', 'angular', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails'
      ],
      focusAreas: [
        'code-quality', 'security', 'performance', 'maintainability', 'testing', 'documentation',
        'error-handling', 'design-patterns', 'best-practices', 'optimization'
      ],
      outputFormats: ['detailed-json', 'summary', 'actionable-items'],
      batchProcessing: {
        supported: true,
        maxFiles: 10,
        maxFileSize: '50MB',
        parallelProcessing: false
      },
      aiModel: {
        provider: 'OpenAI',
        model: 'GPT-4',
        capabilities: ['Code analysis', 'Pattern recognition', 'Best practice recommendations', 'Security assessment']
      }
    };

    res.json(ResponseFormatter.success(capabilities, 'AI review capabilities retrieved successfully'));

  } catch (error) {
    Logger.error('Failed to retrieve AI review capabilities', error);
    next(error);
  }
});

/**
 * GET /api/ai-review/health
 * Health check for AI review service
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AI Code Reviewer',
      version: '2.0.0',
      aiService: {
        provider: 'OpenAI',
        model: 'GPT-4',
        status: process.env.OPENAI_API_KEY ? 'configured' : 'not-configured'
      },
      capabilities: {
        reviewTypes: 4,
        supportedLanguages: 10,
        batchProcessing: true,
        enhancedFeatures: [
          'Multi-type analysis',
          'Detailed recommendations',
          'Quality metrics',
          'Batch processing',
          'Performance optimization'
        ]
      }
    };

    res.json(ResponseFormatter.success(health, 'AI review service is healthy'));

  } catch (error) {
    Logger.error('AI review service health check failed', error);
    next(error);
  }
});

// Error handling middleware specific to AI review routes
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    Logger.error('File upload error in AI review', { error: error.message, code: error.code });
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json(
          ResponseFormatter.error('File too large. Maximum size is 50MB.', 413)
        );
      case 'LIMIT_FILE_COUNT':
        return res.status(413).json(
          ResponseFormatter.error('Too many files. Maximum is 10 files.', 413)
        );
      default:
        return res.status(400).json(
          ResponseFormatter.error(`File upload error: ${error.message}`, 400)
        );
    }
  }

  // Pass to global error handler
  next(error);
});

module.exports = router;
