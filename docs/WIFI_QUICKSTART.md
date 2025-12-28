# WiFi Network Setup - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### 1. Start the Node.js Server

Open PowerShell and run:
```powershell
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"
node server.js
```

You should see:
```
========================================
Server running on http://192.168.x.x:3000
WebSocket server running on ws://192.168.x.x:3000
Local: http://localhost:3000
========================================
```

**Note your Server IP** (the 192.168.x.x address)

### 2. Start the Flask ML API

Open another PowerShell and run:
```powershell
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder\ml_api"
python app.py
```

### 3. Verify Everything Works

**Option A: Using the Test Script**
```powershell
.\test-network.bat
```
Enter your server IP when prompted. The script will verify all connections.

**Option B: Manual Verification**

Open a web browser and go to:
- **Dashboard**: http://192.168.x.x:3000 (from any device on WiFi)
- **WiFi Setup Page**: http://192.168.x.x:3000/wifi-setup
- **Config File**: http://192.168.x.x:3000/config.json

### 4. Configure Your ESP32

1. **Get the ESP32 Sketch**: `ESP32_WiFi_Sketch.ino`

2. **Update these 3 lines** (around line 30-34):
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";          // Your WiFi name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* SERVER_IP = "192.168.x.x";              // Your server IP from Step 1
```

3. **Upload to ESP32** using Arduino IDE

4. **Open Serial Monitor** (115200 baud) to see connection status

---

## 📋 Files Created/Updated

### New Files
| File | Purpose |
|------|---------|
| `ESP32_WiFi_Sketch.ino` | Arduino firmware for ESP32 hardware |
| `WIFI_NETWORK_SETUP.md` | Detailed WiFi setup guide |
| `test-network.bat` | Windows network verification script |
| `test-network.sh` | Linux/Mac network verification script |

### Modified Files
| File | Change |
|------|--------|
| `server.js` | Listens on 0.0.0.0, generates config.json |
| `public/js/main.js` | Loads serverConfig from config.json |
| `public/js/live-test.js` | Uses dynamic server configuration |
| `public/js/result.js` | Uses dynamic server configuration |
| `public/js/history.js` | Uses dynamic server configuration |
| `public/js/report.js` | Uses dynamic server configuration |
| `ml_api/app.py` | Confirms it listens on 0.0.0.0 |

---

## 🔗 Network Diagram

```
Your WiFi Network (SSID: YourNetworkName)
│
├─ ESP32 (192.168.x.z)
│  └─ Sends sensor data to Node.js server
│
├─ Your Computer (192.168.x.y)
│  ├─ Node.js Server (listening on port 3000)
│  └─ Flask ML API (listening on port 5000)
│
├─ Laptop/Tablet on WiFi
│  └─ Accesses dashboard at http://192.168.x.y:3000
│
└─ Mobile Phone on WiFi
   └─ Accesses dashboard at http://192.168.x.y:3000
```

---

## 🧪 How to Verify Connections

### Method 1: Web Browser (Easiest)

1. Open any browser
2. Go to `http://192.168.x.x:3000/wifi-setup`
3. You'll see:
   - Server IP address
   - WebSocket URL
   - ML API URL
   - ESP32 code snippet

### Method 2: Command Line

**Check if server is running:**
```powershell
netstat -ano | findstr :3000
```

**Check if ML API is running:**
```powershell
netstat -ano | findstr :5000
```

**Test server from another device:**
```powershell
ping 192.168.x.x
curl http://192.168.x.x:3000
```

### Method 3: Automated Script

**Windows:**
```powershell
.\test-network.bat
```

**Linux/Mac:**
```bash
bash test-network.sh
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Connection refused" on ESP32

**Solution:**
1. Verify SERVER_IP is correct (check server.js output)
2. Make sure Node.js server is running
3. Check Windows Firewall allows port 3000

**To allow port in Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js and ensure it's checked

### Issue: Dashboard shows "Connecting..." but no data

**Solution:**
1. Check browser console (F12 → Console tab)
2. Verify ESP32 is actually sending data (check Serial Monitor)
3. Verify config.json is accessible:
   ```
   http://192.168.x.x:3000/config.json
   ```

### Issue: ESP32 can't find WiFi

**Solution:**
1. Double-check WIFI_SSID spelling (case-sensitive)
2. Verify WiFi password is correct
3. Make sure WiFi router is on

### Issue: "Cannot GET /api/sensor-data"

**This is normal!** The error only appears if:
- You try to access it with a GET request
- Server is not running

The server expects a **POST** request from ESP32, which works fine.

---

## 📊 Server Status & Logs

### Node.js Server Console Output

```
========================================
Server running on http://192.168.x.x:3000
WebSocket server running on ws://192.168.x.x:3000
Local: http://localhost:3000
========================================

✓ config.json created successfully
✓ Server listening on all network interfaces
```

### Flask API Console Output

```
 * Running on http://0.0.0.0:5000
 * WARNING: This is a development server
