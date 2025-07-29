import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Collapse,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  Avatar,
  Divider,
  Stack,
  Badge,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

import { ScanResult, Vulnerability } from '../types';

interface SecurityReportProps {
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

const SecurityReport: React.FC<SecurityReportProps> = ({ results }) => {
  const [expandedVulns, setExpandedVulns] = useState<Set<string>>(new Set());
  const [showOnlyHighRisk, setShowOnlyHighRisk] = useState(false);
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const securityResults = results.filter(result => result.scanType === 'security');

  const toggleVulnExpansion = (vulnId: string) => {
    const newExpanded = new Set(expandedVulns);
    if (newExpanded.has(vulnId)) {
      newExpanded.delete(vulnId);
    } else {
      newExpanded.add(vulnId);
    }
    setExpandedVulns(newExpanded);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon sx={{ color: getSeverityColor(severity) }} />;
      case 'medium':
        return <WarningIcon sx={{ color: getSeverityColor(severity) }} />;
      case 'low':
        return <CheckCircleIcon sx={{ color: getSeverityColor(severity) }} />;
      default:
        return <SecurityIcon />;
    }
  };

  const getTotalVulnerabilities = () => {
    return securityResults.reduce((total, result) => {
      return total + (result.vulnerabilities?.length || 0);
    }, 0);
  };

