# Chatbot Quick Start Guide

## 🚀 Start Using the Chatbot in 3 Steps

### Step 1: Start the Server
```bash
npm start
```

### Step 2: Open Website
```
http://localhost:3000
```

### Step 3: Run Test → Open Chatbot
1. Click **"Live Test"** button
2. Click **"Start Test"**
3. Wait for completion
4. Click **"View Results"**
5. Click **"Health Tips Chatbot"** button 🤖
6. Start chatting!

---

## 💬 What to Ask the Chatbot

### Quick Questions to Try:

**Diet & Food:**
- "What foods should I eat?"
- "What should I avoid?"
- "Is salt bad for me?"
- "Can I eat bananas?"

**Exercise:**
- "What exercises can I do?"
- "How much should I exercise?"
- "Is running safe?"

**Medications:**
- "Should I take medicine?"
- "Are there side effects I should know?"
- "What about pain medication?"

**Testing:**
- "How often should I get tested?"
- "What tests do I need?"
- "What do my test results mean?"

**General:**
- "What are kidney health tips?"
- "How can I stay healthy?"
- "What should I monitor?"

---

## 🎨 Chatbot Features

### Suggested Prompts
- Click any button to start: **Diet Tips**, **Exercise Guide**, **Test Schedule**, **Things to Avoid**

### Patient Info Display
- Shows your eGFR
- Shows kidney status
- Shows risk level
- Shows confidence score

### Chat Actions
- **Clear Chat** - Start fresh
- **Back to Result** - Return to results page

---

## ✨ How It Works

The chatbot:
✅ Reads your test results automatically  
✅ Understands your kidney stage  
✅ Gives personalized advice just for you  
✅ Remembers your questions in the chat  
✅ Never runs out of answers!

---

## 📱 Mobile Friendly

Works perfectly on:
- ✅ Desktop
- ✅ Tablet
- ✅ Phone

---

## ❓ Chatbot Topics

| Topic | Example Questions |
|-------|-------------------|
| **Diet** | What to eat, foods to avoid, salt intake |
| **Exercise** | Safe activities, intensity, frequency |
| **Medications** | Which ones are safe, precautions |
| **Hydration** | How much to drink, fluid limits |
| **Testing** | How often, what tests, results |
| **Potassium** | Which foods, restrictions |
| **Sodium** | Reducing salt, hidden sources |
| **Protein** | How much, which sources |
| **Health Tips** | Overall kidney care, prevention |

---

## 🔧 Customize (Optional)

### Change Chatbot Colors
Edit colors in `public/chatbot.html` to match your branding

### Add Hospital Logo
Replace chatbot icon with hospital logo in navbar

### Customize Advice
Edit health tips in `server.js`

---

## 🆘 If Something Doesn't Work

### Chatbot shows error?
1. Refresh page
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart server (Ctrl+C, then npm start)

### Responses not showing?
1. Check browser console (F12 → Console)
2. Look for error messages
3. Make sure server is running

### Patient data not loading?
1. Make sure you came from "Result" page
2. Click "Health Tips Chatbot" button from result page
3. Not from bookmark

---

## 💡 Pro Tips

1. **Be Specific** - The more specific your question, the better the answer
2. **Follow Up** - Ask follow-up questions to get more details
3. **Explore Topics** - Try different topics to learn more
4. **Take Notes** - Write down important tips
5. **Consult Doctor** - Chatbot is a guide, not a replacement for your doctor!

---

## 🎓 Learn More

For detailed information:
- **Setup Guide:** CHATBOT_SETUP.md
- **Implementation Details:** CHATBOT_IMPLEMENTATION.md
- **Full Documentation:** Check project README

---

## 🎯 Example Conversation

```
You: "Hi, what should I eat?"

Chatbot: "🥗 Personalized Diet Recommendations

Based on your Normal kidney function, here are kidney-friendly diet tips:

✓ DO:
- Eat fresh fruits and vegetables
- Choose lean proteins (fish, chicken)
- Use herbs instead of salt for flavoring
- Drink plenty of water (8-10 glasses/day)

✗ AVOID:
- Processed foods (high in sodium)
- Cured meats
- Sugary drinks
- Excess salt"

You: "What about potassium?"

Chatbot: "🍌 Potassium Management

Potassium is essential for heart health.

✓ High-Potassium Foods (Encouraged):
- Bananas
- Oranges
- Avocados
...

You: "Thanks!"

Chatbot: "You're welcome! Feel free to ask more questions anytime!"
```

---

## 🌟 Features You'll Love

- 💬 **Natural Chat** - Feels like talking to a real person
- 🎯 **Personalized** - Advice based on YOUR test results
- ⚡ **Instant** - Responses in seconds
- 📱 **Mobile Ready** - Use on any device
- 🔐 **Private** - No data sent to external services
- 🆓 **Free** - No API keys needed!

---

## 📊 Kidney Stage Explanations

The chatbot tailors advice based on your eGFR:

- **Stage 1** (eGFR ≥ 90): Normal - Focus on prevention
- **Stage 2** (eGFR 60-89): Mild - Maintain healthy habits
- **Stage 3a** (eGFR 45-59): Mild-Moderate - Increase monitoring
- **Stage 3b** (eGFR 30-44): Moderate-Severe - Strict diet control
- **Stage 4** (eGFR 15-29): Severe - Frequent doctor visits
- **Stage 5** (eGFR < 15): Kidney Failure - Intensive treatment

---

## 🚀 You're All Set!

Everything is configured and ready to use.

**Just start your server and enjoy personalized kidney health guidance!**

```bash
npm start
```

Then open: `http://localhost:3000`

**Happy chatting!** 🤖💙

---

**Last Updated:** December 27, 2025
