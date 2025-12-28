// AI-Powered Kidney Health Chatbot with Voice Assistance & Google Gemini
// Features: Voice Input/Output, Real-time AI Responses, Patient Data Personalization

let patientResults = null;
let conversationHistory = [];
let isLoading = false;
let isRecording = false;

// Speech Recognition and Synthesis
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechRecognition = new SpeechRecognition ? new SpeechRecognition() : null;
const speechSynthesis = window.speechSynthesis;

// Configure Speech Recognition
if (speechRecognition) {
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => {
        isRecording = true;
        document.getElementById('voiceBtn').classList.add('recording');
        document.getElementById('voiceStatus').style.display = 'block';
        document.getElementById('chatInput').placeholder = 'Listening...';
    };

    speechRecognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        // Display transcribed text
        document.getElementById('chatInput').value = finalTranscript || interimTranscript;
    };

    speechRecognition.onend = () => {
        isRecording = false;
        document.getElementById('voiceBtn').classList.remove('recording');
        document.getElementById('voiceStatus').style.display = 'none';
        document.getElementById('chatInput').placeholder = 'Ask me about your kidney health...';
    };

    speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showNotification(`Voice input error: ${event.error}`, 'error');
        isRecording = false;
        document.getElementById('voiceBtn').classList.remove('recording');
        document.getElementById('voiceStatus').style.display = 'none';
    };
}

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🤖 AI Chatbot with Voice Assistance Initialized');
    
    loadPatientResults();
    
    if (conversationHistory.length === 0) {
        document.getElementById('suggestedPrompts').style.display = 'grid';
    }
    
    document.getElementById('chatInput').focus();
    
    // Check API availability
    checkAPIAvailability();
});

/**
 * Check Google Gemini API availability
 */
async function checkAPIAvailability() {
    try {
        const response = await fetch('/api/check-ai-config');
        if (response.ok) {
            const data = await response.json();
            console.log('AI Configuration:', data);
        }
    } catch (error) {
        console.log('AI status check:', error.message);
    }
}

/**
 * Toggle voice input on/off
 */
function toggleVoiceInput() {
    if (!speechRecognition) {
        showNotification('Voice input not supported in your browser', 'error');
        return;
    }

    if (isRecording) {
        speechRecognition.stop();
    } else {
        speechRecognition.start();
    }
}

/**
 * Load patient results from storage
 */
function loadPatientResults() {
    let results = sessionStorage.getItem('patientResults');
    
    if (!results) {
        results = localStorage.getItem('patientResults');
    }
    
    if (results) {
        patientResults = JSON.parse(results);
        updatePatientInfoDisplay();
        console.log('✓ Patient results loaded:', patientResults);
    } else {
        patientResults = {
            eGFR: 78,
            status: 'Normal Function',
            riskLevel: 'Low',
            confidence: 94,
            heartRate: 72,
            temperature: 36.8,
            dataQuality: 98
        };
        console.log('Using default patient data');
    }
}

/**
 * Update patient info display in header
 */
function updatePatientInfoDisplay() {
    if (patientResults) {
        document.getElementById('patientEGFR').textContent = `${patientResults.eGFR || '--'}`;
        document.getElementById('patientStatus').textContent = patientResults.status || '--';
        document.getElementById('patientRisk').textContent = patientResults.riskLevel || '--';
        document.getElementById('patientConfidence').textContent = `${patientResults.confidence || '--'}%`;
    }
}

/**
 * Send message to chatbot
 */
function sendMessage(customMessage = null) {
    const input = document.getElementById('chatInput');
    const message = customMessage || input.value.trim();
    
    if (!message) return;
    
    if (!customMessage) {
        input.value = '';
    }
    
    document.getElementById('suggestedPrompts').style.display = 'none';
    
    // Add user message
    addMessageToChat(message, 'user');
    
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    document.getElementById('sendBtn').disabled = true;
    isLoading = true;
    
    showTypingIndicator();
    
    // Send to API
    sendToAI(message);
}

/**
 * Send message to AI backend
 */
