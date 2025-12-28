// Smart Kidney Monitoring Chatbot
// Uses AI API to generate personalized health tips based on patient results

let patientResults = null;
let conversationHistory = [];
let isLoading = false;

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Chatbot initialized');
    
    // Load patient results from sessionStorage or result page
    loadPatientResults();
    
    // Initialize WebSocket for real-time updates
    initializeWebSocket();
    
    // Display suggested prompts if first message
    if (conversationHistory.length === 0) {
        const suggestedPromptsEl = document.getElementById('suggestedPrompts');
        if (suggestedPromptsEl) {
            suggestedPromptsEl.style.display = 'grid';
        }
    }
    
    // Set focus on input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.focus();
    }
});

/**
 * Load patient results from sessionStorage or localStorage
 */
function loadPatientResults() {
    // Try to get from sessionStorage first (most recent)
    let results = sessionStorage.getItem('patientResults');
    
    // If not found, try localStorage
    if (!results) {
        results = localStorage.getItem('patientResults');
    }
    
    if (results) {
        patientResults = JSON.parse(results);
        updatePatientInfoDisplay();
        console.log('Patient results loaded:', patientResults);
    } else {
        // Use default/mock data if no results found
        patientResults = {
            eGFR: 78,
            status: 'Normal Function',
            riskLevel: 'Low',
            confidence: 94,
            heartRate: 72,
            temperature: 36.8,
            dataQuality: 98
        };
        console.log('Using default patient results:', patientResults);
    }
}

/**
 * Update patient info display in chatbot header
 */
function updatePatientInfoDisplay() {
    if (patientResults) {
        const eGFREl = document.getElementById('patientEGFR');
        const statusEl = document.getElementById('patientStatus');
        const riskEl = document.getElementById('patientRisk');
        const confidenceEl = document.getElementById('patientConfidence');
        
        if (eGFREl) eGFREl.textContent = `${patientResults.eGFR || '--'}`;
        if (statusEl) statusEl.textContent = patientResults.status || '--';
        if (riskEl) riskEl.textContent = patientResults.riskLevel || '--';
        if (confidenceEl) confidenceEl.textContent = `${patientResults.confidence || '--'}%`;
    }
}

/**
 * Send message to chatbot
 */
function sendMessage(customMessage = null) {
    const input = document.getElementById('chatInput');
    const message = customMessage || input.value.trim();
    
    if (!message) return;
    
    // Clear input if not custom message
    if (!customMessage) {
        input.value = '';
    }
    
    // Hide suggested prompts after first message
    const suggestedPromptsEl = document.getElementById('suggestedPrompts');
    if (suggestedPromptsEl) {
        suggestedPromptsEl.style.display = 'none';
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Disable send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
    }
    isLoading = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to backend API
    sendToAI(message);
}

/**
 * Add message to chat display
 */
