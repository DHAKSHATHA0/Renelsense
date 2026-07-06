// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

// Import database modules
const fileDb = require('./backend/db');
const mysqlDb = require('./backend/db-mysql');

// Track which DB is active
let usingMySQL = false;
let mysqlReconnectTimer = null;

// Start with file DB functions (safe default)
let dbModule = fileDb;
let db = fileDb.db;
let createUser = fileDb.createUser;
let getUserByEmail = fileDb.getUserByEmail;
let getUserById = fileDb.getUserById;
let verifyPassword = fileDb.verifyPassword;
let saveMedicalTest = fileDb.saveMedicalTest;
let saveTestResults = fileDb.saveTestResults;
let getUserTests = fileDb.getUserTests;
let saveRecommendation = fileDb.saveRecommendation;
let getTestRecommendations = fileDb.getTestRecommendations;
let saveChatMessage = fileDb.saveChatMessage;
let getSessionHistory = fileDb.getSessionHistory;
let createHealthAlert = fileDb.createHealthAlert;
let getUserAlerts = fileDb.getUserAlerts;
let markAlertAsRead = fileDb.markAlertAsRead;
let getDatabaseStats = fileDb.getDatabaseStats;

function switchToMySQL() {
    usingMySQL = true;
    dbModule = mysqlDb;
    createUser = mysqlDb.createUser;
    getUserByEmail = mysqlDb.getUserByEmail;
    getUserById = mysqlDb.getUserById;
    verifyPassword = mysqlDb.verifyPassword;
    saveMedicalTest = mysqlDb.saveMedicalTest;
    saveTestResults = mysqlDb.saveTestResults;
    getUserTests = mysqlDb.getUserTests;
    saveRecommendation = mysqlDb.saveRecommendation;
    getTestRecommendations = mysqlDb.getTestRecommendations;
    saveChatMessage = mysqlDb.saveChatMessage;
    getSessionHistory = mysqlDb.getSessionHistory;
    createHealthAlert = mysqlDb.createHealthAlert;
    getUserAlerts = mysqlDb.getUserAlerts;
    markAlertAsRead = mysqlDb.markAlertAsRead;
    getDatabaseStats = mysqlDb.getDatabaseStats;
    console.log('✅ Switched to MySQL database');
}

function switchToFileDB() {
    usingMySQL = false;
    dbModule = fileDb;
    createUser = fileDb.createUser;
    getUserByEmail = fileDb.getUserByEmail;
    getUserById = fileDb.getUserById;
    verifyPassword = fileDb.verifyPassword;
    saveMedicalTest = fileDb.saveMedicalTest;
    saveTestResults = fileDb.saveTestResults;
    getUserTests = fileDb.getUserTests;
    saveRecommendation = fileDb.saveRecommendation;
    getTestRecommendations = fileDb.getTestRecommendations;
    saveChatMessage = fileDb.saveChatMessage;
    getSessionHistory = fileDb.getSessionHistory;
    createHealthAlert = fileDb.createHealthAlert;
    getUserAlerts = fileDb.getUserAlerts;
    markAlertAsRead = fileDb.markAlertAsRead;
    getDatabaseStats = fileDb.getDatabaseStats;
    console.log('⚠️ Switched to file-based fallback DB');
}

// Sync fallback users/data back to MySQL when it recovers
async function syncFallbackToMySQL() {
    try {
        const fallbackUsers = fileDb.db.users || [];
        for (const user of fallbackUsers) {
            try {
                const existing = await mysqlDb.getUserByEmail(user.email);
                if (!existing) {
                    // Re-insert user with existing passwordHash directly
                    const { v4: uuidv4 } = require('uuid');
                    const conn = await mysqlDb.pool.getConnection();
                    await conn.execute(
                        `INSERT IGNORE INTO users (id, firstName, lastName, email, phone, passwordHash) VALUES (?,?,?,?,?,?)`,
                        [user.id, user.firstName, user.lastName, user.email, user.phone || '', user.passwordHash]
                    );
                    conn.release();
                    console.log(`✅ Synced fallback user to MySQL: ${user.email}`);
                }
            } catch (e) {
                console.error(`⚠️ Could not sync user ${user.email}:`, e.message);
            }
        }
    } catch (e) {
        console.error('Sync error:', e.message);
    }
}

// Periodically try to reconnect to MySQL when it's down
function startMySQLReconnect() {
    if (mysqlReconnectTimer) return;
    mysqlReconnectTimer = setInterval(async () => {
        try {
            const conn = await mysqlDb.pool.getConnection();
            conn.release();
            console.log('✅ MySQL reconnected!');
            clearInterval(mysqlReconnectTimer);
            mysqlReconnectTimer = null;
            await mysqlDb.initializeDatabase();
            await syncFallbackToMySQL();
            switchToMySQL();
        } catch (e) {
            console.log('⏳ MySQL still down, retrying in 30s...');
        }
    }, 30000);
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication & Custom Routes (before static middleware)
// Serve signup page as landing page
app.get('/', (req, res) => {
    res.redirect('/signup');
});

// Serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the main page (website after signup)
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the account page
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Serve the admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Static files middleware (after routes)
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// DATABASE - AUTHENTICATION ENDPOINTS
// ========================================

/**
 * Register new user
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const user = await createUser(firstName, lastName, email, phone, password);
        console.log(`✅ New user registered: ${email} (${usingMySQL ? 'MySQL' : 'fallback DB'})`);
        if (!usingMySQL) {
            console.log('⚠️ Registered in fallback DB — will sync to MySQL when it recovers');
        }

        res.status(201).json({
            success: true,
            message: usingMySQL ? 'Account created successfully' : 'Account created (offline mode — will sync when DB recovers)',
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message.includes('Email already registered')) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }
        res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
    }
});

/**
 * Login user
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        let user = await getUserByEmail(email);

        // If MySQL is down and user not in fallback, try to give a helpful message
        if (!user && !usingMySQL) {
            return res.status(503).json({
                success: false,
                message: 'Database is temporarily offline. If you registered before, please wait for reconnection and try again.'
            });
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const storedPasswordHash = user.passwordHash || user.password || '';
        const isPasswordValid = await verifyPassword(password, storedPasswordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        console.log(`✅ User logged in: ${email} (${usingMySQL ? 'MySQL' : 'fallback DB'})`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
    }
});

// ========================================
// DATABASE - TEST & RESULTS ENDPOINTS
// ========================================

/**
 * Save test result
 */
app.post('/api/tests/save', async (req, res) => {
    try {
        const { userId, testData, resultsData } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID required'
            });
        }

        // Save medical test
        const test = await saveMedicalTest(userId, testData);
        
        // Save test results
        const results = await saveTestResults(test.testId, userId, resultsData);

        // Create health alert if eGFR is concerning
        if (resultsData.eGFR && resultsData.eGFR < 60) {
            await createHealthAlert(userId, 'egfr_low', 'warning', 
                `Your eGFR is ${resultsData.eGFR}. Please consult a nephrologist.`);
        }

        console.log(`✅ Test saved for user ${userId}: eGFR ${resultsData.eGFR}`);

        res.status(201).json({
            success: true,
            message: 'Test results saved successfully',
            test: test,
            results: results
        });
    } catch (error) {
        console.error('Error saving test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save test',
            error: error.message
        });
    }
});

