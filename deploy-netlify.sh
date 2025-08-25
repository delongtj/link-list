#!/bin/bash

# Netlify deployment script with environment variable injection
# Run this script during build process

echo "🔥 Injecting Firebase configuration..."

# Debug: Check if environment variables are set
echo "DEBUG: Checking environment variables..."
echo "FIREBASE_API_KEY: ${FIREBASE_API_KEY:0:10}..." 
echo "FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}"
echo "Environment check complete."

# Verify required environment variables exist
if [ -z "$FIREBASE_API_KEY" ] || [ -z "$FIREBASE_PROJECT_ID" ]; then
    echo "❌ ERROR: Missing required Firebase environment variables!"
    echo "Please set FIREBASE_API_KEY, FIREBASE_PROJECT_ID and other Firebase config in Netlify dashboard."
    echo "Note: DO NOT declare them in netlify.toml with empty values as this overrides dashboard settings."
fi

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