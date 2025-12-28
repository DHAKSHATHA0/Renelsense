# Smart Kidney Monitoring System - Startup Script with IP Auto-Detection
# This script automatically detects network IP and starts the server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart Kidney Monitoring System" -ForegroundColor Cyan
Write-Host "Server Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get server IP address
$ipAddress = $null

# Check for environment variable first
if ($env:SERVER_IP) {
    $ipAddress = $env:SERVER_IP
    Write-Host "Using SERVER_IP from environment: $ipAddress" -ForegroundColor Green
} else {
    # Find network IP address (non-loopback IPv4)
    $interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -ne "::1" -and -not $_.IPAddress.StartsWith("169.254")
    }
    
    if ($interfaces) {
        $ipAddress = $interfaces[0].IPAddress
        Write-Host "Detected Network IP: $ipAddress" -ForegroundColor Green
    } else {
        $ipAddress = "localhost"
        Write-Host "No network IP found, using localhost" -ForegroundColor Yellow
    }
}

# Get ML API configuration
$mlApiIP = if ($env:ML_API_IP) { $env:ML_API_IP } else { $ipAddress }
$mlApiPort = if ($env:ML_API_PORT) { $env:ML_API_PORT } else { 5000 }

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Website IP:    $ipAddress" -ForegroundColor Yellow
Write-Host "  Website Port:  3000" -ForegroundColor Yellow
Write-Host "  ML API IP:     $mlApiIP" -ForegroundColor Yellow
Write-Host "  ML API Port:   $mlApiPort" -ForegroundColor Yellow
Write-Host ""

# Set environment variables
$env:SERVER_IP = $ipAddress
$env:ML_API_IP = $mlApiIP
$env:ML_API_PORT = $mlApiPort

# Verify dependencies
Write-Host "Checking npm dependencies..." -ForegroundColor Yellow
if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the server
Write-Host "Starting Node.js Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Web Interface: http://$ipAddress`:3000" -ForegroundColor Cyan
Write-Host "WebSocket:     ws://$ipAddress`:3000" -ForegroundColor Cyan
Write-Host "ML API:        http://$mlApiIP`:$mlApiPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
