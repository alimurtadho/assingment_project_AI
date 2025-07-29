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
  Rating,
  Tooltip,
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
} from '@mui/material';
import {
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AutoFixHigh as AutoFixHighIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';

import { ScanResult, CodeReview as CodeReviewType } from '../types';

interface CodeReviewProps {
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

const CodeReview: React.FC<CodeReviewProps> = ({ results }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedReview, setSelectedReview] = useState<CodeReviewType | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);

  const reviewResults = results.filter(result => result.scanType === 'ai-review');

  const getOverallScore = () => {
    if (reviewResults.length === 0) return 0;
    
    const totalScore = reviewResults.reduce((sum, result) => {
      return sum + (result.codeReview?.overallScore || 0);
    }, 0);
    
    return Math.round(totalScore / reviewResults.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#ff9800';
    if (score >= 4) return '#f44336';
    return '#d32f2f';
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'performance':
        return <SpeedIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'maintainability':
        return <CodeIcon />;
      case 'best-practices':
        return <SchoolIcon />;
      case 'optimization':
        return <TrendingUpIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityIcon = (severity: 'info' | 'warning' | 'error') => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getAllIssues = () => {
    let allIssues: Array<any> = [];
    reviewResults.forEach(result => {
      if (result.codeReview?.issues) {
        const issuesWithFile = result.codeReview.issues.map(issue => ({
          ...issue,
          filename: result.filename
        }));
        allIssues.push(...issuesWithFile);
      }
    });
    return allIssues.sort((a, b) => {
      const severityOrder = { error: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const getIssueStats = () => {
    const allIssues = getAllIssues();
    const stats = {
      total: allIssues.length,
      error: allIssues.filter(issue => issue.severity === 'error').length,
      warning: allIssues.filter(issue => issue.severity === 'warning').length,
      info: allIssues.filter(issue => issue.severity === 'info').length,
    };
    return stats;
  };

  const getCategoryStats = () => {
    const allIssues = getAllIssues();
    const categories: { [key: string]: number } = {};
    
    allIssues.forEach(issue => {
      categories[issue.type] = (categories[issue.type] || 0) + 1;
    });
    
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: getOverallScore(),
      totalFiles: reviewResults.length,
      issues: getAllIssues(),
      stats: getIssueStats(),
      categoryBreakdown: getCategoryStats()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (reviewResults.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          AI Code Review
        </Typography>
        <Alert severity="info">
          No AI code review results available. Upload code files and run an AI review to see results here.
        </Alert>
      </Box>
    );
  }

  const overallScore = getOverallScore();
  const issueStats = getIssueStats();
  const categoryStats = getCategoryStats();
  const allIssues = getAllIssues();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          AI Code Review Report
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportReport}
            variant="outlined"
          >
            Export Report
          </Button>
          <Button
            startIcon={<AutoFixHighIcon />}
            variant="contained"
          >
            Apply Suggestions
          </Button>
        </Box>
      </Box>

      {/* Overall Score and Stats */}
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
                    bgcolor: getScoreColor(overallScore),
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {overallScore.toFixed(1)}
                </Avatar>
              </Box>
              <Typography variant="h6" gutterBottom>
                Overall Code Quality
              </Typography>
              <Rating
                value={overallScore / 2}
                precision={0.1}
                readOnly
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                Based on {reviewResults.length} file{reviewResults.length > 1 ? 's' : ''} analyzed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issue Breakdown
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ErrorIcon color="error" />
                    <Typography>Errors</Typography>
                  </Box>
                  <Chip label={issueStats.error} color="error" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography>Warnings</Typography>
                  </Box>
                  <Chip label={issueStats.warning} color="warning" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <InfoIcon color="info" />
                    <Typography>Info</Typography>
                  </Box>
                  <Chip label={issueStats.info} color="info" size="small" />
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">Total Issues</Typography>
                  <Typography variant="h6" fontWeight="bold">{issueStats.total}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Issue Categories
              </Typography>
              <Stack spacing={2}>
                {categoryStats.map(([category, count]) => (
                  <Box key={category} display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      {getIssueTypeIcon(category)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {category.replace('-', ' ')}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / issueStats.total) * 100} 
                        sx={{ width: 60, height: 6 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`All Issues (${allIssues.length})`}
              icon={<CodeIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`File Reviews (${reviewResults.length})`}
              icon={<AssessmentIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Improvement Suggestions"
              icon={<LightbulbIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* All Issues */}
          {allIssues.length === 0 ? (
            <Alert severity="success">
              <Typography>
                No issues found in your code! Your code follows best practices and maintains high quality standards.
              </Typography>
            </Alert>
          ) : (
            <List>
              {allIssues.map((issue, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          {getSeverityIcon(issue.severity)}
                          <Typography variant="h6">
                            {issue.message}
                          </Typography>
                          <Chip
                            label={issue.type}
                            size="small"
                            variant="outlined"
                            icon={getIssueTypeIcon(issue.type)}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>File:</strong> {issue.filename} • <strong>Line:</strong> {issue.line}
                        </Typography>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">View Code & Suggestion</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Current Code:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                    {issue.code}
                                  </Typography>
                                </Paper>
                              </Grid>
                              {issue.suggestion && (
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Suggested Improvement:
                                  </Typography>
                                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                      {issue.suggestion}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                            </Grid>
                            
                            <Box mt={2} display="flex" gap={1}>
                              <Button size="small" variant="contained">
                                Apply Fix
                              </Button>
                              <Button size="small" variant="outlined">
                                View in Context
                              </Button>
                              <IconButton size="small">
                                <ThumbUpIcon />
                              </IconButton>
                              <IconButton size="small">
                                <ThumbDownIcon />
                              </IconButton>
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
          {/* File Reviews */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Quality Score</TableCell>
                  <TableCell>Issues</TableCell>
                  <TableCell>Maintainability</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewResults.map((result) => (
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
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          sx={{ color: getScoreColor(result.codeReview?.overallScore || 0) }}
                        >
                          {result.codeReview?.overallScore?.toFixed(1) || 'N/A'}
                        </Typography>
                        <Rating
                          value={(result.codeReview?.overallScore || 0) / 2}
                          size="small"
                          readOnly
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {result.codeReview?.issues?.filter(i => i.severity === 'error').length > 0 && (
                          <Chip 
                            label={`${result.codeReview.issues.filter(i => i.severity === 'error').length} errors`}
                            size="small"
                            color="error"
                          />
                        )}
                        {result.codeReview?.issues?.filter(i => i.severity === 'warning').length > 0 && (
                          <Chip 
                            label={`${result.codeReview.issues.filter(i => i.severity === 'warning').length} warnings`}
                            size="small"
                            color="warning"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={(result.codeReview?.maintainabilityScore || 0) * 10}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={(result.codeReview?.performanceScore || 0) * 10}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedReview(result.codeReview || null);
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

        <TabPanel value={tabValue} index={2}>
          {/* Improvement Suggestions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Wins
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <LightbulbIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Add Type Annotations"
                        secondary="Improve code clarity and catch type errors early"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Optimize Loops"
                        secondary="Use efficient iteration patterns and avoid nested loops"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CodeIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Extract Helper Functions"
                        secondary="Break down complex functions into smaller, reusable components"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Long-term Improvements
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Implement Input Validation"
                        secondary="Add comprehensive validation for all user inputs"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Add Documentation"
                        secondary="Include JSDoc comments and README documentation"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Implement Error Handling"
                        secondary="Add try-catch blocks and proper error logging"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
            Detailed Code Review
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {selectedReview.overallScore.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Overall Score
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="secondary">
                      {selectedReview.maintainabilityScore.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Maintainability
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {selectedReview.performanceScore.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Performance
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedReview.summary}
                </Typography>
              </Box>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Suggestions
                </Typography>
                <List>
                  {selectedReview.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LightbulbIcon />
                      </ListItemIcon>
                      <ListItemText primary={typeof suggestion === 'string' ? suggestion : suggestion.description} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          <Button variant="contained">
            Apply All Suggestions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodeReview;
