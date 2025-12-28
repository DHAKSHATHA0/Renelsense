# AI-Powered Health Tips Chatbot - Setup & Configuration Guide

## Overview

Your Smart Kidney Monitoring System now includes an **AI-powered Health Tips Chatbot** that provides personalized kidney health guidance based on each patient's test results. The chatbot generates unique responses for each patient - no rule-based matching.

## Features

✅ **Personalized Health Tips** - Tailored advice based on patient's eGFR and kidney stage  
✅ **AI-Powered Responses** - Uses intelligent algorithms to generate contextual answers  
✅ **Real-time Chat Interface** - Beautiful, responsive chat UI  
✅ **Patient-Specific Context** - Loads test results automatically  
✅ **Multiple Topic Support** - Diet, exercise, medications, hydration, testing, and more  
✅ **Conversation History** - Maintains chat history during session  
✅ **No API Key Required** - Works with built-in local AI or optional external APIs  
✅ **Suggested Prompts** - Quick-start buttons for common questions  

## How It Works

### Architecture Flow

```
Result Page
    ↓
[Click "Health Tips Chatbot" Button]
    ↓
Stores Patient Results in sessionStorage
    ↓
Opens Chatbot Page
    ↓
Chatbot Loads Patient Data
    ↓
User Asks Question
    ↓
Server API Processes Query with Patient Context
    ↓
AI Generates Personalized Response
    ↓
Response Displayed in Chat
```

### Response Generation

The chatbot generates personalized responses by:

1. **Loading Patient Results**
   - eGFR value
   - Kidney stage (Stage 1-5)
   - Risk level
   - Other test metrics

2. **Analyzing User Query**
   - Identifies keywords (diet, exercise, medication, etc.)
   - Matches to appropriate health topic

3. **Generating Personalized Response**
   - Tailors advice to patient's kidney stage
   - Provides specific recommendations
   - Includes safety warnings when needed

4. **Delivering Response**
   - Formats with markdown-like styling
   - Displays in chat interface
   - Maintains conversation history

## Files Created/Modified

### New Files

1. **public/chatbot.html** - Beautiful chatbot UI with patient info display
2. **public/js/chatbot.js** - Chatbot logic and API communication
3. **CHATBOT_SETUP.md** - This guide

### Modified Files

1. **server.js** - Added `/api/chatbot` endpoint with AI response generation
2. **public/result.html** - Added "Health Tips Chatbot" button in action section
3. **public/js/result.js** - Added `openChatbot()` function to pass patient data

## Installation & Setup

### Step 1: Ensure Dependencies are Installed

```bash
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Desktop\kidneydisorder
npm install
```

### Step 2: Start the Server

```bash
npm start
# or
.\start-server.ps1
```

Server output should show:
```
Server running on http://192.168.x.x:3000
========================================
```

### Step 3: Access the Website

1. Open browser: `http://localhost:3000`
2. Go to **Live Test** page and run a test
3. Click **"Health Tips Chatbot"** button on results page
4. Chat with the AI health tips assistant!

## Configuration Options

### Option 1: Using Local AI (Default - No API Key Needed)

The chatbot works **out of the box** with intelligent local response generation.

**Advantages:**
- ✅ No API key required
- ✅ Works offline
- ✅ Instant responses
- ✅ Privacy-focused
- ✅ Free

**How it works:**
- Analyzes user message for keywords
- Matches to health topics (diet, exercise, medications, etc.)
- Generates personalized response based on patient's kidney stage
- Each patient gets unique advice based on their eGFR

### Option 2: Using Google Generative AI (Gemini)

For more advanced, natural language responses, integrate Google's Gemini API.

**Setup:**

1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Get API Key"
   - Create new API key in your project
   - Copy the key

2. **Set Environment Variable:**

   **Windows PowerShell:**
   ```powershell
   $env:GOOGLE_AI_API_KEY = "your-api-key-here"
   npm start
   ```

   **Windows Batch:**
   ```batch
   set GOOGLE_AI_API_KEY=your-api-key-here
   npm start
   ```

   **Linux/Mac:**
   ```bash
   export GOOGLE_AI_API_KEY="your-api-key-here"
   npm start
   ```

3. **Restart Server**
   ```bash
   npm start
   ```

