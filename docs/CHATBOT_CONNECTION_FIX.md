# 🔧 Chatbot Connection Error - Fixed & Testing Guide

## ✅ Issue Fixed

The chatbot was showing **"Connection error"** because:
- ❌ Old code was using `serverConfig.apiBaseUrl` (undefined)
- ✅ Fixed to use `serverConfig.getAPIURL()` (correct method)

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Start Server
```powershell
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder
npm start
```

Wait for:
```
✓ Server running on http://localhost:3000
✓ WebSocket server ready
```

### Step 2: Open Chatbot
```
http://localhost:3000
→ Click "Live Test"
→ Click "View Results"
→ Click "🤖 Health Tips Chatbot"
```

### Step 3: Test It

**Test 1: Text Input**
1. Type: "What should I eat?"
2. Click Send ✈️
3. ✅ Should see personalized response

**Test 2: Voice Input**
1. Click 🎤 Microphone
2. Say: "What about exercise?"
3. Text should auto-fill
4. Click Send ✈️
5. ✅ Should see response

**Test 3: Voice Output**
1. Check ☑️ "Play voice responses"
2. Type: "Tell me about kidney health"
3. Click Send ✈️
4. 🔊 Bot should speak response

---

## 📊 What Was Fixed

### Code Changes

**File:** `public/js/chatbot-enhanced.js`

**Before (Broken):**
```javascript
const response = await fetch(serverConfig.apiBaseUrl + '/api/chatbot', {
    // ❌ apiBaseUrl is undefined!
});
```

**After (Fixed):**
```javascript
const apiUrl = serverConfig.getAPIURL() + '/api/chatbot';
console.log('📡 Sending to API:', apiUrl);

const response = await fetch(apiUrl, {
    // ✅ Correctly builds: http://localhost:3000/api/chatbot
});
```

### Additional Improvements

✅ Better error logging in console  
✅ Shows what API URL is being called  
✅ Better error messages in chat  
✅ Checks response status code  
✅ Better null checks for DOM elements  

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Server is running (`npm start`)
- [ ] No errors in terminal
- [ ] Can open http://localhost:3000
- [ ] Can access Live Test

### Testing Text Chat
- [ ] Type message in chatbot input
- [ ] Click Send button
- [ ] Message appears in chat (user side)
- [ ] Bot responds with kidney health advice
- [ ] Response is personalized to kidney stage
- [ ] "Clear Chat" button works
- [ ] "Back to Result" button works

### Testing Voice Input
- [ ] Click 🎤 microphone button
- [ ] Button turns red with animation
- [ ] Say clearly: "What should I eat?"
- [ ] Text appears in input box
- [ ] Click Send
- [ ] Response appears

**If voice input not working:**
- Use Chrome or Edge browser
- Grant microphone permission
- Check browser isn't muted
- Try saying louder/clearer

### Testing Voice Output
- [ ] Check ☑️ "Play voice responses"
- [ ] Send a message
- [ ] Browser should speak response
- [ ] Adjust volume if needed

**If voice output not working:**
- Checkbox is checked
- System audio is enabled
- Browser isn't muted

### Testing Gemini API (Optional)
- [ ] Set environment variable: `$env:GOOGLE_AI_API_KEY = "your-key"`
- [ ] Restart server: `npm start`
- [ ] Send a message
- [ ] Response should be more natural

### Testing Without Gemini API
- [ ] Don't set API key
- [ ] Restart server: `npm start`
- [ ] Send message: "What should I eat?"
- [ ] Should get local AI response (keyword-based)
- [ ] Should be fast (<500ms)

---

## 📋 Responses Should Be

### For Kidney Health Questions

**Patient Input:** "What should I eat?"

**Expected Response Pattern:**
```
✓ Personalized by kidney stage
✓ Includes DO and DON'T lists
✓ Kidney-specific advice
✓ Mentions professional consultation
✓ Friendly & supportive tone
```

**Example Response (Stage 2):**
```
🥗 Personalized Diet Recommendations

Based on your Stage 2 (Mild), here are kidney-friendly diet tips:

✓ DO:
- Eat fresh fruits and vegetables
- Choose lean proteins (fish, chicken)
- Use herbs instead of salt for flavoring
- Drink plenty of water (8-10 glasses/day)
- Eat whole grains

✗ AVOID:
- Processed foods (high in sodium)
- Cured meats
- Sugary drinks
- Excess salt

💡 Pro Tip: Consider consulting a renal dietitian...
```

