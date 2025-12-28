# ⚡ Quick Commands Reference

## 🚀 Start Everything (3 Terminals)

### Terminal 1: Start ML API
```powershell
cd ml_api
python app.py
```
**Expected:** `Running on http://127.0.0.1:5000`

### Terminal 2: Start Website Server
```powershell
node server.js
```
**Expected:** `Server running on http://localhost:3000`

### Terminal 3: Test & Monitor
```powershell
# Run automated tests
.\test-complete-flow.ps1

# Or run specific tests:

# Test 1: ML API only
curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d '{"bioimpedance_1khz":350.5,"bioimpedance_10khz":320.2,"bioimpedance_100khz":280.1,"bioimpedance_200khz":250.3,"heart_rate":72,"temperature":36.8,"motion":5.2}'

# Test 2: Server prediction
curl -X POST http://localhost:3000/api/predict -H "Content-Type: application/json" -d '{"bioimpedance_1khz":350.5,"bioimpedance_10khz":320.2,"bioimpedance_100khz":280.1,"bioimpedance_200khz":250.3,"heart_rate":72,"temperature":36.8,"motion":5.2}'

# Test 3: Simulate ESP32 sensor data
curl -X POST http://localhost:3000/api/sensor-data -H "Content-Type: application/json" -d '{"bioimpedance_1khz":350.5,"bioimpedance_10khz":320.2,"bioimpedance_100khz":280.1,"bioimpedance_200khz":250.3,"heart_rate":72,"temperature":36.8,"motion":5.2}'

# Test 4: Check AI config
curl http://localhost:3000/api/check-ai-config
```

---

## 🌐 Access Websites

```
Website Home:     http://localhost:3000
Chatbot:          http://localhost:3000/chatbot.html
WiFi Setup:       http://localhost:3000/wifi-setup
Result Display:   http://localhost:3000/result.html
```

---

## 🧪 Test Scenarios

### Scenario 1: Test ML Model Only
```powershell
# Start ML API only
cd ml_api
python app.py

# Then test from any terminal
curl -X POST http://localhost:5000/predict `
  -H "Content-Type: application/json" `
  -d '{
    "bioimpedance_1khz": 350.5,
    "bioimpedance_10khz": 320.2,
    "bioimpedance_100khz": 280.1,
    "bioimpedance_200khz": 250.3,
    "heart_rate": 72,
    "temperature": 36.8,
    "motion": 5.2
  }' | ConvertFrom-Json | ConvertTo-Json
```

### Scenario 2: Full End-to-End Test
```powershell
# Terminal 1
cd ml_api
python app.py

# Terminal 2
node server.js

# Terminal 3
.\test-complete-flow.ps1
```

### Scenario 3: Manual Sensor Data Test
```powershell
# Send different sensor values to test ML model behavior
$data = @{
    bioimpedance_1khz = 360     # Slightly higher - may indicate lower kidney function
    bioimpedance_10khz = 330
    bioimpedance_100khz = 290
    bioimpedance_200khz = 260
    heart_rate = 85
    temperature = 37.1
    motion = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/sensor-data" `
    -Method POST -ContentType "application/json" -Body $data | ConvertTo-Json
```

---

## 📊 Monitor System

### Check ML API Health
```powershell
curl http://localhost:5000/
```

### Check Website Server Health
```powershell
curl http://localhost:3000/api/check-ai-config | ConvertFrom-Json | ConvertTo-Json
```

### Watch Server Logs
```powershell
# Terminal with server.js running shows all logs
# Look for:
# ✅ Successful sensor data processing
# 🤖 ML model predictions
# 📡 WebSocket broadcasts
# ⚠️ Any errors
```

---

## 🛠️ Troubleshooting Quick Commands

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID 12345 /F
```

### Python Virtual Environment
```powershell
# Create venv
python -m venv venv

# Activate
venv\Scripts\activate

# Deactivate
deactivate

# Install requirements
pip install -r requirements.txt
```

### Node Process Management
```powershell
# Find Node process
Get-Process node

# Kill all Node processes
Stop-Process -ProcessName node -Force

# Run server in background
Start-Process -WindowStyle Hidden node server.js
```

---

## 📋 Checklist Before Running

