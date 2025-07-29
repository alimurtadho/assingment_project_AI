const express = require('express');
const multer = require('multer');
const { validateFileUpload } = require('../middleware/validation');
const testGenerator = require('../services/testGenerator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Generate tests endpoint
router.post('/generate', upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    const fileContent = buffer.toString('utf-8');
    const { testFramework = 'jest', testType = 'unit' } = req.body;
    
    console.log(`🧪 Generating tests for: ${originalname} (framework: ${testFramework})`);
    
    // Generate test cases
    const testResults = await testGenerator.generateTests(fileContent, originalname, {
      framework: testFramework,
      type: testType
    });
    
    // Save to database
    const result = await prisma.scanResult.create({
      data: {
        filename: originalname,
        fileContent: fileContent,
        scanType: 'test-generation',
        testCases: testResults,
        status: 'completed'
      }
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'test_generation',
        details: {
          filename: originalname,
          framework: testFramework,
          testCount: testResults.testCases?.length || 0
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      testId: result.id,
      filename: originalname,
      tests: testResults
    });
    
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get test results
router.get('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.scanResult.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        testCases: true,
        status: true,
        createdAt: true
      }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Test result not found' });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get test coverage analysis
router.post('/coverage', upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    const fileContent = buffer.toString('utf-8');
    
    console.log(`📊 Analyzing test coverage for: ${originalname}`);
    
    const coverageResults = await testGenerator.analyzeCoverage(fileContent, originalname);
    
    res.json({
      success: true,
      filename: originalname,
      coverage: coverageResults
    });
    
  } catch (error) {
    console.error('Coverage analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate integration tests
router.post('/integration', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer.toString('utf-8')
    }));
    
    console.log(`🔗 Generating integration tests for ${files.length} files`);
    
    const integrationTests = await testGenerator.generateIntegrationTests(files);
    
    res.json({
      success: true,
      files: files.map(f => f.filename),
      integrationTests
    });
    
  } catch (error) {
    console.error('Integration test generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
