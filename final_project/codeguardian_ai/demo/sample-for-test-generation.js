// Sample JavaScript code for testing Test Generator
function calculateSum(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both parameters must be numbers');
    }
    return a + b;
}

function calculateProduct(x, y) {
    return x * y;
}

class Calculator {
    constructor() {
        this.result = 0;
        this.history = [];
    }
    
    add(a, b) {
        const result = a + b;
        this.result = result;
        this.history.push({ operation: 'add', operands: [a, b], result });
        return result;
    }
    
    multiply(a, b) {
        const result = a * b;
        this.result = result;
        this.history.push({ operation: 'multiply', operands: [a, b], result });
        return result;
    }
    
    getHistory() {
        return this.history;
    }
    
    clear() {
        this.result = 0;
        this.history = [];
    }
}

async function fetchUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

function processArray(array, callback) {
    if (!Array.isArray(array)) {
        throw new Error('First parameter must be an array');
    }
    if (typeof callback !== 'function') {
        throw new Error('Second parameter must be a function');
    }
    
    return array.map(callback);
}

module.exports = {
    calculateSum,
    calculateProduct,
    Calculator,
    fetchUserData,
    processArray
};
