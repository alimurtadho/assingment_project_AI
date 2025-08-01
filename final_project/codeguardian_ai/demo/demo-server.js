#!/usr/bin/env node

/**
 * CodeGuardian AI - Demo Web Server
 * Simple web server to display demo results
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const RESULTS_DIR = path.join(__dirname, 'demo-results');

class DemoWebServer {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(PORT, () => {
      console.log(`🌐 CodeGuardian AI Demo Server running at:`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`   HTML Report: http://localhost:${PORT}/report.html`);
      console.log(`   JSON Data: http://localhost:${PORT}/api/results`);
      console.log(`\n✨ Press Ctrl+C to stop the server`);
    });

    // Handle shutdown gracefully
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down demo server...');
      this.server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      });
    });
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      switch (pathname) {
        case '/':
          this.serveHomePage(res);
          break;
        case '/report.html':
          this.serveHTMLReport(res);
          break;
        case '/api/results':
          this.serveJSONResults(res);
          break;
        case '/api/health':
          this.serveHealthCheck(res);
          break;
        default:
          this.serve404(res);
      }
    } catch (error) {
      this.serveError(res, error);
    }
  }

  serveHomePage(res) {
    const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGuardian AI - Demo Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; text-align: center; color: white; }
        .logo { font-size: 4em; margin-bottom: 20px; }
        .title { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .subtitle { font-size: 1.2em; margin-bottom: 40px; opacity: 0.9; }
        .nav-buttons { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .btn { display: inline-block; padding: 15px 30px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 8px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); transition: all 0.3s; }
        .btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        .features { margin-top: 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .feature { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; backdrop-filter: blur(10px); }
        .feature-icon { font-size: 2em; margin-bottom: 15px; }
        .footer { margin-top: 60px; opacity: 0.7; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🛡️</div>
        <h1 class="title">CodeGuardian AI</h1>
        <p class="subtitle">Demo Implementation Dashboard</p>
        
        <div class="nav-buttons">
            <a href="/report.html" class="btn">📊 View Security Report</a>
            <a href="/api/results" class="btn">📋 Raw JSON Data</a>
            <a href="/api/health" class="btn">❤️ Health Check</a>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🔍</div>
                <h3>Security Scanning</h3>
                <p>Automated detection of security vulnerabilities in your code</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📊</div>
                <h3>Risk Assessment</h3>
                <p>Comprehensive risk scoring and severity analysis</p>
            </div>
            <div class="feature">
                <div class="feature-icon">💡</div>
                <h3>Smart Recommendations</h3>
                <p>AI-powered suggestions for fixing security issues</p>
            </div>
        </div>
        
        <div class="footer">
            <p>🚀 Demo Implementation | Generated: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(homePage);
  }

  serveHTMLReport(res) {
    const reportPath = path.join(RESULTS_DIR, 'demo-report.html');
    
    if (!fs.existsSync(reportPath)) {
      this.serve404(res, 'HTML report not found. Please run the demo first.');
      return;
    }

    const htmlContent = fs.readFileSync(reportPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  }

  serveJSONResults(res) {
    const jsonPath = path.join(RESULTS_DIR, 'demo-report.json');
    
    if (!fs.existsSync(jsonPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Results not found. Please run the demo first.' }));
      return;
    }

    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(jsonContent);
  }

  serveHealthCheck(res) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'CodeGuardian AI Demo Server',
      version: '1.0.0',
      port: PORT,
      uptime: process.uptime()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  serve404(res, message = 'Page not found') {
    const notFoundPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #e74c3c; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>404 - Not Found</h1>
    <p>${message}</p>
    <p><a href="/">← Back to Dashboard</a></p>
</body>
</html>`;

    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(notFoundPage);
  }

  serveError(res, error) {
    console.error('Server error:', error);
    
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }));
  }
}

// Start server if called directly
if (require.main === module) {
  const server = new DemoWebServer();
  server.start();
}

module.exports = DemoWebServer;