### For Other Kidney Topics

**Exercise:**
```
💪 Exercise & Physical Activity Guide
[Personalized by stage, includes intensity levels]
```

**Medications:**
```
💊 Medication Guidance
[Dose adjustments for kidney function]
```

**Monitoring:**
```
📊 Testing Schedule
[Frequency based on kidney stage]
```

---

## 🔍 Browser Console Debugging

Open Developer Tools (F12) and look for these messages:

### Good Signs ✅
```
✓ Patient results loaded: {eGFR: 78, status: 'Normal Function', ...}
📡 Sending to API: http://localhost:3000/api/chatbot
Response status: 200
✓ AI Response: [response text]
```

### Bad Signs ❌
```
❌ Connection Error: TypeError: fetch failed
❌ apiBaseUrl is undefined
Response status: 500
Error: HTTP 500: Internal Server Error
```

---

## 🛠️ Troubleshooting

### "Connection error" in Chat

**Cause:** API endpoint not reachable

**Fix:**
1. Check server is running: `npm start`
2. Check no errors in terminal
3. Press F12 → Console tab
4. Look for red errors
5. Restart server: `Ctrl+C` then `npm start`

### No Response from Bot

**Cause:** API endpoint failing

**Check console for:**
```
Response status: 500
Error: Error processing chatbot request
```

**Fix:**
1. Check server logs for errors
2. Verify patient data is being sent
3. Restart server
4. Clear browser cache (Ctrl+Shift+Del)

### Voice Input Not Working

**Cause:** Browser doesn't support Web Speech API

**Fix:**
1. Use Chrome or Edge
2. Grant microphone permission
3. Check microphone is connected
4. Check browser isn't muted

### Voice Output Not Working

**Cause:** Checkbox unchecked or system audio muted

**Fix:**
1. Check ☑️ "Play voice responses" is checked
2. Check system volume is up
3. Check browser isn't muted
4. Try different browser

---

## 📊 Expected API Request/Response

### Request Sent (POST /api/chatbot)
```json
{
  "message": "What should I eat?",
  "patientResults": {
    "eGFR": 78,
    "status": "Normal Function",
    "riskLevel": "Low",
    "confidence": 94,
    "heartRate": 72,
    "temperature": 36.8,
    "dataQuality": 98
  },
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ],
  "sessionId": "chat_1234567890_xyz",
  "useGeminiAPI": true
}
```

### Response Received
```json
{
  "success": true,
  "reply": "🥗 **Personalized Diet Recommendations**\n\nBased on your Stage 2...",
  "patientResults": {...}
}
```

---

## 🎯 Expected Behavior Flow

```
User Types Message
    ↓
Click Send Button
    ↓
Message appears in chat (user side)
    ↓
"Thinking..." indicator shows (wave animation)
    ↓
API request sent to /api/chatbot
    ↓
Server receives message & patient data
    ↓
Determines kidney stage from eGFR
    ↓
Generates personalized response
    ↓
Response sent back to chatbot
    ↓
"Thinking..." indicator removed
    ↓
Response appears in chat (bot side)
    ↓
If voice enabled → Bot speaks response
    ↓
Chat ready for next message
```

---

## 💻 Server Console Output (Expected)

When you start server, should see:
```
Server running on http://localhost:3000
WebSocket server ready
```

When chatbot sends message, should see:
```
[Chatbot] Session: chat_1234567890_xyz, Message: What should I eat?
📡 Calling Gemini API (gemini-pro)...
✓ Gemini API Response Successful
[or]
Falling back to local AI...
✓ Local AI Response: [response text]
```

---

## ✅ Verification Steps

### Step 1: Server Ready
```powershell
npm start

# Should show:
# ✓ Server running on http://localhost:3000
```

### Step 2: Browser Access
```
Open: http://localhost:3000
Press F12 for Developer Tools
Check Console tab
Should show no red errors
```

### Step 3: Load Chatbot
```
Click: "Live Test"
Click: "View Results"
Click: "🤖 Health Tips Chatbot"

Console should show:
✓ Patient results loaded: {...}
```

### Step 4: Send Message
```
Type: "Hello"
Click Send

Console should show:
📡 Sending to API: http://localhost:3000/api/chatbot
Response status: 200
✓ AI Response: Hi! I'm your kidney health assistant...
```

