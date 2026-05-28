# 🔊 Clear Boost — Chrome Extension

> Secure Chrome extension that automatically injects and loads your protected JavaScript audio processing script from your Render server.

---

## ✨ Features

- **Auto Injection** — Runs on all websites automatically after page load
- **Discord Compatible** — Injects into all frames (`all_frames: true`)
- **Remote Script Loading** — Fetches latest script from `https://mic-wcr4.onrender.com/script`
- **Duplicate Prevention** — Guards against double injection per page
- **Retry Logic** — Automatic retries (2 attempts) on fetch failure
- **Live Status Dashboard** — Cyberpunk-themed popup with real-time status
- **Badge Indicators** — Green ✓ when active, red ! on error
- **Injection Counter** — Tracks total successful injections
- **Manifest V3** — Modern extension architecture
- **No Tampermonkey Required** — Standalone native extension

---

## 📂 Project Structure

```
clear-boost-extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── content.js         # Fetches & executes remote script
├── background.js      # Service worker — state & badge management
├── popup.html         # Dashboard UI
├── popup.js           # Popup controller logic
├── style.css          # Cyberpunk dark theme
├── icons/
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extension page icon
│   └── icon128.png    # Chrome Web Store icon
└── README.md          # This file
```

---

## 🚀 Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `clear-boost-extension` folder
5. The extension icon will appear in your toolbar — done!

---

## ⚙️ How It Works

1. **Page Load** → Content script (`content.js`) is injected automatically on every page
2. **Fetch** → Script is fetched from your Render server endpoint
3. **Execute** → Script is injected into the page via `<script>` element (eval fallback)
4. **Report** → Status is sent to the background service worker
5. **Display** → Badge and popup dashboard update in real-time

---

## 🔒 Security

| Feature | Description |
|---|---|
| Double-injection guard | `window.__CLEAR_BOOST_INJECTED__` flag prevents re-execution |
| Error isolation | Try/catch around all critical operations |
| Clean DOM | Injected `<script>` elements are immediately removed |
| No persistent DOM changes | Extension leaves zero footprint on the page |
| Console logging | All events are logged with styled console output |

---

## 🎨 UI Theme

- **Color scheme**: Black + Red cyberpunk
- **Fonts**: Orbitron (display) + Share Tech Mono (body)
- **Effects**: CRT scanlines, grid noise, neon glow, glitch flicker
- **Animations**: Pulsing status dot, staggered fade-in

---

## 📡 Server Endpoint

The extension fetches from:

```
GET https://mic-wcr4.onrender.com/script
```

Ensure your Render server returns valid JavaScript with appropriate CORS headers.

---

## 🛠️ Development

To modify the extension:

1. Edit files in the project directory
2. Go to `chrome://extensions/`
3. Click the **reload** button (🔄) on the Clear Boost card
4. Changes take effect immediately

---

## 📜 Permissions

| Permission | Reason |
|---|---|
| `scripting` | Programmatic script injection |
| `activeTab` | Access to the currently active tab |
| `storage` | Persist injection count and settings |
| `<all_urls>` | Run on all websites including Discord |

---

**Built by VK** • Manifest V3 • Zero dependencies
