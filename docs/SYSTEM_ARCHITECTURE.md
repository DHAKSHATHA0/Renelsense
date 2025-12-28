# System Architecture & Quick Reference

## 🏗️ Complete System Architecture

```
                        SMART KIDNEY MONITORING SYSTEM
                              (Complete Flow)

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│  │   HARDWARE   │         │   WEBSITE    │         │   ML MODEL   │       │
│  │   (ESP32)    │────────▶│   (Node.js)  │────────▶│   (Flask)    │       │
│  │              │         │   Server     │         │   Python     │       │
│  │ • Sensors    │ HTTP    │              │ HTTP    │              │       │
│  │ • WiFi       │ POST    │ • Express    │ POST    │ • sklearn    │       │
│  │ • 7 features │ JSON    │ • WebSocket  │ JSON    │ • RandomFor- │       │
│  │              │         │ • CORS       │         │   est Model  │       │
│  └──────────────┘         └──────────────┘         └──────────────┘       │
│         │ reads                    │ broadcasts              │ returns     │
│         │ sensors                  │ updates                 │ prediction  │
│         │ every 1s                 │ real-time               │ confidence  │
│                                    │                         │ risk level  │
│                                    ▼                         │             │
│  ┌─────────────────────────────────────────────────────────┐              │
│  │              WEBSITE FRONTEND (JavaScript)              │              │
│  │                                                         │              │
│  │  • Display eGFR & Kidney Status                        │              │
│  │  • Show Confidence & Risk Level                        │              │
│  │  • AI Chatbot for Health Tips                          │              │
│  │  • Real-time Updates via WebSocket                     │              │
│  │  • Save Results to LocalStorage                        │              │
│  └─────────────────────────────────────────────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
1. ESP32 reads 7 sensor features
2. Sends HTTP POST to /api/sensor-data
3. Server receives and broadcasts to WebSocket clients
4. Server sends to ML API /predict endpoint
5. ML model returns eGFR, kidney status, risk level
6. Server broadcasts prediction results via WebSocket
7. Website updates display in real-time
8. User can chat with AI for personalized health tips
```

## 🚀 Quick Start Commands

### Terminal 1: Start ML API (Python/Flask)
```powershell
cd ml_api
pip install -r requirements.txt  # Only first time
python app.py
```
✅ ML API runs on: `http://localhost:5000`

### Terminal 2: Start Website Server (Node.js/Express)
```powershell
npm install  # Only first time
node server.js
```
✅ Website runs on: `http://localhost:3000`

### Terminal 3: Test Complete Flow
```powershell
# Run PowerShell script to test all endpoints
.\test-complete-flow.ps1
```

