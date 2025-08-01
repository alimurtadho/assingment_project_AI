#!/usr/bin/env node

/**
 * CodeGuardian AI - Simple File Analysis Demo
 * Direct analysis of code-quality-issues.ts and functions-for-testing.ts
 */

const fs = require('fs');
const path = require('path');

class SimpleFileAnalyzer {
  constructor() {
    this.targetFiles = [
      'code-quality-issues.ts',
      'functions-for-testing.ts'
    ];
  }

  async runAnalysis() {
    console.log('🎯 CodeGuardian AI - File Analysis Demo');
    console.log('======================================');
    console.log('Analyzing: code-quality-issues.ts and functions-for-testing.ts\n');

    const results = [];

    for (const fileName of this.targetFiles) {
      const result = await this.analyzeFile(fileName);
      results.push(result);
    }

    this.generateComparison(results);
    this.saveResults(results);
  }

  async analyzeFile(fileName) {
    console.log(`🔍 Analyzing: ${fileName}`);
    console.log('─'.repeat(50));

    try {
      const filePath = path.join(__dirname, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const analysis = {
        fileName,
        stats: this.getFileStats(content),
        codeQuality: this.analyzeCodeQuality(content),
        security: this.basicSecurityCheck(content),
        apiReadiness: this.assessAPIReadiness(content),
        content: content
      };

      // Display results
      console.log(`📊 File Statistics:`);
      console.log(`   • Size: ${analysis.stats.size} bytes`);
      console.log(`   • Lines: ${analysis.stats.lines}`);
      console.log(`   • Functions: ${analysis.stats.functions.length}`);
      console.log(`   • Classes: ${analysis.stats.classes.length}`);
      console.log(`   • Interfaces: ${analysis.stats.interfaces.length}`);

      console.log(`\n🔍 Code Elements Found:`);
      if (analysis.stats.functions.length > 0) {
        console.log(`   Functions: ${analysis.stats.functions.join(', ')}`);
      }
      if (analysis.stats.classes.length > 0) {
        console.log(`   Classes: ${analysis.stats.classes.join(', ')}`);
      }
      if (analysis.stats.interfaces.length > 0) {
        console.log(`   Interfaces: ${analysis.stats.interfaces.join(', ')}`);
      }

      console.log(`\n📊 Quality Analysis:`);
      console.log(`   • Quality Score: ${analysis.codeQuality.score}/100`);
      console.log(`   • Complexity: ${analysis.codeQuality.complexity}`);
      console.log(`   • Maintainability: ${analysis.codeQuality.maintainability}`);
      console.log(`   • Documentation: ${analysis.codeQuality.documentation}`);

      console.log(`\n🔒 Security Check:`);
      console.log(`   • Security Issues: ${analysis.security.issues.length}`);
      console.log(`   • Risk Level: ${analysis.security.riskLevel}`);
      if (analysis.security.issues.length > 0) {
        analysis.security.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      } else {
        console.log(`   ✅ No obvious security issues detected`);
      }

      console.log(`\n🔌 API Testing Readiness:`);
      console.log(`   • Upload Ready: ${analysis.apiReadiness.uploadReady ? '✅' : '❌'}`);
      console.log(`   • Test Generation: ${analysis.apiReadiness.testGeneration ? '✅' : '❌'}`);
      console.log(`   • Security Scanning: ${analysis.apiReadiness.securityScanning ? '✅' : '❌'}`);
      console.log(`   • Estimated API Response Time: ${analysis.apiReadiness.estimatedResponseTime}ms`);

      console.log('\n' + '='.repeat(60) + '\n');
      return analysis;

    } catch (error) {
      console.log(`   ❌ Error analyzing ${fileName}: ${error.message}\n`);
      return { fileName, error: error.message };
    }
  }

  getFileStats(content) {
    const lines = content.split('\n');
    const size = Buffer.byteLength(content);
    
    // Extract functions
    const functionMatches = content.match(/(?:function\s+(\w+)|(\w+)\s*\([^)]*\)\s*:\s*[\w<>[\]|]+|(\w+)\s*\([^)]*\)\s*{)/g) || [];
    const functions = [...new Set(functionMatches.map(match => {
      const funcMatch = match.match(/(?:function\s+(\w+)|(\w+)\s*\()/);
      return funcMatch ? (funcMatch[1] || funcMatch[2]) : null;
    }).filter(Boolean))];

    // Extract classes
    const classMatches = content.match(/class\s+(\w+)/g) || [];
    const classes = classMatches.map(match => match.match(/class\s+(\w+)/)[1]);

    // Extract interfaces
    const interfaceMatches = content.match(/interface\s+(\w+)/g) || [];
    const interfaces = interfaceMatches.map(match => match.match(/interface\s+(\w+)/)[1]);

    return {
      size,
      lines: lines.length,
      functions,
      classes,
      interfaces,
      nonEmptyLines: lines.filter(line => line.trim().length > 0).length
    };
  }

  analyzeCodeQuality(content) {
    let score = 100;
    let complexity = 'Low';
    let maintainability = 'Good';
    let documentation = 'Fair';

    // Complexity analysis
    const complexityIndicators = (content.match(/if|for|while|switch|case|catch|\?|&&|\|\|/g) || []).length;
    if (complexityIndicators > 20) {
      complexity = 'High';
      score -= 20;
    } else if (complexityIndicators > 10) {
      complexity = 'Medium';
      score -= 10;
    }

    // Maintainability checks
    const lines = content.split('\n').length;
    if (lines > 200) {
      maintainability = 'Needs Improvement';
      score -= 15;
    } else if (lines > 100) {
      maintainability = 'Fair';
      score -= 5;
    }

    // Documentation analysis
    const commentLines = (content.match(/\/\/|\/\*|\*\/|\*/g) || []).length;
    const codeLines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length;
    const commentRatio = commentLines / codeLines;

    if (commentRatio > 0.2) {
      documentation = 'Excellent';
      score += 5;
    } else if (commentRatio > 0.1) {
      documentation = 'Good';
    } else if (commentRatio > 0.05) {
      documentation = 'Fair';
    } else {
      documentation = 'Poor';
      score -= 10;
    }

    // TypeScript specific bonuses
    if (content.includes('interface') || content.includes('type ')) {
      score += 5;
    }
    if (content.includes('export')) {
      score += 3;
    }

    return {
      score: Math.max(Math.min(score, 100), 0),
      complexity,
      maintainability,
      documentation
    };
  }

  basicSecurityCheck(content) {
    const issues = [];
    let riskLevel = 'Low';

    // Check for common security issues
    if (content.match(/eval\s*\(/)) {
      issues.push('Use of eval() detected - potential code injection risk');
      riskLevel = 'High';
    }

    if (content.match(/innerHTML\s*=/)) {
      issues.push('Direct innerHTML assignment - potential XSS risk');
      riskLevel = 'Medium';
    }

    if (content.match(/Math\.random\(\)/)) {
      issues.push('Use of Math.random() - not cryptographically secure');
      if (riskLevel === 'Low') riskLevel = 'Low-Medium';
    }

    if (content.match(/password|secret|key/i) && content.match(/=\s*["'][^"']*["']/)) {
      issues.push('Potential hardcoded credentials detected');
      riskLevel = 'Medium';
    }

    // Check for SQL-like patterns
    if (content.match(/SELECT\s+.*\s+FROM/i)) {
      issues.push('SQL query detected - check for injection vulnerabilities');
      if (riskLevel === 'Low') riskLevel = 'Medium';
    }

    return { issues, riskLevel };
  }

  assessAPIReadiness(content) {
    const stats = this.getFileStats(content);
    
    // API readiness factors
    const uploadReady = stats.size < 10000; // Files under 10KB are good for testing
    const testGeneration = stats.functions.length > 0 || stats.classes.length > 0;
    const securityScanning = true; // All files can be security scanned
    
    // Estimate API response time based on file complexity
    const complexityScore = stats.lines + (stats.functions.length * 10) + (stats.classes.length * 20);
    const estimatedResponseTime = Math.min(Math.max(complexityScore * 2, 100), 5000);

    return {
      uploadReady,
      testGeneration,
      securityScanning,
      estimatedResponseTime
    };
  }

  generateComparison(results) {
    console.log('📊 Comparative Analysis');
    console.log('=======================\n');

    const validResults = results.filter(r => !r.error);
    
    if (validResults.length === 2) {
      const [file1, file2] = validResults;
      
      console.log('🔍 File Comparison:');
      console.log(`\n📄 ${file1.fileName}:`);
      console.log(`   Size: ${file1.stats.size} bytes | Quality: ${file1.codeQuality.score}/100 | Risk: ${file1.security.riskLevel}`);
      console.log(`   Elements: ${file1.stats.functions.length} functions, ${file1.stats.classes.length} classes`);
      
      console.log(`\n📄 ${file2.fileName}:`);
      console.log(`   Size: ${file2.stats.size} bytes | Quality: ${file2.codeQuality.score}/100 | Risk: ${file2.security.riskLevel}`);
      console.log(`   Elements: ${file2.stats.functions.length} functions, ${file2.stats.classes.length} classes`);

      console.log(`\n🎯 Recommendations for API Testing:`);
      
      // Determine which file is better for different types of testing
      const betterForTesting = file1.stats.functions.length > file2.stats.functions.length ? file1 : file2;
      const betterForQuality = file1.codeQuality.score > file2.codeQuality.score ? file1 : file2;
      
      console.log(`   🧪 Best for Test Generation: ${betterForTesting.fileName}`);
      console.log(`   📊 Highest Quality Score: ${betterForQuality.fileName}`);
      console.log(`   🔒 Security Testing: Both files are suitable`);
      
      console.log(`\n🚀 API Testing Strategy:`);
      console.log(`   1. Upload ${file1.fileName} for code quality analysis demo`);
      console.log(`   2. Upload ${file2.fileName} for comprehensive test generation`);
      console.log(`   3. Run batch analysis on both files for comparison`);
      console.log(`   4. Demonstrate security scanning capabilities`);
    }

    console.log(`\n🔗 Next Steps:`);
    console.log(`   • Start backend: cd ../backend && npm start`);
    console.log(`   • Test file uploads via API endpoints`);
    console.log(`   • Generate automated tests for functions`);
    console.log(`   • Run security analysis pipeline`);
  }

  saveResults(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        successfulAnalysis: results.filter(r => !r.error).length,
        errors: results.filter(r => r.error).length
      },
      results: results.map(r => ({
        fileName: r.fileName,
        error: r.error,
        stats: r.stats,
        qualityScore: r.codeQuality?.score,
        securityRisk: r.security?.riskLevel,
        apiReady: r.apiReadiness?.uploadReady
      })),
      recommendation: 'Files are ready for API testing with CodeGuardian backend'
    };

    const reportPath = path.join(__dirname, 'file-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Analysis report saved: ${reportPath}`);
  }
}

// Run the analysis if called directly
if (require.main === module) {
  const analyzer = new SimpleFileAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = SimpleFileAnalyzer;
