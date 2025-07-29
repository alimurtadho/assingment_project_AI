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
    const file = new Blob([results.tests.testFile], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${results.filename.replace(/\.[^/.]+$/, '')}.test.js`;
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
            Generated Tests for: {results.filename}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`${results.tests.testCases.length} Test Cases`} 
            color="primary" 
          />
          <Chip 
            label={`Framework: ${results.tests.framework}`} 
            variant="outlined" 
          />
          <Chip 
            label={`Coverage: ${results.tests.coverage.estimatedPercentage}%`} 
            color={getCoverageColor(results.tests.coverage.estimatedPercentage) as any}
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
        <List>
          {results.tests.testCases.map((testCase, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2">
                        {testCase.function}
                      </Typography>
                      <Chip 
                        label={testCase.type} 
                        size="small" 
                        color={getTypeColor(testCase.type) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>Description:</strong> {testCase.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Scenario:</strong> {testCase.scenario}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < results.tests.testCases.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Coverage Information */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Test Coverage Analysis
        </Typography>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Estimated Coverage: {results.tests.coverage.estimatedPercentage}%
          </Typography>
          
          {results.tests.coverage.coveredFunctions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Covered Functions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {results.tests.coverage.coveredFunctions.map((func, index) => (
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

          {results.tests.coverage.recommendations.length > 0 && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Recommendations:
              </Typography>
              <List dense>
                {results.tests.coverage.recommendations.map((rec, index) => (
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
                {results.tests.testFile}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Dependencies */}
      {results.tests.dependencies.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Required Dependencies:</strong> {results.tests.dependencies.join(', ')}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default TestResults;
