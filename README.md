# URLList

A collaborative list-sharing app that stores all data in shareable URLs - no accounts or databases required!

## 🚀 Features

- **URL-Based Storage**: Your entire list lives in the URL - just copy and share the link
- **Instant Access**: No sign-ups, no loading screens - start creating immediately  
- **Collaborative**: Anyone with the link can view and edit your list
- **Mobile-Friendly**: Responsive design that works great on all devices
- **Real-Time Sharing**: Share via URL copy or native device sharing

## 🛠 Tech Stack

- Pure HTML, CSS, and JavaScript (no dependencies!)
- Modern CSS with CSS Grid and Flexbox
- Web APIs for clipboard and sharing
- Base64 encoding for URL data storage

## 📦 Deployment

This app is designed for static hosting and works perfectly with:

- Netlify (recommended - includes `netlify.toml` config)
- Vercel
- GitHub Pages  
- Any static file server

### Deploy to Netlify

1. Upload the project folder to a Git repository
2. Connect your repo to Netlify
3. Deploy! No build process needed.

Or use Netlify's drag-and-drop deployment for instant hosting.

## 🔧 Local Development

Serve the files with any static web server:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## 📱 How It Works

1. **Create a List**: Click "Create New List" to start
2. **Add Items**: Type items and press Enter or click the + button
3. **Collaborate**: Check off items, edit text inline, or delete items
4. **Share**: Click the Share button to copy the URL and send to others
5. **Edit Together**: Anyone with the URL can modify the list

## 🔒 Privacy & Data

- All data is stored client-side in the URL
- No servers, no databases, no tracking
- Lists are only as private as you keep the URLs
- Data persists as long as you have the URL

## ⚡ Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+  
- Safari 14+
- Mobile browsers supported

## 📋 URL Length Limits

- Most browsers support URLs up to ~2000 characters
- Approximately 100-200 list items depending on text length
- Warning shown if approaching limits