# Task 002: PWA Service Worker + Manifest

**Phase**: 1 - Core PWA Foundation  
**Status**: TODO  
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Depends On**: Task 001

---

## Objective

Implement service worker for offline functionality and create web app manifest for installability.

## Prerequisites

- Task 001 completed (project setup)
- PWA dependencies installed
- Basic understanding of service worker lifecycle

## Steps

1. **Configure vite-plugin-pwa**
   Update `vite.config.ts`:
   ```typescript
   import { VitePWA } from 'vite-plugin-pwa'
   
   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
         manifest: {
           name: 'Gaming Backlog Manager',
           short_name: 'GameBacklog',
           description: 'Track and manage your video game backlog',
           theme_color: '#6366f1',
           background_color: '#1a1a1a',
           display: 'standalone',
           orientation: 'portrait-primary',
           start_url: '/',
           scope: '/',
           icons: [
             {
               src: '/icons/icon-192.png',
               sizes: '192x192',
               type: 'image/png'
             },
             {
               src: '/icons/icon-512.png',
               sizes: '512x512',
               type: 'image/png'
             },
             {
               src: '/icons/icon-maskable.png',
               sizes: '512x512',
               type: 'image/png',
               purpose: 'maskable'
             }
           ]
         },
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
           runtimeCaching: [
             {
               urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'google-fonts-cache',
                 expiration: {
                   maxEntries: 10,
                   maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                 }
               }
             }
           ]
         }
       })
     ]
   })
   ```

2. **Create app icons**
   - Create `public/icons/` folder
   - Generate icons (use online tool or placeholder):
     - icon-192.png (192x192)
     - icon-512.png (512x512)
     - icon-maskable.png (512x512 with safe zone)
   - Temporary: Use colored rectangles with text as placeholders

3. **Add offline fallback page**
   Create `public/offline.html`:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Offline - Gaming Backlog</title>
     <style>
       body {
         font-family: system-ui, -apple-system, sans-serif;
         display: flex;
         justify-content: center;
         align-items: center;
         height: 100vh;
         margin: 0;
         background: #1a1a1a;
         color: #ffffff;
         text-align: center;
       }
     </style>
   </head>
   <body>
     <div>
       <h1>🎮 You're Offline</h1>
       <p>No internet connection detected.</p>
       <p>Your backlog data is still accessible!</p>
     </div>
   </body>
   </html>
   ```

4. **Register service worker in app**
   Update `src/main.tsx`:
   ```typescript
   import { registerSW } from 'virtual:pwa-register'
   
   const updateSW = registerSW({
     onNeedRefresh() {
       if (confirm('New version available! Reload?')) {
         updateSW(true)
       }
     },
     onOfflineReady() {
       console.log('App ready to work offline')
     }
   })
   ```

5. **Add meta tags for mobile**
   Update `index.html`:
   ```html
   <meta name="theme-color" content="#6366f1">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black">
   <meta name="apple-mobile-web-app-title" content="GameBacklog">
   <link rel="apple-touch-icon" href="/icons/icon-192.png">
   ```

6. **Build and test**
   ```bash
   npm run build
   npm run preview
   ```
   - Open DevTools → Application tab
   - Verify service worker registered
   - Check manifest detected
   - Go offline and verify app still loads

## Acceptance Criteria

- ✅ Service worker registers successfully
- ✅ Manifest.json generated with correct fields
- ✅ Icons created (3 sizes)
- ✅ App works offline
- ✅ Meta tags for mobile present
- ✅ DevTools Application tab shows PWA ready
- ✅ Install prompt appears (on supported browsers)

## Testing Checklist

1. **Service Worker**
   - [ ] Registered in Application tab
   - [ ] Status: Activated and running
   - [ ] Caches app shell on first load

2. **Manifest**
   - [ ] Detected by browser
   - [ ] Icons load correctly
   - [ ] Theme color applies

3. **Offline**
   - [ ] App loads when offline
   - [ ] Navigation works offline
   - [ ] No broken images/styles

4. **Install**
   - [ ] Install prompt appears
   - [ ] App installs successfully
   - [ ] Opens in standalone mode

## Deliverables

- Configured `vite.config.ts` with PWA plugin
- `manifest.json` (auto-generated)
- App icons in `public/icons/`
- Service worker (auto-generated by Workbox)
- Updated `index.html` with meta tags
- Offline fallback page

## Notes

- vite-plugin-pwa uses Workbox under the hood
- Service worker auto-updates on new builds
- Test on real devices for install flow
- iOS Safari has limited PWA support

## Next Task

→ Task 003: Create localStorage Data Layer
