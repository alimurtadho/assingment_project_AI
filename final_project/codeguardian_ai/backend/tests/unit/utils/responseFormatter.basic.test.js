/**
 * Basic unit tests for ResponseFormatter utility
 * Tests the actual implementation that exists
 */

const ResponseFormatter = require('../../../utils/responseFormatter');

describe('ResponseFormatter Utility - Basic Tests', () => {
    describe('success method', () => {
        test('should create success response with data and default message', () => {
            const data = { id: 1, name: 'test' };
            
            const result = ResponseFormatter.success(data);
            
            expect(result).toEqual({
                success: true,
                message: 'Success',
                data,
                timestamp: expect.any(String)
            });
        });

        test('should create success response with data and custom message', () => {
            const data = { users: [] };
            const message = 'Users retrieved successfully';
            
            const result = ResponseFormatter.success(data, message);
            
            expect(result).toEqual({
                success: true,
                message,
                data,
                timestamp: expect.any(String)
            });
        });

        test('should handle null data', () => {
            const result = ResponseFormatter.success(null);
            
            expect(result.success).toBe(true);
            expect(result.data).toBeNull();
            expect(result.message).toBe('Success');
        });
    });

    describe('error method', () => {
        test('should create error response with default parameters', () => {
            const message = 'Something went wrong';
            
            const result = ResponseFormatter.error(message);
            
            expect(result).toEqual({
                success: false,
                message,
                error: {
                    code: 500,
                    details: null
                },
                timestamp: expect.any(String)
            });
        });

        test('should create error response with custom code and details', () => {
            const message = 'Validation failed';
            const code = 400;
            const details = { field: 'email', issue: 'invalid format' };
            
            const result = ResponseFormatter.error(message, code, details);
            
            expect(result).toEqual({
                success: false,
                message,
                error: {
                    code,
                    details
                },
                timestamp: expect.any(String)
            });
        });
    });

    describe('paginated method', () => {
        test('should create paginated response', () => {
            const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const pagination = {
                page: 1,
                limit: 10,
                total: 25
            };
            
            const result = ResponseFormatter.paginated(data, pagination);
            
            expect(result).toEqual({
                success: true,
                data,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 25,
                    totalPages: 3
                },
                timestamp: expect.any(String)
            });
        });

        test('should calculate totalPages correctly', () => {
            const data = [];
            const pagination = {
                page: 1,
                limit: 10,
                total: 23 // Should result in 3 pages
            };
            
            const result = ResponseFormatter.paginated(data, pagination);
            
            expect(result.pagination.totalPages).toBe(3);
        });
    });

    describe('timestamp handling', () => {
        test('should generate valid ISO timestamp', () => {
            const result = ResponseFormatter.success({});
            
            expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(() => new Date(result.timestamp)).not.toThrow();
        });
    });
});
