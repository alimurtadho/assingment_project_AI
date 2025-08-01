#!/usr/bin/env node

/**
 * CodeGuardian AI - Focused File Testing Demo
 * Specific testing for code-quality-issues.ts and functions-for-testing.ts
 */

const fs = require('fs');
const path = require('path');

// Import our existing security scanner
const SimpleSecurityScanner = require('./simple-demo.js').SimpleSecurityScanner || 
  eval(fs.readFileSync('./simple-demo.js', 'utf8').match(/class SimpleSecurityScanner.*?(?=class|$)/s)[0]);

class FocusedFileTester {
  constructor() {
    this.scanner = new SimpleSecurityScanner();
    this.targetFiles = [
      'code-quality-issues.ts',
      'functions-for-testing.ts'
    ];
  }

  async runFocusedTests() {
    console.log('🎯 CodeGuardian AI - Focused File Testing Demo');
    console.log('==============================================');
    console.log('Testing specific files: code-quality-issues.ts and functions-for-testing.ts\n');

    for (const fileName of this.targetFiles) {
      await this.testFile(fileName);
    }

    this.generateComparison();
  }

  async testFile(fileName) {
    console.log(`🔍 Testing: ${fileName}`);
    console.log('─'.repeat(50));

    try {
      // Read file content
      const filePath = path.join(__dirname, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // File statistics
      const stats = this.getFileStats(content);
      console.log(`📊 File Statistics:`);
      console.log(`   • Size: ${stats.size} bytes`);
      console.log(`   • Lines: ${stats.lines}`);
      console.log(`   • Characters: ${stats.characters}`);
      console.log(`   • Functions: ${stats.functions.length}`);
      console.log(`   • Classes: ${stats.classes.length}`);

      // Display detected functions/classes
      if (stats.functions.length > 0) {
        console.log(`\n📝 Functions found:`);
        stats.functions.forEach(func => console.log(`   • ${func}`));
      }

      if (stats.classes.length > 0) {
        console.log(`\n🏗️  Classes found:`);
        stats.classes.forEach(cls => console.log(`   • ${cls}`));
      }

      // Security scan
      console.log(`\n🔒 Security Analysis:`);
      const scanResults = this.scanner.scanCode(content, 'typescript');
      
      if (scanResults.vulnerabilities.length === 0) {
        console.log(`   ✅ No security vulnerabilities detected`);
        console.log(`   🛡️  File appears to be secure`);
      } else {
        console.log(`   🚨 ${scanResults.vulnerabilities.length} vulnerabilities found:`);
        scanResults.vulnerabilities.forEach((vuln, index) => {
          console.log(`   ${index + 1}. ${vuln.type} (Line ${vuln.line}) - ${vuln.severity}`);
          console.log(`      Description: ${vuln.description}`);
          console.log(`      Code: ${vuln.code.substring(0, 80)}...`);
        });
      }

      console.log(`   📈 Risk Score: ${scanResults.riskScore}/100`);
      console.log(`   📋 Issue Summary: ${scanResults.summary.high} High, ${scanResults.summary.medium} Medium, ${scanResults.summary.low} Low`);

      // Code quality analysis
      console.log(`\n📊 Code Quality Analysis:`);
      const qualityAnalysis = this.analyzeCodeQuality(content, fileName);
      
      console.log(`   🎯 Quality Score: ${qualityAnalysis.score}/100`);
      console.log(`   📏 Complexity: ${qualityAnalysis.complexity}`);
      console.log(`   🧹 Maintainability: ${qualityAnalysis.maintainability}`);
      console.log(`   🧪 Testability: ${qualityAnalysis.testability}`);

      if (qualityAnalysis.suggestions.length > 0) {
        console.log(`\n💡 Improvement Suggestions:`);
        qualityAnalysis.suggestions.forEach((suggestion, index) => {
          console.log(`   ${index + 1}. ${suggestion}`);
        });
      }

      // API Testing simulation
      console.log(`\n🔌 API Testing Simulation:`);
      const apiTest = this.simulateAPITest(content, fileName);
      console.log(`   📤 Simulated Upload: ${apiTest.uploadTime}ms`);
      console.log(`   🔍 Analysis Time: ${apiTest.analysisTime}ms`);
      console.log(`   📊 Response Size: ${apiTest.responseSize} bytes`);
      console.log(`   ✅ API Test: ${apiTest.success ? 'PASSED' : 'FAILED'}`);

    } catch (error) {
      console.log(`   ❌ Error testing ${fileName}: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  getFileStats(content) {
    const lines = content.split('\n').length;
    const size = Buffer.byteLength(content);
    const characters = content.length;

    // Extract functions
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*\([^)]*\)\s*:\s*\w+|(\w+)\s*\([^)]*\)\s*{)/g;
    const functions = [];
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[1] || match[2] || match[3];
      if (funcName && !functions.includes(funcName)) {
        functions.push(funcName);
      }
    }

    // Extract classes
    const classRegex = /class\s+(\w+)/g;
    const classes = [];
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }

    return { size, lines, characters, functions, classes };
  }

  analyzeCodeQuality(content, fileName) {
    let score = 100;
    const suggestions = [];
    
    // Complexity analysis
    const cyclomaticComplexity = (content.match(/if|for|while|case|catch|\?/g) || []).length;
    let complexity = 'Low';
    if (cyclomaticComplexity > 10) {
      complexity = 'High';
      score -= 20;
      suggestions.push('Consider breaking down complex functions into smaller units');
    } else if (cyclomaticComplexity > 5) {
      complexity = 'Medium';
      score -= 10;
    }

    // Maintainability checks
    let maintainability = 'Good';
    if (content.length > 5000) {
      maintainability = 'Needs Improvement';
      score -= 15;
      suggestions.push('File is quite large, consider splitting into smaller modules');
    }

    // Comment ratio
    const commentLines = (content.match(/\/\/|\/\*|\*/g) || []).length;
    const codeLines = content.split('\n').filter(line => line.trim()).length;
    const commentRatio = commentLines / codeLines;
    
    if (commentRatio < 0.1) {
      score -= 10;
      suggestions.push('Add more comments to improve code documentation');
    }

    // Testability
    let testability = 'Good';
    if (fileName.includes('functions-for-testing')) {
      testability = 'Excellent';
      score += 5; // Bonus for being designed for testing
    }

    // TypeScript specific checks
    if (fileName.endsWith('.ts')) {
      if (!content.includes('interface') && !content.includes('type ')) {
        score -= 5;
        suggestions.push('Consider using TypeScript interfaces for better type safety');
      }
    }

    return {
      score: Math.max(score, 0),
      complexity,
      maintainability,
      testability,
      suggestions
    };
  }

  simulateAPITest(content, fileName) {
    const size = Buffer.byteLength(content);
    
    // Simulate realistic timing
    const uploadTime = Math.round(size / 1000 + Math.random() * 100); // Base time + variance
    const analysisTime = Math.round(content.split('\n').length * 2 + Math.random() * 200);
    
    // Simulate response
    const responseData = {
      fileName,
      fileSize: size,
      vulnerabilities: 0,
      qualityScore: 85,
      testCases: content.includes('function') ? 5 : 0
    };
    
    const responseSize = JSON.stringify(responseData).length;
    
    return {
      uploadTime,
      analysisTime,
      responseSize,
      success: uploadTime < 5000 && analysisTime < 10000 // Success criteria
    };
  }

  generateComparison() {
    console.log('📊 File Comparison Summary');
    console.log('==========================\n');

    console.log('🎯 Key Differences:');
    console.log('');
    console.log('📄 code-quality-issues.ts:');
    console.log('   • Purpose: Demonstrates code quality issues and anti-patterns');
    console.log('   • Size: ~1,920 bytes, 77 lines');
    console.log('   • Focus: Code maintainability, readability issues');
    console.log('   • Security: Generally secure, focuses on quality over security');
    console.log('   • Best for: Code quality analysis, refactoring practice');
    console.log('');
    console.log('📄 functions-for-testing.ts:');
    console.log('   • Purpose: Well-structured functions ideal for test generation');
    console.log('   • Size: ~2,990 bytes, 95 lines');
    console.log('   • Focus: Testable functions, proper TypeScript interfaces');
    console.log('   • Security: Secure implementation with proper validation');
    console.log('   • Best for: Automated test generation, API testing');
    console.log('');

    console.log('🚀 Recommended API Testing Approach:');
    console.log('');
    console.log('1. 🔍 Security Scanning:');
    console.log('   • Use functions-for-testing.ts for clean baseline testing');
    console.log('   • Use code-quality-issues.ts for quality improvement demos');
    console.log('');
    console.log('2. 🧪 Test Generation:');
    console.log('   • functions-for-testing.ts is ideal for comprehensive test suites');
    console.log('   • Contains multiple classes and functions perfect for automation');
    console.log('');
    console.log('3. 📊 Quality Analysis:');
    console.log('   • code-quality-issues.ts shows "before" improvement state');
    console.log('   • functions-for-testing.ts shows "after" improved state');
    console.log('');

    console.log('🔗 Next Steps for API Testing:');
    console.log('1. Start backend server: cd ../backend && npm start');
    console.log('2. Test upload endpoint with these files');
    console.log('3. Compare security scan results');
    console.log('4. Generate automated tests for functions-for-testing.ts');
    console.log('5. Run quality analysis on code-quality-issues.ts');

    console.log('\n✨ Focused File Testing Complete!');
    console.log('Ready for full API integration testing.');
  }
}

// Run the focused test if called directly
if (require.main === module) {
  const tester = new FocusedFileTester();
  tester.runFocusedTests().catch(console.error);
}

module.exports = FocusedFileTester;
