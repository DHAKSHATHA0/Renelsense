@echo off
echo Starting Smart Kidney Function Monitoring System...
echo.

cd /d "c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"

echo Checking if server is already running...
echo.

node server.js

echo.
echo If you see an "address in use" error above, the server is already running.
echo.
echo Visit http://localhost:3000 in your browser to view the website.
echo.
echo Press any key to close this window...
pause >nul