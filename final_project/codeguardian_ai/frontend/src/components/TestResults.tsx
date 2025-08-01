import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import {
  BugReport,
  ExpandMore,
  Download,
  Assessment,
  CheckCircle
} from '@mui/icons-material';

interface TestResultsProps {
  results: {
    success: boolean;
    filename: string;
    tests: {
      testFile: string;
      testCases: Array<{
        function: string;
        description: string;
        type: 'unit' | 'integration' | 'edge-case';
        scenario: string;
      }>;
      coverage: {
        estimatedPercentage: number;
        coveredFunctions: string[];
        recommendations: string[];
      };
      framework: string;
      dependencies: string[];
      metadata?: {
        originalFile: string;
        language: string;
        framework: string;
        generatedAt: string;
      };
    };
  };
}

const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  // Safety checks for potentially undefined data
  const safeResults = {
    success: results?.success || false,
    filename: results?.filename || 'unknown_file',
    tests: {
      testFile: results?.tests?.testFile || '// No test file generated',
      testCases: Array.isArray(results?.tests?.testCases) ? results.tests.testCases : [],
      coverage: {
        estimatedPercentage: results?.tests?.coverage?.estimatedPercentage || 0,
        coveredFunctions: Array.isArray(results?.tests?.coverage?.coveredFunctions) 
          ? results.tests.coverage.coveredFunctions : [],
        recommendations: Array.isArray(results?.tests?.coverage?.recommendations) 
          ? results.tests.coverage.recommendations : []
      },
      framework: results?.tests?.framework || 'Jest',
      dependencies: Array.isArray(results?.tests?.dependencies) ? results.tests.dependencies : [],
      metadata: results?.tests?.metadata || {
        originalFile: 'unknown',
        language: 'unknown',
        framework: 'Jest',
        generatedAt: new Date().toISOString()
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit': return 'primary';
      case 'integration': return 'secondary';
      case 'edge-case': return 'warning';
      default: return 'default';
    }
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const downloadTestFile = () => {
    const element = document.createElement('a');
    const file = new Blob([safeResults.tests.testFile], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${safeResults.filename.replace(/\.[^/.]+$/, '')}.test.js`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Test Generation Results
      </Typography>

      {/* Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BugReport color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Generated Tests for: {safeResults.filename}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`${safeResults.tests.testCases.length} Test Cases`} 
            color="primary" 
          />
          <Chip 
            label={`Framework: ${safeResults.tests.framework}`} 
            variant="outlined" 
          />
          <Chip 
            label={`Coverage: ${safeResults.tests.coverage.estimatedPercentage}%`} 
            color={getCoverageColor(safeResults.tests.coverage.estimatedPercentage) as any}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={downloadTestFile}
          sx={{ mt: 1 }}
        >
          Download Test File
        </Button>
      </Paper>

      {/* Test Cases */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
          Generated Test Cases
        </Typography>
        {safeResults.tests.testCases.length > 0 ? (
          <List>
            {safeResults.tests.testCases.map((testCase, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2">
                          {testCase.function || `Test Case ${index + 1}`}
                        </Typography>
                        <Chip 
                          label={testCase.type || 'unit'} 
                          size="small" 
                          color={getTypeColor(testCase.type || 'unit') as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          <strong>Description:</strong> {testCase.description || 'No description available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Scenario:</strong> {testCase.scenario || 'No scenario specified'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < safeResults.tests.testCases.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              No test cases were generated. Try uploading a file with functions or classes.
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Coverage Information */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Test Coverage Analysis
        </Typography>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Estimated Coverage: {safeResults.tests.coverage.estimatedPercentage}%
          </Typography>
          
          {safeResults.tests.coverage.coveredFunctions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Covered Functions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {safeResults.tests.coverage.coveredFunctions.map((func, index) => (
                  <Chip 
                    key={index}
                    label={func} 
                    size="small" 
                    variant="outlined" 
                    color="success"
                  />
                ))}
              </Box>
            </Box>
          )}

          {safeResults.tests.coverage.recommendations.length > 0 && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Recommendations:
              </Typography>
              <List dense>
                {safeResults.tests.coverage.recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={rec}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Generated Test File Preview */}
      <Paper elevation={2}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">
              Preview Generated Test File
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                backgroundColor: 'grey.50',
                maxHeight: 400,
                overflow: 'auto'
              }}
            >
              <Typography 
                variant="caption" 
                component="pre" 
                sx={{ 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.75rem',
                  lineHeight: 1.4
                }}
              >
                {safeResults.tests.testFile}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Dependencies */}
      {safeResults.tests.dependencies.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Required Dependencies:</strong> {safeResults.tests.dependencies.join(', ')}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default TestResults;
