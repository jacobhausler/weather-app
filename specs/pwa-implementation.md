# PWA Implementation Specification

## Overview

HAUS Weather Station is implemented as a Progressive Web App (PWA) using the Vite PWA plugin with Workbox. This enables the application to be installed on mobile and desktop devices, work offline, and provide a native app-like experience.

## PWA Plugin Configuration

**Plugin**: `vite-plugin-pwa` v1.0.3
**Service Worker Library**: Workbox v7.3.0
**Configuration Location**: `vite.config.ts`

### Key Configuration Settings

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico'],
  manifest: { ... },
  workbox: { ... }
})
```

## Manifest Configuration

The Web App Manifest defines how the PWA appears when installed on user devices.

### App Identity

- **Name**: `HAUS Weather Station`
- **Short Name**: `HAUS Weather`
- **Description**: `Self-hosted personal weather forecast application powered by the National Weather Service`

### Display Settings

- **Display Mode**: `standalone` - Displays as a standalone application without browser UI
- **Orientation**: `portrait` - Locks to portrait orientation on mobile devices
- **Scope**: `/` - All URLs within the origin are part of the app scope
- **Start URL**: `/` - App launches at root URL when opened from home screen

### Theme and Branding

- **Theme Color**: `#0f172a` (Slate 900 - dark blue, matches app header)
- **Background Color**: `#ffffff` (White - shown during app launch)

### App Icons

Three SVG icons in two sizes for different contexts:

1. **192x192 Icon** (`/pwa-192x192.svg`)
   - Size: 192x192 pixels
   - Type: SVG (vector)
   - Purpose: `any` (general use)

2. **512x512 Icon** (`/pwa-512x512.svg`)
   - Size: 512x512 pixels
   - Type: SVG (vector)
   - Purpose: `any` (general use)

3. **512x512 Maskable Icon** (`/pwa-512x512.svg`)
   - Size: 512x512 pixels
   - Type: SVG (vector)
   - Purpose: `maskable` (adaptive icon for Android)

**Icon Design**:
- Dark slate background (`#0f172a`) with 32px border radius
- Sun icon (yellow/amber) with rays
- Cloud icon (blue) overlaying sun
- "HAUS" text label at bottom in white
- Design represents weather theme with clean, modern aesthetic

## Service Worker Configuration

### Registration Strategy

**Type**: `autoUpdate`

The service worker automatically updates when a new version is detected:
1. New service worker installs in background
2. When ready, new service worker activates
3. Page reloads automatically to use new version
4. No user intervention required

### Asset Caching

**Precache Pattern**: `**/*.{js,css,html,ico,png,svg,woff,woff2}`

All static assets matching these patterns are precached during service worker installation:
- JavaScript bundles (`.js`)
- Stylesheets (`.css`)
- HTML files (`.html`)
- Icons (`.ico`, `.png`, `.svg`)
- Web fonts (`.woff`, `.woff2`)

This ensures core app functionality works offline immediately after first load.

## Runtime Caching Strategies

The service worker implements network-first caching for all API calls to balance freshness with offline capability.

### 1. National Weather Service API Cache

**URL Pattern**: `/^https:\/\/api\.weather\.gov\/.*/i`
**Strategy**: NetworkFirst
**Cache Name**: `nws-api-cache`

**Configuration**:
- **Max Entries**: 50 cached responses
- **Max Age**: 1 hour (3,600 seconds)
- **Cacheable Status Codes**: 0, 200

**Behavior**:
1. Attempt network request first
2. If network succeeds, update cache and return response
3. If network fails, serve from cache (if available)
4. If both fail, error propagates to app

**Rationale**: Weather data changes frequently but NWS API is generally reliable. 1-hour cache provides fresh data while enabling offline access to recent forecasts.

### 2. Sunrise/Sunset API Cache

**URL Pattern**: `/^https:\/\/api\.sunrise-sunset\.org\/.*/i`
**Strategy**: NetworkFirst
**Cache Name**: `sunrise-api-cache`

**Configuration**:
- **Max Entries**: 10 cached responses
- **Max Age**: 24 hours (86,400 seconds)
- **Cacheable Status Codes**: 0, 200

**Behavior**: Same as NWS API cache

**Rationale**: Sunrise/sunset times change slowly (daily). 24-hour cache is appropriate since data remains valid for entire day and fewer locations are typically queried.

### 3. Backend API Cache

**URL Pattern**: `/^\/api\/.*/i`
**Strategy**: NetworkFirst
**Cache Name**: `backend-api-cache`

