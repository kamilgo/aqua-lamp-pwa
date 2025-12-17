# Aquarium Lamp PWA - Modular Structure

## Overview

This Progressive Web App controls an aquarium lamp via Raspberry Pi Pico. The application has been refactored to use **Alpine.js** for reactive state management and **Tailwind CSS** for styling, with modularized JavaScript code.

## Structure

```
www/
├── index.html              # Main HTML file with 3 tabs (Control/Schedules/Settings)
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker for offline functionality
├── index.html.backup       # Backup of original version (vanilla JS)
├── js/                     # JavaScript modules (ES6)
│   ├── app.js              # Main Alpine.js application logic
│   ├── api.js              # Device communication (HTTP API)
│   ├── storage.js          # localStorage operations
│   └── translations.js     # Bilingual support (EN/PL)
└── README.md              # This file
```

## Modules Description

### 1. `js/app.js` - Main Application

**Purpose:** Contains the Alpine.js app data function with all application state and logic.

**Key Features:**
- Application state management (tabs, connection status)
- Configuration and channel state
- Schedule management
- Event handlers for UI interactions
- Integration with other modules

**Exports:**
- `window.appData()` - Alpine.js data function

---

### 2. `js/api.js` - API Communication

**Purpose:** Handles all HTTP communication with the Raspberry Pi Pico device.

**Functions:**
- `checkConnection(deviceIP)` - Test device connectivity (ping/pong)
- `toggleChannelManualMode(deviceIP, channelNum, enabled)` - Enable/disable manual channel control
- `updateChannelPWM(deviceIP, channelNum, value)` - Set PWM value (0-100%)
- `saveConfigurationToDevice(deviceIP, config, schedules)` - Send full configuration to device

**API Endpoints Used:**
- `GET /ping` - Connection check
- `GET /channels/{num}/manual/{on|off}` - Toggle manual mode
- `GET /channels/{num}/pwm/{value}` - Set PWM value
- `POST /store` - Save configuration

---

### 3. `js/storage.js` - Local Storage

**Purpose:** Manages localStorage operations for persisting configuration.

**Functions:**
- `saveToLocalStorage(config, schedules)` - Save configuration locally
- `loadFromLocalStorage()` - Load saved configuration
- `saveLanguage(lang)` - Save language preference
- `loadLanguage()` - Load language preference
- `clearStorage()` - Clear all data (reset)
- `exportConfiguration()` - Export config as JSON
- `importConfiguration(jsonString)` - Import config from JSON

**Storage Keys:**
- `deviceConfig` - Main configuration and schedules
- `language` - Current language (en/pl)

---

### 4. `js/translations.js` - Internationalization

**Purpose:** Contains all translation strings for English and Polish.

**Exports:**
- `translations` - Object with translation dictionaries
- `translate(key, lang)` - Helper function for translations

**Supported Languages:**
- English (`en`)
- Polish (`pl`)

---

## Application Tabs

### Tab 1: Control (Sterowanie)
- Connection status indicator
- Device IP display
- 8 PWM channel controls with:
  - Toggle switches (enable/disable)
  - Sliders (0-100%)
  - Custom channel names
- "Disable All Channels" button

### Tab 2: Schedules (Harmonogramy)
- Add/remove schedules
- For each schedule:
  - Day selection (Monday-Sunday)
  - Time range (start/end)
  - Duty cycle settings (start/max/end)
  - Intervals (minutes)
  - Channel assignment
- Save configuration button

### Tab 3: Settings (Ustawienia)
- Device IP configuration
- Time synchronization toggle
- WiFi credentials (name/password)
- Custom names for 8 channels
- Save configuration button

---

## Technologies Used

- **Alpine.js 3.x** - Reactive JavaScript framework (~15KB)
- **Tailwind CSS** - Utility-first CSS framework (CDN)
- **ES6 Modules** - Modern JavaScript module system
- **Service Worker** - Offline PWA functionality
- **localStorage** - Client-side data persistence

---

## Development

### Running the App

```bash
cd www
python3 -m http.server 8000
```

Open browser: http://localhost:8000

### Browser Requirements

- Modern browser with ES6 module support
- Service Worker support (for PWA features)
- localStorage support

### Adding New Features

1. **New API endpoint:** Add function to `js/api.js`
2. **New storage operation:** Add function to `js/storage.js`
3. **New translation:** Add key/value to `js/translations.js`
4. **New UI feature:** Add to `js/app.js` and `index.html`

---

## Migration Notes

### From Old Version

The app automatically migrates data from the old format:

```javascript
// Old format
{
  deviceIP: "192.168.1.100",
  channelName1: "White",
  channelName2: "Blue",
  // ...
}

// New format
{
  config: {
    deviceIP: "192.168.1.100",
    channelNames: ["White", "Blue", ...]
  },
  schedules: [...]
}
```

The migration happens automatically in `storage.js` on first load.

---

## Future Enhancements

See `tasks.md` for planned features:
- Dashboard view
- Timeline preview
- Dark mode
- Auto-reconnect
- Stats & logs
- Export/import configuration

---

## Troubleshooting

### Module Loading Errors

If you see "Failed to load module", ensure:
1. Files are served via HTTP (not file://)
2. MIME types are correct (`.js` = `application/javascript`)
3. Module paths are correct (relative to index.html)

### CORS Errors

The device must send appropriate CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### Service Worker Issues

Clear cache and unregister:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

---

## License

This project is for personal/educational use.
