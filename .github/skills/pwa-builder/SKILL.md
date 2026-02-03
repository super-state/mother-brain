---
name: pwa-builder
description: Create Progressive Web Apps with service workers, offline capabilities, and app-like experiences.
license: MIT
metadata:
  domain: web-development
  stage: production
allowed-tools: ask_user view create edit powershell web_search
---

# PWA Builder

Create production-ready Progressive Web Apps (PWAs) with offline-first architecture, service workers, and installable app experiences.

## Purpose

Automate PWA setup including service worker configuration, web app manifest, offline caching strategies, and mobile-responsive design.

## Operating Principles

- **Offline-first**: App works fully without internet connection
- **Cache strategically**: App shell cached, dynamic content uses stale-while-revalidate
- **Install seamlessly**: Custom install prompts with user-friendly UX
- **Performance focused**: <1s load time, Lighthouse score >90
- **Mobile-first**: Responsive design optimized for phones, works great on desktop
- **Test thoroughly**: Validate offline functionality before delivery

## Steps

1. **Gather Context via Wizard**
   - Use `ask_user` to understand the PWA requirements
   
   **Question 1**: What type of web app are you building?
   - Game backlog tracker
   - Todo/task manager
   - Note-taking app
   - [Freeform]
   
   **Question 2**: What should work offline?
   - Everything (full offline app)
   - Core features only (reading/viewing)
   - Just the UI shell (show "offline" message for data)
   
   **Question 3**: How should data be stored?
   - localStorage (simple, 5-10MB limit)
   - IndexedDB (complex, 50MB+ storage)
   - Hybrid (settings in localStorage, data in IndexedDB)
   
   **Question 4**: What tech stack?
   - React + TypeScript
   - Vue + TypeScript
   - Vanilla JS (no framework)
   
   **Question 5**: Visual style preference?
   - Modern/minimalist (Tailwind CSS)
   - Material Design (Material UI)
   - Custom CSS (I'll provide styles)

2. **Research PWA Requirements**
   - Check latest PWA standards (2026)
   - Review service worker best practices
   - Validate manifest requirements for target platforms
   - Use `web_search` for current guidelines

3. **Generate Project Structure**
   - Create project folder: `<app-name>/`
   - Set up package.json with dependencies
   - Create folder structure:
     ```
     src/
       components/
       styles/
       sw.js (service worker)
       manifest.json
       index.html
       index.js/tsx
     public/
       icons/ (multiple sizes)
       offline.html
     ```

4. **Create Service Worker**
   - Implement install event (cache app shell)
   - Implement activate event (clean old caches)
   - Implement fetch event (offline strategy)
   - Add caching strategies:
     - Cache-first: Static assets (CSS, JS, images)
     - Network-first: API calls with fallback
     - Stale-while-revalidate: Dynamic content
   - Add offline fallback page

5. **Create Web App Manifest**
   - Generate manifest.json with:
     - name, short_name
     - start_url, display: "standalone"
     - theme_color, background_color
     - icons (192x192, 512x512, maskable)
     - orientation, scope
   - Link manifest in index.html
   - Add meta tags for mobile

6. **Generate App Icons**
   - Create placeholder icons or guide user to icon generator
   - Provide multiple sizes: 192x192, 512x512
   - Create maskable icon variant
   - Save to public/icons/

7. **Implement Install Prompt**
   - Listen for `beforeinstallprompt` event
   - Show custom install button/banner
   - Handle user accept/decline
   - Track installation analytics (optional)

8. **Add Offline Detection**
   - Implement online/offline listeners
   - Show UI indicator when offline
   - Queue failed requests for retry when online
   - Use background sync API if needed

9. **Configure Build**
   - Set up build script (Vite, Webpack, or Parcel)
   - Add service worker registration
   - Configure for production (minify, bundle)
   - Generate source maps

10. **Test Offline Functionality**
    - Register service worker
    - Open app in browser
    - Go offline (DevTools → Network → Offline)
    - Verify app loads and functions
    - Test install flow
    - Check Lighthouse PWA score (target: >90)

11. **Deploy**
    - Deploy to Vercel, Netlify, or similar
    - Verify HTTPS (required for service workers)
    - Test on real devices (iOS, Android)
    - Provide deployment URL

12. **Validate & Test**
    - ✅ App loads offline
    - ✅ Service worker registered successfully
    - ✅ Manifest detected by browser
    - ✅ Install prompt works
    - ✅ Lighthouse PWA score >90
    - ✅ Works on mobile devices
    - ✅ Icons display correctly

## Caching Strategies Reference

### Cache-First (Static Assets)
```javascript
// CSS, JS, images, fonts
if (cachedResponse) return cachedResponse;
return fetch(request).then(response => {
  cache.put(request, response.clone());
  return response;
});
```

### Network-First (Dynamic Data)
```javascript
// API calls, user data
try {
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
} catch {
  return cache.match(request) || offlineFallback;
}
```

### Stale-While-Revalidate (Balanced)
```javascript
// Content that updates but cached version OK
const cachedResponse = await cache.match(request);
const fetchPromise = fetch(request).then(response => {
  cache.put(request, response.clone());
  return response;
});
return cachedResponse || fetchPromise;
```

## Example Manifest

```json
{
  "name": "Gaming Backlog Manager",
  "short_name": "GameBacklog",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Notes

- Service workers only work over HTTPS (or localhost for dev)
- Browsers cache service workers aggressively - use versioning
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari has limited PWA support (no push notifications yet)
- Consider using Workbox library for complex caching needs
