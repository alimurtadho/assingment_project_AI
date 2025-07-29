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
  LinearProgress
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle
} from '@mui/icons-material';

interface SecurityReportProps {
  results: {
    success: boolean;
    filename: string;
    riskScore: number;
    vulnerabilities: Array<{
      type: string;
      category: string;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      description: string;
      line: number;
      code: string;
      recommendation: string;
    }>;
    summary: {
      totalIssues: number;
      high: number;
      medium: number;
      low: number;
      categories: string[];
    };
    recommendations: Array<{
      priority: string;
      title: string;
      description: string;
    }>;
  };
}

const SecurityReport: React.FC<SecurityReportProps> = ({ results }) => {
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'error';
    if (score >= 5) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Scan Results
      </Typography>

      {/* Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          File: {results.filename}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Risk Score: {results.riskScore}/10
          </Typography>
          <LinearProgress
            variant="determinate"
            value={results.riskScore * 10}
            color={getRiskScoreColor(results.riskScore) as any}
            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={`Total: ${results.summary.totalIssues}`} 
            variant="outlined" 
          />
          {results.summary.high > 0 && (
            <Chip 
              label={`High: ${results.summary.high}`} 
              color="error" 
              size="small"
            />
          )}
          {results.summary.medium > 0 && (
            <Chip 
              label={`Medium: ${results.summary.medium}`} 
              color="warning" 
              size="small"
            />
          )}
          {results.summary.low > 0 && (
            <Chip 
              label={`Low: ${results.summary.low}`} 
              color="info" 
              size="small"
            />
          )}
        </Box>

        {results.summary.categories.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Categories: {results.summary.categories.join(', ')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Vulnerabilities */}
      {results.vulnerabilities.length > 0 && (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            Vulnerabilities Found
          </Typography>
          <List>
            {results.vulnerabilities.map((vuln, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getSeverityIcon(vuln.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {vuln.type}
                        </Typography>
                        <Chip 
                          label={vuln.severity} 
                          size="small" 
                          color={getSeverityColor(vuln.severity) as any}
                        />
                        <Chip 
                          label={`Line ${vuln.line}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {vuln.description}
                        </Typography>
                        
                        <Paper 
                          variant="outlined" 
                          sx={{ p: 1, mb: 1, backgroundColor: 'grey.50' }}
                        >
                          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
                            {vuln.code}
                          </Typography>
                        </Paper>
                        
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Recommendation:</strong> {vuln.recommendation}
                          </Typography>
                        </Alert>
                      </Box>
                    }
                  />
                </ListItem>
                {index < results.vulnerabilities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Recommendations */}
      {results.recommendations.length > 0 && (
        <Paper elevation={2}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            General Recommendations
          </Typography>
          <List>
            {results.recommendations.map((rec, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {rec.title}
                        </Typography>
                        <Chip 
                          label={rec.priority} 
                          size="small" 
                          color={rec.priority === 'HIGH' ? 'error' : 'primary'}
                        />
                      </Box>
                    }
                    secondary={rec.description}
                  />
                </ListItem>
                {index < results.recommendations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {results.vulnerabilities.length === 0 && (
        <Alert severity="success">
          <Typography variant="body1">
            🎉 No security vulnerabilities found in {results.filename}!
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SecurityReport;
