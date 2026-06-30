// Embedded Chatbot for Result Page
class EmbeddedChatbot {
    constructor() {
        this.isWaitingForResponse = false;
        this.apiUrl = '/api/chatbot';
        
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

        // Get AI response
        try {
            this.isWaitingForResponse = true;
            this.sendBtn.disabled = true;

            // Get patient results if available
            const patientResults = this.getPatientResults();

            const response = await this.getAIResponse(message, patientResults);

            // Remove typing indicator
            this.removeTypingIndicator();

            // Display AI response
            this.displayBotMessage(response);

        } catch (error) {
            this.removeTypingIndicator();
            console.error('Error getting response:', error);
            this.displayBotMessage('Sorry, I encountered an error. Please try again.');
        } finally {
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

    async getAIResponse(userMessage, patientResults) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    patientResults: patientResults
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.reply) {
                throw new Error('No response from server');
            }

            return data.reply;

        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Unable to connect to AI service. Please try again.');
        }
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
