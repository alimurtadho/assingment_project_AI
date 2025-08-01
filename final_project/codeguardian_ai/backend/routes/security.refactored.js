/**
 * Enhanced Security Route Handler
 * Handles security scanning requests with improved error handling and validation
 */

const express = require('express');
const multer = require('multer');
const SecurityScanner = require('../services/securityScanner');
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
 * POST /api/security/scan
 * Scan code for security vulnerabilities
 */
router.post('/scan', upload.single('file'), async (req, res, next) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Security scan request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code,
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
        'No code provided for scanning. Include code in request body or upload a file.',
        400
      );
    }

    // Validate code input
    ValidationUtils.validateCodeInput(code);

    // Parse scan options
    const scanOptions = {
      includeContext: req.body.includeContext !== 'false',
      severity: req.body.severity || 'all',
      categories: req.body.categories ? req.body.categories.split(',') : undefined,
      language: req.body.language,
      framework: req.body.framework,
      requestId,
      fileName
    };

    Logger.debug('Starting security scan', { 
      requestId,
      codeLength: code.length,
      fileName,
      scanOptions 
    });

    // Perform security scan
    const scanResult = await SecurityScanner.scan(code, scanOptions);

    // Add request metadata to response
    const response = {
      ...scanResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: scanOptions
      }
    };

    Logger.info('Security scan completed successfully', {
      requestId,
      vulnerabilitiesFound: response.vulnerabilities?.length || 0,
      riskScore: response.riskScore,
      processingTime: response.scanMetrics?.duration
    });

    res.json(ResponseFormatter.success(response, 'Security scan completed successfully'));

  } catch (error) {
    Logger.error('Security scan failed', { 
      requestId,
      error: error.message,
      stack: error.stack 
    });

    next(error);
  }
});

/**
 * POST /api/security/batch-scan
 * Batch scan multiple files for security vulnerabilities
 */
router.post('/batch-scan', upload.array('files', 10), async (req, res, next) => {
  const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Batch security scan request received', { 
      requestId,
      fileCount: req.files?.length || 0,
      ip: req.ip
    });

    if (!req.files || req.files.length === 0) {
      throw ErrorHandler.createError(
        'NO_FILES_PROVIDED',
        'No files provided for batch scanning',
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

    const scanOptions = {
      includeContext: req.body.includeContext !== 'false',
      severity: req.body.severity || 'all',
      language: req.body.language,
      framework: req.body.framework,
      requestId
    };

    Logger.debug('Starting batch security scan', { 
      requestId,
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      scanOptions 
    });

    // Perform batch scanning
    const results = [];
    const batchStartTime = Date.now();

    for (const [index, file] of files.entries()) {
      try {
        Logger.debug(`Scanning file ${index + 1}/${files.length}`, { 
          requestId,
          fileName: file.name 
        });

        const scanResult = await SecurityScanner.scan(file.content, {
          ...scanOptions,
          fileName: file.name
        });

        results.push({
          fileName: file.name,
          success: true,
          ...scanResult.data
        });

      } catch (error) {
        Logger.error(`Failed to scan file: ${file.name}`, { 
          requestId,
          error: error.message 
        });

        results.push({
          fileName: file.name,
          success: false,
          error: error.message
        });
      }
    }

    const batchResult = {
      results,
      summary: {
        totalFiles: files.length,
        successfulScans: results.filter(r => r.success).length,
        failedScans: results.filter(r => !r.success).length,
        totalVulnerabilities: results
          .filter(r => r.success)
          .reduce((sum, r) => sum + (r.vulnerabilities?.length || 0), 0),
        processingTime: Date.now() - batchStartTime
      },
      requestInfo: {
        requestId,
        timestamp: new Date().toISOString(),
        options: scanOptions
      }
    };

    Logger.info('Batch security scan completed', {
      requestId,
      ...batchResult.summary
    });

    res.json(ResponseFormatter.success(batchResult, 'Batch security scan completed'));

  } catch (error) {
    Logger.error('Batch security scan failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * GET /api/security/patterns
 * Get available vulnerability patterns and categories
 */
router.get('/patterns', async (req, res, next) => {
  try {
    Logger.info('Vulnerability patterns request received');

    const patterns = {
      categories: [
        'Secrets Management',
        'Injection Attacks', 
        'Cross-Site Scripting',
        'Cryptographic Issues',
        'Insecure Storage',
        'Authentication & Authorization'
      ],
      severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'go'],
      supportedFrameworks: ['express', 'react', 'vue', 'django', 'flask', 'spring'],
      detectionCapabilities: {
        hardcodedSecrets: 'Detects API keys, passwords, and secret keys in code',
        sqlInjection: 'Identifies potential SQL injection vulnerabilities',
        xss: 'Finds cross-site scripting vulnerability patterns',
        weakCrypto: 'Detects weak cryptographic implementations',
        insecureStorage: 'Identifies insecure data storage practices',
        authIssues: 'Finds authentication and authorization problems'
      }
    };

    res.json(ResponseFormatter.success(patterns, 'Vulnerability patterns retrieved successfully'));

  } catch (error) {
    Logger.error('Failed to retrieve vulnerability patterns', error);
    next(error);
  }
});

/**
 * GET /api/security/health
 * Health check for security scanning service
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Security Scanner',
      version: '2.0.0',
      capabilities: {
        patternCount: Object.values(SecurityScanner.vulnerabilityPatterns)
          .reduce((sum, category) => sum + category.patterns.length, 0),
        categoriesSupported: Object.keys(SecurityScanner.vulnerabilityPatterns).length,
        enhancedFeatures: [
          'CWE mapping',
          'Risk scoring',
          'Context analysis',
          'Detailed recommendations',
          'Batch processing'
        ]
      }
    };

    res.json(ResponseFormatter.success(health, 'Security service is healthy'));

  } catch (error) {
    Logger.error('Security service health check failed', error);
    next(error);
  }
});

// Error handling middleware specific to security routes
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    Logger.error('File upload error', { error: error.message, code: error.code });
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json(
          ResponseFormatter.error('File too large. Maximum size is 50MB.', 413)
        );
      case 'LIMIT_FILE_COUNT':
        return res.status(413).json(
          ResponseFormatter.error('Too many files. Maximum is 10 files.', 413)
        );
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json(
          ResponseFormatter.error('Unexpected file field.', 400)
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