## 📊 Data Flow Endpoints

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/api/sensor-data` | POST | Receive ESP32 sensor data | 7 features | Success + Prediction |
| `/api/predict` | POST | Manual ML prediction | 7 features | eGFR + Status + Risk |
| `/api/chatbot` | POST | AI health tips | Message + Results | AI Response |
| `/api/check-ai-config` | GET | Check API availability | None | Config Status |
| `/api/start-test` | POST | Start test session | None | Success |
| `/api/stop-test` | POST | Stop test session | None | Success |

## 🔌 Required Sensor Features

The ML model expects exactly **7 features** from ESP32:

1. **bioimpedance_1khz** (float) - Bioimpedance at 1 kHz (300-400 Ohms)
2. **bioimpedance_10khz** (float) - Bioimpedance at 10 kHz (270-370 Ohms)
3. **bioimpedance_100khz** (float) - Bioimpedance at 100 kHz (230-330 Ohms)
4. **bioimpedance_200khz** (float) - Bioimpedance at 200 kHz (200-300 Ohms)
5. **heart_rate** (int) - Heart rate in BPM (50-150)
6. **temperature** (float) - Body temperature in Celsius (35-40°C)
7. **motion** (float) - Motion/activity in mg (0-50)

### Example Request:
```json
{
  "bioimpedance_1khz": 350.5,
  "bioimpedance_10khz": 320.2,
  "bioimpedance_100khz": 280.1,
  "bioimpedance_200khz": 250.3,
  "heart_rate": 72,
  "temperature": 36.8,
  "motion": 5.2
}
```

## 📈 ML Model Output

The ML model returns:

```json
{
  "success": true,
  "prediction": {
    "egfr": 78.5,                          // Estimated GFR value
    "kidney_status": "Normal",             // Status based on eGFR
    "confidence_score": 92.5,              // Prediction confidence 0-100%
    "risk_level": "Low"                    // Risk: Low/Medium/High/Very High
  },
  "recommendations": {
    "primary": "Maintain healthy lifestyle",
    "secondary": ["Regular check-ups", "Exercise"],
    "next_test_schedule": "Annual"
  }
}
```

## 🔄 Kidney Status Mapping

| eGFR Range | Status | Risk Level | Recommendation |
|-----------|--------|-----------|-----------------|
| ≥ 90 | Normal | Low | Annual check-ups |
| 60-89 | Mildly Reduced | Low | 6-12 month monitoring |
| 45-59 | Mild-Moderate Reduced | Medium | 3-4 month monitoring |
| 30-44 | Moderate-Severe Reduced | High | Monthly monitoring |
| 15-29 | Severe Reduced | High | Frequent monitoring |
| < 15 | Kidney Failure | Very High | Immediate intervention |

## 🧪 Testing Endpoints

### Test 1: ML API Directly
```powershell
$data = @{
    bioimpedance_1khz = 350.5
    bioimpedance_10khz = 320.2
    bioimpedance_100khz = 280.1
    bioimpedance_200khz = 250.3
    heart_rate = 72
    temperature = 36.8
    motion = 5.2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/predict" `
    -Method POST `
    -ContentType "application/json" `
    -Body $data
```

### Test 2: Server Prediction
```powershell
# Same as above but use localhost:3000/api/predict
```

### Test 3: Simulate ESP32 (Sensor Data)
```powershell
# Same request but use localhost:3000/api/sensor-data
# Server will automatically call ML model and broadcast results
```

## 🌐 Access Website

After both servers are running:

1. **Main Page**: http://localhost:3000
2. **Chatbot**: http://localhost:3000/chatbot.html
3. **WiFi Setup**: http://localhost:3000/wifi-setup

## 📝 Configuration Files

### public/config.json
```json
{
  "serverIP": "172.31.98.113",      // Your computer's IP
  "serverPort": "3000",              // Website server port
  "mlApiIP": "172.31.98.113",        // ML API server IP
  "mlApiPort": 5000,                 // ML API port
  "timestamp": "2025-12-27T09:32:24.661Z"
}
```

### .env (Optional)
```env
PORT=3000
GOOGLE_AI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-pro
ML_API_IP=127.0.0.1
ML_API_PORT=5000
```

## 🔗 WebSocket Events

### From Server to Client:
- `sensor_update` - New sensor data received
- `prediction_result` - ML prediction completed
- `test_started` - Test session started
- `test_stopped` - Test session ended

### Real-time Broadcast Example:
```javascript
// Browser automatically receives:
{
  type: "prediction_result",
  payload: {
    success: true,
    prediction: {
      egfr: 78.5,
      kidney_status: "Normal",
      confidence_score: 92.5,
      risk_level: "Low"
    }
  }
}
```

## 🐛 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| ML API won't start | `pip install -r requirements.txt` |
| Node server crashes | Check port 3000 is free, `netstat -ano` |
| WebSocket error | Check firewall allows WebSocket on port 3000 |
| Sensor data not received | Verify ESP32 WiFi is connected |
| No predictions showing | Check ML API is running on port 5000 |
| CORS errors | Enable cors in server.js (already done) |

## 📚 File Reference

| File | Purpose |
|------|---------|
| `server.js` | Main Node.js server with all endpoints |
| `ml_api/app.py` | ML model server and prediction logic |
| `public/js/chatbot.js` | Frontend logic and WebSocket handling |
| `public/chatbot.html` | Chatbot UI |
| `ESP32_WiFi_Sketch.ino` | Hardware firmware for data collection |
| `DATA_FLOW_GUIDE.md` | Detailed data flow documentation |
| `INTEGRATION_TESTING_GUIDE.md` | Complete testing guide |
| `test-complete-flow.ps1` | Automated test script |

## ✨ System Status

- **Website Server**: Ready on http://localhost:3000
- **ML API Server**: Ready on http://localhost:5000
- **WebSocket Connection**: Automatic (ws://localhost:3000)
- **Data Flow**: Hardware → Server → ML → Website
- **Real-time Updates**: Enabled via WebSocket
- **AI Chatbot**: Integrated with Gemini API (optional)

## 🎯 Next Steps

1. ✅ Start both servers
2. ✅ Run test-complete-flow.ps1 to verify all endpoints
3. ✅ Configure and upload ESP32 code
4. ✅ Open website and verify real-time updates
5. ✅ Test complete end-to-end flow
6. ✅ Customize ML model for better predictions (optional)

---

**Version**: 1.0  
**Last Updated**: December 27, 2025  
**Status**: ✅ Ready for Production Testing
