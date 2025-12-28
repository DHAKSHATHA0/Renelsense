// Extended chatbot test - multiple messages to test stability
require('dotenv').config();
const fetch = require('node-fetch');

async function testChatbotStability() {
    const serverURL = 'http://localhost:3000';
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🤖 EXTENDED CHATBOT STABILITY TEST');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const testMessages = [
        'Hello! How are you?',
        'How do I keep my kidneys healthy?',
        'What is a kidney stone?',
        'What should I eat for kidney health?',
        'Is my kidney function normal at eGFR 75?',
        'What exercises are good for kidney patients?'
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        const testNum = i + 1;
        
        console.log(`\n📝 Test ${testNum}/${testMessages.length}`);
        console.log(`💬 User: "${message}"`);
        console.log('🔄 Waiting for response...');
        
        try {
            const response = await fetch(`${serverURL}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
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
            
            if (!response.ok) {
                console.log(`❌ API Error: ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            
            if (data.success) {
                const replyPreview = data.reply.substring(0, 100) + (data.reply.length > 100 ? '...' : '');
                console.log(`✅ Response received: "${replyPreview}"`);
            } else {
                console.log(`❌ API returned false for success`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        // Wait 2 seconds between requests
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ STABILITY TEST COMPLETE');
    console.log('If all tests passed, server is stable and won\'t crash!');
    console.log('═══════════════════════════════════════════════════════\n');
}

testChatbotStability();