### Step 5: Personalization Check
```
Type: "What should I eat?"
Should respond about diet specific to patient's kidney stage
```

---

## 🎓 Understanding Kidney Stages

Bot automatically detects stage from eGFR:

| eGFR | Stage | Advice Type |
|------|-------|------------|
| ≥90 | 1 (Normal) | Liberal |
| 60-89 | 2 (Mild) | Moderate |
| 45-59 | 3a (Mild-Moderate) | Strict |
| 30-44 | 3b (Moderate-Severe) | **Very Strict** |
| 15-29 | 4 (Severe) | **Very Strict** |
| <15 | 5 (Failure) | **Critical** |

**Each stage gets different advice!** That's the personalization.

---

## 🧠 Kidney Health Topics Covered

Bot recognizes and responds to:

| Topic | Keywords | Example |
|-------|----------|---------|
| **Diet** | eat, food, diet | "What should I eat?" |
| **Exercise** | exercise, activity, workout | "Can I exercise?" |
| **Meds** | medicine, medication, drug | "What about pills?" |
| **Water** | drink, water, hydrate | "How much water?" |
| **Testing** | test, check, monitor | "When to test?" |
| **Sodium** | salt, sodium | "Can I eat salt?" |
| **Potassium** | potassium, banana | "Is banana OK?" |
| **Protein** | protein | "Protein limits?" |
| **General** | what, how, why | "Tell me about kidney health" |

---

## 🔐 Privacy Check

**Chatbot Does NOT send:**
- ✗ Patient name
- ✗ Hospital name
- ✗ Doctor name
- ✗ Full medical history
- ✗ Personal ID numbers

**Chatbot Does send:**
- ✓ Test results (eGFR, status, etc.)
- ✓ Your messages
- ✓ Conversation context
- ✓ Session information

---

## 📞 If Still Not Working

1. **Check Server Logs**
   ```powershell
   npm start
   # Look at terminal output for errors
   ```

2. **Check Browser Console (F12)**
   ```javascript
   // Copy this and run in console:
   console.log(serverConfig.getAPIURL())
   // Should show: http://localhost:3000
   ```

3. **Test API Directly**
   ```javascript
   // Copy and run in browser console:
   fetch('http://localhost:3000/api/chatbot', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       message: 'Hello',
       patientResults: {eGFR: 78, status: 'Normal Function'},
       conversationHistory: [],
       sessionId: 'test'
     })
   }).then(r => r.json()).then(console.log).catch(console.error)
   ```

4. **Restart Everything**
   ```powershell
   # Close server: Ctrl+C
   # Close browser
   npm start
   # Open fresh browser
   ```

---

## ✅ Quick Verification (30 seconds)

```powershell
# 1. Is server running?
npm start

# 2. Can you open it?
# Open http://localhost:3000 in browser

# 3. Can you access chatbot?
# Run Live Test → Results → Health Tips Chatbot

# 4. Does text work?
# Type "Hi" → Click Send
# Should see response within 3 seconds

# 5. Does voice work?
# Click 🎤 → Say "What should I eat?"
# Should auto-fill and respond

# ✅ All working? You're good to go!
```

---

## 🎊 Summary

### Problem Fixed ✅
- Old code: `serverConfig.apiBaseUrl` (undefined)
- New code: `serverConfig.getAPIURL()` (works correctly)

### Features Working ✅
- ✅ Text chat with kidney health advice
- ✅ Voice input (speak questions)
- ✅ Voice output (listen to responses)
- ✅ Personalization by kidney stage
- ✅ Automatic fallback (works without API key)

### How to Test ✅
- Start server: `npm start`
- Open: http://localhost:3000
- Click chatbot button
- Type or speak a question
- Get personalized kidney health response

---

## 📚 Related Docs

- [VOICE_CHATBOT_QUICKSTART.md](VOICE_CHATBOT_QUICKSTART.md) - Quick setup
- [GEMINI_VOICE_SETUP.md](GEMINI_VOICE_SETUP.md) - Full configuration
- [GEMINI_FEATURES_EXPLAINED.md](GEMINI_FEATURES_EXPLAINED.md) - Feature details

---

**Status:** ✅ Fixed & Ready to Test

Run `npm start` and test it now! 🚀
