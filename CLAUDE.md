# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Progressive Web App (PWA) for configuring an aquarium lamp device. The app communicates with a Raspberry Pi Pico device over HTTP/HTTPS to control PWM channels for lighting schedules.

**Primary deployment directory**: `www/` - This is the active directory containing the current version of the application.

## Architecture

### Client-Side (PWA)
- **Single Page Application** built with vanilla JavaScript (no framework)
- **Bilingual support**: English and Polish (toggle via UI, persisted in localStorage)
- **Offline-first**: Uses Service Worker for caching and offline functionality
- **localStorage** for client-side persistence of configuration between sessions

### Device Communication
The PWA communicates with a Raspberry Pi Pico device via REST-like endpoints:
- `GET http://{deviceIP}/ping` - Connection check (expects `{message: "pong"}`)
- `POST http://{deviceIP}/store` - Send full configuration to device
- `GET http://{deviceIP}/channels/{channelNum}/manual/on` - Enable manual control for a channel
- `GET http://{deviceIP}/channels/{channelNum}/manual/off` - Disable manual control
- `GET http://{deviceIP}/channels/{channelNum}/pwm/{value}` - Set PWM value (0-100)

**Important**: Device communication uses HTTPS when served from a domain but may use HTTP in local testing. CORS mode is enabled for cross-origin requests.

### Data Model

**Schedule Object Structure**:
```javascript
{
  id: timestamp,              // Unique identifier
  days: [1-7],               // Array of day numbers (1=Monday, 7=Sunday)
  startHour: 0-23,
  startMinute: 0-59,
  endHour: 0-23,
  endMinute: 0-59,
  startDuty: 0-100,          // PWM duty cycle percentage
  maxDuty: 0-100,
  endDuty: 0-100,
  startInterval: 0,          // Minutes
  endInterval: 0,            // Minutes
  channels: [1-8]            // Array of channel numbers
}
```

**Configuration Object** (sent to device):
```javascript
{
  time: unix_timestamp,      // Seconds since epoch (or 0 to skip)
  timezone_offset: minutes,  // Offset from UTC in minutes
  wifiName: string,
  wifiPassword: string,
  schedules: [Schedule]
}
```

**localStorage Format**:
```javascript
{
  deviceIP: string,
  time: boolean,             // Sync with local time?
  wifiName: string,
  wifiPassword: string,
  channelName1-8: string,
  schedules: [Schedule]
}
```

## Key Features

### Channel Management
- 8 PWM channels with custom names
- Each channel has:
  - Enable/disable toggle
  - PWM slider (0-100%)
  - Real-time value display
  - Manual control that disables scheduled control

### Schedule System
- Dynamic schedule creation (add/remove)
- Multi-day selection (weekday-based)
- Time ranges with duty cycle ramps
- Interval settings for gradual transitions
- Multi-channel assignment per schedule

### Internationalization
Days are stored as numbers (1-7) not localized strings. The translation system uses a `translations` object with `en` and `pl` keys, mapping English text to translated versions.

## Development Workflow

### Serving the Application
The app can be served from any static file server. For local development:
```bash
cd www
python3 -m http.server 8000
```

### Testing Device Communication
1. Ensure the Pico device is accessible on the network
2. Enter device IP in the app
3. Use "Check connection" button to test `/ping` endpoint
4. PWA must be served over HTTPS for production use (PWA requirement)

### Modifying Translations
Update both `en` and `pl` objects in the `translations` object (www/index.html:696-751). The translation system automatically adds `data-translate` attributes to labels, headings, and buttons on page load.

### Working with Schedules
- Schedules are managed through a JavaScript class (`Schedule`)
- DOM elements are dynamically created via `createScheduleElement()`
- All schedule updates trigger `saveToLocalStorage()`
- Days are numbered 1-7 (Monday-Sunday) for language independence

## Important Implementation Details

### Time Handling
- Client sends Unix timestamp (seconds, not milliseconds: `Date.now().toString().substr(0, 10)`)
- Timezone offset is calculated and sent separately to the device
- Device is expected to store and use the timezone offset for schedule execution

### Service Worker Caching
The service worker (www/service-worker.js) bypasses caching for:
- `/ping` endpoint (connection checks)
- `/store` endpoint (configuration updates)

This ensures fresh responses for device communication while caching static assets.

### Channel Indexing
**Critical**: Channels are numbered 1-8 in the UI and API endpoints. Verify whether the Pico firmware uses 0-based or 1-based indexing (see www/tasks.md:22).

### CORS Configuration
All device requests use `mode: 'cors'` for cross-origin communication. The Pico device must send appropriate CORS headers for the PWA to function when served from a different origin.

## File Structure Notes

- `www/` - Active development directory (current version)
- `public_html/` - Legacy/backup directory (may be outdated)
- Root directory contains older prototype files
- `www/tasks.md` - Development task list in Polish (mix of completed and pending tasks)

## Known Issues & TODOs

From www/tasks.md:
- [ ] Channel numbering mismatch between UI (1-8) and Pico (possibly 0-7)
- [ ] WiFi credential saving on Pico device
- [ ] Device configuration reset functionality
- [x] HTTPS support for web server on Pico (completed)
- [x] Manual channel control (completed)
- [x] Connection testing via ping/pong (completed)

## Browser Compatibility

The app uses standard PWA features:
- Service Worker API
- localStorage
- Fetch API with AbortSignal.timeout
- Multiple select elements
- Range inputs (sliders)

Firefox on mobile supports HTTP device connections from HTTPS PWA, Chrome may enforce HTTPS-only.
