const express = require('express');
const { validateFileUpload } = require('../middleware/validation');
const securityScanner = require('../services/securityScanner');
const prisma = require('../models/database');
const { upload } = require('../utils/fileProcessor');

const router = express.Router();

// Security scan endpoint
router.post('/scan', upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    const fileContent = buffer.toString('utf-8');
    
    console.log(`📁 Scanning file: ${originalname}`);
    
    // Perform security scan
    const scanResults = await securityScanner.scanCode(fileContent, originalname);
    
    // Save to database
    const result = await prisma.scanResult.create({
      data: {
        filename: originalname,
        fileContent: fileContent,
        scanType: 'security',
        vulnerabilities: scanResults.vulnerabilities,
        riskScore: scanResults.riskScore,
        status: 'completed'
      }
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'security_scan',
        details: {
          filename: originalname,
          vulnerabilityCount: scanResults.vulnerabilities.length,
          riskScore: scanResults.riskScore
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      scanId: result.id,
      filename: originalname,
      riskScore: scanResults.riskScore,
      vulnerabilities: scanResults.vulnerabilities,
      summary: scanResults.summary,
      recommendations: scanResults.recommendations
    });
    
  } catch (error) {
    console.error('Security scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scan results
router.get('/scan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.scanResult.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        scanType: true,
        vulnerabilities: true,
        riskScore: true,
        status: true,
        createdAt: true
      }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Scan result not found' });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Get scan result error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all scan results
router.get('/scans', async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;
    
    const where = type ? { scanType: type } : {};
    
    const results = await prisma.scanResult.findMany({
      where,
      select: {
        id: true,
        filename: true,
        scanType: true,
        riskScore: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });
    
    const total = await prisma.scanResult.count({ where });
    
    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get scan results error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
