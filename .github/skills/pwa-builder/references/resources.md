# PWA Resources & Best Practices

## Official Documentation

### MDN Web Docs
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Web App Manifest**: https://developer.mozilla.org/en-US/docs/Web/Manifest
- **PWA Tutorials**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

### Google Developers
- **PWA Codelabs**: https://developers.google.com/codelabs/pwa-training/pwa03--going-offline
- **Workbox Library**: https://developers.google.com/web/tools/workbox
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

### Microsoft Edge
- **PWA Best Practices**: https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/best-practices
- **Install PWAs**: https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux

## Service Worker Caching Strategies

### Source: Magicbell Blog
**URL**: https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies

**Key Insights**:
- **Stale-While-Revalidate**: Best for content that updates but cached version acceptable
- **Cache-First**: Ideal for static assets that rarely change
- **Network-First**: Use for dynamic data with offline fallback
- Keep service worker lean for faster install and lower memory usage

### Source: Codezup
**URL**: https://codezup.com/building-progressive-web-apps-with-service-workers-and-offline-support/

**Key Points**:
- Pre-cache app shell during install event
- Clean up old caches in activate event
- Intercept fetch events for offline support
- Provide fallback pages for unavailable routes

## Offline-First Architecture

### Source: RDePaz Articles
**URL**: https://rdepaz.com/articles/progressive-web-apps-offline-first/

**Benefits**:
- Works reliably regardless of connectivity
- Faster load times (serve from cache)
- Reduces server load
- Expands accessibility to poor internet areas

**Implementation**:
- Cache essential assets on first visit
- Use IndexedDB for user-generated content
- Queue failed requests for background sync
- Show clear offline/online indicators

## Web App Manifest Guidelines

### Complete Metadata Fields
```json
{
  "name": "Full Application Name",
  "short_name": "App Name",
  "description": "Brief description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [...]
}
```

### Display Modes
- **standalone**: App-like, no browser UI
- **fullscreen**: Full screen, hides status bar
- **minimal-ui**: Minimal browser controls
- **browser**: Normal browser tab

### Icon Requirements
- **192x192**: Standard icon for install prompts
- **512x512**: High-res for splash screens
- **Maskable**: Safe zone for adaptive icons

## Install Prompt Best Practices

### Custom Install UI
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

installButton.addEventListener('click', async () => {
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User ${outcome} the install prompt`);
  deferredPrompt = null;
});
```

### When to Show Install Prompt
- After user engages with app (not immediately)
- When user completes key action (e.g., creates first item)
- Dismissed prompt shouldn't re-appear for 2+ weeks
- Track install acceptance rate

## Performance Optimization

### Lighthouse PWA Checklist
- ✅ Served over HTTPS
- ✅ Service worker registered
- ✅ Manifest with required fields
- ✅ Icons provided (192px, 512px)
- ✅ Viewport meta tag set
- ✅ Content sized correctly for viewport
- ✅ Page load fast on 3G (<5s)
- ✅ Offline fallback page

### Bundle Size Tips
- Code-split heavy libraries
- Lazy load routes/components
- Compress images (WebP format)
- Minify CSS/JS
- Use tree-shaking

## Browser Compatibility

### Chrome/Edge (Chromium)
✅ Full PWA support
✅ Install prompts
✅ Push notifications
✅ Background sync

### Firefox
✅ Service workers
✅ Manifest support
⚠️ No install prompts (manual via menu)
✅ Push notifications

### Safari (iOS/macOS)
⚠️ Limited PWA support
✅ Add to home screen
❌ No push notifications (iOS)
⚠️ Service worker limitations
✅ Works well for offline apps

### Samsung Internet
✅ Full PWA support
✅ Install prompts
✅ Ambient badging

## Testing Tools

### Browser DevTools
- **Application tab**: Inspect manifest, service worker, cache
- **Network tab**: Simulate offline mode
- **Lighthouse**: PWA audit score

### Online Tools
- **PWA Builder**: https://www.pwabuilder.com/
- **Manifest Generator**: https://app-manifest.firebaseapp.com/
- **Icon Generator**: https://realfavicongenerator.net/

### Real Device Testing
- Test on actual iOS and Android devices
- Check install flow on different browsers
- Verify offline functionality
- Test push notifications

## Common Pitfalls

❌ **Not versioning service worker**: Cached SW won't update
❌ **Caching everything**: Wastes storage, slow updates
❌ **No offline fallback**: Broken experience when offline
❌ **Missing HTTPS**: Service workers won't register
❌ **Large app shell**: Slow initial load
❌ **No install prompt**: Users don't know it's installable
❌ **Not testing offline**: Assumptions fail in real usage

## Advanced Features

### Background Sync
```javascript
// Register sync event
registration.sync.register('sync-data');

// In service worker
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

### Push Notifications
```javascript
// Request permission
const permission = await Notification.requestPermission();

// Subscribe to push
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidPublicKey
});
```

### Share Target API
```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

## Resources Updated
**Last Updated**: 2026-02-03  
**Sources**: MDN, Google Developers, Microsoft Edge Docs, Magicbell, Codezup, RDePaz