  const getVulnerabilityStats = () => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 };
    securityResults.forEach(result => {
      result.vulnerabilities?.forEach(vuln => {
        stats[vuln.severity]++;
      });
    });
    return stats;
  };

  const getFilteredVulnerabilities = () => {
    let vulnerabilities: Array<Vulnerability & { filename: string }> = [];
    
    securityResults.forEach(result => {
      if (result.vulnerabilities) {
        vulnerabilities.push(...result.vulnerabilities.map(vuln => ({
          ...vuln,
          filename: result.filename
        })));
      }
    });

    if (showOnlyHighRisk) {
      vulnerabilities = vulnerabilities.filter(vuln => 
        vuln.severity === 'critical' || vuln.severity === 'high'
      );
    }

    return vulnerabilities.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const getSecurityScore = () => {
    const stats = getVulnerabilityStats();
    const totalVulns = stats.critical + stats.high + stats.medium + stats.low;
    
    if (totalVulns === 0) return 100;
    
    const weightedScore = (
      stats.critical * 0 + 
      stats.high * 20 + 
      stats.medium * 60 + 
      stats.low * 85
    ) / totalVulns;
    
    return Math.round(weightedScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#f44336';
    return '#d32f2f';
  };

  const handleVulnDetails = (vuln: Vulnerability) => {
    setSelectedVuln(vuln);
    setDetailsDialog(true);
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      securityScore: getSecurityScore(),
      vulnerabilities: getFilteredVulnerabilities(),
      stats: getVulnerabilityStats()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (securityResults.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Security Analysis
        </Typography>
        <Alert severity="info">
          No security scan results available. Upload code files and run a security scan to see results here.
        </Alert>
      </Box>
    );
  }

  const stats = getVulnerabilityStats();
  const securityScore = getSecurityScore();
  const filteredVulns = getFilteredVulnerabilities();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Security Analysis Report
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
            startIcon={<ShareIcon />}
            variant="outlined"
          >
            Share
          </Button>
        </Box>
      </Box>

      {/* Security Score Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box position="relative" display="inline-flex" mb={2}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(securityScore)} ${securityScore * 3.6}deg, #e0e0e0 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" color={getScoreColor(securityScore)}>
                      {securityScore}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      SCORE
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom>
                Security Score
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Based on vulnerability severity and count
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vulnerability Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: getSeverityColor('critical'), mx: 'auto', mb: 1 }}>
                      <ErrorIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.critical}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Critical
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: getSeverityColor('high'), mx: 'auto', mb: 1 }}>
                      <ErrorIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.high}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      High
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: getSeverityColor('medium'), mx: 'auto', mb: 1 }}>
                      <WarningIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.medium}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Medium
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: getSeverityColor('low'), mx: 'auto', mb: 1 }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.low}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Low
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Scan Results Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`All Vulnerabilities (${filteredVulns.length})`}
              icon={<BugReportIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`Scan Details (${securityResults.length})`}
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Remediation Guide"
              icon={<TimelineIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Filter Controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyHighRisk}
                  onChange={(e) => setShowOnlyHighRisk(e.target.checked)}
                />
              }
              label="Show only high-risk vulnerabilities"
            />
            <Typography variant="body2" color="textSecondary">
              Showing {filteredVulns.length} of {getTotalVulnerabilities()} vulnerabilities
            </Typography>
          </Box>

          {/* Vulnerabilities List */}
          {filteredVulns.length === 0 ? (
            <Alert severity="success">
              <Typography>
                {showOnlyHighRisk 
                  ? 'No high-risk vulnerabilities found!' 
                  : 'No vulnerabilities detected in your code. Great job!'
                }
              </Typography>
            </Alert>
          ) : (
            <List>
              {filteredVulns.map((vuln, index) => (
                <Card key={`${vuln.id}-${index}`} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          {getSeverityIcon(vuln.severity)}
                          <Typography variant="h6" component="div">
                            {vuln.title}
                          </Typography>
                          <Chip
                            label={vuln.severity.toUpperCase()}
                            size="small"
                            sx={{ 
                              bgcolor: getSeverityColor(vuln.severity),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Chip
                            label={vuln.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>File:</strong> {vuln.filename} • <strong>Line:</strong> {vuln.line}
                        </Typography>
                        
                        <Typography variant="body1" paragraph>
                          {vuln.description}
                        </Typography>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">View Details & Code</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Vulnerable Code:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto' }}>
                                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                  {vuln.code}
                                </Typography>
                              </Paper>
                            </Box>
                            
                            {vuln.suggestion && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Recommended Fix:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                                    {vuln.suggestion}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}

                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleVulnDetails(vuln)}
                              >
                                View Full Details
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<CodeIcon />}
                              >
                                Show in Context
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
          {/* Scan Details */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Vulnerabilities</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scan Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {securityResults.map((result) => (
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
                      {result.fileSize ? `${(result.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {result.vulnerabilities?.filter(v => v.severity === 'critical').length > 0 && (
                          <Badge badgeContent={result.vulnerabilities.filter(v => v.severity === 'critical').length} color="error">
                            <Chip label="Critical" size="small" />
                          </Badge>
                        )}
                        {result.vulnerabilities?.filter(v => v.severity === 'high').length > 0 && (
                          <Badge badgeContent={result.vulnerabilities.filter(v => v.severity === 'high').length} color="warning">
                            <Chip label="High" size="small" />
                          </Badge>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.status}
                        size="small"
                        color={result.status === 'completed' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(result.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Remediation Guide */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Priority Actions
                  </Typography>
                  <List>
                    {stats.critical > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <ErrorIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Fix Critical Vulnerabilities Immediately"
                          secondary={`${stats.critical} critical issues require immediate attention`}
                        />
                      </ListItem>
                    )}
                    {stats.high > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Address High-Risk Issues"
                          secondary={`${stats.high} high-risk vulnerabilities should be fixed within 24-48 hours`}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Implement Security Best Practices"
                        secondary="Regular security scans and code reviews"
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
                    Security Recommendations
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Regular Security Scanning"
                        secondary="Integrate security scanning into your CI/CD pipeline"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Dependency Updates"
                        secondary="Keep dependencies updated and scan for known vulnerabilities"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Code Review Process"
                        secondary="Implement peer code reviews with security focus"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Security Training"
                        secondary="Ensure team is trained on secure coding practices"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Vulnerability Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedVuln && getSeverityIcon(selectedVuln.severity)}
            <Typography variant="h6">
              {selectedVuln?.title}
            </Typography>
            {selectedVuln && (
              <Chip
                label={selectedVuln.severity.toUpperCase()}
                size="small"
                sx={{ 
                  bgcolor: getSeverityColor(selectedVuln.severity),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVuln && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedVuln.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Line {selectedVuln.line} in {selectedVuln.filename || 'unknown file'}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Vulnerable Code
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {selectedVuln.code}
                </Typography>
              </Paper>
              
              {selectedVuln.suggestion && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Recommended Fix
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                      {selectedVuln.suggestion}
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
          <Button variant="contained">
            Apply Fix
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityReport;
