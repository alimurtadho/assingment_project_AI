/**
 * Enhanced Test Generation Route Handler
 * Handles test generation requests with improved architecture and validation
 */

const express = require('express');
const multer = require('multer');
const TestGenerator = require('../services/testGenerator.refactored');
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
 * POST /api/test-generation/generate
 * Generate tests for uploaded code
 */
router.post('/generate', upload.single('file'), async (req, res, next) => {
  const requestId = `test_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Test generation request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code,
      testType: req.body.type || 'unitTests',
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
      fileName = req.body.fileName || 'code_to_test';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for test generation. Include code in request body or upload a file.',
        400
      );
    }

    // Validate code input
    ValidationUtils.validateCodeInput(code);

    // Parse generation options
    const generationOptions = {
      type: req.body.type || 'unitTests',
      language: req.body.language,
      framework: req.body.framework,
      testFramework: req.body.testFramework,
      coverage: req.body.coverage || 'comprehensive',
      includeEdgeCases: req.body.includeEdgeCases !== 'false',
      includeMocking: req.body.includeMocking !== 'false',
      includeIntegration: req.body.includeIntegration === 'true',
      includePerformance: req.body.includePerformance === 'true',
      requestId,
      fileName
    };

    // Validate test type
    const validTypes = ['unitTests', 'integrationTests', 'e2eTests', 'performanceTests', 'securityTests'];
    if (!validTypes.includes(generationOptions.type)) {
      throw ErrorHandler.createError(
        'INVALID_TEST_TYPE',
        `Invalid test type: ${generationOptions.type}. Valid types: ${validTypes.join(', ')}`,
        400
      );
    }

    Logger.debug('Starting test generation', { 
      requestId,
      codeLength: code.length,
      fileName,
      generationOptions 
    });

    // Perform test generation
    const generationResult = await TestGenerator.generate(code, generationOptions);

    // Add request metadata to response
    const response = {
      ...generationResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: generationOptions
      }
    };

    Logger.info('Test generation completed successfully', {
      requestId,
      testType: generationOptions.type,
      testsGenerated: response.testCases?.length || response.testScenarios?.length || 0,
      estimatedCoverage: response.coverage?.estimatedPercentage,
      processingTime: response.metadata?.processingTime
    });

    res.json(ResponseFormatter.success(response, 'Test generation completed successfully'));

  } catch (error) {
    Logger.error('Test generation failed', { 
      requestId,
      error: error.message,
      stack: error.stack 
    });

    next(error);
  }
});

/**
 * POST /api/test-generation/batch-generate
 * Batch test generation for multiple files
 */
router.post('/batch-generate', upload.array('files', 10), async (req, res, next) => {
  const requestId = `batch_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Batch test generation request received', { 
      requestId,
      fileCount: req.files?.length || 0,
      testType: req.body.type || 'unitTests',
      ip: req.ip
    });

    if (!req.files || req.files.length === 0) {
      throw ErrorHandler.createError(
        'NO_FILES_PROVIDED',
        'No files provided for batch test generation',
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

    const generationOptions = {
      type: req.body.type || 'unitTests',
      language: req.body.language,
      framework: req.body.framework,
      testFramework: req.body.testFramework,
      coverage: req.body.coverage || 'comprehensive',
      includeEdgeCases: req.body.includeEdgeCases !== 'false',
      includeMocking: req.body.includeMocking !== 'false',
      requestId
    };

    Logger.debug('Starting batch test generation', { 
      requestId,
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      generationOptions 
    });

    // Perform batch test generation using the TestGenerator's batch method
    const batchResult = await TestGenerator.generateBatch(files, generationOptions);

    // Add request metadata
    const response = {
      ...batchResult.data,
      requestInfo: {
        requestId,
        timestamp: new Date().toISOString(),
        options: generationOptions
      }
    };

    Logger.info('Batch test generation completed', {
      requestId,
      ...response.summary
    });

    res.json(ResponseFormatter.success(response, 'Batch test generation completed'));

  } catch (error) {
    Logger.error('Batch test generation failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/test-generation/unit-tests
 * Generate comprehensive unit tests
 */
router.post('/unit-tests', upload.single('file'), async (req, res, next) => {
  const requestId = `unit_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Unit test generation request received', { 
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
      fileName = req.body.fileName || 'unit_test_target';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for unit test generation',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const unitTestOptions = {
      type: 'unitTests',
      language: req.body.language,
      framework: req.body.framework,
      testFramework: req.body.testFramework,
      coverage: 'comprehensive',
      includeEdgeCases: true,
      includeMocking: true,
      includeErrorHandling: true,
      includeAsyncTests: req.body.includeAsyncTests !== 'false',
      requestId,
      fileName
    };

    Logger.debug('Starting unit test generation', { 
      requestId,
      codeLength: code.length,
      fileName,
      unitTestOptions 
    });

    const unitTestResult = await TestGenerator.generate(code, unitTestOptions);

    const response = {
      ...unitTestResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: unitTestOptions
      }
    };

    Logger.info('Unit test generation completed', {
      requestId,
      testsGenerated: response.testCases?.length || 0,
      estimatedCoverage: response.coverage?.estimatedPercentage,
      framework: response.testSuite?.framework
    });

    res.json(ResponseFormatter.success(response, 'Unit test generation completed successfully'));

  } catch (error) {
    Logger.error('Unit test generation failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/test-generation/integration-tests
 * Generate integration tests
 */
router.post('/integration-tests', upload.single('file'), async (req, res, next) => {
  const requestId = `integration_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Integration test generation request received', { 
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
      fileName = req.body.fileName || 'integration_test_target';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for integration test generation',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const integrationOptions = {
      type: 'integrationTests',
      language: req.body.language,
      framework: req.body.framework,
      testFramework: req.body.testFramework,
      includeAPI: req.body.includeAPI !== 'false',
      includeDatabase: req.body.includeDatabase !== 'false',
      includeExternalServices: req.body.includeExternalServices === 'true',
      requestId,
      fileName
    };

    Logger.debug('Starting integration test generation', { 
      requestId,
      codeLength: code.length,
      fileName,
      integrationOptions 
    });

    const integrationResult = await TestGenerator.generate(code, integrationOptions);

    const response = {
      ...integrationResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: integrationOptions
      }
    };

    Logger.info('Integration test generation completed', {
      requestId,
      scenariosGenerated: response.testScenarios?.length || 0,
      components: response.environment?.requirements?.length || 0
    });

    res.json(ResponseFormatter.success(response, 'Integration test generation completed successfully'));

  } catch (error) {
    Logger.error('Integration test generation failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/test-generation/e2e-tests
 * Generate end-to-end tests
 */
router.post('/e2e-tests', upload.single('file'), async (req, res, next) => {
  const requestId = `e2e_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('E2E test generation request received', { 
      requestId,
      hasFile: !!req.file,
      hasCode: !!req.body.code,
      appType: req.body.appType || 'web'
    });

    // Extract code
    let code, fileName;
    
    if (req.file) {
      code = req.file.buffer.toString('utf8');
      fileName = req.file.originalname;
    } else if (req.body.code) {
      code = req.body.code;
      fileName = req.body.fileName || 'e2e_test_target';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for E2E test generation',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const e2eOptions = {
      type: 'e2eTests',
      language: req.body.language,
      framework: req.body.framework,
      testFramework: req.body.testFramework || 'cypress',
      appType: req.body.appType || 'web',
      includeMobile: req.body.includeMobile === 'true',
      includeCrossBrowser: req.body.includeCrossBrowser !== 'false',
      includeAccessibility: req.body.includeAccessibility === 'true',
      requestId,
      fileName
    };

    Logger.debug('Starting E2E test generation', { 
      requestId,
      codeLength: code.length,
      fileName,
      e2eOptions 
    });

    const e2eResult = await TestGenerator.generate(code, e2eOptions);

    const response = {
      ...e2eResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: e2eOptions
      }
    };

    Logger.info('E2E test generation completed', {
      requestId,
      userJourneysGenerated: response.userJourneys?.length || 0,
      framework: response.e2eSuite?.framework
    });

    res.json(ResponseFormatter.success(response, 'E2E test generation completed successfully'));

  } catch (error) {
    Logger.error('E2E test generation failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * POST /api/test-generation/performance-tests
 * Generate performance tests
 */
router.post('/performance-tests', upload.single('file'), async (req, res, next) => {
  const requestId = `perf_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    Logger.info('Performance test generation request received', { 
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
      fileName = req.body.fileName || 'performance_test_target';
    } else {
      throw ErrorHandler.createError(
        'MISSING_CODE_INPUT',
        'No code provided for performance test generation',
        400
      );
    }

    ValidationUtils.validateCodeInput(code);

    const performanceOptions = {
      type: 'performanceTests',
      language: req.body.language,
      framework: req.body.framework,
      testFramework: req.body.testFramework || 'artillery',
      includeLoad: req.body.includeLoad !== 'false',
      includeStress: req.body.includeStress === 'true',
      includeVolume: req.body.includeVolume === 'true',
      includeConcurrency: req.body.includeConcurrency !== 'false',
      requestId,
      fileName
    };

    Logger.debug('Starting performance test generation', { 
      requestId,
      codeLength: code.length,
      fileName,
      performanceOptions 
    });

    const performanceResult = await TestGenerator.generate(code, performanceOptions);

    const response = {
      ...performanceResult.data,
      requestInfo: {
        requestId,
        fileName,
        timestamp: new Date().toISOString(),
        options: performanceOptions
      }
    };

    Logger.info('Performance test generation completed', {
      requestId,
      performanceTestsGenerated: response.performanceTests?.length || 0,
      tooling: response.performanceSuite?.tooling
    });

    res.json(ResponseFormatter.success(response, 'Performance test generation completed successfully'));

  } catch (error) {
    Logger.error('Performance test generation failed', { 
      requestId,
      error: error.message 
    });

    next(error);
  }
});

/**
 * GET /api/test-generation/frameworks
 * Get supported test frameworks for different languages
 */
router.get('/frameworks', async (req, res, next) => {
  try {
    Logger.info('Test frameworks request received', { language: req.query.language });

    const language = req.query.language?.toLowerCase();
    let frameworks;

    if (language) {
      frameworks = TestGenerator.getSupportedFrameworks(language);
      if (!frameworks) {
        throw ErrorHandler.createError(
          'UNSUPPORTED_LANGUAGE',
          `Language '${language}' is not supported`,
          400
        );
      }
    } else {
      frameworks = {
        javascript: TestGenerator.getSupportedFrameworks('javascript'),
        python: TestGenerator.getSupportedFrameworks('python'),
        // Add other languages as needed
      };
    }

    const response = {
      supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'go'],
      frameworks,
      testTypes: [
        {
          type: 'unitTests',
          name: 'Unit Tests',
          description: 'Test individual functions and methods in isolation'
        },
        {
          type: 'integrationTests',
          name: 'Integration Tests',
          description: 'Test interactions between different components'
        },
        {
          type: 'e2eTests',
          name: 'End-to-End Tests',
          description: 'Test complete user workflows and scenarios'
        },
        {
          type: 'performanceTests',
          name: 'Performance Tests',
          description: 'Test system performance, load, and scalability'
        },
        {
          type: 'securityTests',
          name: 'Security Tests',
          description: 'Test security vulnerabilities and controls'
        }
      ]
    };

    res.json(ResponseFormatter.success(response, 'Test frameworks retrieved successfully'));

  } catch (error) {
    Logger.error('Failed to retrieve test frameworks', error);
    next(error);
  }
});

/**
 * GET /api/test-generation/capabilities
 * Get test generation service capabilities
 */
router.get('/capabilities', async (req, res, next) => {
  try {
    Logger.info('Test generation capabilities request received');

    const capabilities = {
      testTypes: [
        {
          type: 'unitTests',
          features: ['Function testing', 'Edge case coverage', 'Mocking support', 'Async testing']
        },
        {
          type: 'integrationTests',
          features: ['API testing', 'Database integration', 'Service interactions', 'Environment setup']
        },
        {
          type: 'e2eTests',
          features: ['User journey testing', 'UI interaction', 'Cross-browser support', 'Mobile testing']
        },
        {
          type: 'performanceTests',
          features: ['Load testing', 'Stress testing', 'Volume testing', 'Concurrency testing']
        },
        {
          type: 'securityTests',
          features: ['Vulnerability testing', 'Authentication tests', 'Authorization tests', 'Input validation']
        }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'],
      testFrameworks: {
        javascript: ['jest', 'mocha', 'vitest', 'cypress', 'playwright'],
        python: ['pytest', 'unittest', 'nose2'],
        java: ['junit', 'testng'],
        cpp: ['googletest', 'catch2'],
        go: ['testing', 'testify']
      },
      features: {
        codeAnalysis: 'Automatic code pattern detection',
        edgeCaseGeneration: 'Comprehensive edge case coverage',
        mockingSupport: 'Automatic mock generation',
        coverageEstimation: 'Test coverage estimation',
        batchProcessing: 'Multiple file processing',
        frameworkDetection: 'Automatic framework detection'
      },
      batchProcessing: {
        supported: true,
        maxFiles: 10,
        maxFileSize: '50MB'
      }
    };

    res.json(ResponseFormatter.success(capabilities, 'Test generation capabilities retrieved successfully'));

  } catch (error) {
    Logger.error('Failed to retrieve test generation capabilities', error);
    next(error);
  }
});

/**
 * GET /api/test-generation/health
 * Health check for test generation service
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Test Generator',
      version: '2.0.0',
      aiService: {
        provider: 'OpenAI',
        model: 'GPT-4',
        status: process.env.OPENAI_API_KEY ? 'configured' : 'not-configured'
      },
      capabilities: {
        testTypes: 5,
        supportedLanguages: 6,
        testFrameworks: 15,
        batchProcessing: true,
        enhancedFeatures: [
          'Multi-type test generation',
          'Framework auto-detection',
          'Coverage estimation',
          'Code pattern analysis',
          'Batch processing'
        ]
      }
    };

    res.json(ResponseFormatter.success(health, 'Test generation service is healthy'));

  } catch (error) {
    Logger.error('Test generation service health check failed', error);
    next(error);
  }
});

// Error handling middleware specific to test generation routes
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    Logger.error('File upload error in test generation', { error: error.message, code: error.code });
    
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
