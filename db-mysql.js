// MySQL Database Connection
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'kidney_monitoring',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

// Password hashing
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialize database (create tables if they don't exist)
async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                passwordHash VARCHAR(255) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create medical_tests table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS medical_tests (
                id VARCHAR(36) PRIMARY KEY,
                testId VARCHAR(36) UNIQUE NOT NULL,
                userId VARCHAR(36) NOT NULL,
                testType VARCHAR(50),
                gender VARCHAR(10),
                age INT,
                parameters JSON,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create test_results table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS test_results (
                id VARCHAR(36) PRIMARY KEY,
                testId VARCHAR(36),
                userId VARCHAR(36) NOT NULL,
                eGFR DECIMAL(10, 2),
                creatinine DECIMAL(10, 2),
                ureaLevel DECIMAL(10, 2),
                potassium DECIMAL(10, 2),
                heartRate INT,
                spo2 DECIMAL(5, 2),
                temperature DECIMAL(5, 2),
                analysis TEXT,
                riskLevel VARCHAR(50),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create health_alerts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS health_alerts (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                type VARCHAR(50),
                severity VARCHAR(50),
                message TEXT,
                read BOOLEAN DEFAULT FALSE,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create chat_messages table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                sessionId VARCHAR(36),
                role VARCHAR(50),
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create recommendations table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS recommendations (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                testId VARCHAR(36),
                recommendation TEXT,
                type VARCHAR(50),
                priority VARCHAR(50),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        connection.release();
    }
}

// User Functions
async function createUser(firstName, lastName, email, phone, password) {
    const connection = await pool.getConnection();
    try {
        const id = require('uuid').v4();
        
        // Check if email exists
        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            throw new Error('Email already registered');
        }

        const passwordHash = hashPassword(password);

        await connection.execute(
            `INSERT INTO users (id, firstName, lastName, email, phone, passwordHash) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, firstName, lastName, email, phone, passwordHash]
        );

        console.log(`✅ User created: ${email}`);

        return {
            id,
            firstName,
            lastName,
            email,
            phone
        };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}

async function getUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        return rows.length > 0 ? rows[0] : null;
    } finally {
        connection.release();
    }
}

async function getUserById(userId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        return rows.length > 0 ? rows[0] : null;
    } finally {
        connection.release();
    }
}

function verifyPassword(password, passwordHash) {
    return hashPassword(password) === passwordHash;
}

// Medical Test Functions
async function saveMedicalTest(userId, testData) {
    const connection = await pool.getConnection();
    try {
        const id = require('uuid').v4();
        const testId = require('uuid').v4();

        await connection.execute(
            `INSERT INTO medical_tests (id, testId, userId, testType, gender, age, parameters, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, testId, userId, testData.type || 'general', testData.gender, testData.age, JSON.stringify(testData.parameters || {}), 'completed']
        );

        console.log(`✅ Test saved: ${userId}`);

        return { id, testId, userId, testType: testData.type, status: 'completed' };
    } finally {
        connection.release();
    }
}

async function saveTestResults(testId, userId, resultData) {
    const connection = await pool.getConnection();
    try {
        const id = require('uuid').v4();

        await connection.execute(
            `INSERT INTO test_results (id, testId, userId, eGFR, creatinine, ureaLevel, potassium, heartRate, spo2, temperature, analysis, riskLevel) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, testId, userId,
                resultData.eGFR, resultData.creatinine, resultData.ureaLevel,
                resultData.potassium, resultData.heartRate, resultData.spo2,
                resultData.temperature, resultData.analysis || 'Normal', resultData.riskLevel || 'low'
            ]
        );

        return { id, testId, userId, eGFR: resultData.eGFR };
    } finally {
        connection.release();
    }
}

async function getUserTests(userId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM test_results WHERE userId = ? ORDER BY timestamp DESC',
            [userId]
        );

        return rows;
    } finally {
        connection.release();
    }
}

async function saveRecommendation(testId, userId, recommendation) {
    const connection = await pool.getConnection();
    try {
        const id = require('uuid').v4();

        await connection.execute(
            `INSERT INTO recommendations (id, userId, testId, recommendation, type, priority) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, testId, recommendation, 'general', 'normal']
        );

        return { id, userId, testId, recommendation };
    } finally {
        connection.release();
    }
}

async function getTestRecommendations(testId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM recommendations WHERE testId = ?',
            [testId]
        );

        return rows;
    } finally {
        connection.release();
    }
}

async function saveChatMessage(chatData) {
    const connection = await pool.getConnection();
    try {
        const id = require('uuid').v4();

        await connection.execute(
            `INSERT INTO chat_messages (id, userId, sessionId, role, content) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, chatData.userId, chatData.sessionId, chatData.role, chatData.content]
        );

        return { id, userId: chatData.userId, role: chatData.role, content: chatData.content };
    } finally {
        connection.release();
    }
}

async function getSessionHistory(sessionId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM chat_messages WHERE sessionId = ? ORDER BY timestamp ASC',
            [sessionId]
        );

        return rows;
    } finally {
        connection.release();
    }
}

async function createHealthAlert(userId, type, severity, message) {
    const connection = await pool.getConnection();
    try {
        const id = require('uuid').v4();

        await connection.execute(
            `INSERT INTO health_alerts (id, userId, type, severity, message, read) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, type, severity, message, false]
        );

        return { id, userId, type, severity, message };
    } finally {
        connection.release();
    }
}

async function getUserAlerts(userId, unreadOnly = false) {
    const connection = await pool.getConnection();
    try {
        let query = 'SELECT * FROM health_alerts WHERE userId = ?';
        const params = [userId];

        if (unreadOnly) {
            query += ' AND read = FALSE';
        }

        query += ' ORDER BY timestamp DESC';

        const [rows] = await connection.execute(query, params);

        return rows;
    } finally {
        connection.release();
    }
}

async function markAlertAsRead(alertId) {
    const connection = await pool.getConnection();
    try {
        await connection.execute(
            'UPDATE health_alerts SET read = TRUE WHERE id = ?',
            [alertId]
        );

        const [rows] = await connection.execute(
            'SELECT * FROM health_alerts WHERE id = ?',
            [alertId]
        );

        return rows.length > 0 ? rows[0] : null;
    } finally {
        connection.release();
    }
}

async function getDatabaseStats() {
    const connection = await pool.getConnection();
    try {
        const [userStats] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [testStats] = await connection.execute('SELECT COUNT(*) as count FROM medical_tests');
        const [resultStats] = await connection.execute('SELECT COUNT(*) as count FROM test_results');
        const [alertStats] = await connection.execute('SELECT COUNT(*) as count FROM health_alerts');
        const [messageStats] = await connection.execute('SELECT COUNT(*) as count FROM chat_messages');

        return {
            totalUsers: userStats[0].count,
            totalTests: testStats[0].count,
            totalResults: resultStats[0].count,
            totalAlerts: alertStats[0].count,
            totalMessages: messageStats[0].count
        };
    } finally {
        connection.release();
    }
}

// Export functions
module.exports = {
    pool,
    initializeDatabase,
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
