#!/bin/bash

# Netlify deployment script with environment variable injection
# Run this script during build process

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

echo "✅ Firebase configuration injected successfully!"
echo "📦 Build complete - ready for deployment"