function addMessageToChat(message, role) {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;
    
    // Remove "no messages" placeholder if exists
    const noMessages = chatBody.querySelector('.no-messages');
    if (noMessages) {
        noMessages.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = sanitizeHTML(message);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatBody.appendChild(messageDiv);
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'typing-indicator';
    content.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatBody.appendChild(messageDiv);
    
    // Scroll to bottom
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
 * Send message to AI API
 */
async function sendToAI(message) {
    try {
        const serverURL = getServerURL();
        const response = await fetch(`${serverURL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                patientResults: patientResults,
                conversationHistory: conversationHistory,
                sessionId: getSessionId()
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (data.success && data.reply) {
            // Add bot response to chat
            addMessageToChat(data.reply, 'bot');
            
            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: data.reply
            });
        } else {
            addMessageToChat('Sorry, I could not generate a response. Please try again.', 'bot');
        }
        
        // Re-enable send button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = false;
        }
        isLoading = false;
        
    } catch (error) {
        console.error('Error sending message to AI:', error);
        removeTypingIndicator();
        addMessageToChat('Sorry, there was an error processing your request. Please try again later.', 'bot');
        
        // Re-enable send button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = false;
        }
        isLoading = false;
    }
}

/**
 * Get server URL
 */
function getServerURL() {
    try {
        // Try to get from config
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port || (protocol === 'https:' ? 443 : 80);
        
        // Use current server
        if (port) {
            return `${protocol}//${hostname}:${port}`;
        }
        return `${protocol}//${hostname}`;
    } catch (error) {
        return 'http://localhost:3000';
    }
}

/**
 * Get or create session ID
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(html) {
    // Support markdown-style formatting
    let sanitized = html;
    
    // Bold: **text** -> <strong>text</strong>
    sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    sanitized = sanitized.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Newlines: \n -> <br>
    sanitized = sanitized.replace(/\n/g, '<br>');
    
    // Lists: - item -> <li>item</li>
    sanitized = sanitized.replace(/^- (.*?)$/gm, '<li>$1</li>');
    
    return sanitized;
}

/**
 * Store patient results when coming from result page
 */
function storePatientResults(results) {
    sessionStorage.setItem('patientResults', JSON.stringify(results));
    loadPatientResults();
}

/**
 * Initialize WebSocket connection for real-time updates
 */
function initializeWebSocket() {
    try {
        // Determine WebSocket protocol and host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsURL = `${protocol}//${host}`;
        
        console.log('🔗 Connecting to WebSocket:', wsURL);
        
        const ws = new WebSocket(wsURL);
        
        ws.addEventListener('open', () => {
            console.log('✅ WebSocket connected');
            addSystemMessage('🔗 Connected to real-time updates');
        });
        
        ws.addEventListener('message', (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('📨 Received WebSocket message:', message);
                
                // Handle different message types
                switch(message.type) {
                    case 'sensor_update':
                        handleSensorUpdate(message.payload);
                        break;
                    case 'prediction_result':
                        handlePredictionResult(message.payload);
                        break;
                    case 'test_started':
                        addSystemMessage('🏥 New test session started');
                        break;
                    case 'test_stopped':
                        addSystemMessage('⏹️ Test session ended');
                        break;
                    default:
                        console.log('Unknown message type:', message.type);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
        
        ws.addEventListener('error', (error) => {
            console.error('❌ WebSocket error:', error);
            addSystemMessage('⚠️ Connection error - real-time updates may be unavailable');
        });
        
        ws.addEventListener('close', () => {
            console.log('❌ WebSocket closed');
            addSystemMessage('🔌 Connection closed');
        });
        
        return ws;
    } catch (error) {
        console.error('Error initializing WebSocket:', error);
        return null;
    }
}

/**
 * Handle sensor data updates from WebSocket
 */
function handleSensorUpdate(sensorData) {
    console.log('📊 Sensor update received:', sensorData);
    addSystemMessage('📊 New sensor data received from device');
}

/**
 * Handle ML prediction results from WebSocket
 */
function handlePredictionResult(predictionData) {
    console.log('🤖 Prediction result received:', predictionData);
    
    if (predictionData.success && predictionData.prediction) {
        const prediction = predictionData.prediction;
        
        // Update patient results
        patientResults = {
            eGFR: prediction.egfr,
            status: prediction.kidney_status,
            riskLevel: prediction.risk_level,
            confidence: prediction.confidence_score,
            heartRate: patientResults?.heartRate || '--',
            temperature: patientResults?.temperature || '--',
            dataQuality: patientResults?.dataQuality || '--'
        };
        
        // Update display
        updatePatientInfoDisplay();
        
        // Save to storage
        sessionStorage.setItem('patientResults', JSON.stringify(patientResults));
        
        // Show result message
        const resultMsg = `✅ **Analysis Complete!**
        
**Results:**
- **eGFR:** ${prediction.egfr} mL/min/1.73m²
- **Status:** ${prediction.kidney_status}
- **Risk Level:** ${prediction.risk_level}
- **Confidence:** ${prediction.confidence_score}%

${prediction.confidence_score >= 85 ? '🎯 High confidence in results' : '⚠️ Please verify with healthcare provider'}`;
        
        addSystemMessage(resultMsg);
    } else if (predictionData.error) {
        addSystemMessage(`❌ Prediction error: ${predictionData.error}`);
    }
}

/**
 * Add system message to chat
 */
function addSystemMessage(message) {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<div class="message-content">${sanitizeHTML(message)}</div>`;
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}
