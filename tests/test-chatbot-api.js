// Test the chatbot API endpoint with real conversation
require('dotenv').config();
const fetch = require('node-fetch');

async function testChatbotAPI() {
    const serverURL = 'http://localhost:3000';
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🤖 CHATBOT API TEST - Real Conversation');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const testMessages = [
        { message: 'Hello, how are you?', description: 'Greeting test' },
        { message: 'How do I keep my kidneys healthy?', description: 'Health advice' },
        { message: 'What is kidney stone and how to cure it?', description: 'Disease inquiry' }
    ];
    
    for (const test of testMessages) {
        console.log(`\n📝 Test: ${test.description}`);
        console.log(`💬 User: "${test.message}"\n`);
        
        try {
            const response = await fetch(`${serverURL}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: test.message,
                    patientResults: {
                        eGFR: 75,
                        status: 'Normal Function',
                        riskLevel: 'Low',
                        confidence: 95,
                        heartRate: 72,
                        temperature: 36.8
                    },
                    conversationHistory: [],
                    sessionId: 'test_session_' + Date.now()
                })
            });
            
            console.log(`📊 Status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                console.log('❌ API Error!');
                const text = await response.text();
                console.log(text);
                continue;
            }
            
            const data = await response.json();
            
            if (data.success && data.reply) {
                console.log('🤖 Chatbot:');
                console.log(data.reply);
                console.log('\n✅ Success!');
            } else {
                console.log('❌ Failed to get response');
                console.log(JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(55));
    }
    
    console.log('\n═══════════════════════════════════════════════════════\n');
}

testChatbotAPI();
