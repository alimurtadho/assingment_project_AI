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
    qualityScore: number;
    issues: Array<{
      type: string;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      line?: number;
      description: string;
      suggestion: string;
      category: string;
    }>;
    suggestions: Array<{
      title: string;
      description: string;
      priority: string;
      category: string;
    }>;
    summary: {
      totalIssues: number;
      high: number;
      medium: number;
      low: number;
      categories: string[];
    };
    language: string;
    timestamp: string;
  };
}

const CodeReview: React.FC<CodeReviewProps> = ({ results }) => {
  // Add safety checks
  const safeResults = {
    success: results?.success ?? false,
    filename: results?.filename ?? 'unknown',
    qualityScore: results?.qualityScore ?? 0,
    issues: Array.isArray(results?.issues) ? results.issues : [],
    suggestions: Array.isArray(results?.suggestions) ? results.suggestions : [],
    summary: {
      totalIssues: results?.summary?.totalIssues ?? 0,
      high: results?.summary?.high ?? 0,
      medium: results?.summary?.medium ?? 0,
      low: results?.summary?.low ?? 0,
      categories: Array.isArray(results?.summary?.categories) ? results.summary.categories : []
    },
    language: results?.language ?? 'unknown',
    timestamp: results?.timestamp ?? new Date().toISOString()
  };

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
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
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
            File: {safeResults.filename}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ mr: 2 }}>
            {safeResults.qualityScore}/100
          </Typography>
          <Chip 
            label={getScoreLabel(safeResults.qualityScore)} 
            color={getScoreColor(safeResults.qualityScore) as any}
            sx={{ fontSize: '1rem', padding: '8px 16px' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={`Total Issues: ${safeResults.summary.totalIssues}`} 
            variant="outlined" 
          />
          {safeResults.summary.high > 0 && (
            <Chip 
              label={`High: ${safeResults.summary.high}`} 
              color="error" 
              size="small"
            />
          )}
          {safeResults.summary.medium > 0 && (
            <Chip 
              label={`Medium: ${safeResults.summary.medium}`} 
              color="warning" 
              size="small"
            />
          )}
          {safeResults.summary.low > 0 && (
            <Chip 
              label={`Low: ${safeResults.summary.low}`} 
              color="info" 
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* Issues */}
      {safeResults.issues.length > 0 && (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            Issues Found ({safeResults.issues.length})
          </Typography>
          <List>
            {safeResults.issues.map((issue, index) => (
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
                        <Chip 
                          label={issue.category} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {issue.description}
                        </Typography>
                        
                        <Alert severity="info" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </Typography>
                        </Alert>
                      </Box>
                    }
                  />
                </ListItem>
                {index < safeResults.issues.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Suggestions */}
      {safeResults.suggestions.length > 0 && (
        <Paper elevation={2}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            Improvement Suggestions
          </Typography>
          <List>
            {safeResults.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Psychology color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {suggestion.title}
                      </Typography>
                      <Chip 
                        label={suggestion.priority} 
                        size="small" 
                        color={suggestion.priority === 'HIGH' ? 'error' : 'primary'}
                      />
                      <Chip 
                        label={suggestion.category} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={suggestion.description}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {safeResults.issues.length === 0 && (
        <Alert severity="success">
          <Typography variant="body1">
            🎉 Great job! No major code quality issues found in {safeResults.filename}!
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default CodeReview;