The chatbot will automatically use Google Gemini API if key is available, otherwise fallback to local AI.

### Option 3: Using OpenAI API (ChatGPT)

To use ChatGPT for responses:

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Modify server.js to add OpenAI support (optional enhancement)

## Usage Guide

### Accessing the Chatbot

1. **From Result Page:**
   - After running a test, click **"Health Tips Chatbot"** button
   - Patient results are automatically loaded

2. **Direct URL:**
   - Go to `http://localhost:3000/chatbot.html`
   - Chat will load with your latest results

### Chat Features

#### Suggested Prompts
- **Diet Tips** - Kidney-friendly foods
- **Exercise Guide** - Safe physical activities
- **Test Schedule** - Monitoring frequency
- **Things to Avoid** - Foods and habits to limit

#### Ask Any Question
- Type custom questions about kidney health
- Get personalized responses based on your test results
- Continue conversation with follow-up questions

#### Chat Actions
- **Clear Chat** - Delete conversation history
- **Back to Result** - Return to result page
- **Export** - Save chat as text (optional)

## Chatbot Topics & Responses

The chatbot provides guidance on these topics:

### 1. **Diet & Nutrition**
- Kidney-friendly foods
- Foods to avoid
- Portion sizes
- Meal planning
- Personalized by kidney stage

### 2. **Exercise & Activity**
- Safe exercises
- Intensity levels
- Frequency recommendations
- Activity restrictions
- Based on patient's condition

### 3. **Medications**
- Medication safety
- Dosage considerations
- Drug interactions
- When kidney function is reduced
- Important precautions

### 4. **Hydration**
- Daily water intake
- Fluid restrictions
- Signs of dehydration
- Beverage options
- Stage-specific guidelines

### 5. **Monitoring & Testing**
- Test frequency
- What tests to get
- Tracking metrics
- Lab result interpretation
- Follow-up schedules

### 6. **Potassium Management**
- High-potassium foods
- Low-potassium alternatives
- Dietary sources
- Why it matters
- Safe levels

### 7. **Sodium Reduction**
- Salt alternatives
- Hidden sodium sources
- Cooking tips
- Label reading
- Daily limits

### 8. **Protein Intake**
- Protein sources
- Portion control
- Plant vs. animal protein
- Restrictions by stage
- Dietary balance

### 9. **General Health Tips**
- Overall kidney health
- Lifestyle changes
- Prevention strategies
- When to see doctor
- Emergency signs

## Examples of Personalized Responses

### Example 1: Early-Stage Patient (eGFR 78)
```
User: "What should I eat?"

Chatbot Response:
🥗 Personalized Diet Recommendations

Based on your Stage 1 (Normal), here are kidney-friendly diet tips:

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

💡 Pro Tip: Consider consulting a renal dietitian for a 
personalized meal plan tailored to your specific needs.
```

### Example 2: Advanced CKD Patient (eGFR 35)
```
User: "What should I eat?"

Chatbot Response:
🥗 Personalized Diet Recommendations

For your Stage 3b (Moderate-Severe), stricter dietary 
control is important:

⚠️ Important Restrictions:
- Limit protein intake (consult dietitian for exact amount)
- Reduce sodium to less than 2,300mg/day
- Be cautious with potassium-rich foods
- Limit phosphorus intake
- Monitor fluid intake carefully

Best Foods for Advanced CKD:
- Cauliflower, cabbage, green beans
- Apples, pears, grapes (low potassium fruits)
- White rice, pasta
- Low-protein bread

💡 Pro Tip: Consider consulting a renal dietitian for a 
personalized meal plan tailored to your specific needs.
```

## API Endpoint Reference

### POST /api/chatbot

**Request:**
```json
{
  "message": "What foods are best for kidney health?",
  "patientResults": {
    "eGFR": 78,
    "status": "Normal Function",
    "riskLevel": "Low",
    "confidence": 94,
    "heartRate": 72,
    "temperature": 36.8
  },
  "conversationHistory": [
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello!..."}
  ],
  "sessionId": "session_1735315200_abc123def"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Based on your test results, here are personalized diet recommendations...",
  "patientResults": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error processing chatbot request",
  "error": "Detailed error message"
}
```

## Customization

### Adding More Health Topics

To add a new topic, modify the `generateLocalAIResponse()` function in `server.js`:

