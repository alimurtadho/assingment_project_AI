const request = require('supertest');
const app = require('../server');

describe('Security Scanner API', () => {
  describe('POST /api/security/scan', () => {
    it('should scan a file and return vulnerabilities', async () => {
      const testCode = `
const API_KEY = "sk-1234567890abcdef";
const query = "SELECT * FROM users WHERE id = " + userId;
      `;
      
      const response = await request(app)
        .post('/api/security/scan')
        .attach('file', Buffer.from(testCode), 'test.js')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.vulnerabilities).toBeDefined();
      expect(response.body.riskScore).toBeGreaterThan(0);
    });

    it('should reject files without proper extension', async () => {
      const response = await request(app)
        .post('/api/security/scan')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(400);
      
      expect(response.body.error).toContain('Invalid file type');
    });

    it('should reject oversized files', async () => {
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      
      const response = await request(app)
        .post('/api/security/scan')
        .attach('file', Buffer.from(largeContent), 'large.js')
        .expect(400);
    });
  });

  describe('GET /api/security/scans', () => {
    it('should return list of scan results', async () => {
      const response = await request(app)
        .get('/api/security/scans')
        .expect(200);
      
      expect(response.body.results).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });
  });
});

describe('Health Check', () => {
  it('should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});