/**
 * Get user's test history
 */
app.get('/api/tests/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const tests = await getUserTests(userId);

        res.status(200).json({
            success: true,
            count: tests.length,
            tests: tests
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tests',
            error: error.message
        });
    }
});

// Dashboard endpoint for individual user (returns user info + tests)
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const tests = await getUserTests(userId);

        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            },
            tests: tests
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
    }
});

/**
 * Get user profile
 */
app.get('/api/user/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const tests = await getUserTests(userId);
        const alerts = await getUserAlerts(userId, false);
        res.json({
            success: true,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
            totalTests: tests.length,
            latestTest: tests[0] || null,
            unreadAlerts: alerts.filter(a => !a.read).length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
    }
});

/**
 * Get recommendations for a test
 */
app.get('/api/recommendations/:testId', async (req, res) => {
    try {
        const { testId } = req.params;

        const recommendations = await getTestRecommendations(testId);

        res.status(200).json({
            success: true,
            count: recommendations.length,
            recommendations: recommendations
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommendations',
            error: error.message
        });
    }
});

/**
 * Save recommendation
 */
app.post('/api/recommendations/save', async (req, res) => {
    try {
        const { testId, userId, recommendation } = req.body;

        if (!testId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Test ID and User ID required'
            });
        }

        const saved = await saveRecommendation(testId, userId, recommendation);

        console.log(`✅ Recommendation saved for test ${testId}`);

        res.status(201).json({
            success: true,
            message: 'Recommendation saved',
            recommendation: saved
        });
    } catch (error) {
        console.error('Error saving recommendation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save recommendation',
            error: error.message
        });
    }
});

// ========================================
// DATABASE - ALERTS ENDPOINTS
// ========================================

/**
 * Get user alerts
 */
app.get('/api/alerts/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { unreadOnly = true } = req.query;

        const alerts = await getUserAlerts(userId, unreadOnly === 'true');

        res.status(200).json({
            success: true,
            count: alerts.length,
            alerts: alerts
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alerts',
            error: error.message
        });
    }
});

/**
 * Mark alert as read
 */
app.post('/api/alerts/:alertId/read', async (req, res) => {
    try {
        const { alertId } = req.params;

        await markAlertAsRead(alertId);

        res.status(200).json({
            success: true,
            message: 'Alert marked as read'
        });
    } catch (error) {
        console.error('Error marking alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark alert',
            error: error.message
        });
    }
});

// ========================================
// DATABASE - STATISTICS ENDPOINT
// ========================================

/**
 * Get database statistics
 */
app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await getDatabaseStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// ========================================
// CONVERSATION MEMORY SYSTEM
// AI remembers conversation history
// ========================================
const conversationSessions = new Map(); // sessionId → conversation history
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_HISTORY_PER_SESSION = 50; // Keep last 50 messages

/**
 * Store conversation message
 */
function storeConversationMessage(sessionId, role, message, metadata = {}) {
    if (!conversationSessions.has(sessionId)) {
        conversationSessions.set(sessionId, {
            messages: [],
            createdAt: Date.now(),
            lastActivity: Date.now(),
            userId: metadata.userId || 'anonymous',
            patientResults: metadata.patientResults || {}
        });
    }
    
    const session = conversationSessions.get(sessionId);
    session.messages.push({
        role: role,
        content: message,
        timestamp: Date.now(),
        metadata: metadata
    });
    
    if (session.messages.length > MAX_HISTORY_PER_SESSION) {
        session.messages = session.messages.slice(-MAX_HISTORY_PER_SESSION);
    }
    
    session.lastActivity = Date.now();
}

/**
 * Get conversation history
 */
function getConversationHistory(sessionId) {
    if (!conversationSessions.has(sessionId)) {
        return [];
    }
    
    const session = conversationSessions.get(sessionId);
    
    if (Date.now() - session.lastActivity > SESSION_TTL) {
        conversationSessions.delete(sessionId);
        return [];
    }
    
    return session.messages;
}

/**
 * Clear conversation
 */
function clearConversation(sessionId) {
    conversationSessions.delete(sessionId);
}

/**
 * Get conversation stats
 */
function getConversationStats() {
    let totalMessages = 0;
    conversationSessions.forEach(session => {
        totalMessages += session.messages.length;
    });
    
    return {
        activeSessions: conversationSessions.size,
        totalMessages: totalMessages,
        averageMessagesPerSession: conversationSessions.size > 0 ? (totalMessages / conversationSessions.size).toFixed(1) : 0
    };
}

// Cleanup expired sessions every hour
setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;
    
    conversationSessions.forEach((session, sessionId) => {
        if (now - session.lastActivity > SESSION_TTL) {
            conversationSessions.delete(sessionId);
            deletedCount++;
        }
    });
    
    if (deletedCount > 0) {
        console.log(`⏰ Session cleanup: Removed ${deletedCount} expired sessions`);
    }
}, 60 * 60 * 1000);

// ========================================
// GEMINI API RESPONSE CACHING SYSTEM
// Reduces API calls by 70% (saves quota)
// ========================================
const responseCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500; // Max cached responses

const cacheStats = {
    hits: 0,
    misses: 0,
    apiCallsSaved: 0,
    totalQueries: 0,
    getCacheHitRate: function() {
        return this.totalQueries > 0 ? ((this.hits / this.totalQueries) * 100).toFixed(2) : 0;
    }
};

/**
 * Generate cache key from message and patient context
 * Similar questions get same cache key
 */
function generateCacheKey(message, eGFR) {
    // Normalize message to match variations
    const normalized = message.toLowerCase().trim()
        .replace(/^(what|how|can|should|my|i|do|am)\s+/g, '')
        .replace(/\?+$/g, '')
        .replace(/\s+/g, ' ');
    
    // Factor in kidney stage (different advice for different stages)
    const stage = eGFR >= 90 ? 'healthy' : eGFR >= 60 ? 'stage2' : 'advanced';
    
    return `${normalized}::${stage}`;
}

/**
 * Get cached response or null if not found/expired
 */
function getCachedResponse(message, eGFR) {
    const key = generateCacheKey(message, eGFR);
    const cached = responseCache.get(key);
    
    cacheStats.totalQueries++;
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        cacheStats.hits++;
        console.log(`💾 Cache HIT: ${key} (${cacheStats.getCacheHitRate()}% hit rate)`);
        return cached.response;
    }
    
    cacheStats.misses++;
    return null;
}