**Configuration**:
- **Max Entries**: 100 cached responses
- **Max Age**: 10 minutes (600 seconds)
- **Network Timeout**: 10 seconds

**Behavior**:
1. Attempt network request
2. If network doesn't respond within 10 seconds, fall back to cache
3. If network succeeds, update cache
4. If network fails after timeout, serve from cache

**Rationale**: Backend aggregates multiple NWS API calls and includes server-side caching. 10-minute cache balances fresh data with offline capability. Network timeout ensures fast fallback to cache if backend is slow/unavailable.

## Offline Behavior

### First Visit (Not Cached)
- User must be online for initial app load
- Service worker installs and precaches static assets
- No weather data available offline yet

### Subsequent Visits (Cached)
- App shell (HTML/CSS/JS) loads instantly from cache
- Previously viewed weather data available from runtime caches
- Cache expiration times determine data freshness
- User sees last successful weather data if offline

### Offline Limitations
- Cannot fetch weather for new ZIP codes
- Cannot refresh expired cache entries
- Alert data not cached (real-time only)
- Backend refresh endpoint unavailable

### Network Recovery
- When connection restored, service worker automatically fetches fresh data
- Caches update in background
- User may manually refresh to force immediate update

## Installable App Features

### Installation Triggers

The PWA can be installed when:
1. User visits site on HTTPS
2. Service worker successfully registers
3. Web app manifest is valid
4. Site meets minimum engagement heuristics (varies by browser)

Browser will show install prompt:
- **Chrome/Edge**: Install button in address bar, banner after engagement
- **Safari iOS**: Share menu > Add to Home Screen
- **Firefox**: Install button in page actions menu

### Installed App Experience

**Launch Behavior**:
- Opens in standalone window (no browser chrome)
- Appears in app launcher/home screen
- Task switcher shows as separate app
- Portrait orientation locked on mobile

**App Icon**:
- HAUS Weather branded icon appears on home screen
- Splash screen shows icon + background color during launch

**Platform Integration**:
- Listed in installed apps (can be uninstalled like native app)
- May appear in app drawer (Android)
- Dock/taskbar pinning (desktop)

## Update Mechanism

### Service Worker Update Process

**Detection**:
- Browser checks for new service worker on navigation
- Checks every 24 hours minimum (browser-controlled)
- Manual refresh triggers update check

**Update Flow** (autoUpdate strategy):

1. **Installation**
   - New service worker detected
   - Downloads and installs in background
   - Old service worker continues serving current page

2. **Activation**
   - New service worker activates automatically
   - Old service worker terminated
   - All controlled pages reload

3. **Cache Updates**
   - New static assets precached
   - Old cache entries cleaned up
   - Runtime caches persist (gradual refresh)

### Update Timing

**Automatic**: No user action needed
- User loads app, update detected
- Update installs in background
- Page reloads when ready (usually < 5 seconds)

**Transparent**: Minimal disruption
- Current session continues during installation
- Reload happens between user interactions
- No data loss (Zustand state persists in localStorage)

### Force Update

Users can force immediate update check:
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Close all app tabs/windows, reopen
3. Unregister service worker via DevTools (development only)

## Cache Management

### Storage Limits

**Browser Quotas**:
- Chrome/Edge: ~60% of free disk space
- Firefox: ~50% of free disk space
- Safari: ~1GB per origin

**Current Usage Estimate**:
- Precached assets: ~100-200 KB (minified bundles)
- NWS API cache: ~5-50 KB per entry × 50 = 250-2500 KB
- Sunrise API cache: ~2 KB per entry × 10 = 20 KB
- Backend API cache: ~50-500 KB per entry × 100 = 5-50 MB
- **Total**: ~5-53 MB (well within limits)

### Cache Expiration

**Automatic Cleanup**:
- Workbox enforces max entries and max age
- LRU (Least Recently Used) eviction when limits reached
- Expired entries removed during cache queries

**Manual Cleanup**:
- Browser storage settings allow clearing site data
- Service worker unregistration clears all caches
- DevTools provide cache inspection/deletion

### Cache Strategy Justification

**Why NetworkFirst instead of CacheFirst?**
1. **Data Freshness**: Weather data changes frequently, users expect current conditions
2. **Offline Graceful Degradation**: Cache still provides backup when network fails
3. **Background Sync**: Fresh data loads automatically when online
4. **User Expectations**: Weather apps should show latest data, not stale forecasts

