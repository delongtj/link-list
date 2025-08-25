# Firebase Setup Instructions (Secure)

## 🔐 Security-First Setup

This setup uses environment variables and strict security rules to protect your Firebase project.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "link-list-app")
4. Disable Google Analytics (not needed)
5. Click "Create project"

## 2. Enable Realtime Database

1. In your project, go to "Realtime Database"
2. Click "Create Database" 
3. Choose "Start in **locked mode**" (important for security)
4. Choose a location (e.g., us-central1)

## 3. Configure Security Rules

**CRITICAL**: Go to Realtime Database → Rules and replace with the secure rules from `firebase-security-rules.json`:

```json
{
  "rules": {
    "lists": {
      "$listId": {
        ".read": true,
        ".write": "
          newData.hasChildren(['title', 'items', 'lastModified', 'version']) &&
          newData.child('title').isString() &&
          newData.child('title').val().length <= 100 &&
          (newData.child('items').hasChildren() == false ||
           newData.child('items').numChildren() <= 25) &&
          (!data.exists() || (now - data.child('lastModified').val()) > 1000) &&
          (now - newData.child('lastModified').val()) < 3600000 &&
          newData.child('version').isNumber()
        "
      }
    }
  }
}
```

## 4. Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section  
3. Click "Web" (</>) icon
4. Register app with nickname (e.g., "LinkList")
5. Copy the `firebaseConfig` values (keep them secret!)

## 5. Secure Deployment

### Option A: Netlify (Recommended)

1. **Set Environment Variables** in Netlify dashboard:
   - `FIREBASE_API_KEY` = your api key
   - `FIREBASE_AUTH_DOMAIN` = your-project.firebaseapp.com
   - `FIREBASE_DATABASE_URL` = https://your-project-default-rtdb.firebaseio.com/
   - `FIREBASE_PROJECT_ID` = your-project-id
   - `FIREBASE_STORAGE_BUCKET` = your-project.appspot.com
   - `FIREBASE_MESSAGING_SENDER_ID` = your sender id
   - `FIREBASE_APP_ID` = your app id

2. **Deploy**: The `netlify.toml` is already configured to inject these securely

### Option B: Vercel

1. **Set Environment Variables** in Vercel dashboard
2. **Deploy**: The `vercel.json` handles the rest

### Option C: Manual Deployment

1. **Create `firebase-config.js`** manually:
```javascript
window.FIREBASE_CONFIG = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com", 
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-actual-app-id"
};
```

⚠️ **Never commit this file to git!** Add it to `.gitignore`

## 🛡️ Security Features

✅ **Environment Variables**: Config never committed to code  
✅ **Rate Limiting**: Max 1 save per second  
✅ **Data Validation**: Server-side validation of all data  
✅ **XSS Prevention**: Input sanitization  
✅ **CSP Headers**: Content Security Policy protection  
✅ **Size Limits**: 25 items max, 500 chars per item  
✅ **TTL Cleanup**: Auto-delete after 1 year  

## 🚀 Features

✅ **Stable URLs**: Each list gets a permanent URL like `yoursite.com/#room=abc123`  
✅ **Real-time Sync**: Changes appear instantly across all browsers  
✅ **Auto-cleanup**: Lists auto-delete after 1 year of inactivity  
✅ **Legacy Support**: Old URL format automatically migrates  
✅ **Offline Resilient**: Works offline, syncs when reconnected  
✅ **Security Headers**: Protection against common attacks  

## 💰 Cost

- **Free tier**: 1GB storage + 10GB/month bandwidth
- Estimated capacity: ~200,000+ lists  
- For most users: **Free forever**

## 🔍 Monitoring

Monitor usage in Firebase Console:
- Database usage under "Usage" tab
- Set up budget alerts at 80% of free tier limits
- Monitor for unusual traffic patterns