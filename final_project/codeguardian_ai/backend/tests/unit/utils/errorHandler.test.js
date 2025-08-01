/**
 * Unit Tests for ErrorHandler Utility
 * Tests centralized error handling and categorization
 */

const ErrorHandler = require('../../../utils/errorHandler');

describe('ErrorHandler Utility', () => {
    describe('handleError method', () => {
        test('should handle ValidationError', () => {
            const error = new Error('Invalid email format');
            error.name = 'ValidationError';
            error.statusCode = 400;

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 400,
                errorCode: 'VALIDATION_ERROR',
                message: 'Invalid email format',
                category: 'client',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle AuthenticationError', () => {
            const error = new Error('Invalid credentials');
            error.name = 'AuthenticationError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 401,
                errorCode: 'AUTHENTICATION_ERROR',
                message: 'Invalid credentials',
                category: 'client',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle AuthorizationError', () => {
            const error = new Error('Access denied');
            error.name = 'AuthorizationError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 403,
                errorCode: 'AUTHORIZATION_ERROR',
                message: 'Access denied',
                category: 'client',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle NotFoundError', () => {
            const error = new Error('Resource not found');
            error.name = 'NotFoundError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 404,
                errorCode: 'NOT_FOUND_ERROR',
                message: 'Resource not found',
                category: 'client',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle ConflictError', () => {
            const error = new Error('Resource already exists');
            error.name = 'ConflictError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 409,
                errorCode: 'CONFLICT_ERROR',
                message: 'Resource already exists',
                category: 'client',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle RateLimitError', () => {
            const error = new Error('Too many requests');
            error.name = 'RateLimitError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 429,
                errorCode: 'RATE_LIMIT_ERROR',
                message: 'Too many requests',
                category: 'client',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle DatabaseError', () => {
            const error = new Error('Connection failed');
            error.name = 'DatabaseError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 500,
                errorCode: 'DATABASE_ERROR',
                message: 'Database operation failed',
                category: 'server',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle ExternalServiceError', () => {
            const error = new Error('API timeout');
            error.name = 'ExternalServiceError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 502,
                errorCode: 'EXTERNAL_SERVICE_ERROR',
                message: 'External service unavailable',
                category: 'server',
                isOperational: true,
                timestamp: expect.any(String)
            });
        });

        test('should handle unknown errors safely', () => {
            const error = new Error('Unknown error occurred');
            error.name = 'WeirdError';

            const result = ErrorHandler.handleError(error);

            expect(result).toEqual({
                statusCode: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                message: 'An internal server error occurred',
                category: 'server',
                isOperational: false,
                timestamp: expect.any(String)
            });
        });

        test('should handle errors with custom status codes', () => {
            const error = new Error('Custom error');
            error.statusCode = 418; // I'm a teapot

            const result = ErrorHandler.handleError(error);

            expect(result.statusCode).toBe(418);
            expect(result.errorCode).toBe('CUSTOM_ERROR');
        });

        test('should sanitize sensitive information', () => {
            const error = new Error('Database connection failed: password=secret123');
            error.name = 'DatabaseError';

            const result = ErrorHandler.handleError(error);

            expect(result.message).toBe('Database operation failed');
            expect(result.message).not.toContain('secret123');
        });
    });

    describe('categorizeError method', () => {
        test('should categorize client errors (4xx)', () => {
            const clientErrorCodes = [400, 401, 403, 404, 409, 422, 429];

            clientErrorCodes.forEach(statusCode => {
                const error = new Error('Client error');
                error.statusCode = statusCode;

                const category = ErrorHandler.categorizeError(error);
                expect(category).toBe('client');
            });
        });

        test('should categorize server errors (5xx)', () => {
            const serverErrorCodes = [500, 502, 503, 504];

            serverErrorCodes.forEach(statusCode => {
                const error = new Error('Server error');
                error.statusCode = statusCode;

                const category = ErrorHandler.categorizeError(error);
                expect(category).toBe('server');
            });
        });

        test('should categorize unknown status codes as server errors', () => {
            const error = new Error('Unknown error');
            error.statusCode = 999;

            const category = ErrorHandler.categorizeError(error);
            expect(category).toBe('server');
        });

        test('should handle errors without status codes', () => {
            const error = new Error('Generic error');

            const category = ErrorHandler.categorizeError(error);
            expect(category).toBe('server');
        });
    });

    describe('isOperationalError method', () => {
        test('should identify operational errors', () => {
            const operationalErrors = [
                'ValidationError',
                'AuthenticationError',
                'AuthorizationError',
                'NotFoundError',
                'ConflictError',
                'RateLimitError',
                'DatabaseError',
                'ExternalServiceError'
            ];

            operationalErrors.forEach(errorName => {
                const error = new Error('Test error');
                error.name = errorName;

                const isOperational = ErrorHandler.isOperationalError(error);
                expect(isOperational).toBe(true);
            });
        });

        test('should identify non-operational errors', () => {
            const nonOperationalErrors = [
                'SyntaxError',
                'ReferenceError',
                'TypeError',
                'UnknownError',
                'WeirdError'
            ];

            nonOperationalErrors.forEach(errorName => {
                const error = new Error('Test error');
                error.name = errorName;

                const isOperational = ErrorHandler.isOperationalError(error);
                expect(isOperational).toBe(false);
            });
        });

        test('should handle errors with isOperational property', () => {
            const error = new Error('Custom operational error');
            error.isOperational = true;

            const isOperational = ErrorHandler.isOperationalError(error);
            expect(isOperational).toBe(true);
        });
    });

    describe('formatErrorForResponse method', () => {
        test('should format error for development environment', () => {
            process.env.NODE_ENV = 'development';
            
            const error = new Error('Detailed error message');
            error.stack = 'Error stack trace...';

            const formatted = ErrorHandler.formatErrorForResponse(error);

            expect(formatted).toEqual({
                success: false,
                message: 'Detailed error message',
                statusCode: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                details: {
                    stack: 'Error stack trace...',
                    name: 'Error'
                },
                timestamp: expect.any(String)
            });
        });

        test('should format error for production environment', () => {
            process.env.NODE_ENV = 'production';
            
            const error = new Error('Detailed error message');
            error.stack = 'Error stack trace...';

            const formatted = ErrorHandler.formatErrorForResponse(error);

            expect(formatted).toEqual({
                success: false,
                message: 'An internal server error occurred',
                statusCode: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                timestamp: expect.any(String)
            });

            expect(formatted.details).toBeUndefined();
        });

        test('should preserve client error messages in production', () => {
            process.env.NODE_ENV = 'production';
            
            const error = new Error('Invalid email format');
            error.name = 'ValidationError';
            error.statusCode = 400;

            const formatted = ErrorHandler.formatErrorForResponse(error);

            expect(formatted.message).toBe('Invalid email format');
        });
    });

    describe('logError method', () => {
        // Mock the Logger to test error logging
        const mockLogger = {
            error: jest.fn(),
            warn: jest.fn()
        };

        beforeEach(() => {
            jest.clearAllMocks();
            // Mock Logger.getInstance to return our mock
            jest.doMock('../../utils/logger', () => ({
                getInstance: () => mockLogger,
                logError: mockLogger.error
            }));
        });

        test('should log operational errors as warnings', () => {
            const error = new Error('Validation failed');
            error.name = 'ValidationError';

            ErrorHandler.logError(error, { userId: 123 });

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Operational error occurred',
                expect.objectContaining({
                    error: expect.objectContaining({
                        message: 'Validation failed',
                        name: 'ValidationError'
                    }),
                    context: { userId: 123 }
                })
            );
        });

        test('should log non-operational errors as errors', () => {
            const error = new Error('Unexpected error');
            error.name = 'TypeError';

            ErrorHandler.logError(error);

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Critical error occurred',
                expect.objectContaining({
                    error: expect.objectContaining({
                        message: 'Unexpected error',
                        name: 'TypeError'
                    })
                })
            );
        });
    });

    describe('Express middleware integration', () => {
        test('should provide Express error middleware', () => {
            const middleware = ErrorHandler.getExpressMiddleware();

            expect(typeof middleware).toBe('function');
            expect(middleware.length).toBe(4); // err, req, res, next
        });

        test('should handle errors via middleware', () => {
            const middleware = ErrorHandler.getExpressMiddleware();
            
            const error = new Error('Test error');
            const mockReq = { url: '/test', method: 'GET' };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const mockNext = jest.fn();

            middleware(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.any(String)
                })
            );
        });

        test('should handle validation errors with 400 status', () => {
            const middleware = ErrorHandler.getExpressMiddleware();
            
            const error = new Error('Validation failed');
            error.name = 'ValidationError';
            
            const mockReq = {};
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const mockNext = jest.fn();

            middleware(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('error recovery strategies', () => {
        test('should suggest recovery for database errors', () => {
            const error = new Error('Connection lost');
            error.name = 'DatabaseError';

            const result = ErrorHandler.handleError(error);

            expect(result.recovery).toEqual({
                strategy: 'retry',
                maxAttempts: 3,
                backoffMs: 1000
            });
        });

        test('should suggest recovery for external service errors', () => {
            const error = new Error('Service timeout');
            error.name = 'ExternalServiceError';

            const result = ErrorHandler.handleError(error);

            expect(result.recovery).toEqual({
                strategy: 'retry',
                maxAttempts: 2,
                backoffMs: 2000
            });
        });

        test('should not suggest recovery for client errors', () => {
            const error = new Error('Invalid input');
            error.name = 'ValidationError';

            const result = ErrorHandler.handleError(error);

            expect(result.recovery).toBeUndefined();
        });
    });

    describe('edge cases and error conditions', () => {
        test('should handle null error', () => {
            const result = ErrorHandler.handleError(null);

            expect(result).toEqual({
                statusCode: 500,
                errorCode: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred',
                category: 'server',
                isOperational: false,
                timestamp: expect.any(String)
            });
        });

        test('should handle undefined error', () => {
            const result = ErrorHandler.handleError(undefined);

            expect(result.statusCode).toBe(500);
            expect(result.errorCode).toBe('UNKNOWN_ERROR');
        });

        test('should handle string error', () => {
            const result = ErrorHandler.handleError('String error message');

            expect(result).toEqual({
                statusCode: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                message: 'String error message',
                category: 'server',
                isOperational: false,
                timestamp: expect.any(String)
            });
        });

        test('should handle object error without message', () => {
            const error = { code: 'CUSTOM_ERROR', data: 'some data' };

            const result = ErrorHandler.handleError(error);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('An unknown error occurred');
        });

        test('should handle circular references in error object', () => {
            const error = new Error('Circular error');
            error.circular = error;

            expect(() => ErrorHandler.handleError(error)).not.toThrow();
        });

        test('should handle very long error messages', () => {
            const longMessage = 'x'.repeat(10000);
            const error = new Error(longMessage);

            const result = ErrorHandler.handleError(error);

            expect(result.message.length).toBeLessThanOrEqual(1000); // Should be truncated
        });
    });

    afterEach(() => {
        // Reset NODE_ENV
        delete process.env.NODE_ENV;
    });
});
