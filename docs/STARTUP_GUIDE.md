# WiFi System - Complete Startup Guide

This guide walks you through starting up the complete kidney monitoring system with all components working together on WiFi.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js installed (check with `node --version`)
- ✅ Python 3.8+ installed (check with `python --version`)
- ✅ Flask installed (check with `pip list | findstr flask`)
- ✅ All devices on the same WiFi network
- ✅ ESP32 board with Arduino IDE ready for upload

---

## Step 1: Start Node.js Server (Terminal 1)

Open **PowerShell** and navigate to project directory:

```powershell
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"
```

Ensure npm packages are installed:

```powershell
npm install
```

Start the Node.js server:

```powershell
node server.js
```

**Expected Output:**
```
========================================
Server running on http://192.168.x.x:3000
WebSocket server running on ws://192.168.x.x:3000
Local: http://localhost:3000
========================================
```

**✅ Keep this terminal open!** Do not close it.

**Important:** Note the server IP address displayed (e.g., `192.168.1.100`). You'll need this for the next steps.

---

## Step 2: Start Flask ML API (Terminal 2)

Open a **second PowerShell** window:

```powershell
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder\ml_api"
```

Install Python dependencies (if needed):

```powershell
pip install -r requirements.txt
```

Start the Flask API:

```powershell
python app.py
```

**Expected Output:**
```
 * Running on http://0.0.0.0:5000
 * WARNING: This is a development server. Do not use it in production.
 * Press CTRL+C to quit
 * Restarting with reloader
```

**✅ Keep this terminal open!** Do not close it.

---

## Step 3: Verify Services (Terminal 3 - Optional)

Open a **third PowerShell** window to run verification:

```powershell
cd "C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"
```

Run the network test script:

```powershell
.\test-network.bat
```

When prompted, enter your server IP (from Step 1).

**Expected Output:**
```
1. Node.js Server (Port 3000)
Testing connection...
✓ OK - Server is running

2. Flask ML API (Port 5000)
Testing connection...
✓ OK - ML API is running

3. HTTP Endpoints
   a) Main dashboard
   Status: 200

   b) WiFi setup page
   Status: 200

   c) Configuration file
   {
   "serverIP": "192.168.x.x",
   "serverPort": 3000
   }
```

---

## Step 4: Test From Another Device

On a **different device on the same WiFi** (laptop, tablet, phone):

1. Open a web browser
2. Go to: `http://192.168.x.x:3000` (use the IP from Step 1)
3. You should see the kidney monitoring dashboard load

**If this works**, your network setup is correct! ✅

---

## Step 5: Configure ESP32 Firmware

### 5a. Open Arduino IDE

- Launch Arduino IDE
- File → Open → Select `ESP32_WiFi_Sketch.ino`

### 5b. Update Configuration

In the sketch, find and update these lines (around line 30-34):

```cpp
// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Your WiFi network name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Your WiFi password

// Server Configuration
const char* SERVER_IP = "192.168.1.100";         // Replace with your server IP from Step 1
```

**Example (with real values):**
```cpp
const char* WIFI_SSID = "MyHomeNetwork";
const char* WIFI_PASSWORD = "MyPassword123!";
const char* SERVER_IP = "192.168.1.100";         // Your actual server IP
```

### 5c. Verify Board Settings

In Arduino IDE:
- Tools → Board → Select "ESP32 Dev Module" (or your ESP32 board)
- Tools → Port → Select your USB port (e.g., COM3)
- Tools → Upload Speed → 115200

### 5d. Upload Firmware

Click the "Upload" button (right arrow icon) or press `Ctrl + U`

Wait for completion. You should see:
```
Uploading...
[==================================================] 100%
Upload complete!
```

---

## Step 6: Monitor ESP32 Connection

With ESP32 connected via USB:

1. In Arduino IDE, click Tools → Serial Monitor
2. Set baud rate to **115200**
3. Power on the ESP32 (or press Reset button)

**Expected Output (within 10 seconds):**
```
Configuration:
  WiFi SSID: MyHomeNetwork
  Server IP: 192.168.x.x
  Server Port: 3000
  API URL: http://192.168.x.x:3000/api/sensor-data

Connecting to WiFi: MyHomeNetwork
.......................
WiFi connected successfully!
IP Address: 192.168.x.z
Signal Strength: -45 dBm

[1] Data sent successfully. HR: 72 BPM, Temp: 36.8°C
[2] Data sent successfully. HR: 75 BPM, Temp: 36.8°C
[3] Data sent successfully. HR: 74 BPM, Temp: 36.7°C
```

