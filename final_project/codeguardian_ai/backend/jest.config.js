/**
 * Jest Configuration for CodeGuardian AI Backend
 * Comprehensive testing setup with coverage reporting
 */
module.exports = {
    // Test environment
    testEnvironment: 'node',
    
    // Root directory for tests
    rootDir: '.',
    
    // Test match patterns
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/tests/**/*.spec.js'
    ],
    
    // Setup files
    setupFilesAfterEnv: [
        '<rootDir>/tests/setup.js'
    ],
    
    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'utils/**/*.js',
        'services/**/*.js',
        'routes/**/*.js',
        'src/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**',
        '!**/*.config.js',
        '!**/*.test.js',
        '!**/*.spec.js'
    ],
    
    // Coverage directory
    coverageDirectory: 'coverage',
    
    // Coverage reporters
    coverageReporters: [
        'text',
        'text-summary',
        'lcov',
        'html',
        'json',
        'cobertura'
    ],
    
    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 85,
            statements: 85
        },
        './utils/': {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95
        },
        './services/': {
            branches: 85,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    
    // Test timeout
    testTimeout: 30000,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Reset modules between tests
    resetModules: true,
    
    // Verbose output
    verbose: true,
    
    // Transform files
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // Module file extensions
    moduleFileExtensions: [
        'js',
        'json',
        'node'
    ],
    
    // Module paths
    modulePaths: [
        '<rootDir>'
    ],
    
    // Test result processor for custom reporting
    testResultsProcessor: '<rootDir>/tests/test-results-processor.js',
    
    // Custom reporters
    reporters: [
        'default'
        // Additional reporters can be added when packages are available
        // ['jest-junit', {
        //     outputDirectory: 'coverage',
        //     outputName: 'junit.xml',
        //     suiteName: 'CodeGuardian AI Backend Tests'
        // }]
    ],
    
    // Global setup and teardown
    globalSetup: '<rootDir>/tests/global-setup.js',
    globalTeardown: '<rootDir>/tests/global-teardown.js',
    
    // Watch plugins (removed due to compatibility issues)
    // watchPlugins: [
    //     'jest-watch-typeahead/filename',
    //     'jest-watch-typeahead/testname'
    // ],
    
    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0,
    
    // Force exit after tests complete
    forceExit: true,
    
    // Detect open handles
    detectOpenHandles: true,
    
    // Maximum worker processes
    maxWorkers: process.env.CI ? 2 : '50%',
    
    // Cache directory
    cacheDirectory: '<rootDir>/.jest-cache',
    
    // Error on deprecated features
    errorOnDeprecated: true,
    
    // Notify mode for watch
    notify: false,
    
    // Test name pattern for filtering
    // testNamePattern: undefined,
    
    // Test path ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/coverage/',
        '/dist/',
        '/build/'
    ],
    
    // Mock patterns
    // unmockedModulePathPatterns: [],
    
    // Watch ignore patterns
    watchPathIgnorePatterns: [
        '/node_modules/',
        '/coverage/',
        '/.git/'
    ],
    
    // Snapshot resolver
    // snapshotResolver: undefined,
    
    // Custom environment variables
    testEnvironmentOptions: {
        NODE_ENV: 'test'
    }
};
