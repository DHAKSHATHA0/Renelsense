#!/bin/bash or .bat script
# Quick Start Script for MySQL Integration

# Step 1: Install Node Packages
echo "📦 Installing Node.js packages..."
npm install
npm install express mysql2 cors body-parser dotenv uuid

# Step 2: Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=kidney_monitoring
DB_CONNECTION_LIMIT=10
EOF
    echo "✅ .env file created with default MySQL settings"
    echo "⚠️  Please update .env if your MySQL credentials are different"
fi

# Step 3: Check if MySQL is running
echo ""
echo "🔍 Checking MySQL connection..."
# This will attempt to start the server which will test the connection

# Step 4: Start the server
echo ""
echo "🚀 Starting Node.js server..."
node server-mysql-complete.js