**If you see "WiFi connected successfully!" and data being sent**, your ESP32 is working! ✅

---

## Step 7: Monitor Dashboard

While ESP32 is sending data:

1. Open browser to: `http://192.168.x.x:3000` (or `http://localhost:3000` from same computer)
2. Navigate to "Live Test" page
3. You should see:
   - Real-time charts updating
   - Heart rate, temperature, bioimpedance readings
   - Live progress indicator
   - Connection status

**If data appears on the dashboard**, your system is fully operational! ✅

---

## Step 8: Test All Features

### Navigation
Click through all pages to verify they work:
- [ ] **Home** - System status and metrics
- [ ] **Live Test** - Real-time data from ESP32
- [ ] **Results** - Analysis of test results
- [ ] **History** - 12-month trend analysis
- [ ] **Report** - Detailed clinical report
- [ ] **About** - System information

### Data Verification
On the **Live Test** page:
- [ ] Charts are updating in real-time
- [ ] Heart rate values are reasonable (60-100 BPM)
- [ ] Temperature is around 36-37°C
- [ ] Bioimpedance values are reasonable (300-400Ω)
- [ ] Progress bar advances during test

### Configuration Verification
Go to: `http://192.168.x.x:3000/wifi-setup`
- [ ] Server IP is displayed correctly
- [ ] WebSocket URL is shown
- [ ] ML API URL is shown
- [ ] ESP32 code snippet shows your server IP

---

## System Status Checklist

Once everything is running, verify:

### Servers Running
- [ ] Node.js console shows "Server running on http://192.168.x.x:3000"
- [ ] Flask console shows "Running on http://0.0.0.0:5000"
- [ ] No error messages in either console

### Network Connectivity
- [ ] Dashboard accessible from another device on WiFi
- [ ] test-network.bat shows all services OK
- [ ] WiFi setup page displays correctly
- [ ] config.json is accessible at /config.json

### ESP32 Connection
- [ ] Serial Monitor shows "WiFi connected successfully!"
- [ ] Serial Monitor shows "[1] Data sent successfully..."
- [ ] Data is being sent every second
- [ ] No connection errors in Serial Monitor

### Data Flow
- [ ] Dashboard receives live data from ESP32
- [ ] Charts update in real-time
- [ ] All pages load without errors
- [ ] No console errors when opening browser F12

---

## Troubleshooting Quick Guide

### Node.js Server Won't Start
```powershell
# Check if port 3000 is already in use
netstat -ano | findstr :3000

# If in use, stop the process or use different port:
# Edit server.js and change PORT = process.env.PORT || 3000;
```

### Flask Won't Start
```powershell
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Reinstall requirements
pip install --upgrade pip
pip install -r requirements.txt
```

### Dashboard Not Loading
- [ ] Verify server IP is correct
- [ ] Check firewall allows port 3000
- [ ] Try localhost from same computer: `http://localhost:3000`
- [ ] Check browser console (F12) for error messages

### ESP32 Can't Connect to WiFi
- [ ] Verify WIFI_SSID spelling (case-sensitive)
- [ ] Verify WIFI_PASSWORD is correct
- [ ] Check that WiFi router is powered on
- [ ] Check Serial Monitor for specific error message

### ESP32 Won't Send Data
- [ ] Verify SERVER_IP in code is correct
- [ ] Verify Node.js server is actually running
- [ ] Check Windows Firewall allows Node.js on port 3000
- [ ] Check Serial Monitor for "Connection refused" error

### Dashboard Shows "Connecting..." But No Data
- [ ] Check if ESP32 is actually sending data (Serial Monitor)
- [ ] Verify browser console (F12) for WebSocket errors
- [ ] Verify config.json loads: `curl http://192.168.x.x:3000/config.json`
- [ ] Try restarting Node.js server

---

## What's Happening Behind the Scenes

### Startup Sequence

```
1. Node.js Server Starts
   ├─ Listens on 0.0.0.0:3000
   ├─ Detects network IP (192.168.x.x)
   ├─ Creates public/config.json
   └─ Prints IP to console

2. Flask API Starts
   ├─ Listens on 0.0.0.0:5000
   ├─ Loads machine learning model
   └─ Ready to accept predictions

3. Browser Loads Dashboard
   ├─ Fetches index.html
   ├─ Loads main.js
   ├─ main.js fetches config.json
   ├─ Extracts serverIP from config.json
   ├─ Connects WebSocket to ws://serverIP:3000
   └─ Waits for data

4. ESP32 Boots
   ├─ Connects to WiFi
   ├─ Every 1 second:
   │  ├─ Reads sensors
   │  ├─ Formats JSON
   │  └─ POSTs to http://serverIP:3000/api/sensor-data
   └─ Repeats until power off

5. Server Receives Data
   ├─ Processes sensor data
   ├─ Broadcasts to all WebSocket clients
   ├─ Sends to Flask for prediction
   └─ Returns prediction to clients

6. Dashboard Updates
   ├─ Receives data via WebSocket
   ├─ Updates charts
   ├─ Updates statistics
   └─ Repeats
```

