const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Get dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      totalScans: Math.floor(Math.random() * 1000) + 500,
      vulnerabilitiesFound: Math.floor(Math.random() * 200) + 50,
      securityScore: Math.floor(Math.random() * 30) + 70,
      codeQualityScore: Math.floor(Math.random() * 20) + 75,
      testsGenerated: Math.floor(Math.random() * 500) + 200,
      performanceIssues: Math.floor(Math.random() * 50) + 10,
      lastScanTime: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24h
      activeProjects: Math.floor(Math.random() * 20) + 5,
      teamMembers: Math.floor(Math.random() * 15) + 3,
      uptime: '99.9%'
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get historical trends
router.get('/trends', (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Generate mock trend data
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const trends = {
      securityTrends: [],
      qualityTrends: [],
      vulnerabilityTrends: [],
      performanceTrends: []
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.securityTrends.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 20) + 70
      });
      
      trends.qualityTrends.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 15) + 75
      });
      
      trends.vulnerabilityTrends.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 2
      });
      
      trends.performanceTrends.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 25) + 65
      });
    }
    
    res.json(trends);
  } catch (error) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get summary statistics
router.get('/summary', (req, res) => {
  try {
    const summary = {
      totalProjects: Math.floor(Math.random() * 50) + 20,
      totalFiles: Math.floor(Math.random() * 5000) + 1000,
      totalLinesOfCode: Math.floor(Math.random() * 500000) + 100000,
      languageDistribution: {
        'JavaScript': Math.floor(Math.random() * 30) + 25,
        'TypeScript': Math.floor(Math.random() * 25) + 20,
        'Python': Math.floor(Math.random() * 20) + 15,
        'Java': Math.floor(Math.random() * 15) + 10,
        'C++': Math.floor(Math.random() * 10) + 5,
        'Other': Math.floor(Math.random() * 10) + 5
      },
      vulnerabilityCategories: {
        'Injection': Math.floor(Math.random() * 20) + 10,
        'Broken Authentication': Math.floor(Math.random() * 15) + 8,
        'Sensitive Data Exposure': Math.floor(Math.random() * 12) + 6,
        'XML External Entities': Math.floor(Math.random() * 8) + 3,
        'Broken Access Control': Math.floor(Math.random() * 10) + 5,
        'Security Misconfiguration': Math.floor(Math.random() * 15) + 7,
        'Cross-Site Scripting': Math.floor(Math.random() * 18) + 9,
        'Other': Math.floor(Math.random() * 10) + 4
      },
      recentActivity: generateRecentActivity(),
      topIssues: [
        {
          type: 'SQL Injection',
          count: Math.floor(Math.random() * 20) + 10,
          severity: 'high'
        },
        {
          type: 'Cross-Site Scripting',
          count: Math.floor(Math.random() * 15) + 8,
          severity: 'medium'
        },
        {
          type: 'Insecure Direct Object Reference',
          count: Math.floor(Math.random() * 12) + 6,
          severity: 'high'
        },
        {
          type: 'Security Misconfiguration',
          count: Math.floor(Math.random() * 18) + 9,
          severity: 'medium'
        },
        {
          type: 'Sensitive Data Exposure',
          count: Math.floor(Math.random() * 10) + 5,
          severity: 'critical'
        }
      ]
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time activity feed
router.get('/activity', (req, res) => {
  try {
    const activity = generateRecentActivity(20);
    res.json(activity);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate recent activity
function generateRecentActivity(count = 10) {
  const activities = [];
  const types = ['scan', 'review', 'test', 'performance', 'fix'];
  const statuses = ['completed', 'in-progress', 'failed'];
  const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
  const projects = ['ProjectA', 'ProjectB', 'ProjectC', 'ProjectD', 'ProjectE'];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    const timestamp = new Date(Date.now() - Math.random() * 3600000); // Random time in last hour
    
    activities.push({
      id: uuidv4(),
      type: type,
      status: status,
      user: user,
      project: project,
      description: getActivityDescription(type, status, user, project),
      timestamp: timestamp.toISOString(),
      details: {
        duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        filesProcessed: Math.floor(Math.random() * 20) + 1,
        issuesFound: type === 'scan' ? Math.floor(Math.random() * 10) + 1 : null
      }
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getActivityDescription(type, status, user, project) {
  const descriptions = {
    scan: {
      completed: `${user} completed security scan for ${project}`,
      'in-progress': `${user} is running security scan on ${project}`,
      failed: `Security scan failed for ${project} by ${user}`
    },
    review: {
      completed: `${user} finished AI code review for ${project}`,
      'in-progress': `${user} is reviewing code in ${project}`,
      failed: `Code review failed for ${project} by ${user}`
    },
    test: {
      completed: `${user} generated test cases for ${project}`,
      'in-progress': `${user} is generating tests for ${project}`,
      failed: `Test generation failed for ${project} by ${user}`
    },
    performance: {
      completed: `${user} analyzed performance of ${project}`,
      'in-progress': `${user} is analyzing performance of ${project}`,
      failed: `Performance analysis failed for ${project} by ${user}`
    },
    fix: {
      completed: `${user} applied security fix to ${project}`,
      'in-progress': `${user} is applying fixes to ${project}`,
      failed: `Failed to apply fixes to ${project} by ${user}`
    }
  };
  
  return descriptions[type][status] || `${user} performed ${type} on ${project}`;
}

module.exports = router;
