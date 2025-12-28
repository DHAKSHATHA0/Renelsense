// Test script to check if Gemini API is working
const fetch = require('node-fetch');

async function testChatbot() {
    try {
        console.log('🧪 Testing Chatbot API...\n');
        
        const testMessage = "What should I eat?";
        const patientResults = {
            eGFR: 78,
            status: 'Normal Function',
            riskLevel: 'Low',
            confidence: 94,
            heartRate: 72,
            temperature: 36.8
        };

        console.log('📤 Sending test message to chatbot API...');
        console.log(`Message: "${testMessage}"`);
        console.log(`Patient eGFR: ${patientResults.eGFR}\n`);

        const response = await fetch('http://localhost:3000/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: testMessage,
                patientResults: patientResults,
                conversationHistory: [],
                sessionId: 'test_session',
                useGeminiAPI: true
            })
        });

        console.log(`📨 Response Status: ${response.status} ${response.statusText}\n`);

        const data = await response.json();
        
        console.log('📥 API Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ SUCCESS! Got response from chatbot:');
            console.log('\n' + data.reply);
        } else {
            console.log('\n❌ ERROR! API returned error:');
            console.log(data.error || data.message);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        console.error('Make sure the server is running on http://localhost:3000');
    }
}

// Run the test
testChatbot();
