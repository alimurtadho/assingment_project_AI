/**
 * Test Generator Service
 * Uses AI to generate comprehensive test cases
 */

const OpenAI = require('openai');

class TestGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.prompts = {
      unitTests: `You are an expert test engineer. Generate comprehensive unit tests for the provided code.

Requirements:
1. Generate tests for all public functions/methods
2. Include edge cases and boundary conditions
3. Test both success and failure scenarios
4. Use appropriate test framework: {framework}
5. Follow testing best practices
6. Include proper setup/teardown if needed
7. Add meaningful test descriptions

Respond in JSON format:
{
  "testFile": "complete test file content",
  "testCases": [
    {
      "function": "function name",
      "description": "test description", 
      "type": "unit|integration|edge-case",
      "scenario": "what is being tested"
    }
  ],
  "coverage": {
    "estimatedPercentage": number,
    "coveredFunctions": ["list of functions"],
    "recommendations": ["improvement suggestions"]
  },
  "framework": "test framework used",
  "dependencies": ["required test dependencies"]
}`,

      integrationTests: `Generate integration tests that test the interaction between multiple components/files.

Focus on:
1. API endpoints and their interactions
2. Database operations
3. External service calls
4. Data flow between components
5. Error handling across boundaries

Respond in JSON format with test scenarios and setup requirements.`,

      coverageAnalysis: `Analyze the provided code and suggest areas that need better test coverage.

Identify:
1. Functions/methods without tests
2. Complex logic that needs thorough testing
3. Error paths that should be tested
4. Edge cases to consider
5. Integration points to test

Provide specific recommendations for improving test coverage.`
    };
  }

  async generateTests(fileContent, filename, options = {}) {
    try {
      const { framework = 'jest', type = 'unit' } = options;
      
      console.log(`🧪 Generating ${type} tests for ${filename} using ${framework}`);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const language = this.detectLanguage(fileExtension);
      
      const prompt = this.prompts.unitTests.replace('{framework}', framework) + `

Language: ${language}
Framework: ${framework}
Filename: ${filename}

Code to test:
\`\`\`${language}
${fileContent}
\`\`\``;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert test engineer specializing in automated test generation and quality assurance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      });

      const aiResponse = response.choices[0].message.content;
      
      let testResult;
      try {
        testResult = JSON.parse(aiResponse);
      } catch (parseError) {
        // Fallback response
        testResult = this.generateFallbackTests(filename, framework, language);
        testResult.rawResponse = aiResponse;
      }
      
      // Add metadata
      testResult.metadata = {
        originalFile: filename,
        language,
        framework,
        generatedAt: new Date().toISOString()
      };
      
      console.log(`✅ Test generation complete for ${filename}`);
      return testResult;
      
    } catch (error) {
      console.error('Test generation error:', error);
      return this.generateFallbackTests(filename, options.framework, 'unknown', error);
    }
  }

  async analyzeCoverage(fileContent, filename) {
    try {
      console.log(`📊 Analyzing test coverage for ${filename}`);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const language = this.detectLanguage(fileExtension);
      
      const prompt = this.prompts.coverageAnalysis + `

Language: ${language}
Filename: ${filename}

Code to analyze:
\`\`\`${language}
${fileContent}
\`\`\``;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in test coverage analysis and quality assurance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const aiResponse = response.choices[0].message.content;
      
      // Parse functions from code
      const functions = this.extractFunctions(fileContent, language);
      
      return {
        filename,
        language,
        totalFunctions: functions.length,
        functions,
        recommendations: this.parseRecommendations(aiResponse),
        analysisDate: new Date().toISOString(),
        rawAnalysis: aiResponse
      };
      
    } catch (error) {
      console.error('Coverage analysis error:', error);
      return {
        filename,
        error: error.message,
        recommendations: ['Manual test coverage analysis recommended']
      };
    }
  }

  async generateIntegrationTests(files) {
    try {
      console.log(`🔗 Generating integration tests for ${files.length} files`);
      
      const fileList = files.map(f => `${f.filename}:\n${f.content}`).join('\n\n---\n\n');
      
      const prompt = this.prompts.integrationTests + `

Files to create integration tests for:
${fileList}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in integration testing and system architecture."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      const aiResponse = response.choices[0].message.content;
      
      return {
        files: files.map(f => f.filename),
        integrationTests: aiResponse,
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Integration test generation error:', error);
      return {
        files: files.map(f => f.filename),
        error: error.message,
        fallbackRecommendation: 'Create integration tests manually focusing on API endpoints and data flow'
      };
    }
  }

  generateFallbackTests(filename, framework = 'jest', language = 'javascript', error = null) {
    const testFilename = filename.replace(/\.(js|ts|py|java)$/, `.test.$1`);
    
    return {
      testFile: `// Auto-generated test file for ${filename}
// Framework: ${framework}
// Generated: ${new Date().toISOString()}

describe('${filename}', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });
  
  // TODO: Add specific tests for functions in ${filename}
});`,
      testCases: [
        {
          function: 'fallback',
          description: 'Basic test structure',
          type: 'unit',
          scenario: 'Fallback test when AI generation fails'
        }
      ],
      coverage: {
        estimatedPercentage: 0,
        coveredFunctions: [],
        recommendations: ['Generate tests manually', 'Review code structure']
      },
      framework,
      dependencies: [framework],
      error: error?.message,
      fallback: true
    };
  }

  extractFunctions(code, language) {
    const functions = [];
    
    try {
      if (language === 'javascript' || language === 'typescript') {
        // Extract JS/TS functions
        const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s+)?function|(?:async\s+)?(\w+)\s*\([^)]*\)\s*=>)/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
          const funcName = match[1] || match[2] || match[3];
          if (funcName) {
            functions.push({
              name: funcName,
              type: 'function',
              line: code.substring(0, match.index).split('\n').length
            });
          }
        }
      } else if (language === 'python') {
        // Extract Python functions
        const functionRegex = /def\s+(\w+)\s*\(/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
          functions.push({
            name: match[1],
            type: 'function',
            line: code.substring(0, match.index).split('\n').length
          });
        }
      }
    } catch (error) {
      console.error('Function extraction error:', error);
    }
    
    return functions;
  }

  parseRecommendations(analysisText) {
    // Simple parsing of AI recommendations
    const lines = analysisText.split('\n');
    const recommendations = [];
    
    for (const line of lines) {
      if (line.includes('test') || line.includes('coverage') || line.includes('should')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['Review code for testability improvements'];
  }

  detectLanguage(fileExtension) {
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript', 
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust'
    };
    
    return languageMap[fileExtension] || 'text';
  }
}

module.exports = new TestGenerator();
