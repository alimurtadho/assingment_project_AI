import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { Security, Psychology, BugReport } from '@mui/icons-material';
import FileUpload from './components/FileUpload';
import SecurityReport from './components/SecurityReport';
import CodeReview from './components/CodeReview';
import TestResults from './components/TestResults';
import { API_ENDPOINTS } from './config/api';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

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

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [scanResults, setScanResults] = useState<any>(null);
  const [reviewResults, setReviewResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Security sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CodeGuardian AI - DevSecOps Platform
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="CodeGuardian tabs">
              <Tab 
                icon={<Security />} 
                label="Security Scanner" 
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab 
                icon={<Psychology />} 
                label="AI Code Review" 
                id="tab-1"
                aria-controls="tabpanel-1"
              />
              <Tab 
                icon={<BugReport />} 
                label="Test Generator" 
                id="tab-2"
                aria-controls="tabpanel-2"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom>
              Security Vulnerability Scanner
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload your code files to scan for security vulnerabilities including hardcoded secrets, 
              SQL injection patterns, and other security issues.
            </Typography>
            <FileUpload 
              endpoint={API_ENDPOINTS.SECURITY_SCAN}
              onResults={setScanResults}
              acceptedTypes=".js,.ts,.py,.java,.cpp,.c,.php,.rb,.go,.rs"
            />
            {scanResults && <SecurityReport results={scanResults} />}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom>
              AI-Powered Code Review
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Get intelligent code review suggestions powered by AI. Identify code quality issues,
              performance concerns, and improvement opportunities.
            </Typography>
            <FileUpload 
              endpoint={API_ENDPOINTS.AI_REVIEW}
              onResults={setReviewResults}
              acceptedTypes=".js,.ts,.py,.java,.cpp,.c,.php,.rb,.go,.rs"
            />
            {reviewResults && <CodeReview results={reviewResults} />}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom>
              Automated Test Generator
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Generate comprehensive test cases for your code automatically. Create unit tests,
              integration tests, and improve test coverage.
            </Typography>
            <FileUpload 
              endpoint={API_ENDPOINTS.TEST_GENERATION}
              onResults={setTestResults}
              acceptedTypes=".js,.ts,.py,.java,.cpp,.c,.php,.rb,.go,.rs"
            />
            {testResults && <TestResults results={testResults} />}
          </TabPanel>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
