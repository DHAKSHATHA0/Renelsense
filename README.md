# Smart Kidney Disorder Monitoring System

A real-time kidney health monitoring application using ESP32 hardware, Machine Learning, and AI chatbot powered by Google Gemini.

## 🏗️ Project Structure

```
kidneydisorder/
├── public/                 # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── chatbot.html       # AI Chatbot interface
│   ├── result.html        # Test results display
│   ├── css/
│   ├── js/
│   └── config.json
├── ml_api/                # ML Model API (Flask)
│   ├── app.py
│   └── requirements.txt
├── tests/                 # Test files
│   ├── test-chatbot-api.js
│   ├── test-gemini-direct.js
│   └── ...
├── docs/                  # Documentation & sketches
│   ├── ESP32_WiFi_Sketch.ino
│   └── *.md files
├── scripts/               # Startup scripts
│   ├── start-server.bat
│   ├── start-server.ps1
│   └── start-website.bat
├── utils/                 # Utility modules
├── server.js              # Main Node.js server
├── package.json
├── .env                   # Configuration (API keys)
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Python 3.8+ (for ML API)
- Google Gemini API key
- ESP32 board (optional, for hardware)

### Installation

```bash
# Install Node.js dependencies
npm install

# Install ML API dependencies
cd ml_api
pip install -r requirements.txt
cd ..
```

### Configuration

Create a `.env` file with your API key:
```
GOOGLE_AI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Get your free API key from: https://makersuite.google.com/app/apikey

### Running the System

**On Windows (PowerShell):**
```powershell
.\scripts\start-server.ps1
```

**On Windows (CMD):**
```cmd
.\scripts\start-server.bat
```

**On Linux/Mac:**
```bash
node server.js
```

The server will start on `http://localhost:3000`

## 🤖 Features

- **Real-time Monitoring**: Live kidney health data from ESP32
- **AI Chatbot**: Chat with Gemini AI about kidney health
- **Machine Learning**: Predictive kidney function analysis
- **WebSocket Support**: Real-time updates and notifications
- **Responsive UI**: Works on desktop and mobile devices

## 🧪 Testing

Run tests from the `tests/` folder:

```bash
# Test Gemini API
node tests/test-gemini-direct.js

# Test Chatbot API
node tests/test-chatbot-api.js
```

## 📡 Hardware Setup

For ESP32 integration, see `docs/ESP32_WiFi_Sketch.ino`

## 📚 Documentation

Full documentation available in the `docs/` folder:
- System architecture
- API setup guides
- WiFi configuration
- Gemini AI integration

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chatbot` | Send message to AI |
| POST | `/api/sensor-data` | Receive ESP32 data |
| GET | `/` | Web interface |

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **AI**: Google Generative AI (Gemini)
- **ML**: Python, Flask
- **Hardware**: ESP32
- **Real-time**: WebSocket

## 📄 License

MIT

## 💡 Support

For issues or questions, check the documentation in `docs/` folder.
