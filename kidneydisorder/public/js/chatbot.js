// Real-Time AI Chatbot using Google Gemini API
// No keyword-based responses - uses pure AI for all messages

class KidneyHealthChatbot {
    constructor() {
        this.conversationHistory = [];
        this.isWaitingForResponse = false;
        this.apiUrl = '/api/chatbot';
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
        try {
            console.log('🤖 Sending message to API...');
            
            // Set a 10-second timeout for the API response
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
            );

            const fetchPromise = fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage
                })
            });

            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            console.log('📨 Response received, status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Data parsed successfully');

            // Check for API errors
            if (!data.success) {
                console.warn('⚠️ API returned success: false');
                if (!data.reply) {
                    throw new Error(data.message || 'No response from server');
                }
            }

            if (!data.reply) {
                console.warn('⚠️ No reply in response');
                throw new Error('No response from server');
            }

            console.log('🎉 Got response from AI');
            return data.reply;

        } catch (error) {
            console.error('❌ API Error:', error.message);
            throw error;
        }
    }

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
