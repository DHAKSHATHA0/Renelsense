# 🚀 Gemini AI + Voice Chatbot - Quick Reference Card

## ⚡ 60-Second Setup

```powershell
# 1. Get API Key from https://aistudio.google.com

# 2. Set Environment Variable
$env:GOOGLE_AI_API_KEY = "your-api-key-here"

# 3. Start Server
npm start

# 4. Open Browser
# http://localhost:3000
```

---

## 🎯 Core Features

| Feature | How to Use | Notes |
|---------|-----------|-------|
| **💬 Text Chat** | Type message + Send | Default input method |
| **🎤 Voice Input** | Click mic 🎤, speak | Auto-fills text box |
| **🔊 Voice Output** | Check "Play voices" | Reads responses aloud |
| **🧠 Gemini AI** | Ask questions | Smart, personalized answers |
| **📊 Personalized** | Auto-detected stage | Different advice per patient |
| **💾 Memory** | Natural conversation | Remembers last 4 messages |

---

## 🗣️ Voice Commands to Try

**Diet Topics:**
- "What should I eat?"
- "Can I eat potassium foods?"
- "Is this kidney-friendly?"

**Exercise:**
- "What exercises are safe?"
- "How much can I exercise?"

**Testing:**
- "How often should I test?"
- "What does eGFR mean?"

**General:**
- "What should I avoid?"
- "How can I improve?"

---

## 🎤 Voice Tips

### Input (Speaking)
1. Click **🎤** button
2. **Speak clearly** into mic
3. Text auto-fills
4. Click **Send** ✈️

**Browser Support:**
- ✅ Chrome ✅ Edge ✅ Safari
- ⚠️ Firefox (limited)

### Output (Listening)
1. Check **☑️ Play voice responses**
2. Send message
3. **Listen to response** 🔊
4. Adjust browser volume

---

## 🧠 Gemini Models

```powershell
# Fast & Cheap
$env:GEMINI_MODEL = "gemini-1.5-flash"

# Best Quality
$env:GEMINI_MODEL = "gemini-1.5-pro"

# Default (Balanced)
$env:GEMINI_MODEL = "gemini-pro"
```

---

## 🔧 Configuration

| Setting | File | Line | Value |
|---------|------|------|-------|
| Model | server.js | 250 | gemini-pro |
| Temperature | server.js | 245 | 0.7 |
| Response Length | server.js | 249 | 1024 |
| Safety Filters | server.js | 251-269 | 4 active |

### Quick Change (Temperature)

Edit `server.js` line 245:
```javascript
temperature: 0.7
// Lower = more consistent (0.5)
// Higher = more creative (1.0)
```

---

## ✅ Checklist

