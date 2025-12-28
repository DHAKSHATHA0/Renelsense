# 🤖 How to Enable Gemini AI for Your Chatbot

## ✅ What's Fixed

Your project now has everything needed for **dynamic Gemini AI responses**:
- ✅ `node-fetch` module installed (for API calls)
- ✅ `dotenv` module installed (for loading API key)
- ✅ `.env` file created (for storing API key)
- ✅ `server.js` updated (to load .env file)

---

## 🔑 Step 1: Get Your Gemini API Key

1. Go to: **https://makersuite.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the key (looks like: `AIzaSy...something...`)

---

## 📝 Step 2: Add Your API Key to `.env` File

The `.env` file is already created in your project folder at:
```
C:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder\.env
```

**Open the `.env` file and replace the placeholder:**

**BEFORE:**
```
GOOGLE_AI_API_KEY=AIzaSy_YOUR_API_KEY_HERE
```

**AFTER (with your actual key):**
```
GOOGLE_AI_API_KEY=AIzaSyDjjFuRNH1xWAkFq8sLu6eE_your_actual_key_here
```

Just paste your key after `AIzaSy` and save!

---

## 🚀 Step 3: Start the Server

Open PowerShell and run:

```powershell
cd "c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder"
node server.js
```

You should see:
```
Server running on http://172.31.98.113:3000
WebSocket server running on ws://172.31.98.113:3000
```

---

## 🧪 Step 4: Test the Chatbot

1. Open browser: `http://localhost:3000/chatbot.html`
2. Type a message: "What should I eat?"
3. Send it
4. **You should see dynamic Gemini AI responses!** 🎉

---

## ✨ What You'll See

**Server Console:**
```
[Chatbot] Session: chat_123, Message: What should I eat?
📡 Calling Gemini API (gemini-pro)...
✓ Gemini API Response Successful
```

**Chatbot Response:**
```
Natural, conversational kidney health advice 
based on YOUR specific test results, with:
- Personalized recommendations
- Formatted text (bold, lists, etc)
- Context-aware responses
```

---

## 🔧 Troubleshooting

### Issue: Still getting template responses?
- **Check:** Did you paste your API key in the `.env` file?
- **Check:** Did you save the `.env` file?
- **Check:** Is the server running? (Look for "Server running...")

### Issue: "Cannot find module" error?
- Already fixed! We installed `node-fetch` and `dotenv`

### Issue: API returns 401 or 403 error?
- Your API key is invalid or expired
- Get a new one from: https://makersuite.google.com/app/apikey

### Issue: No response at all?
- Press F12 in browser to open console
- Check what error messages appear
- Look at the server terminal for error details

---

## 📋 Quick Checklist

- [ ] Got API key from Google
- [ ] Pasted API key in `.env` file
- [ ] Saved `.env` file
- [ ] Started server: `node server.js`
- [ ] Server shows: "Server running on..."
- [ ] Opened chatbot: `http://localhost:3000/chatbot.html`
- [ ] Sent test message
- [ ] Got dynamic Gemini response!

---

## 🎯 File Locations

- **`.env` file** (your API key goes here): `c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder\.env`
- **Server file** (loads .env): `c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder\server.js`
- **Chatbot page**: `http://localhost:3000/chatbot.html`

---

## 💡 Pro Tips

1. **Keep your API key secret** - Don't share it with anyone
2. **Don't commit `.env` to git** - It's already in `.gitignore`
3. **You can change models** - Edit `.env` to try different Gemini versions:
   - `gemini-pro` (faster, good quality)
   - `gemini-1.5-flash` (fastest)
   - `gemini-1.5-pro` (best quality, slower)

---

**Ready? Add your API key to the `.env` file and restart the server!** 🚀
