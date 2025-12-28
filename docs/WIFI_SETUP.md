# WiFi Network Setup Guide

This guide explains how to set up the Smart Kidney Monitoring System on a shared WiFi network where the hardware (ESP32), Node.js server, Flask ML API, and web dashboard all communicate wirelessly.

## Network Architecture

```
WiFi Network
├── Web Server (Node.js) - http://<SERVER_IP>:3000
├── ML API (Flask) - http://<SERVER_IP>:5000
├── Hardware Device (ESP32) - Sends data to Web Server
└── Dashboard Clients - Access web server from any device
```

## Setup Steps

### 1. Start the Node.js Web Server

The server is configured to automatically detect your network IP address and listen on all interfaces.

```powershell
cd C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder
node server.js
```

**Output will show:**
```
========================================
Server running on http://<YOUR_IP>:3000
WebSocket server running on ws://<YOUR_IP>:3000
Local: http://localhost:3000
========================================
```

### 2. Start the Flask ML API

In another terminal:

```powershell
cd C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder\ml_api
python app.py
```

**Output will show:**
```
Running on http://0.0.0.0:5000
```

### 3. Access the Web Dashboard

From any device on the same WiFi network:

- **Local Access:** http://localhost:3000
- **Network Access:** http://<YOUR_SERVER_IP>:3000

Replace `<YOUR_SERVER_IP>` with the IP address shown when you started the server.

### 4. Configure ESP32 Hardware

Update your ESP32 firmware with these network settings:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration (use the IP from step 1)
const char* serverIP = "192.168.x.x";  // Your network IP
const int serverPort = 3000;

// API Endpoints
String sensorDataURL = "http://" + String(serverIP) + ":3000/api/sensor-data";
```

### 5. Connect Devices to WiFi

Make sure all devices are on the same WiFi network:
- Server computer
- ESP32 device
- Client devices (laptop, tablet, smartphone)

## How It Works

### Automatic IP Detection

The Node.js server automatically:
1. Detects your network IP address
2. Listens on all network interfaces (`0.0.0.0`)
3. Creates a `config.json` file accessible to web clients
4. Allows clients to discover and connect to the correct server IP

### Client Configuration

The web dashboard (`main.js`) automatically:
1. Loads `config.json` to get the server IP
2. Updates WebSocket connection to use the network IP
3. Updates API calls to use the network IP
4. Falls back to `localhost:3000` if config is unavailable

### Data Flow

1. **Hardware → Server**
   - ESP32 sends sensor data to `http://<SERVER_IP>:3000/api/sensor-data`
   - Server receives data and broadcasts to all connected clients

2. **Server ↔ Clients**
   - WebSocket connection: `ws://<SERVER_IP>:3000`
   - Real-time data streaming
   - Test progress updates

3. **Server → ML API**
   - Server can forward data to Flask API at `http://<SERVER_IP>:5000`
   - ML API processes sensor data and returns predictions
   - Results sent back to clients

## Accessing from Different Devices

### Same Computer (Local)
```
http://localhost:3000
```

### Other Computers on Same WiFi
```
http://<SERVER_IP>:3000
```

Example: If server shows `192.168.1.100`, use:
```
http://192.168.1.100:3000
```

### Mobile Devices
Same URL as other computers:
```
http://<SERVER_IP>:3000
```

## Troubleshooting

### Can't Access from Other Devices

1. **Check Firewall:**
   - Windows Firewall may block port 3000
   - Allow Node.js through firewall
   - Or temporarily disable firewall for testing

2. **Verify IP Address:**
   - Make sure you're using the correct IP shown in server output
   - Check `public/config.json` for the IP
   - Run `ipconfig` in PowerShell to verify your IP

3. **Same WiFi Network:**
   - Verify all devices are on the same WiFi network
   - Some networks isolate devices - check router settings

### WebSocket Connection Issues

- WebSocket automatically uses the IP from `config.json`
- If connection fails, check browser console for error messages
- Verify firewall allows port 3000

### ESP32 Can't Connect to Server

1. Update ESP32 code with correct:
   - WiFi SSID and password
   - Server IP address (from server output)
   - Server port (3000)

2. Verify ESP32 is on same WiFi network

3. Check server logs for incoming connections

## Environment Variables (Optional)

You can override the default port:

```powershell
$env:PORT=8080
node server.js
```

Or for Flask:

```powershell
$env:FLASK_PORT=5000
python ml_api/app.py
```

## Files Modified for WiFi Support

- `server.js` - Listens on 0.0.0.0, generates config.json
- `public/js/main.js` - Loads config.json and sets serverConfig
- `public/js/live-test.js` - Uses serverConfig for WebSocket
- `public/js/result.js` - Uses serverConfig for API calls
- `public/js/history.js` - Uses serverConfig for API calls
- `public/js/report.js` - Uses serverConfig for API calls
- `public/config.json` - Auto-generated with server IP

## Security Notes

⚠️ **For Production:**
- Add authentication for API endpoints
- Use HTTPS/WSS instead of HTTP/WS
- Configure CORS properly
- Implement rate limiting
- Add input validation

For now, this setup is optimized for local WiFi network testing and demo purposes.
