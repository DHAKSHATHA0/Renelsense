# 🚀 Gemini + Voice Chatbot - Quick Start

## ⚡ 30-Second Setup

### 1. Get API Key
Visit: https://aistudio.google.com → Copy key

### 2. Set Environment Variable (Windows PowerShell)
```powershell
$env:GOOGLE_AI_API_KEY = "your-api-key-here"
```

### 3. Start Server
```powershell
npm start
```

### 4. Open Browser
```
http://localhost:3000
```

### 5. Test Chatbot
- Click "Live Test" → Wait for completion
- Click "View Results" → Click "🤖 Health Tips Chatbot"
- Ask: "What should I eat?" 💬

---

## 🎤 Voice Features

### Talk to Bot
1. Click **🎤 Microphone button**
2. **Speak clearly**: "What about exercise?"
3. Text auto-fills
4. Click Send ✈️

### Listen to Responses
- Check **☑️ Play voice responses**
- Bot will speak answers 🔊
- Adjust volume in browser

---

## ✨ Features Enabled

| Feature | Status | Icon |
|---------|--------|------|
| Google Gemini AI | ✅ | 🧠 |
| Voice Input | ✅ | 🎤 |
| Voice Output | ✅ | 🔊 |
| Personalization | ✅ | 👤 |
| Safety Filters | ✅ | 🔒 |

---

## 🎯 Try These Questions

**Diet:**
- "What foods are safe for me?"
- "Can I eat bananas?"
- "What's a kidney-friendly meal?"

**Exercise:**
- "Can I exercise regularly?"
- "What activities are safe?"
- "How long should I exercise?"

**Testing:**
- "How often should I get tested?"
- "What does eGFR mean?"
- "When should I see a doctor?"

**General:**
- "What should I avoid?"
- "How can I improve my kidney health?"
- "What medications interact with kidneys?"

---

## 🐛 If It Doesn't Work

### Voice Input Not Working?
- ✓ Using Chrome or Edge? (Firefox limited)
- ✓ Granted microphone permission?
- ✓ Using HTTPS or localhost?

### No Voice Output?
- ✓ Checkbox "Play voice responses" enabled?
- ✓ System audio working?
- ✓ Browser volume not muted?

### Gemini API Not Responding?
- ✓ API key set correctly?
- ✓ Key is for Generative Language API?
- ✓ Not exceeded 60 requests/minute?

### Generic Responses?
- ✓ Patient data loaded (check header)?
- ✓ Asked about kidney-specific topics?
- ✓ Provided details about your condition?

---

## 💡 Pro Tips

✨ **Multi-turn Conversations** - Ask follow-up questions, bot remembers context

🎯 **Be Specific** - "Diet for kidney stage 3" better than "Tell me about food"

🔊 **Read Along** - Enable voice and read responses for better learning

📱 **Mobile Friendly** - Works on phone (voice input works best on Android)

💾 **Chat History** - "Clear Chat" button resets conversation

---

## 📊 What Gets Personalized

- **Diet advice** - Based on kidney stage (Stage 1-5)
- **Exercise level** - Intensity changes per stage
- **Medication info** - Adjusted for kidney function
- **Monitoring frequency** - Stricter for advanced CKD

---

## 🔗 Links

- [Full Setup Guide](GEMINI_VOICE_SETUP.md)
- [Chatbot Index](CHATBOT_INDEX.md)
- [System Architecture](CHATBOT_ARCHITECTURE.md)

---

**That's it! Start chatting! 🤖💬**

Version: 1.0 | Status: ✅ Ready
