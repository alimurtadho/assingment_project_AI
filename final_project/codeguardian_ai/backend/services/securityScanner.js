/**
 * Security Scanner Service
 * Detects various security vulnerabilities in code
 */

class SecurityScanner {
  constructor() {
    this.vulnerabilityPatterns = {
      hardcodedSecrets: {
        patterns: [
          {
            name: 'API Key',
            regex: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([a-zA-Z0-9_-]{20,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded API key detected'
          },
          {
            name: 'Password',
            regex: /(?:password|pwd|pass)\s*[:=]\s*["']([^"']{6,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded password detected'
          },
          {
            name: 'Secret Key',
            regex: /(?:secret[_-]?key|secretkey)\s*[:=]\s*["']([a-zA-Z0-9_-]{16,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded secret key detected'
          },
          {
            name: 'Database URL',
            regex: /(?:database[_-]?url|db[_-]?url)\s*[:=]\s*["']([^"']+)["']/gi,
            severity: 'MEDIUM',
            description: 'Hardcoded database URL detected'
          },
          {
            name: 'JWT Secret',
            regex: /(?:jwt[_-]?secret)\s*[:=]\s*["']([a-zA-Z0-9_-]{16,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded JWT secret detected'
          }
        ]
      },
      sqlInjection: {
        patterns: [
          {
            name: 'SQL Injection - String Concatenation',
            regex: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*\+.*(?:WHERE|VALUES)/gi,
            severity: 'HIGH',
            description: 'Potential SQL injection via string concatenation'
          },
          {
            name: 'SQL Injection - Template Literal',
            regex: /`(?:SELECT|INSERT|UPDATE|DELETE).*\$\{.*\}.*`/gi,
            severity: 'HIGH',
            description: 'Potential SQL injection via template literal'
          },
          {
            name: 'Dynamic Query Construction',
            regex: /(?:query|sql)\s*[:=]\s*["'`].*\$\{.*\}.*["'`]/gi,
            severity: 'MEDIUM',
            description: 'Dynamic SQL query construction detected'
          }
        ]
      },
      xss: {
        patterns: [
          {
            name: 'innerHTML Usage',
            regex: /\.innerHTML\s*=\s*.*(?:\+|concat)/gi,
            severity: 'MEDIUM',
            description: 'Potential XSS via innerHTML manipulation'
          },
          {
            name: 'Document Write',
            regex: /document\.write\s*\(/gi,
            severity: 'MEDIUM',
            description: 'Potential XSS via document.write'
          },
          {
            name: 'Eval Usage',
            regex: /eval\s*\(/gi,
            severity: 'HIGH',
            description: 'Use of eval() can lead to code injection'
          }
        ]
      },
      weakCrypto: {
        patterns: [
          {
            name: 'MD5 Usage',
            regex: /md5\s*\(/gi,
            severity: 'MEDIUM',
            description: 'MD5 is cryptographically weak'
          },
          {
            name: 'SHA1 Usage',
            regex: /sha1\s*\(/gi,
            severity: 'MEDIUM',
            description: 'SHA1 is cryptographically weak'
          },
          {
            name: 'Weak Random',
            regex: /Math\.random\(\)/gi,
            severity: 'LOW',
            description: 'Math.random() is not cryptographically secure'
          }
        ]
      }
    };
  }

  async scanCode(fileContent, filename) {
    console.log(`🔍 Starting security scan for ${filename}`);
    
    const vulnerabilities = [];
    let totalRiskScore = 0;
    
    // Scan for each vulnerability category
    for (const [category, config] of Object.entries(this.vulnerabilityPatterns)) {
      for (const pattern of config.patterns) {
        const matches = this.findMatches(fileContent, pattern, category);
        vulnerabilities.push(...matches);
        
        // Calculate risk score
        matches.forEach(match => {
          switch (match.severity) {
            case 'HIGH': totalRiskScore += 8; break;
            case 'MEDIUM': totalRiskScore += 5; break;
            case 'LOW': totalRiskScore += 2; break;
          }
        });
      }
    }
    
    // Normalize risk score to 1-10 scale
    const riskScore = Math.min(10, Math.ceil(totalRiskScore / Math.max(1, vulnerabilities.length)));
    
    const summary = this.generateSummary(vulnerabilities);
    const recommendations = this.generateRecommendations(vulnerabilities);
    
    console.log(`✅ Scan complete: ${vulnerabilities.length} vulnerabilities found, risk score: ${riskScore}`);
    
    return {
      vulnerabilities,
      riskScore,
      summary,
      recommendations
    };
  }

  findMatches(content, pattern, category) {
    const matches = [];
    const lines = content.split('\n');
    
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      // Find line number
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim();
      
      matches.push({
        type: pattern.name,
        category,
        severity: pattern.severity,
        description: pattern.description,
        line: lineNumber,
        code: lineContent,
        matchedText: match[0],
        recommendation: this.getRecommendation(pattern.name)
      });
    }
    
    return matches;
  }

  getRecommendation(vulnerabilityType) {
    const recommendations = {
      'API Key': 'Move API keys to environment variables and use a secrets management system',
      'Password': 'Store passwords as environment variables or use a secrets manager',
      'Secret Key': 'Use environment variables for secret keys and rotate them regularly',
      'Database URL': 'Use environment variables for database connection strings',
      'JWT Secret': 'Store JWT secrets in environment variables and use strong, random values',
      'SQL Injection - String Concatenation': 'Use parameterized queries or prepared statements',
      'SQL Injection - Template Literal': 'Use parameterized queries instead of template literals',
      'Dynamic Query Construction': 'Use ORM methods or parameterized queries',
      'innerHTML Usage': 'Use textContent or sanitize input before setting innerHTML',
      'Document Write': 'Use modern DOM manipulation methods instead of document.write',
      'Eval Usage': 'Avoid eval() and use safer alternatives like JSON.parse()',
      'MD5 Usage': 'Use SHA-256 or stronger hashing algorithms',
      'SHA1 Usage': 'Use SHA-256 or stronger hashing algorithms',
      'Weak Random': 'Use crypto.randomBytes() for cryptographically secure random values'
    };
    
    return recommendations[vulnerabilityType] || 'Review and fix this security issue';
  }

  generateSummary(vulnerabilities) {
    const severityCounts = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {});
    
    const totalIssues = vulnerabilities.length;
    
    return {
      totalIssues,
      high: severityCounts.HIGH || 0,
      medium: severityCounts.MEDIUM || 0,
      low: severityCounts.LOW || 0,
      categories: [...new Set(vulnerabilities.map(v => v.category))]
    };
  }

  generateRecommendations(vulnerabilities) {
    const recommendations = [];
    
    if (vulnerabilities.some(v => v.category === 'hardcodedSecrets')) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Implement Secrets Management',
        description: 'Move all hardcoded secrets to environment variables or a dedicated secrets management system'
      });
    }
    
    if (vulnerabilities.some(v => v.category === 'sqlInjection')) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Fix SQL Injection Vulnerabilities',
        description: 'Replace dynamic query construction with parameterized queries or ORM methods'
      });
    }
    
    if (vulnerabilities.some(v => v.category === 'xss')) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Prevent XSS Attacks',
        description: 'Implement input validation and output encoding to prevent XSS attacks'
      });
    }
    
    if (vulnerabilities.some(v => v.category === 'weakCrypto')) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Upgrade Cryptographic Methods',
        description: 'Replace weak cryptographic algorithms with modern, secure alternatives'
      });
    }
    
    return recommendations;
  }
}

module.exports = new SecurityScanner();
