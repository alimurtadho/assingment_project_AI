/**
 * Enhanced AI Code Reviewer Service
 * Uses OpenAI GPT-4 to perform intelligent code review with improved architecture
 */

const OpenAI = require('openai');
const ResponseFormatter = require('../utils/responseFormatter');
const ValidationUtils = require('../utils/validationUtils');
const Logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class AIReviewer {
  constructor() {
    this.logger = Logger;
    this.validationUtils = ValidationUtils;
    this.responseFormatter = ResponseFormatter;
    
    // Initialize OpenAI with proper error handling
    this.initializeOpenAI();
    
    // Enhanced prompts for different review types
    this.prompts = this.initializePrompts();
    
    // Review configuration
    this.config = {
      maxTokens: 4000,
      temperature: 0.1,
      model: 'gpt-4',
      retryAttempts: 3,
      retryDelay: 1000
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

      this.logger.info('OpenAI client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI client', error);
      throw ErrorHandler.createError('OPENAI_INIT_FAILED', 'Failed to initialize OpenAI client', 500);
    }
  }

  /**
   * Initialize enhanced prompts for different review types
   */
  initializePrompts() {
    return {
      codeReview: {
        system: `You are an expert software engineer conducting a comprehensive code review. 
Your analysis should be thorough, constructive, and actionable.`,
        
        user: `Analyze the provided code and identify:

1. **Code Quality Issues:**
   - Readability and maintainability concerns
   - Best practice violations
   - Code organization and structure
   - Naming conventions and clarity

2. **Performance Concerns:**
   - Algorithmic efficiency
   - Memory usage patterns
   - Database query optimization
   - Resource management

3. **Security Vulnerabilities:**
   - Input validation issues
   - Authentication/authorization gaps
   - Data exposure risks
   - Injection vulnerabilities

4. **Bug Potential:**
   - Logic errors and edge cases
   - Error handling gaps
   - Race conditions
   - Null pointer risks

5. **Design Pattern Violations:**
   - SOLID principles adherence
   - Appropriate pattern usage
   - Coupling and cohesion
   - Separation of concerns

6. **Testing Gaps:**
   - Test coverage assessment
   - Test quality evaluation
   - Missing test scenarios

For each issue, provide:
- Issue category and severity (CRITICAL/HIGH/MEDIUM/LOW)
- Specific line numbers or code blocks
- Clear problem description
- Actionable recommendations
- Code examples when helpful
- Estimated effort to fix

Respond in valid JSON format:
{
  "reviewSummary": {
    "overallScore": 1-10,
    "codeQuality": 1-10,
    "security": 1-10,
    "performance": 1-10,
    "maintainability": 1-10,
    "summary": "Brief overall assessment"
  },
  "issues": [
    {
      "id": "unique_id",
      "category": "Code Quality|Performance|Security|Bug Risk|Design|Testing",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "title": "Brief issue title",
      "description": "Detailed description",
      "location": {
        "line": number,
        "function": "function_name",
        "file": "file_context"
      },
      "impact": "Description of potential impact",
      "recommendation": "Specific fix recommendation",
      "example": "Code example if applicable",
      "effort": "LOW|MEDIUM|HIGH",
      "tags": ["relevant", "tags"]
    }
  ],
  "strengths": [
    {
      "aspect": "What is done well",
      "description": "Why it's good"
    }
  ],
  "suggestions": [
    {
      "category": "General improvement area",
      "priority": "HIGH|MEDIUM|LOW",
      "description": "Improvement suggestion",
      "benefits": "Expected benefits"
    }
  ],
  "metrics": {
    "linesOfCode": number,
    "complexityScore": 1-10,
    "duplicatedCode": "percentage",
    "testCoverage": "estimated_percentage"
  }
}`
      },

      refactoring: {
        system: `You are an expert software architect providing refactoring recommendations.
Focus on improving code structure, maintainability, and adherence to best practices.`,
        
        user: `Analyze the code and provide specific refactoring suggestions:

1. **Structural Improvements:**
   - Code organization and modularity
   - Function and class decomposition
   - Dependency management

2. **Design Pattern Applications:**
   - Appropriate pattern recommendations
   - Anti-pattern elimination
   - Architecture improvements

3. **Code Optimization:**
   - Performance optimizations
   - Memory usage improvements
   - Algorithm enhancements

4. **Maintainability Enhancements:**
   - Code readability improvements
   - Documentation suggestions
   - Error handling enhancements

Provide specific refactoring steps with code examples.

Respond in JSON format:
{
  "refactoringPlan": {
    "priority": "HIGH|MEDIUM|LOW",
    "estimatedEffort": "hours_estimate",
    "overview": "High-level refactoring strategy"
  },
  "refactorings": [
    {
      "id": "unique_id",
      "type": "Extract Method|Extract Class|Rename|Move|Inline|etc",
      "priority": "HIGH|MEDIUM|LOW",
      "title": "Refactoring title",
      "description": "What to refactor and why",
      "currentCode": "Code before refactoring",
      "refactoredCode": "Code after refactoring",
      "benefits": ["List of benefits"],
      "effort": "hours_estimate",
      "dependencies": ["Other refactorings this depends on"]
    }
  ],
  "architecturalSuggestions": [
    {
      "area": "Architecture component",
      "suggestion": "Improvement recommendation",
      "reasoning": "Why this improvement is needed"
    }
  ]
}`
      },

      security: {
        system: `You are a cybersecurity expert conducting a security-focused code review.
Identify potential vulnerabilities and security best practice violations.`,
        
        user: `Perform a comprehensive security analysis:

1. **Vulnerability Assessment:**
   - Input validation issues
   - Authentication/authorization flaws
   - Data exposure risks
   - Injection vulnerabilities

2. **Security Best Practices:**
   - Secure coding practices
   - Error handling security
   - Logging security
   - Configuration security

3. **Compliance Considerations:**
   - OWASP Top 10 compliance
   - Industry standard adherence
   - Privacy requirements

Respond with specific security recommendations and remediation steps.

JSON format:
{
  "securityAssessment": {
    "overallRiskLevel": "CRITICAL|HIGH|MEDIUM|LOW",
    "vulnerabilityCount": number,
    "complianceScore": 1-10,
    "summary": "Security assessment summary"
  },
  "vulnerabilities": [
    {
      "id": "vuln_id",
      "type": "OWASP category",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "title": "Vulnerability title",
      "description": "Detailed vulnerability description",
      "location": "Code location",
      "impact": "Potential impact description",
      "remediation": "Step-by-step fix",
      "references": ["CWE-XXX", "OWASP links"]
    }
  ],
  "recommendations": [
    {
      "category": "Security area",
      "priority": "HIGH|MEDIUM|LOW",
      "recommendation": "Security improvement",
      "implementation": "How to implement"
    }
  ]
}`
      },

      performance: {
        system: `You are a performance optimization expert analyzing code for efficiency improvements.`,
        
        user: `Analyze the code for performance optimization opportunities:

1. **Algorithm Efficiency:**
   - Time complexity analysis
   - Space complexity concerns
   - Algorithm choice validation

2. **Resource Management:**
   - Memory usage patterns
   - Database query efficiency
   - I/O optimization

3. **Scalability Concerns:**
   - Bottleneck identification
   - Concurrency issues
   - Load handling capacity

Provide actionable performance improvement recommendations.

JSON format:
{
  "performanceAssessment": {
    "overallScore": 1-10,
    "bottlenecks": number,
    "scalabilityScore": 1-10,
    "summary": "Performance assessment summary"
  },
  "optimizations": [
    {
      "id": "opt_id",
      "type": "Algorithm|Database|Memory|I/O|Concurrency",
      "priority": "HIGH|MEDIUM|LOW",
      "title": "Optimization title",
      "description": "Performance issue description",
      "currentComplexity": "Big O notation",
      "proposedComplexity": "Improved Big O",
      "expectedImprovement": "Performance gain description",
      "implementation": "How to implement the optimization",
      "tradeoffs": "Any trade-offs to consider"
    }
  ],
  "metrics": {
    "estimatedSpeedImprovement": "percentage",
    "memoryReduction": "percentage",
    "scalabilityImprovement": "description"
  }
}`
      }
    };
  }

  /**
   * Enhanced review method with retry logic and better error handling
   */
  async review(code, options = {}) {
    const reviewType = options.type || 'codeReview';
    const startTime = Date.now();

    try {
      this.logger.info('Starting AI code review', { 
        reviewType, 
        codeLength: code.length,
        options 
      });

      // Validate inputs
      this.validateReviewInput(code, reviewType);

      // Prepare the review request
      const prompt = this.preparePrompt(code, reviewType, options);
      
      // Execute review with retry logic
      const aiResponse = await this.executeReviewWithRetry(prompt);
      
      // Process and validate the response
      const reviewResult = await this.processReviewResponse(aiResponse, reviewType);
      
      // Add metadata
      const result = {
        ...reviewResult,
        metadata: {
          reviewType,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          modelUsed: this.config.model,
          codeMetrics: this.analyzeCodeMetrics(code)
        }
      };

      this.logger.info('AI code review completed', {
        reviewType,
        processingTime: result.metadata.processingTime,
        issuesFound: reviewResult.issues?.length || 0
      });

      return this.responseFormatter.success(result, 'Code review completed successfully');

    } catch (error) {
      this.logger.error('AI code review failed', { error: error.message, reviewType });
      
      if (error.code === 'insufficient_quota') {
        throw ErrorHandler.createError('QUOTA_EXCEEDED', 'AI service quota exceeded', 429);
      }
      
      throw ErrorHandler.createError(
        'REVIEW_FAILED', 
        `AI code review failed: ${error.message}`, 
        500
      );
    }
  }

  /**
   * Validate review input parameters
   */
  validateReviewInput(code, reviewType) {
    if (!this.validationUtils.validateCodeInput(code)) {
      throw new Error('Invalid code input provided');
    }

    if (!this.prompts[reviewType]) {
      throw new Error(`Unsupported review type: ${reviewType}`);
    }

    if (code.length > 50000) {
      this.logger.warn('Large code file detected', { codeLength: code.length });
    }
  }

  /**
   * Prepare prompt for AI review
   */
  preparePrompt(code, reviewType, options) {
    const promptTemplate = this.prompts[reviewType];
    
    // Add context if provided
    let contextInfo = '';
    if (options.language) {
      contextInfo += `Programming Language: ${options.language}\n`;
    }
    if (options.framework) {
      contextInfo += `Framework: ${options.framework}\n`;
    }
    if (options.focus) {
      contextInfo += `Focus Areas: ${options.focus.join(', ')}\n`;
    }

    return [
      {
        role: 'system',
        content: promptTemplate.system
      },
      {
        role: 'user',
        content: `${contextInfo}\n\nCode to review:\n\`\`\`\n${code}\n\`\`\`\n\n${promptTemplate.user}`
      }
    ];
  }

  /**
   * Execute review with retry logic
   */
  async executeReviewWithRetry(messages) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.logger.debug(`AI review attempt ${attempt}/${this.config.retryAttempts}`);
        
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
        this.logger.warn(`AI review attempt ${attempt} failed`, { error: error.message });
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Process and validate AI response
   */
  async processReviewResponse(response, reviewType) {
    try {
      const parsed = JSON.parse(response);
      
      // Validate response structure based on review type
      this.validateResponseStructure(parsed, reviewType);
      
      // Enhance the response with additional processing
      return this.enhanceReviewResponse(parsed, reviewType);
      
    } catch (error) {
      this.logger.error('Failed to process AI response', { error: error.message });
      throw new Error(`Invalid AI response format: ${error.message}`);
    }
  }

  /**
   * Validate response structure
   */
  validateResponseStructure(response, reviewType) {
    const requiredFields = {
      codeReview: ['reviewSummary', 'issues'],
      refactoring: ['refactoringPlan', 'refactorings'],
      security: ['securityAssessment', 'vulnerabilities'],
      performance: ['performanceAssessment', 'optimizations']
    };

    const required = requiredFields[reviewType] || requiredFields.codeReview;
    
    for (const field of required) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Enhance review response with additional data
   */
  enhanceReviewResponse(response, reviewType) {
    // Add unique IDs if missing
    if (response.issues) {
      response.issues = response.issues.map((issue, index) => ({
        id: issue.id || `issue_${Date.now()}_${index}`,
        ...issue
      }));
    }

    // Add priority scoring
    if (response.issues) {
      response.priorityScore = this.calculatePriorityScore(response.issues);
    }

    // Add actionable items summary
    response.actionableItems = this.extractActionableItems(response);

    return response;
  }

  /**
   * Calculate priority score based on issues
   */
  calculatePriorityScore(issues) {
    const weights = { CRITICAL: 10, HIGH: 7, MEDIUM: 4, LOW: 1 };
    const totalWeight = issues.reduce((sum, issue) => {
      return sum + (weights[issue.severity] || 1);
    }, 0);
    
    return Math.min(100, Math.round(totalWeight / issues.length * 10));
  }

  /**
   * Extract actionable items from review
   */
  extractActionableItems(response) {
    const items = [];
    
    // Extract from issues
    if (response.issues) {
      response.issues
        .filter(issue => issue.severity === 'HIGH' || issue.severity === 'CRITICAL')
        .forEach(issue => {
          items.push({
            type: 'fix',
            priority: issue.severity,
            description: issue.recommendation || issue.description,
            location: issue.location
          });
        });
    }

    // Extract from suggestions
    if (response.suggestions) {
      response.suggestions
        .filter(suggestion => suggestion.priority === 'HIGH')
        .forEach(suggestion => {
          items.push({
            type: 'improvement',
            priority: suggestion.priority,
            description: suggestion.description
          });
        });
    }

    return items;
  }

  /**
   * Analyze basic code metrics
   */
  analyzeCodeMetrics(code) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*')
    );

    return {
      totalLines: lines.length,
      linesOfCode: nonEmptyLines.length,
      commentLines: commentLines.length,
      commentRatio: Math.round((commentLines.length / nonEmptyLines.length) * 100),
      averageLineLength: Math.round(
        nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length
      )
    };
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch review multiple files
   */
  async batchReview(files, options = {}) {
    const results = [];
    const batchStartTime = Date.now();

    this.logger.info('Starting batch code review', { fileCount: files.length });

    for (const [index, file] of files.entries()) {
      try {
        this.logger.debug(`Processing file ${index + 1}/${files.length}`, { fileName: file.name });
        
        const result = await this.review(file.content, {
          ...options,
          fileName: file.name
        });
        
        results.push({
          fileName: file.name,
          ...result
        });

      } catch (error) {
        this.logger.error(`Failed to review file: ${file.name}`, error);
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
        successfulReviews: results.filter(r => !r.error).length,
        failedReviews: results.filter(r => r.error).length,
        processingTime: Date.now() - batchStartTime
      }
    };

    this.logger.info('Batch code review completed', batchResult.summary);

    return this.responseFormatter.success(batchResult, 'Batch code review completed');
  }
}

module.exports = new AIReviewer();
