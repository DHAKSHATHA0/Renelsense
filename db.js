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
function createUser(firstName, lastName, email, phone, password) {
    // Check if email already exists
    const existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
        throw new Error('Email already registered');
    }

    const user = {
        id: crypto.randomUUID(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        medicalHistory: {},
        testResults: [],
        reports: []
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

function verifyPassword(password, passwordHash) {
    return hashPassword(password) === passwordHash;
}

// Medical test functions
function saveMedicalTest(userId, testData) {
    const test = {
        id: crypto.randomUUID(),
        testId: crypto.randomUUID(),
        userId: userId,
        testType: testData.type || 'general',
        gender: testData.gender,
        age: testData.age,
        parameters: testData.parameters || {},
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    database.medicalTests.push(test);
    saveDatabase();
    return test;
}

function saveTestResults(testId, userId, resultData) {
    const result = {
        id: crypto.randomUUID(),
        testId: testId,
        userId: userId,
        eGFR: resultData.eGFR,
        creatinine: resultData.creatinine,
        ureaLevel: resultData.ureaLevel,
        potassium: resultData.potassium,
        heartRate: resultData.heartRate,
        spo2: resultData.spo2,
        temperature: resultData.temperature,
        analysis: resultData.analysis || 'Normal',
        timestamp: new Date().toISOString(),
        riskLevel: resultData.riskLevel || 'low'
    };
    database.testResults.push(result);
    
    // Also add to user's test results
    const user = getUserById(userId);
    if (user) {
        user.testResults.push(result);
    }
    
    saveDatabase();
    return result;
}

function getUserTests(userId) {
    return database.testResults.filter(t => t.userId === userId).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

// Recommendation functions
function saveRecommendation(testId, userId, recommendation) {
    const rec = {
        id: crypto.randomUUID(),
        userId: userId,
        testId: testId,
        recommendation: recommendation,
        type: 'general',
        priority: 'normal',
        timestamp: new Date().toISOString()
    };
    database.recommendations.push(rec);
    saveDatabase();
    return rec;
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
function createHealthAlert(userId, type, severity, message) {
    const alert = {
        id: crypto.randomUUID(),
        userId: userId,
        type: type,
        severity: severity,
        message: message,
        read: false,
        timestamp: new Date().toISOString()
    };
    database.healthAlerts.push(alert);
    saveDatabase();
    return alert;
}

function getUserAlerts(userId, unreadOnly = false) {
    let alerts = database.healthAlerts.filter(a => a.userId === userId);
    if (unreadOnly) {
        alerts = alerts.filter(a => !a.read);
    }
    return alerts.sort((a, b) => 
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
