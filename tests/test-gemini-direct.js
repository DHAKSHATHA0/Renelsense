// Direct Gemini API test without starting the server
require('dotenv').config();
const fetch = require('node-fetch');

async function testGeminiDirect() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 GEMINI API DIRECT TEST (No Server Startup)');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 Configuration:');
    console.log(`   Model: ${model}`);
    console.log(`   API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '❌ NOT SET'}`);
    console.log(`   Endpoint: https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent\n`);
    
    if (!apiKey) {
        console.log('❌ ERROR: GOOGLE_AI_API_KEY not found in .env file!');
        process.exit(1);
    }
    
    console.log('🔄 Sending test message to Gemini API...\n');
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{
                        text: 'What is a healthy eGFR (estimated glomerular filtration rate) level?'
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250
                }
            })
        });
        
        console.log(`📨 HTTP Status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        
        if (response.ok && data.candidates && data.candidates.length > 0) {
            console.log('✅ SUCCESS! Gemini API is working!\n');
            console.log('📝 Response from Gemini:');
            console.log('───────────────────────────────────────────────────');
            const reply = data.candidates[0].content.parts[0].text;
            console.log(reply);
            console.log('───────────────────────────────────────────────────\n');
            console.log('✨ Your Gemini API is properly configured!');
            console.log('✨ Your chatbot should now work with Gemini AI responses!\n');
        } else if (data.error) {
            console.log('❌ ERROR from Gemini API:');
            console.log(`   Code: ${data.error.code}`);
            console.log(`   Message: ${data.error.message}\n`);
            
            if (data.error.code === 404) {
                console.log('Model not found. Available models:');
                console.log('  • gemini-2.5-flash (recommended)');
                console.log('  • gemini-2.5-pro');
                console.log('  • gemini-2.0-flash');
                console.log('  • gemini-pro-latest');
            } else if (data.error.code === 403) {
                console.log('API key issue - check permissions in Google Cloud Console');
            } else if (data.error.code === 429) {
                console.log('Rate limited - wait a moment and try again');
            }
        } else {
            console.log('❌ Unexpected response:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ Network error:');
        console.log(`   ${error.message}`);
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
}

testGeminiDirect();
