import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  Stack,
  Avatar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';

import { ScanResult, TestCase } from '../types';

interface TestResultsProps {
  results: ScanResult[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [showPassedTests, setShowPassedTests] = useState(true);
  const [showFailedTests, setShowFailedTests] = useState(true);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const testResults = results.filter(result => result.scanType === 'test-generation');

  const getAllTests = () => {
    let allTests: Array<TestCase & { filename: string }> = [];
    testResults.forEach(result => {
      if (result.tests) {
        const testsWithFile = result.tests.map(test => ({
          ...test,
          filename: result.filename
        }));
        allTests.push(...testsWithFile);
      }
    });
    return allTests;
  };

  const getFilteredTests = () => {
    const allTests = getAllTests();
    return allTests.filter(test => {
      if (!showPassedTests && test.status === 'passed') return false;
      if (!showFailedTests && test.status === 'failed') return false;
      return true;
    });
  };

  const getTestStats = () => {
    const allTests = getAllTests();
    const stats = {
      total: allTests.length,
      passed: allTests.filter(test => test.status === 'passed').length,
      failed: allTests.filter(test => test.status === 'failed').length,
      pending: allTests.filter(test => test.status === 'pending').length,
    };
    
    const coverage = allTests.length > 0 
      ? Math.round((stats.passed / allTests.length) * 100)
      : 0;
    
    return { ...stats, coverage };
  };

  const getTestTypeStats = () => {
    const allTests = getAllTests();
    const types: { [key: string]: number } = {};
    
    allTests.forEach(test => {
      types[test.type] = (types[test.type] || 0) + 1;
    });
    
    return Object.entries(types)
      .sort((a, b) => b[1] - a[1]);
  };

  const getCoverageByFile = () => {
    return testResults.map(result => {
      const total = result.tests?.length || 0;
      const passed = result.tests?.filter(test => test.status === 'passed').length || 0;
      const coverage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      return {
        filename: result.filename,
        total,
        passed,
        failed: result.tests?.filter(test => test.status === 'failed').length || 0,
        coverage
      };
    });
  };

  const runTest = async (testId: string) => {
    setRunningTests(prev => new Set([...prev, testId]));
    
    // Simulate test execution
    setTimeout(() => {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }, 2000);
  };

  const generateAdditionalTests = () => {
    // This would integrate with the backend to generate more tests
    console.log('Generating additional tests...');
  };

  const exportTestSuite = () => {
    const allTests = getAllTests();
    const testSuite = {
      timestamp: new Date().toISOString(),
      stats: getTestStats(),
      tests: allTests,
      coverage: getCoverageByFile()
    };
    
    const blob = new Blob([JSON.stringify(testSuite, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-suite-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'pending') => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <CancelIcon color="error" />;
      case 'pending':
        return <PlayArrowIcon color="warning" />;
      default:
        return <BugReportIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'unit':
        return <EngineeringIcon />;
      case 'integration':
        return <TimelineIcon />;
      case 'performance':
        return <SpeedIcon />;
      case 'security':
        return <SecurityIcon />;
      default:
        return <BugReportIcon />;
    }
  };

  if (testResults.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Test Generation Results
        </Typography>
        <Alert severity="info">
          No test generation results available. Upload code files and run test generation to see results here.
        </Alert>
      </Box>
    );
  }

  const stats = getTestStats();
  const typeStats = getTestTypeStats();
  const coverageByFile = getCoverageByFile();
  const filteredTests = getFilteredTests();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Test Generation Results
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            startIcon={<AddIcon />}
            onClick={generateAdditionalTests}
            variant="outlined"
          >
            Generate More Tests
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportTestSuite}
            variant="outlined"
          >
            Export Test Suite
          </Button>
        </Box>
      </Box>

