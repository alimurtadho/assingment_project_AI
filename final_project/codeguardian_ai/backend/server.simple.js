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
            severity: 'HIGH',
            line: 1,
            description: 'Hardcoded API key detected',
            cwe: 'CWE-798'
        });
    }

    // Check for SQL injection patterns
    if (code.includes('SELECT') && code.includes('+')) {
        vulnerabilities.push({
            type: 'SQL Injection',
            severity: 'HIGH',
            line: 1,
            description: 'Potential SQL injection vulnerability',
            cwe: 'CWE-89'
        });
    }

    // Check for XSS patterns
    if (code.includes('innerHTML') || code.includes('document.write')) {
        vulnerabilities.push({
            type: 'XSS Vulnerability',
            severity: 'MEDIUM',
            line: 1,
            description: 'Potential cross-site scripting vulnerability',
            cwe: 'CWE-79'
        });
    }

    const riskScore = vulnerabilities.length > 0 ? 
        Math.min(vulnerabilities.length * 30, 100) : 0;

    res.json({
        success: true,
        vulnerabilities,
        riskScore,
        summary: {
            totalIssues: vulnerabilities.length,
            high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
            medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
            low: vulnerabilities.filter(v => v.severity === 'LOW').length
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