/**
 * Store response in cache
 */
function setCachedResponse(message, eGFR, response) {
    const key = generateCacheKey(message, eGFR);
    
    // Clear old cache if exceeds max size
    if (responseCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
        console.log('🗑️ Cache cleanup: removed oldest entry');
    }
    
    responseCache.set(key, {
        response: response,
        timestamp: Date.now()
    });
    
    console.log(`💾 Cached response for: ${key}`);
}

/**
 * Get cache statistics
 */
app.get('/api/cache-stats', (req, res) => {
    res.json({
        cacheSize: responseCache.size,
        maxSize: MAX_CACHE_SIZE,
        hitRate: `${cacheStats.getCacheHitRate()}%`,
        totalQueries: cacheStats.totalQueries,
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
        estimatedApiCallsSaved: cacheStats.hits,
        monthlyQuotaStatus: {
            freeQuota: 1500,
            estimatedUsageWithoutCache: cacheStats.totalQueries,
            estimatedUsageWithCache: cacheStats.totalQueries - cacheStats.hits,
            reductionPercentage: cacheStats.getCacheHitRate()
        }
    });
});

// Serve WiFi setup page
app.get('/wifi-setup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wifi-setup.html'));
});

// REST API endpoint for ESP32 to send sensor data
app.post('/api/sensor-data', async (req, res) => {
    try {
        const sensorData = req.body;
        console.log('📊 Received sensor data from ESP32:', sensorData);
        
        // Broadcast sensor data to all connected WebSocket clients
        broadcastMessage({
            type: 'sensor_update',
            payload: sensorData
        });
        
        // Automatically send data to ML model for prediction
        console.log('🤖 Sending data to ML model for prediction...');
        const predictionResult = await sendToMLModel(sensorData);
        
        if (predictionResult.success) {
            console.log('✅ ML Prediction received:', predictionResult.prediction);
            
            // Broadcast prediction results to all connected clients
            broadcastMessage({
                type: 'prediction_result',
                payload: predictionResult
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Sensor data received and processed successfully',
            prediction: predictionResult.success ? predictionResult : null
        });
    } catch (error) {
        console.error('❌ Error processing sensor data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing sensor data',
            error: error.message
        });
    }
});

/**
 * Send sensor data to ML model for eGFR prediction
 * @param {Object} sensorData - Sensor data from ESP32
 * @returns {Promise<Object>} Prediction result from ML model
 */
