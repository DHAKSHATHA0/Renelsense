# Smart Kidney Monitoring System - WiFi Network Setup Guide

## Overview

This guide will help you set up the kidney monitoring system to run across a WiFi network where the ESP32 hardware, Node.js server, Flask ML API, and web dashboard all communicate seamlessly.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WiFi Network (same SSID)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌────────────────┐        ┌──────────────┐                │
│   │    ESP32       │        │  Web Browser │                │
│   │  (Hardware)    │        │   (Client)   │                │
│   │                │        │              │                │
│   │ • Sensors      │        │ • Dashboard  │                │
│   │ • WiFi Client  │        │ • WiFi Setup │                │
│   └────────┬───────┘        └────────┬─────┘                │
│            │                         │                       │
│            │  POST /api/              │                      │
│            │  sensor-data             │ WebSocket /         │
│            │                          │ REST API            │
│            │                          │                      │
│            └──────────┬───────────────┘                      │
│                       │                                       │
│                 ┌─────▼──────┐                               │
│                 │  Node.js    │                              │
│                 │  Server     │                              │
│                 │ (Port 3000) │                              │
│                 │             │                              │
│                 │ • Routes    │                              │
│                 │ • WebSocket │                              │
│                 │ • Config    │                              │
│                 └─────┬───────┘                              │
│                       │                                       │
│                       │ POST /predict                        │
│                       │                                       │
│                       ▼                                       │
│                 ┌──────────────┐                             │
│                 │ Flask API    │                             │
│                 │ (Port 5000)  │                             │
│                 │              │                             │
│                 │ • ML Model   │                             │
│                 │ • Prediction │                             │
│                 └──────────────┘                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start (5 minutes)

### Step 1: Get Your Server IP Address

1. **Start the Node.js server:**
   ```bash
   cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"
   node server.js
   ```

2. **Look for output like this:**
   ```
   ========================================
   Server running on http://192.168.1.XXX:3000
   WebSocket server running on ws://192.168.1.XXX:3000
   Local: http://localhost:3000
   ========================================
   ```

3. **Note your server IP** (e.g., `192.168.1.100`)

### Step 2: Verify Configuration

1. **From another device on your WiFi:**
   - Open a browser
   - Go to: `http://192.168.1.XXX:3000/wifi-setup` (replace XXX with your server IP)
   - You'll see all your configuration details displayed

### Step 3: Configure ESP32

1. **Open the ESP32 Arduino sketch:**
   - File: `ESP32_WiFi_Sketch.ino`

