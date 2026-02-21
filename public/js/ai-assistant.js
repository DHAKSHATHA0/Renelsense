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

        // Generate bot response immediately (synchronous keyword-based)
        setTimeout(() => {
            this.removeTypingIndicator();
            const botResponse = this.generateBotResponse(userMessage);
            this.chatHistory.addMessage(botResponse, 'bot');
            this.displayMessage(botResponse, 'bot');
        }, 800); // Small delay for natural feel
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
        const message = userMessage.toLowerCase();
        
        // Kidney disease keywords
        if (message.includes('kidney') || message.includes('renal')) {
            if (message.includes('disease') || message.includes('disorder')) {
                return 'Chronic Kidney Disease (CKD) is a condition where the kidneys gradually lose their ability to filter waste from the blood. It progresses in stages from 1-5, with stage 5 being kidney failure. Common causes include diabetes, high blood pressure, and glomerulonephritis.';
            }
            if (message.includes('test') || message.includes('results')) {
                return 'Kidney function tests measure how well your kidneys work. Key tests include:\n- Creatinine: Measures waste from muscle metabolism\n- BUN (Blood Urea Nitrogen): Measures waste from protein breakdown\n- eGFR (Estimated Glomerular Filtration Rate): Shows kidney function percentage\n- Urinalysis: Checks for protein and other substances in urine';
            }
            if (message.includes('function') || message.includes('how')) {
                return 'Your kidneys filter waste and excess water from your blood to make urine. They also regulate:\n- Blood pressure through fluid balance\n- Red blood cell production (erythropoietin)\n- Calcium and phosphorus levels\n- Blood pH and electrolyte balance\nAbout 150 liters of blood are filtered daily, producing 1-2 liters of urine.';
            }
        }

        // Health and diet keywords
        if (message.includes('diet') || message.includes('food') || message.includes('eat')) {
            return 'For kidney health, consider:\n- Limiting sodium to less than 2,300mg daily\n- Controlling protein intake if in advanced CKD\n- Limiting phosphorus and potassium if advised\n- Staying hydrated with appropriate fluid intake\n- Choosing whole grains and fresh vegetables\nAlways consult your doctor or dietitian for personalized advice.';
        }

        if (message.includes('exercise') || message.includes('activity') || message.includes('physical')) {
            return 'Regular exercise supports kidney health:\n- Aim for 150 minutes of moderate activity weekly\n- Walking, swimming, and cycling are good options\n- Strength training 2-3 times per week helps maintain muscle\n- Start slowly and gradually increase intensity\n- Always check with your doctor before starting a new exercise program.';
        }

        // Symptoms keywords
        if (message.includes('symptom') || message.includes('sign') || message.includes('feel')) {
            if (message.includes('blood') || message.includes('pressure')) {
                return 'High blood pressure can damage kidneys and is both a cause and consequence of kidney disease. Blood pressure should ideally be less than 120/80 mmHg. People with CKD often need blood pressure below 130/80 mmHg. Regular monitoring is essential.';
            }
            return 'Early kidney disease often has no symptoms. As it progresses, watch for:\n- Fatigue and weakness\n- Swelling in legs, ankles, or face\n- Changes in urination (frequency, color, foam)\n- Loss of appetite\n- Nausea and vomiting\n- Difficulty concentrating\nIf you experience these, contact your healthcare provider.';
        }

        // Test result interpretation
        if (message.includes('egfr') || message.includes('glomerular')) {
            return 'eGFR (Estimated Glomerular Filtration Rate) shows kidney function level:\n- 90+: Normal kidney function\n- 60-89: Mild decrease in kidney function\n- 30-59: Moderate decrease (CKD Stage 3)\n- 15-29: Severe decrease (CKD Stage 4)\n- <15: Kidney failure (CKD Stage 5)\nYour doctor interprets results along with symptoms and creatinine levels.';
        }

        if (message.includes('creatinine')) {
            return 'Creatinine is a waste product from muscle metabolism filtered by the kidneys.\n- Normal range: 0.6-1.2 mg/dL for men, 0.5-1.1 mg/dL for women\n- Higher levels suggest reduced kidney function\n- Levels vary based on age, sex, weight, and muscle mass\n- A single creatinine result is less useful than trends over time\nYour doctor considers creatinine along with eGFR for assessment.';
        }

        // General health questions
        if (message.includes('diabetes')) {
            return 'Diabetes is a leading cause of kidney disease. High blood sugar damages the blood vessels in kidneys over time. Managing diabetes is crucial:\n- Keep blood sugar within target range\n- Take medications as prescribed\n- Monitor blood pressure\n- Get regular kidney function tests\n- Maintain healthy diet and exercise habits\nEarly detection and management can slow kidney damage.';
        }

        if (message.includes('prevent') || message.includes('prevention')) {
            return 'To prevent kidney disease:\n- Control blood sugar if diabetic\n- Manage blood pressure (<130/80 mmHg)\n- Maintain healthy weight\n- Don\'t smoke or use tobacco\n- Limit alcohol consumption\n- Reduce sodium intake\n- Exercise regularly\n- Avoid overuse of pain relievers (NSAIDs)\n- Get regular kidney function screening if at risk';
        }

        // Default response
        return 'I\'m here to help with kidney health questions. You can ask me about:\n- Kidney function and disease\n- Test results and what they mean\n- Lifestyle and diet recommendations\n- Symptoms and prevention\n- Managing chronic kidney disease\n\nWhat would you like to know?';
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
