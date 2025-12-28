# Visual Quick Reference Guide

## 🚀 Start Server in 3 Ways

### Way 1: Simple (if ML API is on localhost)
```powershell
npm start
```
✅ Website: http://localhost:3000
✅ ML API: http://localhost:5000

---

### Way 2: With ML API on Different Machine
```powershell
$env:ML_API_IP="192.168.1.50"
npm start
```
✅ Website: http://localhost:3000
✅ ML API: http://192.168.1.50:5000

---

### Way 3: Interactive Setup
```powershell
.\start-server.ps1
```
Script will ask you:
```
ML API IP Address (default: localhost): 192.168.1.50
ML API Port (default: 5000): 5000
Server Port (default: 3000): 3000
```
Then starts automatically ✅

---

## 🔧 Environment Variables Cheat Sheet

```powershell
# Set these BEFORE running npm start

# ML API server location
$env:ML_API_IP="192.168.1.50"

# ML API server port (if not 5000)
$env:ML_API_PORT="8000"

# Web server port (if not 3000)
$env:PORT="3000"

# Verify they're set
Write-Host "ML_API_IP=$env:ML_API_IP"
Write-Host "ML_API_PORT=$env:ML_API_PORT"

# Then start server
npm start
```

---

## 🏗️ Network Setup Diagram

### Single Machine (Default)
```
┌──────────────────────┐
│   Single Computer    │
├──────────────────────┤
│ ✓ Flask ML API :5000 │
│ ✓ Node.js Server:3000│
│ ✓ Browser            │
└──────────────────────┘
        No setup needed
        npm start
```

### Two Machines
```
┌─────────────────────────────────────────┐
│          Network (WiFi/Ethernet)        │
└─────────────────────────────────────────┘
 │                                    │
 │                                    │
 ▼                                    ▼
┌──────────────┐          ┌──────────────┐
│  Machine A   │          │  Machine B   │
│ 192.168.1.50 │          │192.168.1.100 │
├──────────────┤          ├──────────────┤
│ Flask API:   │          │ Node.js      │
│   :5000      │          │ Server:3000  │
│              │          │              │
│ python       │          │ $env:ML_API_ │
│ app.py       │          │ IP=192.168.1 │
│              │          │ .50          │
│              │          │ npm start    │
└──────────────┘          └──────────────┘
                               │
                               │
                               ▼
                          Browser
                       (any machine)
                   http://192.168.1.100:3000
```

---

## 📱 Step-by-Step Setup

### For Local Development (Single Machine)

```
Step 1: Terminal 1 - Start Flask ML API
  cd ml_api
  python app.py
  ✓ Wait for: "Running on http://0.0.0.0:5000"

Step 2: Terminal 2 - Start Web Server
  npm start
  ✓ Wait for: "Server running on http://localhost:3000"

Step 3: Browser
  Open: http://localhost:3000
  ✓ Done!
```

### For Network Setup (Different Machines)

```
Step 1: Machine A (192.168.1.50) - Flask Server
  Terminal:
    cd ml_api
    python app.py
  ✓ Running on http://0.0.0.0:5000

Step 2: Machine B (192.168.1.100) - Web Server
  PowerShell:
    $env:ML_API_IP="192.168.1.50"
    npm start
  ✓ Server running on http://192.168.1.100:3000
  ✓ ML API: http://192.168.1.50:5000

Step 3: Any Device - Open Browser
  URL: http://192.168.1.100:3000
  ✓ Done!
```

---

## 🧪 Verify Everything Works

### Check 1: Flask is Running
```powershell
Invoke-WebRequest -Uri "http://192.168.1.50:5000"
```
Should show: ✓ StatusCode: 200

### Check 2: Website Loads
```
Open browser: http://192.168.1.100:3000
Should see: Smart Kidney Monitoring Dashboard
```

### Check 3: Configuration Loaded
```powershell
# In browser, press F12 → Console, then:
console.log(serverConfig.getMLApiURL())
```
Should show: http://192.168.1.50:5000

---

## 📋 Common IP Addresses

| Device | IP Pattern | Example |
|--------|-----------|---------|
| Your Computer | 192.168.1.x | 192.168.1.100 |
| Another Computer | 192.168.1.x | 192.168.1.50 |
| Server on Network | 192.168.x.x | 192.168.50.20 |
| Docker Container | Container Name | ml_api_service |
| Cloud Server | Cloud IP | 54.123.45.67 |

Find your IP:
```powershell
ipconfig
# Look for "IPv4 Address"
```

---

## ⚙️ Configuration Files

### What Gets Generated

**`public/config.json`** (auto-generated on server start):
```json
{
  "serverIP": "192.168.1.100",
  "serverPort": 3000,
  "mlApiIP": "192.168.1.50",
  "mlApiPort": 5000,
  "timestamp": "2025-12-26T10:30:00Z"
}
```

### What You Control

**Environment Variables** (set before `npm start`):
```powershell
$env:ML_API_IP="192.168.1.50"
$env:ML_API_PORT="5000"
$env:PORT="3000"
```

---

## 🚨 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Port already in use | Stop other process or use different port |
| ML API not found | Check IP is correct: `ipconfig` |
| Website loads but no predictions | Check Flask is running on correct port |
| Config not updating | Restart server and clear browser cache |
| Environment variables not working | Check `Get-ChildItem env:ML_API_IP` |

---

## 📞 Need Help?

### Quick Reference:
- **30 sec setup** → `QUICK_START.md`
- **Detailed guide** → `CONFIGURATION.md`
- **Technical details** → `ML_API_SETUP.md`
- **Implementation** → `IMPLEMENTATION_SUMMARY.md`

### Scripts:
- **PowerShell** → `start-server.ps1`
- **Batch** → `start-server.bat`

---

## ✅ Checklist Before Running

- [ ] Flask ML API running?
- [ ] Know your ML API IP address?
- [ ] Know your ML API port (usually 5000)?
- [ ] Node.js installed?
- [ ] npm dependencies installed?
- [ ] Port 3000 available?

### If All Checked:
```powershell
$env:ML_API_IP="YOUR_IP_HERE"
npm start
# Then open: http://localhost:3000
```

**Done!** 🎉

---

## 🎯 Remember

```
┌──────────────────────────────────────────────┐
│  Setting ONE environment variable is all     │
│  you need to configure the entire system!    │
│                                              │
│  $env:ML_API_IP="YOUR_IP"                    │
│  npm start                                   │
│                                              │
│  Website automatically handles the rest ✓   │
└──────────────────────────────────────────────┘
```

---

## 📊 Features Supported

✅ Local development (single machine)  
✅ Network setup (multiple machines)  
✅ Docker containers  
✅ Cloud deployments  
✅ Custom ports  
✅ Different IP addresses  
✅ Dynamic reconfiguration  

**Everything works with just an environment variable!** 🚀