2. **Update these three lines:**
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";            // Your WiFi network name
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // Your WiFi password
   const char* SERVER_IP = "192.168.1.XXX";             // Your server IP from Step 1
   ```

3. **Upload to your ESP32**

4. **Open Serial Monitor (115200 baud)** to see connection status

---

## Detailed Setup Instructions

### Prerequisites

- [ ] Node.js installed on your server machine
- [ ] Python 3.8+ with Flask installed on your ML API machine
- [ ] ESP32 development board with Arduino IDE
- [ ] All devices on the same WiFi network
- [ ] Server machine has a static or reserved IP address (recommended)

### Server Setup (Node.js)

#### 1. Verify Server Configuration

Check that `server.js` has the correct listen configuration:

```javascript
server.listen(PORT, '0.0.0.0', () => {
    // This listens on all network interfaces, not just localhost
});
```

#### 2. Start the Server

```powershell
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"
npm install  # If you haven't already
node server.js
```

#### 3. Verify Console Output

You should see:
```
========================================
Server running on http://192.168.x.x:3000
WebSocket server running on ws://192.168.x.x:3000
Local: http://localhost:3000
========================================
```

**The IP address shown is your server IP.**

#### 4. Verify config.json

A file `public/config.json` should be created automatically:

```json
{
  "serverIP": "192.168.x.x",
  "serverPort": 3000,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Client Setup (Web Browser)

#### 1. Access from Same Computer

- Open browser
- Go to: `http://localhost:3000`
- Dashboard should load normally

#### 2. Access from Another Device on WiFi

- Open browser on laptop, tablet, or phone
- Go to: `http://192.168.x.x:3000` (use your server IP)
- Dashboard should load with all features working

#### 3. Access WiFi Setup Page

- Go to: `http://192.168.x.x:3000/wifi-setup`
- See auto-detected server configuration
- Copy server IP for ESP32 configuration

### Hardware Setup (ESP32)

#### 1. Install Arduino IDE

- Download from: https://www.arduino.cc/en/software
- Install ESP32 board support (Tools → Board Manager → search "esp32")

#### 2. Install Required Libraries

In Arduino IDE, go to Tools → Manage Libraries and install:
- ArduinoJson (by Benoit Blanchon)

#### 3. Configure the Sketch

Open `ESP32_WiFi_Sketch.ino` and update:

```cpp
// Line 30-31: WiFi credentials
const char* WIFI_SSID = "MyNetworkName";        // Your WiFi SSID
const char* WIFI_PASSWORD = "MyPassword";      // Your WiFi password

// Line 34: Server IP (from Step 2 of Quick Start)
const char* SERVER_IP = "192.168.1.100";       // Your server IP
```

#### 4. Upload to ESP32

1. Connect ESP32 to computer via USB
2. Select: Tools → Board → ESP32 Dev Module
3. Select: Tools → Port → COM3 (or your USB port)
4. Click: Upload
5. Open: Tools → Serial Monitor (115200 baud)

#### 5. Verify Connection

Serial Monitor should show:

```
Configuration:
  WiFi SSID: MyNetworkName
  Server IP: 192.168.1.100
  Server Port: 3000
  API URL: http://192.168.1.100:3000/api/sensor-data

Connecting to WiFi: MyNetworkName
...........
WiFi connected successfully!
IP Address: 192.168.1.101
Signal Strength: -45 dBm

[1] Data sent successfully. HR: 72 BPM, Temp: 36.8°C
[2] Data sent successfully. HR: 75 BPM, Temp: 36.8°C
[3] Data sent successfully. HR: 71 BPM, Temp: 36.7°C
```

### Flask ML API Setup

#### 1. Configure Flask to Listen on Network

Edit `ml_api/app.py`:

```python
if __name__ == '__main__':
    # This makes Flask listen on all network interfaces
    app.run(host='0.0.0.0', port=5000, debug=False)
```

#### 2. Start Flask

```powershell
cd "C:\Users\...\kidneydisorder\ml_api"
python app.py
```

#### 3. Verify Configuration

Console should show:
```
 * Running on http://0.0.0.0:5000
```

#### 4. Test from Another Device

```bash
curl http://192.168.x.x:5000/api/predict -X POST -H "Content-Type: application/json" -d '{"data": [...]}'
```

---

## Accessing the System

### From the Server Machine

- **Dashboard:** http://localhost:3000
- **WiFi Setup:** http://localhost:3000/wifi-setup
- **ML API:** http://localhost:5000

### From Another Device on the Same WiFi

- **Dashboard:** http://192.168.x.x:3000
- **WiFi Setup:** http://192.168.x.x:3000/wifi-setup
- **ML API:** http://192.168.x.x:5000

### Mobile Phone/Tablet on Same WiFi

- Same as above: http://192.168.x.x:3000
- All features work identically
- Can monitor live data from anywhere on the network

---

## Troubleshooting

### Problem: "WiFi connection failed" on ESP32

**Check:**
1. WIFI_SSID is spelled correctly (case-sensitive)
2. WIFI_PASSWORD is correct
3. WiFi router is turned on
4. You're in WiFi range

**Fix:**
```cpp
// Add more detailed debugging
Serial.println("Available Networks:");
int networks = WiFi.scanNetworks();
for(int i = 0; i < networks; i++){
    Serial.println(WiFi.SSID(i));
}
```

### Problem: "Connection refused" when ESP32 sends data

**Check:**
1. Server IP is correct (verify in `public/config.json`)
2. Node.js server is running
3. Firewall is not blocking port 3000

**Fix (Windows Firewall):**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js to allowed apps
4. Ensure both Private and Public are checked

**Fix (Other Firewalls):**
- Allow inbound connections on port 3000
- Disable device isolation in WiFi router settings

### Problem: "Cannot GET /api/sensor-data" error

**Check:**
1. You're using POST, not GET
2. The server is actually running
3. No typos in the URL

**Test with curl:**
```bash
curl -X POST http://192.168.x.x:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"temperature": 37.0, "heartRate": 72}'
```

### Problem: Dashboard shows "Connecting..." but no data appears

**Check:**
1. Browser console for errors (F12 → Console)
2. Server IP in `public/config.json` is correct
3. WebSocket connection: Look for "ws://..." messages in console
4. Check if ESP32 is actually sending data (Serial Monitor)

**Verify WebSocket:**
```javascript
// Open browser console (F12) and paste:
const ws = new WebSocket('ws://192.168.x.x:3000');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Received:', e.data);
```

### Problem: ML API not accessible from other devices

**Check:**
1. Flask is running with `host='0.0.0.0'`
2. No firewall blocking port 5000
3. Correct server IP in requests

**Test:**
```bash
# From another device on the network:
curl http://192.168.x.x:5000/
```

### Problem: "IP Address mismatch" between devices

**Solution:**
1. Server should have a static IP or reserved DHCP
2. Restart router if IP changes
3. Update config.json by restarting Node.js server
4. Always use `192.168.x.x:3000` format (not localhost)

---

## Network Architecture Details

### IP Address Types

```
Localhost Address:    127.0.0.1:3000 or localhost:3000
├─ Only works on server machine
├─ Cannot be accessed from other devices
└─ Used for local testing

Network Address:      192.168.x.x:3000
├─ Works from any device on WiFi
├─ Requires server listening on 0.0.0.0
└─ Used for multi-device communication
```

### DNS Names (Optional Advanced)

If you want friendly names instead of IP addresses:

```
Instead of:   http://192.168.1.100:3000
Use:          http://kidney-monitor.local:3000

Setup:
1. Use mDNS library for Node.js (zeroconf/bonjour)
2. Configure on router (local DNS)
3. Add to system hosts file
```

### Port Configuration

| Service | Port | Host | Purpose |
|---------|------|------|---------|
| Node.js Server | 3000 | 0.0.0.0 | Web dashboard, WebSocket, API |
| Flask ML API | 5000 | 0.0.0.0 | Machine learning predictions |
| ESP32 WiFi | Variable | 192.168.x.x | Hardware sensor readings |

---

## Security Considerations

### For Development/Testing (Current Setup)
✅ Works fine on private home/office WiFi
✅ Open to all devices on the same network
⚠️ No encryption or authentication

### For Hospital/Production Deployment

Before deploying to a hospital or production environment:

1. **Enable HTTPS**
   ```javascript
   // Use https module instead of http
   const https = require('https');
   const fs = require('fs');
   const options = {
       key: fs.readFileSync('private-key.pem'),
       cert: fs.readFileSync('certificate.pem')
   };
   https.createServer(options, app).listen(3000);
   ```

2. **Add Authentication**
   ```javascript
   // Use JWT tokens or API keys
   app.use((req, res, next) => {
       const token = req.headers.authorization;
       if (!validateToken(token)) {
           return res.status(401).json({error: 'Unauthorized'});
       }
       next();
   });
   ```

3. **Use WSS (WebSocket over HTTPS)**
   ```javascript
   const wss = new WebSocket.Server({ 
       server: httpsServer,
       perMessageDeflate: false
   });
   ```

4. **Implement Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use(limiter);
   ```

5. **Add Input Validation**
   ```javascript
   app.post('/api/sensor-data', (req, res) => {
       // Validate all incoming data
       const {temperature, heartRate, ...} = req.body;
       if (isNaN(temperature) || temperature < 0) {
           return res.status(400).json({error: 'Invalid data'});
       }
       // Process...
   });
   ```

---

## Performance Tips

### Optimize for Multiple Devices

1. **Reduce Data Send Frequency**
   ```cpp
   // ESP32: Send every 2-5 seconds instead of every second
   const unsigned long SEND_INTERVAL = 2000; // 2 seconds
   ```

2. **Compress WebSocket Messages**
   ```javascript
   // Node.js: Use perMessageDeflate
   const wss = new WebSocket.Server({ 
       server,
       perMessageDeflate: true
   });
   ```

3. **Implement Data Buffering**
   ```cpp
   // ESP32: Send batched data
   float sensorReadings[10]; // Buffer 10 readings
   // ... accumulate ...
   // Send all at once
   ```

4. **Use Connection Pooling**
   ```javascript
   // Node.js: Reuse HTTP connections to Flask API
   const http = require('http');
   const agent = new http.Agent({
       keepAlive: true,
       maxSockets: 5
   });
   ```

### Monitor Network Health

```javascript
// Node.js: Log connection metrics
let connectedClients = 0;
wss.on('connection', (ws) => {
    connectedClients++;
    console.log(`Clients connected: ${connectedClients}`);
    
    ws.on('close', () => {
        connectedClients--;
        console.log(`Clients connected: ${connectedClients}`);
    });
});
```

---

## Files Modified for WiFi Support

### Server-Side
- ✅ `server.js` - Listens on 0.0.0.0, generates config.json
- ✅ `ml_api/app.py` - Should use `host='0.0.0.0'`

### Client-Side
- ✅ `public/js/main.js` - Loads config.json, provides serverConfig object
- ✅ `public/js/live-test.js` - Uses serverConfig for WebSocket
- ✅ `public/js/result.js` - Uses serverConfig for API calls
- ✅ `public/js/history.js` - Uses serverConfig for data fetch
- ✅ `public/js/report.js` - Uses serverConfig for chart data
- ✅ `public/wifi-setup.html` - Displays server configuration

### Hardware
- ✅ `ESP32_WiFi_Sketch.ino` - Connect to WiFi and send data to server

---

## Next Steps

1. ✅ **Start the Node.js server**
   ```bash
   node server.js
   ```

2. ✅ **Note your server IP** (shown in console output)

3. ✅ **Test from another device**
   ```
   http://192.168.x.x:3000/wifi-setup
   ```

4. ✅ **Update and upload ESP32 firmware**
   - Update WIFI_SSID, WIFI_PASSWORD, SERVER_IP
   - Upload to ESP32

5. ✅ **Monitor data flow**
   - Watch Serial Monitor on ESP32
   - Check dashboard for live data
   - Verify WiFi setup page shows correct configuration

6. ✅ **Deploy ML API** (if not already running)
   ```bash
   python ml_api/app.py
   ```

7. ✅ **Test end-to-end system**
   - ESP32 sends sensor data
   - Server receives and broadcasts to clients
   - Flask API receives predictions requests
   - Dashboard updates in real-time

---

## Support

### Debugging Commands

```bash
# Check if Node.js server is running
netstat -ano | findstr :3000

# Check if Flask API is running
netstat -ano | findstr :5000

# Test server connectivity
ping 192.168.x.x

# Verify server is responding
curl http://192.168.x.x:3000

# Check config.json
curl http://192.168.x.x:3000/config.json
```

### Log Files

Monitor these logs for errors:
- **Node.js:** Console output
- **Flask:** Terminal output
- **ESP32:** Serial Monitor (115200 baud)
- **Browser:** Developer Console (F12 → Console tab)

---

**Happy monitoring! 🚀**

*Last Updated: 2024*
*Kidney Disorder Monitoring System - WiFi Configuration Guide*
