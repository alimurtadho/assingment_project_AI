/**
 * Global Test Teardown
 * Runs once after all tests complete
 */

module.exports = async () => {
    // Clean up test environment
    try {
        console.log('🧹 Cleaning up test environment...');
        
        // Close database connections
        // await closeTestDatabase();
        
        // Clean up temporary files
        // await cleanupTempFiles();
        
        // Reset environment variables
        delete process.env.DATABASE_URL;
        delete process.env.OPENAI_API_KEY;
        delete process.env.JWT_SECRET;
        delete process.env.SESSION_SECRET;
        
        console.log('✅ Test environment cleaned up');
    } catch (error) {
        console.error('❌ Failed to clean up test environment:', error);
        // Don't throw here to avoid masking test failures
    }
};
