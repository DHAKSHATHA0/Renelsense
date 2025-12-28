// Test Gemini API directly
require('dotenv').config();
const fetch = require('node-fetch');

async function testGeminiAPI() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-pro';
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 GEMINI API DIAGNOSTIC TEST');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 Configuration:');
    console.log(`   API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '❌ NOT SET'}`);
    console.log(`   Model: ${model}`);
    console.log(`   Endpoint: https://generativelanguage.googleapis.com/v1/models/${model}:generateContent\n`);
    
    if (!apiKey) {
        console.log('❌ ERROR: GOOGLE_AI_API_KEY not found in .env file!');
        console.log('\n📝 To fix:');
        console.log('1. Go to https://makersuite.google.com/app/apikey');
        console.log('2. Create a new API key');
        console.log('3. Copy the key');
        console.log('4. Paste it in the .env file as: GOOGLE_AI_API_KEY=your_key_here');
        process.exit(1);
    }
    
    console.log('🔄 Testing API connection...\n');
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SmartKidneyMonitor/1.0'
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{
                        text: 'Hello! What is the estimated glomerular filtration rate (eGFR) used for?'
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200
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
        } else if (response.status === 404) {
            console.log('❌ ERROR: Model not found!');
            console.log('\nThe model "' + model + '" is not available.\n');
            console.log('📝 Available models:');
            console.log('   • gemini-pro (most stable)');
            console.log('   • gemini-2.0-flash (if v2 API is enabled)');
            console.log('\nUpdate your .env file with one of these models.');
        } else if (data.error) {
            console.log('❌ ERROR from Gemini API:');
            console.log(`   Code: ${data.error.code}`);
            console.log(`   Message: ${data.error.message}`);
            console.log('\n🔧 Troubleshooting:');
            
            if (data.error.code === 403) {
                console.log('   • Your API key may not have the right permissions');
                console.log('   • Make sure "Generative Language API" is enabled in Google Cloud');
            } else if (data.error.code === 429) {
                console.log('   • Rate limit exceeded - wait a moment and try again');
            } else if (data.error.code === 401) {
                console.log('   • Invalid API key - check your .env file');
            }
        } else {
            console.log('❌ Unexpected response:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ ERROR: Could not reach Gemini API');
        console.log(`   ${error.message}\n`);
        console.log('🔧 Possible causes:');
        console.log('   • No internet connection');
        console.log('   • Invalid API key');
        console.log('   • API disabled in Google Cloud Console');
        console.log('   • Firewall blocking the connection');
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
}

testGeminiAPI();