```

### ESP32 Serial Monitor Output

```
Configuration:
  WiFi SSID: MyNetwork
  Server IP: 192.168.x.x
  Server Port: 3000
  API URL: http://192.168.x.x:3000/api/sensor-data

Connecting to WiFi: MyNetwork
.............
WiFi connected successfully!
IP Address: 192.168.x.z
Signal Strength: -45 dBm

[1] Data sent successfully. HR: 72 BPM, Temp: 36.8°C
[2] Data sent successfully. HR: 75 BPM, Temp: 36.8°C
```

---

## 🔐 Security Notes

### Development/Testing (Current)
- Works on private home/office WiFi ✅
- Open to all devices on network (by design)
- No encryption or authentication

### Production Deployment
Before deploying to hospital/production:
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Add authentication (API keys or JWT)
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use WSS (WebSocket Secure)

See `WIFI_NETWORK_SETUP.md` for security implementation details.

---

## 📱 Accessing from Different Devices

### From Server Machine (Your Computer)
```
Local Dashboard: http://localhost:3000
Network Dashboard: http://192.168.x.x:3000
```

### From Another Computer on Same WiFi
```
http://192.168.x.x:3000
```

### From Laptop/Tablet on Same WiFi
```
http://192.168.x.x:3000
```

### From Mobile Phone on Same WiFi
```
http://192.168.x.x:3000
```

---

## 🛠️ Complete Startup Procedure

### Step 1: Prepare Environment
```powershell
# Navigate to project directory
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"

# Verify npm packages are installed
npm install
```

### Step 2: Start Services (Use 3 Terminal Windows)

**Terminal 1 - Node.js Server:**
```powershell
node server.js
# Watch for: "Server running on http://192.168.x.x:3000"
```

**Terminal 2 - Flask ML API:**
```powershell
cd ml_api
python app.py
# Watch for: "Running on http://0.0.0.0:5000"
```

**Terminal 3 - Monitoring (Optional):**
```powershell
# Watch the logs, or use this to test:
.\test-network.bat
```

### Step 3: Verify Services
- Browser: http://192.168.x.x:3000 (should show dashboard)
- Browser: http://192.168.x.x:3000/config.json (should show server details)

### Step 4: Configure ESP32
- Update `ESP32_WiFi_Sketch.ino` with WiFi credentials and server IP
- Upload to ESP32
- Watch Serial Monitor for connection confirmation

### Step 5: Monitor Data Flow
- Check ESP32 Serial Monitor for outgoing data
- Check dashboard for incoming data updates
- Check Flask logs for prediction requests

---

## 📞 Need Help?

### Verify Installation
```powershell
# Check Node.js
node --version

# Check npm
npm --version

# Check Python
python --version

# Check Flask
python -m flask --version
```

### Check Network
```powershell
# List network connections
ipconfig

# Test connection to server
ping 192.168.x.x

# Test HTTP server
curl http://192.168.x.x:3000

# Test REST API
curl -X POST http://192.168.x.x:3000/api/sensor-data -H "Content-Type: application/json" -d '{"temperature": 37.0}'
```

### View Detailed Logs
See `WIFI_NETWORK_SETUP.md` for:
- Network architecture diagrams
- Troubleshooting guide
- Performance optimization tips
- Security hardening recommendations

---

## 📚 Documentation

| Document | Contents |
|----------|----------|
| `WIFI_NETWORK_SETUP.md` | Complete setup guide with troubleshooting |
| `ESP32_WiFi_Sketch.ino` | Arduino firmware for hardware |
| `test-network.bat` / `.sh` | Network verification scripts |
| `README.md` (this file) | Quick reference guide |

---

## ✅ Checklist

Before declaring system ready:

- [ ] Node.js server running and showing network IP
- [ ] Flask ML API running on port 5000
- [ ] Dashboard accessible from another device on WiFi
- [ ] WiFi setup page showing correct server details
- [ ] ESP32 firmware updated with correct WiFi credentials
- [ ] ESP32 firmware updated with correct server IP
- [ ] ESP32 successfully connecting to WiFi (Serial Monitor shows "WiFi connected successfully!")
- [ ] ESP32 successfully sending data (Serial Monitor shows "[1] Data sent successfully...")
- [ ] Dashboard displaying live data from ESP32
- [ ] Test script (`test-network.bat`) confirms all connections

---

## 🎉 Success!

Once all items in the checklist are complete, your kidney monitoring system is fully operational on WiFi!

- **Hardware (ESP32)** → sends sensor data
- **Node.js Server** → receives and distributes data
- **Flask ML API** → provides predictions
- **Web Dashboard** → displays real-time monitoring data
- **Multiple Clients** → can access from any device on network

---

**System is ready for deployment and testing! 🚀**

*Last Updated: 2024*
*Kidney Disorder Monitoring System*
