# Smart Kidney Monitoring System - Configuration Guide

This guide explains how to configure the website to work with ML model and hardware on different IP addresses.

## Quick Configuration

### Option 1: Using Environment Variables (Recommended)

#### On Windows (PowerShell):

```powershell
# Set ML API IP and Port before running the server
$env:ML_API_IP="192.168.1.100"
$env:ML_API_PORT="5000"

# Start the server
npm start
```

#### Example Configurations:

```powershell
# Local machine
$env:ML_API_IP="localhost"
$env:ML_API_PORT="5000"

# Network ML server
$env:ML_API_IP="192.168.1.50"
$env:ML_API_PORT="5000"

# Different port
$env:ML_API_IP="10.0.0.5"
$env:ML_API_PORT="8000"
```

### Option 2: Manual Config File Editing

Edit `public/config.json`:

```json
{
  "serverIP": "192.168.1.100",
  "serverPort": 3000,
  "mlApiIP": "192.168.1.50",
  "mlApiPort": 5000,
  "timestamp": "2025-12-26T04:30:30.471Z"
}
```

## Complete Network Setup Example

### Scenario: Multi-Device Setup

**Device 1 (Server Machine):** 192.168.1.100
- Hosts: Node.js Server (port 3000)
- Access: http://192.168.1.100:3000

**Device 2 (ML Model Machine):** 192.168.1.50
- Hosts: Flask ML API (port 5000)
- Access: http://192.168.1.50:5000

**Device 3 (Client/Browser):** Any machine on network
- Access: http://192.168.1.100:3000

### Configuration Steps:

1. **Start Flask ML API** (on Device 2):
```bash
cd ml_api
python app.py
# Should show: Running on http://0.0.0.0:5000
```

2. **Start Node.js Server** (on Device 1):
```powershell
$env:ML_API_IP="192.168.1.50"
$env:ML_API_PORT="5000"
npm start
# Should show: ML API: http://192.168.1.50:5000
```

3. **Access Dashboard** (from Device 3 or any browser):
- Open: http://192.168.1.100:3000
- Website automatically loads configuration from config.json
- ML API calls are routed to 192.168.1.50:5000

## Hardcoded vs. Dynamic

### ✅ What Works Without Changes:
- Website UI and all features
- Real-time monitoring display
- Charts and visualizations
- WebSocket connections
- Test controls and buttons

### ⚙️ Configuration Points:
1. **serverIP** - Where the Node.js server is hosted
2. **serverPort** - Port of Node.js server (default: 3000)
3. **mlApiIP** - Where the Flask ML API is hosted
4. **mlApiPort** - Port of Flask ML API (default: 5000)

## Testing the Configuration

### Check if ML API is reachable:

**PowerShell:**
```powershell
# Test ML API health
Invoke-WebRequest -Uri "http://192.168.1.50:5000" -Method GET

# Test Flask prediction endpoint
$body = @{
    bioimpedance_1khz = 400
    bioimpedance_10khz = 370
    bioimpedance_100khz = 330
    bioimpedance_200khz = 300
    heart_rate = 75
    temperature = 36.8
    motion = 25
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://192.168.1.50:5000/predict" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Browser Console Check:

1. Open browser and go to http://192.168.1.100:3000
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for logs:
   - "Server configured: 192.168.1.100:3000"
   - "ML API configured: 192.168.1.50:5000"

## Docker Setup (Optional)

If using Docker containers:

```bash
# Start Flask ML API container
docker run -p 5000:5000 ml_api_image

# Start Node.js server with environment variables
docker run -p 3000:3000 \
  -e ML_API_IP=ml_api_container_ip \
  -e ML_API_PORT=5000 \
  node_server_image
```

## Troubleshooting

### Issue: "Cannot reach ML API"
**Solution:**
1. Verify Flask is running: `netstat -ano | findstr :5000`
2. Check firewall allows connections on port 5000
3. Verify IP address is correct: `ipconfig` on Windows
4. Test with: `Invoke-WebRequest -Uri "http://<IP>:5000"`

### Issue: Website loads but predictions fail
**Solution:**
1. Check browser console (F12) for error messages
2. Verify config.json has correct mlApiIP and mlApiPort
3. Ensure Flask ML API endpoint `/predict` is accessible
4. Check Flask logs for request errors

### Issue: Config.json not updating
**Solution:**
1. Restart Node.js server
2. Check `public/config.json` manually
3. Clear browser cache (Ctrl+Shift+Del)
4. Reload page

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Network Setup                         │
└─────────────────────────────────────────────────┘

    Browser (Client Device)
         │
         │ HTTP Request
         │ http://192.168.1.100:3000
         ▼
    ┌──────────────────────┐
    │  Node.js Server      │
    │  Port: 3000          │
    │                      │
    │ • Serves HTML/CSS/JS │
    │ • WebSocket server   │
    │ • Routes requests    │
    └──────────────────────┘
         │
         │ HTTP Request
         │ http://192.168.1.50:5000/predict
         │ (configured via environment)
         ▼
    ┌──────────────────────┐
    │  Flask ML API        │
    │  Port: 5000          │
    │                      │
    │ • Runs ML Model      │
    │ • Makes predictions  │
    │ • Returns results    │
    └──────────────────────┘

    public/config.json (generated on server start):
    {
      "serverIP": "192.168.1.100",
      "serverPort": 3000,
      "mlApiIP": "192.168.1.50",
      "mlApiPort": 5000
    }

    public/js/main.js loads config and:
    • Sets serverConfig.mlApiIP
    • Sets serverConfig.mlApiPort
    • All API calls use getMLApiURL()
```

## Summary

The website now supports:
- ✅ Configurable ML API IP address
- ✅ Configurable ML API port
- ✅ Environment variable support
- ✅ Automatic config.json generation
- ✅ No UI/functionality changes required

Simply set the environment variables before starting the server, and the website will automatically route all API calls to your ML model!