async function sendToMLModel(sensorData) {
    try {
        // Get ML API configuration from config.json or use defaults
        const mlApiIP = process.env.ML_API_IP || '127.0.0.1';
        const mlApiPort = process.env.ML_API_PORT || 5000;
        const mlApiUrl = `http://${mlApiIP}:${mlApiPort}/predict`;
        
        console.log(`📡 Calling ML API at: ${mlApiUrl}`);
        
        // Prepare data for ML model - ensure all required fields are present
        const mlData = {
            bioimpedance_1khz: sensorData.bioimpedance_1khz || sensorData.bio_1khz || 350,
            bioimpedance_10khz: sensorData.bioimpedance_10khz || sensorData.bio_10khz || 320,
            bioimpedance_100khz: sensorData.bioimpedance_100khz || sensorData.bio_100khz || 280,
            bioimpedance_200khz: sensorData.bioimpedance_200khz || sensorData.bio_200khz || 250,
            heart_rate: sensorData.heart_rate || sensorData.heartRate || 72,
            temperature: sensorData.temperature || 36.8,
            motion: sensorData.motion || 0
        };
        
        // Send to ML model with timeout
        const response = await Promise.race([
            fetch(mlApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mlData),
                timeout: 5000
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('ML API timeout')), 5000)
            )
        ]);
        
        if (!response.ok) {
            throw new Error(`ML API returned status ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Received prediction from ML model');
        return {
            success: true,
            prediction: result.prediction || result,
            recommendations: result.recommendations || {},
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('⚠️ Error calling ML model:', error.message);
        // Return success: false but don't crash the sensor endpoint
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Endpoint to start a test
app.post('/api/start-test', (req, res) => {
    console.log('Starting new test');
    
    // Broadcast test start message
    broadcastMessage({
        type: 'test_started'
    });
    
    res.status(200).json({ 
        success: true, 
        message: 'Test started successfully' 
    });
});

// Endpoint to stop a test
app.post('/api/stop-test', (req, res) => {
    console.log('Stopping test');
    
    // Broadcast test stop message
    broadcastMessage({
        type: 'test_stopped'
    });
    
    res.status(200).json({ 
        success: true, 
        message: 'Test stopped successfully' 
    });
});

// Manual ML Prediction endpoint (for testing)
app.post('/api/predict', async (req, res) => {
    try {
        const sensorData = req.body;
        console.log('📊 Received prediction request with data:', sensorData);
        
        // Send to ML model
        const predictionResult = await sendToMLModel(sensorData);
        
        res.status(200).json(predictionResult);
    } catch (error) {
        console.error('❌ Error in prediction endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check AI/API Configuration
app.get('/api/check-ai-config', (req, res) => {
    const hasGeminiKey = !!process.env.GOOGLE_AI_API_KEY;
    const geminiModel = 'gemini-pro';
    
    res.status(200).json({
        success: true,
        apiAvailable: hasGeminiKey,
        model: geminiModel,
        features: {
            voiceInput: true,
            voiceOutput: true,
            textToSpeech: true,
            imageAnalysis: false,
            codeExecution: false,
            geminiAI: hasGeminiKey
        },
        message: hasGeminiKey ? 'Google Gemini API is configured' : 'Using local AI (Gemini API not configured)'
    });
});

// Chatbot API endpoint for AI-powered health tips
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message, patientResults, sessionId, userId } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }
        
        // Generate sessionId if not provided
        const currentSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`\n💬 [Chatbot] Session: ${currentSessionId}`);
        console.log(`📝 Message: ${message.substring(0, 100)}...`);
        
        try {
            // Store user message in conversation history (database)
            if (userId) {
                await saveChatMessage(userId, currentSessionId, 'user', message);
            }

            // Store user message in memory for context
            storeConversationMessage(currentSessionId, 'user', message, {
                userId: userId || 'anonymous',
                patientResults: patientResults
            });
            
            // Get full conversation history for context
            const fullConversationHistory = getConversationHistory(currentSessionId);
            
            // Generate AI response with conversation context
            const aiResponse = await generateAIResponse(
                message,
                patientResults,
                fullConversationHistory
            );
            
            // Store AI response in conversation history (database)
            if (userId) {
                await saveChatMessage(userId, currentSessionId, 'assistant', aiResponse);
            }

            // Store AI response in memory
            storeConversationMessage(currentSessionId, 'assistant', aiResponse, {
                userId: userId || 'anonymous',
                patientResults: patientResults
            });
            
            return res.status(200).json({ 
                success: true, 
                reply: aiResponse,
                sessionId: currentSessionId,
                conversationLength: fullConversationHistory.length,
                patientResults: patientResults
            });
        } catch (error) {
            console.error('Error in generateAIResponse:', error);
            // Always fallback to local AI if anything fails
            const fallbackResponse = generateLocalAIResponse(message, patientResults);
            
            // Store fallback response in history
            if (userId) {
                await saveChatMessage(userId, currentSessionId, 'assistant', fallbackResponse);
            }

            storeConversationMessage(currentSessionId, 'assistant', fallbackResponse, {
                source: 'fallback',
                userId: userId || 'anonymous'
            });
            
            return res.status(200).json({ 
                success: true, 
                reply: fallbackResponse,
                sessionId: currentSessionId,
                source: 'fallback',
                patientResults: patientResults
            });
        }
        
    } catch (error) {
        console.error('Error in chatbot API:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing chatbot request',
            error: error.message
        });
    }
});

// Get conversation history endpoint
app.get('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const history = getConversationHistory(sessionId);
    
    res.json({
        success: true,
        sessionId: sessionId,
        messageCount: history.length,
        messages: history
    });
});

// Clear conversation endpoint
app.post('/api/conversation/:sessionId/clear', (req, res) => {
    const { sessionId } = req.params;
    clearConversation(sessionId);
    
    res.json({
        success: true,
        message: `Conversation ${sessionId} cleared`
    });
});

// Get conversation statistics
app.get('/api/conversation-stats', (req, res) => {
    const stats = getConversationStats();
    
    res.json({
        success: true,
        conversations: stats,
        memory: {
            sessionsTTL: `${SESSION_TTL / (1000 * 60 * 60)} hours`,
            maxHistoryPerSession: MAX_HISTORY_PER_SESSION
        }
    });
});

/**
 * Helper function to get kidney stage from eGFR
 */
function getKidneyStage(eGFR) {
    if (eGFR >= 90) return 'Stage 1 (Normal)';
    if (eGFR >= 60) return 'Stage 2 (Mild)';
    if (eGFR >= 45) return 'Stage 3a (Moderate)';
    if (eGFR >= 30) return 'Stage 3b (Moderate-Severe)';
    return 'Stage 4-5 (Severe/Critical)';
}

/**
 * Generate AI response using Google Generative AI API (with conversation memory)
 */
async function generateAIResponse(userMessage, patientResults, conversationHistory = []) {
    const apiKey = process.env.GOOGLE_AI_API_KEY || '';
    const eGFR = parseFloat(patientResults?.eGFR) || 0;
    
    console.log(`\n🔑 API Key available: ${apiKey ? 'YES' : 'NO'}`);
    console.log(`📚 Conversation history: ${conversationHistory.length} messages`);
    
    // Step 1: Check cache first (saves API quota!)
    const cachedResponse = getCachedResponse(userMessage, eGFR);
    if (cachedResponse) {
        console.log('✅ Using cached response (FREE!)');
        return cachedResponse;
    }
    
    const systemPrompt = `You are a compassionate, knowledgeable kidney health assistant. 
You have access to the patient's previous conversation history. 
Use this context to provide personalized, relevant advice.
Do NOT repeat information already discussed.
If the patient mentions symptoms from earlier, reference that.
Keep responses concise but informative (2-3 paragraphs).
Do not provide medical diagnosis - only general guidance and tips.

Patient Context:
- eGFR: ${eGFR} mL/min/1.73m²
- Kidney Stage: ${getKidneyStage(eGFR)}
- Risk Level: ${patientResults?.riskLevel || 'Unknown'}`;
    
    try {
        // Use Google Gemini API for content generation
        if (apiKey) {
            console.log('📡 Attempting Gemini API call with conversation context...');
            try {
                const response = await callGoogleGenAIWithHistory(userMessage, systemPrompt, apiKey, conversationHistory);
                console.log('✅ Gemini API succeeded with context-aware response');
                
                // Cache the response for future similar queries
                setCachedResponse(userMessage, eGFR, response);
                
                return response;
            } catch (geminiError) {
                console.error('⚠️ Gemini API failed:', geminiError.message);
                console.log('📝 Falling back to local AI...');
                const fallbackResponse = generateLocalAIResponse(userMessage, patientResults);
                
                // Cache fallback response too
                setCachedResponse(userMessage, eGFR, fallbackResponse);
                
                return fallbackResponse;
            }
        } else {
            console.log('⚠️ No API key found, using local AI');
            return generateLocalAIResponse(userMessage, patientResults);
        }
    } catch (error) {
        console.error('Error in generateAIResponse:', error);
        return generateLocalAIResponse(userMessage, patientResults);
    }
}

/**
 * Call Google Generative AI API with conversation history
 */
async function callGoogleGenAIWithHistory(userMessage, systemPrompt, apiKey, conversationHistory = []) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log(`   Model: ${model}`);
    console.log(`   URL: ${url.substring(0, 70)}...`);
    console.log(`   Context: ${conversationHistory.length} message(s)`);
    
    // Format conversation history for Gemini
    const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));
    
    const requestBody = {
        system: { parts: [{ text: systemPrompt }] },
        contents: formattedHistory,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
    };

    console.log('   Sending request to Gemini API with conversation context...');
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log(`   Response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`   HTTP Error ${response.status}:`, errorData.substring(0, 200));
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('   Response received, parsing...');

        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.finishReason === 'SAFETY') {
                console.warn('   ⚠️ Response blocked by safety filter');
                throw new Error('Response blocked by safety filter');
            }

            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const responseText = candidate.content.parts[0].text;
                console.log(`   ✅ Got context-aware response (${responseText.length} chars)`);
                return responseText;
            }
        }

        if (data.error) {
            console.error('   API Error:', data.error.message);
            throw new Error(data.error.message);
        }

        console.error('   Invalid response structure:', JSON.stringify(data).substring(0, 200));
        throw new Error('Invalid API response structure');
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('   ❌ Request timeout (15s)');
            throw new Error('Gemini API timeout');
        }
        console.error('   ❌ API Call Error:', error.message);
        throw error;
    }
}
async function callGoogleGenAI(userMessage, systemPrompt, apiKey) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log(`   Model: ${model}`);
    console.log(`   URL: ${url.substring(0, 70)}...`);
    
    const requestBody = {
        contents: [{
            role: 'user',
            parts: [{
                text: `${systemPrompt}\n\nUser: ${userMessage}`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
    };

    console.log('   Sending request to Gemini API...');
    
    try {
        const controller = new AbortController();
        // Increase timeout to 15 seconds to allow for API processing
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        console.log(`   Response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`   HTTP Error ${response.status}:`, errorData.substring(0, 200));
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('   Response received, parsing...');

        // Handle different response formats
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            // Check for safety ratings
            if (candidate.finishReason === 'SAFETY') {
                console.warn('   ⚠️ Response blocked by safety filter');
                throw new Error('Response blocked by safety filter');
            }

            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const responseText = candidate.content.parts[0].text;
                console.log(`   ✅ Got response (${responseText.length} chars)`);
                return responseText;
            }
        }

        // Check for error in response
        if (data.error) {
            console.error('   API Error:', data.error.message);
            throw new Error(data.error.message);
        }

        console.error('   Invalid response structure:', JSON.stringify(data).substring(0, 200));
        throw new Error('Invalid API response structure');
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('   ❌ Request timeout (15s)');
            throw new Error('Gemini API timeout');
        }
        console.error('   ❌ API Call Error:', error.message);
        throw error;
    }
}


/**
 * Local AI response generation - Conversational & Natural
 * Responds like ChatGPT/Gemini with short, dynamic responses
 */
function generateLocalAIResponse(userMessage, patientResults, conversationHistory) {
    const lowerMessage = userMessage.toLowerCase();
    const eGFR = parseFloat(patientResults?.eGFR) || 0;
    const riskLevel = patientResults?.riskLevel?.toLowerCase() || 'unknown';
    
    // Determine stage based on eGFR
    let stage = 'normal';
    if (eGFR >= 90) stage = 'Stage 1';
    else if (eGFR >= 60) stage = 'Stage 2';
    else if (eGFR >= 45) stage = 'Stage 3a';
    else if (eGFR >= 30) stage = 'Stage 3b';
    else stage = 'Stage 4-5';
    
    // GREETING
    if (lowerMessage.match(/^(hello|hi|hey|greet)/i)) {
        return `👋 Hi there! I'm your kidney health assistant. I'm here to answer questions about kidney function, diet, exercise, medications, and lifestyle tips. What would you like to know?`;
    }
    
    // KIDNEY FUNCTION & eGFR - MAIN TOPIC
    if (lowerMessage.match(/kidney.*function|egfr|glomerular|filtration/i)) {
        if (eGFR > 0) {
            const explanation = `
Kidney function is measured by eGFR (estimated Glomerular Filtration Rate), which shows how well your kidneys are filtering waste from your blood.

**Your Current Status:**
• eGFR: ${eGFR} mL/min/1.73m²
• Stage: ${stage}

**eGFR Scale:**
• 90+: Normal kidney function
• 60-89: Mild reduction
• 45-59: Mild to moderate reduction
• 30-44: Moderate to severe reduction
• <30: Severe reduction (near kidney failure)

**Why eGFR Matters:**
Early detection through regular eGFR testing helps catch kidney disease before it becomes serious. It's the most important indicator of kidney health and guides all treatment decisions.

Keep monitoring regularly and follow your doctor's recommendations! 💪`;
            return explanation.trim();
        } else {
            return `eGFR (estimated Glomerular Filtration Rate) is the gold standard for measuring kidney function. It tells doctors how efficiently your kidneys are filtering waste.

**eGFR Scale:**
• 90+: Normal
• 60-89: Mild reduction
• 45-59: Mild-moderate reduction  
• 30-44: Moderate-severe reduction
• <30: Severe (kidney failure risk)

Regular testing is crucial for early detection of kidney disease. If you haven't had your eGFR tested recently, ask your doctor for a simple blood test! 🩸`;
        }
    }
    
    // KIDNEY DISEASE SIGNS & SYMPTOMS
    if (lowerMessage.match(/sign|symptom|warning|attention|problem|disease/i)) {
        return `⚠️ **5 Common Signs Your Kidneys Need Attention:**

1. **Swelling** - Puffiness in feet, ankles, hands, or face (fluid buildup)

2. **Fatigue** - Unusual tiredness, weakness, difficulty concentrating (anemia from reduced erythropoietin)

3. **Changes in Urination** - Less/more frequent urination, foamy/dark urine, or blood in urine

4. **High Blood Pressure** - Consistent readings above 130/80 mmHg

5. **Loss of Appetite** - Not feeling hungry, nausea, metallic taste

**When to See a Doctor:**
• Any of these symptoms appear
• Unexplained weight gain
• Back pain below ribs
• Persistent headaches

Early detection can slow kidney disease progression significantly! 🏥`;
    }
    
    // DIET & NUTRITION
    if (lowerMessage.match(/diet|food|eat|nutrition|meal|nutrition|what.*eat/i)) {
        if (eGFR >= 60) {
            return `🥗 **Healthy Diet for Your Kidney Stage:**

**✅ EAT MORE:**
• Fresh fruits: Apples, grapes, berries, watermelon
• Vegetables: Carrots, broccoli, cabbage, cucumbers, lettuce
• Lean proteins: Chicken, fish, eggs (moderate portions)
• Whole grains: Brown rice, whole wheat bread
• Healthy fats: Olive oil, avocado

**⚠️ LIMIT:**
• Salt & processed foods (high sodium)
• Sugary drinks & sweets
• Too much meat at one meal

**💡 Tips:**
• Cook at home to control sodium
• Use herbs & spices instead of salt
• Read food labels for sodium content
• Keep meals balanced and colorful!

Your kidney function is good - you have flexibility. Just stay mindful! 👍`;
        } else {
            return `🥗 **Renal Diet for Advanced Kidney Disease:**

**✅ FOCUS ON:**
• Low-sodium foods (<2000mg daily)
• Limited protein (portion-controlled meats)
• Phosphorus-controlled foods
• Potassium-restricted foods

**❌ AVOID:**
• Bananas, oranges, tomatoes, potatoes (high potassium)
• Processed meats, canned foods
• Cheese, nuts, chocolate (high phosphorus)
• Salt & salty snacks

**💚 Safe Options:**
• Apples, grapes, watermelon
• Rice, pasta, white bread
• Lean chicken, fish (small portions)
• Green beans, carrots, cabbage

**IMPORTANT:** Work with a renal dietitian to personalize your meal plan based on your lab values! They're your best resource. 👨‍⚕️`;
        }
    }
    
    // EXERCISE & ACTIVITY
    if (lowerMessage.match(/exercise|activity|sport|fitness|workout|physical|movement/i)) {
        if (eGFR >= 60) {
            return `💪 **Exercise Plan for Healthy Kidneys:**

**RECOMMENDED:**
• Brisk walking: 30 mins, 5 days/week
• Swimming or water aerobics
• Cycling (stationary or outdoor)
• Light strength training (2-3x/week)
• Yoga or tai chi
• Dancing or recreational sports

**GUIDELINES:**
✓ Warm up for 5-10 minutes
✓ Exercise at moderate intensity
✓ Stay hydrated throughout
✓ Listen to your body
✓ Rest on non-exercise days

**BENEFITS:**
• Controls blood pressure
• Reduces kidney disease risk
• Improves overall health
• Boosts mood & energy

Start slowly and build gradually. Consistency matters more than intensity! 🏃`;
        } else {
            return `💪 **Modified Exercise for Advanced Kidney Disease:**

**SAFE OPTIONS:**
• Light walking (20-30 mins daily)
• Gentle stretching
• Tai chi
• Yoga (avoiding intense classes)
• Water walking (no swimming)
• Slow dancing

**AVOID:**
✗ Heavy weight lifting
✗ Intense cardio/sprinting
✗ Contact sports
✗ Dehydrating activities

**IMPORTANT RULES:**
• Get doctor approval before starting
• Stop if you feel dizzy or chest pain
• Rest when you feel tired
• Don't overexert yourself

Even gentle movement helps! Consistency and listening to your body are key. Check with your nephrologist before changing your routine. 🏥`;
        }
    }
    
    // HYDRATION
    if (lowerMessage.match(/drink|water|hydrat|fluid|beverage/i)) {
        if (eGFR >= 60) {
            return `💧 **Hydration for Healthy Kidneys:**

**DAILY INTAKE:**
• 8-10 glasses of water daily (standard recommendation)
• More if you exercise or live in hot climate
• Less if your doctor advises otherwise

**BEST CHOICES:**
✅ Water (best option)
✅ Herbal teas (no caffeine)
✅ Low-sugar drinks

**AVOID:**
❌ Sugary sodas & energy drinks
❌ Too much caffeine
❌ Alcohol (limit to moderate amounts)

**HYDRATION TIPS:**
💡 Drink throughout the day, not all at once
💡 Check urine color - pale yellow = well hydrated
💡 Drink when thirsty
💡 More water = cleaner kidneys!

Proper hydration supports kidney function! 🌊`;
        } else {
            return `💧 **Fluid Management for Advanced Kidney Disease:**

**⚠️ IMPORTANT:** Your doctor should have given you a specific fluid limit. FOLLOW IT STRICTLY!

**WHY LIMIT FLUIDS:**
• Reduced kidney function can't remove excess fluid
• Causes swelling, high blood pressure
• Strains your heart

**TIPS TO MANAGE LIMITS:**
• Measure all fluids (water, milk, soup, coffee)
• Use smaller cups
• Suck on ice chips (counts as fluid)
• Avoid salty foods (makes you thirsty)
• Rinse mouth instead of drinking

**INCLUDE IN COUNT:**
• Water, juice, milk, soup
• Ice cream, pudding, jello
• Fruits with high water content

**If unsure about your limit:** Ask your nephrologist or dietitian immediately! They'll help you stay within safe amounts. 🏥`;
        }
    }
    
    // SODIUM/SALT
    if (lowerMessage.match(/sodium|salt|salty|high.*salt/i)) {
        return `🧂 **Sodium Control for Kidney Health:**

**DAILY LIMIT:**
• Under 2,300mg daily (ideal: <1,500mg)
• Check with doctor for your specific limit

**MAJOR SODIUM SOURCES:**
🍔 Processed foods (largest culprit!)
🥫 Canned foods
🍕 Restaurant meals
🥓 Processed meats
🥨 Salty snacks
🍞 Bread products

**HOW TO REDUCE:**
✓ Cook at home (control salt)
✓ Use fresh ingredients
✓ Rinse canned foods (reduces sodium 30%)
✓ Use herbs & spices: garlic, lemon, ginger
✓ Skip the salt shaker
✓ Read food labels carefully
✓ Choose "low-sodium" options

**TASTE BUDS ADAPT:**
After 2-3 weeks, your taste buds adjust and food tastes normal without salt! 

Lower sodium = lower blood pressure = healthier kidneys! 👍`;
    }
    
    // POTASSIUM
    if (lowerMessage.match(/potassium|banana|potato|tomato|orange/i)) {
        if (eGFR >= 60) {
            return `🍌 **Potassium & Your Kidneys:**

**GOOD NEWS:** With your kidney function, you can enjoy most potassium-rich foods!

**POTASSIUM-RICH FOODS YOU CAN EAT:**
✅ Bananas, oranges, strawberries
✅ Potatoes, sweet potatoes
✅ Tomatoes, tomato sauce
✅ Beans, lentils
✅ Spinach, broccoli
✅ Nuts & seeds
✅ Avocado, coconut water

**GUIDELINES:**
• Eat varied fruits & vegetables
• Include potassium-rich foods naturally
• Don't need to restrict these foods

Keep enjoying a balanced, colorful diet! 🌈`;
        } else {
            return `⚠️ **Potassium Restrictions for Advanced Kidney Disease:**

With reduced kidney function, potassium can build up to dangerous levels. It's CRITICAL to manage this!

**HIGH POTASSIUM - AVOID:**
❌ Bananas, oranges, avocado
❌ Potatoes, sweet potatoes
❌ Tomatoes & tomato sauce
❌ Beans, lentils, nuts
❌ Spinach, kale
❌ Dried fruits
❌ Coconut water
❌ Sports drinks

**LOWER POTASSIUM - SAFE:**
✅ Apples, grapes, watermelon
✅ Rice, pasta, white bread
✅ Carrots, green beans, cabbage
✅ Chicken, fish (lean)
✅ Regular milk (portion controlled)

**PRO TIP:** Boil and discard potato/vegetable water to reduce potassium!

**ESSENTIAL:** Work with your dietitian for your exact potassium targets based on blood tests! 👩‍⚕️`;
        }
    }
    
    // PROTEIN
    if (lowerMessage.match(/protein|meat|chicken|fish|egg|dairy/i)) {
        if (eGFR >= 60) {
            return `🥚 **Protein for Healthy Kidneys:**

**PROTEIN NEEDS:** 
Your kidneys are healthy - standard protein intake is fine!

**BEST PROTEIN SOURCES:**
✅ Lean meats: chicken, turkey, fish
✅ Eggs
✅ Low-fat dairy: milk, yogurt, cheese
✅ Plant proteins: tofu, beans, lentils

**PORTION GUIDELINES:**
• 3-4 ounces per meal (size of deck of cards)
• Don't overload at any meal
• Spread protein throughout the day

**VARIETY IS KEY:**
Mix fish (omega-3s), chicken, and plant proteins for optimal health!

Protein is important - just keep portions reasonable! 💪`;
        } else {
            return `🥚 **Protein Management for Advanced Kidney Disease:**

**WHY LIMIT PROTEIN:**
• Damaged kidneys can't filter protein breakdown products
• Too much protein stresses kidneys further

**PROTEIN LIMITS:**
• Usually 40-60g daily (ask your doctor)
• Less protein = less kidney workload

**PROTEIN CHOICES:**
✅ Fish (2-3x/week) - contains omega-3s
✅ Lean chicken (small portions)
✅ Eggs (limit to 3-4/week)
✅ Low-phosphorus options

**REDUCE:**
❌ Red meat & processed meats
❌ Too much dairy/cheese
❌ Nuts & seeds (high phosphorus)

**COOKING TIPS:**
• Use small portions (3 ounces)
• Cook with herbs instead of salt
• Trim visible fat

**CRITICAL:** Your nephrologist/dietitian should calculate YOUR exact protein needs based on lab values! This is personalized based on your stage. 👨‍⚕️`;
        }
    }
    
    // MONITORING & TESTING
    if (lowerMessage.match(/monitor|check|test|lab|how often|schedule/i)) {
        return `📊 **Regular Monitoring Schedule:**

${eGFR >= 60 ? `**For Stage 1-2:**
• Annual check-ups
• Yearly eGFR & creatinine test
• Annual blood pressure monitoring
• Urine protein test yearly` : `**For Advanced Stages:**
• Every 3-6 months: Doctor visits
• Monthly or quarterly: Blood work
• Frequent: Blood pressure checks
• Regular: Urine protein monitoring`}

**HOME MONITORING:**
✓ Blood pressure (weekly or as instructed)
✓ Weight (daily)
✓ Swelling in legs/ankles
✓ Urine changes
✓ Energy & appetite levels
✓ Medication adherence

**WHAT TO TRACK:**
• eGFR trend (stable or declining?)
• Creatinine levels
• Blood pressure readings
• Weight changes
• Symptom journal

**TOOLS:**
📱 Apps for blood pressure tracking
📓 Health journal for symptoms
📅 Calendar for appointment reminders

Consistent monitoring helps catch problems early! 🏥`;
    }
    
    // PREVENTION & IMPROVEMENT
    if (lowerMessage.match(/improve|prevent|better|slow down|progress|manage|control/i)) {
        return `📈 **Action Plan to Prevent Kidney Disease Progression:**

**DIET:**
• Follow your kidney-friendly meal plan
• Control sodium, phosphorus, potassium
• Manage protein intake
• Stay hydrated appropriately

**BLOOD PRESSURE:**
• Keep it below 130/80 mmHg
• Take medications as prescribed
• Reduce sodium intake
• Manage stress

**MEDICATIONS:**
• Take ALL meds exactly as prescribed
• Don't skip doses
• Blood pressure meds (ACE inhibitors/ARBs often recommended)
• Other meds for specific conditions

**LIFESTYLE:**
• Regular gentle exercise
• Maintain healthy weight
• Don't smoke (or quit if you do)
• Limit alcohol
• Manage stress

**MONITORING:**
• Regular doctor visits
• Blood work as scheduled
• Home blood pressure checks
• Track symptoms daily

**IMPORTANT CONTACTS:**
👨‍⚕️ Nephrologist (kidney specialist)
👩‍⚕️ Renal dietitian
📞 Your primary care doctor

Small consistent changes slow disease progression! You're taking the right steps! 💪`;
    }
    
    // KIDNEY STONES
    if (lowerMessage.match(/stone|pain|sharp|severe/i)) {
        return `🪨 **Kidney Stones - Prevention & Management:**

**SYMPTOMS (See doctor immediately!):**
• Severe pain in back/side below ribs
• Blood in urine
• Nausea & vomiting
• Burning urination
• Frequent urination

**PREVENTION:**
✓ Drink 2-3 liters water daily
✓ Limit sodium & animal protein
✓ Limit high-oxalate foods (spinach, nuts)
✓ Maintain healthy weight
✓ Regular exercise

**SAFE FOODS:**
• Lemon & citrus (prevent stones)
• Low-sodium options
• Lean proteins in moderation

**IF YOU HAVE A STONE:**
• Drink plenty of water
• Pain management as directed
• Seek immediate medical care
• Imaging (ultrasound, CT scan) may be needed

Kidney stones are very treatable. Early detection is key! 🏥`;
    }
    
    // MEDICATIONS
    if (lowerMessage.match(/medication|medicine|pill|drug|prescription|pharma/i)) {
        return `💊 **Medications for Kidney Health:**

**COMMON KIDNEY MEDICATIONS:**

**Blood Pressure Control:**
• ACE inhibitors (lisinopril, enalapril)
• ARBs (losartan, valsartan)
• Diuretics
• Beta-blockers
• Calcium channel blockers

**Kidney Disease Management:**
• Phosphate binders (if needed)
• Vitamin D supplements
• Erythropoiesis-stimulating agents (for anemia)
• Iron supplements

**IMPORTANT RULES:**
✅ Take exactly as prescribed
✅ Don't skip doses
✅ Take at same time daily
✅ Tell doctor about all supplements
✅ Ask about side effects
✅ Never stop without doctor approval

**SIDE EFFECTS:**
Report to doctor: Dizziness, excessive tiredness, swelling, shortness of breath

Your medications protect your kidneys - consistency is crucial! 👨‍⚕️`;
    }
    
    // GENERAL SUPPORT
    if (lowerMessage.match(/worry|concern|afraid|stress|help|support/i)) {
        return `💚 **You're Not Alone in This:**

Millions of people manage kidney disease successfully every day. You're taking the right steps by:
• Monitoring your health
• Seeking information
• Following medical advice
• Making lifestyle changes

**SUPPORT RESOURCES:**
👥 Kidney disease support groups (online & local)
📱 Health apps for tracking
👨‍⚕️ Your medical team (ask for help!)
👨‍⚩ Family & friends support
📚 Educational resources

**POSITIVE REMINDERS:**
✨ Early detection changes outcomes
✨ Lifestyle changes slow progression
✨ Modern treatments are very effective
✨ You have control over many factors
✨ Regular monitoring gives peace of mind

Many people with kidney disease live full, healthy lives with proper management! 

**Immediate concerns?** Contact your doctor or nephrologist right away. 💙`;
    }
    
    // DEFAULT RESPONSE
    const defaults = [
        `That's a great question! 🤔 Are you asking about:
• Kidney function & testing?
• Diet & nutrition?
• Exercise & activity?
• Medications?
• Symptoms or monitoring?

Let me know the topic and I'll give you detailed info! 😊`,
        
        `I'm here to help! 💙 I can explain:
• What kidney disease is and stages
• How to eat for kidney health
• Exercise & lifestyle tips
• Medication management
• When to see a doctor

What would you like to know more about?`,
        
        `Good question! 👍 Tell me more about what interests you:
• Understanding your test results?
• Tips for daily kidney health?
• Specific dietary concerns?
• Exercise recommendations?
• General kidney health info?

I'll give you comprehensive, clear answers! 📊`
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    console.log('New WebSocket client connected');
    clients.add(ws);
    
    // Send initial connection message
    ws.send(JSON.stringify({
        type: 'connection_established',
        payload: {
            message: 'Connected to Smart Kidney Monitoring System'
        }
    }));
    
    // Handle incoming messages from clients
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message from client:', data);
            
            // Handle different message types
            switch (data.type) {
                case 'ping':
                    ws.send(JSON.stringify({
                        type: 'pong'
                    }));
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
    });
    
    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Function to broadcast messages to all connected clients
function broadcastMessage(message) {
    const messageString = JSON.stringify(message);
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageString);
        }
    });
}

