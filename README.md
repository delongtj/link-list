# LinkList

A collaborative list-sharing app that stores all data in shareable links - no accounts, no apps, no hassle! Perfect for shopping lists, checklists, and quick collaboration.

## 🚀 Features

- **Link-Based Storage**: Your entire list lives in the link - just copy and share it
- **Instant Access**: No sign-ups, no loading screens - start creating immediately  
- **Collaborative**: Anyone with the link can view and edit your list
- **Mobile-Friendly**: Responsive design that works great on all devices
- **Easy Sharing**: Share via link copy or native device sharing

## 🛠 Tech Stack

- Pure HTML, CSS, and JavaScript (no dependencies!)
- Modern CSS with CSS Grid and Flexbox
- Web APIs for clipboard and sharing  
- Base64 encoding for link data storage

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
4. **Share**: Click the Share button to copy the link and send to others
5. **Edit Together**: Anyone with the link can modify the list

## 🔒 Privacy & Data

- All data is stored client-side in the link
- No servers, no databases, no tracking
- Lists are only as private as you keep the links
- Data persists as long as you have the link

## ⚡ Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+  
- Safari 14+
- Mobile browsers supported

## 📋 List Limits

- Maximum of 25 items per list for reliable sharing
- Up to 500 characters per item
- Works reliably across all browsers and platforms