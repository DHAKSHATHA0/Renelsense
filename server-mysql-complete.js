// ========================================
// NODE.JS BACKEND - MYSQL DATABASE SERVER
// ========================================

// ========================================
// IMPORT REQUIRED PACKAGES
// ========================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// ========================================
// CREATE EXPRESS APP
// ========================================

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Enable CORS to allow frontend requests from different origins
app.use(cors());

// Parse incoming JSON request bodies with a size limit
app.use(bodyParser.json({ limit: '50mb' }));

// Parse incoming URL-encoded request bodies
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// MYSQL CONNECTION POOL
// ========================================

// Create a temporary connection pool without database to create the database first
const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',      // MySQL server address
    user: process.env.DB_USER || 'root',            // MySQL username
    password: process.env.DB_PASSWORD || 'root',    // MySQL password
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

console.log('📊 MySQL Connection Pool Created');

// ========================================
// DATABASE INITIALIZATION
// ========================================

// This function creates the database and tables if they don't exist
// Run this once when the server starts
async function createDatabaseIfNotExists() {
    const connection = await tempPool.getConnection();
    try {
        console.log('🔧 Checking if database exists...');
        
        const dbName = process.env.DB_NAME || 'kidney_monitoring';
        
        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database "${dbName}" ready`);
        
    } catch (error) {
        console.error('❌ Error creating database:', error);
    } finally {
        connection.release();
    }
}

// Create main connection pool (with database specified)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',      // MySQL server address
    user: process.env.DB_USER || 'root',            // MySQL username
    password: process.env.DB_PASSWORD || 'root',    // MySQL password
    database: process.env.DB_NAME || 'kidney_monitoring', // Database name
    waitForConnections: true,                       // Wait if no connections available
    connectionLimit: 10,                            // Maximum number of connections
    queueLimit: 0,                                  // No limit on queued connection requests
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

// This function creates tables if they don't exist
async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        console.log('🔧 Initializing database tables...');

        // Create users table
        // This table stores user information submitted from the frontend
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                age INT,
                gender VARCHAR(10),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Users table ready');

        // Drop old test_results table if it exists (to recreate with correct columns)
        console.log('🔧 Checking test_results table structure...');
        try {
            await connection.execute(`DROP TABLE IF EXISTS test_results`);
            console.log('✅ Old test_results table removed (will recreate with correct schema)');
        } catch (e) {
            console.log('ℹ️ No old table to remove');
        }

        // Create test_results table with enhanced fields for complete tracking
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS test_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                testDate DATE,
                testTime TIME,
                eGFR DECIMAL(10, 2),
                creatinine DECIMAL(10, 2),
                heartRate INT,
                spo2 DECIMAL(5, 2),
                temperature DECIMAL(5, 2),
                status VARCHAR(50),
                stage VARCHAR(50),
                riskLevel VARCHAR(20),
                confidence DECIMAL(5, 2),
                interpretation TEXT,
                recommendation TEXT,
                report TEXT,
                packetCount INT DEFAULT 180,
                dataQuality DECIMAL(5, 2),
                gender VARCHAR(10),
                age INT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_userId (userId),
                INDEX idx_testDate (testDate)
            )
        `);

        console.log('✅ Test Results table ready');

        console.log('✅ Database initialization complete!');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        connection.release();
    }
}

// ========================================
// API ENDPOINTS (REST APIs)
// ========================================

// Test endpoint to verify server is running
app.get('/', (req, res) => {
    // Root route serves login page, redirect to home if logged in is handled by client
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Signup route - serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Login route - serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Result route - serve result page
app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

// Report route - serve report page
app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

// History route - serve history page
app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'history.html'));
});

// Live Test route - serve live test page
app.get('/live-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live-test.html'));
});

// AI Assistant route - serve ai assistant page
app.get('/ai-assistant', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai-assistant.html'));
});

// Chatbot route - serve chatbot page
app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

// POST: Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const connection = await pool.getConnection();

        try {
            // Check if user already exists
            const [existingUsers] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Create user with combined name
            const fullName = `${firstName} ${lastName}`;
            
            const [result] = await connection.execute(
                'INSERT INTO users (name, email, phone, age, gender) VALUES (?, ?, ?, ?, ?)',
                [fullName, email, phone || null, null, null]
            );

            console.log(`✅ User registered: ${email} (ID: ${result.insertId})`);

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: {
                    id: result.insertId,
                    name: fullName,
                    email,
                    phone
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
});

