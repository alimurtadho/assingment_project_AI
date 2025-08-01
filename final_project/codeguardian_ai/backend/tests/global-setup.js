/**
 * Global Test Setup
 * Runs once before all tests
 */

module.exports = async () => {
    // Set environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Use random port
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/codeguardian_test';
    process.env.OPENAI_API_KEY = 'test-api-key-mock';
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
    process.env.SESSION_SECRET = 'test-session-secret';
    process.env.LOG_LEVEL = 'error'; // Reduce log noise
    
    // Set up test database if needed
    try {
        // Here you would set up your test database
        // For now, we'll just log that we're starting tests
        console.log('🧪 Setting up test environment...');
        
        // You could add database setup here:
        // await setupTestDatabase();
        
        console.log('✅ Test environment ready');
    } catch (error) {
        console.error('❌ Failed to set up test environment:', error);
        throw error;
    }
};
