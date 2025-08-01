// Safe and secure code examples for comparison
// This file demonstrates proper security practices

export interface SecureUserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
}

// ✅ SECURE PRACTICE #1: Environment Variables for Secrets
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// ✅ SECURE PRACTICE #2: Parameterized Queries
export async function getUserByEmailSecure(email: string): Promise<SecureUserProfile | null> {
  // Using parameterized query to prevent SQL injection
  const query = 'SELECT * FROM users WHERE email = $1';
  const params = [email];
  return executeSecureQuery(query, params);
}

export async function searchUsersSecure(searchTerm: string, sortBy: string): Promise<SecureUserProfile[]> {
  // Validate and whitelist sort column
  const allowedSortColumns = ['username', 'email', 'created_at'];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'username';
  
  const query = 'SELECT * FROM users WHERE username ILIKE $1 ORDER BY ' + safeSortBy;
  const params = [`%${searchTerm}%`];
  return executeSecureQuery(query, params);
}

// ✅ SECURE PRACTICE #3: Input Sanitization and XSS Prevention
export function displayUserProfileSecure(userInput: string): string {
  // Sanitize input to prevent XSS
  const sanitizedInput = escapeHtml(userInput);
  
  const profileHtml = `<div class="profile">
    <h2>Welcome ${sanitizedInput}</h2>
    <p>Last login: ${new Date().toLocaleDateString()}</p>
  </div>`;
  
  // Use textContent instead of innerHTML when possible
  const container = document.getElementById('profile-container');
  if (container) {
    container.textContent = sanitizedInput;
  }
  
  return profileHtml;
}

// ✅ SECURE PRACTICE #4: Strong Cryptographic Algorithms
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export async function hashPasswordSecure(password: string): Promise<string> {
  // Use bcrypt with appropriate rounds for password hashing
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export function generateSecureToken(): string {
  // Use cryptographically secure random bytes
  return crypto.randomBytes(32).toString('hex');
}

export function hashDataSecure(data: string): string {
  // Use SHA-256 or better for hashing
  return crypto.createHash('sha256').update(data).digest('hex');
}

// ✅ SECURE PRACTICE #5: Secure Random Generation
export function generateSecurePasswordResetToken(): string {
  // Use crypto.randomBytes for cryptographically secure random generation
  return crypto.randomBytes(32).toString('base64url');
}

// ✅ SECURE PRACTICE #6: Secure Configuration Management
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    ssl: process.env.NODE_ENV === 'production'
  };
}

// ✅ SECURE PRACTICE #7: Input Validation and Command Injection Prevention
export async function listDirectorySecure(directory: string): Promise<string[]> {
  // Validate input and use allowlist
  const allowedDirectories = ['/uploads', '/tmp', '/var/logs'];
  
  if (!allowedDirectories.includes(directory)) {
    throw new Error('Access to directory not allowed');
  }
  
  const fs = require('fs').promises;
  try {
    const files = await fs.readdir(directory);
    return files.filter((file: string) => !file.startsWith('.')); // Filter hidden files
  } catch (error) {
    throw new Error('Failed to read directory');
  }
}

// ✅ SECURE PRACTICE #8: Path Traversal Prevention
export async function readUserFileSecure(fileName: string): Promise<string> {
  const path = require('path');
  const fs = require('fs').promises;
  
  // Validate filename and prevent path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    throw new Error('Invalid filename');
  }
  
  // Construct safe path
  const uploadDir = path.resolve('./uploads');
  const filePath = path.join(uploadDir, fileName);
  
  // Ensure the resolved path is still within the upload directory
  if (!filePath.startsWith(uploadDir)) {
    throw new Error('Path traversal attempt detected');
  }
  
  return fs.readFile(filePath, 'utf8');
}

// ✅ SECURE PRACTICE #9: Safe Deserialization
export function processUserDataSecure(jsonData: string): any {
  try {
    // Use JSON.parse instead of eval
    const data = JSON.parse(jsonData);
    
    // Validate the structure
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format');
    }
    
    // Additional validation based on expected schema
    return validateUserData(data);
  } catch (error) {
    throw new Error('Failed to parse user data');
  }
}

// ✅ SECURE PRACTICE #10: Authentication and Authorization
export async function deleteUserSecure(userId: number, currentUser: any): Promise<boolean> {
  // Check authentication
  if (!currentUser || !currentUser.id) {
    throw new Error('User not authenticated');
  }
  
  // Check authorization
  if (currentUser.role !== 'admin' && currentUser.id !== userId) {
    throw new Error('Insufficient permissions');
  }
  
  // Validate input
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid user ID');
  }
  
  const query = 'DELETE FROM users WHERE id = $1';
  const params = [userId];
  
  const result = await executeSecureQuery(query, params);
  return result.rowCount > 0;
}

// ✅ SECURE PRACTICE #11: Secure Error Handling
export function handleErrorSecure(error: Error, context: string): void {
  // Log error without sensitive information
  const sanitizedError = {
    message: error.message,
    context: context,
    timestamp: new Date().toISOString()
  };
  
  console.error('Application error:', sanitizedError);
  
  // In production, send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorMonitoring(sanitizedError);
  }
}

// ✅ SECURE PRACTICE #12: Secure HTTP Requests
export async function fetchExternalDataSecure(url: string): Promise<any> {
  // Validate URL
  const allowedHosts = ['api.example.com', 'secure-api.company.com'];
  const parsedUrl = new URL(url);
  
  if (!allowedHosts.includes(parsedUrl.hostname)) {
    throw new Error('Request to unauthorized host');
  }
  
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS requests allowed');
  }
  
  // Make secure request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SecureApp/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ✅ SECURE PRACTICE #13: Safe Regular Expressions
export function validateEmailSecure(email: string): boolean {
  // Simple, safe email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.length > 254) {
    return false;
  }
  
  return emailRegex.test(email);
}

// ✅ SECURE PRACTICE #14: Input Validation
export function validateUserData(data: any): any {
  const allowedFields = ['username', 'email', 'firstName', 'lastName'];
  const validated: any = {};
  
  for (const field of allowedFields) {
    if (data[field] && typeof data[field] === 'string') {
      validated[field] = data[field].trim().substring(0, 255); // Limit length
    }
  }
  
  return validated;
}

// Helper functions
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function executeSecureQuery(query: string, params: any[] = []): Promise<any> {
  // Mock secure database execution
  return new Promise(resolve => {
    setTimeout(() => resolve({ rowCount: 1, rows: [] }), 100);
  });
}

// ✅ SECURE PRACTICE #15: Rate Limiting and Monitoring
export class SecurityMonitor {
  private static attempts: Map<string, number> = new Map();
  
  static checkRateLimit(identifier: string, maxAttempts: number = 5): boolean {
    const currentAttempts = this.attempts.get(identifier) || 0;
    
    if (currentAttempts >= maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    this.attempts.set(identifier, currentAttempts + 1);
    
    // Reset counter after 1 hour
    setTimeout(() => {
      this.attempts.delete(identifier);
    }, 3600000);
    
    return true;
  }
}

export { 
  getDatabaseConfig,
  SecurityMonitor
};
