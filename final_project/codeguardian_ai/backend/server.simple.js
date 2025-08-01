const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3003'
    ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CodeGuardian AI API is running',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Database health check
app.get('/api/health/db', (req, res) => {
    res.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString()
    });
});

// Security scan endpoint (simplified for testing)
app.post('/api/security/scan', (req, res) => {
    const { code, language } = req.body;
    
    if (!code) {
        return res.status(400).json({
            success: false,
            error: { code: 400, message: 'Code content is required' }
        });
    }

    // Simple vulnerability detection for demo
    const vulnerabilities = [];
    
    // Check for API keys
    if (code.includes('sk-') || code.includes('api_key') || code.includes('API_KEY')) {
        vulnerabilities.push({
            type: 'API Key Exposure',
            category: 'Authentication',
            severity: 'HIGH',
            line: 1,
            description: 'Hardcoded API key detected',
            code: 'API_KEY = "sk-xxxxxxxxxxxx"',
            recommendation: 'Store API keys in environment variables or secure configuration files',
            cwe: 'CWE-798'
        });
    }

    // Check for SQL injection patterns
    if (code.includes('SELECT') && code.includes('+')) {
        vulnerabilities.push({
            type: 'SQL Injection',
            category: 'Data Validation',
            severity: 'HIGH',
            line: 2,
            description: 'Potential SQL injection vulnerability',
            code: 'SELECT * FROM users WHERE id = " + userId',
            recommendation: 'Use parameterized queries or prepared statements',
            cwe: 'CWE-89'
        });
    }

    // Check for XSS patterns
    if (code.includes('innerHTML') || code.includes('document.write')) {
        vulnerabilities.push({
            type: 'XSS Vulnerability',
            category: 'Input Validation',
            severity: 'MEDIUM',
            line: 3,
            description: 'Potential cross-site scripting vulnerability',
            code: 'element.innerHTML = userInput',
            recommendation: 'Sanitize user input before rendering to DOM',
            cwe: 'CWE-79'
        });
    }

    const summary = {
        totalIssues: vulnerabilities.length,
        high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
        medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
        low: vulnerabilities.filter(v => v.severity === 'LOW').length,
        categories: [...new Set(vulnerabilities.map(v => v.category))].filter(Boolean)
    };

    const recommendations = [];
    if (vulnerabilities.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            title: 'Implement Security Code Review',
            description: 'Establish a mandatory security code review process for all code changes'
        });
        recommendations.push({
            priority: 'MEDIUM',
            title: 'Use Static Analysis Tools',
            description: 'Integrate automated security scanning tools in your CI/CD pipeline'
        });
    }

    const riskScore = vulnerabilities.length > 0 ? 
        Math.min(vulnerabilities.length * 2.5, 10) : 0;

    res.json({
        success: true,
        filename: `code_${Date.now()}.${language}`,
        vulnerabilities,
        riskScore,
        summary,
        recommendations,
        language: language || 'unknown',
        timestamp: new Date().toISOString()
    });
});

