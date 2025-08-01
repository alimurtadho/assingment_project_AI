#!/usr/bin/env node

/**
 * CodeGuardian AI - Advanced Security & Quality Analysis
 * Deep code analysis with AI-powered recommendations
 */

const fs = require('fs');
const path = require('path');

class AdvancedCodeAnalyzer {
  constructor() {
    this.analysisResults = {
      security: [],
      performance: [], 
      maintainability: [],
      accessibility: [],
      bestPractices: []
    };
  }

  async performDeepAnalysis(filePath) {
    console.log('🔍 CodeGuardian AI - Advanced Analysis Engine');
    console.log('=' .repeat(50));
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`📁 Analyzing: ${fileName}`);
    console.log(`📊 File size: ${fileContent.length} characters`);
    console.log(`📝 Lines of code: ${fileContent.split('\n').length}`);
    console.log();

    // Perform multiple analysis types
    await this.analyzeSecurityIssues(fileContent, fileName);
    await this.analyzePerformanceIssues(fileContent, fileName);
    await this.analyzeMaintainability(fileContent, fileName);
    await this.analyzeBestPractices(fileContent, fileName);
    await this.analyzeAccessibility(fileContent, fileName);

    return this.generateComprehensiveReport(fileName);
  }

  async analyzeSecurityIssues(content, fileName) {
    console.log('🔒 Security Analysis...');
    
    const securityChecks = [
      {
        name: 'Input Validation',
        pattern: /function.*\(.*\)|=>\s*{/g,
        check: (match, context) => this.checkInputValidation(match, context),
        severity: 'MEDIUM'
      },
      {
        name: 'Error Information Disclosure',
        pattern: /throw new Error\(['"][^'"]*['"]|console\.(log|error)\(/g,
        check: (match) => this.checkErrorDisclosure(match),
        severity: 'LOW'
      },
      {
        name: 'Prototype Pollution',
        pattern: /\[.*\]\s*=|Object\.assign\(/g,
        check: (match) => this.checkPrototypePollution(match),
        severity: 'HIGH'
      },
      {
        name: 'ReDoS Vulnerability',
        pattern: /\/\^.*\$\/|new RegExp\(/g,
        check: (match) => this.checkReDoS(match),
        severity: 'MEDIUM'
      }
    ];

    for (const check of securityChecks) {
      const matches = [...content.matchAll(check.pattern)];
      for (const match of matches) {
        const issue = check.check(match[0], this.getContext(content, match.index));
        if (issue) {
          this.analysisResults.security.push({
            type: check.name,
            severity: check.severity,
            line: this.getLineNumber(content, match.index),
            description: issue.description,
            recommendation: issue.recommendation,
            code: match[0]
          });
        }
      }
    }

    console.log(`   Found ${this.analysisResults.security.length} security issues`);
  }

  async analyzePerformanceIssues(content, fileName) {
    console.log('⚡ Performance Analysis...');
    
    const performanceChecks = [
      {
        name: 'Inefficient Loops',
        pattern: /for\s*\(\s*let\s+\w+\s*=\s*0.*length.*\+\+/g,
        issue: 'Array.length accessed in loop condition',
        recommendation: 'Cache array length outside loop or use for...of'
      },
      {
        name: 'Recursive Function Without Memoization',
        pattern: /function\s+\w+.*{\s*if.*return\s+\w+\(.*\)\s*\+\s*\w+\(/g,
        issue: 'Recursive function may benefit from memoization',
        recommendation: 'Consider implementing memoization for repeated calculations'
      },
      {
        name: 'Synchronous Operations',
        pattern: /(?<!async\s+)function.*{\s*(?!.*await).*fetch|(?<!async\s+)=>\s*{(?!.*await).*fetch/g,
        issue: 'Potentially blocking synchronous operation',
        recommendation: 'Consider using async/await for better performance'
      }
    ];

    for (const check of performanceChecks) {
      const matches = [...content.matchAll(check.pattern)];
      for (const match of matches) {
        this.analysisResults.performance.push({
          type: check.name,
          severity: 'MEDIUM',
          line: this.getLineNumber(content, match.index),
          description: check.issue,
          recommendation: check.recommendation,
          code: match[0].substring(0, 100)
        });
      }
    }

    console.log(`   Found ${this.analysisResults.performance.length} performance issues`);
  }

  async analyzeMaintainability(content, fileName) {
    console.log('🔧 Maintainability Analysis...');
    
    const maintainabilityChecks = [
      {
        name: 'Magic Numbers',
        pattern: /(?<![.\w])\d{2,}(?![.\w])/g,
        check: (match) => parseInt(match) > 10,
        issue: 'Magic number found',
        recommendation: 'Extract to named constant'
      },
      {
        name: 'Long Functions',
        pattern: /function[^{]*{[^}]{300,}}/g,
        issue: 'Function is too long',
        recommendation: 'Consider breaking into smaller functions'
      },
      {
        name: 'Complex Conditional Logic',
        pattern: /if\s*\([^{]*{[^}]*if[^}]*if/g,
        issue: 'Nested conditional statements',
        recommendation: 'Consider early returns or guard clauses'
      },
      {
        name: 'Duplicate Code Patterns',
        pattern: /(\w+\.test\([^)]+\))\s*;\s*\1/g,
        issue: 'Potential code duplication',
        recommendation: 'Extract common logic to helper function'
      }
    ];

    for (const check of maintainabilityChecks) {
      const matches = [...content.matchAll(check.pattern)];
      for (const match of matches) {
        let shouldReport = true;
        if (check.check) {
          shouldReport = check.check(match[0]);
        }
        
        if (shouldReport) {
          this.analysisResults.maintainability.push({
            type: check.name,
            severity: 'LOW',
            line: this.getLineNumber(content, match.index),
            description: check.issue,
            recommendation: check.recommendation,
            code: match[0].substring(0, 80)
          });
        }
      }
    }

    console.log(`   Found ${this.analysisResults.maintainability.length} maintainability issues`);
  }

  async analyzeBestPractices(content, fileName) {
    console.log('✨ Best Practices Analysis...');
    
    const bestPracticeChecks = [
      {
        name: 'Error Handling',
        pattern: /try\s*{[^}]*}\s*catch|async\s+function[^{]*{(?!.*try)/g,
        issue: 'Missing or incomplete error handling',
        recommendation: 'Add proper try-catch blocks for error handling'
      },
      {
        name: 'Type Safety',
        pattern: /:\s*any(?!\[\])|as\s+any/g,
        issue: 'Using "any" type reduces type safety',
        recommendation: 'Use specific types instead of "any"'
      },
      {
        name: 'Const Usage',
        pattern: /let\s+(\w+)\s*=\s*[^;]*;(?![^;]*\1\s*=)/g,
        issue: 'Variable declared with "let" but never reassigned',
        recommendation: 'Use "const" for variables that are not reassigned'
      },
      {
        name: 'Arrow Function Consistency',
        pattern: /function\s*\([^)]*\)\s*{[^}]*return[^}]*}/g,
        issue: 'Function could be simplified to arrow function',
        recommendation: 'Consider using arrow functions for simple expressions'
      }
    ];

    for (const check of bestPracticeChecks) {
      const matches = [...content.matchAll(check.pattern)];
      for (const match of matches) {
        this.analysisResults.bestPractices.push({
          type: check.name,
          severity: 'INFO',
          line: this.getLineNumber(content, match.index),
          description: check.issue,
          recommendation: check.recommendation,
          code: match[0].substring(0, 80)
        });
      }
    }

    console.log(`   Found ${this.analysisResults.bestPractices.length} best practice suggestions`);
  }

  async analyzeAccessibility(content, fileName) {
    console.log('♿ Accessibility Analysis...');
    
    // For now, accessibility analysis would be more relevant for frontend code
    // But we can analyze for general inclusive practices
    const accessibilityChecks = [
      {
        name: 'Descriptive Error Messages',
        pattern: /throw new Error\((['"][^'"]{1,20}['"])\)/g,
        issue: 'Error message may not be descriptive enough',
        recommendation: 'Provide more descriptive error messages for better user experience'
      }
    ];

    for (const check of accessibilityChecks) {
      const matches = [...content.matchAll(check.pattern)];
      for (const match of matches) {
        if (match[1] && match[1].length < 15) { // Short error messages
          this.analysisResults.accessibility.push({
            type: check.name,
            severity: 'INFO',
            line: this.getLineNumber(content, match.index),
            description: check.issue,
            recommendation: check.recommendation,
            code: match[0]
          });
        }
      }
    }

    console.log(`   Found ${this.analysisResults.accessibility.length} accessibility suggestions`);
  }

  // Security check implementations
  checkInputValidation(functionCode, context) {
    if (!functionCode.includes('validate') && !context.includes('if') && !context.includes('throw')) {
      return {
        description: 'Function may lack input validation',
        recommendation: 'Add input validation to prevent invalid data processing'
      };
    }
    return null;
  }

  checkErrorDisclosure(errorCode) {
    if (errorCode.includes('Error(') && errorCode.length > 50) {
      return {
        description: 'Error message may contain sensitive information',
        recommendation: 'Use generic error messages in production'
      };
    }
    return null;
  }

  checkPrototypePollution(code) {
    if (code.includes('[') && !code.includes('Array.isArray')) {
      return {
        description: 'Potential prototype pollution vulnerability',
        recommendation: 'Validate object keys and use Object.hasOwnProperty checks'
      };
    }
    return null;
  }

  checkReDoS(regexCode) {
    if (regexCode.includes('*') && regexCode.includes('+')) {
      return {
        description: 'Regular expression may be vulnerable to ReDoS attacks',
        recommendation: 'Simplify regex pattern or add input length limits'
      };
    }
    return null;
  }

  getContext(content, index) {
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 100);
    return content.substring(start, end);
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  generateComprehensiveReport(fileName) {
    console.log('\n📊 Generating Comprehensive Report...');
    
    const totalIssues = Object.values(this.analysisResults)
      .reduce((sum, issues) => sum + issues.length, 0);

    const report = {
      fileName,
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues,
        security: this.analysisResults.security.length,
        performance: this.analysisResults.performance.length,
        maintainability: this.analysisResults.maintainability.length,
        accessibility: this.analysisResults.accessibility.length,
        bestPractices: this.analysisResults.bestPractices.length
      },
      issues: this.analysisResults,
      recommendations: this.generateTopRecommendations(),
      qualityScore: this.calculateQualityScore()
    };

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync(`${fileName}-analysis-report.html`, htmlReport);

    // Generate JSON report
    fs.writeFileSync(`${fileName}-analysis-report.json`, JSON.stringify(report, null, 2));

    console.log(`✅ Generated HTML report: ${fileName}-analysis-report.html`);
    console.log(`✅ Generated JSON report: ${fileName}-analysis-report.json`);

    return report;
  }

  generateTopRecommendations() {
    const recommendations = [];
    
    // Security recommendations
    if (this.analysisResults.security.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security',
        recommendation: 'Address security vulnerabilities immediately',
        impact: 'Critical security risks could be exploited by attackers'
      });
    }

    // Performance recommendations  
    if (this.analysisResults.performance.length > 2) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Performance',
        recommendation: 'Optimize performance bottlenecks',
        impact: 'Improved user experience and reduced resource usage'
      });
    }

    // Maintainability recommendations
    if (this.analysisResults.maintainability.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Maintainability',
        recommendation: 'Refactor code for better maintainability',
        impact: 'Easier code maintenance and future development'
      });
    }

    // Best practices
    if (this.analysisResults.bestPractices.length > 3) {
      recommendations.push({
        priority: 'LOW',
        category: 'Best Practices',
        recommendation: 'Follow TypeScript/JavaScript best practices',
        impact: 'Improved code quality and team productivity'
      });
    }

    return recommendations;
  }

  calculateQualityScore() {
    const weights = {
      security: -10,      // Security issues heavily impact score
      performance: -5,    // Performance issues moderately impact score
      maintainability: -2, // Maintainability issues lightly impact score
      accessibility: -1,  // Accessibility suggestions minimal impact
      bestPractices: -1   // Best practice suggestions minimal impact
    };

    let score = 100; // Start with perfect score

    for (const [category, issues] of Object.entries(this.analysisResults)) {
      score += issues.length * weights[category];
    }

    return Math.max(0, Math.min(100, score)); // Clamp between 0 and 100
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGuardian AI - Advanced Analysis Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #f5f7fa; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; }
        .quality-score { font-size: 3em; font-weight: bold; margin: 10px 0; }
        .score-excellent { color: #2ecc71; }
        .score-good { color: #f39c12; }
        .score-poor { color: #e74c3c; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .issue-section { background: white; margin-bottom: 20px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .section-header { padding: 20px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
        .issue-item { padding: 15px 20px; border-bottom: 1px solid #eee; }
        .issue-item:last-child { border-bottom: none; }
        .severity-high { border-left: 4px solid #e74c3c; }
        .severity-medium { border-left: 4px solid #f39c12; }
        .severity-low { border-left: 4px solid #3498db; }
        .severity-info { border-left: 4px solid #9b59b6; }
        .code-snippet { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 0.9em; margin: 10px 0; }
        .recommendations { background: #e8f5e8; padding: 20px; border-radius: 10px; margin-top: 20px; }
        .rec-high { color: #c0392b; font-weight: bold; }
        .rec-medium { color: #d68910; font-weight: bold; }
        .rec-low { color: #5d6d7e; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ CodeGuardian AI - Advanced Analysis</h1>
            <p>File: ${report.fileName}</p>
            <div class="quality-score ${this.getScoreClass(report.qualityScore)}">${report.qualityScore}/100</div>
            <p>Quality Score</p>
            <small>Generated: ${report.timestamp}</small>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>🔒 Security</h3>
                <div style="font-size: 2em; color: #e74c3c;">${report.summary.security}</div>
                <p>Issues Found</p>
            </div>
            <div class="summary-card">
                <h3>⚡ Performance</h3>
                <div style="font-size: 2em; color: #f39c12;">${report.summary.performance}</div>
                <p>Issues Found</p>
            </div>
            <div class="summary-card">
                <h3>🔧 Maintainability</h3>
                <div style="font-size: 2em; color: #3498db;">${report.summary.maintainability}</div>
                <p>Issues Found</p>
            </div>
            <div class="summary-card">
                <h3>✨ Best Practices</h3>
                <div style="font-size: 2em; color: #9b59b6;">${report.summary.bestPractices}</div>
                <p>Suggestions</p>
            </div>
        </div>

        ${this.generateIssuesHTML(report.issues)}

        <div class="recommendations">
            <h2>💡 Top Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="rec-${rec.priority.toLowerCase()}" style="margin-bottom: 15px;">
                    <strong>${rec.category}:</strong> ${rec.recommendation}
                    <br><small><em>Impact: ${rec.impact}</em></small>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-poor';
  }

  generateIssuesHTML(issues) {
    let html = '';
    
    for (const [category, categoryIssues] of Object.entries(issues)) {
      if (categoryIssues.length === 0) continue;
      
      const categoryIcons = {
        security: '🔒',
        performance: '⚡',
        maintainability: '🔧',
        accessibility: '♿',
        bestPractices: '✨'
      };

      html += `
        <div class="issue-section">
          <div class="section-header">
            <h3>${categoryIcons[category]} ${category.charAt(0).toUpperCase() + category.slice(1)} Issues</h3>
          </div>
      `;

      for (const issue of categoryIssues) {
        html += `
          <div class="issue-item severity-${issue.severity.toLowerCase()}">
            <strong>${issue.type}</strong> (Line ${issue.line})
            <p>${issue.description}</p>
            <div class="code-snippet">${issue.code}</div>
            <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
          </div>
        `;
      }

      html += '</div>';
    }

    return html;
  }
}

// Main execution
async function main() {
  const analyzer = new AdvancedCodeAnalyzer();
  const targetFile = 'functions-for-testing.ts';
  
  try {
    const report = await analyzer.performDeepAnalysis(targetFile);
    
    console.log('\n🎉 Advanced Analysis Complete!');
    console.log('=' .repeat(50));
    console.log(`📊 Quality Score: ${report.qualityScore}/100`);
    console.log(`🔒 Security Issues: ${report.summary.security}`);
    console.log(`⚡ Performance Issues: ${report.summary.performance}`);
    console.log(`🔧 Maintainability Issues: ${report.summary.maintainability}`);
    console.log(`✨ Best Practice Suggestions: ${report.summary.bestPractices}`);
    console.log(`💡 Top Recommendations: ${report.recommendations.length}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AdvancedCodeAnalyzer;
