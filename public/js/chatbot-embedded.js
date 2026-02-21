// Embedded Chatbot for Result Page - Keyword Based
class EmbeddedChatbot {
    constructor() {
        this.isWaitingForResponse = false;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessagesEmbedded');
        this.messageInput = document.getElementById('messageInputEmbedded');
        this.sendBtn = document.getElementById('sendBtnEmbedded');
        
        // Make sure elements exist before continuing
        if (!this.chatMessages || !this.messageInput || !this.sendBtn) {
            console.log('Chatbot elements not found on this page');
            return;
        }
    }

    setupEventListeners() {
        if (!this.sendBtn) return;
        
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.isWaitingForResponse) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-focus input
        this.messageInput.focus();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message) {
            return;
        }

        if (this.isWaitingForResponse) {
            return;
        }

        // Clear input
        this.messageInput.value = '';

        // Remove welcome message if it exists
        this.removeWelcomeMessage();

        // Add user message to chat
        this.displayUserMessage(message);

        // Show typing indicator
        this.showTypingIndicator();

        // Get AI response (keyword-based)
        try {
            this.isWaitingForResponse = true;
            this.sendBtn.disabled = true;

            // Get patient results if available
            const patientResults = this.getPatientResults();

            const response = this.getAIResponse(message, patientResults);

            // Remove typing indicator after delay
            setTimeout(() => {
                this.removeTypingIndicator();
                this.displayBotMessage(response);
                this.isWaitingForResponse = false;
                this.sendBtn.disabled = false;
                this.messageInput.focus();
            }, 600);

        } catch (error) {
            this.removeTypingIndicator();
            console.error('Error getting response:', error);
            this.displayBotMessage('Sorry, I encountered an error. Please try again.');
            this.isWaitingForResponse = false;
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    getPatientResults() {
        // Try to get patient results from the result page
        try {
            return {
                eGFR: document.getElementById('eGFRValue')?.textContent || '',
                status: document.getElementById('healthStatus')?.textContent?.trim() || '',
                riskLevel: document.getElementById('riskLevel')?.textContent || '',
                confidence: document.getElementById('confidence')?.textContent || '',
                ckdStage: document.getElementById('ckdStage')?.textContent || ''
            };
        } catch (e) {
            return null;
        }
    }

    getAIResponse(userMessage, patientResults) {
        const message = userMessage.toLowerCase();
        let response = '';

        // If we have patient results, provide personalized responses
        if (patientResults && patientResults.status) {
            if (message.includes('result') || message.includes('status') || message.includes('score')) {
                response = `Based on your test results:\n`;
                if (patientResults.eGFR) response += `- eGFR: ${patientResults.eGFR}\n`;
                if (patientResults.ckdStage) response += `- CKD Stage: ${patientResults.ckdStage}\n`;
                if (patientResults.riskLevel) response += `- Risk Level: ${patientResults.riskLevel}\n`;
                response += `Please consult with your healthcare provider for detailed interpretation and personalized care plan.`;
                return response;
            }
        }

        // Kidney disease keywords
        if (message.includes('kidney') || message.includes('renal')) {
            if (message.includes('disease') || message.includes('disorder') || message.includes('what')) {
                return 'Chronic Kidney Disease (CKD) is a condition where the kidneys gradually lose their ability to filter waste from the blood. It progresses in stages 1-5, with stage 5 being kidney failure. Common causes include diabetes, high blood pressure, and inflammation of kidney filters.';
            }
            if (message.includes('test') || message.includes('results') || message.includes('score')) {
                return 'kidney test results measure:\n- Creatinine: Waste from muscles\n- BUN: Waste from proteins\n- eGFR: Overall kidney function (in %)\n- Urinalysis: Protein and other substances in urine\nHigher eGFR means better kidney function.';
            }
            if (message.includes('function')) {
                return 'Your kidneys filter waste and excess water from blood to make urine. They also regulate blood pressure, red blood cells, and mineral balance. Healthy kidneys filter about 150 liters of blood daily.';
            }
        }

        // Health and diet
        if (message.includes('diet') || message.includes('food') || message.includes('eat')) {
            return 'For kidney health:\n- Limit sodium intake\n- Control protein if advised\n- Watch phosphorus and potassium\n- Stay hydrated properly\n- Choose whole grains and fresh vegetables\nConsult your doctor or dietitian for personalized advice.';
        }

        if (message.includes('exercise') || message.includes('activity')) {
            return 'Regular exercise helps kidney health:\n- Aim for 150 minutes moderate activity weekly\n- Walking, swimming, cycling are good\n- Strength training 2-3 times weekly\n- Start slowly and check with your doctor';
        }

        // Symptoms
        if (message.includes('symptom') || message.includes('sign') || message.includes('feel')) {
            return 'Watch for kidney disease signs:\n- Fatigue and weakness\n- Swelling in legs or face\n- Changes in urination\n- Loss of appetite\n- Nausea\n- Difficulty concentrating\nSee a doctor if you experience these.';
        }

        // Test values
        if (message.includes('egfr') || message.includes('glomerular')) {
            return 'eGFR shows kidney function:\n- 90+: Normal\n- 60-89: Mild decrease\n- 30-59: Moderate (Stage 3)\n- 15-29: Severe (Stage 4)\n- <15: Failure (Stage 5)';
        }

        if (message.includes('creatinine')) {
            return 'Creatinine is a waste product from muscles:\n- Normal: 0.6-1.2 mg/dL (men), 0.5-1.1 mg/dL (women)\n- Higher levels suggest lower kidney function\n- Levels vary by age, sex, and muscle mass\n- Your doctor compares results over time.';
        }

        // Default
        return 'I can help with kidney health questions. Ask about test results, kidney disease, diet, exercise, or prevention. What would you like to know?';
    }

    displayUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-embedded user';
        messageDiv.innerHTML = `
            <div class="message-content-embedded">${this.escapeHtml(message)}</div>
            <div class="avatar-embedded"><i class="fas fa-user"></i></div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    displayBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-embedded bot';

        // Format the message with proper line breaks
        const formattedMessage = message
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');

        messageDiv.innerHTML = `
            <div class="avatar-embedded"><i class="fas fa-robot"></i></div>
            <div class="message-content-embedded">${formattedMessage}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message-embedded bot';
        typingDiv.id = 'typing-indicator-embedded';
        typingDiv.innerHTML = `
            <div class="avatar-embedded"><i class="fas fa-robot"></i></div>
            <div class="typing-indicator-embedded">
                <div class="typing-dot-embedded"></div>
                <div class="typing-dot-embedded"></div>
                <div class="typing-dot-embedded"></div>
            </div>
        `;

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator-embedded');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    removeWelcomeMessage() {
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message-embedded');
        if (welcomeMessage) {
            welcomeMessage.remove();
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
}

// Initialize embedded chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if chatbot elements exist on the page
    if (document.getElementById('chatMessagesEmbedded')) {
        const chatbot = new EmbeddedChatbot();
        window.embeddedChatbot = chatbot;
        console.log('✅ Embedded Chatbot initialized on Result Page');
    }
});
