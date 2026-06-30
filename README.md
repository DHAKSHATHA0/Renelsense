# 🩺 RenalSense - Smart Kidney Monitoring System

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/DHAKSHATHA0/Renelsense)

## 🌟 Overview

RenalSense is an intelligent kidney health monitoring system that combines real-time biometric data collection, machine learning predictions, and AI-powered health guidance. The system helps users track kidney function through eGFR calculations and provides personalized health recommendations.

## ✨ Features

- **📊 Real-time Monitoring**: WebSocket-based live data streaming
- **🤖 AI Health Assistant**: Gemini-powered chatbot for health guidance
- **📈 ML Predictions**: eGFR calculations and kidney function assessment
- **👤 User Management**: Complete authentication and profile system
- **💾 Data Storage**: JSON-based database with PostgreSQL support
- **📱 Responsive UI**: Mobile-friendly web interface
- **🔔 Health Alerts**: Automated notifications for concerning values

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ↔ Node.js Backend ↔ Database
                     ↕
            WebSocket Server ↔ ML Engine
                     ↕
              Gemini AI API ↔ Chatbot
```

## 🚀 Quick Deploy on Railway

### Method 1: One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/DHAKSHATHA0/Renelsense)

### Method 2: Manual Deploy
1. **Fork this repository**
2. **Connect to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```
3. **Add Environment Variables** in Railway Dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   ```

## 🛠️ Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup
```bash
# Clone repository
git clone https://github.com/DHAKSHATHA0/Renelsense.git
cd Renelsense

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Access Points
- **Web App**: http://localhost:3000
- **WebSocket**: ws://localhost:3000
- **API Docs**: http://localhost:3000/api

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Health Data
- `POST /api/tests/save` - Save test results
- `GET /api/tests/user/:userId` - Get user's test history
- `GET /api/dashboard/:userId` - User dashboard data

### AI & ML
- `POST /api/chatbot` - AI health assistant
- `POST /api/predict` - ML kidney function prediction
- `POST /api/sensor-data` - Real-time sensor data input

### System
- `GET /api/statistics` - System statistics
- `GET /api/cache-stats` - API cache performance

## 🤖 AI Features

### Gemini-Powered Chatbot
- Natural language health consultations
- Personalized advice based on test results
- Conversation memory and context awareness
- Response caching for improved performance

### ML Predictions
- eGFR calculation from biometric data
- Risk assessment and staging
- Automated health recommendations
- Integration with real-time sensor data

## 💾 Database Schema

### Users
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "passwordHash": "string",
  "phone": "string",
  "createdAt": "datetime"
}
```

### Medical Tests
```json
{
  "testId": "uuid",
  "userId": "uuid",
  "testType": "string",
  "testData": "object",
  "results": {
    "eGFR": "number",
    "stage": "string",
    "riskLevel": "string"
  },
  "timestamp": "datetime"
}
```

## 🔧 Environment Configuration

### Required Variables
```bash
NODE_ENV=production
PORT=3000
```

### Optional Variables
```bash
# Database (Railway provides DATABASE_URL automatically)
DATABASE_URL=postgresql://...

# AI Enhancement
GOOGLE_AI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash

# ML Service
ML_API_IP=127.0.0.1
ML_API_PORT=5000
```

## 🌐 WebSocket Events

### Client → Server
```javascript
// Start monitoring
{ type: 'start_test' }

// Stop monitoring  
{ type: 'stop_test' }

// Ping for connectivity
{ type: 'ping' }
```

### Server → Client
```javascript
// Real-time sensor data
{ type: 'sensor_update', payload: {...} }

// Test progress
{ type: 'test_progress', payload: {...} }

// ML prediction results
{ type: 'prediction_result', payload: {...} }

// Test completion
{ type: 'test_completed', payload: {...} }
```

## 🚨 Health & Monitoring

### Application Health
- Built-in health checks
- Error handling and recovery
- Performance monitoring
- Cache optimization

### Data Validation
- Input sanitization
- Type checking
- Range validation for health metrics
- SQL injection prevention

## 🔐 Security Features

- Password hashing (bcrypt)
- Input validation
- CORS protection
- Environment variable protection
- Session management

## 📊 Performance Optimization

### Caching System
- API response caching (70% quota savings)
- Conversation memory management
- Automatic cache cleanup
- Performance statistics tracking

### Resource Management
- Connection pooling
- Memory optimization
- Graceful shutdown handling
- Error recovery mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the Healthcare Innovation Team

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **API Documentation**: [Coming Soon]
- **Health Guidelines**: [WHO Kidney Disease Guidelines](https://www.who.int/news-room/fact-sheets/detail/chronic-kidney-disease)

## 🏥 Medical Disclaimer

This application is for educational and monitoring purposes only. Always consult with healthcare professionals for medical advice. This tool does not replace professional medical diagnosis or treatment.

---

**Ready to deploy?** Click the Railway button above or follow the deployment guide!