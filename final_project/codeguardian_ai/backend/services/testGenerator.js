/**
 * Enhanced Test Generator Service
 * Uses AI to generate comprehensive test cases with improved architecture
 */

const OpenAI = require('openai');
const ResponseFormatter = require('../utils/responseFormatter');
const ValidationUtils = require('../utils/validationUtils');
const Logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class TestGenerator {
  constructor() {
    this.logger = Logger;
    this.validationUtils = ValidationUtils;
    this.responseFormatter = ResponseFormatter;
    
    // Initialize OpenAI with proper error handling
    this.initializeOpenAI();
    
    // Enhanced prompts for different test types
    this.prompts = this.initializePrompts();
    
    // Test generation configuration
    this.config = {
      maxTokens: 6000,
      temperature: 0.2,
      model: 'gpt-4',
      retryAttempts: 3,
      retryDelay: 1000
    };

    // Supported test frameworks and their patterns
    this.testFrameworks = {
      javascript: {
        jest: {
          extension: '.test.js',
          imports: "const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');",
          patterns: {
            describe: 'describe',
            test: 'test',
            expect: 'expect',
            beforeEach: 'beforeEach',
            afterEach: 'afterEach'
          }
        },
        mocha: {
          extension: '.test.js',
          imports: "const { describe, it, beforeEach, afterEach } = require('mocha'); const { expect } = require('chai');",
          patterns: {
            describe: 'describe',
            test: 'it',
            expect: 'expect',
            beforeEach: 'beforeEach',
            afterEach: 'afterEach'
          }
        },
        vitest: {
          extension: '.test.js',
          imports: "import { describe, test, expect, beforeEach, afterEach } from 'vitest';",
          patterns: {
            describe: 'describe',
            test: 'test',
            expect: 'expect',
            beforeEach: 'beforeEach',
            afterEach: 'afterEach'
          }
        }
      },
      python: {
        pytest: {
          extension: '_test.py',
          imports: "import pytest\nimport unittest.mock as mock",
          patterns: {
            describe: 'class Test',
            test: 'def test_',
            expect: 'assert',
            beforeEach: 'def setup_method',
            afterEach: 'def teardown_method'
          }
        },
        unittest: {
          extension: '_test.py',
          imports: "import unittest\nimport unittest.mock as mock",
          patterns: {
            describe: 'class Test',
            test: 'def test_',
            expect: 'self.assert',
            beforeEach: 'def setUp',
            afterEach: 'def tearDown'
          }
        }
      }
    };
  }

  /**
   * Initialize OpenAI client with proper validation
   */
  initializeOpenAI() {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }

      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      this.logger.info('OpenAI client initialized for test generation');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI client for test generation', error);
      throw ErrorHandler.createError('OPENAI_INIT_FAILED', 'Failed to initialize OpenAI client', 500);
    }
  }

  /**
   * Initialize enhanced prompts for different test types
   */
  initializePrompts() {
    return {
      unitTests: {
        system: `You are an expert test engineer specializing in writing comprehensive, maintainable unit tests.
Your tests should be thorough, readable, and follow testing best practices.`,
        
        user: `Generate comprehensive unit tests for the provided code.

**Requirements:**
1. **Complete Coverage:** Generate tests for all public functions, methods, and classes
2. **Edge Cases:** Include boundary conditions, null/undefined values, empty inputs
3. **Error Scenarios:** Test exception handling and error conditions
4. **Data Validation:** Test input validation and data transformation
5. **State Testing:** Test object state changes and side effects
6. **Performance:** Include tests for performance-critical functions
7. **Mocking:** Use appropriate mocking for external dependencies

**Test Framework:** {framework}
**Programming Language:** {language}

**Test Structure Guidelines:**
- Use descriptive test names that explain what is being tested
- Group related tests using describe/context blocks
- Include setup and cleanup when necessary
- Use meaningful assertions with clear error messages
- Follow AAA pattern: Arrange, Act, Assert

**Response Format (JSON):**
{
  "testSuite": {
    "fileName": "generated_test_file_name",
    "content": "complete test file content with proper imports and structure",
    "framework": "test framework used",
    "language": "programming language"
  },
  "testCases": [
    {
      "id": "unique_test_id",
      "functionName": "function being tested",
      "testName": "descriptive test name",
      "description": "what this test validates",
      "type": "unit|integration|edge-case|error|performance",
      "scenario": "detailed test scenario",
      "inputData": "example input data",
      "expectedOutput": "expected result",
      "assertions": ["list of assertions being made"],
      "mocks": ["external dependencies being mocked"]
    }
  ],
  "coverage": {
    "estimatedPercentage": "estimated test coverage percentage",
    "coveredFunctions": ["list of functions with tests"],
    "uncoveredAreas": ["areas that might need additional testing"],
    "recommendations": ["suggestions for improving test coverage"]
  },
  "dependencies": {
    "testFramework": "primary test framework",
    "additionalLibraries": ["additional testing libraries needed"],
    "mockingFramework": "mocking library if used"
  },
  "metrics": {
    "totalTests": "number of test cases",
    "complexityScore": "1-10 based on test complexity",
    "maintainabilityScore": "1-10 based on test maintainability"
  }
}`
      },

      integrationTests: {
        system: `You are an expert in integration testing, focusing on testing component interactions,
API endpoints, database operations, and system workflows.`,
        
        user: `Generate comprehensive integration tests for the provided code.

**Focus Areas:**
1. **API Endpoints:** Test HTTP methods, status codes, request/response handling
2. **Database Operations:** Test CRUD operations, transactions, data integrity
3. **Service Interactions:** Test communication between different services/modules
4. **Workflow Testing:** Test complete business processes and user journeys
5. **External Dependencies:** Test integration with third-party APIs and services
6. **Configuration Testing:** Test different environment configurations

**Framework:** {framework}
**Language:** {language}

**Integration Test Guidelines:**
- Test realistic scenarios with actual dependencies
- Use test databases and controlled test environments
- Validate data flow between components
- Test error propagation and handling
- Include performance and load considerations

**Response Format (JSON):**
{
  "integrationSuite": {
    "fileName": "integration_test_file_name",
    "content": "complete integration test file",
    "setupInstructions": "test environment setup instructions",
    "teardownInstructions": "cleanup instructions"
  },
  "testScenarios": [
    {
      "id": "scenario_id",
      "name": "scenario name",
      "description": "what is being tested",
      "type": "api|database|service|workflow|external",
      "components": ["components involved in test"],
      "preconditions": "test setup requirements",
      "steps": ["test execution steps"],
      "assertions": ["expected outcomes"],
      "cleanup": "post-test cleanup"
    }
  ],
  "environment": {
    "requirements": ["environment setup requirements"],
    "testData": ["test data needed"],
    "configurations": ["configuration settings"],
    "dependencies": ["external service dependencies"]
  },
  "validation": {
    "coverageAreas": ["integration points covered"],
    "riskAreas": ["high-risk areas tested"],
    "performanceChecks": ["performance validations included"]
  }
}`
      },

      e2eTests: {
        system: `You are an expert in end-to-end testing, creating tests that validate complete user workflows
and system functionality from a user's perspective.`,
        
        user: `Generate comprehensive end-to-end tests for the provided application code.

**E2E Test Requirements:**
1. **User Journeys:** Test complete user workflows and use cases
2. **UI Interactions:** Test user interface elements and interactions
3. **Data Persistence:** Validate data is properly saved and retrieved
4. **Cross-Browser Testing:** Consider browser compatibility
5. **Mobile Responsiveness:** Include mobile device testing
6. **Error Handling:** Test error scenarios and user feedback

**Testing Framework:** {framework}
**Application Type:** {appType}

**Response Format (JSON):**
{
  "e2eSuite": {
    "fileName": "e2e_test_file_name",
    "content": "complete e2e test file",
    "framework": "testing framework used",
    "browser": "target browser configuration"
  },
  "userJourneys": [
    {
      "id": "journey_id",
      "name": "user journey name",
      "description": "journey description",
      "persona": "user type/role",
      "steps": [
        {
          "step": "step number",
          "action": "user action",
          "element": "UI element",
          "input": "input data if any",
          "expected": "expected result"
        }
      ],
      "assertions": ["end-to-end validations"],
      "testData": "test data requirements"
    }
  ],
  "configuration": {
    "browserSettings": "browser configuration",
    "deviceSettings": "device/viewport settings",
    "timeouts": "timeout configurations",
    "retryPolicy": "retry settings"
  }
}`
      },

      performanceTests: {
        system: `You are a performance testing expert who creates tests to validate system performance,
load handling, and resource usage under various conditions.`,
        
        user: `Generate performance tests for the provided code.

**Performance Test Areas:**
1. **Load Testing:** Test system behavior under expected load
2. **Stress Testing:** Test system limits and breaking points
3. **Volume Testing:** Test with large amounts of data
4. **Memory Testing:** Test memory usage and leaks
5. **Concurrency Testing:** Test concurrent user scenarios

**Response Format (JSON):**
{
  "performanceSuite": {
    "fileName": "performance_test_file_name",
    "content": "performance test implementation",
    "tooling": "performance testing tools used"
  },
  "performanceTests": [
    {
      "id": "perf_test_id",
      "name": "performance test name",
      "type": "load|stress|volume|memory|concurrency",
      "description": "what is being tested",
      "metrics": ["metrics to measure"],
      "thresholds": ["performance thresholds"],
      "scenario": "test scenario description"
    }
  ],
  "benchmarks": {
    "responseTime": "acceptable response time",
    "throughput": "expected throughput",
    "resourceUsage": "resource usage limits"
  }
}`
      },

      securityTests: {
        system: `You are a security testing expert who creates tests to validate application security,
identify vulnerabilities, and ensure security controls are working properly.`,
        
        user: `Generate security tests for the provided code.

**Security Test Areas:**
1. **Input Validation:** Test injection attacks and input sanitization
2. **Authentication:** Test login mechanisms and session management
3. **Authorization:** Test access controls and permission enforcement
4. **Data Protection:** Test data encryption and secure storage
5. **API Security:** Test API endpoints for security vulnerabilities

**Response Format (JSON):**
{
  "securitySuite": {
    "fileName": "security_test_file_name",
    "content": "security test implementation",
    "framework": "security testing framework"
  },
  "securityTests": [
    {
      "id": "security_test_id",
      "name": "security test name",
      "vulnerability": "vulnerability being tested",
      "description": "test description",
      "attackVector": "attack method being tested",
      "expectedBehavior": "expected secure behavior",
      "severity": "vulnerability severity level"
    }
  ],
  "compliance": {
    "standards": ["security standards addressed"],
    "checklist": ["security checklist items"]
  }
}`
      }
    };
  }

  /**
   * Enhanced generate method with multiple test types support
   */
  async generate(code, options = {}) {
    const testType = options.type || 'unitTests';
    const startTime = Date.now();

    try {
      this.logger.info('Starting test generation', { 
        testType, 
        codeLength: code.length,
        options 
      });

      // Validate inputs
      this.validateGenerationInput(code, testType, options);

      // Detect code language and framework if not provided
      const codeAnalysis = this.analyzeCode(code, options);
      
      // Prepare the generation request
      const prompt = this.prepareGenerationPrompt(code, testType, codeAnalysis);
      
      // Execute generation with retry logic
      const aiResponse = await this.executeGenerationWithRetry(prompt);
      
      // Process and validate the response
      const generationResult = await this.processGenerationResponse(aiResponse, testType);
      
      // Add metadata and enhancements
      const result = {
        ...generationResult,
        metadata: {
          testType,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          modelUsed: this.config.model,
          codeAnalysis,
          generationOptions: options
        }
      };

      this.logger.info('Test generation completed', {
        testType,
        processingTime: result.metadata.processingTime,
        testsGenerated: result.testCases?.length || result.testScenarios?.length || 0
      });

      return this.responseFormatter.success(result, 'Test generation completed successfully');

    } catch (error) {
      this.logger.error('Test generation failed', { error: error.message, testType });
      
      if (error.code === 'insufficient_quota') {
        throw ErrorHandler.createError('QUOTA_EXCEEDED', 'AI service quota exceeded', 429);
      }
      
      throw ErrorHandler.createError(
        'GENERATION_FAILED', 
        `Test generation failed: ${error.message}`, 
        500
      );
    }
  }

  /**
   * Validate generation input parameters
   */
  validateGenerationInput(code, testType, options) {
    if (!this.validationUtils.validateCodeInput(code)) {
      throw new Error('Invalid code input provided');
    }

    if (!this.prompts[testType]) {
      throw new Error(`Unsupported test type: ${testType}`);
    }

    if (code.length > 100000) {
      this.logger.warn('Large code file detected for test generation', { codeLength: code.length });
    }
  }

  /**
   * Analyze code to detect language, framework, and patterns
   */
  analyzeCode(code, options) {
    const analysis = {
      language: options.language || this.detectLanguage(code),
      framework: options.framework || this.detectTestFramework(code, options.language),
      patterns: this.detectCodePatterns(code),
      complexity: this.calculateComplexity(code),
      functions: this.extractFunctions(code),
      classes: this.extractClasses(code)
    };

    this.logger.debug('Code analysis completed', analysis);
    return analysis;
  }

  /**
   * Detect programming language from code
   */
  detectLanguage(code) {
    // Simple language detection based on syntax patterns
    if (code.includes('def ') && code.includes('import ')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
    if (code.includes('class ') && code.includes('public ')) return 'java';
    if (code.includes('#include') || code.includes('int main')) return 'cpp';
    if (code.includes('func ') && code.includes('package ')) return 'go';
    
    return 'javascript'; // Default fallback
  }

  /**
   * Detect appropriate test framework
   */
  detectTestFramework(code, language = 'javascript') {
    const lang = language.toLowerCase();
    
    if (lang === 'javascript') {
      if (code.includes('jest') || code.includes('@jest/globals')) return 'jest';
      if (code.includes('mocha') || code.includes('chai')) return 'mocha';
      if (code.includes('vitest')) return 'vitest';
      return 'jest'; // Default for JavaScript
    }
    
    if (lang === 'python') {
      if (code.includes('pytest')) return 'pytest';
      if (code.includes('unittest')) return 'unittest';
      return 'pytest'; // Default for Python
    }
    
    return 'jest'; // Global default
  }

  /**
   * Detect code patterns for better test generation
   */
  detectCodePatterns(code) {
    const patterns = {
      hasAsync: /async\s+function|await\s+/.test(code),
      hasClasses: /class\s+\w+/.test(code),
      hasFunctions: /function\s+\w+|const\s+\w+\s*=\s*\(/.test(code),
      hasExports: /module\.exports|export\s+/.test(code),
      hasImports: /require\(|import\s+/.test(code),
      hasAPI: /app\.(get|post|put|delete)|router\.|express/.test(code),
      hasDatabase: /mongoose|sequelize|prisma|knex|sql/.test(code),
      hasValidation: /validate|joi|yup|zod/.test(code),
      hasAuth: /auth|jwt|passport|session/.test(code),
      hasMiddleware: /middleware|next\(\)/.test(code)
    };

    return patterns;
  }

  /**
   * Calculate code complexity for test planning
   */
  calculateComplexity(code) {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const complexity = {
      lines: lines.length,
      functions: (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length,
      conditionals: (code.match(/if\s*\(|switch\s*\(|case\s+/g) || []).length,
      loops: (code.match(/for\s*\(|while\s*\(|forEach/g) || []).length,
      asyncOperations: (code.match(/async|await|Promise|callback/g) || []).length
    };

    complexity.score = Math.min(10, Math.round(
      (complexity.conditionals + complexity.loops + complexity.asyncOperations) / complexity.functions * 2
    ));

    return complexity;
  }

  /**
   * Extract function information for targeted testing
   */
  extractFunctions(code) {
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\()/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1] || match[2],
        isAsync: code.includes('async'),
        line: this.getLineNumber(code, match.index)
      });
    }

    return functions;
  }

  /**
   * Extract class information for OOP testing
   */
  extractClasses(code) {
    const classRegex = /class\s+(\w+)/g;
    const classes = [];
    let match;

    while ((match = classRegex.exec(code)) !== null) {
      classes.push({
        name: match[1],
        line: this.getLineNumber(code, match.index)
      });
    }

    return classes;
  }

  /**
   * Get line number from character index
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Prepare generation prompt
   */
  prepareGenerationPrompt(code, testType, codeAnalysis) {
    const promptTemplate = this.prompts[testType];
    
    // Build context information
    let contextInfo = `Programming Language: ${codeAnalysis.language}\n`;
    contextInfo += `Test Framework: ${codeAnalysis.framework}\n`;
    contextInfo += `Code Complexity: ${codeAnalysis.complexity.score}/10\n`;
    
    if (codeAnalysis.functions.length > 0) {
      contextInfo += `Functions Found: ${codeAnalysis.functions.map(f => f.name).join(', ')}\n`;
    }
    
    if (codeAnalysis.classes.length > 0) {
      contextInfo += `Classes Found: ${codeAnalysis.classes.map(c => c.name).join(', ')}\n`;
    }

    // Add detected patterns
    const detectedPatterns = Object.entries(codeAnalysis.patterns)
      .filter(([, value]) => value)
      .map(([key]) => key);
    
    if (detectedPatterns.length > 0) {
      contextInfo += `Detected Patterns: ${detectedPatterns.join(', ')}\n`;
    }

    const userPrompt = promptTemplate.user
      .replace('{framework}', codeAnalysis.framework)
      .replace('{language}', codeAnalysis.language);

    return [
      {
        role: 'system',
        content: promptTemplate.system
      },
      {
        role: 'user',
        content: `${contextInfo}\n\nCode to generate tests for:\n\`\`\`${codeAnalysis.language}\n${code}\n\`\`\`\n\n${userPrompt}`
      }
    ];
  }

  /**
   * Execute generation with retry logic
   */
  async executeGenerationWithRetry(messages) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.logger.debug(`Test generation attempt ${attempt}/${this.config.retryAttempts}`);
        
        const response = await this.openai.chat.completions.create({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: 'json_object' }
        });

        if (!response.choices?.[0]?.message?.content) {
          throw new Error('Empty response from AI service');
        }

        return response.choices[0].message.content;

      } catch (error) {
        lastError = error;
        this.logger.warn(`Test generation attempt ${attempt} failed`, { error: error.message });
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Process and validate generation response
   */
  async processGenerationResponse(response, testType) {
    try {
      const parsed = JSON.parse(response);
      
      // Validate response structure
      this.validateGenerationResponse(parsed, testType);
      
      // Enhance the response
      return this.enhanceGenerationResponse(parsed, testType);
      
    } catch (error) {
      this.logger.error('Failed to process test generation response', { error: error.message });
      throw new Error(`Invalid AI response format: ${error.message}`);
    }
  }

  /**
   * Validate generation response structure
   */
  validateGenerationResponse(response, testType) {
    const requiredFields = {
      unitTests: ['testSuite', 'testCases', 'coverage'],
      integrationTests: ['integrationSuite', 'testScenarios'],
      e2eTests: ['e2eSuite', 'userJourneys'],
      performanceTests: ['performanceSuite', 'performanceTests'],
      securityTests: ['securitySuite', 'securityTests']
    };

    const required = requiredFields[testType] || requiredFields.unitTests;
    
    for (const field of required) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Enhance generation response with additional data
   */
  enhanceGenerationResponse(response, testType) {
    // Add unique IDs if missing
    const testArrayField = this.getTestArrayField(testType);
    if (response[testArrayField]) {
      response[testArrayField] = response[testArrayField].map((test, index) => ({
        id: test.id || `test_${Date.now()}_${index}`,
        ...test
      }));
    }

    // Add test statistics
    response.statistics = this.calculateTestStatistics(response, testType);

    // Add quality metrics
    response.qualityMetrics = this.calculateQualityMetrics(response, testType);

    return response;
  }

  /**
   * Get test array field name based on test type
   */
  getTestArrayField(testType) {
    const fieldMap = {
      unitTests: 'testCases',
      integrationTests: 'testScenarios',
      e2eTests: 'userJourneys',
      performanceTests: 'performanceTests',
      securityTests: 'securityTests'
    };

    return fieldMap[testType] || 'testCases';
  }

  /**
   * Calculate test statistics
   */
  calculateTestStatistics(response, testType) {
    const testArrayField = this.getTestArrayField(testType);
    const tests = response[testArrayField] || [];

    const stats = {
      total: tests.length,
      byType: {},
      bySeverity: {}
    };

    tests.forEach(test => {
      if (test.type) {
        stats.byType[test.type] = (stats.byType[test.type] || 0) + 1;
      }
      if (test.severity) {
        stats.bySeverity[test.severity] = (stats.bySeverity[test.severity] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Calculate quality metrics for generated tests
   */
  calculateQualityMetrics(response, testType) {
    const testArrayField = this.getTestArrayField(testType);
    const tests = response[testArrayField] || [];

    const metrics = {
      completeness: 0,
      coverage: 0,
      maintainability: 0,
      reliability: 0
    };

    if (tests.length === 0) return metrics;

    // Calculate completeness based on test variety
    const testTypes = new Set(tests.map(t => t.type).filter(Boolean));
    metrics.completeness = Math.min(100, (testTypes.size / 5) * 100);

    // Extract coverage from response
    if (response.coverage?.estimatedPercentage) {
      metrics.coverage = response.coverage.estimatedPercentage;
    }

    // Calculate maintainability based on test structure
    const hasDescriptions = tests.filter(t => t.description).length;
    metrics.maintainability = Math.round((hasDescriptions / tests.length) * 100);

    // Calculate reliability based on assertion quality
    const hasAssertions = tests.filter(t => t.assertions?.length > 0).length;
    metrics.reliability = Math.round((hasAssertions / tests.length) * 100);

    return metrics;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate tests for multiple files
   */
  async generateBatch(files, options = {}) {
    const results = [];
    const batchStartTime = Date.now();

    this.logger.info('Starting batch test generation', { fileCount: files.length });

    for (const [index, file] of files.entries()) {
      try {
        this.logger.debug(`Processing file ${index + 1}/${files.length}`, { fileName: file.name });
        
        const result = await this.generate(file.content, {
          ...options,
          fileName: file.name
        });
        
        results.push({
          fileName: file.name,
          ...result
        });

      } catch (error) {
        this.logger.error(`Failed to generate tests for file: ${file.name}`, error);
        results.push({
          fileName: file.name,
          error: error.message
        });
      }
    }

    const batchResult = {
      results,
      summary: {
        totalFiles: files.length,
        successfulGenerations: results.filter(r => !r.error).length,
        failedGenerations: results.filter(r => r.error).length,
        processingTime: Date.now() - batchStartTime
      }
    };

    this.logger.info('Batch test generation completed', batchResult.summary);

    return this.responseFormatter.success(batchResult, 'Batch test generation completed');
  }

  /**
   * Get supported test frameworks for a language
   */
  getSupportedFrameworks(language = 'javascript') {
    return this.testFrameworks[language.toLowerCase()] || this.testFrameworks.javascript;
  }

  /**
   * Get framework configuration
   */
  getFrameworkConfig(language, framework) {
    const frameworks = this.getSupportedFrameworks(language);
    return frameworks[framework] || frameworks[Object.keys(frameworks)[0]];
  }
}

module.exports = new TestGenerator();