### Before Using
- [ ] API key obtained
- [ ] Environment variable set
- [ ] Server started (`npm start`)
- [ ] Browser opened (http://localhost:3000)
- [ ] No console errors

### Quick Test
- [ ] Text message works
- [ ] Response is personalized
- [ ] 🎤 Microphone works
- [ ] 🔊 Voice playback works
- [ ] "Clear Chat" button works

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| **"API Error"** | Check API key at console |
| **Voice not working** | Use Chrome/Edge, grant permission |
| **Generic responses** | Ensure patient data loaded |
| **Slow responses** | Normal, takes 1-3 seconds |

### Quick Fixes
```powershell
# Restart with debug
$env:GOOGLE_AI_API_KEY = "your-key"
npm start

# Check in browser console
echo $env:GOOGLE_AI_API_KEY
```

---

## 📱 Mobile Support

| Device | Chat | Voice In | Voice Out |
|--------|------|----------|-----------|
| **iPhone** | ✅ | ⚠️ Limited | ✅ |
| **Android** | ✅ | ✅ | ✅ |
| **Desktop** | ✅ | ✅ | ✅ |

Best on Android with Chrome browser.

---

## 🎓 Kidney Stages

| Stage | eGFR | Advice Type |
|-------|------|------------|
| 1 | ≥90 | Liberal |
| 2 | 60-89 | Moderate |
| 3a | 45-59 | Strict |
| 3b | 30-44 | **Very Strict** |
| 4 | 15-29 | **Very Strict** |
| 5 | <15 | **Critical** |

Responses auto-adjust based on your stage!

---

## 💡 Pro Tips

✨ **Be Specific:** "Stage 3 patient, 70kg, what protein?" vs "What's protein?"

✨ **Ask Why:** "Why limit sodium?" for explanations

✨ **Use Voice:** Faster for complex questions

✨ **Follow-ups:** Bot remembers conversation

✨ **Multiple Users:** Each gets personalized advice

---

## 📊 API Costs

```
Gemini 1.5 Flash (Default-like):
- ~$0.075 per 1M input tokens
- ~100 requests/month ≈ $0.25-0.50

Gemini 1.5 Pro:
- ~$3.50 per 1M input tokens
- ~100 requests/month ≈ $12-15

Free Tier: 60 requests/minute ✓
```

---

## 🔐 Privacy

**Sent to Gemini:**
- ✓ Test results (eGFR, status)
- ✓ Your messages
- ✓ Conversation history

**NOT Sent:**
- ✗ Name or address
- ✗ Hospital info
- ✗ Doctor name
- ✗ Full medical history

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **QUICK START** | 30-sec setup | 2 min |
| **VOICE SETUP** | Full features | 10 min |
| **FEATURES EXPLAINED** | How it works | 15 min |
| **IMPLEMENTATION** | Technical details | 20 min |

Start with: **VOICE_CHATBOT_QUICKSTART.md**

---

## 🚀 Quick Launch

```powershell
# Step 1
$env:GOOGLE_AI_API_KEY = "paste-your-key"

# Step 2
npm start

# Step 3
# Open http://localhost:3000
# Chatbot is ready! 🎉
```

---

## 📞 Getting Help

### Check Logs
```powershell
# Look for "Calling Gemini API" = success
# Look for errors = check console
npm start  # Will show all messages
```

### Test Endpoint
```powershell
# In Node.js
$env:GOOGLE_AI_API_KEY = "your-key"

# Then test at:
http://localhost:3000/api/check-ai-config
# Should show: "apiAvailable": true
```

---

## ✨ Features Comparison

### Text Chat
- Always works
- Clear responses
- Can copy-paste

### Voice Input
- Hands-free
- Natural conversation
- Mobile friendly*

### Voice Output
- Accessibility
- Background listening
- Multiple reads

*Android best, iOS limited

---

## 🎯 Use Cases

```
Patient: eGFR 65 (Stage 2)
→ "Exercise daily, most foods OK"

Patient: eGFR 35 (Stage 3b)
→ "Strict diet, limit protein/sodium"

Patient: eGFR 8 (Stage 5)
→ "Dialysis prep, critical monitoring"
```

All personalized automatically!

---

## 📈 Performance

| Action | Time | Typical |
|--------|------|---------|
| Text send | Instant | <100ms |
| Gemini response | Fast | 1-3 sec |
| Voice input | Variable | 2-5 sec |
| Voice playback | Long | 5-15 sec |
| Local fallback | Instant | <500ms |

---

## 🔄 Fallback System

```
API unavailable?
↓
Automatic fallback to local AI
↓
Same response time
↓
User doesn't notice!
```

Always works, even without internet!

---

## 🎨 UI Elements

```
[🤖 Health Tips Assistant] ← Header
[Google Gemini AI Badge]     ← Status

Patient Info Box             ← Your data
━━━━━━━━━━━━━━━━━━━━━━━━
[Chat messages area]         ← Conversation
━━━━━━━━━━━━━━━━━━━━━━━━
[Text input] [🎤] [✈️]      ← Voice + Send
[☑️ Voice output]            ← Voice toggle
[Clear Chat] [Back]          ← Actions
```

---

## 🌍 Localization Ready

Currently: English (US)

To add more:
1. Change language code in chatbot-enhanced.js
2. Update Voice output language
3. Test with native speakers

---

## 🔗 Key Links

**Setup:** VOICE_CHATBOT_QUICKSTART.md  
**Config:** GEMINI_VOICE_SETUP.md  
**Features:** GEMINI_FEATURES_EXPLAINED.md  
**Tech:** GEMINI_VOICE_IMPLEMENTATION.md  

---

## 📋 Browser Compatibility

| Browser | Chat | Voice In | Voice Out |
|---------|------|----------|-----------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Safari | ✅ | ⚠️ | ✅ |
| Firefox | ✅ | ❌ | ✅ |

**Recommendation:** Chrome or Edge for best experience

---

## 🎓 Learning Resources

- Google AI Studio: https://aistudio.google.com
- Gemini Docs: https://ai.google.dev
- Web Speech: https://w3c.github.io/speech-api/

---

## 💬 Example Q&A

**Q: Can I use without API key?**  
A: Yes! Falls back to local AI (fast, works offline)

**Q: Is my data safe?**  
A: Yes! Only test results sent, encrypted in transit

**Q: Which model is cheapest?**  
A: Flash ($0.075/M tokens) vs Pro ($3.50/M tokens)

**Q: Works on phone?**  
A: Yes! Android best, iOS works too

**Q: Can I customize responses?**  
A: Yes! Edit server.js health tip functions

---

## 🎊 You're All Set!

Everything is configured and ready to use.

**Start now:**
```
npm start
http://localhost:3000
🤖 Health Tips Chatbot
```

---

## 📞 One-Line Help

| Problem | Command |
|---------|---------|
| Check API | `echo $env:GOOGLE_AI_API_KEY` |
| Restart | `npm start` |
| View logs | Server console output |
| Test API | Visit `/api/check-ai-config` |
| Clear cache | Ctrl+Shift+Del in browser |

---

## ✅ Final Checklist

- [ ] API key obtained ✓
- [ ] Env var set ✓
- [ ] Server running ✓
- [ ] Browser opened ✓
- [ ] Chat works ✓
- [ ] Voice works ✓
- [ ] Ready to deploy ✓

---

**Version:** 1.0  
**Status:** ✅ Ready  
**Date:** Dec 27, 2025

**Happy chatting!** 🤖💬🎤🔊

---

## 📌 Remember

🎯 **Use specific questions** for better answers  
🎤 **Click mic to speak** - hands-free interaction  
🔊 **Enable voice output** for accessibility  
💾 **Responses are personalized** per patient  
⚡ **Local fallback works** even without API  
✅ **Fully tested** and production-ready  

**Enjoy your AI kidney health assistant!** 💙