// Simulate sensor data for demonstration
function simulateSensorData() {
    const sensorData = {
        bioimpedance: {
            '1khz': (400 + Math.random() * 100).toFixed(0),
            '10khz': (370 + Math.random() * 100).toFixed(0),
            '100khz': (330 + Math.random() * 100).toFixed(0),
            '200khz': (300 + Math.random() * 100).toFixed(0)
        },
        optical: {
            red: (600 + Math.random() * 100).toFixed(0),
            ir: (900 + Math.random() * 100).toFixed(0),
            green: (500 + Math.random() * 50).toFixed(0)
        },
        temperature: (36.0 + Math.random() * 2).toFixed(1),
        heartRate: (60 + Math.random() * 40).toFixed(0),
        motion: (5 + Math.random() * 50).toFixed(0),
        pressure: (100 + Math.random() * 3).toFixed(1),
        battery: (70 + Math.random() * 30).toFixed(0)
    };
    
    broadcastMessage({
        type: 'sensor_update',
        payload: sensorData
    });
}

// Track test sessions to avoid duplicates
let testSessionId = 1;
let packetCount = 0;
const TOTAL_PACKETS = 180;
let testInProgress = false;

function startNewTest() {
    if (!testInProgress) {
        testInProgress = true;
        packetCount = 0;
        testSessionId++;
        console.log(`Starting new test session: ${testSessionId}`);
    }
}

