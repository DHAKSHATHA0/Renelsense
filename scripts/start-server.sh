#!/bin/bash
# Server startup script - robust error handling

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 Smart Kidney Monitoring - Server Startup           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Show Node.js version
echo "✓ Node.js $(node --version)"
echo "✓ NPM $(npm --version)"
echo ""

# Start server with enhanced signal handling
echo "🔧 Starting server..."
echo ""

# Set environment variables for robustness
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=256"

# Run the server
node server.js

# If we get here, server has stopped
echo ""
echo "⛔ Server stopped"