// POST: Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password required'
            });
        }

        const connection = await pool.getConnection();

        try {
            // Find user by email
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = users[0];

            console.log(`✅ User logged in: ${email}`);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

// ========================================
// POST ENDPOINT: Add New User
// ========================================

// This endpoint receives data from the frontend form and inserts it into MySQL
// URL: http://localhost:3000/api/users
// Method: POST
// Body: { name: "John", email: "john@example.com", phone: "123456789", age: 30, gender: "Male" }

app.post('/api/users', async (req, res) => {
    try {
        // Extract data from request body
        const { name, email, phone, age, gender } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Get a connection from the pool
        const connection = await pool.getConnection();

        try {
            // Insert user data into the users table
            // The ? placeholders prevent SQL injection attacks
            const [result] = await connection.execute(
                'INSERT INTO users (name, email, phone, age, gender) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, age, gender]
            );

            console.log(`✅ User added: ${email} (ID: ${result.insertId})`);

            // Send success response
            res.status(201).json({
                success: true,
                message: 'User added successfully',
                userId: result.insertId,
                data: { id: result.insertId, name, email, phone, age, gender }
            });

        } finally {
            // Always release the connection back to the pool
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error adding user:', error);

        // Check if error is due to duplicate email
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding user',
            error: error.message
        });
    }
});

// ========================================
// GET ENDPOINT: Fetch All Users
// ========================================

// This endpoint retrieves all users from the MySQL database
// URL: http://localhost:3000/api/users
// Method: GET
// Returns: Array of all users

