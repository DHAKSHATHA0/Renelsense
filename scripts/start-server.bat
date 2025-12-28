@echo off
REM Smart Kidney Monitoring System - Startup Script with Auto IP Detection
REM This script automatically detects network IP and starts the server

setlocal enabledelayedexpansion

echo ========================================
echo Smart Kidney Monitoring System
echo Server Startup Script
echo ========================================
echo.

REM Check for environment variable first
if not "!SERVER_IP!"=="" (
    echo Using SERVER_IP from environment: !SERVER_IP!
    set SERVER_IP=!SERVER_IP!
) else (
    REM Try to get network IP using ipconfig
    echo Detecting network IP address...
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
        set FULL_IP=%%a
        set SERVER_IP=!FULL_IP: =!
        goto :found_ip
    )
    :found_ip
    if "!SERVER_IP!"=="" (
        echo No network IP found, using localhost
        set SERVER_IP=localhost
    ) else (
        echo Detected Network IP: !SERVER_IP!
    )
)

REM Get ML API configuration
if "!ML_API_IP!"=="" set ML_API_IP=!SERVER_IP!
if "!ML_API_PORT!"=="" set ML_API_PORT=5000

echo.
echo Configuration:
echo   Website IP:    !SERVER_IP!
echo   Website Port:  3000
echo   ML API IP:     !ML_API_IP!
echo   ML API Port:   !ML_API_PORT!
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
    echo.
)

REM Start the server
echo Starting Node.js Server...
echo.
echo Web Interface: http://!SERVER_IP!:3000
echo WebSocket:     ws://!SERVER_IP!:3000
echo ML API:        http://!ML_API_IP!:!ML_API_PORT!
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
