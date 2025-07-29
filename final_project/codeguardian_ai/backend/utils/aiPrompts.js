/**
 * AI Prompt Templates
 * Centralized prompt templates for AI-powered code analysis
 */

const AI_PROMPTS = {
  // Code Review Prompts
  codeReview: `You are an expert software engineer conducting a thorough code review. 
Analyze the provided code and identify:

1. Code quality issues (readability, maintainability, best practices)
2. Performance concerns
3. Security vulnerabilities
4. Bug potential
5. Design pattern violations
6. Testing gaps

For each issue found, provide:
- Issue type and severity (HIGH/MEDIUM/LOW)
- Line number (if applicable)
- Clear description of the problem
- Specific recommendation for improvement
- Example of better code when helpful

Respond in JSON format with this structure:
{
  "overallScore": 1-10,
  "summary": "Brief overall assessment",
  "issues": [
    {
      "type": "category",
      "severity": "HIGH|MEDIUM|LOW",
      "line": number,
      "description": "description",
      "recommendation": "specific fix",
      "example": "optional code example"
    }
  ],
  "strengths": ["positive aspects"],
  "suggestions": ["general improvements"]
}

Code to review:
{code}`,

  // Refactoring Suggestions
  refactoring: `You are an expert software engineer providing refactoring suggestions.
Analyze the code and provide specific refactoring recommendations.

Focus areas to consider:
- Code structure and organization
- Performance optimizations
- Readability improvements
- Design pattern applications
- Best practices implementation

Provide response in JSON format:
{
  "refactoringSuggestions": [
    {
      "type": "improvement_type",
      "priority": "HIGH|MEDIUM|LOW",
      "description": "what to refactor",
      "before": "current code snippet",
      "after": "improved code snippet",
      "rationale": "why this improvement is beneficial"
    }
  ],
  "overallRecommendations": ["general advice"],
  "estimatedImpact": "assessment of improvement impact"
}

Code to analyze:
{code}`,

  // Security Analysis
  securityAnalysis: `You are a cybersecurity expert analyzing code for security vulnerabilities.

Identify potential security issues including:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Authentication/authorization flaws
- Input validation issues
- Cryptographic problems
- Configuration security
- Data exposure risks

Provide response in JSON format:
{
  "securityIssues": [
    {
      "type": "vulnerability_type",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "cweId": "CWE-XXX if applicable",
      "description": "detailed vulnerability description",
      "location": "line number or code section",
      "recommendation": "how to fix this vulnerability",
      "example": "secure code example"
    }
  ],
  "overallRiskScore": 1-10,
  "summary": "overall security assessment"
}

Code to analyze:
{code}`,

  // Test Generation
  testGeneration: `You are a testing expert creating comprehensive test cases.

Analyze the provided code and generate appropriate test cases covering:
- Unit tests for individual functions/methods
- Edge cases and boundary conditions
- Error handling scenarios
- Integration test suggestions
- Mock/stub requirements

Provide response in JSON format:
{
  "testSuite": {
    "framework": "suggested framework (jest, mocha, etc.)",
    "testFiles": [
      {
        "filename": "test file name",
        "testCases": [
          {
            "description": "what this test verifies",
            "type": "unit|integration|edge-case|error",
            "code": "complete test code",
            "setup": "any required setup/mocks"
          }
        ]
      }
    ]
  },
  "coverageAnalysis": {
    "estimatedCoverage": "percentage",
    "uncoveredAreas": ["areas needing more tests"],
    "suggestions": ["additional testing recommendations"]
  }
}

Code to analyze:
{code}`,

  // Performance Analysis
  performanceAnalysis: `You are a performance optimization expert analyzing code for efficiency improvements.

Identify performance bottlenecks and optimization opportunities:
- Algorithm efficiency
- Memory usage
- I/O operations
- Database queries
- Loop optimizations
- Caching opportunities

Provide response in JSON format:
{
  "performanceIssues": [
    {
      "type": "performance_issue_type",
      "impact": "HIGH|MEDIUM|LOW",
      "description": "performance problem description",
      "location": "code location",
      "recommendation": "optimization suggestion",
      "estimatedImprovement": "expected performance gain"
    }
  ],
  "optimizationSuggestions": ["general performance advice"],
  "overallScore": 1-10
}

Code to analyze:
{code}`
};

/**
 * Get formatted prompt for specific analysis type
 * @param {string} type - Type of analysis (codeReview, refactoring, etc.)
 * @param {string} code - Code to analyze
 * @param {Object} options - Additional options for prompt customization
 * @returns {string} - Formatted prompt
 */
const getPrompt = (type, code, options = {}) => {
  const prompt = AI_PROMPTS[type];
  if (!prompt) {
    throw new Error(`Unknown prompt type: ${type}`);
  }

  let formattedPrompt = prompt.replace('{code}', code);
  
  // Replace any additional placeholders from options
  Object.keys(options).forEach(key => {
    const placeholder = `{${key}}`;
    if (formattedPrompt.includes(placeholder)) {
      formattedPrompt = formattedPrompt.replace(placeholder, options[key]);
    }
  });

  return formattedPrompt;
};

/**
 * Get all available prompt types
 * @returns {Array} - Array of available prompt types
 */
const getAvailablePromptTypes = () => {
  return Object.keys(AI_PROMPTS);
};

module.exports = {
  AI_PROMPTS,
  getPrompt,
  getAvailablePromptTypes
};
