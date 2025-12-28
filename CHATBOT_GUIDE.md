# 🤖 Chatbot Quick Guide

## How to Use the Kidney Health AI Chatbot

### Step 1: Start the Server

**Windows (PowerShell):**
```powershell
.\scripts\start-server.ps1
```

**Windows (CMD):**
```cmd
.\scripts\start-server.bat
```

**Linux/Mac:**
```bash
node server.js
```

You should see:
```
✅ Server fully initialized and running!
Server running on http://172.31.98.113:3000
```

### Step 2: Open the Chatbot

Open your browser and go to:
```
http://localhost:3000/chatbot.html
```

### Step 3: Start Chatting!

The chatbot is now powered by **Google Gemini AI** and can:

#### 👋 Greeting Test
**You:** "Hello! How are you?"
**Chatbot:** "Hi there! I'm doing great, thank you for asking! I'm here to help you with any questions about kidney health and wellness. How can I assist you today?"

#### 🏥 Health Advice
**You:** "How should I take care of my kidneys?"
**Chatbot:** "Great question! Here are some essential kidney care tips:
- Stay hydrated by drinking adequate water
- Limit salt intake to control blood pressure
- Eat a balanced diet with moderate protein
- Exercise regularly
- Avoid excessive alcohol and smoking
- Monitor your blood pressure regularly
- Get regular kidney function tests (eGFR)
- Take prescribed medications as directed"

#### 🪨 Disease Inquiry
**You:** "What is a kidney stone and how do I cure it?"
**Chatbot:** "A kidney stone is a hard deposit of mineral salts that forms in the kidney...
Tips to manage and prevent kidney stones:
1. Increase water intake (2-3 liters per day)
2. Reduce sodium intake
3. Limit certain foods (oxalate-rich foods)
4. Take prescribed medications
5. Consult a doctor for professional treatment options"

#### 📊 Based on Your Test Results
The chatbot also considers your test results:
- **eGFR Level** - kidney function status
- **Risk Level** - low, medium, or high
- **Heart Rate** - overall health
- **Temperature** - current condition

It will give **personalized advice** based on your kidney stage!

## ✨ Features

✅ **Real-time AI Responses** - Powered by Google Gemini  
✅ **Personalized Advice** - Based on your test results  
✅ **Natural Conversation** - Talk naturally, not keyword-based  
✅ **Health Tips** - Diet, exercise, medication advice  
✅ **Medical Guidance** - When to see a doctor  
✅ **24/7 Available** - Anytime, anywhere  

## 🔧 Technical Details

### How It Works

1. **Frontend** (`public/js/chatbot.js`)
   - Captures user message
   - Sends to backend API
   - Displays AI response in real-time

2. **Backend** (`server.js`)
   - Receives message from chatbot
   - Builds context with patient data
   - Calls Google Gemini API
   - Returns AI response

3. **Gemini AI** (Google's Model)
   - Process natural language
   - Generate personalized responses
   - Provide health recommendations

### API Endpoint

```
POST /api/chatbot
```

**Request:**
```json
{
  "message": "How do I keep my kidneys healthy?",
  "patientResults": {
    "eGFR": 75,
    "status": "Normal Function",
    "riskLevel": "Low",
    "confidence": 95,
    "heartRate": 72,
    "temperature": 36.8
  },
  "conversationHistory": [],
  "sessionId": "unique_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Here are tips to keep your kidneys healthy..."
}
```

## 🚀 Testing the Chatbot

### Test via Node.js Script
```bash
node tests/test-chatbot-api.js
```

### Test via Command Line (PowerShell)
```powershell
$body = @{
  message="What is kidney disease?"
  patientResults=@{eGFR=75;status="Normal Function";riskLevel="Low"}
  conversationHistory=@()
  sessionId="test_123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/chatbot" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## 🎯 Example Conversations

### Conversation 1: Daily Care
```
User: What should I eat for kidney health?
Chatbot: For kidney health, consider a diet that includes:
- Lean proteins (chicken, fish)
- Fresh vegetables (especially greens)
- Limited sodium (less than 2,300mg daily)
- Moderate potassium (bananas, oranges)
- Low phosphorus foods
- Plenty of water

Specific recommendations based on your eGFR of 75:
Your kidney function is normal, so focus on prevention...
```

### Conversation 2: Problem Diagnosis
```
User: I have back pain, could it be kidney related?
Chatbot: Back pain can have various causes, including kidney issues. However, I cannot provide medical diagnosis. Please see a doctor immediately if you have:
- Severe or persistent back pain
- Pain with fever
- Blood in urine
- Difficulty urinating

Your current test shows normal kidney function...
```

### Conversation 3: Medications
```
User: Can I take over-the-counter pain relievers?
Chatbot: Before taking any over-the-counter medications, consult your doctor because:
- Some pain relievers can affect kidney function
- Your current kidney function is normal, but precautions are still important
- Recommended safer options...
```

## ⚙️ Troubleshooting

### Server not starting?
```bash
# Make sure port 3000 is available
# Kill any process on port 3000
Get-Process | Where-Object {$_.Port -eq 3000} | Stop-Process
```

### Chatbot not responding?
1. Check server is running
2. Verify API key in `.env`
3. Test with: `node tests/test-gemini-direct.js`

### Getting keyword-based responses?
- Server is using fallback local AI
- Check `.env` has correct API key
- Run: `node tests/test-gemini-diagnostic.js`

## 📞 Support

For issues:
1. Check `docs/GEMINI_API_SETUP.md`
2. Check `.env` configuration
3. Run diagnostic tests in `tests/` folder
4. Check server logs for errors

## 🔐 Security Notes

- API key is stored in `.env` (never commit to git)
- Patient data is NOT stored permanently
- All conversations are processed server-side
- WebSocket connections are encrypted

---

**Enjoy your AI-powered kidney health chatbot! 🎉**
