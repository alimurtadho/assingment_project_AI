const express = require('express');
const multer = require('multer');
const { validateFileUpload } = require('../middleware/validation');
const aiReviewer = require('../services/aiReviewer');
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

// AI code review endpoint
router.post('/review', upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    const fileContent = buffer.toString('utf-8');
    
    console.log(`🤖 AI reviewing file: ${originalname}`);
    
    // Perform AI code review
    const reviewResults = await aiReviewer.reviewCode(fileContent, originalname);
    
    // Save to database
    const result = await prisma.scanResult.create({
      data: {
        filename: originalname,
        fileContent: fileContent,
        scanType: 'ai-review',
        codeReview: reviewResults,
        status: 'completed'
      }
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ai_review',
        details: {
          filename: originalname,
          issuesFound: reviewResults.issues?.length || 0
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      reviewId: result.id,
      filename: originalname,
      review: reviewResults
    });
    
  } catch (error) {
    console.error('AI review error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get review results
router.get('/review/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.scanResult.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        codeReview: true,
        status: true,
        createdAt: true
      }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Review result not found' });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Get review result error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refactor code suggestions
router.post('/refactor', upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    const fileContent = buffer.toString('utf-8');
    const { focusArea } = req.body; // 'performance', 'readability', 'security', etc.
    
    console.log(`🔧 AI refactoring file: ${originalname} (focus: ${focusArea || 'general'})`);
    
    const refactorResults = await aiReviewer.suggestRefactoring(fileContent, originalname, focusArea);
    
    res.json({
      success: true,
      filename: originalname,
      refactoring: refactorResults
    });
    
  } catch (error) {
    console.error('AI refactor error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
