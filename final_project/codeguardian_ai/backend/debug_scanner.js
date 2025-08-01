const securityScanner = require('./services/securityScanner');

async function testScanner() {
  try {
    const code = `
const API_KEY = "sk-1234567890abcdef";
const config = {
  apiKey: "abc123def456ghi789"
};
      `;
    console.log('Testing code:');
    console.log(code);
    
    const result = await securityScanner.scanCode(code, 'test.js');
    console.log('Found vulnerabilities:', result.vulnerabilities.length);
    result.vulnerabilities.forEach((v, i) => {
      console.log(`${i+1}. Type: ${v.type}, Severity: ${v.severity}, Matched: ${v.matchedText}`);
    });
  } catch (error) {
    console.error('Error during scan:', error);
  }
}

testScanner();
