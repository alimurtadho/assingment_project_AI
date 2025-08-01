/**
 * Enhanced Security Scanner Service
 * Detects various security vulnerabilities in code with improved architecture
 */

const ResponseFormatter = require('../utils/responseFormatter');
const ValidationUtils = require('../utils/validationUtils');
const Logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class SecurityScanner {
  constructor() {
    this.logger = Logger;
    this.validationUtils = ValidationUtils;
    this.responseFormatter = ResponseFormatter;
    
    // Enhanced vulnerability patterns with better categorization
    this.vulnerabilityPatterns = this.initializePatterns();
    this.severityWeights = { HIGH: 10, MEDIUM: 5, LOW: 1 };
  }

  initializePatterns() {
    return {
      hardcodedSecrets: {
        category: 'Secrets Management',
        patterns: [
          {
            name: 'API Key',
            regex: /(?:api[_-]?key|apikey|API_KEY)\s*[:=]\s*["']([a-zA-Z0-9_-]{10,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded API key detected - Move to environment variables',
            cwe: 'CWE-798'
          },
          {
            name: 'Password',
            regex: /(?:password|pwd|pass)\s*[:=]\s*["']([^"']{6,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded password detected - Use secure credential storage',
            cwe: 'CWE-798'
          },
          {
            name: 'Secret Key',
            regex: /(?:secret[_-]?key|secretkey)\s*[:=]\s*["']([a-zA-Z0-9_-]{16,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded secret key detected - Implement secrets management',
            cwe: 'CWE-798'
          },
          {
            name: 'Database URL',
            regex: /(?:database[_-]?url|db[_-]?url)\s*[:=]\s*["']([^"']+)["']/gi,
            severity: 'MEDIUM',
            description: 'Hardcoded database URL detected - Use environment configuration',
            cwe: 'CWE-798'
          },
          {
            name: 'JWT Secret',
            regex: /(?:jwt[_-]?secret)\s*[:=]\s*["']([a-zA-Z0-9_-]{16,})["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded JWT secret detected - Use secure key management',
            cwe: 'CWE-798'
          },
          {
            name: 'Private Key',
            regex: /-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----/gi,
            severity: 'HIGH',
            description: 'Private key embedded in code - Move to secure storage',
            cwe: 'CWE-798'
          }
        ]
      },
      
      sqlInjection: {
        category: 'Injection Attacks',
        patterns: [
          {
            name: 'SQL Injection - String Concatenation',
            regex: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*\+.*(?:WHERE|VALUES)/gi,
            severity: 'HIGH',
            description: 'Potential SQL injection via string concatenation - Use parameterized queries',
            cwe: 'CWE-89'
          },
          {
            name: 'SQL Injection - Template Literals',
            regex: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*\$\{.*\}/gi,
            severity: 'HIGH',
            description: 'Potential SQL injection via template literals - Use parameterized queries',
            cwe: 'CWE-89'
          },
          {
            name: 'Dynamic Query Construction',
            regex: /query\s*\+=?\s*["'`][^"'`]*\$\{/gi,
            severity: 'MEDIUM',
            description: 'Dynamic query construction detected - Consider using ORM or query builders',
            cwe: 'CWE-89'
          }
        ]
      },
      
      xss: {
        category: 'Cross-Site Scripting',
        patterns: [
          {
            name: 'innerHTML Assignment',
            regex: /\.innerHTML\s*=\s*(?!['"]).+/gi,
            severity: 'MEDIUM',
            description: 'Direct innerHTML assignment - Use textContent or sanitize input',
            cwe: 'CWE-79'
          },
          {
            name: 'document.write Usage',
            regex: /document\.write\s*\(/gi,
            severity: 'MEDIUM',
            description: 'document.write usage detected - Consider safer alternatives',
            cwe: 'CWE-79'
          },
          {
            name: 'eval() Usage',
            regex: /\beval\s*\(/gi,
            severity: 'HIGH',
            description: 'eval() usage detected - Avoid dynamic code execution',
            cwe: 'CWE-95'
          },
          {
            name: 'Unsanitized User Input',
            regex: /(?:req\.body|req\.query|req\.params)\.[a-zA-Z_][a-zA-Z0-9_]*(?!\s*=\s*sanitize)/gi,
            severity: 'MEDIUM',
            description: 'Potentially unsanitized user input - Implement input validation',
            cwe: 'CWE-20'
          }
        ]
      },
      
      weakCrypto: {
        category: 'Cryptographic Issues',
        patterns: [
          {
            name: 'MD5 Usage',
            regex: /\bmd5\b/gi,
            severity: 'HIGH',
            description: 'MD5 cryptographic hash detected - Use SHA-256 or stronger',
            cwe: 'CWE-327'
          },
          {
            name: 'SHA1 Usage',
            regex: /\bsha1\b/gi,
            severity: 'MEDIUM',
            description: 'SHA1 cryptographic hash detected - Consider SHA-256 or stronger',
            cwe: 'CWE-327'
          },
          {
            name: 'Weak Random Generation',
            regex: /Math\.random\(\)/gi,
            severity: 'MEDIUM',
            description: 'Math.random() used - Use crypto.randomBytes() for security-sensitive operations',
            cwe: 'CWE-338'
          },
          {
            name: 'DES/3DES Usage',
            regex: /\b(?:des|3des|tripledes)\b/gi,
            severity: 'HIGH',
            description: 'Weak encryption algorithm detected - Use AES-256 or stronger',
            cwe: 'CWE-327'
          }
        ]
      },
      
      insecureStorage: {
        category: 'Insecure Storage',
        patterns: [
          {
            name: 'localStorage Sensitive Data',
            regex: /localStorage\.setItem\s*\(\s*["'][^"']*(?:token|password|secret|key)["']/gi,
            severity: 'MEDIUM',
            description: 'Sensitive data stored in localStorage - Consider secure storage alternatives',
            cwe: 'CWE-922'
          },
          {
            name: 'sessionStorage Sensitive Data',
            regex: /sessionStorage\.setItem\s*\(\s*["'][^"']*(?:token|password|secret|key)["']/gi,
            severity: 'MEDIUM',
            description: 'Sensitive data stored in sessionStorage - Consider secure storage alternatives',
            cwe: 'CWE-922'
          },
          {
            name: 'Cookie without Secure Flag',
            regex: /document\.cookie\s*=\s*[^;]*(?!.*secure)/gi,
            severity: 'MEDIUM',
            description: 'Cookie set without secure flag - Add secure flag for HTTPS',
            cwe: 'CWE-614'
          }
        ]
      },
      
      authenticationIssues: {
        category: 'Authentication & Authorization',
        patterns: [
          {
            name: 'Missing Authentication Check',
            regex: /app\.(get|post|put|delete)\s*\(\s*["'][^"']*["']\s*,\s*(?!.*auth)/gi,
            severity: 'MEDIUM',
            description: 'Route without authentication middleware - Add authentication checks',
            cwe: 'CWE-306'
          },
          {
            name: 'Hardcoded JWT',
            regex: /jwt\.sign\s*\([^,]*,\s*["'][^"']+["']/gi,
            severity: 'HIGH',
            description: 'Hardcoded JWT secret - Use environment variables',
            cwe: 'CWE-798'
          },
          {
            name: 'Weak JWT Algorithm',
            regex: /algorithm\s*:\s*["'](?:HS256|none)["']/gi,
            severity: 'MEDIUM',
            description: 'Weak JWT algorithm - Consider RS256 or ES256',
            cwe: 'CWE-327'
          }
        ]
      }
    };
  }

  /**
   * Enhanced scan method with better error handling and logging
   */
  async scan(code, options = {}) {
    try {
      this.logger.info('Starting security scan', { 
        codeLength: code.length,
        options 
      });

      // Validate input
      if (!this.validationUtils.validateCodeInput(code)) {
        throw new Error('Invalid code input provided');
      }

      const vulnerabilities = [];
      const scanMetrics = {
        startTime: Date.now(),
        linesScanned: code.split('\n').length,
        patternsChecked: 0
      };

      // Scan for each vulnerability category
      for (const [category, categoryData] of Object.entries(this.vulnerabilityPatterns)) {
        const categoryVulns = await this.scanCategory(code, category, categoryData);
        vulnerabilities.push(...categoryVulns);
        scanMetrics.patternsChecked += categoryData.patterns.length;
      }

      scanMetrics.endTime = Date.now();
      scanMetrics.duration = scanMetrics.endTime - scanMetrics.startTime;

      // Generate enhanced results
      const summary = this.generateEnhancedSummary(vulnerabilities);
      const recommendations = this.generateDetailedRecommendations(vulnerabilities);
      const riskScore = this.calculateRiskScore(vulnerabilities);

      const result = {
        vulnerabilities,
        summary,
        recommendations,
        riskScore,
        scanMetrics,
        timestamp: new Date().toISOString()
      };

      this.logger.info('Security scan completed', {
        totalVulnerabilities: vulnerabilities.length,
        riskScore,
        duration: scanMetrics.duration
      });

      return this.responseFormatter.success(result, 'Security scan completed successfully');

    } catch (error) {
      this.logger.error('Security scan failed', error);
      throw ErrorHandler.createError('SCAN_FAILED', `Security scan failed: ${error.message}`, 500);
    }
  }

  /**
   * Simplified scanCode method for backward compatibility
   */
  async scanCode(code, filename = 'unknown') {
    try {
      const result = await this.scan(code, { filename });
      return {
        vulnerabilities: result.data.vulnerabilities,
        riskScore: result.data.riskScore,
        summary: result.data.summary
      };
    } catch (error) {
      this.logger.error('scanCode method failed', error);
      return {
        vulnerabilities: [],
        riskScore: 0,
        summary: { totalIssues: 0, high: 0, medium: 0, low: 0 }
      };
    }
  }

  /**
   * Generate summary from vulnerabilities array
   */
  generateSummary(vulnerabilities) {
    const severityCounts = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalIssues: vulnerabilities.length,
      high: severityCounts.HIGH || 0,
      medium: severityCounts.MEDIUM || 0,
      low: severityCounts.LOW || 0
    };
  }

  /**
   * Scan specific category with enhanced detection
   */
  async scanCategory(code, category, categoryData) {
    const vulnerabilities = [];

    for (const pattern of categoryData.patterns) {
      let match;
      while ((match = pattern.regex.exec(code)) !== null) {
        const lineNumber = this.getLineNumber(code, match.index);
        const contextLines = this.getContextLines(code, lineNumber);
        
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          category,
          type: pattern.name,
          severity: pattern.severity,
          description: pattern.description,
          cwe: pattern.cwe,
          line: lineNumber,
          column: match.index - code.lastIndexOf('\n', match.index) - 1,
          matchedText: match[0],
          context: contextLines,
          recommendation: this.getSpecificRecommendation(pattern.name),
          confidence: this.calculateConfidence(pattern, match)
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Generate unique vulnerability ID
   */
  generateVulnerabilityId() {
    return `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get line number from character index
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Get context lines around vulnerability
   */
  getContextLines(code, lineNumber, contextRange = 2) {
    const lines = code.split('\n');
    const start = Math.max(0, lineNumber - contextRange - 1);
    const end = Math.min(lines.length, lineNumber + contextRange);
    
    return {
      before: lines.slice(start, lineNumber - 1),
      current: lines[lineNumber - 1],
      after: lines.slice(lineNumber, end)
    };
  }

  /**
   * Calculate confidence score for vulnerability detection
   */
  calculateConfidence(pattern, match) {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on pattern specificity
    if (pattern.regex.source.length > 50) confidence += 0.1;
    if (pattern.cwe) confidence += 0.1;
    if (match[0].length > 20) confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Get specific recommendation for vulnerability type
   */
  getSpecificRecommendation(vulnerabilityType) {
    const recommendations = {
      'API Key': 'Move API keys to environment variables and use a secrets management system',
      'Password': 'Never hardcode passwords. Use secure credential storage and hashing',
      'SQL Injection - String Concatenation': 'Use parameterized queries or prepared statements',
      'innerHTML Assignment': 'Use textContent or implement proper input sanitization',
      'eval() Usage': 'Replace eval() with safer alternatives like JSON.parse()',
      'MD5 Usage': 'Replace MD5 with SHA-256 or bcrypt for password hashing',
      'Math.random()': 'Use crypto.randomBytes() for cryptographically secure random numbers'
    };

    return recommendations[vulnerabilityType] || 'Review and remediate this security issue';
  }

  /**
   * Calculate overall risk score
   */
  calculateRiskScore(vulnerabilities) {
    if (vulnerabilities.length === 0) return 0;

    const totalWeight = vulnerabilities.reduce((sum, vuln) => {
      return sum + (this.severityWeights[vuln.severity] || 1);
    }, 0);

    // Normalize to 0-100 scale
    const maxPossible = vulnerabilities.length * this.severityWeights.HIGH;
    return Math.round((totalWeight / maxPossible) * 100);
  }

  /**
   * Generate enhanced summary with more details
   */
  generateEnhancedSummary(vulnerabilities) {
    const severityCounts = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.category] = (acc[vuln.category] || 0) + 1;
      return acc;
    }, {});

    const cweCounts = vulnerabilities.reduce((acc, vuln) => {
      if (vuln.cwe) {
        acc[vuln.cwe] = (acc[vuln.cwe] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalIssues: vulnerabilities.length,
      severityBreakdown: {
        high: severityCounts.HIGH || 0,
        medium: severityCounts.MEDIUM || 0,
        low: severityCounts.LOW || 0
      },
      categoryBreakdown: categoryCounts,
      cweBreakdown: cweCounts,
      topIssues: this.getTopIssues(vulnerabilities, 5)
    };
  }

  /**
   * Get top issues by severity and frequency
   */
  getTopIssues(vulnerabilities, limit = 5) {
    const issueFreq = vulnerabilities.reduce((acc, vuln) => {
      const key = `${vuln.type}-${vuln.severity}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(issueFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([issue, count]) => {
        const [type, severity] = issue.split('-');
        return { type, severity, count };
      });
  }

  /**
   * Generate detailed recommendations with prioritization
   */
  generateDetailedRecommendations(vulnerabilities) {
    const recommendations = [];
    const categoryGroups = this.groupBy(vulnerabilities, 'category');

    for (const [category, vulns] of Object.entries(categoryGroups)) {
      const highSeverityCount = vulns.filter(v => v.severity === 'HIGH').length;
      const priority = highSeverityCount > 0 ? 'HIGH' : 
                     vulns.filter(v => v.severity === 'MEDIUM').length > 0 ? 'MEDIUM' : 'LOW';

      recommendations.push({
        category,
        priority,
        issueCount: vulns.length,
        title: this.getCategoryRecommendationTitle(category),
        description: this.getCategoryRecommendationDescription(category),
        actionItems: this.getCategoryActionItems(category, vulns)
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Group array by key
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  /**
   * Get category-specific recommendation title
   */
  getCategoryRecommendationTitle(category) {
    const titles = {
      'Secrets Management': 'Implement Proper Secrets Management',
      'Injection Attacks': 'Prevent Injection Vulnerabilities',
      'Cross-Site Scripting': 'Implement XSS Protection',
      'Cryptographic Issues': 'Upgrade Cryptographic Implementation',
      'Insecure Storage': 'Secure Data Storage Practices',
      'Authentication & Authorization': 'Strengthen Authentication Mechanisms'
    };
    return titles[category] || `Address ${category} Issues`;
  }

  /**
   * Get category-specific recommendation description
   */
  getCategoryRecommendationDescription(category) {
    const descriptions = {
      'Secrets Management': 'Move all hardcoded secrets to environment variables or dedicated secrets management systems',
      'Injection Attacks': 'Implement parameterized queries and input validation to prevent injection attacks',
      'Cross-Site Scripting': 'Sanitize all user inputs and implement proper output encoding',
      'Cryptographic Issues': 'Replace weak cryptographic algorithms with modern, secure alternatives',
      'Insecure Storage': 'Implement secure storage mechanisms for sensitive data',
      'Authentication & Authorization': 'Add proper authentication and authorization checks to all endpoints'
    };
    return descriptions[category] || `Review and fix ${category.toLowerCase()} related issues`;
  }

  /**
   * Get category-specific action items
   */
  getCategoryActionItems(category, vulnerabilities) {
    const uniqueTypes = [...new Set(vulnerabilities.map(v => v.type))];
    
    return uniqueTypes.map(type => ({
      action: this.getSpecificRecommendation(type),
      affectedLines: vulnerabilities.filter(v => v.type === type).map(v => v.line),
      severity: vulnerabilities.find(v => v.type === type).severity
    }));
  }
}

module.exports = new SecurityScanner();