- [ ] Python 3.8+ installed: `python --version`
- [ ] Node.js 14+ installed: `node --version`
- [ ] pip installed: `pip --version`
- [ ] npm installed: `npm --version`
- [ ] Flask installed: `pip list | findstr Flask`
- [ ] Express installed: `npm list express`
- [ ] ml_api/requirements.txt exists
- [ ] package.json exists
- [ ] public/js/chatbot.js updated with WebSocket
- [ ] server.js has ML integration

---

## 🎯 Quick Test Data

### Normal Kidney Function (eGFR ~ 90+)
```powershell
$normalData = @{
    bioimpedance_1khz = 350
    bioimpedance_10khz = 320
    bioimpedance_100khz = 280
    bioimpedance_200khz = 250
    heart_rate = 70
    temperature = 36.8
    motion = 5
} | ConvertTo-Json
```

### Mildly Reduced (eGFR ~ 60-89)
```powershell
$mildData = @{
    bioimpedance_1khz = 360
    bioimpedance_10khz = 330
    bioimpedance_100khz = 290
    bioimpedance_200khz = 260
    heart_rate = 75
    temperature = 36.9
    motion = 8
} | ConvertTo-Json
```

### Moderately Reduced (eGFR ~ 45-59)
```powershell
$moderateData = @{
    bioimpedance_1khz = 370
    bioimpedance_10khz = 340
    bioimpedance_100khz = 300
    bioimpedance_200khz = 270
    heart_rate = 80
    temperature = 37.0
    motion = 12
} | ConvertTo-Json
```

### Severe Reduction (eGFR ~ 15-29)
```powershell
$severeData = @{
    bioimpedance_1khz = 390
    bioimpedance_10khz = 360
    bioimpedance_100khz = 320
    bioimpedance_200khz = 290
    heart_rate = 95
    temperature = 37.2
    motion = 20
} | ConvertTo-Json
```

---

## 🔄 Data Flow One-Liner

```powershell
# Send sensor data and see complete flow
curl -X POST http://localhost:3000/api/sensor-data -H "Content-Type: application/json" -d '{"bioimpedance_1khz":350.5,"bioimpedance_10khz":320.2,"bioimpedance_100khz":280.1,"bioimpedance_200khz":250.3,"heart_rate":72,"temperature":36.8,"motion":5.2}' -w "`nHTTP Status: %{http_code}`n" | ConvertFrom-Json | ConvertTo-Json
```

---

## 🌍 Browser Testing

### Open ChatBot
```powershell
Start-Process "http://localhost:3000/chatbot.html"
```

### Open Browser DevTools (F12 in browser)
```
Console tab:
- Watch for WebSocket messages
- Check for any JavaScript errors
- Look for logs from chatbot.js

Network tab:
- Watch HTTP requests/responses
- Monitor WebSocket connection
- See message payload
```

---

## 💾 Save Test Results

```powershell
# Run test and save output to file
.\test-complete-flow.ps1 | Out-File "test-results-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').txt"
```

---

## 📱 ESP32 Configuration Quick Reference

### In ESP32_WiFi_Sketch.ino:

**Find your IP:**
```powershell
ipconfig
# Look for: IPv4 Address: 192.168.x.x or 172.x.x.x
```

**Update these lines:**
```cpp
const char* WIFI_SSID = "YOUR_NETWORK_NAME";
const char* WIFI_PASSWORD = "YOUR_NETWORK_PASSWORD";
const char* SERVER_IP = "192.168.1.100";  // Your IP from ipconfig
```

---

## 🎬 Sample Session

```powershell
# Session 1: Initial Setup
cd ml_api
python app.py

# Session 2: (New PowerShell)
npm install  # Only once
node server.js

# Session 3: (Another PowerShell)
# Wait 5 seconds for servers to fully start
Start-Sleep -Seconds 5

# Run tests
.\test-complete-flow.ps1

# Open website
Start-Process "http://localhost:3000/chatbot.html"
```

---

## 📞 Support Commands

### Check Python/ML
```powershell
# Check Python
python --version
pip list | findstr "Flask numpy scikit-learn"

# Test ML directly
python -c "import flask; print(flask.__version__)"
```

### Check Node.js/Server
```powershell
# Check Node
node --version
npm list | findstr "express cors ws"

# Test server syntax
node -c server.js
```

### System Information
```powershell
# Show system info
systeminfo

# Show network info
ipconfig /all

# Show available ports
netstat -ano | Select-Object -First 20
```

---

**Version**: Quick Reference v1.0  
**Last Updated**: December 27, 2025  
**Status**: Ready to Use ✨
