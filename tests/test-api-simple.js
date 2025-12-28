// Simple API test without starting server
require('dotenv').config();
const fetch = require('node-fetch');

async function test() {
    console.log('\n🤖 Testing Chatbot API Endpoint\n');
    
    const messages = [
        'Hello! How are you?',
        'How do I keep my kidneys healthy?',
        'What is kidney stone and how to cure it?'
    ];
    
    for (const msg of messages) {
        console.log(`💬 Message: "${msg}"\n`);
        
        try {
            const response = await fetch('http://localhost:3000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    patientResults: { eGFR: 75, status: 'Normal', riskLevel: 'Low', confidence: 95 },
                    conversationHistory: [],
                    sessionId: 'test_' + Date.now()
                })
            });
            
            if (!response.ok) {
                console.log(`❌ Error: ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            if (data.success && data.reply) {
                console.log(`✅ Bot Response:\n${data.reply}\n`);
            } else {
                console.log(`❌ No response\n`);
            }
        } catch (e) {
            console.log(`❌ Network Error: ${e.message}\n`);
        }
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('✨ Test complete!');
    process.exit(0);
}

// Wait for server to be ready
setTimeout(test, 1000);
