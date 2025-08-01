#!/usr/bin/env node

/**
 * CodeGuardian AI - Simplified Demo Implementation
 * Standalone demonstration without external dependencies
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  DEMO_FILES_PATH: __dirname,
  OUTPUT_PATH: path.join(__dirname, 'demo-results')
};

// Demo file samples for testing
const DEMO_FILES = [
  'vulnerable-code.ts',
  'code-quality-issues.ts',
  'functions-for-testing.ts',
  'comprehensive-vulnerabilities.ts'
];

class SimpleSecurityScanner {
  constructor() {
    this.vulnerabilityPatterns = {
      'Hardcoded API Key': [
        /sk-[a-zA-Z0-9]{48}/g,
        /API_KEY\s*=\s*["'][^"']+["']/g,
        /OPENAI_API_KEY\s*=\s*["'][^"']+["']/g,
        /STRIPE_SECRET_KEY\s*=\s*["'][^"']+["']/g,
        /AWS_SECRET_ACCESS_KEY\s*=\s*["'][^"']+["']/g
      ],
      'SQL Injection': [
        /SELECT\s+.*\s+WHERE\s+.*\$\{.*\}/gi,
        /query\s*=\s*[`"'].*\$\{.*\}.*[`"']/gi,
        /SELECT\s+.*\s+WHERE\s+.*\+\s*.*\+/gi
      ],
      'Cross-Site Scripting (XSS)': [
        /innerHTML\s*=\s*.*[^;]/gi,
        /document\.write\s*\(.*\)/gi,
        /\.html\s*\(.*\$\{.*\}.*\)/gi
      ],
      'Weak Cryptographic Algorithm': [
        /createHash\s*\(\s*['"]md5['"]\)/gi,
        /createHash\s*\(\s*['"]sha1['"]\)/gi
      ],
      'Hardcoded Password': [
        /PASSWORD\s*=\s*["'][^"']+["']/gi,
        /password\s*:\s*["'][^"']+["']/gi,
        /DB_PASSWORD\s*=\s*["'][^"']+["']/gi
      ],
      'Command Injection': [
        /exec\s*\(\s*[`"'].*\$\{.*\}.*[`"']/gi,
        /system\s*\(\s*.*\+.*\)/gi
      ],
      'Insecure Random': [
        /Math\.random\(\)/gi
      ]
    };
  }

  scanCode(code, language = 'javascript') {
    const vulnerabilities = [];
    let riskScore = 0;

    for (const [type, patterns] of Object.entries(this.vulnerabilityPatterns)) {
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          const line = this.getLineNumber(code, match.index);
          const severity = this.getSeverity(type);
          
          vulnerabilities.push({
            type,
            severity,
            line,
            description: this.getDescription(type),
            code: match[0].substring(0, 100), // Limit code snippet length
            recommendation: this.getRecommendation(type)
          });

          riskScore += this.getRiskScore(severity);
        }
      }
    }

    const summary = {
      totalIssues: vulnerabilities.length,
      high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      low: vulnerabilities.filter(v => v.severity === 'LOW').length
    };

    return {
      vulnerabilities,
      riskScore: Math.min(riskScore, 100),
      summary,
      metadata: {
        language,
        scanTime: new Date().toISOString(),
        linesOfCode: code.split('\n').length
      }
    };
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getSeverity(type) {
    const highRisk = ['Hardcoded API Key', 'SQL Injection', 'Command Injection'];
    const mediumRisk = ['Cross-Site Scripting (XSS)', 'Weak Cryptographic Algorithm', 'Hardcoded Password'];
    
    if (highRisk.includes(type)) return 'HIGH';
    if (mediumRisk.includes(type)) return 'MEDIUM';
    return 'LOW';
  }

  getRiskScore(severity) {
    switch (severity) {
      case 'HIGH': return 25;
      case 'MEDIUM': return 15;
      case 'LOW': return 5;
      default: return 0;
    }
  }

  getDescription(type) {
    const descriptions = {
      'Hardcoded API Key': 'Hardcoded API key detected. This exposes sensitive credentials in source code.',
      'SQL Injection': 'Potential SQL injection vulnerability through dynamic query construction.',
      'Cross-Site Scripting (XSS)': 'Potential XSS vulnerability through unsafe DOM manipulation.',
      'Weak Cryptographic Algorithm': 'Weak cryptographic algorithm detected (MD5, SHA1).',
      'Hardcoded Password': 'Hardcoded password detected in source code.',
      'Command Injection': 'Potential command injection through dynamic command execution.',
      'Insecure Random': 'Insecure random number generation using Math.random().'
    };
    return descriptions[type] || 'Security vulnerability detected.';
  }

  getRecommendation(type) {
    const recommendations = {
      'Hardcoded API Key': 'Move API keys to environment variables or secure configuration.',
      'SQL Injection': 'Use parameterized queries or prepared statements.',
      'Cross-Site Scripting (XSS)': 'Sanitize user input and use safe DOM manipulation methods.',
      'Weak Cryptographic Algorithm': 'Use stronger algorithms like SHA-256 or bcrypt for passwords.',
      'Hardcoded Password': 'Store passwords in environment variables or secure vaults.',
      'Command Injection': 'Validate input and use safe command execution methods.',
      'Insecure Random': 'Use crypto.randomBytes() for cryptographically secure random generation.'
    };
    return recommendations[type] || 'Review and fix the security issue.';
  }
}

class CodeGuardianDemo {
  constructor() {
    this.scanner = new SimpleSecurityScanner();
    this.results = {};
  }

  async runComplete() {
    console.log('🚀 Starting CodeGuardian AI Demo Implementation...\n');
    
    try {
      // Step 1: Process Demo Files
      await this.processDemoFiles();
      
      // Step 2: Generate Demo Report
      await this.generateDemoReport();
      
      console.log('✅ Demo Implementation Completed Successfully!');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      process.exit(1);
    }
  }

  async processDemoFiles() {
    console.log('📁 Processing Demo Files...');
    
    for (const fileName of DEMO_FILES) {
      const filePath = path.join(CONFIG.DEMO_FILES_PATH, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        continue;
      }
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const language = this.detectLanguage(fileName);
        
        console.log(`🔍 Scanning ${fileName}...`);
        
        const scanResult = this.scanner.scanCode(fileContent, language);
        this.results[fileName] = scanResult;
        
        const { vulnerabilities, riskScore } = scanResult;
        console.log(`✅ ${fileName} - Found ${vulnerabilities.length} issues (Risk: ${riskScore}/100)`);
        
        // Show top vulnerabilities
        const highSeverityIssues = vulnerabilities.filter(v => v.severity === 'HIGH');
        if (highSeverityIssues.length > 0) {
          console.log(`   🚨 High Risk Issues: ${highSeverityIssues.length}`);
          highSeverityIssues.slice(0, 3).forEach(issue => {
            console.log(`     - ${issue.type} (Line ${issue.line})`);
          });
        }
        
      } catch (error) {
        console.error(`❌ Failed to process ${fileName}:`, error.message);
      }
    }
  }

  detectLanguage(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const languageMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.php': 'php',
      '.java': 'java',
      '.cpp': 'cpp',
      '.cs': 'csharp'
    };
    
    return languageMap[extension] || 'javascript';
  }

  async generateDemoReport() {
    console.log('\n📊 Generating Demo Report...');
    
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.OUTPUT_PATH)) {
      fs.mkdirSync(CONFIG.OUTPUT_PATH, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: Object.keys(this.results).length,
        totalVulnerabilities: 0,
        highRiskFiles: 0,
        averageRiskScore: 0
      },
      results: this.results,
      recommendations: []
    };
    
    // Calculate summary statistics
    let totalRiskScore = 0;
    for (const [fileName, result] of Object.entries(this.results)) {
      report.summary.totalVulnerabilities += result.vulnerabilities.length;
      totalRiskScore += result.riskScore;
      
      if (result.riskScore > 70) {
        report.summary.highRiskFiles++;
      }
    }
    
    if (report.summary.totalFiles > 0) {
      report.summary.averageRiskScore = Math.round(totalRiskScore / report.summary.totalFiles);
    }
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.summary);
    
    // Save JSON report
    const reportPath = path.join(CONFIG.OUTPUT_PATH, 'demo-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(CONFIG.OUTPUT_PATH, 'demo-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    
    // Generate markdown summary
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join(CONFIG.OUTPUT_PATH, 'demo-summary.md');
    fs.writeFileSync(mdPath, mdReport);
    
    console.log(`✅ Demo report saved to: ${reportPath}`);
    console.log(`✅ HTML report saved to: ${htmlPath}`);
    console.log(`✅ Markdown summary saved to: ${mdPath}`);
  }

  generateRecommendations(summary) {
    const recommendations = [];
    
    if (summary.totalVulnerabilities > 10) {
      recommendations.push('🚨 High vulnerability count detected. Immediate security review recommended.');
    }
    
    if (summary.highRiskFiles > 0) {
      recommendations.push('⚠️ Critical risk files identified. Urgent security fixes required.');
    }
    
    if (summary.averageRiskScore > 50) {
      recommendations.push('📈 Average risk score is high. Implement comprehensive security measures.');
    }
    
    recommendations.push('🔒 Enable automated security scanning in CI/CD pipeline.');
    recommendations.push('📚 Implement security training for development team.');
    recommendations.push('🔍 Schedule regular security audits and penetration testing.');
    
    return recommendations;
  }

  generateHTMLReport(report) {
    const vulnerabilityRows = Object.entries(report.results)
      .map(([fileName, result]) => {
        return result.vulnerabilities.map(vuln => `
          <tr class="${vuln.severity.toLowerCase()}-risk">
            <td>${fileName}</td>
            <td>${vuln.type}</td>
            <td><span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span></td>
            <td>${vuln.line}</td>
            <td>${vuln.description}</td>
          </tr>
        `).join('');
      }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGuardian AI - Demo Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .vulnerabilities-table { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8f9fa; padding: 15px; text-align: left; font-weight: 600; color: #333; }
        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .severity-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .high { background: #fee; color: #d63031; }
        .medium { background: #fff3cd; color: #e17055; }
        .low { background: #d1ecf1; color: #00b894; }
        .high-risk { background-color: #fee; }
        .medium-risk { background-color: #fff3cd; }
        .low-risk { background-color: #d1ecf1; }
        .recommendations { background: white; padding: 25px; border-radius: 10px; margin-top: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .recommendations ul { list-style: none; padding: 0; }
        .recommendations li { padding: 10px 0; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ CodeGuardian AI - Demo Security Report</h1>
            <p>Generated: ${report.timestamp}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" style="color: #667eea;">${report.summary.totalFiles}</div>
                <div class="stat-label">Files Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #e17055;">${report.summary.totalVulnerabilities}</div>
                <div class="stat-label">Vulnerabilities Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #d63031;">${report.summary.highRiskFiles}</div>
                <div class="stat-label">High Risk Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #00b894;">${report.summary.averageRiskScore}</div>
                <div class="stat-label">Average Risk Score</div>
            </div>
        </div>
        
        <div class="vulnerabilities-table">
            <h2 style="padding: 20px; margin: 0; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">🔍 Detailed Vulnerabilities</h2>
            <table>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Vulnerability Type</th>
                        <th>Severity</th>
                        <th>Line</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${vulnerabilityRows || '<tr><td colspan="5" style="text-align: center; color: #00b894; padding: 40px;">✅ No vulnerabilities detected!</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <div class="recommendations">
            <h2>💡 Security Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  generateMarkdownReport(report) {
    return `# 🛡️ CodeGuardian AI - Demo Security Report

**Generated:** ${report.timestamp}

## 📊 Summary

| Metric | Value |
|--------|-------|
| Files Analyzed | ${report.summary.totalFiles} |
| Vulnerabilities Found | ${report.summary.totalVulnerabilities} |
| High Risk Files | ${report.summary.highRiskFiles} |
| Average Risk Score | ${report.summary.averageRiskScore}/100 |

## 🔍 File Analysis Results

${Object.entries(report.results).map(([fileName, result]) => `
### 📄 ${fileName}
- **Risk Score:** ${result.riskScore}/100
- **Vulnerabilities:** ${result.vulnerabilities.length}
- **Language:** ${result.metadata.language}
- **Lines of Code:** ${result.metadata.linesOfCode}

${result.vulnerabilities.length > 0 ? 
  result.vulnerabilities.map(vuln => 
    `- **${vuln.severity}**: ${vuln.type} (Line ${vuln.line})\n  ${vuln.description}`
  ).join('\n') 
  : '✅ No vulnerabilities detected'}
`).join('\n')}

## 💡 Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by CodeGuardian AI Demo System*`;
  }

  printSummary() {
    console.log('\n📋 Demo Implementation Summary:');
    console.log('================================');
    
    const totalFiles = Object.keys(this.results).length;
    let totalVulnerabilities = 0;
    let highRiskFiles = 0;
    
    for (const [fileName, result] of Object.entries(this.results)) {
      totalVulnerabilities += result.vulnerabilities.length;
      if (result.riskScore > 70) highRiskFiles++;
    }
    
    console.log(`✅ Files Processed: ${totalFiles}`);
    console.log(`⚠️  Vulnerabilities Found: ${totalVulnerabilities}`);
    console.log(`🚨 High Risk Files: ${highRiskFiles}`);
    console.log(`📊 Demo Report: ${CONFIG.OUTPUT_PATH}/demo-report.html`);
    console.log('\n🎉 CodeGuardian AI Demo Implementation Complete!');
    console.log(`\n🌐 Open the HTML report in your browser to view detailed results:`);
    console.log(`   file://${path.resolve(CONFIG.OUTPUT_PATH, 'demo-report.html')}`);
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new CodeGuardianDemo();
  demo.runComplete().catch(console.error);
}

module.exports = CodeGuardianDemo;