      {/* Test Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 1,
                  bgcolor: stats.coverage >= 80 ? 'success.main' : stats.coverage >= 60 ? 'warning.main' : 'error.main'
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="white">
                  {stats.coverage}%
                </Typography>
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Test Coverage
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.passed} of {stats.total} tests passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.passed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Passed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                <CancelIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.failed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Failed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <PlayArrowIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Types Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Types Distribution
          </Typography>
          <Grid container spacing={2}>
            {typeStats.map(([type, count]) => (
              <Grid item xs={12} sm={6} md={3} key={type}>
                <Box display="flex" alignItems="center" gap={2}>
                  {getTypeIcon(type)}
                  <Box flex={1}>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {type} Tests
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / stats.total) * 100} 
                        sx={{ flex: 1, height: 8 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`All Tests (${filteredTests.length})`}
              icon={<BugReportIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`Coverage Report (${testResults.length} files)`}
              icon={<AssessmentIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Test Execution"
              icon={<PlayArrowIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Test Filter Controls */}
          <Box display="flex" gap={2} mb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPassedTests}
                  onChange={(e) => setShowPassedTests(e.target.checked)}
                />
              }
              label="Show passed tests"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showFailedTests}
                  onChange={(e) => setShowFailedTests(e.target.checked)}
                />
              }
              label="Show failed tests"
            />
          </Box>

          {/* All Tests */}
          {filteredTests.length === 0 ? (
            <Alert severity="info">
              No tests match the current filter criteria.
            </Alert>
          ) : (
            <List>
              {filteredTests.map((test, index) => (
                <Card key={`${test.id}-${index}`} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          {getStatusIcon(test.status)}
                          <Typography variant="h6">
                            {test.name}
                          </Typography>
                          <Chip
                            label={test.type}
                            size="small"
                            variant="outlined"
                            icon={getTypeIcon(test.type)}
                          />
                          <Chip
                            label={test.status.toUpperCase()}
                            size="small"
                            color={
                              test.status === 'passed' ? 'success' : 
                              test.status === 'failed' ? 'error' : 'warning'
                            }
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>File:</strong> {test.filename} • <strong>Function:</strong> {test.targetFunction}
                        </Typography>
                        
                        <Typography variant="body1" paragraph>
                          {test.description}
                        </Typography>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">View Test Code</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Generated Test Code:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto' }}>
                                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                  {test.code}
                                </Typography>
                              </Paper>
                            </Box>
                            
                            {test.expectedOutput && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Expected Output:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                    {test.expectedOutput}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}

                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={
                                  runningTests.has(test.id) 
                                    ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} />
                                    : <PlayArrowIcon />
                                }
                                onClick={() => runTest(test.id)}
                                disabled={runningTests.has(test.id)}
                              >
                                {runningTests.has(test.id) ? 'Running...' : 'Run Test'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                              >
                                Edit Test
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => {
                                  setSelectedTest(test);
                                  setDetailsDialog(true);
                                }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Coverage Report */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Total Tests</TableCell>
                  <TableCell>Passed</TableCell>
                  <TableCell>Failed</TableCell>
                  <TableCell>Coverage</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coverageByFile.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {file.filename}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={testResults.find(r => r.filename === file.filename)?.language || 'Unknown'} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {file.total}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">{file.passed}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CancelIcon color="error" fontSize="small" />
                        <Typography variant="body2">{file.failed}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={file.coverage}
                          sx={{ 
                            width: 100, 
                            height: 8,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: file.coverage >= 80 ? '#4caf50' : file.coverage >= 60 ? '#ff9800' : '#f44336'
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {file.coverage}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Generate more tests for this file">
                        <IconButton size="small">
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Test Execution */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      fullWidth
                    >
                      Run All Tests
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrowIcon />}
                      fullWidth
                    >
                      Run Failed Tests Only
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      fullWidth
                    >
                      Re-run Last Test Suite
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test Execution Stats
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Average Execution Time:</Typography>
                      <Typography fontWeight="bold">245ms</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Fastest Test:</Typography>
                      <Typography fontWeight="bold">12ms</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Slowest Test:</Typography>
                      <Typography fontWeight="bold">1.2s</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Last Run:</Typography>
                      <Typography fontWeight="bold">2 minutes ago</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Test Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedTest && getStatusIcon(selectedTest.status)}
            <Typography variant="h6">
              {selectedTest?.name}
            </Typography>
            {selectedTest && (
              <Chip
                label={selectedTest.status.toUpperCase()}
                size="small"
                color={
                  selectedTest.status === 'passed' ? 'success' : 
                  selectedTest.status === 'failed' ? 'error' : 'warning'
                }
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedTest.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Test Details
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Target Function:</strong> {selectedTest.targetFunction}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Test Type:</strong> {selectedTest.type}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>File:</strong> {selectedTest.filename || 'Unknown'}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Test Code
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {selectedTest.code}
                </Typography>
              </Paper>
              
              {selectedTest.expectedOutput && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Expected Output
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                      {selectedTest.expectedOutput}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          <Button variant="outlined" startIcon={<EditIcon />}>
            Edit Test
          </Button>
          <Button variant="contained" startIcon={<PlayArrowIcon />}>
            Run Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestResults;
