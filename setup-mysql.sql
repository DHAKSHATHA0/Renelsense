-- MySQL Setup Script for Kidney Disorder Application
-- Run this script in MySQL to create database and tables

-- Create Database
CREATE DATABASE IF NOT EXISTS kidney_monitoring;

-- Use the database
USE kidney_monitoring;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
);

-- Create health_alerts table
CREATE TABLE IF NOT EXISTS health_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    alertType VARCHAR(100),
    message TEXT,
    severity VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create medical_tests table
CREATE TABLE IF NOT EXISTS medical_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    testType VARCHAR(100),
    result TEXT,
    normalRange VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Verify tables created
SHOW TABLES;

-- Display table structure
DESCRIBE users;
DESCRIBE test_results;
DESCRIBE health_alerts;
DESCRIBE medical_tests;

SELECT 'Database setup complete! ✅' AS Status;
