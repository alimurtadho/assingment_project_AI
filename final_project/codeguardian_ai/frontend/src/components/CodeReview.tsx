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
  AccordionDetails
} from '@mui/material';
import {
  Psychology,
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';

interface CodeReviewProps {
  results: {
    success: boolean;
    filename: string;
    review: {
      overallScore: number;
      summary: string;
      issues: Array<{
        type: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        line?: number;
        description: string;
        recommendation: string;
        example?: string;
      }>;
      strengths: string[];
      suggestions: string[];
    };
  };
}

const CodeReview: React.FC<CodeReviewProps> = ({ results }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <Error color="error" />;
      case 'MEDIUM': return <Warning color="warning" />;
      case 'LOW': return <Info color="info" />;
      default: return <CheckCircle color="success" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Code Review Results
      </Typography>

      {/* Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Psychology color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            File: {results.filename}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ mr: 2 }}>
            {results.review.overallScore}/10
          </Typography>
          <Chip 
            label={getScoreLabel(results.review.overallScore)} 
            color={getScoreColor(results.review.overallScore) as any}
            sx={{ fontSize: '1rem', padding: '8px 16px' }}
          />
        </Box>

        <Typography variant="body1" color="text.secondary">
          {results.review.summary}
        </Typography>
      </Paper>

      {/* Issues */}
      {results.review.issues.length > 0 && (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            Issues Found ({results.review.issues.length})
          </Typography>
          <List>
            {results.review.issues.map((issue, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getSeverityIcon(issue.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2">
                          {issue.type}
                        </Typography>
                        <Chip 
                          label={issue.severity} 
                          size="small" 
                          color={getSeverityColor(issue.severity) as any}
                        />
                        {issue.line && (
                          <Chip 
                            label={`Line ${issue.line}`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {issue.description}
                        </Typography>
                        
                        <Alert severity="info" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </Typography>
                        </Alert>

                        {issue.example && (
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography variant="body2" color="primary">
                                View Example
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Paper 
                                variant="outlined" 
                                sx={{ p: 2, backgroundColor: 'grey.50' }}
                              >
                                <Typography 
                                  variant="caption" 
                                  component="pre" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    overflow: 'auto'
                                  }}
                                >
                                  {issue.example}
                                </Typography>
                              </Paper>
                            </AccordionDetails>
                          </Accordion>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < results.review.issues.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Strengths */}
      {results.review.strengths.length > 0 && (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            Code Strengths
          </Typography>
          <List>
            {results.review.strengths.map((strength, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary={strength} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Suggestions */}
      {results.review.suggestions.length > 0 && (
        <Paper elevation={2}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            General Suggestions
          </Typography>
          <List>
            {results.review.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {results.review.issues.length === 0 && (
        <Alert severity="success">
          <Typography variant="body1">
            🎉 Excellent code quality! No significant issues found in {results.filename}.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default CodeReview;
