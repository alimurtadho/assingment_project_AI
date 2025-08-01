#!/usr/bin/env node

/**
 * Test Script for Test Generator Functionality
 * Tests the /api/test-gen/generate endpoint with various code samples
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

// Test cases
const testCases = [
    {
        name: "Simple Function",
        code: `function calculateSum(a, b) {
    return a + b;
}

function calculateProduct(x, y) {
    return x * y;
}`,
        language: "javascript"
    },
    {
        name: "Class with Methods",
        code: `class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(a, b) {
        this.result = a + b;
        return this.result;
    }
    
    multiply(a, b) {
        this.result = a * b;
        return this.result;
    }
}`,
        language: "javascript"
    },
    {
        name: "Async Function with API Call",
        code: `async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}`,
        language: "javascript"
    },
    {
        name: "Empty Code",
        code: "",
        language: "javascript"
    }
];

async function testEndpoint(testCase) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('=' .repeat(50));
    
    try {
        const response = await axios.post(`${BACKEND_URL}/api/test-gen/generate`, {
            code: testCase.code,
            language: testCase.language
        });
        
        const data = response.data;
        
        if (data.success) {
            console.log('✅ SUCCESS');
            console.log(`📁 Filename: ${data.filename}`);
            console.log(`🧩 Test Cases: ${data.tests.testCases.length}`);
            console.log(`📊 Estimated Coverage: ${data.tests.coverage.estimatedPercentage}%`);
            console.log(`🔧 Framework: ${data.tests.framework}`);
            console.log(`📦 Dependencies: ${data.tests.dependencies.join(', ')}`);
            
            console.log('\n📝 Generated Test Cases:');
            data.tests.testCases.forEach((tc, index) => {
                console.log(`  ${index + 1}. ${tc.function} (${tc.type})`);
                console.log(`     Description: ${tc.description}`);
            });
            
            if (data.tests.coverage.recommendations.length > 0) {
                console.log('\n💡 Recommendations:');
                data.tests.coverage.recommendations.forEach((rec, index) => {
                    console.log(`  ${index + 1}. ${rec}`);
                });
            }
            
        } else {
            console.log('❌ FAILED');
            console.log(`Error: ${data.error?.message || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.log('❌ REQUEST FAILED');
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Error: ${error.response.data?.error?.message || error.response.statusText}`);
        } else {
            console.log(`Error: ${error.message}`);
        }
    }
}

async function runAllTests() {
    console.log('🚀 CodeGuardian AI - Test Generator Testing');
    console.log('=' .repeat(60));
    
    // Check if backend is running
    try {
        const healthCheck = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Backend is running');
        console.log(`📊 Status: ${healthCheck.data.status}`);
        console.log(`🕐 Timestamp: ${healthCheck.data.timestamp}`);
    } catch (error) {
        console.log('❌ Backend is not running!');
        console.log('Please start the backend with: node backend/server.simple.js');
        return;
    }
    
    // Run all test cases
    for (const testCase of testCases) {
        await testEndpoint(testCase);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Go to "Test Generator" tab');
    console.log('3. Upload a JavaScript file');
    console.log('4. Verify that test generation works without errors');
}

// Run tests
runAllTests().catch(console.error);
