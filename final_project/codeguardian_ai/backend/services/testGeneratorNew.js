/**
 * Test Generator Service
 * Uses AI to generate comprehensive test cases
 */

const OpenAI = require('openai');
const { AI_PROMPTS } = require('../utils/aiPrompts');

class TestGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateTests(fileContent, filename, options = {}) {
    try {
      const { framework = 'jest', type = 'unit' } = options;
      
      console.log(`🧪 Generating ${type} tests for ${filename} using ${framework}`);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const language = this.detectLanguage(fileExtension);
      
      const prompt = AI_PROMPTS.UNIT_TESTS.replace('{framework}', framework) + `

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
            content: "You are an expert test engineer specializing in automated test generation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const aiResponse = response.choices[0].message.content;
      
      let testResult;
      try {
        testResult = JSON.parse(aiResponse);
      } catch (parseError) {
        testResult = {
          testFile: `// Generated test file for ${filename}\n// AI response parsing error\n\n${aiResponse}`,
          testCases: [{
            function: "parsing_error",
            description: "Could not parse AI test generation response",
            type: "error",
            scenario: "AI response formatting issue"
          }],
          coverage: {
            estimatedPercentage: 0,
            coveredFunctions: [],
            recommendations: ["Manual test creation required"]
          },
          framework: framework,
          dependencies: [framework],
          rawResponse: aiResponse
        };
      }
      
      console.log(`✅ Test generation complete for ${filename}`);
      return testResult;
      
    } catch (error) {
      console.error('Test generation error:', error);
      
      return {
        testFile: `// Test generation failed for ${filename}\n// Error: ${error.message}`,
        testCases: [{
          function: "error",
          description: "Test generation service encountered an error",
          type: "error",
          scenario: "Service unavailable"
        }],
        coverage: {
          estimatedPercentage: 0,
          coveredFunctions: [],
          recommendations: ["Manual test creation required"]
        },
        framework: options.framework || 'jest',
        dependencies: [],
        error: error.message
      };
    }
  }

  async generateIntegrationTests(files) {
    try {
      console.log(`🔗 Generating integration tests for ${files.length} files`);
      
      const filesContent = files.map(f => `
// File: ${f.filename}
\`\`\`
${f.content}
\`\`\`
`).join('\n');

      const prompt = AI_PROMPTS.INTEGRATION_TESTS + `

Files to test:
${filesContent}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert test engineer specializing in integration testing."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const aiResponse = response.choices[0].message.content;
      
      let integrationResult;
      try {
        integrationResult = JSON.parse(aiResponse);
      } catch (parseError) {
        integrationResult = {
          testFile: `// Integration tests\n// AI response parsing error\n\n${aiResponse}`,
          scenarios: [{
            name: "parsing_error",
            description: "Could not parse AI integration test response",
            setup: "Manual setup required"
          }],
          recommendations: ["Manual integration test creation required"],
          rawResponse: aiResponse
        };
      }
      
      console.log(`✅ Integration test generation complete`);
      return integrationResult;
      
    } catch (error) {
      console.error('Integration test generation error:', error);
      
      return {
        testFile: `// Integration test generation failed\n// Error: ${error.message}`,
        scenarios: [{
          name: "error",
          description: "Integration test generation service encountered an error",
          setup: "Service unavailable"
        }],
        recommendations: ["Manual integration test creation required"],
        error: error.message
      };
    }
  }

  async analyzeCoverage(fileContent, filename) {
    try {
      console.log(`📊 Analyzing test coverage for ${filename}`);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const language = this.detectLanguage(fileExtension);
      
      const prompt = AI_PROMPTS.COVERAGE_ANALYSIS + `

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
            content: "You are an expert test engineer specializing in test coverage analysis."
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
      
      let coverageResult;
      try {
        coverageResult = JSON.parse(aiResponse);
      } catch (parseError) {
        coverageResult = {
          currentCoverage: {
            percentage: 0,
            coveredFunctions: [],
            uncoveredFunctions: []
          },
          recommendations: ["Manual coverage analysis required"],
          priorities: ["High priority: Manual analysis"],
          testSuggestions: [],
          rawResponse: aiResponse
        };
      }
      
      console.log(`✅ Coverage analysis complete for ${filename}`);
      return coverageResult;
      
    } catch (error) {
      console.error('Coverage analysis error:', error);
      
      return {
        currentCoverage: {
          percentage: 0,
          coveredFunctions: [],
          uncoveredFunctions: []
        },
        recommendations: ["Coverage analysis service temporarily unavailable"],
        priorities: ["Manual analysis required"],
        testSuggestions: [],
        error: error.message
      };
    }
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
      'rs': 'rust',
      'cs': 'csharp',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    
    return languageMap[fileExtension] || 'text';
  }
}

module.exports = new TestGenerator();
