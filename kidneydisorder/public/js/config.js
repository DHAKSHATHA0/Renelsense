// Server Configuration
const serverConfig = {
    host: window.location.hostname,
    port: window.location.port || (window.location.protocol === 'https:' ? 443 : 80),
    protocol: window.location.protocol.replace(':', ''),
    
    getBaseURL() {
        return `${this.protocol}://${this.host}${this.port ? ':' + this.port : ''}`;
    },
    
    getWebSocketURL() {
        const wsProtocol = this.protocol === 'https' ? 'wss' : 'ws';
        return `${wsProtocol}://${this.host}${this.port ? ':' + this.port : ''}`;
    },
    
    getAPIURL(endpoint) {
        return `${this.getBaseURL()}${endpoint}`;
    }
};

console.log('Server Config:', serverConfig);
