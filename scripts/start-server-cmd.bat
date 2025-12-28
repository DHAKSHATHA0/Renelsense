@echo off
REM Smart Kidney Monitoring - Server Startup Script for Windows CMD
REM This script starts the Node.js server with proper error handling

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 Smart Kidney Monitoring - Server Startup           ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    exit /b 1
)

REM Show Node.js version
echo ✓ Node.js version:
node --version
echo.

REM Start the server
echo 🔧 Starting server on http://localhost:3000
echo.

REM Run Node server - will continue running until Ctrl+C
node server.js

REM If we reach here, server stopped
echo.
echo ⛔ Server stopped
pause
