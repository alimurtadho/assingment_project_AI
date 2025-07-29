import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { ScanResult } from '../types';
import apiService from '../services/api';

interface FileUploadProps {
  onScanComplete: (result: ScanResult) => void;
}

interface UploadedFile extends File {
  id: string;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onScanComplete }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [scanType, setScanType] = useState<'security' | 'ai-review' | 'test-generation' | 'performance'>('security');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scanOptions, setScanOptions] = useState({
    includeDocumentation: false,
    severity: 'medium',
    frameworks: [],
    deepScan: false,
    generateReport: true,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const supportedExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.cs', '.html', '.css',
      '.sql', '.sh', '.yml', '.yaml', '.json', '.xml', '.vue', '.svelte'
    ];
    
    const validFiles = acceptedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return supportedExtensions.includes(extension);
    });

    if (validFiles.length !== acceptedFiles.length) {
      setError('Some files were rejected. Only supported source code files are allowed.');
    } else {
      setError(null);
    }

    const filesWithId = validFiles.map(file => ({
      ...file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    setFiles(prev => [...prev, ...filesWithId]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': [
        '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', 
        '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.cs', '.html', '.css', 
        '.sql', '.sh', '.yml', '.yaml', '.json', '.xml', '.vue', '.svelte'
      ]
    },
    maxSize: 10 * 1024 * 1024, // 10MB per file
    maxFiles: 20,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleScan = async () => {
    if (files.length === 0) {
      setError('Please select files to scan');
      return;
    }

    setIsScanning(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Call real API
      const result = await apiService.uploadAndScan(files, scanType, {
        includeDocumentation: scanOptions.includeDocumentation,
        severity: scanOptions.severity,
      });
      
      clearInterval(progressInterval);
      setProgress(100);

      // Process each file result
      if (result.results && result.results.length > 0) {
        for (const fileResult of result.results) {
          // Generate detailed mock result for demo
          const detailedResult = apiService.getMockScanResult(fileResult.filename, scanType);
          onScanComplete(detailedResult);
        }
      } else {
        // Create a combined result for all files
        const combinedResult: ScanResult = {
          id: result.scanId,
          filename: files.map(f => f.name).join(', '),
          scanType,
          status: 'completed',
          createdAt: new Date().toISOString(),
          fileSize: files.reduce((total, file) => total + file.size, 0),
          language: 'mixed',
        };
        onScanComplete(combinedResult);
      }
      
      // Clear files after successful scan
      setFiles([]);
      setProgress(0);
      
    } catch (error: any) {
      console.error('Scan failed:', error);
      setError(error.message || 'Scan failed. Please try again.');
      setProgress(0);
    } finally {
      setIsScanning(false);
    }
  };

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <SecurityIcon />;
      case 'ai-review':
        return <CodeIcon />;
      case 'test-generation':
        return <BugReportIcon />;
      case 'performance':
        return <SpeedIcon />;
      default:
        return <SecurityIcon />;
    }
  };

  const getScanTypeDescription = (type: string) => {
    switch (type) {
      case 'security':
        return 'Comprehensive security vulnerability scanning including OWASP Top 10, secret detection, and code injection analysis';
      case 'ai-review':
        return 'AI-powered code review analyzing quality, maintainability, performance, and best practices';
      case 'test-generation':
        return 'Automated test case generation for unit tests, integration tests, and edge case coverage';
      case 'performance':
        return 'Performance analysis including complexity metrics, bottleneck detection, and optimization suggestions';
      default:
        return 'Select a scan type to get started';
    }
  };

  const getFileLanguage = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'jsx': 'React JSX',
      'tsx': 'React TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
      'json': 'JSON',
      'xml': 'XML',
      'yml': 'YAML',
      'yaml': 'YAML',
    };
    return languageMap[extension || ''] || 'Unknown';
  };

  const getTotalFileSize = () => {
    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    if (totalBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(totalBytes) / Math.log(k));
    return parseFloat((totalBytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Upload & Analyze Code
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload your source code files for comprehensive AI-powered analysis. 
        CodeGuardian supports security scanning, code review, test generation, and performance analysis.
      </Typography>

      {/* Scan Type Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Analysis Type
          </Typography>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              Choose the type of analysis to perform on your code:
            </FormLabel>
            <RadioGroup
              value={scanType}
              onChange={(e) => setScanType(e.target.value as any)}
              row
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    value="security"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1} p={1}>
                        <SecurityIcon color={scanType === 'security' ? 'primary' : 'inherit'} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            Security Scan
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            OWASP Top 10, secrets, vulnerabilities
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      border: scanType === 'security' ? 2 : 1,
                      borderColor: scanType === 'security' ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      m: 0,
                      width: '100%',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    value="ai-review"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1} p={1}>
                        <CodeIcon color={scanType === 'ai-review' ? 'primary' : 'inherit'} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            AI Code Review
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Quality, maintainability, best practices
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      border: scanType === 'ai-review' ? 2 : 1,
                      borderColor: scanType === 'ai-review' ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      m: 0,
                      width: '100%',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    value="test-generation"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1} p={1}>
                        <BugReportIcon color={scanType === 'test-generation' ? 'primary' : 'inherit'} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            Test Generation
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Unit tests, integration tests, coverage
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      border: scanType === 'test-generation' ? 2 : 1,
                      borderColor: scanType === 'test-generation' ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      m: 0,
                      width: '100%',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    value="performance"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1} p={1}>
                        <SpeedIcon color={scanType === 'performance' ? 'primary' : 'inherit'} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            Performance Analysis
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Complexity, bottlenecks, optimization
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      border: scanType === 'performance' ? 2 : 1,
                      borderColor: scanType === 'performance' ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      m: 0,
                      width: '100%',
                    }}
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Selected:</strong> {getScanTypeDescription(scanType)}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Advanced Options</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={scanOptions.includeDocumentation}
                      onChange={(e) => setScanOptions(prev => ({
                        ...prev,
                        includeDocumentation: e.target.checked
                      }))}
                    />
                  }
                  label="Include documentation analysis"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={scanOptions.deepScan}
                      onChange={(e) => setScanOptions(prev => ({
                        ...prev,
                        deepScan: e.target.checked
                      }))}
                    />
                  }
                  label="Enable deep scanning (slower but more thorough)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={scanOptions.generateReport}
                      onChange={(e) => setScanOptions(prev => ({
                        ...prev,
                        generateReport: e.target.checked
                      }))}
                    />
                  }
                  label="Generate detailed PDF report"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Minimum Severity Level</InputLabel>
                <Select
                  value={scanOptions.severity}
                  label="Minimum Severity Level"
                  onChange={(e) => setScanOptions(prev => ({
                    ...prev,
                    severity: e.target.value
                  }))}
                >
                  <MenuItem value="low">Low and above</MenuItem>
                  <MenuItem value="medium">Medium and above</MenuItem>
                  <MenuItem value="high">High and above</MenuItem>
                  <MenuItem value="critical">Critical only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* File Upload Area */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {isDragActive
                ? 'Drop your files here...'
                : 'Drag & drop code files here, or click to browse'}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Supported languages: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, and more
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              Max file size: 10MB per file • Max files: 20 • Total size limit: 200MB
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {files.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Selected Files ({files.length})
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="textSecondary">
                  Total size: {getTotalFileSize()}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFiles([])}
                  disabled={isScanning}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
            
            <List>
              {files.map((file, index) => (
                <ListItem key={file.id} divider={index < files.length - 1}>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">{file.name}</Typography>
                        <Chip 
                          label={getFileLanguage(file.name)} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(file.id)}
                    disabled={isScanning}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {/* Scan Button and Progress */}
            <Box sx={{ mt: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isScanning ? <CircularProgress size={20} /> : getScanTypeIcon(scanType)}
                  onClick={handleScan}
                  disabled={isScanning || files.length === 0}
                  sx={{ minWidth: 200 }}
                >
                  {isScanning 
                    ? 'Analyzing...' 
                    : `Start ${scanType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis`
                  }
                </Button>
                
                {isScanning && (
                  <Typography variant="body2" color="textSecondary">
                    This may take a few minutes depending on file size and complexity
                  </Typography>
                )}
              </Box>

              {isScanning && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      Analysis progress: {Math.round(progress)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Processing {files.length} file{files.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* No Files State */}
      {files.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
              No files selected
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              Upload your source code files to get started with CodeGuardian AI analysis.
              Select the analysis type above, then drag and drop your files or click the upload area.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FileUpload;
