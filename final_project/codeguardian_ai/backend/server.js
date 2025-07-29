const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const scanRoutes = require('./routes/scanRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/scan', scanRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      securityScanning: true,
      aiCodeReview: !!process.env.OPENAI_API_KEY,
      testGeneration: true,
      performanceAnalysis: true
    }
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'CodeGuardian AI',
    description: 'AI-Enhanced DevSecOps Platform',
    version: '1.0.0',
    author: 'Senior Software Engineer',
    features: [
      'Security Vulnerability Detection',
      'AI-Powered Code Review',
      'Automated Test Generation',
      'Performance Analysis',
      'CI/CD Integration'
    ],
    supportedLanguages: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 
      'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'
    ]
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Error handling middleware
app.use(globalErrorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'POST /api/scan/upload',
      'GET /api/scan/results',
      'GET /api/analysis/summary',
      'GET /api/dashboard/metrics'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CodeGuardian AI Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🤖 OpenAI Integration: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Mock Mode'}`);
  console.log(`📱 Access the application at: http://localhost:${PORT}`);
});

module.exports = app;
