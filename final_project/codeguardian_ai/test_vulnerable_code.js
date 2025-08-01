// Sample vulnerable JavaScript code for testing
const API_KEY = "sk-1234567890abcdef";
const DATABASE_PASSWORD = "admin123";

function getUserById(userId) {
    // Vulnerable SQL query - SQL Injection
    const query = "SELECT * FROM users WHERE id = " + userId;
    return database.query(query);
}

function displayUserInfo(userInput) {
    // Vulnerable XSS - Cross-site scripting
    document.getElementById('userInfo').innerHTML = userInput;
}

function validateUser(password) {
    // Weak validation
    if (password === "admin") {
        return true;
    }
    return false;
}

// Hardcoded credentials
const admin = {
    username: "admin",
    password: "password123"
};

console.log("Application started with API key:", API_KEY);
