// Demo file 1: Security vulnerabilities
// This file contains intentional security issues for demonstration

const API_KEY = "sk-1234567890abcdef"; // Hardcoded secret
const DB_PASSWORD = "admin123"; // Hardcoded password

interface User {
  id: number;
  email: string;
}

function getUserById(userId: string): User | null {
  // SQL injection vulnerability
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return executeQuery(query);
}

// XSS vulnerability
function renderUserProfile(userInput: string): string {
  return `<div>Welcome ${userInput}</div>`; // No sanitization
}

// Weak cryptography
const crypto = require('crypto');
function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex'); // MD5 is weak
}

// More security issues
const SECRET_KEY = "mysecretkey123"; // Another hardcoded secret
const connection = `mongodb://admin:password123@localhost:27017/mydb`; // Hardcoded credentials

function dynamicQuery(table: string, condition: string) {
  // Another SQL injection
  return `SELECT * FROM ${table} WHERE ${condition}`;
}

// Insecure random
function generateToken(): string {
  return Math.random().toString(36); // Not cryptographically secure
}

export { getUserById, renderUserProfile, hashPassword, generateToken };
