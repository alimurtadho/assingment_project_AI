"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = getWeather;
exports.getCityHistory = getCityHistory;
exports.getWeatherAnalysis = getWeatherAnalysis;
exports.exportWeatherData = exportWeatherData;
exports.adminLogin = adminLogin;
const weatherService_1 = require("../services/weatherService");
const database_1 = require("../config/database");
// Controller with poorly named variables and code smells
async function getWeather(req, res) {
    try {
        // No input validation (vulnerability)
        const c = req.query.city;
        if (!c) {
            res.status(400).json({ error: 'City parameter is required' });
            return;
        }
        const data = await (0, weatherService_1.getWeatherForCity)(c);
        res.json({
            success: true,
            data: data
        });
    }
    catch (e) {
        console.error('Controller error:', e);
        res.status(500).json({
            success: false,
            error: e.message,
            stack: e.stack // Exposing error details (vulnerability)
        });
    }
}
// Function with duplicate code (code smell)
async function getCityHistory(req, res) {
    try {
        // No input validation (vulnerability)
        const c = req.params.city;
        const d = req.query.from;
        if (!c) {
            res.status(400).json({ error: 'City parameter is required' });
            return;
        }
        const data = await (0, weatherService_1.getHistoricalWeather)(c, d);
        res.json({
            success: true,
            data: data
        });
    }
    catch (e) {
        console.error('Controller error:', e);
        res.status(500).json({
            success: false,
            error: e.message,
            stack: e.stack // Exposing error details (vulnerability)
        });
    }
}
// Very long function with multiple responsibilities (code smell)
async function getWeatherAnalysis(req, res) {
    try {
        // SQL Injection vulnerability
        const city = req.params.city;
        const db = (0, database_1.getDb)();
        // Direct user input in SQL query (vulnerability)
        db.all(`SELECT * FROM weather_data WHERE city = '${city}'`, async (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            if (rows.length === 0) {
                res.status(404).json({ error: 'No data found for this city' });
                return;
            }
            // Process the data
            const analysis = (0, weatherService_1.processAndAnalyzeWeatherData)(rows);
            // Return the result
            res.json({
                success: true,
                city: city,
                dataPoints: rows.length,
                analysis: analysis
            });
        });
    }
    catch (e) {
        console.error('Analysis error:', e);
        res.status(500).json({
            success: false,
            error: e.message
        });
    }
}
// Zombie function - never used
async function exportWeatherData(req, res) {
    // This function is never used in the routes
    const format = req.query.format || 'json';
    const city = req.query.city;
    if (!city) {
        res.status(400).json({ error: 'City parameter is required' });
        return;
    }
    try {
        const data = await (0, weatherService_1.getHistoricalWeather)(city);
        if (format === 'csv') {
            // Code to convert to CSV
            let csv = 'id,city,temperature,conditions,humidity,wind_speed,date_recorded\n';
            data.forEach(item => {
                csv += `${item.id},${item.city},${item.temperature},${item.conditions},${item.humidity},${item.wind_speed},${item.date_recorded}\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="weather_${city}.csv"`);
            res.send(csv);
        }
        else {
            res.json(data);
        }
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}
// Function with hardcoded credentials (vulnerability)
function adminLogin(req, res) {
    const { username, password } = req.body;
    // Hardcoded credentials (serious vulnerability)
    if (username === 'admin' && password === 'admin123') {
        res.json({
            success: true,
            token: 'hardcoded-jwt-token-that-never-expires'
        });
    }
    else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
}
//# sourceMappingURL=weatherController.js.map