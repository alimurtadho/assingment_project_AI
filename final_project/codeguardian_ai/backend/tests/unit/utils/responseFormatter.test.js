/**
 * Unit Tests for ResponseFormatter Utility
 * Tests all methods and edge cases for API response formatting
 */

const ResponseFormatter = require('../../../utils/responseFormatter');

describe('ResponseFormatter Utility', () => {
    describe('success method', () => {
        test('should create success response with data', () => {
            const message = 'Operation successful';
            const data = { id: 1, name: 'test' };
            
            const result = ResponseFormatter.success(message, data);
            
            expect(result).toEqual({
                success: true,
                message,
                data,
                timestamp: expect.any(String)
            });
            
            // Verify timestamp is a valid ISO string
            expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        });

        test('should create success response without data', () => {
            const message = 'Operation successful';
            
            const result = ResponseFormatter.success(message);
            
            expect(result).toEqual({
                success: true,
                message,
                data: null,
                timestamp: expect.any(String)
            });
        });

        test('should handle null message', () => {
            const result = ResponseFormatter.success(null, { test: 'data' });
            
            expect(result.success).toBe(true);
            expect(result.message).toBeNull();
            expect(result.data).toEqual({ test: 'data' });
        });

        test('should handle empty object data', () => {
            const result = ResponseFormatter.success('Success', {});
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({});
        });
    });

    describe('error method', () => {
        test('should create error response with all parameters', () => {
            const message = 'Validation failed';
            const statusCode = 400;
            const errorCode = 'VALIDATION_ERROR';
            const details = { field: 'email', issue: 'invalid format' };
            
            const result = ResponseFormatter.error(message, statusCode, errorCode, details);
            
            expect(result).toEqual({
                success: false,
                message,
                statusCode,
                errorCode,
                details,
                timestamp: expect.any(String)
            });
        });

        test('should create error response with minimal parameters', () => {
            const message = 'Something went wrong';
            
            const result = ResponseFormatter.error(message);
            
            expect(result).toEqual({
                success: false,
                message,
                statusCode: 500,
                errorCode: 'INTERNAL_ERROR',
                details: null,
                timestamp: expect.any(String)
            });
        });

        test('should handle custom status codes', () => {
            const testCases = [
                { statusCode: 400, expectedCode: 'VALIDATION_ERROR' },
                { statusCode: 401, expectedCode: 'UNAUTHORIZED' },
                { statusCode: 403, expectedCode: 'FORBIDDEN' },
                { statusCode: 404, expectedCode: 'NOT_FOUND' },
                { statusCode: 409, expectedCode: 'CONFLICT' },
                { statusCode: 429, expectedCode: 'RATE_LIMIT_EXCEEDED' },
                { statusCode: 500, expectedCode: 'INTERNAL_ERROR' }
            ];

            testCases.forEach(({ statusCode, expectedCode }) => {
                const result = ResponseFormatter.error('Test error', statusCode);
                expect(result.statusCode).toBe(statusCode);
                expect(result.errorCode).toBe(expectedCode);
            });
        });

        test('should handle unknown status codes', () => {
            const result = ResponseFormatter.error('Unknown error', 418);
            
            expect(result.statusCode).toBe(418);
            expect(result.errorCode).toBe('UNKNOWN_ERROR');
        });
    });

    describe('paginated method', () => {
        test('should create paginated response with full pagination info', () => {
            const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const pagination = {
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3
            };
            const message = 'Data retrieved successfully';
            
            const result = ResponseFormatter.paginated(data, pagination, message);
            
            expect(result).toEqual({
                success: true,
                message,
                data,
                pagination: {
                    ...pagination,
                    hasNext: true,
                    hasPrev: false
                },
                metadata: {
                    count: data.length,
                    hasData: true
                },
                timestamp: expect.any(String)
            });
        });

        test('should calculate hasNext and hasPrev correctly', () => {
            const data = [{ id: 1 }];
            
            // First page
            const firstPage = ResponseFormatter.paginated(data, {
                page: 1, limit: 10, total: 25, totalPages: 3
            });
            expect(firstPage.pagination.hasNext).toBe(true);
            expect(firstPage.pagination.hasPrev).toBe(false);
            
            // Middle page
            const middlePage = ResponseFormatter.paginated(data, {
                page: 2, limit: 10, total: 25, totalPages: 3
            });
            expect(middlePage.pagination.hasNext).toBe(true);
            expect(middlePage.pagination.hasPrev).toBe(true);
            
            // Last page
            const lastPage = ResponseFormatter.paginated(data, {
                page: 3, limit: 10, total: 25, totalPages: 3
            });
            expect(lastPage.pagination.hasNext).toBe(false);
            expect(lastPage.pagination.hasPrev).toBe(true);
        });

        test('should handle empty data array', () => {
            const data = [];
            const pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
            
            const result = ResponseFormatter.paginated(data, pagination);
            
            expect(result.data).toEqual([]);
            expect(result.metadata.hasData).toBe(false);
            expect(result.metadata.count).toBe(0);
        });

        test('should use default message when not provided', () => {
            const data = [{ id: 1 }];
            const pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };
            
            const result = ResponseFormatter.paginated(data, pagination);
            
            expect(result.message).toBe('Data retrieved successfully');
        });
    });

    describe('validation method', () => {
        test('should create validation error response', () => {
            const errors = [
                { field: 'email', message: 'Email is required' },
                { field: 'password', message: 'Password too short' }
            ];
            
            const result = ResponseFormatter.validation(errors);
            
            expect(result).toEqual({
                success: false,
                message: 'Validation failed',
                statusCode: 400,
                errorCode: 'VALIDATION_ERROR',
                details: {
                    errors,
                    errorCount: 2
                },
                timestamp: expect.any(String)
            });
        });

        test('should handle single error object', () => {
            const error = { field: 'name', message: 'Name is required' };
            
            const result = ResponseFormatter.validation(error);
            
            expect(result.details.errors).toEqual([error]);
            expect(result.details.errorCount).toBe(1);
        });

        test('should handle empty errors array', () => {
            const result = ResponseFormatter.validation([]);
            
            expect(result.details.errors).toEqual([]);
            expect(result.details.errorCount).toBe(0);
        });
    });

    describe('created method', () => {
        test('should create resource created response', () => {
            const resource = { id: 123, name: 'New Resource' };
            const location = '/api/resources/123';
            
            const result = ResponseFormatter.created(resource, location);
            
            expect(result).toEqual({
                success: true,
                message: 'Resource created successfully',
                data: resource,
                statusCode: 201,
                location,
                timestamp: expect.any(String)
            });
        });

        test('should work without location', () => {
            const resource = { id: 123 };
            
            const result = ResponseFormatter.created(resource);
            
            expect(result.statusCode).toBe(201);
            expect(result.location).toBeUndefined();
        });
    });

    describe('updated method', () => {
        test('should create resource updated response', () => {
            const resource = { id: 123, name: 'Updated Resource', version: 2 };
            
            const result = ResponseFormatter.updated(resource);
            
            expect(result).toEqual({
                success: true,
                message: 'Resource updated successfully',
                data: resource,
                statusCode: 200,
                timestamp: expect.any(String)
            });
        });
    });

    describe('deleted method', () => {
        test('should create resource deleted response', () => {
            const result = ResponseFormatter.deleted();
            
            expect(result).toEqual({
                success: true,
                message: 'Resource deleted successfully',
                data: null,
                statusCode: 204,
                timestamp: expect.any(String)
            });
        });

        test('should handle custom message', () => {
            const customMessage = 'User account has been permanently deleted';
            
            const result = ResponseFormatter.deleted(customMessage);
            
            expect(result.message).toBe(customMessage);
        });
    });

    describe('timestamp handling', () => {
        test('should generate ISO timestamp', () => {
            const result = ResponseFormatter.success('Test');
            
            expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        test('should generate unique timestamps for concurrent calls', async () => {
            const promises = Array(10).fill().map(() => 
                Promise.resolve(ResponseFormatter.success('Test'))
            );
            
            const results = await Promise.all(promises);
            const timestamps = results.map(r => r.timestamp);
            
            // All timestamps should be unique or very close
            const uniqueTimestamps = new Set(timestamps);
            expect(uniqueTimestamps.size).toBeGreaterThan(1);
        });
    });

    describe('edge cases and error conditions', () => {
        test('should handle circular reference in data', () => {
            const circular = { name: 'test' };
            circular.self = circular;
            
            // Should not throw an error
            expect(() => {
                ResponseFormatter.success('Test', circular);
            }).not.toThrow();
        });

        test('should handle very large objects', () => {
            const largeObject = {
                data: Array(1000).fill().map((_, i) => ({ id: i, value: `item_${i}` }))
            };
            
            const result = ResponseFormatter.success('Large data', largeObject);
            
            expect(result.success).toBe(true);
            expect(result.data.data).toHaveLength(1000);
        });

        test('should handle special characters in messages', () => {
            const message = 'Message with émojis 🚀 and spëcial chars: @#$%^&*()';
            
            const result = ResponseFormatter.success(message);
            
            expect(result.message).toBe(message);
        });

        test('should handle undefined and null values properly', () => {
            const testCases = [
                { input: undefined, expected: null },
                { input: null, expected: null },
                { input: '', expected: '' },
                { input: 0, expected: 0 },
                { input: false, expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = ResponseFormatter.success('Test', input);
                expect(result.data).toBe(expected);
            });
        });
    });
});
