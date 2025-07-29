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
  CircularProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  AutoFixHigh as AutoFixHighIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

import { ScanResult, PerformanceMetrics } from '../types';

interface PerformanceAnalysisProps {
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

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ results }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedMetrics, setSelectedMetrics] = useState<PerformanceMetrics | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  const performanceResults = results.filter(result => result.scanType === 'performance');

  const getOverallPerformanceScore = () => {
    if (performanceResults.length === 0) return 0;
    
    const totalScore = performanceResults.reduce((sum, result) => {
      const metrics = result.performanceMetrics;
      if (!metrics) return sum;
      
      // Calculate weighted score based on various metrics
      const complexityScore = Math.max(0, 100 - (metrics.complexityScore * 10));
      const memoryScore = Math.max(0, 100 - (metrics.memoryUsage / 1024)); // MB to score
      const executionScore = Math.max(0, 100 - (metrics.executionTime / 10)); // ms to score
      
      return sum + (complexityScore + memoryScore + executionScore) / 3;
    }, 0);
    
    return Math.round(totalScore / performanceResults.length);
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: '#4caf50' };
    if (score >= 80) return { grade: 'A', color: '#8bc34a' };
    if (score >= 70) return { grade: 'B', color: '#cddc39' };
    if (score >= 60) return { grade: 'C', color: '#ffeb3b' };
    if (score >= 50) return { grade: 'D', color: '#ff9800' };
    return { grade: 'F', color: '#f44336' };
  };

  const getBottlenecks = () => {
    let bottlenecks: Array<any> = [];
    
    performanceResults.forEach(result => {
      if (result.performanceMetrics?.bottlenecks) {
        const bottlenecksWithFile = result.performanceMetrics.bottlenecks.map(bottleneck => ({
          ...bottleneck,
          filename: result.filename
        }));
        bottlenecks.push(...bottlenecksWithFile);
      }
    });
    
    return bottlenecks.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const getOptimizationSuggestions = () => {
    let suggestions: Array<any> = [];
    
    performanceResults.forEach(result => {
      if (result.performanceMetrics?.optimizations) {
        const suggestionsWithFile = result.performanceMetrics.optimizations.map(opt => ({
          ...opt,
          filename: result.filename
        }));
        suggestions.push(...suggestionsWithFile);
      }
    });
    
    return suggestions.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  };

  const getMetricsStats = () => {
    if (performanceResults.length === 0) {
      return {
        avgComplexity: 0,
        avgMemory: 0,
        avgExecution: 0,
        totalBottlenecks: 0,
        criticalIssues: 0
      };
    }

    const totalComplexity = performanceResults.reduce((sum, result) => 
      sum + (result.performanceMetrics?.complexityScore || 0), 0);
    const totalMemory = performanceResults.reduce((sum, result) => 
      sum + (result.performanceMetrics?.memoryUsage || 0), 0);
    const totalExecution = performanceResults.reduce((sum, result) => 
      sum + (result.performanceMetrics?.executionTime || 0), 0);
    
    const bottlenecks = getBottlenecks();
    const criticalIssues = bottlenecks.filter(b => b.severity === 'critical').length;

    return {
      avgComplexity: Math.round(totalComplexity / performanceResults.length),
      avgMemory: Math.round(totalMemory / performanceResults.length),
      avgExecution: Math.round(totalExecution / performanceResults.length),
      totalBottlenecks: bottlenecks.length,
      criticalIssues
    };
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <SpeedIcon />;
    }
  };

  const getImpactIcon = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high':
        return <TrendingUpIcon color="success" />;
      case 'medium':
        return <TrendingUpIcon color="warning" />;
      case 'low':
        return <TrendingUpIcon color="action" />;
      default:
        return <TrendingUpIcon />;
    }
  };

  const runPerformanceAnalysis = async () => {
    setRunningAnalysis(true);
    
    // Simulate analysis
    setTimeout(() => {
      setRunningAnalysis(false);
    }, 3000);
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: getOverallPerformanceScore(),
      metrics: getMetricsStats(),
      bottlenecks: getBottlenecks(),
      optimizations: getOptimizationSuggestions(),
      fileResults: performanceResults.map(result => ({
        filename: result.filename,
        metrics: result.performanceMetrics
      }))
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (performanceResults.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Performance Analysis
        </Typography>
        <Alert severity="info">
          No performance analysis results available. Upload code files and run performance analysis to see results here.
        </Alert>
      </Box>
    );
  }

  const overallScore = getOverallPerformanceScore();
  const performanceGrade = getPerformanceGrade(overallScore);
  const metricsStats = getMetricsStats();
  const bottlenecks = getBottlenecks();
  const optimizations = getOptimizationSuggestions();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Performance Analysis Report
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            startIcon={runningAnalysis ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={runPerformanceAnalysis}
            variant="outlined"
            disabled={runningAnalysis}
          >
            {runningAnalysis ? 'Analyzing...' : 'Re-run Analysis'}
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportReport}
            variant="outlined"
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Performance Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box mb={2}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    bgcolor: performanceGrade.color,
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {performanceGrade.grade}
                </Avatar>
              </Box>
              <Typography variant="h6" gutterBottom>
                Performance Grade
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: performanceGrade.color }}>
                {overallScore}/100
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Based on {performanceResults.length} file{performanceResults.length > 1 ? 's' : ''} analyzed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                      <CodeIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {metricsStats.avgComplexity}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg Complexity
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                      <MemoryIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {metricsStats.avgMemory}MB
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg Memory
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                      <SpeedIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {metricsStats.avgExecution}ms
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg Execution
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                      <WarningIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {metricsStats.criticalIssues}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Critical Issues
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`Bottlenecks (${bottlenecks.length})`}
              icon={<WarningIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`Optimizations (${optimizations.length})`}
              icon={<AutoFixHighIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`Detailed Metrics (${performanceResults.length})`}
              icon={<AnalyticsIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Bottlenecks */}
          {bottlenecks.length === 0 ? (
            <Alert severity="success">
              <Typography>
                No performance bottlenecks detected! Your code is running efficiently.
              </Typography>
            </Alert>
          ) : (
            <List>
              {bottlenecks.map((bottleneck, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          {getSeverityIcon(bottleneck.severity)}
                          <Typography variant="h6">
                            {bottleneck.function}
                          </Typography>
                          <Chip
                            label={bottleneck.severity.toUpperCase()}
                            size="small"
                            color={
                              bottleneck.severity === 'critical' ? 'error' :
                              bottleneck.severity === 'high' ? 'error' :
                              bottleneck.severity === 'medium' ? 'warning' : 'success'
                            }
                          />
                          <Chip
                            label={bottleneck.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>File:</strong> {bottleneck.filename} • <strong>Line:</strong> {bottleneck.line}
                        </Typography>
                        
                        <Typography variant="body1" paragraph>
                          {bottleneck.description}
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.100' }}>
                              <Typography variant="caption" color="textSecondary">
                                Execution Time
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {bottleneck.executionTime}ms
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.100' }}>
                              <Typography variant="caption" color="textSecondary">
                                Memory Usage
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {bottleneck.memoryUsage}MB
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.100' }}>
                              <Typography variant="caption" color="textSecondary">
                                CPU Usage
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {bottleneck.cpuUsage}%
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.100' }}>
                              <Typography variant="caption" color="textSecondary">
                                Complexity
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {bottleneck.complexity}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        <Box display="flex" gap={1}>
                          <Button size="small" variant="contained">
                            View in Context
                          </Button>
                          <Button size="small" variant="outlined">
                            See Optimization
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Optimizations */}
          {optimizations.length === 0 ? (
            <Alert severity="success">
              <Typography>
                No specific optimizations recommended. Your code is already well-optimized!
              </Typography>
            </Alert>
          ) : (
            <List>
              {optimizations.map((optimization, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          {getImpactIcon(optimization.impact)}
                          <Typography variant="h6">
                            {optimization.title}
                          </Typography>
                          <Chip
                            label={`${optimization.impact.toUpperCase()} IMPACT`}
                            size="small"
                            color={
                              optimization.impact === 'high' ? 'success' :
                              optimization.impact === 'medium' ? 'warning' : 'default'
                            }
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>File:</strong> {optimization.filename} • <strong>Expected Improvement:</strong> {optimization.expectedImprovement}
                        </Typography>
                        
                        <Typography variant="body1" paragraph>
                          {optimization.description}
                        </Typography>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">View Implementation Details</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Current Implementation:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                    {optimization.currentCode}
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Optimized Version:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                    {optimization.optimizedCode}
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                            
                            <Box mt={2} display="flex" gap={1}>
                              <Button size="small" variant="contained">
                                Apply Optimization
                              </Button>
                              <Button size="small" variant="outlined">
                                Preview Changes
                              </Button>
                              <Button size="small" variant="outlined" startIcon={<PlayArrowIcon />}>
                                Benchmark
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

        <TabPanel value={tabValue} index={2}>
          {/* Detailed Metrics */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Complexity Score</TableCell>
                  <TableCell>Memory Usage</TableCell>
                  <TableCell>Execution Time</TableCell>
                  <TableCell>Bottlenecks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {result.filename}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={result.language} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (result.performanceMetrics?.complexityScore || 0) * 10)}
                          sx={{ 
                            width: 60,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 
                                (result.performanceMetrics?.complexityScore || 0) > 8 ? '#f44336' :
                                (result.performanceMetrics?.complexityScore || 0) > 5 ? '#ff9800' : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {result.performanceMetrics?.complexityScore || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.performanceMetrics?.memoryUsage || 0} MB
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.performanceMetrics?.executionTime || 0} ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error">
                        {result.performanceMetrics?.bottlenecks?.length || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedMetrics(result.performanceMetrics || null);
                          setDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Detailed Performance Metrics
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedMetrics && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {selectedMetrics.complexityScore}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Complexity Score
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {selectedMetrics.memoryUsage}MB
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Memory Usage
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {selectedMetrics.executionTime}ms
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Execution Time
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {selectedMetrics.bottlenecks?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Bottlenecks
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Performance Breakdown
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Code Complexity:</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, selectedMetrics.complexityScore * 10)} 
                      sx={{ width: 100 }}
                    />
                    <Typography fontWeight="bold">{selectedMetrics.complexityScore}/10</Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Memory Efficiency:</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.max(0, 100 - (selectedMetrics.memoryUsage / 10))} 
                      sx={{ width: 100 }}
                    />
                    <Typography fontWeight="bold">{selectedMetrics.memoryUsage} MB</Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Execution Speed:</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.max(0, 100 - (selectedMetrics.executionTime / 50))} 
                      sx={{ width: 100 }}
                    />
                    <Typography fontWeight="bold">{selectedMetrics.executionTime} ms</Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          <Button variant="contained">
            Generate Optimization Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceAnalysis;
