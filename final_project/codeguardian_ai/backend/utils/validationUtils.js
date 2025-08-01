// Backend Utilities - Validation Helpers
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

class ValidationUtils {
  // File validation rules
  static fileUploadRules() {
    return [
      body('file').custom((value, { req }) => {
        if (!req.file) {
          throw new Error('File is required');
        }
        
        const allowedTypes = [
          'text/plain',
          'application/javascript',
          'text/javascript',
          'application/typescript',
          'text/x-python',
          'text/x-java',
          'text/x-c',
          'text/x-cpp'
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Invalid file type. Only code files are allowed.');
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
          throw new Error('File size too large. Maximum 5MB allowed.');
        }

        return true;
      })
    ];
  }

  // Handle validation errors
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }

  // Sanitize file content
  static sanitizeFileContent(content) {
    // Remove potential malicious content
    return content
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .substring(0, 100000); // Limit to 100KB of content
  }

  // Validate API keys
  static validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Basic OpenAI API key format validation
    return apiKey.startsWith('sk-') && apiKey.length > 20;
  }

  // Validate file object
  static validateFile(file) {
    if (!file) {
      return {
        isValid: false,
        errors: ['File object is required'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check required properties
    if (!file.originalname) errors.push('File name is required');
    if (!file.buffer && !file.content) errors.push('File content is required');
    if (!file.mimetype && !file.extension) errors.push('File type is required');

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    const size = file.size || (file.buffer ? file.buffer.length : file.content?.length || 0);
    if (size > maxSize) {
      errors.push('File too large. Maximum size: 10MB');
    }
    if (size === 0) {
      errors.push('File is empty');
    }

    // Check file type
    const supportedExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.html', '.css'];
    const extension = file.extension || (file.originalname ? file.originalname.substring(file.originalname.lastIndexOf('.')) : '');
    
    if (extension && !supportedExtensions.includes(extension.toLowerCase())) {
      errors.push(`Unsupported file type: ${extension}`);
    }

    // Check for suspicious file names
    const suspiciousPatterns = ['malware', 'virus', 'trojan', 'backdoor'];
    const fileName = file.originalname || '';
    if (suspiciousPatterns.some(pattern => fileName.toLowerCase().includes(pattern))) {
      warnings.push('Suspicious file name detected');
    }

    // Determine language
    const language = this.getFileLanguage(fileName);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: fileName,
        size,
        language,
        extension
      }
    };
  }

  // Detect malicious content
  static detectMaliciousContent(content) {
    if (!content) {
      return {
        isSafe: true,
        threats: []
      };
    }

    const threats = [];

    // Patterns to detect various threats
    const patterns = [
      { regex: /eval\s*\(/gi, type: 'code_injection', description: 'Potential eval() usage detected' },
      { regex: /new\s+Function\s*\(/gi, type: 'code_injection', description: 'Function constructor usage detected' },
      { regex: /SELECT\s+.*\s+FROM\s+.*WHERE.*[+]|UNION\s+SELECT/gi, type: 'sql_injection', description: 'SQL injection pattern detected' },
      { regex: /innerHTML\s*=|document\.write\s*\(/gi, type: 'xss', description: 'XSS vulnerability pattern detected' },
      { regex: /\.\.\/|\.\.\\|\/etc\/passwd|\/proc\//gi, type: 'path_traversal', description: 'Path traversal attempt detected' },
      { regex: /exec\s*\(|system\s*\(|shell_exec\s*\(/gi, type: 'command_injection', description: 'Command injection pattern detected' }
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        threats.push({
          type: pattern.type,
          description: pattern.description,
          matches: matches.length,
          pattern: pattern.regex.source
        });
      }
    });

    return {
      isSafe: threats.length === 0,
      threats
    };
  }

  // Sanitize content
  static sanitizeContent(content) {
    if (!content) return '';

    return content
      // Remove null bytes and control characters
      .replace(/\x00/g, '')
      .replace(/[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove BOM
      .replace(/^\uFEFF/, '')
      // Trim excessive whitespace while preserving structure
      .trim();
  }

  // Validate code syntax
  static validateCodeSyntax(code, language) {
    const errors = [];

    try {
      if (language === 'javascript' || language === 'typescript') {
        // Basic syntax check - try to parse as JavaScript
        new Function(code);
      }
      // For other languages, we'd need specific parsers
      // For now, just return basic validation
    } catch (error) {
      errors.push({
        line: 1,
        message: error.message,
        type: 'SyntaxError'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get file language from extension
  static getFileLanguage(filename) {
    if (!filename) return 'unknown';

    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const languageMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.html': 'html',
      '.css': 'css'
    };

    return languageMap[extension] || 'unknown';
  }

  // Calculate file hash
  static calculateFileHash(content) {
    if (!content) content = '';
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Validate code input for scanning
  static validateCodeInput(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
    
    // Check for reasonable size limits
    if (code.length > 1000000) { // 1MB limit
      return false;
    }
    
    return true;
  }
}

module.exports = ValidationUtils;