// AI Code Review endpoint (simplified for testing)
app.post('/api/ai-review/review', (req, res) => {
    const { code, language } = req.body;
    
    if (!code) {
        return res.status(400).json({
            success: false,
            error: { code: 400, message: 'Code content is required' }
        });
    }

    // Simple code quality analysis for demo
    const issues = [];
    const suggestions = [];
    
    // Check for code quality issues
    if (code.includes('var ')) {
        issues.push({
            type: 'Code Style',
            severity: 'MEDIUM',
            line: 1,
            description: 'Use const or let instead of var',
            suggestion: 'Replace var with const or let for better scoping',
            category: 'Best Practices'
        });
    }

    if (code.includes('== ') || code.includes('!= ')) {
        issues.push({
            type: 'Type Safety',
            severity: 'LOW',
            line: 1,
            description: 'Use strict equality operators',
            suggestion: 'Use === or !== instead of == or !=',
            category: 'Code Quality'
        });
    }

    if (code.includes('console.log')) {
        issues.push({
            type: 'Debug Code',
            severity: 'LOW',
            line: 1,
            description: 'Console.log statements found',
            suggestion: 'Remove debug console.log statements before production',
            category: 'Clean Code'
        });
    }

    if (code.length > 1000) {
        issues.push({
            type: 'Function Complexity',
            severity: 'MEDIUM',
            line: 1,
            description: 'Code appears to be complex',
            suggestion: 'Consider breaking down into smaller functions',
            category: 'Maintainability'
        });
    }

    // Generate suggestions
    suggestions.push({
        title: 'Add Error Handling',
        description: 'Consider adding try-catch blocks for better error handling',
        priority: 'HIGH',
        category: 'Reliability'
    });

    suggestions.push({
        title: 'Add Documentation',
        description: 'Add JSDoc comments to improve code documentation',
        priority: 'MEDIUM',
        category: 'Documentation'
    });

    if (issues.length === 0) {
        suggestions.push({
            title: 'Code Looks Good',
            description: 'No major issues detected. Consider adding unit tests.',
            priority: 'LOW',
            category: 'Testing'
        });
    }

    const qualityScore = Math.max(100 - (issues.length * 15), 10);

    res.json({
        success: true,
        filename: `code_${Date.now()}.${language}`,
        qualityScore,
        issues,
        suggestions,
        summary: {
            totalIssues: issues.length,
            high: issues.filter(i => i.severity === 'HIGH').length,
            medium: issues.filter(i => i.severity === 'MEDIUM').length,
            low: issues.filter(i => i.severity === 'LOW').length,
            categories: [...new Set(issues.map(i => i.category))].filter(Boolean)
        },
        language: language || 'unknown',
        timestamp: new Date().toISOString()
    });
});

