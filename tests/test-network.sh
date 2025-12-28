#!/bin/bash
# Network Testing and Verification Script
# This script helps verify that all components are properly configured for WiFi communication

echo "=================================="
echo "Kidney Monitoring System - WiFi Network Verification"
echo "=================================="
echo ""

# Function to test if a server is running on a given IP and port
test_connection() {
    local ip=$1
    local port=$2
    local service=$3
    
    echo -n "Testing $service at $ip:$port... "
    
    if timeout 2 bash -c "echo >/dev/tcp/$ip/$port" 2>/dev/null; then
        echo "✓ OK"
        return 0
    else
        echo "✗ FAILED"
        return 1
    fi
}

# Function to test HTTP endpoint
test_http_endpoint() {
    local url=$1
    local endpoint=$2
    
    echo -n "Testing $endpoint... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url$endpoint" --max-time 2)
    
    if [ "$response" = "200" ]; then
        echo "✓ OK (HTTP $response)"
        return 0
    else
        echo "✗ FAILED (HTTP $response)"
        return 1
    fi
}

# Get server IP from user
read -p "Enter your server IP address (e.g., 192.168.1.100): " SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo "Error: Server IP is required"
    exit 1
fi

echo ""
echo "Verifying network connectivity..."
echo ""

# Test Node.js server
echo "1. Node.js Server (Port 3000)"
test_connection "$SERVER_IP" 3000 "Node.js"
NODE_STATUS=$?
echo ""

# Test Flask API
echo "2. Flask ML API (Port 5000)"
test_connection "$SERVER_IP" 5000 "Flask"
FLASK_STATUS=$?
echo ""

# Test HTTP endpoints
echo "3. HTTP Endpoints"
if [ $NODE_STATUS -eq 0 ]; then
    echo "   a) Main dashboard"
    test_http_endpoint "http://$SERVER_IP:3000" "/"
    
    echo "   b) WiFi setup page"
    test_http_endpoint "http://$SERVER_IP:3000" "/wifi-setup"
    
    echo "   c) Configuration file"
    test_http_endpoint "http://$SERVER_IP:3000" "/config.json"
fi
echo ""

# Test API endpoints
echo "4. API Endpoints"
if [ $NODE_STATUS -eq 0 ]; then
    echo "   a) Sensor data endpoint (should accept POST)"
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"temperature": 37.0, "heartRate": 72}' \
        "http://$SERVER_IP:3000/api/sensor-data" \
        --max-time 2 > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✓ OK"
    else
        echo "   ✗ FAILED"
    fi
fi

if [ $FLASK_STATUS -eq 0 ]; then
    echo "   b) ML prediction endpoint"
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"features": [400, 370, 330, 300, 75, 37.0, 25]}' \
        "http://$SERVER_IP:5000/predict" \
        --max-time 2 > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✓ OK"
    else
        echo "   ✗ FAILED"
    fi
fi
echo ""

# Test WebSocket (using curl)
echo "5. WebSocket Connection"
echo -n "Testing WebSocket... "
# Note: curl doesn't fully support WebSocket, so this is a basic connectivity test
if timeout 2 bash -c "echo >/dev/tcp/$SERVER_IP/3000" 2>/dev/null; then
    echo "✓ Port open (WebSocket should work)"
else
    echo "✗ Port closed"
fi
echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="
echo ""

if [ $NODE_STATUS -eq 0 ] && [ $FLASK_STATUS -eq 0 ]; then
    echo "✓ All services are running and accessible!"
    echo ""
    echo "Access the system at:"
    echo "  - Dashboard: http://$SERVER_IP:3000"
    echo "  - WiFi Setup: http://$SERVER_IP:3000/wifi-setup"
    echo "  - ML API: http://$SERVER_IP:5000"
    echo ""
    echo "Configure your ESP32 with:"
    echo "  SERVER_IP = \"$SERVER_IP\""
    exit 0
else
    echo "✗ Some services are not responding"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Ensure Node.js server is running: node server.js"
    echo "  2. Ensure Flask API is running: python ml_api/app.py"
    echo "  3. Verify firewall is not blocking ports 3000 and 5000"
    echo "  4. Verify you're on the correct WiFi network"
    echo "  5. Check that SERVER_IP is correct"
    exit 1
fi
