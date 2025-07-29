const securityScanner = require('../services/securityScanner');

describe('Security Scanner Service', () => {
  describe('scanCode', () => {
    it('should detect hardcoded API keys', async () => {
      const code = `
const API_KEY = "sk-1234567890abcdef";
const config = {
  apiKey: "abc123def456ghi789"
};
      `;
      
      const result = await securityScanner.scanCode(code, 'test.js');
      
      expect(result.vulnerabilities).toHaveLength(2);
      expect(result.vulnerabilities[0].type).toBe('API Key');
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect SQL injection patterns', async () => {
      const code = `
const query = "SELECT * FROM users WHERE id = " + userId;
const sql = \`INSERT INTO posts VALUES (\${title}, \${content})\`;
      `;
      
      const result = await securityScanner.scanCode(code, 'test.js');
      
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.vulnerabilities.some(v => v.category === 'sqlInjection')).toBe(true);
    });

    it('should detect XSS vulnerabilities', async () => {
      const code = `
element.innerHTML = userInput;
document.write(data);
eval(userCode);
      `;
      
      const result = await securityScanner.scanCode(code, 'test.js');
      
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.vulnerabilities.some(v => v.category === 'xss')).toBe(true);
    });

    it('should detect weak cryptography', async () => {
      const code = `
const hash = md5(password);
const sha1Hash = sha1(data);
const random = Math.random();
      `;
      
      const result = await securityScanner.scanCode(code, 'test.js');
      
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.vulnerabilities.some(v => v.category === 'weakCrypto')).toBe(true);
    });

    it('should return no vulnerabilities for clean code', async () => {
      const code = `
const config = {
  apiKey: process.env.API_KEY
};

const query = 'SELECT * FROM users WHERE id = ?';
const stmt = db.prepare(query);
const result = stmt.get(userId);
      `;
      
      const result = await securityScanner.scanCode(code, 'test.js');
      
      expect(result.vulnerabilities).toHaveLength(0);
      expect(result.riskScore).toBeLessThanOrEqual(2);
    });
  });

  describe('generateSummary', () => {
    it('should correctly count vulnerabilities by severity', () => {
      const vulnerabilities = [
        { severity: 'HIGH', category: 'test' },
        { severity: 'HIGH', category: 'test' },
        { severity: 'MEDIUM', category: 'test' },
        { severity: 'LOW', category: 'test' }
      ];
      
      const summary = securityScanner.generateSummary(vulnerabilities);
      
      expect(summary.totalIssues).toBe(4);
      expect(summary.high).toBe(2);
      expect(summary.medium).toBe(1);
      expect(summary.low).toBe(1);
    });
  });
});