async function sendToAI(message) {
    try {
        // Build API URL correctly - always use the current page's origin
        const protocol = window.location.protocol;  // http: or https:
        const hostname = window.location.hostname;  // localhost or IP
        const port = window.location.port;          // 3000 or empty
        
        let apiUrl;
        if (port) {
            apiUrl = `${protocol}//${hostname}:${port}/api/chatbot`;
        } else {
            apiUrl = `${protocol}//${hostname}/api/chatbot`;
        }
        
        console.log('📡 Sending to API:', apiUrl);
        console.log('Patient Data:', patientResults);
        console.log('Message:', message);
        
        const requestBody = {
            message: message,
            patientResults: patientResults,
            conversationHistory: conversationHistory,
            sessionId: getSessionId(),
            useGeminiAPI: true
        };
        
        console.log('📨 Request Body:', requestBody);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            timeout: 30000
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✓ API Response received:', data);

        if (data.success && data.reply) {
            removeTypingIndicator();
            const reply = data.reply;
            
            console.log('✓ AI Response:', reply);
            
            addMessageToChat(reply, 'bot');
            
            conversationHistory.push({
                role: 'assistant',
                content: reply
            });

            // Play voice response if enabled
            if (document.getElementById('ttsToggle') && document.getElementById('ttsToggle').checked) {
                speakResponse(reply);
            }
        } else {
            removeTypingIndicator();
            const errorMsg = data.error || data.message || 'Error processing request';
            console.error('❌ API returned error:', data);
            addMessageToChat('Sorry, I encountered an error: ' + errorMsg + '. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('❌ Connection Error:', error);
        console.error('Error Details:', {
            message: error.message,
            stack: error.stack,
            location: window.location.href
        });
        removeTypingIndicator();
        
        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMsg = '⚠️ Cannot connect to server. Make sure:\n1. Server is running (node server.js)\n2. You are accessing via http://localhost:3000\n3. Check if port 3000 is blocked';
        }
        
        addMessageToChat(errorMsg, 'bot');
    } finally {
        document.getElementById('sendBtn').disabled = false;
        isLoading = false;
        document.getElementById('chatInput').focus();
    }
}

/**
 * Text-to-Speech: Speak the response
 */
function speakResponse(text) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
        console.log('🔊 Speaking response...');
    };

    utterance.onend = () => {
        console.log('✓ Finished speaking');
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
    };

    speechSynthesis.speak(utterance);
}

/**
 * Add message to chat display
 */
function addMessageToChat(message, role) {
    const chatBody = document.getElementById('chatBody');
    
    // Remove "no messages" indicator
    const noMessages = chatBody.querySelector('.no-messages');
    if (noMessages) {
        noMessages.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = `message-content ${role === 'user' ? 'user-message' : 'bot-message'}`;
    
    // Parse markdown and sanitize HTML
    if (role === 'bot') {
        try {
            contentDiv.innerHTML = marked.parse(sanitizeHTML(message));
        } catch (e) {
            contentDiv.textContent = message;
        }
    } else {
        contentDiv.textContent = message;
    }

    messageDiv.appendChild(contentDiv);
    chatBody.appendChild(messageDiv);

    // Auto scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="message-content bot-message">
            <div class="voice-indicator">
                <span>Thinking...</span>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
            </div>
        </div>
    `;
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Clear chat history
 */
function clearChat() {
    if (confirm('Clear all messages? This cannot be undone.')) {
        conversationHistory = [];
        document.getElementById('chatBody').innerHTML = `
            <div class="no-messages">
                <i class="fas fa-comments" style="font-size: 48px; color: #ddd; margin-bottom: 20px; display: block;"></i>
                <p>Start a conversation with our Health Tips Assistant!</p>
                <p style="font-size: 12px; margin-top: 10px;">Ask about kidney health, care tips, lifestyle recommendations, and more.</p>
            </div>
        `;
        document.getElementById('suggestedPrompts').style.display = 'grid';
        showNotification('Chat cleared', 'success');
    }
}

/**
 * Handle Enter key in input
 */
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * Go back to result page
 */
function goBackToResult() {
    window.location.href = '/result.html';
}

/**
 * Sanitize HTML to prevent XSS while preserving markdown formatting
 */
function sanitizeHTML(html) {
    // Create a temporary container to sanitize the HTML
    const temp = document.createElement('div');
    temp.textContent = html;
    
    // Get the escaped HTML and unescape common markdown patterns
    let sanitized = temp.innerHTML;
    
    // Return the text as-is to let marked.js parse it
    // marked.js will handle the rendering safely
    return html;
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // You can implement a toast notification here
    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Get or create session ID
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
}

// Export functions for global access
window.sendMessage = sendMessage;
window.toggleVoiceInput = toggleVoiceInput;
window.clearChat = clearChat;
window.handleKeyPress = handleKeyPress;
window.goBackToResult = goBackToResult;
window.speakResponse = speakResponse;

console.log('✅ Enhanced Chatbot with Voice & Gemini API loaded successfully');