**Why not StaleWhileRevalidate?**
- Would show stale data immediately while fetching fresh data
- Users might see outdated conditions/forecasts temporarily
- Weather data freshness is critical for decision-making

## Development vs Production

### Development Mode
- Service worker disabled in dev server (`npm run dev`)
- No caching interference during development
- Hot module replacement works normally
- PWA features unavailable

### Preview Mode
- Service worker active in preview (`npm run preview`)
- Tests PWA functionality before deployment
- Uses production build artifacts
- Allows testing offline behavior locally

### Production Mode
- Service worker automatically registered
- All PWA features enabled
- Deployed via Docker with nginx
- HTTPS required for service worker

## Testing PWA Features

### Installation Testing
1. Build production bundle: `npm run build`
2. Preview locally: `npm run preview`
3. Open in Chrome DevTools > Application > Manifest
4. Verify manifest loads correctly
5. Click "Add to homescreen" in DevTools

### Offline Testing
1. Load app while online
2. Open DevTools > Application > Service Workers
3. Check "Offline" checkbox
4. Navigate app, verify cached data loads
5. Try fetching new ZIP (should fail gracefully)

### Cache Testing
1. DevTools > Application > Cache Storage
2. Inspect precache entries (workbox-precache-v2)
3. Inspect runtime caches (nws-api-cache, etc.)
4. Monitor cache updates during navigation

### Update Testing
1. Make code changes
2. Build new version
3. Deploy/serve new version
4. Refresh app in browser
5. Watch DevTools console for SW update messages
6. Verify page reloads with new version

## Browser Compatibility

### Full PWA Support
- Chrome 67+ (Desktop & Android)
- Edge 79+ (Desktop & Android)
- Safari 11.1+ (iOS & macOS)
- Firefox 60+ (limited install support)
- Samsung Internet 8.0+

### Fallback Behavior
- Older browsers ignore service worker
- App works as standard SPA
- No offline support
- No install capability
- All functionality otherwise identical

## Security Considerations

### HTTPS Requirement
- Service workers only work on HTTPS
- Development exception for localhost
- Mixed content blocked (all assets must be HTTPS)

### Scope Limitations
- Service worker can only intercept requests within its scope
- Scope set to `/` to cover entire origin
- Cannot intercept cross-origin requests (CORS applies)

### Cache Poisoning Prevention
- Service worker served with `Cache-Control: no-cache`
- Workbox validates responses before caching
- Only status 200/0 responses cached
- Precache integrity checked via revision hashes

## Performance Impact

### Benefits
- **Instant Load**: Precached assets load without network
- **Reduced Data Usage**: Cached responses served locally
- **Offline Access**: Continue using app without connection
- **Background Updates**: Fresh data fetched without blocking UI

### Costs
- **Initial Install**: +100-200 KB download (service worker + workbox)
- **Storage**: 5-53 MB disk space for caches
- **Update Overhead**: Background update checks on navigation
- **Memory**: Service worker process (~5-10 MB RAM)

Net benefit is strongly positive for repeat visitors and mobile users.

## Future Enhancements

### Potential Improvements
1. **Background Sync**: Queue failed API requests, retry when online
2. **Push Notifications**: Alert users to severe weather warnings
3. **Periodic Background Sync**: Auto-refresh weather in background
4. **Share Target**: Allow sharing locations to app
5. **App Shortcuts**: Quick actions in app icon menu (favorite ZIPs)

### Current Limitations
- No notification permission requested
- No background sync implementation
- No share target defined in manifest
- Static precache (no dynamic asset loading)

## Related Documentation

- **Vite PWA Plugin**: https://vite-pwa-org.netlify.app/
- **Workbox Documentation**: https://developer.chrome.com/docs/workbox/
- **Web App Manifest Spec**: https://www.w3.org/TR/appmanifest/
- **Service Worker API**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

## Maintenance Notes

### When to Update Service Worker
- Adding new routes/pages (update precache patterns)
- Changing API endpoints (update runtime cache patterns)
- Modifying cache strategies (adjust Workbox config)
- Updating app icons (regenerate manifest icons)

### When to Bump Cache Versions
- Workbox handles precache versioning automatically
- Runtime caches persist across updates (intentional)
- Clear caches manually only for testing/debugging

### Debugging Tips
- Enable verbose logging: `workbox.setConfig({ debug: true })`
- Use Chrome DevTools > Application > Service Workers
- Check "Update on reload" during development
- Use "Skip waiting" to force activate new SW
- Monitor Network tab for cache hits (gear icon in size column)
