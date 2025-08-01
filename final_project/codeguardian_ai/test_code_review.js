// Sample code with quality issues for testing AI Code Review
var userName = "john_doe";
var userAge = 25;

function checkUser(user) {
    if (user.name == "admin") {
        console.log("Admin user detected");
        return true;
    }
    
    // Missing error handling
    var result = processUser(user);
    document.getElementById('result').innerHTML = result;
    
    return false;
}

function processUser(userData) {
    // No input validation
    var output = "User: " + userData.name + " Age: " + userData.age;
    return output;
}

// Missing documentation
function calculateScore(data) {
    var score = 0;
    for (var i = 0; i < data.length; i++) {
        score += data[i];
    }
    return score;
}

console.log("Application started");
