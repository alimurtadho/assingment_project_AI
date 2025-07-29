import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Assessment as ReportIcon,
  Code as CodeIcon,
  BugReport as TestIcon,
  Speed as PerformanceIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Import components (akan dibuat setelah ini)
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import SecurityReport from './components/SecurityReport';
import CodeReview from './components/CodeReview';
import TestResults from './components/TestResults';
import PerformanceAnalysis from './components/PerformanceAnalysis';

// Import types
import { ScanResult, Notification } from './types';

// Import API service
import apiService from './services/api';

// Component Props Interfaces
interface SecurityReportProps {
  scanResults: ScanResult[];
}

interface CodeReviewProps {
  scanResults: ScanResult[];
}

interface TestResultsProps {
  scanResults: ScanResult[];
}

interface PerformanceAnalysisProps {
  scanResults: ScanResult[];
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  // Load initial data
  useEffect(() => {
    loadScanResults();
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      if (health.status === 'OK') {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Server Connected',
          message: 'CodeGuardian AI backend is running properly',
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Server Connection Failed',
        message: 'Unable to connect to CodeGuardian AI backend',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  };

  const loadScanResults = async () => {
    try {
      setLoading(true);
      const results = await apiService.getAllScanResults();
      setScanResults(results);
    } catch (error) {
      console.error('Failed to load scan results:', error);
      setError('Failed to load scan results');
    } finally {
      setLoading(false);
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    setScanResults(prev => {
      const existingIndex = prev.findIndex(r => r.id === result.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = result;
        return updated;
      }
      return [result, ...prev];
    });

    // Add notification
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Scan Completed',
      message: `${result.scanType} scan completed for ${result.filename}`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    // Switch to appropriate tab based on scan type
    switch (result.scanType) {
      case 'security':
        setCurrentTab(2);
        break;
      case 'ai-review':
        setCurrentTab(3);
        break;
      case 'test-generation':
        setCurrentTab(4);
        break;
      case 'performance':
        setCurrentTab(5);
        break;
      default:
        setCurrentTab(0);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only last 10
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <Dashboard scanResults={scanResults} loading={loading} />;
      case 1:
        return <FileUpload onScanComplete={handleScanComplete} />;
      case 2:
        return <SecurityReport scanResults={scanResults.filter(r => r.scanType === 'security')} />;
      case 3:
        return <CodeReview scanResults={scanResults.filter(r => r.scanType === 'ai-review')} />;
      case 4:
        return <TestResults scanResults={scanResults.filter(r => r.scanType === 'test-generation')} />;
      case 5:
        return <PerformanceAnalysis scanResults={scanResults.filter(r => r.scanType === 'performance')} />;
      default:
        return <Dashboard scanResults={scanResults} loading={loading} />;
    }
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
          <Toolbar>
            <SecurityIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              CodeGuardian AI
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
              AI-Enhanced DevSecOps Platform
            </Typography>
            
            <Badge badgeContent={unreadCount} color="error">
              <IconButton
                color="inherit"
                onClick={handleNotificationClick}
                size="large"
              >
                <NotificationsIcon />
              </IconButton>
            </Badge>
            
            <IconButton color="inherit" size="large">
              <SettingsIcon />
            </IconButton>
          </Toolbar>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  minHeight: 48,
                },
                '& .Mui-selected': {
                  color: 'white !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                },
              }}
            >
              <Tab 
                icon={<DashboardIcon />} 
                label="Dashboard" 
                iconPosition="start"
              />
              <Tab 
                icon={<UploadIcon />} 
                label="Upload & Scan" 
                iconPosition="start"
              />
              <Tab 
                icon={<SecurityIcon />} 
                label="Security Report" 
                iconPosition="start"
              />
              <Tab 
                icon={<CodeIcon />} 
                label="Code Review" 
                iconPosition="start"
              />
              <Tab 
                icon={<TestIcon />} 
                label="Test Generation" 
                iconPosition="start"
              />
              <Tab 
                icon={<PerformanceIcon />} 
                label="Performance" 
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </AppBar>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { maxWidth: 400, maxHeight: 400 }
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem>
              <Typography variant="body2" color="textSecondary">
                No notifications
              </Typography>
            </MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => markNotificationAsRead(notification.id)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderLeft: `4px solid ${
                    notification.type === 'error' ? 'error.main' :
                    notification.type === 'warning' ? 'warning.main' :
                    notification.type === 'success' ? 'success.main' :
                    'info.main'
                  }`,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          {renderTabContent()}
        </Container>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div />} />
          <Route path="/upload" element={<div />} />
          <Route path="/security" element={<div />} />
          <Route path="/review" element={<div />} />
          <Route path="/tests" element={<div />} />
          <Route path="/performance" element={<div />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
