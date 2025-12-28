# Quick Start Guide - Running Website with ML API on Different Machines

## 30-Second Quick Start

### If everything is on localhost:
```powershell
npm start
# Done! Go to http://localhost:3000
```

### If ML API is on a different machine (IP: 192.168.1.50):
```powershell
$env:ML_API_IP="192.168.1.50"
npm start
# Done! Go to http://localhost:3000
```

---

## Common Scenarios

### Scenario A: All Local (Single Machine)
```powershell
# Terminal 1: Start Flask ML API
cd ml_api
python app.py
# Wait for: "Running on http://0.0.0.0:5000"

# Terminal 2: Start Node.js Server
npm start
# Wait for: "Server running on http://localhost:3000"

# Terminal 3: Open browser
# Go to: http://localhost:3000
```

### Scenario B: ML API on Different Machine

**Machine 1 (ML Server - 192.168.1.50):**
```bash
cd ml_api
python app.py
# Running on http://0.0.0.0:5000
```

**Machine 2 (Web Server - 192.168.1.100):**
```powershell
$env:ML_API_IP="192.168.1.50"
npm start
# Server running on http://192.168.1.100:3000
# ML API: http://192.168.1.50:5000
```

**Any Machine (Browser):**
```
Open: http://192.168.1.100:3000
Website automatically uses ML API at http://192.168.1.50:5000
```

### Scenario C: Using Interactive Configuration Script

```powershell
.\start-server.ps1

# Script will ask:
# ML API IP Address (default: localhost): 192.168.1.50
# ML API Port (default: 5000): 5000
# Server Port (default: 3000): 3000

# Server starts automatically!
```

---

## Setup Checklist

Before starting, verify:
- [ ] Flask ML API is running on its machine
- [ ] Node.js server machine can ping the ML API machine
- [ ] Firewall allows connections on port 5000 (for ML API)
- [ ] Firewall allows connections on port 3000 (for web server)
- [ ] You know the IP address of the ML API machine

---

## Verify Everything Works

### Step 1: Check ML API is reachable
```powershell
Invoke-WebRequest -Uri "http://192.168.1.50:5000"
# Should return status code 200 with {"status": "healthy"}
```

### Step 2: Check website loads
```
Open browser: http://192.168.1.100:3000
Should see: Smart Kidney Monitoring Dashboard
```

### Step 3: Check browser console
```
Press F12 → Console tab
Look for:
- "Server configured: 192.168.1.100:3000"
- "ML API configured: 192.168.1.50:5000"
```

---

## Running Tests

### Quick Test from Browser Console:
```javascript
// Check configuration
console.log(serverConfig.getMLApiURL())  // Should show configured ML API URL

// Verify connection (will work if ML API is accessible)
fetch(serverConfig.getMLApiURL() + '/predict', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        bioimpedance_1khz: 400,
        bioimpedance_10khz: 370,
        bioimpedance_100khz: 330,
        bioimpedance_200khz: 300,
        heart_rate: 75,
        temperature: 36.8,
        motion: 25
    })
}).then(r => r.json()).then(d => console.log(d))
```

---

## Environment Variables Reference

Set before running `npm start`:

```powershell
# ML API IP Address (required if different from localhost)
$env:ML_API_IP="192.168.1.50"

# ML API Port (optional, default: 5000)
$env:ML_API_PORT="5000"

# Node.js Server Port (optional, default: 3000)
$env:PORT="3000"
```

---

## Stop the Server

Press `Ctrl + C` in the terminal running `npm start`

---

## Need Help?

See detailed documentation:
- **Full Configuration Guide:** `CONFIGURATION.md`
- **Implementation Details:** `ML_API_SETUP.md`

---

## What's New?

The website now automatically:
1. ✅ Reads ML API IP from environment variables
2. ✅ Generates `config.json` with ML API settings
3. ✅ Routes all API calls to the configured ML API
4. ✅ Works exactly the same - no UI changes!

That's it! The website handles all the configuration automatically! 🚀
