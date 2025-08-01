// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  SECURITY_SCAN: `${API_BASE_URL}/api/security/scan`,
  AI_REVIEW: `${API_BASE_URL}/api/ai-review/review`,
  TEST_GENERATION: `${API_BASE_URL}/api/test-gen/generate`,
  HEALTH: `${API_BASE_URL}/health`,
};

export { API_BASE_URL };
