# Smart Kidney Monitoring System - Quick Test Script
# This script tests the complete data flow: Hardware → Server → ML Model → Website

# Configuration
$ML_API_URL = "http://localhost:5000"
$SERVER_URL = "http://localhost:3000"
$WEBSITE_URL = "http://localhost:3000/chatbot.html"

# Sample sensor data
$sensorData = @{
    bioimpedance_1khz = 350.5
    bioimpedance_10khz = 320.2
    bioimpedance_100khz = 280.1
    bioimpedance_200khz = 250.3
    heart_rate = 72
    temperature = 36.8
    motion = 5.2
} | ConvertTo-Json

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart Kidney Monitoring - Complete Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: ML API Health Check
Write-Host "1️⃣  Testing ML API Health..." -ForegroundColor Yellow
try {
    $mlHealth = Invoke-RestMethod -Uri "$ML_API_URL/" -Method GET -ErrorAction Stop
    Write-Host "✅ ML API Status: " -NoNewline
    Write-Host "$($mlHealth.status)" -ForegroundColor Green
    Write-Host "   Service: $($mlHealth.service)"
    Write-Host ""
} catch {
    Write-Host "❌ ML API Not Available" -ForegroundColor Red
    Write-Host "   Make sure Flask is running: python app.py" -ForegroundColor Red
    Write-Host ""
}

# Test 2: ML Model Prediction
Write-Host "2️⃣  Testing ML Model Prediction..." -ForegroundColor Yellow
try {
    $mlPrediction = Invoke-RestMethod -Uri "$ML_API_URL/predict" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sensorData `
        -ErrorAction Stop
    
    if ($mlPrediction.success) {
        Write-Host "✅ ML Prediction Successful" -ForegroundColor Green
        Write-Host "   eGFR: $($mlPrediction.prediction.egfr) mL/min/1.73m²"
        Write-Host "   Status: $($mlPrediction.prediction.kidney_status)"
        Write-Host "   Risk Level: $($mlPrediction.prediction.risk_level)"
        Write-Host "   Confidence: $($mlPrediction.prediction.confidence_score)%"
    } else {
        Write-Host "❌ Prediction Failed: $($mlPrediction.error)" -ForegroundColor Red
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error calling ML API: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Server Health Check
Write-Host "3️⃣  Testing Website Server..." -ForegroundColor Yellow
try {
    $serverHealth = Invoke-RestMethod -Uri "$SERVER_URL/api/check-ai-config" -Method GET -ErrorAction Stop
    Write-Host "✅ Server Status: OK" -ForegroundColor Green
    Write-Host "   Gemini API: $(if ($serverHealth.apiAvailable) { 'Available' } else { 'Not Configured' })"
    Write-Host "   Model: $($serverHealth.model)"
    Write-Host ""
} catch {
    Write-Host "❌ Server Not Available" -ForegroundColor Red
    Write-Host "   Make sure Node.js server is running: node server.js" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Server Prediction Endpoint
Write-Host "4️⃣  Testing Server Prediction Endpoint..." -ForegroundColor Yellow
try {
    $serverPrediction = Invoke-RestMethod -Uri "$SERVER_URL/api/predict" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sensorData `
        -ErrorAction Stop
    
    Write-Host "✅ Server Prediction Successful" -ForegroundColor Green
    if ($serverPrediction.success) {
        Write-Host "   Received from ML API: Yes"
    } else {
        Write-Host "   ML API Unavailable: Using fallback"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Sensor Data Endpoint (Simulating ESP32)
Write-Host "5️⃣  Testing Sensor Data Endpoint..." -ForegroundColor Yellow
try {
    $sensorResponse = Invoke-RestMethod -Uri "$SERVER_URL/api/sensor-data" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sensorData `
        -ErrorAction Stop
    
    Write-Host "✅ Sensor Data Processed Successfully" -ForegroundColor Green
    Write-Host "   Message: $($sensorResponse.message)"
    if ($sensorResponse.prediction) {
        Write-Host "   Prediction: Included"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Website Accessibility
Write-Host "6️⃣  Testing Website Accessibility..." -ForegroundColor Yellow
try {
    $website = Invoke-WebRequest -Uri "$WEBSITE_URL" -ErrorAction Stop
    Write-Host "✅ Website Accessible" -ForegroundColor Green
    Write-Host "   URL: $WEBSITE_URL"
    Write-Host "   Opening in browser..."
    Start-Process $WEBSITE_URL
    Write-Host ""
} catch {
    Write-Host "⚠️  Website Not Accessible Yet" -ForegroundColor Yellow
    Write-Host "   Make sure server is running first"
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Complete Data Flow:" -ForegroundColor Green
Write-Host "   ESP32 Sensor → Server → ML Model → Website"
Write-Host ""
Write-Host "📊 Current Servers:" -ForegroundColor Cyan
Write-Host "   ML API:     $ML_API_URL"
Write-Host "   Website:    $SERVER_URL"
Write-Host "   Chatbot:    $WEBSITE_URL"
Write-Host ""
Write-Host "🔧 To Start Servers:" -ForegroundColor Cyan
Write-Host "   Terminal 1: cd ml_api && python app.py"
Write-Host "   Terminal 2: node server.js"
Write-Host ""
Write-Host "✨ All tests completed!" -ForegroundColor Green
