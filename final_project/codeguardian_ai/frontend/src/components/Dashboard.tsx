import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

import { ScanResult, DashboardMetrics } from '../types';
import apiService from '../services/api';

interface DashboardProps {
  scanResults: ScanResult[];
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ scanResults, loading }) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    loadDashboardMetrics();
  }, [selectedTimeRange]);

  const loadDashboardMetrics = async () => {
    try {
      setMetricsLoading(true);
      const dashboardMetrics = await apiService.getDashboardMetrics();
      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  const getMetricCardData = () => {
    if (!metrics) return [];

    return [
      {
        title: 'Total Scans',
        value: metrics.totalScans,
        icon: <SecurityIcon />,
        color: theme.palette.primary.main,
        trend: '+12%',
        trendUp: true,
      },
      {
        title: 'Vulnerabilities Found',
        value: metrics.vulnerabilitiesFound,
        icon: <WarningIcon />,
        color: theme.palette.error.main,
        trend: '-8%',
        trendUp: false,
      },
      {
        title: 'Average Risk Score',
        value: `${metrics.averageRiskScore}/100`,
        icon: <SpeedIcon />,
        color: metrics.averageRiskScore > 70 ? theme.palette.error.main : 
               metrics.averageRiskScore > 50 ? theme.palette.warning.main : 
               theme.palette.success.main,
        trend: '-5%',
        trendUp: false,
      },
      {
        title: 'Test Coverage +',
        value: `+${metrics.testCoverageImprovement}%`,
        icon: <CheckCircleIcon />,
        color: theme.palette.success.main,
        trend: '+15%',
        trendUp: true,
      },
    ];
  };

  const getTrendChartData = () => {
    if (!metrics?.trendData) return null;

    return {
      labels: metrics.trendData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Scans',
          data: metrics.trendData.map(d => d.scans),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light,
          tension: 0.4,
        },
        {
          label: 'Vulnerabilities',
          data: metrics.trendData.map(d => d.vulnerabilities),
          borderColor: theme.palette.error.main,
          backgroundColor: theme.palette.error.light,
          tension: 0.4,
        },
        {
          label: 'Fixes',
          data: metrics.trendData.map(d => d.fixes),
          borderColor: theme.palette.success.main,
          backgroundColor: theme.palette.success.light,
          tension: 0.4,
        },
      ],
    };
  };

  const getLanguageChartData = () => {
    if (!metrics?.languageDistribution) return null;

    return {
      labels: metrics.languageDistribution.map(l => l.language),
      datasets: [
        {
          data: metrics.languageDistribution.map(l => l.count),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
          borderWidth: 2,
          borderColor: theme.palette.background.paper,
        },
      ],
    };
  };

  const getSecurityTrendsChartData = () => {
    if (!metrics?.securityTrends) return null;

    return {
      labels: metrics.securityTrends.map(s => s.category),
      datasets: [
        {
          label: 'Vulnerabilities',
          data: metrics.securityTrends.map(s => s.count),
          backgroundColor: metrics.securityTrends.map(s => {
            switch (s.severity) {
              case 'critical': return theme.palette.error.main;
              case 'high': return theme.palette.error.light;
              case 'medium': return theme.palette.warning.main;
              case 'low': return theme.palette.info.main;
              default: return theme.palette.grey[500];
            }
          }),
          borderWidth: 1,
        },
      ],
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan': return <SecurityIcon />;
      case 'vulnerability': return <WarningIcon />;
      case 'review': return <CodeIcon />;
      case 'fix': return <CheckCircleIcon />;
      default: return <SecurityIcon />;
    }
  };

  if (loading || metricsLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <LinearProgress sx={{ mb: 3 }} />
        <Alert severity="info">Loading dashboard metrics...</Alert>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="warning">
          Failed to load dashboard metrics. Please check your connection and try again.
        </Alert>
      </Box>
    );
  }

  const trendChartData = getTrendChartData();
  const languageChartData = getLanguageChartData();
  const securityTrendsChartData = getSecurityTrendsChartData();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          CodeGuardian AI Dashboard
        </Typography>
        <Tabs
          value={selectedTimeRange}
          onChange={(e, value) => setSelectedTimeRange(value)}
          variant="standard"
        >
          <Tab label="7 Days" value="7d" />
          <Tab label="30 Days" value="30d" />
          <Tab label="90 Days" value="90d" />
        </Tabs>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        {getMetricCardData().map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={metric.color}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {metric.trendUp ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="caption"
                        color={metric.trendUp ? 'success.main' : 'error.main'}
                      >
                        {metric.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ color: metric.color, fontSize: 40 }}>
                    {metric.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Trends
              </Typography>
              {trendChartData && (
                <Box sx={{ height: 300 }}>
                  <Line
                    data={trendChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Language Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Language Distribution
              </Typography>
              {languageChartData && (
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={languageChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Categories */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vulnerability Categories
              </Typography>
              {securityTrendsChartData && (
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={securityTrendsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {metrics.recentActivity.map((activity, index) => (
                  <ListItem key={activity.id} divider={index < metrics.recentActivity.length - 1}>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                          {activity.severity && (
                            <Chip
                              label={activity.severity}
                              size="small"
                              color={getSeverityColor(activity.severity) as any}
                              variant="outlined"
                            />
                          )}
                          {activity.filename && (
                            <Chip
                              label={activity.filename}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
