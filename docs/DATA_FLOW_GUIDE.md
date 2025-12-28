# Smart Kidney Monitoring System - Complete Data Flow Guide

## System Architecture Overview

The system consists of 4 main components that work together:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   ESP32     │─────▶│   Website    │─────▶│  ML Model   │─────▶│   Website   │
│  Hardware   │      │   Server     │      │   (Flask)   │      │  (Display)  │
│  (Sensors)  │      │  (Node.js)   │      │  (Python)   │      │             │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
      ▲                                                                  ▲
      │                   bidirectional WebSocket                       │
      │              for real-time updates                              │
      └──────────────────────────────────────────────────────────────┘
```

## Step-by-Step Data Flow

### 1. **Hardware (ESP32) Sends Data**
- Location: `ESP32_WiFi_Sketch.ino`
- **What happens:**
  - ESP32 reads sensor data (bioimpedance, heart rate, temperature, etc.)
  - Collects 7 features for ML prediction
  - Sends JSON POST request to website server
  
- **Endpoint:** `POST http://[SERVER_IP]:3000/api/sensor-data`
- **Data Format:**
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

### 2. **Website Server Receives Data (Node.js)**
- Location: `server.js` - `/api/sensor-data` endpoint
- **What happens:**
  - Server receives sensor data from ESP32
  - Validates the data
  - Broadcasts to all connected WebSocket clients (real-time update)
  - **NEW:** Automatically sends data to ML model for prediction

- **Processing:**
```javascript
app.post('/api/sensor-data', async (req, res) => {
    const sensorData = req.body;
    
    // 1. Validate data
    // 2. Store data (optional)
    // 3. Broadcast to WebSocket clients
    // 4. Send to ML model for prediction
    // 5. Broadcast prediction results back to website
});
```

### 3. **ML Model Processes Data (Flask/Python)**
- Location: `ml_api/app.py` - `/predict` endpoint
- **What happens:**
  - Receives the 7 sensor features
  - Uses trained Random Forest model to predict eGFR
  - Calculates kidney status (Normal/Mild/Moderate/Severe/Critical)
  - Determines risk level (Low/Medium/High/Very High)
  - Calculates confidence score
  - Returns comprehensive results

- **Input:** 7 sensor features
- **Output:**
```json
{
  "success": true,
  "prediction": {
    "egfr": 78.5,
    "kidney_status": "Normal",
    "confidence_score": 92.5,
    "risk_level": "Low"
  },
  "recommendations": {
    "primary": "...",
    "secondary": ["..."],
    "next_test_schedule": "..."
  }
}
```

### 4. **Website Displays Results (Frontend JavaScript)**
- Location: `public/js/chatbot.js` and `public/chatbot.html`
- **What happens:**
  - Receives prediction results from server
  - Updates patient info display in real-time
  - Displays eGFR, kidney status, risk level, confidence
  - Saves results to sessionStorage/localStorage
  - User can chat with AI for personalized health tips based on results
  - Results appear in a nice visual format

## Configuration Files

### `public/config.json`
Contains server and ML API endpoints:
```json
{
  "serverIP": "172.31.98.113",      // Your website server IP
  "serverPort": "3000",              // Website server port
  "mlApiIP": "172.31.98.113",        // ML model server IP
  "mlApiPort": 5000,                 // ML model server port
  "timestamp": "2025-12-27T09:32:24.661Z"
}
```

## Starting the System

### 1. Start the ML API (Flask - Python)
```bash
cd ml_api
pip install -r requirements.txt
python app.py
# Server runs on http://localhost:5000
```

### 2. Start the Website Server (Node.js)
```bash
# From the root directory
npm install
node server.js
# Server runs on http://localhost:3000
```

### 3. Upload Code to ESP32
- Open `ESP32_WiFi_Sketch.ino` in Arduino IDE
- Update WiFi SSID and Password
- Update SERVER_IP to your computer's IP address
- Upload to ESP32

### 4. Access the Website
- Open browser and go to: `http://localhost:3000`
- Navigate to WiFi setup page to configure ESP32
- Or go directly to chatbot: `http://localhost:3000/chatbot.html`

## Real-Time Updates with WebSocket

The website uses WebSocket for real-time updates:

**Connection Flow:**
1. Browser connects to WebSocket server (auto-connected in server.js)
2. When ESP32 sends sensor data, server broadcasts to all clients
3. Clients receive updates without page refresh
4. Patient info updates automatically

**WebSocket Events:**
- `sensor_update` - New sensor data received
- `prediction_result` - ML model prediction complete
- `test_started` - New test session started
- `test_stopped` - Test session ended

## Testing the Flow

### Manual Test with cURL

**1. Test Server Connectivity:**
```bash
curl http://localhost:3000/api/check-ai-config
```

**2. Send Test Sensor Data:**
```bash
curl -X POST http://localhost:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "bioimpedance_1khz": 350.5,
    "bioimpedance_10khz": 320.2,
    "bioimpedance_100khz": 280.1,
    "bioimpedance_200khz": 250.3,
    "heart_rate": 72,
    "temperature": 36.8,
    "motion": 5.2
  }'
```

**3. Test ML Model Directly:**
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "bioimpedance_1khz": 350.5,
    "bioimpedance_10khz": 320.2,
    "bioimpedance_100khz": 280.1,
    "bioimpedance_200khz": 250.3,
    "heart_rate": 72,
    "temperature": 36.8,
    "motion": 5.2
  }'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ESP32 can't connect to server | Check firewall, verify server IP is correct |
| ML model error | Make sure Flask is running on port 5000 |
| No real-time updates | Check WebSocket connection in browser console |
| Sensor data not received | Verify sensor data format matches required fields |
| ML predictions not showing | Check CORS settings in Flask app |

## Key Files and Their Roles

| File | Purpose |
|------|---------|
| `server.js` | Main Node.js server, handles HTTP and WebSocket |
| `public/js/chatbot.js` | Frontend logic for displaying results |
| `ml_api/app.py` | ML model prediction API |
| `ESP32_WiFi_Sketch.ino` | Hardware firmware to send sensor data |
| `public/config.json` | Configuration for server and ML API endpoints |

## Next Steps

1. ✅ Configure ESP32 with correct WiFi and server IP
2. ✅ Start ML API server (Flask)
3. ✅ Start website server (Node.js)
4. ✅ Test sensor data flow with cURL
5. ✅ Open website and verify real-time updates
6. ✅ Chat with AI to get personalized health tips

---

**System Status:**
- Website Server: http://localhost:3000
- ML API: http://localhost:5000
- Last Updated: December 27, 2025
