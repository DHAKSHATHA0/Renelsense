// Real-Time Kidney Health Chatbot
// Keyword-based responses - No API calls

class KidneyHealthChatbot {
    constructor() {
        this.conversationHistory = [];
        this.isWaitingForResponse = false;
        this.messageElements = new Map();
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadConversationHistory();
        this.checkForInitialQuestion();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearBtn = document.getElementById('clearBtn');
    }

    setupEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.isWaitingForResponse) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear conversation
        this.clearBtn.addEventListener('click', () => this.clearConversation());

        // Auto-focus input
        this.messageInput.focus();
    }

    // Check for initial question from URL parameter
    checkForInitialQuestion() {
        const urlParams = new URLSearchParams(window.location.search);
        const topic = urlParams.get('topic');
        
        if (topic) {
            // Set the input field and send the message automatically
            setTimeout(() => {
                this.messageInput.value = topic;
                this.sendMessage();
            }, 500);
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message) {
            this.showNotification('Please enter a message', 'error');
            return;
        }

        if (this.isWaitingForResponse) {
            this.showNotification('Waiting for response... please wait', 'error');
            return;
        }

        // Clear input
        this.messageInput.value = '';
        this.messageInput.focus();

        // Add user message to chat
        this.displayUserMessage(message);

        // Add to history
        this.conversationHistory.push({
            role: 'user',
            message: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Show typing indicator
        this.showTypingIndicator();

        // Get AI response
        try {
            this.isWaitingForResponse = true;
            this.sendBtn.disabled = true;

            const response = await this.getAIResponse(message);

            // Remove typing indicator
            this.removeTypingIndicator();

            // Display AI response
            this.displayBotMessage(response);

            // Add to history
            this.conversationHistory.push({
                role: 'bot',
                message: response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // Save conversation
            this.saveConversationHistory();

        } catch (error) {
            this.removeTypingIndicator();
            console.error('Error getting response:', error);
            
            // Show error message
            const errorMessage = error.message || 'Failed to get response from AI. Please try again.';
            this.displayBotMessage(`❌ Error: ${errorMessage}`);

            // Still add to history for reference
            this.conversationHistory.push({
                role: 'bot',
                message: `Error: ${errorMessage}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

        } finally {
            this.isWaitingForResponse = false;
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    async getAIResponse(userMessage) {
        // Simulate API call delay for natural feel, but use keyword-based responses
        return new Promise((resolve) => {
            setTimeout(() => {
                const response = this.generateKeywordResponse(userMessage);
                resolve(response);
            }, 600);
        });
    }

    generateKeywordResponse(userMessage) {
        const message = userMessage.toLowerCase();

        // Kidney disease keywords
        if (message.includes('kidney') || message.includes('renal')) {
            if (message.includes('disease') || message.includes('disorder')) {
                return 'Chronic Kidney Disease (CKD) is a condition where the kidneys gradually lose their ability to filter waste from the blood. It progresses in stages 1-5, with stage 5 being kidney failure. Common causes include diabetes, high blood pressure, and inflammation of kidney filters (glomerulonephritis).';
            }
            if (message.includes('test') || message.includes('results')) {
                return 'Kidney function tests measure how well your kidneys work:\n• Creatinine: Measures waste from muscle metabolism\n• BUN (Blood Urea Nitrogen): Measures waste from protein breakdown\n• eGFR (Estimated Glomerular Filtration Rate): Shows kidney function percentage\n• Urinalysis: Checks for protein and other substances in urine';
            }
            if (message.includes('function') || message.includes('how')) {
                return 'Your kidneys filter waste and excess water from your blood to make urine. They also regulate:\n• Blood pressure through fluid balance\n• Red blood cell production\n• Calcium and phosphorus levels\n• Blood pH and electrolyte balance\nAbout 150 liters of blood are filtered daily, producing 1-2 liters of urine.';
            }
        }

        // Health and diet keywords
        if (message.includes('diet') || message.includes('food') || message.includes('eat')) {
            return 'For kidney health, consider:\n• Limiting sodium to less than 2,300mg daily\n• Controlling protein intake if in advanced CKD\n• Limiting phosphorus and potassium if advised\n• Staying hydrated with appropriate fluid intake\n• Choosing whole grains and fresh vegetables\nAlways consult your doctor for personalized advice.';
        }

        if (message.includes('exercise') || message.includes('activity') || message.includes('physical')) {
            return 'Regular exercise supports kidney health:\n• Aim for 150 minutes of moderate activity weekly\n• Walking, swimming, and cycling are good options\n• Strength training 2-3 times per week helps maintain muscle\n• Start slowly and gradually increase intensity\n• Always check with your doctor before starting exercise.';
        }

        // Symptoms keywords
        if (message.includes('symptom') || message.includes('sign') || message.includes('feel')) {
            if (message.includes('blood') || message.includes('pressure')) {
                return 'High blood pressure can damage kidneys and is both a cause and consequence of kidney disease. Blood pressure should ideally be less than 120/80 mmHg. People with CKD often need BP below 130/80 mmHg. Regular monitoring is essential.';
            }
            return 'Early kidney disease often has no symptoms. As it progresses, watch for:\n• Fatigue and weakness\n• Swelling in legs, ankles, or face\n• Changes in urination (frequency, color, foam)\n• Loss of appetite\n• Nausea and vomiting\n• Difficulty concentrating\nIf you experience these, contact your healthcare provider.';
        }

        // Test result interpretation
        if (message.includes('egfr') || message.includes('glomerular')) {
            return 'eGFR (Estimated Glomerular Filtration Rate) shows kidney function level:\n• 90+: Normal kidney function\n• 60-89: Mild decrease in kidney function\n• 30-59: Moderate decrease (CKD Stage 3)\n• 15-29: Severe decrease (CKD Stage 4)\n• <15: Kidney failure (CKD Stage 5)\nYour doctor interprets results along with symptoms.';
        }

        if (message.includes('creatinine')) {
            return 'Creatinine is a waste product from muscle metabolism filtered by the kidneys.\n• Normal range: 0.6-1.2 mg/dL for men\n• Normal range: 0.5-1.1 mg/dL for women\n• Higher levels suggest reduced kidney function\n• Works with eGFR for accurate assessment\nYour doctor considers creatinine along with other tests.';
        }

        // General health questions
        if (message.includes('diabetes')) {
            return 'Diabetes is a leading cause of kidney disease. High blood sugar damages blood vessels in kidneys over time. Managing diabetes is crucial:\n• Keep blood sugar within target range\n• Take medications as prescribed\n• Monitor blood pressure\n• Get regular kidney function tests\n• Maintain healthy diet and exercise\nEarly detection and management can slow kidney damage significantly.';
        }

        if (message.includes('prevent') || message.includes('prevention')) {
            return 'To prevent kidney disease:\n• Control blood sugar if diabetic\n• Manage blood pressure (<130/80 mmHg)\n• Maintain healthy weight\n• Don\'t smoke or use tobacco\n• Limit alcohol consumption\n• Reduce sodium intake\n• Exercise regularly\n• Avoid overuse of pain relievers\n• Get regular kidney screening if at risk';
        }

        // Default response
        return 'I\'m here to help with kidney health questions. You can ask me about:\n• Kidney function and disease\n• Understanding test results\n• Lifestyle and diet recommendations\n• Symptoms and prevention\n• Managing chronic kidney disease\n\nWhat would you like to know?';

    displayUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="avatar"><i class="fas fa-user"></i></div>
        `;

        // Remove welcome message if it exists
        this.removeWelcomeMessage();

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    displayBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';

        // Format the message with proper line breaks and preserve structure
        const formattedMessage = message
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');

        messageDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">${formattedMessage}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    removeWelcomeMessage() {
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
    }

    clearConversation() {
        if (this.conversationHistory.length === 0) {
            this.showNotification('No conversation to clear', 'error');
            return;
        }

        if (confirm('Are you sure you want to clear the conversation? This cannot be undone.')) {
            this.conversationHistory = [];
            this.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <h2>🤖 Kidney Health Assistant</h2>
                    <p>Powered by Google Gemini AI</p>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">
                        Ask me anything about kidney health, kidney stones, kidney disease, eGFR, and medical care advice.
                    </p>
                </div>
            `;
            this.messageInput.value = '';
            this.messageInput.focus();
            localStorage.removeItem('chatbotHistory');
            this.showNotification('Conversation cleared', 'success');
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('chatbotHistory', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('chatbotHistory');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                
                // Display saved conversation
                if (this.conversationHistory.length > 0) {
                    this.removeWelcomeMessage();
                    this.conversationHistory.forEach(item => {
                        if (item.role === 'user') {
                            this.displayUserMessage(item.message);
                        } else {
                            this.displayBotMessage(item.message);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 0);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Show notification in input placeholder temporarily
        const original = this.messageInput.placeholder;
        this.messageInput.placeholder = message;
        
        setTimeout(() => {
            this.messageInput.placeholder = original;
        }, 3000);
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new KidneyHealthChatbot();
    
    // Make it globally accessible for debugging
    window.chatbot = chatbot;
    
    console.log('✅ Kidney Health Chatbot initialized');
    console.log('Ready to answer questions about kidney health using Google Gemini AI');
});
