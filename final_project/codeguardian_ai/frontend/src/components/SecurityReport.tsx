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
  // Add safety checks and default values
  const safeResults = {
    success: results?.success ?? false,
    filename: results?.filename ?? 'unknown',
    riskScore: results?.riskScore ?? 0,
    vulnerabilities: Array.isArray(results?.vulnerabilities) ? results.vulnerabilities : [],
    summary: {
      totalIssues: results?.summary?.totalIssues ?? 0,
      high: results?.summary?.high ?? 0,
      medium: results?.summary?.medium ?? 0,
      low: results?.summary?.low ?? 0,
      categories: Array.isArray(results?.summary?.categories) ? results.summary.categories : []
    },
    recommendations: Array.isArray(results?.recommendations) ? results.recommendations : []
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
          File: {safeResults.filename}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Risk Score: {safeResults.riskScore}/10
          </Typography>
          <LinearProgress
            variant="determinate"
            value={safeResults.riskScore * 10}
            color={getRiskScoreColor(safeResults.riskScore) as any}
            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={`Total: ${safeResults.summary.totalIssues}`} 
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

        {safeResults.summary.categories.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Categories: {safeResults.summary.categories.join(', ')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Vulnerabilities */}
      {safeResults.vulnerabilities.length > 0 && (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            Vulnerabilities Found
          </Typography>
          <List>
            {safeResults.vulnerabilities.map((vuln, index) => (
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
                          label={`Line ${vuln.line || 'N/A'}`} 
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
                        
                        {vuln.code && (
                          <Paper 
                            variant="outlined" 
                            sx={{ p: 1, mb: 1, backgroundColor: 'grey.50' }}
                          >
                            <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
                              {vuln.code}
                            </Typography>
                          </Paper>
                        )}
                        
                        {vuln.recommendation && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Recommendation:</strong> {vuln.recommendation}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < safeResults.vulnerabilities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Recommendations */}
      {safeResults.recommendations.length > 0 && (
        <Paper elevation={2}>
          <Typography variant="subtitle1" sx={{ p: 2, pb: 0 }}>
            General Recommendations
          </Typography>
          <List>
            {safeResults.recommendations.map((rec, index) => (
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
                {index < safeResults.recommendations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {safeResults.vulnerabilities.length === 0 && (
        <Alert severity="success">
          <Typography variant="body1">
            🎉 No security vulnerabilities found in {safeResults.filename}!
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SecurityReport;
