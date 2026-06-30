// ========================================
// AI ASSISTANT CHAT FUNCTIONALITY
// ========================================

class ChatHistory {
    constructor() {
        this.chats = JSON.parse(localStorage.getItem('chatHistory')) || [];
        this.currentChatId = localStorage.getItem('currentChatId');
    }

    createNewChat() {
        const chat = {
            id: Date.now(),
            title: 'New Conversation',
            messages: [],
            createdAt: new Date().toISOString()
        };
        this.chats.unshift(chat);
        this.currentChatId = chat.id;
        this.save();
        return chat;
    }

    getCurrentChat() {
        if (!this.currentChatId) {
            return this.createNewChat();
        }
        return this.chats.find(c => c.id === this.currentChatId) || this.createNewChat();
    }

    addMessage(message, type) {
        const chat = this.getCurrentChat();
        chat.messages.push({
            id: Date.now(),
            content: message,
            type: type, // 'user' or 'bot'
            timestamp: new Date().toISOString()
        });

        // Update chat title based on first user message
        if (type === 'user' && chat.messages.filter(m => m.type === 'user').length === 1) {
            chat.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        }

        this.save();
        return chat;
    }

    deleteChat(chatId) {
        this.chats = this.chats.filter(c => c.id !== chatId);
        if (this.currentChatId === chatId) {
            if (this.chats.length > 0) {
                this.currentChatId = this.chats[0].id;
            } else {
                this.createNewChat();
            }
        }
        this.save();
    }

    save() {
        localStorage.setItem('chatHistory', JSON.stringify(this.chats));
        localStorage.setItem('currentChatId', this.currentChatId);
    }

    exportChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return null;

        let content = `Chat: ${chat.title}\nCreated: ${new Date(chat.createdAt).toLocaleString()}\n\n`;
        chat.messages.forEach(msg => {
            const sender = msg.type === 'user' ? 'You' : 'AI Assistant';
            const time = new Date(msg.timestamp).toLocaleTimeString();
            content += `[${time}] ${sender}: ${msg.content}\n\n`;
        });

        return content;
    }
}

class AIAssistant {
    constructor() {
        this.chatHistory = new ChatHistory();
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        this.renderChatHistory();
        this.loadCurrentChat();
    }

