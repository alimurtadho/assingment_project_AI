import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Security,
  Warning,
  Error,
  CheckCircle,
  Visibility,
  Download,
  BugReport
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface Vulnerability {
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  line: number;
  description: string;
  code?: string;
  recommendation?: string;
}

interface ScanResult {
  vulnerabilities: Vulnerability[];
  riskScore: number;
  summary: {
    totalIssues: number;
    high: number;
    medium: number;
    low: number;
  };
  metadata?: {
    fileName: string;
    fileSize: number;
    language: string;
    scanTime: number;
  };
}

interface FileUploadState {
  uploading: boolean;
  progress: number;
  result: ScanResult | null;
  error: string | null;
  fileName: string;
}

const DemoFileUpload: React.FC = () => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    result: null,
    error: null,
    fileName: ''
  });

  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadState({
      uploading: true,
      progress: 0,
      result: null,
      error: null,
      fileName: file.name
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // Read file content
      const fileContent = await readFileContent(file);
      
      // Perform security scan
      const scanResult = await performSecurityScan(fileContent, file.name);
      
      clearInterval(progressInterval);
      
      setUploadState({
        uploading: false,
        progress: 100,
        result: scanResult,
        error: null,
        fileName: file.name
      });

    } catch (error) {
      setUploadState({
        uploading: false,
        progress: 0,
        result: null,
        error: error instanceof Error ? error.message : 'Upload failed',
        fileName: file.name
      });
    }
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const performSecurityScan = async (content: string, fileName: string): Promise<ScanResult> => {
    try {
      // Simulate API call to backend
      const response = await axios.post('/api/security/scan', {
        code: content,
        language: detectLanguage(fileName),
        fileName: fileName
      });

      return {
        ...response.data,
        metadata: {
          fileName,
          fileSize: content.length,
          language: detectLanguage(fileName),
          scanTime: Date.now()
        }
      };
    } catch (error) {
      // For demo purposes, simulate security scan results
      return simulateSecurityScan(content, fileName);
    }
  };

  const simulateSecurityScan = (content: string, fileName: string): ScanResult => {
    const vulnerabilities: Vulnerability[] = [];
    let riskScore = 0;

    // Simulate API key detection
    const apiKeyRegex = /(sk-[a-zA-Z0-9]{48}|API_KEY\s*=\s*["'][^"']+["'])/g;
    let match;
    while ((match = apiKeyRegex.exec(content)) !== null) {
      vulnerabilities.push({
        type: 'Hardcoded API Key',
        severity: 'HIGH',
        line: getLineNumber(content, match.index),
        description: 'Hardcoded API key detected. This exposes sensitive credentials.',
        code: match[0],
        recommendation: 'Move API keys to environment variables or secure configuration.'
      });
      riskScore += 25;
    }

    // Simulate SQL injection detection
    const sqlInjectionRegex = /(SELECT\s+.*\s+WHERE\s+.*\s*\+\s*|query\s*=\s*["'].*\$\{.*\}.*["'])/gi;
    while ((match = sqlInjectionRegex.exec(content)) !== null) {
      vulnerabilities.push({
        type: 'SQL Injection',
        severity: 'HIGH',
        line: getLineNumber(content, match.index),
        description: 'Potential SQL injection vulnerability detected.',
        code: match[0],
        recommendation: 'Use parameterized queries or prepared statements.'
      });
      riskScore += 30;
    }

    // Simulate XSS detection
    const xssRegex = /(innerHTML\s*=\s*.*|document\.write\s*\(.*\))/gi;
    while ((match = xssRegex.exec(content)) !== null) {
      vulnerabilities.push({
        type: 'Cross-Site Scripting (XSS)',
        severity: 'MEDIUM',
        line: getLineNumber(content, match.index),
        description: 'Potential XSS vulnerability through unsafe DOM manipulation.',
        code: match[0],
        recommendation: 'Sanitize user input and use secure DOM manipulation methods.'
      });
      riskScore += 20;
    }

    // Simulate weak cryptography detection
    const weakCryptoRegex = /(createHash\s*\(\s*['"]md5['"]|createHash\s*\(\s*['"]sha1['"])/gi;
    while ((match = weakCryptoRegex.exec(content)) !== null) {
      vulnerabilities.push({
        type: 'Weak Cryptographic Algorithm',
        severity: 'MEDIUM',
        line: getLineNumber(content, match.index),
        description: 'Weak cryptographic algorithm detected.',
        code: match[0],
        recommendation: 'Use stronger cryptographic algorithms like SHA-256 or better.'
      });
      riskScore += 15;
    }

    const summary = {
      totalIssues: vulnerabilities.length,
      high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      low: vulnerabilities.filter(v => v.severity === 'LOW').length
    };

    return {
      vulnerabilities,
      riskScore: Math.min(riskScore, 100),
      summary,
      metadata: {
        fileName,
        fileSize: content.length,
        language: detectLanguage(fileName),
        scanTime: Date.now()
      }
    };
  };

  const getLineNumber = (content: string, index: number): number => {
    return content.substring(0, index).split('\n').length;
  };

  const detectLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'cs': 'csharp'
    };
    return languageMap[extension || ''] || 'javascript';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <Error color="error" />;
      case 'MEDIUM': return <Warning color="warning" />;
      case 'LOW': return <CheckCircle color="info" />;
      default: return <BugReport />;
    }
  };

  const exportResults = () => {
    if (!uploadState.result) return;

    const dataStr = JSON.stringify({
      fileName: uploadState.fileName,
      scanTime: new Date().toISOString(),
      result: uploadState.result
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-scan-${uploadState.fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.js', '.ts', '.py', '.php', '.java', '.cpp', '.cs', '.txt'],
      'application/javascript': ['.js'],
      'application/typescript': ['.ts']
    },
    maxFiles: 1,
    disabled: uploadState.uploading
  });

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        🛡️ CodeGuardian AI - Demo Implementation
      </Typography>

      {/* File Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: uploadState.uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          {uploadState.uploading ? (
            <>
              <Typography variant="h6">Analyzing {uploadState.fileName}...</Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadState.progress} 
                sx={{ mt: 2, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {uploadState.progress}% complete
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop your file here' : 'Drag & drop a file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: .js, .ts, .py, .php, .java, .cpp, .cs
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* Error Display */}
      {uploadState.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {uploadState.error}
        </Alert>
      )}

      {/* Results Display */}
      {uploadState.result && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      {uploadState.result.riskScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Risk Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <BugReport sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" color="error">
                      {uploadState.result.summary.totalIssues}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Issues
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" color="error">
                      {uploadState.result.summary.high}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Severity
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {uploadState.result.summary.medium}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Medium Severity
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Vulnerabilities List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Security Vulnerabilities</Typography>
                  <Button
                    startIcon={<Download />}
                    onClick={exportResults}
                    variant="outlined"
                    size="small"
                  >
                    Export Results
                  </Button>
                </Box>
                
                {uploadState.result.vulnerabilities.length === 0 ? (
                  <Alert severity="success" icon={<CheckCircle />}>
                    No security vulnerabilities detected! Your code looks secure.
                  </Alert>
                ) : (
                  <List>
                    {uploadState.result.vulnerabilities.map((vulnerability, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            {getSeverityIcon(vulnerability.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1">
                                  {vulnerability.type}
                                </Typography>
                                <Chip
                                  label={vulnerability.severity}
                                  size="small"
                                  color={getSeverityColor(vulnerability.severity) as any}
                                />
                                <Chip
                                  label={`Line ${vulnerability.line}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={vulnerability.description}
                          />
                          <Button
                            startIcon={<Visibility />}
                            onClick={() => setSelectedVulnerability(vulnerability)}
                            size="small"
                          >
                            Details
                          </Button>
                        </ListItem>
                        {index < uploadState.result.vulnerabilities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Vulnerability Details Dialog */}
      <Dialog
        open={!!selectedVulnerability}
        onClose={() => setSelectedVulnerability(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedVulnerability && getSeverityIcon(selectedVulnerability.severity)}
            {selectedVulnerability?.type}
            {selectedVulnerability && (
              <Chip
                label={selectedVulnerability.severity}
                size="small"
                color={getSeverityColor(selectedVulnerability.severity) as any}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVulnerability && (
            <Box>
              <Typography variant="body1" paragraph>
                <strong>Description:</strong> {selectedVulnerability.description}
              </Typography>
              
              {selectedVulnerability.code && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Vulnerable Code:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                      {selectedVulnerability.code}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedVulnerability.recommendation && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Recommendation:
                  </Typography>
                  <Alert severity="info">
                    {selectedVulnerability.recommendation}
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVulnerability(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemoFileUpload;
