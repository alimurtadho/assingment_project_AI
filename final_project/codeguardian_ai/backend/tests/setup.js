// Jest setup file for backend tests
const { PrismaClient } = require('@prisma/client');

// Setup test database
beforeAll(async () => {
  // Initialize test database if needed
});

afterAll(async () => {
  // Cleanup test database if needed
});

// Mock OpenAI API for tests
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    overallScore: 8,
                    summary: "Mock AI response",
                    issues: [],
                    strengths: ["Well structured code"],
                    suggestions: []
                  })
                }
              }]
            })
          }
        }
      };
    })
  };
});

// Global test timeout
jest.setTimeout(10000);
