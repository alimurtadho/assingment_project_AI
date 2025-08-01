/**
 * Performance Test Suite for CodeGuardian AI v2.0
 * Tests performance characteristics of refactored services
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Import refactored services
const SecurityScanner = require('../services/securityScanner');
const AIReviewer = require('../services/aiReviewer');
const TestGenerator = require('../services/testGenerator');
const ValidationUtils = require('../utils/validationUtils');

describe('CodeGuardian AI Performance Tests', () => {
    let scanner, reviewer, generator;

    beforeAll(() => {
        scanner = new SecurityScanner();
        reviewer = new AIReviewer();
        generator = new TestGenerator();

        // Mock OpenAI for consistent testing
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        review: {
                            overall_rating: 8,
                            strengths: ['Good structure'],
                            issues: ['Minor improvements needed'],
                            suggestions: ['Add comments']
                        }
                    })
                }
            }]
        };

        reviewer.openai = {
            chat: {
                completions: {
                    create: jest.fn().mockResolvedValue(mockOpenAIResponse)
                }
            }
        };

        generator.openai = {
            chat: {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [{
                            message: {
                                content: 'describe("test", () => { it("should work", () => {}); });'
                            }
                        }]
                    })
                }
            }
        };
    });

    describe('Security Scanner Performance', () => {
        test('should scan small files quickly', async () => {
            const smallCode = `
                function hello() {
                    console.log("Hello World");
                }
            `;

            const start = performance.now();
            await scanner.scanCode(smallCode, 'small.js');
            const end = performance.now();

            const duration = end - start;
            expect(duration).toBeLessThan(100); // Should complete in under 100ms
        });

        test('should handle medium files efficiently', async () => {
            // Create a medium-sized code file (~1KB)
            const mediumCode = `
                class UserManager {
                    constructor() {
                        this.users = [];
                        this.cache = new Map();
                    }

                    async createUser(userData) {
                        const validation = this.validateUserData(userData);
                        if (!validation.isValid) {
                            throw new Error('Invalid user data');
                        }

                        const user = {
                            id: this.generateId(),
                            ...userData,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };

                        this.users.push(user);
                        this.cache.set(user.id, user);
                        return user;
                    }

                    async updateUser(id, updates) {
                        const user = this.findUser(id);
                        if (!user) {
                            throw new Error('User not found');
                        }

                        Object.assign(user, updates, { updatedAt: new Date() });
                        this.cache.set(id, user);
                        return user;
                    }

                    findUser(id) {
                        if (this.cache.has(id)) {
                            return this.cache.get(id);
                        }

                        const user = this.users.find(u => u.id === id);
                        if (user) {
                            this.cache.set(id, user);
                        }
                        return user;
                    }

                    validateUserData(data) {
                        const errors = [];
                        
                        if (!data.email || !this.isValidEmail(data.email)) {
                            errors.push('Invalid email');
                        }
                        
                        if (!data.name || data.name.length < 2) {
                            errors.push('Name too short');
                        }

                        return {
                            isValid: errors.length === 0,
                            errors
                        };
                    }

                    isValidEmail(email) {
                        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
                    }

                    generateId() {
                        return Math.random().toString(36).substr(2, 9);
                    }
                }
            `;

            const start = performance.now();
            const result = await scanner.scanCode(mediumCode, 'medium.js');
            const end = performance.now();

            const duration = end - start;
            expect(duration).toBeLessThan(500); // Should complete in under 500ms
            expect(result).toHaveProperty('vulnerabilities');
        });

        test('should handle batch scanning efficiently', async () => {
            const codes = [
                'console.log("test1");',
                'console.log("test2");',
                'console.log("test3");',
                'console.log("test4");',
                'console.log("test5");'
            ];

            const start = performance.now();
            const promises = codes.map((code, index) => 
                scanner.scanCode(code, `test${index}.js`)
            );
            await Promise.all(promises);
            const end = performance.now();

            const duration = end - start;
            // Batch processing should be efficient
            expect(duration).toBeLessThan(1000); // Should complete in under 1 second
        });

        test('should have consistent performance across similar files', async () => {
            const testCode = `
                function processData(data) {
                    return data.map(item => item.value * 2);
                }
            `;

            const times = [];
            
            // Run multiple iterations
            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                await scanner.scanCode(testCode, `test${i}.js`);
                const end = performance.now();
                times.push(end - start);
            }

            // Calculate variance
            const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
            const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
            const standardDeviation = Math.sqrt(variance);

            // Standard deviation should be relatively low (consistent performance)
            expect(standardDeviation).toBeLessThan(mean * 0.5);
        });
    });

    describe('AI Reviewer Performance', () => {
        test('should review code within reasonable time', async () => {
            const code = `
                function fibonacci(n) {
                    if (n <= 1) return n;
                    return fibonacci(n - 1) + fibonacci(n - 2);
                }
            `;

            const start = performance.now();
            await reviewer.reviewCode(code, 'fib.js');
            const end = performance.now();

            const duration = end - start;
            // AI review should complete quickly with mocked API
            expect(duration).toBeLessThan(200);
        });

        test('should handle different analysis types efficiently', async () => {
            const code = 'const x = 1; const y = 2;';
            const types = ['security', 'performance', 'refactoring'];

            const start = performance.now();
            const promises = types.map(type => 
                reviewer.analyzeCode(code, 'test.js', type)
            );
            await Promise.all(promises);
            const end = performance.now();

            const duration = end - start;
            expect(duration).toBeLessThan(300);
        });
    });

    describe('Test Generator Performance', () => {
        test('should generate tests efficiently', async () => {
            const code = `
                function calculator(a, b, operation) {
                    switch(operation) {
                        case 'add': return a + b;
                        case 'subtract': return a - b;
                        case 'multiply': return a * b;
                        case 'divide': return a / b;
                        default: throw new Error('Invalid operation');
                    }
                }
            `;

            const start = performance.now();
            await generator.generateTests(code, 'calc.js', 'unit');
            const end = performance.now();

            const duration = end - start;
            expect(duration).toBeLessThan(200);
        });

        test('should handle multiple test types concurrently', async () => {
            const code = 'function add(a, b) { return a + b; }';
            const types = ['unit', 'integration', 'e2e'];

            const start = performance.now();
            const promises = types.map(type => 
                generator.generateTests(code, 'test.js', type)
            );
            await Promise.all(promises);
            const end = performance.now();

            const duration = end - start;
            expect(duration).toBeLessThan(400);
        });
    });

    describe('Validation Utils Performance', () => {
        test('should validate files quickly', () => {
            const mockFile = {
                originalname: 'test.js',
                mimetype: 'text/javascript',
                size: 1024,
                buffer: Buffer.from('console.log("test");')
            };

            const start = performance.now();
            for (let i = 0; i < 100; i++) {
                ValidationUtils.validateFile(mockFile);
            }
            const end = performance.now();

            const duration = end - start;
            const avgDuration = duration / 100;
            expect(avgDuration).toBeLessThan(1); // Should validate in under 1ms on average
        });

        test('should detect malicious content efficiently', () => {
            const testCode = `
                function normalFunction() {
                    console.log("This is normal code");
                    return true;
                }
            `;

            const start = performance.now();
            for (let i = 0; i < 50; i++) {
                ValidationUtils.detectMaliciousContent(testCode);
            }
            const end = performance.now();

            const duration = end - start;
            const avgDuration = duration / 50;
            expect(avgDuration).toBeLessThan(5); // Should analyze in under 5ms on average
        });

        test('should sanitize content efficiently', () => {
            const testContent = 'const x = 1; \\x00\\x01 console.log("test");';

            const start = performance.now();
            for (let i = 0; i < 100; i++) {
                ValidationUtils.sanitizeContent(testContent);
            }
            const end = performance.now();

            const duration = end - start;
            const avgDuration = duration / 100;
            expect(avgDuration).toBeLessThan(1); // Should sanitize in under 1ms on average
        });
    });

    describe('Memory Usage', () => {
        test('should not leak memory during repeated operations', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Perform many operations
            for (let i = 0; i < 20; i++) {
                const code = `console.log("test ${i}");`;
                await scanner.scanCode(code, `test${i}.js`);
                
                // Force garbage collection if available
                if (global.gc) {
                    global.gc();
                }
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });

        test('should handle large code files without excessive memory usage', async () => {
            // Create a large code string (100KB)
            const largeCode = 'console.log("test");\\n'.repeat(5000);
            
            const initialMemory = process.memoryUsage().heapUsed;
            
            await scanner.scanCode(largeCode, 'large.js');
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be proportional to input size but not excessive
            expect(memoryIncrease).toBeLessThan(largeCode.length * 10);
        });
    });

    describe('Concurrent Operations', () => {
        test('should handle concurrent security scans', async () => {
            const codes = Array(10).fill().map((_, i) => 
                `function test${i}() { console.log("test ${i}"); }`
            );

            const start = performance.now();
            const promises = codes.map((code, i) => 
                scanner.scanCode(code, `concurrent${i}.js`)
            );
            const results = await Promise.all(promises);
            const end = performance.now();

            const duration = end - start;
            
            // Concurrent operations should complete reasonably quickly
            expect(duration).toBeLessThan(2000);
            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result).toHaveProperty('vulnerabilities');
            });
        });

        test('should handle mixed concurrent operations', async () => {
            const code = 'function test() { return true; }';
            
            const start = performance.now();
            const operations = [
                scanner.scanCode(code, 'test1.js'),
                reviewer.reviewCode(code, 'test2.js'),
                generator.generateTests(code, 'test3.js', 'unit'),
                scanner.scanCode(code, 'test4.js'),
                reviewer.analyzeCode(code, 'test5.js', 'security')
            ];
            
            const results = await Promise.all(operations);
            const end = performance.now();

            const duration = end - start;
            
            expect(duration).toBeLessThan(1000);
            expect(results).toHaveLength(5);
        });
    });

    describe('Performance Benchmarks', () => {
        test('should meet baseline performance requirements', async () => {
            const benchmarks = {
                smallFileScan: 100, // ms
                mediumFileScan: 500, // ms
                codeReview: 200, // ms
                testGeneration: 200, // ms
                fileValidation: 10, // ms
                batchOperations: 1000 // ms for 10 operations
            };

            // Small file scan
            let start = performance.now();
            await scanner.scanCode('console.log("test");', 'small.js');
            let duration = performance.now() - start;
            expect(duration).toBeLessThan(benchmarks.smallFileScan);

            // Medium file scan
            const mediumCode = 'function test() { return true; }\\n'.repeat(50);
            start = performance.now();
            await scanner.scanCode(mediumCode, 'medium.js');
            duration = performance.now() - start;
            expect(duration).toBeLessThan(benchmarks.mediumFileScan);

            // Code review
            start = performance.now();
            await reviewer.reviewCode('function test() {}', 'review.js');
            duration = performance.now() - start;
            expect(duration).toBeLessThan(benchmarks.codeReview);

            // Test generation
            start = performance.now();
            await generator.generateTests('function add(a, b) { return a + b; }', 'test.js', 'unit');
            duration = performance.now() - start;
            expect(duration).toBeLessThan(benchmarks.testGeneration);

            // File validation
            const mockFile = {
                originalname: 'test.js',
                mimetype: 'text/javascript',
                size: 100,
                buffer: Buffer.from('test')
            };
            start = performance.now();
            ValidationUtils.validateFile(mockFile);
            duration = performance.now() - start;
            expect(duration).toBeLessThan(benchmarks.fileValidation);

            console.log('✅ All performance benchmarks passed');
        });
    });
});

// Utility function to create performance report
function createPerformanceReport() {
    return {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        cpuCount: require('os').cpus().length,
        totalMemory: require('os').totalmem(),
        freeMemory: require('os').freemem(),
        loadAverage: require('os').loadavg()
    };
}

module.exports = {
    createPerformanceReport
};
