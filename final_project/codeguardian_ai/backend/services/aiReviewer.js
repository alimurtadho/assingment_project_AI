/**
 * AI Code Reviewer Service
 * Uses OpenAI GPT-4 to perform intelligent code review
 */

const OpenAI = require('openai');

class AIReviewer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.prompts = {
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
}`,

      refactoring: `You are an expert software engineer providing refactoring suggestions.
Analyze the code and provide specific refactoring recommendations focusing on: {focusArea}

Consider:
- Code structure and organization
- Performance optimizations
- Readability improvements
- Modern language features
- Design patterns
- Error handling

Provide the response in JSON format:
{
  "refactoredCode": "complete refactored version",
  "changes": [
    {
      "type": "change type",
      "description": "what was changed",
      "benefit": "why this improves the code"
    }
  ],
  "reasoning": "overall refactoring rationale"
}`
    };
  }

  async reviewCode(fileContent, filename) {
    try {
      console.log(`🤖 AI reviewing ${filename}...`);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const language = this.detectLanguage(fileExtension);
      
      const prompt = `${this.prompts.codeReview}

Language: ${language}
Filename: ${filename}

Code to review:
\`\`\`${language}
${fileContent}
\`\`\``;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert software engineer specializing in code review and quality assessment."
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
      
      // Try to parse JSON response
      let reviewResult;
      try {
        reviewResult = JSON.parse(aiResponse);
      } catch (parseError) {
        // Fallback if AI doesn't return valid JSON
        reviewResult = {
          overallScore: 7,
          summary: "AI review completed but response formatting error occurred",
          issues: [{
            type: "parsing",
            severity: "LOW",
            description: "Could not parse AI response properly",
            recommendation: "Manual review recommended"
          }],
          strengths: ["Code structure appears functional"],
          suggestions: ["Consider manual code review"],
          rawResponse: aiResponse
        };
      }
      
      console.log(`✅ AI review complete for ${filename}`);
      return reviewResult;
      
    } catch (error) {
      console.error('AI review error:', error);
      
      // Return fallback response
      return {
        overallScore: 5,
        summary: "AI review service temporarily unavailable",
        issues: [{
          type: "service",
          severity: "LOW", 
          description: "AI review service encountered an error",
          recommendation: "Try again later or perform manual review"
        }],
        strengths: [],
        suggestions: ["Perform manual code review"],
        error: error.message
      };
    }
  }

  async suggestRefactoring(fileContent, filename, focusArea = 'general') {
    try {
      console.log(`🔧 AI refactoring ${filename} (focus: ${focusArea})`);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const language = this.detectLanguage(fileExtension);
      
      const prompt = this.prompts.refactoring.replace('{focusArea}', focusArea) + `

Language: ${language}
Filename: ${filename}
Focus Area: ${focusArea}

Code to refactor:
\`\`\`${language}
${fileContent}
\`\`\``;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert software engineer specializing in code refactoring and optimization."
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
      
      let refactorResult;
      try {
        refactorResult = JSON.parse(aiResponse);
      } catch (parseError) {
        refactorResult = {
          refactoredCode: fileContent,
          changes: [{
            type: "error",
            description: "Could not parse AI refactoring response",
            benefit: "Original code maintained"
          }],
          reasoning: "AI refactoring service encountered a parsing error",
          rawResponse: aiResponse
        };
      }
      
      console.log(`✅ AI refactoring complete for ${filename}`);
      return refactorResult;
      
    } catch (error) {
      console.error('AI refactoring error:', error);
      
      return {
        refactoredCode: fileContent,
        changes: [{
          type: "error",
          description: "AI refactoring service encountered an error",
          benefit: "Original code maintained"
        }],
        reasoning: "AI refactoring service temporarily unavailable",
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

module.exports = new AIReviewer();