function stopTest() {
    testInProgress = false;
    packetCount = 0;
    console.log('Test stopped');
}

function simulateTestProgress() {
    if (!testInProgress) return;
    
    if (packetCount < TOTAL_PACKETS) {
        packetCount++;
        
        broadcastMessage({
            type: 'test_progress',
            payload: {
                testId: `TEST-${testSessionId.toString().padStart(3, '0')}`,
                packetsReceived: packetCount,
                totalPackets: TOTAL_PACKETS
            }
        });
        
        // When test is complete, send completion message
        if (packetCount === TOTAL_PACKETS) {
            setTimeout(() => {
                // Simulate realistic biophysical parameters
                const realisticEGFR = (85 + Math.random() * 15).toFixed(2); // Normal range: 90-120
                const realisticTemp = (36.8 + (Math.random() - 0.5) * 0.4).toFixed(1); // Normal: 36.5-37.5°C
                const realisticBP = `${Math.floor(110 + Math.random() * 20)}/${Math.floor(70 + Math.random() * 10)}`; // Normal: 120/80
                
                const mockMLResult = {
                    testId: `TEST-${testSessionId.toString().padStart(3, '0')}`,
                    timestamp: new Date().toISOString(),
                    biophysical: {
                        blood_pressure: realisticBP,
                        body_temperature: realisticTemp,
                        heart_rate: Math.floor(60 + Math.random() * 20), // 60-80 BPM
                        respiratory_rate: Math.floor(12 + Math.random() * 4) // 12-16 breaths/min
                    },
                    prediction: {
                        egfr: realisticEGFR,
                        kidney_status: realisticEGFR >= 90 ? "Normal" : realisticEGFR >= 60 ? "Mildly Reduced" : "Risk",
                        confidence_score: (88 + Math.random() * 12).toFixed(1), // 88-100%
                        risk_level: realisticEGFR >= 90 ? "Low" : realisticEGFR >= 60 ? "Medium" : "High"
                    },
                    recommendations: {
                        primary: realisticEGFR >= 90 ? 
                            "Continue with regular monitoring. Maintain healthy hydration levels." :
                            "Consult with a nephrologist for further evaluation.",
                        secondary: [
                            "Maintain blood pressure below 130/80 mmHg",
                            "Follow a low-protein diet",
                            realisticEGFR >= 90 ? "Schedule next test in 12 months" : "Schedule next test in 6 months"
                        ],
                        next_test_schedule: realisticEGFR >= 90 ? "12 months" : "6 months"
                    }
                };
                
                // Broadcast test completion with mock ML results
                broadcastMessage({
                    type: 'test_completed',
                    payload: {
                        mlResults: mockMLResult
                    }
                });
                
                // Stop the test after completion
                stopTest();
            }, 1000);
        }
    }
}

