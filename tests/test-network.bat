@echo off
REM Network Testing and Verification Script for Windows
REM This script helps verify that all components are properly configured for WiFi communication

setlocal enabledelayedexpansion

echo.
echo ==================================
echo Kidney Monitoring System - WiFi Network Verification
echo ==================================
echo.

REM Get server IP from user
set /p SERVER_IP="Enter your server IP address (e.g. 192.168.1.100): "

if [%SERVER_IP%]==[] (
    echo Error: Server IP is required
    exit /b 1
)

echo.
echo Verifying network connectivity...
echo.

REM Test Node.js server using powershell
echo 1. Node.js Server (Port 3000)
echo Testing connection...
powershell -Command "try { $socket = New-Object System.Net.Sockets.TcpClient('%SERVER_IP%', 3000); $socket.Close(); Write-Host '✓ OK - Server is running' } catch { Write-Host '✗ FAILED - Cannot connect to server on port 3000' }"
echo.

REM Test Flask API using powershell
echo 2. Flask ML API (Port 5000)
echo Testing connection...
powershell -Command "try { $socket = New-Object System.Net.Sockets.TcpClient('%SERVER_IP%', 5000); $socket.Close(); Write-Host '✓ OK - ML API is running' } catch { Write-Host '✗ FAILED - Cannot connect to ML API on port 5000' }"
echo.

REM Test HTTP endpoints using curl
echo 3. HTTP Endpoints
echo.

echo   a) Main dashboard
echo Testing http://%SERVER_IP%:3000...
curl -s -o nul -w "Status: %%{http_code}\n" http://%SERVER_IP%:3000 2>nul
echo.

echo   b) WiFi setup page
echo Testing http://%SERVER_IP%:3000/wifi-setup...
curl -s -o nul -w "Status: %%{http_code}\n" http://%SERVER_IP%:3000/wifi-setup 2>nul
echo.

echo   c) Configuration file
echo Testing http://%SERVER_IP%:3000/config.json...
curl -s http://%SERVER_IP%:3000/config.json 2>nul
echo.
echo.

REM Test API endpoints
echo 4. API Endpoints
echo.

echo   a) Sensor data endpoint
echo Sending test data to http://%SERVER_IP%:3000/api/sensor-data...
powershell -Command "try { Invoke-RestMethod -Uri 'http://%SERVER_IP%:3000/api/sensor-data' -Method POST -ContentType 'application/json' -Body '{\"temperature\": 37.0, \"heartRate\": 72}' -TimeoutSec 2 | ConvertTo-Json; Write-Host '✓ OK' } catch { Write-Host '✗ FAILED' }"
echo.

echo   b) ML prediction endpoint
echo Sending test prediction to http://%SERVER_IP%:5000/predict...
powershell -Command "try { Invoke-RestMethod -Uri 'http://%SERVER_IP%:5000/predict' -Method POST -ContentType 'application/json' -Body '{\"features\": [400, 370, 330, 300, 75, 37.0, 25]}' -TimeoutSec 2 | ConvertTo-Json; Write-Host '✓ OK' } catch { Write-Host '✗ FAILED' }"
echo.
echo.

REM Summary
echo ==================================
echo Summary
echo ==================================
echo.
echo Next Steps:
echo.
echo 1. Access the system at:
echo    - Dashboard: http://%SERVER_IP%:3000
echo    - WiFi Setup: http://%SERVER_IP%:3000/wifi-setup
echo    - ML API: http://%SERVER_IP%:5000
echo.
echo 2. Configure your ESP32 with:
echo    SERVER_IP = "%SERVER_IP%"
echo.
echo 3. Troubleshooting:
echo    - Ensure Node.js server is running: node server.js
echo    - Ensure Flask API is running: python ml_api/app.py
echo    - Verify firewall is not blocking ports 3000 and 5000
echo    - Check that SERVER_IP is correct
echo.
echo ==================================
echo.

pause
