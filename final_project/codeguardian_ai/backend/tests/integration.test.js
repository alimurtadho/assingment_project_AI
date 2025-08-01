/**
 * Comprehensive Integration Test Suite for CodeGuardian AI v2.0
 * Tests the refactored backend services and utilities
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Import refactored modules
const ResponseFormatter = require('../utils/responseFormatter');
const ValidationUtils = require('../utils/validationUtils');
const Logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

// Import refactored services
const SecurityScanner = require('../services/securityScanner');
const AIReviewer = require('../services/aiReviewer');
const TestGenerator = require('../services/testGenerator');

describe('CodeGuardian AI v2.0 Integration Tests', () => {
    let app;
    let server;

    beforeAll(async () => {
        // Set test environment
        process.env.NODE_ENV = 'test';
        process.env.OPENAI_API_KEY = 'test-api-key';
        
        // Import the refactored server
        const ServerClass = require('../server.refactored');
        const serverInstance = new ServerClass();
        app = serverInstance.app;
        
        // Start server for testing
        server = app.listen(0); // Use random port for testing
    });

    afterAll(async () => {
        if (server) {
            server.close();
        }
    });

    describe('Utility Classes', () => {
        describe('ResponseFormatter', () => {
            test('should format success response correctly', () => {
                const result = ResponseFormatter.success('Test successful', { id: 1 });
                
                expect(result).toHaveProperty('success', true);
                expect(result).toHaveProperty('message', 'Test successful');
                expect(result).toHaveProperty('data', { id: 1 });
                expect(result).toHaveProperty('timestamp');
            });

            test('should format error response correctly', () => {
                const result = ResponseFormatter.error('Test error', 400, 'VALIDATION_ERROR');
                
                expect(result).toHaveProperty('success', false);
                expect(result).toHaveProperty('message', 'Test error');
                expect(result).toHaveProperty('statusCode', 400);
                expect(result).toHaveProperty('errorCode', 'VALIDATION_ERROR');
                expect(result).toHaveProperty('timestamp');
            });

            test('should format paginated response correctly', () => {
                const data = [{ id: 1 }, { id: 2 }];
                const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
                const result = ResponseFormatter.paginated(data, pagination, 'Test paginated');
                
                expect(result).toHaveProperty('success', true);
                expect(result).toHaveProperty('data', data);
                expect(result).toHaveProperty('pagination', pagination);
            });
        });

        describe('ValidationUtils', () => {
            test('should validate JavaScript file correctly', () => {
                const mockFile = {
                    originalname: 'test.js',
                    mimetype: 'text/javascript',
                    size: 1024,
                    buffer: Buffer.from('console.log("test");')
                };

                const result = ValidationUtils.validateFile(mockFile);
                expect(result.isValid).toBe(true);
            });

            test('should reject invalid file type', () => {
                const mockFile = {
                    originalname: 'test.exe',
                    mimetype: 'application/octet-stream',
                    size: 1024,
                    buffer: Buffer.from('invalid content')
                };

                const result = ValidationUtils.validateFile(mockFile);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Unsupported file type');
            });

            test('should reject oversized file', () => {
                const mockFile = {
                    originalname: 'test.js',
                    mimetype: 'text/javascript',
                    size: 100 * 1024 * 1024, // 100MB
                    buffer: Buffer.alloc(100 * 1024 * 1024)
                };

                const result = ValidationUtils.validateFile(mockFile);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('File too large');
            });

            test('should detect potential malicious content', () => {
                const maliciousCode = 'eval(atob("dmFyIGEgPSBkb2N1bWVudA=="))';
                const result = ValidationUtils.detectMaliciousContent(maliciousCode);
                
                expect(result.isSafe).toBe(false);
                expect(result.threats.length).toBeGreaterThan(0);
            });

            test('should sanitize code content', () => {
                const maliciousCode = 'const x = 1; \\x00\\x01 eval("test"); // normal code';
                const sanitized = ValidationUtils.sanitizeContent(maliciousCode);
                
                expect(sanitized).not.toContain('\\x00');
                expect(sanitized).not.toContain('\\x01');
                expect(sanitized).toContain('const x = 1;');
            });
        });

        describe('Logger', () => {
            test('should create logger instance', () => {
                const logger = Logger.getInstance();
                expect(logger).toBeDefined();
                expect(typeof logger.info).toBe('function');
                expect(typeof logger.error).toBe('function');
                expect(typeof logger.warn).toBe('function');
            });

            test('should track requests', () => {
                const mockReq = {
                    method: 'GET',
                    url: '/test',
                    ip: '127.0.0.1',
                    headers: { 'user-agent': 'test' }
                };
                
                const trackingId = Logger.trackRequest(mockReq);
                expect(trackingId).toBeDefined();
                expect(typeof trackingId).toBe('string');
            });
        });

        describe('ErrorHandler', () => {
            test('should handle validation errors', () => {
                const error = new Error('Validation failed');
                error.name = 'ValidationError';
                
                const handled = ErrorHandler.handleError(error);
                
                expect(handled.statusCode).toBe(400);
                expect(handled.errorCode).toBe('VALIDATION_ERROR');
                expect(handled.message).toBe('Validation failed');
            });

            test('should handle unknown errors safely', () => {
                const error = new Error('Unknown error');
                
                const handled = ErrorHandler.handleError(error);
                
                expect(handled.statusCode).toBe(500);
                expect(handled.errorCode).toBe('INTERNAL_SERVER_ERROR');
            });

            test('should categorize errors correctly', () => {
                const clientError = new Error('Client error');
                clientError.statusCode = 400;
                
                const serverError = new Error('Server error');
                serverError.statusCode = 500;
                
                expect(ErrorHandler.categorizeError(clientError)).toBe('client');
                expect(ErrorHandler.categorizeError(serverError)).toBe('server');
            });
        });
    });

    describe('Enhanced Services', () => {
        describe('SecurityScanner', () => {
            let scanner;

            beforeEach(() => {
                scanner = new SecurityScanner();
            });

            test('should initialize with patterns', () => {
                expect(scanner.patterns).toBeDefined();
                expect(scanner.patterns.length).toBeGreaterThan(0);
            });

            test('should scan JavaScript code for vulnerabilities', async () => {
                const code = `
                    function unsafeFunction(input) {
                        eval(input); // This is dangerous
                        document.innerHTML = input; // XSS vulnerability
                        return input;
                    }
                `;

                const result = await scanner.scanCode(code, 'test.js');
                
                expect(result).toHaveProperty('vulnerabilities');
                expect(result).toHaveProperty('riskScore');
                expect(result).toHaveProperty('summary');
                expect(result.vulnerabilities.length).toBeGreaterThan(0);
            });

            test('should detect SQL injection patterns', async () => {
                const code = `
                    function queryDatabase(userId) {
                        const query = "SELECT * FROM users WHERE id = " + userId;
                        return db.query(query);
                    }
                `;

                const result = await scanner.scanCode(code, 'db.js');
                
                const sqlInjection = result.vulnerabilities.find(v => 
                    v.type === 'sql_injection'
                );
                expect(sqlInjection).toBeDefined();
            });

            test('should calculate risk scores correctly', async () => {
                const highRiskCode = `
                    eval(userInput);
                    exec(command);
                    document.write(userContent);
                `;

                const lowRiskCode = `
                    const x = 1;
                    console.log('Hello World');
                `;

                const highRisk = await scanner.scanCode(highRiskCode, 'high.js');
                const lowRisk = await scanner.scanCode(lowRiskCode, 'low.js');

                expect(highRisk.riskScore).toBeGreaterThan(lowRisk.riskScore);
            });

            test('should provide remediation suggestions', async () => {
                const code = 'eval(userInput);';
                const result = await scanner.scanCode(code, 'test.js');
                
                const evalVuln = result.vulnerabilities.find(v => 
                    v.type === 'code_injection'
                );
                expect(evalVuln).toBeDefined();
                expect(evalVuln.remediation).toBeDefined();
                expect(evalVuln.remediation.length).toBeGreaterThan(0);
            });
        });

        describe('AIReviewer', () => {
            let reviewer;

            beforeEach(() => {
                reviewer = new AIReviewer();
                // Mock OpenAI API
                reviewer.openai = {
                    chat: {
                        completions: {
                            create: jest.fn().mockResolvedValue({
                                choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            review: {
                                                overall_rating: 7,
                                                strengths: ['Well structured'],
                                                issues: ['Missing error handling'],
                                                suggestions: ['Add try-catch blocks']
                                            }
                                        })
                                    }
                                }]
                            })
                        }
                    }
                };
            });

            test('should perform general code review', async () => {
                const code = `
                    function calculateSum(a, b) {
                        return a + b;
                    }
                `;

                const result = await reviewer.reviewCode(code, 'test.js');
                
                expect(result).toHaveProperty('type', 'code_review');
                expect(result).toHaveProperty('analysis');
                expect(result).toHaveProperty('metadata');
            });

            test('should perform security analysis', async () => {
                const code = 'eval(userInput);';
                const result = await reviewer.analyzeCode(code, 'test.js', 'security');
                
                expect(result).toHaveProperty('type', 'security_analysis');
                expect(result).toHaveProperty('analysis');
            });

            test('should provide refactoring suggestions', async () => {
                const code = `
                    function oldFunction() {
                        var x = 1;
                        var y = 2;
                        return x + y;
                    }
                `;

                const result = await reviewer.analyzeCode(code, 'test.js', 'refactoring');
                
                expect(result).toHaveProperty('type', 'refactoring_suggestions');
                expect(result).toHaveProperty('analysis');
            });

            test('should analyze performance', async () => {
                const code = `
                    function inefficientLoop(arr) {
                        for (let i = 0; i < arr.length; i++) {
                            for (let j = 0; j < arr.length; j++) {
                                // O(n²) complexity
                                console.log(arr[i], arr[j]);
                            }
                        }
                    }
                `;

                const result = await reviewer.analyzeCode(code, 'test.js', 'performance');
                
                expect(result).toHaveProperty('type', 'performance_analysis');
                expect(result).toHaveProperty('analysis');
            });

            test('should handle API failures gracefully', async () => {
                reviewer.openai.chat.completions.create.mockRejectedValue(
                    new Error('API Error')
                );

                const code = 'console.log("test");';
                
                await expect(reviewer.reviewCode(code, 'test.js')).rejects.toThrow();
            });
        });

        describe('TestGenerator', () => {
            let generator;

            beforeEach(() => {
                generator = new TestGenerator();
                // Mock OpenAI API
                generator.openai = {
                    chat: {
                        completions: {
                            create: jest.fn().mockResolvedValue({
                                choices: [{
                                    message: {
                                        content: `
                                        describe('Calculator', () => {
                                            test('should add two numbers', () => {
                                                expect(add(2, 3)).toBe(5);
                                            });
                                        });
                                        `
                                    }
                                }]
                            })
                        }
                    }
                };
            });

            test('should generate unit tests', async () => {
                const code = `
                    function add(a, b) {
                        return a + b;
                    }
                `;

                const result = await generator.generateTests(code, 'calculator.js', 'unit');
                
                expect(result).toHaveProperty('type', 'unit');
                expect(result).toHaveProperty('tests');
                expect(result).toHaveProperty('framework');
                expect(result).toHaveProperty('metadata');
            });

            test('should generate integration tests', async () => {
                const code = `
                    class UserService {
                        async createUser(userData) {
                            return await database.users.create(userData);
                        }
                    }
                `;

                const result = await generator.generateTests(code, 'userService.js', 'integration');
                
                expect(result).toHaveProperty('type', 'integration');
                expect(result).toHaveProperty('tests');
            });

            test('should generate E2E tests', async () => {
                const code = `
                    app.post('/api/users', (req, res) => {
                        // Create user endpoint
                        res.json({ success: true });
                    });
                `;

                const result = await generator.generateTests(code, 'routes.js', 'e2e');
                
                expect(result).toHaveProperty('type', 'e2e');
                expect(result).toHaveProperty('tests');
            });

            test('should detect appropriate test framework', () => {
                const jestCode = 'describe("test", () => {})';
                const mochaCode = 'it("should test", function() {})';
                
                expect(generator.detectFramework(jestCode)).toBe('jest');
                expect(generator.detectFramework(mochaCode)).toBe('mocha');
            });

            test('should analyze code complexity', () => {
                const simpleCode = 'const x = 1;';
                const complexCode = `
                    function complex(arr) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i] > 10) {
                                for (let j = 0; j < arr[i]; j++) {
                                    try {
                                        processItem(arr[i], j);
                                    } catch (e) {
                                        handleError(e);
                                    }
                                }
                            }
                        }
                    }
                `;
                
                const simpleAnalysis = generator.analyzeCodeComplexity(simpleCode);
                const complexAnalysis = generator.analyzeCodeComplexity(complexCode);
                
                expect(complexAnalysis.cyclomaticComplexity).toBeGreaterThan(
                    simpleAnalysis.cyclomaticComplexity
                );
            });
        });
    });

    describe('API Endpoints', () => {
        test('should respond to health check', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('status', 'healthy');
        });

        test('should handle CORS properly', async () => {
            const response = await request(app)
                .options('/api/health')
                .expect(204);

            expect(response.headers).toHaveProperty('access-control-allow-origin');
        });

        test('should apply rate limiting', async () => {
            // This test would need to be adapted based on your rate limiting configuration
            const requests = Array(10).fill().map(() => 
                request(app).get('/api/health')
            );

            const responses = await Promise.all(requests);
            
            // All requests should succeed under normal rate limits
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 errors', async () => {
            const response = await request(app)
                .get('/api/nonexistent-endpoint')
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });

        test('should handle malformed requests', async () => {
            const response = await request(app)
                .post('/api/security/scan')
                .send({ invalid: 'data' })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });
    });
});

module.exports = {
    // Export test utilities for use in other test files
    createMockFile: (filename, content, size = null) => ({
        originalname: filename,
        mimetype: 'text/javascript',
        size: size || Buffer.byteLength(content),
        buffer: Buffer.from(content)
    }),
    
    createMockOpenAI: (responseContent) => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{
                        message: { content: responseContent }
                    }]
                })
            }
        }
    })
};