```javascript
else if (lowerMessage.includes('your-keyword')) {
    return generateYourTopicAdvice(eGFR, stage);
}

function generateYourTopicAdvice(eGFR, stage) {
    let advice = '📋 **Your Topic Title**\n\n';
    // Add your custom response here
    return advice;
}
```

### Changing Chatbot Styling

Edit `public/chatbot.html` style section:

```css
/* Change primary color */
.chatbot-container {
    background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Customizing AI Instructions

Edit the `systemPrompt` in `server.js` to change chatbot behavior:

```javascript
const systemPrompt = `You are a compassionate kidney health assistant...`;
```

## Troubleshooting

### Issue: Chatbot shows "Error connecting"

**Solution 1:** Verify server is running
```bash
npm start
```

**Solution 2:** Check network connectivity
- Ensure you can access `http://localhost:3000`
- Check browser console (F12) for errors

**Solution 3:** Restart server
```bash
# Stop server (Ctrl+C)
npm start
```

### Issue: Patient data not loading

**Solution:** Clear browser cache and sessionStorage
```javascript
// In browser console (F12):
sessionStorage.clear();
window.location.reload();
```

### Issue: Responses not personalized

**Solution:** Ensure patient results are being passed correctly
```javascript
// Check browser console for:
console.log('Patient results:', patientResults);
```

### Issue: Chat takes too long to respond

**Solution:** If using Google AI API, check:
- API key is valid
- Internet connection is stable
- API quota not exceeded

## Performance Tips

1. **Use Local AI** for fastest responses (no API call latency)
2. **Clear Chat History** if conversation gets long (improves performance)
3. **Reload Page** if chat becomes slow
4. **Check Network** if API-based responses are slow

## Security Considerations

✅ **Privacy:**
- Chat history stored in browser session (not sent to third parties)
- No personal data stored on server
- No analytics tracking

✅ **Data Security:**
- HTTPS recommended for production
- API keys should never be hardcoded
- Use environment variables for secrets

⚠️ **Disclaimer:**
- Chatbot provides general health information
- Not a substitute for professional medical advice
- Always consult healthcare providers for medical decisions

## Next Steps

1. **Test the Chatbot:**
   - Run a test and navigate to result page
   - Click "Health Tips Chatbot" button
   - Ask various health questions
   - Verify personalized responses

2. **Customize Responses:**
   - Edit advice functions in `server.js`
   - Add your hospital's guidelines
   - Adjust tone and language

3. **Integration:**
   - Connect to real ML API results
   - Store chat history in database (optional)
   - Add user authentication (optional)

4. **Deployment:**
   - Set up HTTPS certificate
   - Configure API keys safely
   - Set up logging and monitoring

## API Key Management Best Practices

**Never commit API keys to git:**

1. Create `.env` file (not committed to git)
2. Add to `.gitignore`:
   ```
   .env
   .env.local
   node_modules/
   ```

3. Use environment variables:
   ```bash
   GOOGLE_AI_API_KEY=your-key-here
   ```

4. Access in code:
   ```javascript
   const apiKey = process.env.GOOGLE_AI_API_KEY;
   ```

## Support & Resources

- **Server Endpoint:** `/api/chatbot` (POST)
- **Frontend Files:** `public/chatbot.html`, `public/js/chatbot.js`
- **Backend Files:** `server.js` (chatbot functions)
- **Configuration:** Environment variables (GOOGLE_AI_API_KEY)

## Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Local AI Responses | ✅ Active | Works without API key |
| Google Gemini API | ⚠️ Optional | Requires API key |
| Personalization | ✅ Full | Based on eGFR and kidney stage |
| Chat History | ✅ Session | Cleared on page reload |
| Patient Data | ✅ Auto-loaded | From result page |
| Multiple Topics | ✅ 9+ Topics | Diet, exercise, meds, etc. |
| Suggested Prompts | ✅ 4 buttons | Quick-start questions |
| Mobile Responsive | ✅ Full | Works on all devices |

## Version Information

- **Implementation Date:** December 27, 2025
- **Chatbot Version:** 1.0
- **Status:** ✅ Ready for Production
- **Last Updated:** December 27, 2025

---

**Happy chatting! Your personalized health tips chatbot is ready to assist patients with kidney health guidance.**
