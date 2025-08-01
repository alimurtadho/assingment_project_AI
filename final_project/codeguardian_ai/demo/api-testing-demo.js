#!/usr/bin/env node

/**
 * CodeGuardian AI - API Testing Demo
 * Demonstrates how to test the CodeGuardian API with demo files
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const API_CONFIG = {
  BACKEND_URL: 'http://localhost:8000',
  DEMO_SERVER_URL: 'http://localhost:3001',
  TEST_FILES: [
    'code-quality-issues.ts',
    'functions-for-testing.ts',
    'vulnerable-code.ts',
    'comprehensive-vulnerabilities.ts'
  ]
};

class CodeGuardianAPITester {
  constructor() {
    this.results = [];
    this.testSummary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      startTime: new Date()
    };
  }

  async runAllTests() {
    console.log('🧪 CodeGuardian AI - API Testing Demo');
    console.log('=====================================\n');

    // Test 1: Demo Server Health Check
    await this.testDemoServerHealth();

    // Test 2: Backend Server Health Check
    await this.testBackendServerHealth();

    // Test 3: File Analysis with Demo Server
    await this.testDemoServerAnalysis();

    // Test 4: Backend API Security Scan
    await this.testBackendSecurityScan();

    // Test 5: File Upload Simulation
    await this.testFileUploadSimulation();

    // Test 6: Batch Analysis
    await this.testBatchAnalysis();

    // Generate final report
    this.generateTestReport();
  }

  async testDemoServerHealth() {
    console.log('🔍 Test 1: Demo Server Health Check');
    console.log('-----------------------------------');

    try {
      const response = await this.makeRequest(API_CONFIG.DEMO_SERVER_URL + '/api/health');
      
      if (response.status === 'ok') {
        this.logSuccess('Demo server is healthy');
        console.log(`   ✅ Server: ${response.server}`);
        console.log(`   ✅ Version: ${response.version}`);
        console.log(`   ✅ Uptime: ${Math.floor(response.uptime)}s`);
        this.recordTest('Demo Server Health', true);
      } else {
        this.logError('Demo server health check failed');
        this.recordTest('Demo Server Health', false);
      }
    } catch (error) {
      this.logError(`Demo server not accessible: ${error.message}`);
      this.recordTest('Demo Server Health', false);
    }
    console.log('');
  }

  async testBackendServerHealth() {
    console.log('🔍 Test 2: Backend Server Health Check');
    console.log('--------------------------------------');

    try {
      const response = await this.makeRequest(API_CONFIG.BACKEND_URL + '/health');
      
      if (response.status === 'ok' || response.message === 'Server is running') {
        this.logSuccess('Backend server is healthy');
        console.log(`   ✅ Backend API accessible`);
        this.recordTest('Backend Server Health', true);
      } else {
        this.logWarning('Backend server response unexpected');
        this.recordTest('Backend Server Health', false);
      }
    } catch (error) {
      this.logWarning(`Backend server not running: ${error.message}`);
      console.log('   ℹ️  Note: Backend server can be started with: cd ../backend && npm start');
      this.recordTest('Backend Server Health', false);
    }
    console.log('');
  }

  async testDemoServerAnalysis() {
    console.log('🔍 Test 3: Demo Server Analysis Results');
    console.log('---------------------------------------');

    try {
      const response = await this.makeRequest(API_CONFIG.DEMO_SERVER_URL + '/api/results');
      
      if (response.totalVulnerabilities !== undefined) {
        this.logSuccess('Demo analysis results retrieved');
        console.log(`   ✅ Total vulnerabilities: ${response.totalVulnerabilities}`);
        console.log(`   ✅ High risk files: ${response.highRiskFiles}`);
        console.log(`   ✅ Files processed: ${response.results.length}`);
        
        // Display detailed results for our target files
        const targetFiles = ['code-quality-issues.ts', 'functions-for-testing.ts'];
        targetFiles.forEach(fileName => {
          const fileResult = response.results.find(r => r.fileName === fileName);
          if (fileResult) {
            console.log(`   📄 ${fileName}:`);
            console.log(`      - Issues found: ${fileResult.issueCount}`);
            console.log(`      - Risk Score: ${fileResult.riskScore}/100`);
          }
        });
        
        this.recordTest('Demo Server Analysis', true);
      } else {
        this.logError('Invalid demo analysis response');
        this.recordTest('Demo Server Analysis', false);
      }
    } catch (error) {
      this.logError(`Demo analysis failed: ${error.message}`);
      this.recordTest('Demo Server Analysis', false);
    }
    console.log('');
  }

  async testBackendSecurityScan() {
    console.log('🔍 Test 4: Backend API Security Scan');
    console.log('------------------------------------');

    // Test with code-quality-issues.ts content
    try {
      const codeContent = await this.readDemoFile('code-quality-issues.ts');
      
      const postData = JSON.stringify({
        code: codeContent,
        language: 'typescript',
        fileName: 'code-quality-issues.ts'
      });

      const response = await this.makePostRequest(
        API_CONFIG.BACKEND_URL + '/api/security/scan',
        postData
      );

      if (response.vulnerabilities !== undefined) {
        this.logSuccess('Backend security scan completed');
        console.log(`   ✅ Vulnerabilities found: ${response.vulnerabilities.length}`);
        console.log(`   ✅ Risk Score: ${response.riskScore || 0}/100`);
        
        if (response.vulnerabilities.length > 0) {
          console.log('   🚨 Top vulnerabilities:');
          response.vulnerabilities.slice(0, 3).forEach((vuln, index) => {
            console.log(`      ${index + 1}. ${vuln.type} (Line ${vuln.line})`);
          });
        }
        
        this.recordTest('Backend Security Scan', true);
      } else {
        this.logWarning('Backend security scan returned unexpected format');
        this.recordTest('Backend Security Scan', false);
      }
    } catch (error) {
      this.logWarning(`Backend security scan failed: ${error.message}`);
      console.log('   ℹ️  Note: Ensure backend server is running for API tests');
      this.recordTest('Backend Security Scan', false);
    }
    console.log('');
  }

  async testFileUploadSimulation() {
    console.log('🔍 Test 5: File Upload Simulation');
    console.log('---------------------------------');

    // Simulate file upload for functions-for-testing.ts
    try {
      const functionsContent = await this.readDemoFile('functions-for-testing.ts');
      
      // Simulate the file upload process
      const uploadData = {
        fileName: 'functions-for-testing.ts',
        fileContent: functionsContent,
        fileSize: Buffer.byteLength(functionsContent),
        uploadTime: new Date().toISOString()
      };

      this.logSuccess('File upload simulation completed');
      console.log(`   ✅ File: ${uploadData.fileName}`);
      console.log(`   ✅ Size: ${uploadData.fileSize} bytes`);
      console.log(`   ✅ Lines: ${functionsContent.split('\n').length}`);
      
      // Check if file contains testable functions
      const functionsFound = this.extractFunctions(functionsContent);
      console.log(`   ✅ Functions detected: ${functionsFound.length}`);
      functionsFound.forEach((func, index) => {
        if (index < 3) console.log(`      - ${func}`);
      });
      
      this.recordTest('File Upload Simulation', true);
    } catch (error) {
      this.logError(`File upload simulation failed: ${error.message}`);
      this.recordTest('File Upload Simulation', false);
    }
    console.log('');
  }

  async testBatchAnalysis() {
    console.log('🔍 Test 6: Batch Analysis of Demo Files');
    console.log('---------------------------------------');

    let processedFiles = 0;
    let totalIssues = 0;

    for (const fileName of API_CONFIG.TEST_FILES) {
      try {
        const fileContent = await this.readDemoFile(fileName);
        
        // Simulate analysis
        const analysis = this.performQuickAnalysis(fileContent, fileName);
        
        console.log(`   📄 ${fileName}:`);
        console.log(`      - Size: ${analysis.size} bytes`);
        console.log(`      - Lines: ${analysis.lines}`);
        console.log(`      - Estimated issues: ${analysis.estimatedIssues}`);
        
        processedFiles++;
        totalIssues += analysis.estimatedIssues;
        
      } catch (error) {
        console.log(`   ❌ ${fileName}: File not found`);
      }
    }

    if (processedFiles > 0) {
      this.logSuccess(`Batch analysis completed for ${processedFiles} files`);
      console.log(`   ✅ Total estimated issues: ${totalIssues}`);
      console.log(`   ✅ Average issues per file: ${Math.round(totalIssues / processedFiles)}`);
      this.recordTest('Batch Analysis', true);
    } else {
      this.logError('No files could be processed in batch analysis');
      this.recordTest('Batch Analysis', false);
    }
    console.log('');
  }

  async readDemoFile(fileName) {
    const filePath = path.join(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf8');
  }

  extractFunctions(code) {
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*:\s*\([^)]*\)\s*=>|class\s+(\w+)|(\w+)\s*\([^)]*\)\s*{)/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1] || match[2] || match[3] || match[4];
      if (functionName && !functions.includes(functionName)) {
        functions.push(functionName);
      }
    }

    return functions;
  }

  performQuickAnalysis(content, fileName) {
    const size = Buffer.byteLength(content);
    const lines = content.split('\n').length;
    
    // Simple heuristic for estimating issues
    let estimatedIssues = 0;
    
    // Check for common patterns that might indicate issues
    if (content.includes('Math.random()')) estimatedIssues++;
    if (content.includes('eval(')) estimatedIssues++;
    if (content.includes('innerHTML')) estimatedIssues++;
    if (content.includes('TODO') || content.includes('FIXME')) estimatedIssues++;
    if (fileName.includes('vulnerable')) estimatedIssues += 5;
    if (fileName.includes('quality-issues')) estimatedIssues += 2;
    
    return { size, lines, estimatedIssues };
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            resolve({ statusCode: res.statusCode, data });
          }
        });
      }).on('error', reject);
    });
  }

  makePostRequest(url, postData) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            resolve({ statusCode: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  recordTest(testName, passed) {
    this.testSummary.totalTests++;
    if (passed) {
      this.testSummary.passedTests++;
    } else {
      this.testSummary.failedTests++;
    }
    
    this.results.push({
      testName,
      passed,
      timestamp: new Date().toISOString()
    });
  }

  logSuccess(message) {
    console.log(`   ✅ ${message}`);
  }

  logError(message) {
    console.log(`   ❌ ${message}`);
  }

  logWarning(message) {
    console.log(`   ⚠️  ${message}`);
  }

  generateTestReport() {
    console.log('📊 API Testing Demo - Final Report');
    console.log('==================================');
    
    const endTime = new Date();
    const duration = Math.round((endTime - this.testSummary.startTime) / 1000);
    
    console.log(`\n📈 Test Summary:`);
    console.log(`   Total Tests: ${this.testSummary.totalTests}`);
    console.log(`   Passed: ${this.testSummary.passedTests}`);
    console.log(`   Failed: ${this.testSummary.failedTests}`);
    console.log(`   Success Rate: ${Math.round((this.testSummary.passedTests / this.testSummary.totalTests) * 100)}%`);
    console.log(`   Duration: ${duration}s`);
    
    console.log(`\n📋 Test Results:`);
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${result.testName}`);
    });
    
    console.log(`\n🔗 API Endpoints Tested:`);
    console.log(`   Demo Server: ${API_CONFIG.DEMO_SERVER_URL}`);
    console.log(`   Backend API: ${API_CONFIG.BACKEND_URL}`);
    
    console.log(`\n📄 Files Analyzed:`);
    API_CONFIG.TEST_FILES.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log(`\n🚀 Next Steps:`);
    console.log(`   1. Start backend server: cd ../backend && npm start`);
    console.log(`   2. Start frontend: cd ../frontend && npm start`);
    console.log(`   3. Open demo dashboard: http://localhost:3001`);
    console.log(`   4. Test file upload: http://localhost:3000`);
    
    // Save report to file
    this.saveReportToFile();
    
    console.log(`\n✨ API Testing Demo Complete!`);
  }

  saveReportToFile() {
    const reportData = {
      summary: this.testSummary,
      results: this.results,
      config: API_CONFIG,
      generatedAt: new Date().toISOString()
    };
    
    const reportPath = path.join(__dirname, 'api-testing-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Report saved: ${reportPath}`);
  }
}

// Run the demo if called directly
if (require.main === module) {
  const tester = new CodeGuardianAPITester();
  tester.runAllTests().catch(console.error);
}

module.exports = CodeGuardianAPITester;
