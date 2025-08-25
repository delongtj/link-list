#!/bin/bash

# Local development setup script
# Sources .env file and injects Firebase configuration

echo "🔧 Setting up local development environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Firebase configuration."
    exit 1
fi

echo "📄 Loading environment variables from .env..."
# Export variables from .env file
export $(cat .env | grep -v '^#' | xargs)

echo "🔥 Injecting Firebase configuration..."

# Create firebase-config.js from environment variables
cat > firebase-config.js << EOF
window.FIREBASE_CONFIG = {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "${FIREBASE_AUTH_DOMAIN}",
    databaseURL: "${FIREBASE_DATABASE_URL}",
    projectId: "${FIREBASE_PROJECT_ID}",
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${FIREBASE_APP_ID}"
};
EOF

echo "✅ Local development environment ready!"
echo "🌐 You can now open index.html in your browser or start a local server"
echo ""
echo "To test Firebase connection, check the browser console for any errors."