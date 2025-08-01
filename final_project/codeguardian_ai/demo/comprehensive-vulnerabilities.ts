// Enhanced demo file for testing comprehensive security vulnerabilities
// This file contains multiple security issues for demonstration purposes

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
}

// ⚠️ SECURITY ISSUE #1: Hardcoded API Keys
const OPENAI_API_KEY = "sk-1234567890abcdef1234567890abcdef12345678901234567890"; // High Risk
const DATABASE_PASSWORD = "admin123!@#"; // High Risk
const JWT_SECRET = "mysecretjwtkey"; // High Risk

// ⚠️ SECURITY ISSUE #2: SQL Injection Vulnerabilities
export function getUserByEmail(email: string): Promise<UserProfile | null> {
  // Direct string concatenation - SQL injection vulnerability
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  return executeQuery(query);
}

export function searchUsers(searchTerm: string, sortBy: string): Promise<UserProfile[]> {
  // Another SQL injection vulnerability
  const query = `SELECT * FROM users WHERE username LIKE '%${searchTerm}%' ORDER BY ${sortBy}`;
  return executeQuery(query);
}

// ⚠️ SECURITY ISSUE #3: Cross-Site Scripting (XSS)
export function displayUserProfile(userInput: string): string {
  // Direct HTML injection without sanitization
  const profileHtml = `<div class="profile">
    <h2>Welcome ${userInput}</h2>
    <p>Last login: ${new Date().toLocaleDateString()}</p>
  </div>`;
  
  document.getElementById('profile-container')!.innerHTML = profileHtml; // XSS vulnerability
  return profileHtml;
}

export function renderNotification(message: string): void {
  // Another XSS vulnerability through DOM manipulation
  document.write(`<div class="notification">${message}</div>`);
}

// ⚠️ SECURITY ISSUE #4: Weak Cryptographic Algorithms
import * as crypto from 'crypto';

export function hashPassword(password: string): string {
  // MD5 is cryptographically broken
  return crypto.createHash('md5').update(password).digest('hex');
}

export function generateSessionToken(): string {
  // SHA1 is also considered weak
  const timestamp = Date.now().toString();
  return crypto.createHash('sha1').update(timestamp + JWT_SECRET).digest('hex');
}

// ⚠️ SECURITY ISSUE #5: Insecure Random Number Generation
export function generatePasswordResetToken(): string {
  // Math.random() is not cryptographically secure
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// ⚠️ SECURITY ISSUE #6: Hardcoded Database Connections
const DATABASE_CONFIG = {
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password123', // Hardcoded password
  database: 'production_db'
};

export function connectToDatabase() {
  const connectionString = `postgresql://${DATABASE_CONFIG.username}:${DATABASE_CONFIG.password}@${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}/${DATABASE_CONFIG.database}`;
  return connectionString;
}

// ⚠️ SECURITY ISSUE #7: Command Injection
export function executeSystemCommand(userInput: string): Promise<string> {
  const { exec } = require('child_process');
  
  // Direct command execution with user input - command injection vulnerability
  return new Promise((resolve, reject) => {
    exec(`ls -la ${userInput}`, (error: any, stdout: string, stderr: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// ⚠️ SECURITY ISSUE #8: Path Traversal
export function readUserFile(fileName: string): Promise<string> {
  const fs = require('fs').promises;
  
  // No validation of file path - path traversal vulnerability
  const filePath = `./uploads/${fileName}`;
  return fs.readFile(filePath, 'utf8');
}

// ⚠️ SECURITY ISSUE #9: Insecure Deserialization
export function processUserData(serializedData: string): any {
  // eval() with user input - extremely dangerous
  return eval(`(${serializedData})`);
}

// ⚠️ SECURITY ISSUE #10: Missing Authentication
export function deleteUser(userId: number): Promise<boolean> {
  // No authentication check - anyone can delete users
  const query = `DELETE FROM users WHERE id = ${userId}`;
  return executeQuery(query).then(() => true);
}

// ⚠️ SECURITY ISSUE #11: Information Disclosure
export function handleError(error: Error, userEmail: string): void {
  // Logging sensitive information
  console.log(`Error for user ${userEmail}: ${error.stack}`);
  console.log(`Database password: ${DATABASE_PASSWORD}`);
  console.log(`API Key: ${OPENAI_API_KEY}`);
}

// ⚠️ SECURITY ISSUE #12: Insecure HTTP Requests
export async function fetchExternalData(url: string): Promise<any> {
  const https = require('https');
  
  // Disabled SSL verification - man-in-the-middle attacks possible
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  
  const response = await fetch(url, { agent });
  return response.json();
}

// ⚠️ SECURITY ISSUE #13: Regex DoS (ReDoS)
export function validateEmail(email: string): boolean {
  // Vulnerable regex pattern that can cause ReDoS
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

// Helper function (mock)
async function executeQuery(query: string): Promise<any> {
  // Mock database execution
  return new Promise(resolve => {
    setTimeout(() => resolve(null), 100);
  });
}

// Additional hardcoded secrets for testing
const STRIPE_SECRET_KEY = "sk_live_1234567890abcdef1234567890abcdef";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const GITHUB_TOKEN = "ghp_1234567890abcdef1234567890abcdef123456";

export { 
  OPENAI_API_KEY, 
  DATABASE_PASSWORD, 
  STRIPE_SECRET_KEY, 
  AWS_SECRET_ACCESS_KEY, 
  GITHUB_TOKEN 
};
