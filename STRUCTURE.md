# Project Structure Overview

## Clean Organized Structure ✅

```
kidneydisorder/
│
├── 📄 README.md                    # Main project documentation
├── 📄 package.json                 # Node.js dependencies
├── 📄 server.js                    # Main backend server
├── 📄 .env                         # API keys & configuration
├── 📄 .env.example                 # Example configuration
├── .gitignore
│
├── 📁 public/                      # Frontend web interface
│   ├── index.html                  # Home page
│   ├── chatbot.html                # AI Chatbot UI ⭐
│   ├── result.html                 # Test results display
│   ├── history.html                # Chat history
│   ├── report.html                 # Medical reports
│   ├── about.html                  # About page
│   ├── live-test.html              # Live testing interface
│   ├── wifi-setup.html             # WiFi configuration
│   ├── css/                        # Stylesheets
│   ├── js/                         # Frontend JavaScript
│   │   ├── chatbot.js              # Chatbot logic ⭐
│   │   ├── main.js                 # Main app logic
│   │   ├── result.js               # Result display
│   │   └── ... other scripts
│   ├── images/                     # Images & assets
│   └── config.json                 # Client configuration
│
├── 📁 ml_api/                      # Machine Learning API
│   ├── app.py                      # Flask ML server
│   └── requirements.txt            # Python dependencies
│
├── 📁 utils/                       # Utility functions
│   └── dataAggregator.js           # Data processing
│
├── 📁 scripts/                     # Startup scripts
│   ├── start-server.ps1            # PowerShell start script
│   ├── start-server.bat            # Windows CMD script
│   └── start-website.bat           # Website launcher
│
├── 📁 tests/                       # Test files
│   ├── test-chatbot-api.js         # Chatbot API tests
│   ├── test-gemini-direct.js       # Gemini API tests ⭐
│   ├── test-gemini-diagnostic.js   # API diagnostics
│   ├── test-server.js              # Server tests
│   ├── test-complete-flow.ps1      # Full flow test
│   └── ... other tests
│
├── 📁 docs/                        # Documentation
│   ├── ESP32_WiFi_Sketch.ino       # Arduino code for ESP32
│   ├── CHATBOT_ARCHITECTURE.md     # Chatbot architecture
│   ├── GEMINI_API_SETUP.md         # API setup guide ⭐
│   ├── SYSTEM_ARCHITECTURE.md      # System overview
│   ├── WIFI_SETUP.md               # WiFi configuration
│   └── ... many more docs
│
├── 📁 kidneydisorder/              # Alternative Vite project (unused)
│   ├── index.html
│   ├── package.json
│   ├── src/
│   └── public/
│
└── 📁 node_modules/                # Dependencies (ignored in git)
```

## Key Files & Folders

### ⭐ Essential Files for Chatbot
- `public/chatbot.html` - Chatbot interface
- `public/js/chatbot.js` - Frontend chatbot logic
- `server.js` - Backend that calls Gemini API
- `.env` - Configuration with API key

### 🤖 AI & ML
- **Gemini API**: Integrated in `server.js` (lines 308+)
- **ML Model**: Python Flask server in `ml_api/`
- **Test Gemini**: Run `node tests/test-gemini-direct.js`

### 📱 Frontend Pages
- Home: `public/index.html`
- Chatbot: `public/chatbot.html`
- Results: `public/result.html`
- History: `public/history.html`
- WiFi Setup: `public/wifi-setup.html`

### 🧪 Testing
All test files organized in `tests/` folder:
- API tests
- Chatbot tests
- Gemini API tests
- Network tests

### 📚 Documentation
All markdown docs in `docs/` folder:
- Architecture guides
- Setup instructions
- API documentation
- WiFi configuration

## Running the Project

### Start Server
```bash
# Using the start script
.\scripts\start-server.ps1

# Or directly
node server.js
```

### Access the Application
- Web Interface: `http://localhost:3000`
- Chatbot: `http://localhost:3000/chatbot.html`

### Test Gemini API
```bash
node tests/test-gemini-direct.js
```

### Test Chatbot
```bash
node tests/test-chatbot-api.js
```

## Configuration (.env)

```env
GOOGLE_AI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
SERVER_IP=localhost
SERVER_PORT=3000
ML_API_IP=localhost
ML_API_PORT=5000
```

## Dependencies

### Node.js Packages
- `express` - Web server
- `cors` - Cross-origin requests
- `ws` - WebSocket
- `node-fetch` - HTTP requests
- `dotenv` - Environment variables

### Python Packages
- `flask` - ML API server
- `scikit-learn` - Machine learning
- `pandas` - Data processing
- `numpy` - Numerical computing

## Project Status

✅ **Organized & Structured**
- Tests moved to `/tests`
- Docs moved to `/docs`
- Scripts moved to `/scripts`
- Root folder cleaned up
- README created

✅ **Fully Functional**
- Gemini API integrated
- Chatbot working
- Server running
- WebSocket enabled

## Next Steps

1. Deploy to production
2. Configure ESP32 hardware
3. Set up ML model training
4. Integrate with medical database
5. Add authentication system
