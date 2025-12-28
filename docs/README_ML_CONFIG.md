# Smart Kidney Monitoring System - ML API Configuration

## ✅ Implementation Complete!

Your website has been successfully updated to work with ML model and hardware on **any IP address** without changing the UI or functionality.

---

## 🚀 How to Use

### Simplest Way (2 Lines):

```powershell
$env:ML_API_IP="192.168.1.50"    # Set your ML API IP
npm start                        # Start server
```

**Done!** The website will automatically route all ML API calls to `http://192.168.1.50:5000`

---

## 📋 Three Ways to Configure

### Option 1: Environment Variables (Recommended)
```powershell
$env:ML_API_IP="192.168.1.50"
$env:ML_API_PORT="5000"
npm start
```

### Option 2: Interactive Script (PowerShell)
```powershell
.\start-server.ps1
# Script will ask for ML API IP and port
```

### Option 3: Batch Script (Windows CMD)
```cmd
start-server.bat 192.168.1.50 5000 3000
```

---

## 📝 What Changed

### Modified Files:
- ✅ `server.js` - Reads ML API config from environment variables
- ✅ `public/js/main.js` - Added `getMLApiURL()` method
- ✅ `public/config.json` - Now includes `mlApiIP` and `mlApiPort`

### New Files Created:
- 📄 `CONFIGURATION.md` - Detailed setup guide
- 📄 `ML_API_SETUP.md` - Implementation details
- 📄 `QUICK_START.md` - Quick reference
- 📄 `start-server.ps1` - PowerShell configuration script
- 📄 `start-server.bat` - Batch configuration script
- 📄 `README_ML_CONFIG.md` - This file

---

## 🔧 Configuration Reference

### Environment Variables:

```powershell
# ML API IP Address (defaults to "localhost")
$env:ML_API_IP="192.168.1.50"

# ML API Port (defaults to 5000)
$env:ML_API_PORT="5000"

# Node.js Server Port (defaults to 3000)
$env:PORT="3000"
```

### Generated config.json:

```json
{
  "serverIP": "192.168.1.100",
  "serverPort": 3000,
  "mlApiIP": "192.168.1.50",
  "mlApiPort": 5000,
  "timestamp": "2025-12-26T10:30:00.000Z"
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│               Your Network                      │
└─────────────────────────────────────────────────┘

Browser (Any Device)
  │
  ├─ HTTP Request: http://192.168.1.100:3000
  │
  ▼
Node.js Server (192.168.1.100)
  │ Serves: HTML, CSS, JS, WebSocket
  │
  │ HTTP Request: http://192.168.1.50:5000/predict
  │ (configured via environment variables)
  │
  ▼
Flask ML API (192.168.1.50)
  │ Runs: ML Model
  │ Returns: Predictions
  │
  ▼
Browser (displays results)
```

---

## 📚 Usage Examples

### Example 1: Local Development
```powershell
# Everything on localhost
npm start
# Website: http://localhost:3000
# ML API: http://localhost:5000
```

### Example 2: ML on Different Machine
```powershell
# ML API Server: 192.168.1.50:5000
# Web Server: 192.168.1.100:3000

$env:ML_API_IP="192.168.1.50"
npm start

# Access from any browser: http://192.168.1.100:3000
```

### Example 3: Using Docker Containers
```powershell
# ML API container name: ml_api_service
$env:ML_API_IP="ml_api_service"
$env:ML_API_PORT="5000"
npm start
```

---

## ✨ What Works Without Changes

The website **automatically and transparently** handles ML API configuration:

✅ Real-time monitoring dashboard works as before  
✅ Live test page works as before  
✅ Results and reports display correctly  
✅ All charts and visualizations work  
✅ WebSocket real-time updates work  
✅ Test controls and buttons work  
✅ Navigation and layout unchanged  
✅ All animations and styling preserved  

**ZERO UI/UX changes - it just works!**

---

## 🧪 Testing

### Verify Configuration in Browser:

1. Open website: `http://192.168.1.100:3000`
2. Press `F12` → Console tab
3. Paste:
```javascript
console.log(serverConfig)
// Shows all configuration including mlApiIP and mlApiPort
```

### Test ML API Connectivity:

```powershell
# Check if ML API is accessible
Invoke-WebRequest -Uri "http://192.168.1.50:5000"

# Should return: {"status": "healthy", "service": "eGFR Prediction API"}
```

---

## 🆘 Troubleshooting

### Problem: "Cannot reach ML API"
```powershell
# Check Flask is running
netstat -ano | findstr :5000

# Check firewall
# Allow port 5000 in Windows Firewall

# Verify IP is correct
ipconfig  # Find your IP address
```

### Problem: Website loads but predictions fail
```powershell
# 1. Check browser console (F12)
# 2. Verify environment variables are set:
Get-ChildItem env:ML_API_IP
Get-ChildItem env:ML_API_PORT

# 3. Check Flask logs for errors
```

### Problem: config.json not updating
```powershell
# 1. Restart Node.js server
# 2. Clear browser cache (Ctrl+Shift+Del)
# 3. Check file manually: cat public/config.json
```

---

## 📖 Documentation Files

- **QUICK_START.md** - Get started in 30 seconds
- **CONFIGURATION.md** - Complete setup guide with examples
- **ML_API_SETUP.md** - Technical implementation details
- **start-server.ps1** - Interactive PowerShell script
- **start-server.bat** - Windows CMD batch script

---

## 🔐 Security Notes

The Flask ML API is configured with:
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

This allows connections from any IP on the network. For production:
- ✅ Keep debug=False
- ✅ Add authentication if needed
- ✅ Use HTTPS
- ✅ Restrict network access with firewall rules

---

## 🎯 Summary

Your website now:

1. ✅ **Reads ML API IP from environment variables**
   - No hardcoded addresses
   - Works on any network setup

2. ✅ **Automatically generates config.json**
   - Loads on server startup
   - Clients use it automatically

3. ✅ **Routes API calls correctly**
   - Uses `serverConfig.getMLApiURL()`
   - Works on any configured address

4. ✅ **Maintains all functionality**
   - No UI changes
   - No behavior changes
   - Same user experience

**Just set the environment variable and run - it handles the rest!** 🚀

---

## 📞 Need Help?

1. Read **QUICK_START.md** for 30-second setup
2. Check **CONFIGURATION.md** for detailed guide
3. Run **start-server.ps1** for interactive setup
4. Review **ML_API_SETUP.md** for technical details

---

## ✅ Verification Checklist

- [ ] Flask ML API running and accessible
- [ ] Environment variables set (if needed)
- [ ] Node.js server started with `npm start`
- [ ] Website loads at http://localhost:3000
- [ ] Browser console shows correct ML API URL
- [ ] Flask responds to test request
- [ ] Website can communicate with Flask

**You're all set!** 🎉