    renderChatHistory() {
        const historyList = document.getElementById('chatHistoryList');
        historyList.innerHTML = '';

        if (this.chatHistory.chats.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-size: 0.9rem;">No chats yet</p>';
            return;
        }

        this.chatHistory.chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `chat-history-item ${chat.id === this.chatHistory.currentChatId ? 'active' : ''}`;
            item.textContent = chat.title;
            item.onclick = () => this.selectChat(chat.id);
            historyList.appendChild(item);
        });
    }

    selectChat(chatId) {
        this.chatHistory.currentChatId = chatId;
        this.chatHistory.save();
        this.loadCurrentChat();
        this.renderChatHistory();
    }

    loadCurrentChat() {
        const chat = this.chatHistory.getCurrentChat();
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';

        if (chat.messages.length === 0) {
            this.addWelcomeMessage();
        } else {
            chat.messages.forEach(msg => {
                this.displayMessage(msg.content, msg.type);
            });
        }

        // Scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    addWelcomeMessage() {
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message bot-message welcome-message';
        welcomeDiv.innerHTML = `
            <div class="message-content">
                <h3>Welcome to AI Health Assistant</h3>
                <p>I'm here to help you understand your test results and answer health-related questions about kidney disorders.</p>
                <div class="suggestion-chips">
                    <button class="chip" onclick="window.aiAssistant.sendDirectMessage('Explain my kidney test results')">Explain test results</button>
                    <button class="chip" onclick="window.aiAssistant.sendDirectMessage('What is chronic kidney disease?')">About kidney disease</button>
                    <button class="chip" onclick="window.aiAssistant.sendDirectMessage('Download my chat history')">Download chat</button>
                </div>
            </div>
        `;
        messagesContainer.appendChild(welcomeDiv);
    }

    displayMessage(content, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendDirectMessage(message) {
        const input = document.getElementById('chatInput');
        input.value = message;
        this.sendMessage(message);
    }

    sendMessage(userMessage) {
        // Add user message to chat
        this.chatHistory.addMessage(userMessage, 'user');
        this.displayMessage(userMessage, 'user');

        // Clear input
        document.getElementById('chatInput').value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response (in production, call your backend API)
        setTimeout(() => {
            const botResponse = this.generateBotResponse(userMessage);
            this.chatHistory.addMessage(botResponse, 'bot');
            this.removeTypingIndicator();
            this.displayMessage(botResponse, 'bot');
        }, 1000);
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Knowledge base responses
        const responses = {
            'test results': {
                keywords: ['test results', 'explain', 'report'],
                response: `Based on your test results, I can help interpret the following key metrics:\n\n• Creatinine Levels: Measures kidney function\n• GFR (Glomerular Filtration Rate): Indicates how well kidneys filter waste\n• Proteinuria: Presence of protein in urine\n\nPlease share your specific test values for a detailed analysis. Would you like me to explain any of these metrics further?`
            },
            'kidney disease': {
                keywords: ['chronic kidney disease', 'ckd', 'kidney disorder', 'kidney disease'],
                response: `Chronic Kidney Disease (CKD) is a long-term condition where the kidneys gradually lose function. Here are the key points:\n\n**Stages of CKD:**\n1. Normal kidney function (GFR > 90)\n2. Mild reduction (GFR 60-89)\n3. Moderate reduction (GFR 30-59)\n4. Severe reduction (GFR 15-29)\n5. Kidney failure (GFR < 15)\n\nCommon causes include diabetes, high blood pressure, and glomerulonephritis. Regular monitoring is important for early detection.`
            },
            'treatment': {
                keywords: ['treatment', 'medication', 'therapy', 'cure'],
                response: `Treatment for kidney disease depends on the cause and stage. Common approaches include:\n\n• **Lifestyle Changes**: Diet modification, reducing sodium, controlling blood pressure\n• **Medications**: ACE inhibitors, ARBs to reduce protein loss\n• **Regular Monitoring**: Blood tests and urine tests to track progression\n• **Advanced Options**: Dialysis or transplant for advanced CKD\n\nIt's essential to work with your nephrologist for a personalized treatment plan.`
            },
            'diet': {
                keywords: ['diet', 'food', 'nutrition', 'eat'],
                response: `A kidney-friendly diet can help slow disease progression:\n\n**Foods to Limit:**\n• Salt and sodium\n• Potassium-rich foods (bananas, oranges)\n• Phosphorus (processed foods, dairy)\n• Protein (in advanced stages)\n\n**Recommended Foods:**\n• Fresh fruits and vegetables (low sodium)\n• Whole grains\n• Lean proteins in controlled amounts\n\nConsult a renal dietitian for personalized recommendations.`
            },
            'download': {
                keywords: ['download', 'export', 'save', 'history'],
                response: `I can help you download your chat history. Use the download button in the top right of this page to save this conversation as a text file. This way you can keep a record of our discussion for future reference with your healthcare provider.`
            }
        };

        // Find matching response
        for (const [key, data] of Object.entries(responses)) {
            if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return data.response;
            }
        }

        // Default response
        return `Thank you for your question! I'm here to help with information about kidney health and test result analysis.\n\nTo provide more accurate assistance, could you please clarify:\n• Are you asking about test results interpretation?\n• Do you need information about a specific kidney condition?\n• Are you looking for lifestyle and diet recommendations?\n\nFeel free to ask any health-related questions!`;
    }

    setupEventListeners() {
        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.chatHistory.createNewChat();
            this.renderChatHistory();
            this.loadCurrentChat();
        });

        // Delete chat button
        document.getElementById('deleteChatBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this chat?')) {
                this.chatHistory.deleteChat(this.chatHistory.currentChatId);
                this.renderChatHistory();
                this.loadCurrentChat();
            }
        });

        // Export chat button
        document.getElementById('exportChatBtn').addEventListener('click', () => {
            const content = this.chatHistory.exportChat(this.chatHistory.currentChatId);
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Chat form submission
        document.getElementById('chatForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chatInput').value.trim();
            if (input) {
                this.sendMessage(input);
            }
        });
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    window.aiAssistant = new AIAssistant();
});