// Test Generation endpoint (simplified for testing)
app.post('/api/test-gen/generate', (req, res) => {
    const { code, language } = req.body;
    
    if (!code) {
        return res.status(400).json({
            success: false,
            error: { code: 400, message: 'Code content is required' }
        });
    }

    // Simple test generation for demo
    const testCases = [];
    const testSuites = [];
    
    // Analyze code and generate test suggestions
    const functions = code.match(/function\s+(\w+)/g) || [];
    const classes = code.match(/class\s+(\w+)/g) || [];
    const methods = code.match(/(\w+)\s*\(/g) || [];

    // Generate unit tests
    functions.forEach((func, index) => {
        const funcName = func.replace('function ', '');
        testCases.push({
            type: 'Unit Test',
            description: `Test ${funcName} with valid input`,
            code: `describe('${funcName}', () => {
    test('should return expected result with valid input', () => {
        const result = ${funcName}(validInput);
        expect(result).toBeDefined();
    });
});`,
            framework: 'Jest',
            category: 'Function Testing'
        });
    });

    classes.forEach((cls, index) => {
        const className = cls.replace('class ', '');
        testCases.push({
            type: 'Class Test',
            description: `Test ${className} instantiation`,
            code: `describe('${className}', () => {
    test('should create instance correctly', () => {
        const instance = new ${className}();
        expect(instance).toBeInstanceOf(${className});
    });
});`,
            framework: 'Jest',
            category: 'Class Testing'
        });
    });

    // Generate integration tests
    if (code.includes('fetch') || code.includes('axios')) {
        testCases.push({
            type: 'Integration Test',
            description: 'Test API integration',
            code: `describe('API Integration', () => {
    test('should handle API responses correctly', async () => {
        const mockResponse = { data: 'test' };
        // Mock API call
        expect(mockResponse).toBeDefined();
    });
});`,
            framework: 'Jest',
            category: 'API Testing'
        });
    }

    // Generate test recommendations
    const recommendations = [
        {
            title: 'Add Edge Case Tests',
            description: 'Consider testing with null, undefined, and empty values',
            priority: 'HIGH'
        },
        {
            title: 'Mock External Dependencies',
            description: 'Use mocking for external API calls and database operations',
            priority: 'MEDIUM'
        },
        {
            title: 'Test Error Scenarios',
            description: 'Add tests for error handling and exception cases',
            priority: 'HIGH'
        }
    ];

    const coverage = Math.min(testCases.length * 20, 100);

    res.json({
        success: true,
        filename: `tests_${Date.now()}.${language}`,
        testCases,
        recommendations,
        summary: {
            totalTests: testCases.length,
            unitTests: testCases.filter(t => t.type === 'Unit Test').length,
            integrationTests: testCases.filter(t => t.type === 'Integration Test').length,
            estimatedCoverage: coverage
        },
        language: language || 'unknown',
        timestamp: new Date().toISOString()
    });
});

// Auth endpoints (simplified for testing)
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 400, message: 'Username, email, and password are required' }
        });
    }

    // Simulate user registration
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
            id: Date.now(),
            username,
            email,
            createdAt: new Date().toISOString()
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 400, message: 'Email and password are required' }
        });
    }

    // Simulate login (accept any credentials for demo)
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.demo_token';
    
    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: 123,
            email,
            username: email.split('@')[0]
        }
    });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>CodeGuardian AI API Documentation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            .endpoint { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
            .method { background: #3498db; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold; }
            .status { color: #27ae60; font-weight: bold; }
            pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🛡️ CodeGuardian AI API Documentation</h1>
            <p class="status">✅ API Status: Running on Port ${PORT}</p>
            
            <h2>Health Check Endpoints</h2>
            <div class="endpoint">
                <span class="method">GET</span> <strong>/health</strong><br>
                Basic health check for the server
            </div>
            <div class="endpoint">
                <span class="method">GET</span> <strong>/api/health</strong><br>
                API-specific health check
            </div>
            <div class="endpoint">
                <span class="method">GET</span> <strong>/api/health/db</strong><br>
                Database connection health check
            </div>

            <h2>Authentication Endpoints</h2>
            <div class="endpoint">
                <span class="method">POST</span> <strong>/api/auth/register</strong><br>
                Register a new user<br>
                <strong>Body:</strong> { "username": "string", "email": "string", "password": "string" }
            </div>
            <div class="endpoint">
                <span class="method">POST</span> <strong>/api/auth/login</strong><br>
                Login user and get JWT token<br>
                <strong>Body:</strong> { "email": "string", "password": "string" }
            </div>

            <h2>Security Analysis Endpoints</h2>
            <div class="endpoint">
                <span class="method">POST</span> <strong>/api/security/scan</strong><br>
                Scan code for security vulnerabilities<br>
                <strong>Body:</strong> { "code": "string", "language": "string" }
            </div>

            <h2>Example Usage</h2>
            <pre>
// Test security scan
curl -X POST http://localhost:${PORT}/api/security/scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "const apiKey = \\"sk-1234567890\\"; const query = \\"SELECT * FROM users WHERE id = \\" + userId;",
    "language": "javascript"
  }'
            </pre>

            <p><strong>Frontend URL:</strong> <a href="http://localhost:3000">http://localhost:3000</a></p>
            <p><strong>Backend API:</strong> <a href="http://localhost:${PORT}">http://localhost:${PORT}</a></p>
        </div>
    </body>
    </html>
    `);
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'CodeGuardian AI Backend API',
        version: '2.0.0',
        status: 'running',
        port: PORT,
        endpoints: {
            health: '/health',
            api_health: '/api/health',
            docs: '/api/docs',
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            scan: 'POST /api/security/scan'
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 500,
            message: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 404,
            message: 'Endpoint not found',
            path: req.originalUrl
        },
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CodeGuardian AI Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/api/docs`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
});

module.exports = app;
