-- Create the database
CREATE DATABASE kidney_monitoring;

-- Use the database
USE kidney_monitoring;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    age INT,
    gender VARCHAR(10),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create test_results table
CREATE TABLE test_results (
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
);

-- Verify tables created
SHOW TABLES;