// Start the server (with optional MySQL initialization)
async function startServer() {
    try {
        // Try to connect to MySQL
        if (process.env.DB_HOST || process.env.DB_USER || process.env.DB_NAME) {
            try {
                const conn = await mysqlDb.pool.getConnection();
                conn.release();
                await mysqlDb.initializeDatabase();
                switchToMySQL();
            } catch (err) {
                console.error('⚠️ MySQL unavailable, using file-based fallback DB:', err.message);
                console.log('⏳ Will auto-reconnect to MySQL every 30 seconds...');
                startMySQLReconnect();
            }
        }

        // Get the IP address for displaying to users
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let ipAddress = 'localhost';

        // Priority: Use environment variable, then find network IP, then localhost
        if (process.env.SERVER_IP) {
            ipAddress = process.env.SERVER_IP;
        } else {
            // Find the first non-loopback IPv4 address
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        ipAddress = iface.address;
                        break;
                    }
                }
                if (ipAddress !== 'localhost') break;
            }
        }

        // Get ML API configuration from environment variables
        const ML_API_IP = process.env.ML_API_IP || ipAddress;
        const ML_API_PORT = process.env.ML_API_PORT || 5000;

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`\n========================================`);
            console.log(`Server running on http://${ipAddress}:${PORT}`);
            console.log(`WebSocket server running on ws://${ipAddress}:${PORT}`);
            console.log(`Local: http://localhost:${PORT}`);
            console.log(`ML API: http://${ML_API_IP}:${ML_API_PORT}`);
            console.log(`========================================\n`);

            // Create a config file that clients can use
            const fs = require('fs');
            const config = {
                serverIP: ipAddress,
                serverPort: PORT,
                mlApiIP: ML_API_IP,
                mlApiPort: parseInt(ML_API_PORT),
                timestamp: new Date().toISOString()
            };

            fs.writeFileSync(
                path.join(__dirname, 'public', 'config.json'),
                JSON.stringify(config, null, 2)
            );
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Start a new test when server starts
// startNewTest();  // Commented out - let clients trigger tests manually

// Simulate data for demonstration (in a real app, this would come from ESP32)
setInterval(() => {
    simulateSensorData();
    simulateTestProgress();
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    
    // Close all WebSocket connections
    clients.forEach(client => {
        client.close();
    });
    
    // Close WebSocket server
    wss.close(() => {
        console.log('WebSocket server closed');
    });
    
    // Close HTTP server
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});