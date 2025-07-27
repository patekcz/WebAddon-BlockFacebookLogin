# Facebook Login Blocker

A simple Chrome extension that blocks all Facebook login popups and overlays, so you can browse Facebook content without being forced to log in.

## Features
- Blocks Facebook login dialogs and overlays
- Keeps the rest of the site fully usable
- Easy to enable/disable via popup

## Project Structure
```
BlockFacebookLogin/
├── content.js      # Content script for blocking login overlays
├── manifest.json   # Chrome extension manifest (v3)
├── popup.html      # Popup UI
├── popup.js        # Popup logic
├── README.md       # This file
```

## Installation
1. Download or clone this repository
2. Go to `chrome://extensions/` in your browser
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder

## Usage
- The extension automatically blocks Facebook login overlays
- Use the extension icon to enable/disable blocking or view stats

## Contribution
Pull requests and issues are welcome!

## License
MIT 