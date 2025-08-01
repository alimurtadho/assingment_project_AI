// Jest setup file for backend tests
const { PrismaClient } = require('@prisma/client');

// Setup test database
beforeAll(async () => {
  // Initialize test database if needed
});

afterAll(async () => {
  // Cleanup test database if needed
});

/**
 * Jest Test Setup Configuration
 * Sets up the testing environment for CodeGuardian AI
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/codeguardian_test';
process.env.OPENAI_API_KEY = 'test-api-key-mock';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test timeout
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
    // Create a mock file object for testing
    createMockFile: (filename, content, mimetype = 'text/javascript') => ({
        originalname: filename,
        mimetype,
        size: Buffer.byteLength(content),
        buffer: Buffer.from(content),
        fieldname: 'file',
        encoding: '7bit'
    }),

    // Create mock request object
    createMockRequest: (overrides = {}) => ({
        method: 'GET',
        url: '/test',
        headers: {
            'user-agent': 'test-agent',
            'content-type': 'application/json'
        },
        ip: '127.0.0.1',
        body: {},
        query: {},
        params: {},
        ...overrides
    }),

    // Generate test data
    generateTestCode: (type = 'javascript') => {
        const templates = {
            javascript: `
                function testFunction(param1, param2) {
                    if (!param1) {
                        throw new Error('param1 is required');
                    }
                    
                    const result = param1 + param2;
                    console.log('Result:', result);
                    return result;
                }
                
                module.exports = testFunction;
            `,
            python: `
                def test_function(param1, param2):
                    if not param1:
                        raise ValueError('param1 is required')
                    
                    result = param1 + param2
                    print(f'Result: {result}')
                    return result
            `
        };
        
        return templates[type] || templates.javascript;
    },

    // Generate vulnerable code for testing security scanner
    generateVulnerableCode: () => `
        function processUserInput(input) {
            // SQL Injection vulnerability
            const query = "SELECT * FROM users WHERE name = '" + input + "'";
            
            // XSS vulnerability
            document.innerHTML = input;
            
            // Code injection vulnerability
            eval(input);
            
            return query;
        }
    `
};

// Database is already initialized at the top of the file

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

module.exports = {
    testUtils: global.testUtils
};

// Global test timeout
jest.setTimeout(10000);
