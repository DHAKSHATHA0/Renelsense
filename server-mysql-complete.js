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

        // Create test_results table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS test_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                eGFR DECIMAL(10, 2),
                creatinine DECIMAL(10, 2),
                heartRate INT,
                spo2 DECIMAL(5, 2),
                temperature DECIMAL(5, 2),
                status VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
        const { userId, eGFR, creatinine, heartRate, spo2, temperature, status } = req.body;

        if (!userId || !eGFR) {
            return res.status(400).json({
                success: false,
                message: 'User ID and eGFR are required'
            });
        }

        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                'INSERT INTO test_results (userId, eGFR, creatinine, heartRate, spo2, temperature, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, eGFR, creatinine, heartRate, spo2, temperature, status || 'completed']
            );

            console.log(`✅ Test result added for user ${userId}`);

            res.status(201).json({
                success: true,
                message: 'Test result saved',
                testId: result.insertId
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error saving test result:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving test result',
            error: error.message
        });
    }
});

// GET: Fetch test results for a user
app.get('/api/test-results/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const connection = await pool.getConnection();

        try {
            const [results] = await connection.execute(
                'SELECT * FROM test_results WHERE userId = ? ORDER BY timestamp DESC',
                [userId]
            );

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

// ========================================
// SERVER START
// ========================================

const server = app.listen(PORT, async () => {
    console.log('\n========================================');
    console.log('🚀 SERVER STARTING...');
    console.log('========================================\n');

    // First, create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Wait a moment for database to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Then initialize tables
    await initializeDatabase();

    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log('\n📋 Available API Endpoints:');
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