---

## Normal Operation

### What You Should See

**Terminal 1 (Node.js):**
```
[REST API] Received sensor data
Broadcast to 2 connected clients
[WebSocket] Sent update to client
```

**Terminal 2 (Flask):**
```
POST /predict - 200 OK
Prediction returned: 85.3 mL/min/1.73m²
```

**Serial Monitor (ESP32):**
```
[42] Data sent successfully. HR: 73 BPM, Temp: 36.8°C
[43] Data sent successfully. HR: 71 BPM, Temp: 36.9°C
[44] Data sent successfully. HR: 75 BPM, Temp: 36.8°C
```

**Browser Dashboard:**
```
Live Test Page
├─ Heart Rate: 73 BPM (updating)
├─ Temperature: 36.8°C (updating)
├─ Bioimpedance: 385 Ω (updating)
├─ Progress: ████████░░ 78% (advancing)
└─ Status: "Testing in progress..."
```

---

## Common Questions

### Q: Can I access from mobile phone?
**A:** Yes! Go to `http://192.168.x.x:3000` from any device on WiFi.

### Q: What if server IP changes?
**A:** Restart Node.js server. It will auto-detect the new IP and update config.json.

### Q: Can multiple users access simultaneously?
**A:** Yes! Multiple browsers can connect simultaneously.

### Q: Does ESP32 need to be on same WiFi?
**A:** Yes, must be on same WiFi network as Node.js server.

### Q: Can I use this over the internet?
**A:** Not with current setup (it's local network only). For internet access, you'd need to:
- Set up port forwarding on router
- Use a VPN
- Deploy on cloud server
- Implement HTTPS/authentication

### Q: How do I stop the servers?
**A:** In each terminal, press `Ctrl + C` to stop.

---

## Performance Notes

- **Data Send Rate**: ESP32 sends every 1 second
- **Dashboard Update Rate**: Updates in real-time via WebSocket
- **Network Latency**: <100ms typical on home WiFi
- **Simultaneous Connections**: Tested with 5+ browsers

---

## Next Steps After Successful Startup

1. **Verify All Data**: Confirm all sensor readings are reasonable
2. **Test Predictions**: Watch ML API predictions update
3. **Check History**: Verify 12-month trend data displays
4. **Export Data**: Try downloading test results
5. **Share Results**: Test sharing functionality

---

## Support Resources

| Issue | Document |
|-------|----------|
| Detailed troubleshooting | WIFI_NETWORK_SETUP.md |
| Quick reference | WIFI_QUICKSTART.md |
| Architecture overview | WIFI_IMPLEMENTATION_SUMMARY.md |
| Network test results | test-network.bat output |

---

## Shutdown Procedure

When you're done testing:

1. **Close Browser** - No data needed
2. **Stop ESP32** - Disconnect power or USB
3. **Stop Flask API** - Press `Ctrl+C` in Terminal 2
4. **Stop Node.js Server** - Press `Ctrl+C` in Terminal 1

All data is automatically saved.

---

## Success Indicators

You've successfully set up WiFi networking when:

✅ Node.js server reports network IP to console
✅ Flask API runs without errors
✅ test-network.bat shows all connections OK
✅ Dashboard loads from different device on WiFi
✅ ESP32 connects to WiFi and sends data
✅ Dashboard shows live updates from ESP32
✅ WiFi setup page displays configuration
✅ All 6 pages (Home, Live Test, Results, History, Report, About) work
✅ No errors in browser console (F12)

---

## You're Ready! 🚀

Your kidney monitoring system is now operational with:
- ✅ **Hardware (ESP32)** - Sending real-time sensor data
- ✅ **Server (Node.js)** - Receiving and distributing data
- ✅ **ML API (Flask)** - Providing predictions
- ✅ **Dashboard** - Displaying real-time monitoring
- ✅ **Multi-Device Support** - Accessible from any WiFi device

Happy monitoring!

---

**Last Updated: 2024**
*Kidney Disorder Monitoring System - Complete Startup Guide*
