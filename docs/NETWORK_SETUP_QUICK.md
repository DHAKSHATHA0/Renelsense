$env:GOOGLE_AI_API_KEY = "your-api-key-here"# Quick Network IP Setup

## How It Works Now

✅ **Website Server (3000)** - Detects your network IP automatically  
✅ **ML API (5000)** - Connects to same network IP  
✅ **Hardware Device** - Posts sensor data to network IP  

## Start the Server

### Option 1: PowerShell (Recommended - Windows)
```powershell
.\start-server.ps1
```

### Option 2: Batch File (Windows)
```batch
start-server.bat
```

### Option 3: Direct npm
```bash
npm start
```

## Access Website

When server starts, you'll see:
```
========================================
Server running on http://192.168.x.x:3000
WebSocket server running on ws://192.168.x.x:3000
Local: http://localhost:3000
ML API: http://192.168.x.x:5000
========================================
```

**Use the IP address shown to access from other devices:**
- Same machine: `http://localhost:3000`
- Other devices: `http://192.168.x.x:3000`

## Configure ML API (External)

If ML API runs on different machine:

### PowerShell
```powershell
$env:ML_API_IP = "192.168.x.x"  # IP of ML server
$env:ML_API_PORT = "5000"
.\start-server.ps1
```

### Batch
```batch
set ML_API_IP=192.168.x.x
set ML_API_PORT=5000
start-server.bat
```

## Hardware Device (ESP32)

Update `ESP32_WiFi_Sketch.ino`:

```cpp
const char* serverIP = "192.168.x.x";    // Server IP from startup output
const int serverPort = 3000;
```

Then upload to ESP32 and it will:
- ✅ Connect to WiFi
- ✅ Send data to `http://192.168.x.x:3000/api/sensor-data`
- ✅ Receive updates via WebSocket

## Files Modified

| File | Change |
|------|--------|
| `server.js` | Now detects network IP automatically |
| `public/js/main.js` | Uses detected IP instead of localhost |
| `public/config.json` | Auto-generated with correct IPs on startup |
| `start-server.ps1` | Auto-detects and configures IP |
| `start-server.bat` | Auto-detects and configures IP |

## Troubleshooting

**Can't access from other device?**
- Verify firewall allows port 3000
- Check both devices are on same WiFi
- Use IP address from server startup output

**ML API not connecting?**
- Verify ML API is running on port 5000
- Set correct ML_API_IP environment variable
- Check ML API IP in server startup output

**WebSocket error?**
- Clear browser cache
- Try `ws://` not `wss://`
- Check server is running

## See Also
- [IP_ADDRESS_SETUP.md](IP_ADDRESS_SETUP.md) - Full documentation
- [README.md](README.md) - General setup
