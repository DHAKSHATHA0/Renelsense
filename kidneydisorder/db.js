// Simple in-memory database with file persistence
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Database file path
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database structure
let database = {
    users: [],
    medicalTests: [],
    testResults: [],
    recommendations: [],
    chatMessages: [],
    healthAlerts: []
};

// Load existing database
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            database = JSON.parse(data);
        }
    } catch (error) {
        console.log('Starting with fresh database');
    }
}

// Save database to file
function saveDatabase() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// User functions
function createUser(userData) {
    const user = {
        id: crypto.randomUUID(),
        email: userData.email,
        name: userData.name,
        passwordHash: hashPassword(userData.password),
        createdAt: new Date().toISOString(),
        medicalHistory: userData.medicalHistory || {}
    };
    database.users.push(user);
    saveDatabase();
    return user;
}

function getUserByEmail(email) {
    return database.users.find(u => u.email === email);
}

function getUserById(userId) {
    return database.users.find(u => u.id === userId);
}

function verifyPassword(user, password) {
    return user.passwordHash === hashPassword(password);
}

// Medical test functions
function saveMedicalTest(testData) {
    const test = {
        id: crypto.randomUUID(),
        userId: testData.userId,
        testType: testData.testType,
        parameters: testData.parameters,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    database.medicalTests.push(test);
    saveDatabase();
    return test;
}

function saveTestResults(resultData) {
    const result = {
        id: crypto.randomUUID(),
        testId: resultData.testId,
        userId: resultData.userId,
        values: resultData.values,
        analysis: resultData.analysis,
        timestamp: new Date().toISOString(),
        riskLevel: resultData.riskLevel || 'low'
    };
    database.testResults.push(result);
    saveDatabase();
    return result;
}

function getUserTests(userId) {
    return database.medicalTests.filter(t => t.userId === userId);
}

// Recommendation functions
function saveRecommendation(recData) {
    const recommendation = {
        id: crypto.randomUUID(),
        userId: recData.userId,
        testId: recData.testId,
        recommendation: recData.recommendation,
        type: recData.type || 'general',
        priority: recData.priority || 'normal',
        timestamp: new Date().toISOString()
    };
    database.recommendations.push(recommendation);
    saveDatabase();
    return recommendation;
}

function getTestRecommendations(testId) {
    return database.recommendations.filter(r => r.testId === testId);
}

// Chat message functions
function saveChatMessage(chatData) {
    const message = {
        id: crypto.randomUUID(),
        userId: chatData.userId,
        sessionId: chatData.sessionId,
        role: chatData.role, // 'user' or 'assistant'
        content: chatData.content,
        timestamp: new Date().toISOString()
    };
    database.chatMessages.push(message);
    saveDatabase();
    return message;
}

function getSessionHistory(sessionId) {
    return database.chatMessages.filter(m => m.sessionId === sessionId).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
}

// Health alert functions
function createHealthAlert(alertData) {
    const alert = {
        id: crypto.randomUUID(),
        userId: alertData.userId,
        type: alertData.type,
        severity: alertData.severity,
        message: alertData.message,
        read: false,
        timestamp: new Date().toISOString()
    };
    database.healthAlerts.push(alert);
    saveDatabase();
    return alert;
}

function getUserAlerts(userId) {
    return database.healthAlerts.filter(a => a.userId === userId).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

function markAlertAsRead(alertId) {
    const alert = database.healthAlerts.find(a => a.id === alertId);
    if (alert) {
        alert.read = true;
        saveDatabase();
    }
    return alert;
}

// Database stats
function getDatabaseStats() {
    return {
        totalUsers: database.users.length,
        totalTests: database.medicalTests.length,
        totalResults: database.testResults.length,
        totalAlerts: database.healthAlerts.length,
        totalMessages: database.chatMessages.length
    };
}

// Initialize database
loadDatabase();

// Export all functions
module.exports = {
    db: database,
    createUser,
    getUserByEmail,
    getUserById,
    verifyPassword,
    saveMedicalTest,
    saveTestResults,
    getUserTests,
    saveRecommendation,
    getTestRecommendations,
    saveChatMessage,
    getSessionHistory,
    createHealthAlert,
    getUserAlerts,
    markAlertAsRead,
    getDatabaseStats
};