app.get('/api/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            // Fetch all users from the database, ordered by creation date (newest first)
            const [users] = await connection.execute(
                'SELECT * FROM users ORDER BY createdAt DESC'
            );

            console.log(`✅ Fetched ${users.length} users`);

            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// ========================================
// GET ENDPOINT: Fetch Single User by ID
// ========================================

// URL: http://localhost:3000/api/users/1
// Method: GET
// Returns: Single user with specified ID

app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate that ID is a number
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const connection = await pool.getConnection();

        try {
            // Fetch user with specific ID
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log(`✅ Fetched user: ${users[0].name}`);

            res.status(200).json({
                success: true,
                data: users[0]
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// ========================================
// PUT ENDPOINT: Update User
// ========================================

// URL: http://localhost:3000/api/users/1
// Method: PUT
// Body: { name: "Updated Name", email: "new@example.com" }

app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, phone, age, gender } = req.body;

        const connection = await pool.getConnection();

        try {
            // Check if user exists first
            const [existingUser] = await connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            if (existingUser.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update user data
            await connection.execute(
                'UPDATE users SET name = ?, email = ?, phone = ?, age = ?, gender = ? WHERE id = ?',
                [name, email, phone, age, gender, userId]
            );

            console.log(`✅ User updated: ID ${userId}`);

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: { id: userId, name, email, phone, age, gender }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// ========================================
// DELETE ENDPOINT: Delete User
// ========================================

// URL: http://localhost:3000/api/users/1
// Method: DELETE

app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const connection = await pool.getConnection();

        try {
            // Check if user exists
            const [existingUser] = await connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            if (existingUser.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Delete the user
            await connection.execute(
                'DELETE FROM users WHERE id = ?',
                [userId]
            );

            console.log(`✅ User deleted: ID ${userId}`);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// ========================================
// TEST RESULTS ENDPOINTS
// ========================================

// POST: Save test results
app.post('/api/test-results', async (req, res) => {
    try {
        console.log('📝 Received test-results POST request');
        console.log('📝 Request body:', req.body);
        
        const { 
            userId, 
            eGFR, 
            creatinine, 
            heartRate, 
            spo2, 
            temperature, 
            status,
            stage,
            riskLevel,
            confidence,
            interpretation,
            recommendation,
            report,
            packetCount,
            dataQuality,
            gender,
            age
        } = req.body;

        console.log(`📝 Processing test for user ID: ${userId}`);
        
        if (!userId || eGFR === undefined) {
            console.error('❌ Missing userId or eGFR');
            return res.status(400).json({
                success: false,
                message: 'User ID and eGFR are required'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            console.log('✅ Database connection established');
        } catch (connError) {
            console.error('❌ Failed to get database connection:', connError);
            return res.status(503).json({
                success: false,
                message: 'Database connection unavailable. Please ensure MySQL is running.'
            });
        }

        try {
            // Get current date and time
            const now = new Date();
            const testDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const testTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

            const [result] = await connection.execute(
                `INSERT INTO test_results (userId, testDate, testTime, eGFR, creatinine, heartRate, spo2, temperature, status, stage, riskLevel, confidence, interpretation, recommendation, report, packetCount, dataQuality, gender, age) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, testDate, testTime, eGFR, creatinine, heartRate, spo2, temperature, status || 'completed', stage, riskLevel, confidence, interpretation, recommendation, report, packetCount || 180, dataQuality, gender, age]
            );

            console.log(`✅✅ Test result saved for user ${userId}`);
            console.log(`    Test ID: ${result.insertId}`);
            console.log(`    eGFR: ${eGFR}, Stage: ${stage}, Risk: ${riskLevel}`);

            res.status(201).json({
                success: true,
                message: 'Test result saved successfully',
                testId: result.insertId,
                testData: {
                    id: result.insertId,
                    userId,
                    testDate,
                    testTime,
                    eGFR,
                    creatinine,
                    heartRate,
                    spo2,
                    temperature,
                    status: status || 'completed',
                    stage,
                    riskLevel,
                    confidence,
                    interpretation,
                    recommendation,
                    report
                }
            });

        } catch (execError) {
            console.error('❌ Error executing test insert query:', execError);
            console.error('Error code:', execError.code);
            console.error('Error SQL state:', execError.sqlState);
            
            // Provide specific error messages based on error type
            let userMessage = 'Unable to save test result';
            if (execError.code === 'ER_NO_REFERENCED_ROW') {
                userMessage = 'User not found. Please log in again.';
            } else if (execError.code === 'ER_ACCESS_DENIED_ERROR') {
                userMessage = 'Database access denied. Contact administrator.';
            }
            
            res.status(500).json({
                success: false,
                message: userMessage
            });
        } finally {
            if (connection) connection.release();
        }

    } catch (error) {
        console.error('❌ Unexpected error in test-results endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again.'
        });
    }
});

// GET: Fetch test results for a user
app.get('/api/test-results/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`📋 Fetching tests for user ID: ${userId}`);

        const connection = await pool.getConnection();

        try {
            const [results] = await connection.execute(
                'SELECT * FROM test_results WHERE userId = ? ORDER BY timestamp DESC',
                [userId]
            );

            console.log(`✅ Found ${results.length} tests for user ${userId}`);
            console.log('📋 Tests data:', results);

            res.status(200).json({
                success: true,
                count: results.length,
                data: results
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error fetching test results:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test results',
            error: error.message
        });
    }
});

// GET: Fetch test statistics for a user
app.get('/api/test-results/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const connection = await pool.getConnection();

        try {
            // Get all test results
            const [results] = await connection.execute(
                'SELECT eGFR, riskLevel, stage, testDate, testTime FROM test_results WHERE userId = ? ORDER BY testDate DESC, testTime DESC',
                [userId]
            );

            if (results.length === 0) {
                return res.status(200).json({
                    success: true,
                    count: 0,
                    stats: {
                        totalTests: 0,
                        averageEGFR: null,
                        latestEGFR: null,
                        latestStatus: null,
                        latestDate: null,
                        highestEGFR: null,
                        lowestEGFR: null,
                        eGFRTrend: 'stable'
                    }
                });
            }

            // Calculate statistics
            const egfrValues = results.map(r => parseFloat(r.eGFR)).filter(v => !isNaN(v));
            const avgEGFR = (egfrValues.reduce((a, b) => a + b, 0) / egfrValues.length).toFixed(2);
            const latestTest = results[0];
            const highestEGFR = Math.max(...egfrValues).toFixed(2);
            const lowestEGFR = Math.min(...egfrValues).toFixed(2);

            // Determine trend (compare latest with previous)
            let eGFRTrend = 'stable';
            if (results.length > 1) {
                const latestVal = parseFloat(results[0].eGFR);
                const prevVal = parseFloat(results[1].eGFR);
                if (latestVal > prevVal) eGFRTrend = 'improving';
                else if (latestVal < prevVal) eGFRTrend = 'declining';
            }

            res.status(200).json({
                success: true,
                count: results.length,
                stats: {
                    totalTests: results.length,
                    averageEGFR: parseFloat(avgEGFR),
                    latestEGFR: parseFloat(latestTest.eGFR),
                    latestStatus: latestTest.riskLevel || latestTest.stage || 'Normal',
                    latestDate: latestTest.testDate,
                    latestTime: latestTest.testTime,
                    highestEGFR: parseFloat(highestEGFR),
                    lowestEGFR: parseFloat(lowestEGFR),
                    eGFRTrend: eGFRTrend
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error fetching test statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test statistics',
            error: error.message
        });
    }
});

// ========================================
// GROK AI CHATBOT ENDPOINT
// ========================================

// POST: Send message to Grok AI API
app.post('/api/grok-chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message cannot be empty'
            });
        }

        console.log('🤖 Received chat message:', message);

        // Call Grok API directly
        const grokApiKey = process.env.GROK_API_KEY;
        
        if (!grokApiKey) {
            console.error('❌ Grok API key not configured');
            return res.status(500).json({
                success: false,
                error: 'AI service not configured'
            });
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${grokApiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2-1212',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI health assistant specialized in kidney health and medical information. Provide accurate, empathetic, and medically sound responses about kidney disease, kidney function tests, and health management. Always remind users to consult healthcare professionals for medical decisions.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        
        console.log('� Grok API response received:', JSON.stringify(data, null, 2));

        if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
            const reply = data.choices[0].message.content;
            console.log('✅ AI response generated');
            
            res.status(200).json({
                success: true,
                reply: reply
            });
        } else if (data.error) {
            console.error('❌ Grok API error:', data.error);
            res.status(500).json({
                success: false,
                error: 'AI service error: ' + (data.error.message || JSON.stringify(data.error))
            });
        } else {
            console.error('❌ Unexpected Grok response format:', JSON.stringify(data));
            res.status(500).json({
                success: false,
                error: 'Unexpected response from AI service: ' + JSON.stringify(data).substring(0, 100)
            });
        }

    } catch (error) {
        console.error('❌ Error calling Grok API:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get AI response: ' + (error.message || 'Unknown error')
        });
    }
});

// ========================================
// 404 AND ERROR HANDLING
// ========================================

// Catch-all route - serves index.html for SPA routing or 404 handling
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// ========================================
// SERVER START
// ========================================

// Initialize database on startup (only on first run)
(async () => {
    try {
        await createDatabaseIfNotExists();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await initializeDatabase();
        console.log('✅ Database initialized');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
})();

// Start server only if not running on Vercel (for local development)
if (process.env.VERCEL !== '1') {
    const server = app.listen(PORT, () => {
        console.log('\n========================================');
        console.log('🚀 SERVER STARTING...');
        console.log('========================================\n');
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log('\n📋 Available API Endpoints:');
        console.log('   POST   /api/auth/register      - Register new user');
        console.log('   POST   /api/auth/login         - Login user');
        console.log('   POST   /api/users              - Add new user');
        console.log('   GET    /api/users              - Get all users');
        console.log('   GET    /api/users/:id          - Get single user');
        console.log('   PUT    /api/users/:id          - Update user');
        console.log('   DELETE /api/users/:id          - Delete user');
        console.log('   POST   /api/test-results       - Save test result');
        console.log('   GET    /api/test-results/user/:userId - Get test results');
        console.log('\n========================================\n');
    });

    // Handle server errors
    server.on('error', (error) => {
        console.error('❌ Server Error:', error);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n\n🛑 Shutting down server...');
        server.close();
        await pool.end();
        await tempPool.end();
        console.log('✅ Server stopped');
        process.exit(0);
    });
}

// Export app for Vercel
module.exports = app;
