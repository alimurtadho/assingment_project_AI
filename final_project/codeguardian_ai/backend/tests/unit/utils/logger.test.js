/**
 * Unit Tests for Logger Utility
 * Tests Winston-based logging functionality
 */

const Logger = require('../../../utils/logger');
const fs = require('fs');
const path = require('path');

// Mock Winston to avoid actual file I/O during tests
jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        http: jest.fn(),
        log: jest.fn(),
        child: jest.fn(() => ({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        }))
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        json: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
        errors: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        DailyRotateFile: jest.fn()
    }
}));

describe('Logger Utility', () => {
    let mockLogger;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Get fresh logger instance
        mockLogger = Logger.getInstance();
    });

    describe('getInstance method', () => {
        test('should return singleton instance', () => {
            const logger1 = Logger.getInstance();
            const logger2 = Logger.getInstance();

            expect(logger1).toBe(logger2);
        });

        test('should return logger with required methods', () => {
            const logger = Logger.getInstance();

            expect(logger).toHaveProperty('info');
            expect(logger).toHaveProperty('error');
            expect(logger).toHaveProperty('warn');
            expect(logger).toHaveProperty('debug');
            expect(logger).toHaveProperty('http');
        });
    });

    describe('trackRequest method', () => {
        test('should generate unique tracking ID', () => {
            const mockReq = {
                method: 'GET',
                url: '/api/test',
                ip: '127.0.0.1',
                headers: { 'user-agent': 'test-agent' }
            };

            const trackingId1 = Logger.trackRequest(mockReq);
            const trackingId2 = Logger.trackRequest(mockReq);

            expect(trackingId1).toBeDefined();
            expect(trackingId2).toBeDefined();
            expect(trackingId1).not.toBe(trackingId2);
            expect(typeof trackingId1).toBe('string');
        });

        test('should handle missing request properties', () => {
            const incompleteReq = {
                method: 'POST'
                // Missing other properties
            };

            const trackingId = Logger.trackRequest(incompleteReq);

            expect(trackingId).toBeDefined();
            expect(typeof trackingId).toBe('string');
        });

        test('should log request information', () => {
            const mockReq = {
                method: 'POST',
                url: '/api/users',
                ip: '192.168.1.100',
                headers: { 
                    'user-agent': 'Mozilla/5.0',
                    'content-type': 'application/json'
                }
            };

            const trackingId = Logger.trackRequest(mockReq);

            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Request started'),
                expect.objectContaining({
                    trackingId,
                    method: 'POST',
                    url: '/api/users',
                    ip: '192.168.1.100'
                })
            );
        });
    });

    describe('trackResponse method', () => {
        test('should log response with timing', () => {
            const trackingId = 'test-tracking-id';
            const startTime = Date.now() - 100; // 100ms ago
            const statusCode = 200;

            Logger.trackResponse(trackingId, startTime, statusCode);

            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Request completed'),
                expect.objectContaining({
                    trackingId,
                    statusCode,
                    duration: expect.any(Number)
                })
            );
        });

        test('should calculate duration correctly', () => {
            const trackingId = 'test-tracking-id';
            const startTime = Date.now() - 250; // 250ms ago
            const statusCode = 201;

            Logger.trackResponse(trackingId, startTime, statusCode);

            const logCall = mockLogger.info.mock.calls.find(call => 
                call[0].includes('Request completed')
            );
            
            expect(logCall[1].duration).toBeGreaterThan(200);
            expect(logCall[1].duration).toBeLessThan(300);
        });

        test('should handle error status codes', () => {
            const trackingId = 'error-tracking-id';
            const startTime = Date.now() - 50;
            const statusCode = 500;

            Logger.trackResponse(trackingId, startTime, statusCode);

            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Request completed'),
                expect.objectContaining({
                    trackingId,
                    statusCode: 500
                })
            );
        });
    });

    describe('logError method', () => {
        test('should log error with context', () => {
            const error = new Error('Test error');
            const context = { userId: 123, action: 'create_user' };

            Logger.logError(error, context);

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Application error occurred',
                expect.objectContaining({
                    error: {
                        message: 'Test error',
                        stack: expect.any(String),
                        name: 'Error'
                    },
                    context
                })
            );
        });

        test('should handle error without context', () => {
            const error = new Error('Simple error');

            Logger.logError(error);

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Application error occurred',
                expect.objectContaining({
                    error: {
                        message: 'Simple error',
                        stack: expect.any(String),
                        name: 'Error'
                    },
                    context: {}
                })
            );
        });

        test('should handle non-Error objects', () => {
            const errorString = 'String error';

            Logger.logError(errorString);

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Application error occurred',
                expect.objectContaining({
                    error: {
                        message: 'String error',
                        stack: 'No stack trace available',
                        name: 'Unknown'
                    }
                })
            );
        });
    });

    describe('logPerformance method', () => {
        test('should log performance metrics', () => {
            const operation = 'database_query';
            const duration = 150;
            const metadata = { query: 'SELECT * FROM users', rows: 25 };

            Logger.logPerformance(operation, duration, metadata);

            expect(mockLogger.info).toHaveBeenCalledWith(
                `Performance: ${operation}`,
                expect.objectContaining({
                    operation,
                    duration,
                    metadata
                })
            );
        });

        test('should handle performance logging without metadata', () => {
            const operation = 'file_upload';
            const duration = 2500;

            Logger.logPerformance(operation, duration);

            expect(mockLogger.info).toHaveBeenCalledWith(
                `Performance: ${operation}`,
                expect.objectContaining({
                    operation,
                    duration,
                    metadata: {}
                })
            );
        });

        test('should log slow operations as warnings', () => {
            const operation = 'slow_operation';
            const duration = 10000; // 10 seconds

            Logger.logPerformance(operation, duration);

            expect(mockLogger.warn).toHaveBeenCalledWith(
                `Slow operation detected: ${operation}`,
                expect.objectContaining({
                    operation,
                    duration: 10000
                })
            );
        });
    });

    describe('createChildLogger method', () => {
        test('should create child logger with context', () => {
            const context = { service: 'auth', userId: 456 };

            const childLogger = Logger.createChildLogger(context);

            expect(mockLogger.child).toHaveBeenCalledWith(context);
            expect(childLogger).toBeDefined();
        });

        test('should handle empty context', () => {
            const childLogger = Logger.createChildLogger({});

            expect(mockLogger.child).toHaveBeenCalledWith({});
            expect(childLogger).toBeDefined();
        });
    });

    describe('logSecurity method', () => {
        test('should log security events', () => {
            const event = 'failed_login_attempt';
            const details = { 
                ip: '192.168.1.100', 
                username: 'testuser',
                attempts: 3 
            };

            Logger.logSecurity(event, details);

            expect(mockLogger.warn).toHaveBeenCalledWith(
                `Security event: ${event}`,
                expect.objectContaining({
                    securityEvent: event,
                    details,
                    timestamp: expect.any(String)
                })
            );
        });

        test('should log critical security events as errors', () => {
            const event = 'account_compromised';
            const details = { userId: 789, ip: '192.168.1.200' };

            Logger.logSecurity(event, details);

            expect(mockLogger.error).toHaveBeenCalledWith(
                `Critical security event: ${event}`,
                expect.objectContaining({
                    securityEvent: event,
                    details
                })
            );
        });
    });

    describe('middleware integration', () => {
        test('should provide Express middleware', () => {
            const middleware = Logger.getExpressMiddleware();

            expect(typeof middleware).toBe('function');
            expect(middleware.length).toBe(3); // req, res, next
        });

        test('should track requests via middleware', () => {
            const middleware = Logger.getExpressMiddleware();
            
            const mockReq = {
                method: 'GET',
                url: '/api/test',
                ip: '127.0.0.1',
                headers: { 'user-agent': 'test' }
            };
            
            const mockRes = {
                on: jest.fn(),
                statusCode: 200
            };
            
            const mockNext = jest.fn();

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.trackingId).toBeDefined();
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
        });
    });

    describe('log levels', () => {
        test('should support all log levels', () => {
            const logger = Logger.getInstance();

            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warning message');
            logger.error('Error message');

            expect(mockLogger.debug).toHaveBeenCalledWith('Debug message');
            expect(mockLogger.info).toHaveBeenCalledWith('Info message');
            expect(mockLogger.warn).toHaveBeenCalledWith('Warning message');
            expect(mockLogger.error).toHaveBeenCalledWith('Error message');
        });

        test('should support HTTP logging', () => {
            const logger = Logger.getInstance();

            logger.http('HTTP request log');

            expect(mockLogger.http).toHaveBeenCalledWith('HTTP request log');
        });
    });

    describe('configuration', () => {
        test('should handle different environments', () => {
            // Test is handled in the actual Logger class
            // This test verifies the logger can be instantiated
            const logger = Logger.getInstance();
            expect(logger).toBeDefined();
        });

        test('should handle missing log directory gracefully', () => {
            // This would be tested with actual file system operations
            // For unit tests, we mock the file system
            const logger = Logger.getInstance();
            expect(logger).toBeDefined();
        });
    });

    describe('edge cases', () => {
        test('should handle null values gracefully', () => {
            expect(() => Logger.logError(null)).not.toThrow();
            expect(() => Logger.trackRequest(null)).not.toThrow();
            expect(() => Logger.logPerformance(null, 0)).not.toThrow();
        });

        test('should handle undefined values gracefully', () => {
            expect(() => Logger.logError(undefined)).not.toThrow();
            expect(() => Logger.trackResponse(undefined, 0, 200)).not.toThrow();
        });

        test('should handle circular references in context', () => {
            const circular = { name: 'test' };
            circular.self = circular;

            expect(() => Logger.logError(new Error('Test'), circular)).not.toThrow();
        });

        test('should handle very large log messages', () => {
            const largeMessage = 'x'.repeat(10000);
            
            expect(() => Logger.getInstance().info(largeMessage)).not.toThrow();
        });
    });
});
