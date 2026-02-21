@echo off
REM ========================================
REM Smart Kidney Monitoring System Launcher
REM IP Address: 172.31.98.254
REM ========================================

echo.
echo ========================================
echo  Smart Kidney Monitoring System
echo  IP: 172.31.98.254
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Starting ML API (Python Flask)...
echo.
start "ML API - Port 5000" cmd /k "cd ml_api && python app.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Server...
echo.
start "Node.js Server - Port 3000" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [3/3] Opening Website...
echo.
timeout /t 2 /nobreak >nul
start http://172.31.98.254:3000

echo.
echo ========================================
echo  System Started Successfully!
echo ========================================
echo.
echo  Website:     http://172.31.98.254:3000
echo  ML API:      http://172.31.98.254:5000
echo  Live Test:   http://172.31.98.254:3000/live-test.html
echo.
echo  Press any key to stop all services...
echo ========================================
pause >nul

REM Stop all services
taskkill /FI "WindowTitle eq ML API - Port 5000*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Node.js Server - Port 3000*" /T /F >nul 2>&1

echo.
echo All services stopped.
pause

