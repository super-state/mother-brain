# Task 008: Test Offline Functionality

**Phase**: 1 - Core PWA Foundation  
**Status**: ✅ COMPLETE  
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Depends On**: Tasks 002, 007

---

## Objective

Thoroughly test that the PWA works completely offline, validate service worker caching, and fix any offline issues.

## Steps

1. **Test initial offline capabilities**
   - Open app in browser
   - DevTools → Application → Service Workers
   - Verify service worker registered
   - DevTools → Network → Set to "Offline"
   - Refresh page → app should still load

2. **Test CRUD operations offline**
   - Go offline
   - Add new game → should work
   - Update game status → should work
   - Delete game → should work
   - Verify data persists in localStorage

3. **Test service worker caching**
   - Clear cache (DevTools → Application → Clear storage)
   - Load app online (populates cache)
   - Go offline
   - Navigate between views → should work
   - Check Cache Storage → verify files cached

4. **Test offline detection**
   - Add online/offline indicator
   - Show toast when going offline
   - Show toast when coming back online
   - Use `window.navigator.onLine` API

5. **Test install flow**
   - Chrome: Check for install prompt
   - Edge: Check install button in address bar
   - Test installation on desktop
   - Test Add to Home Screen on mobile
   - Verify app opens in standalone mode

6. **Test on real devices**
   - iPhone: Add to Home Screen
   - Android: Install via Chrome
   - Turn off WiFi/cellular
   - Verify app fully functional offline

7. **Fix any issues found**
   - Missing assets in cache
   - Failed fetch requests
   - Broken images
   - Service worker not updating

## Acceptance Criteria

- ✅ App loads completely offline
- ✅ All CRUD operations work offline
- ✅ Service worker caches all assets
- ✅ Offline indicator shows status
- ✅ Install prompt appears
- ✅ App installs successfully
- ✅ Standalone mode works
- ✅ Data persists offline
- ✅ Works on iOS and Android

## Testing Checklist

### Service Worker
- [ ] Registered and activated
- [ ] Caches app shell on install
- [ ] Serves cached files offline
- [ ] Updates when new version deployed

### Offline Functionality
- [ ] App loads without network
- [ ] Add game works offline
- [ ] Edit game works offline
- [ ] Delete game works offline
- [ ] localStorage persists data

### Install Experience
- [ ] Install prompt appears (Chrome/Edge)
- [ ] App installs successfully
- [ ] Icon shows on home screen/desktop
- [ ] Opens in standalone mode
- [ ] Splash screen shows (mobile)

### Real Device Testing
- [ ] iPhone - Safari - Add to Home Screen
- [ ] Android - Chrome - Install App
- [ ] iPad - Safari
- [ ] Windows - Chrome/Edge - Install
- [ ] All devices work fully offline

## Common Issues & Fixes

**Issue**: Service worker not updating
- **Fix**: Increment version in manifest, clear cache, hard reload

**Issue**: Assets not cached
- **Fix**: Add to `includeAssets` in vite.config.ts

**Issue**: App doesn't work offline
- **Fix**: Check service worker fetch handler, verify cache strategy

**Issue**: localStorage data lost
- **Fix**: Check for errors in storage.ts, verify JSON parse/stringify

**Issue**: Install prompt doesn't appear
- **Fix**: Verify manifest complete, check HTTPS, use Chrome/Edge

## Lighthouse PWA Audit

Run Lighthouse audit:
```bash
npm run build
npm run preview
# Open DevTools → Lighthouse → PWA
```

Target scores:
- PWA: 100
- Performance: >90
- Accessibility: 100
- Best Practices: 100

## Deliverables

- Fully tested offline app
- Online/offline indicator component
- Lighthouse PWA score report
- Real device test results
- Fixed any bugs found

## Notes

- Service workers require HTTPS (except localhost)
- iOS Safari has limited PWA support
- Test thoroughly before claiming "works offline"
- Document any platform-specific limitations

## Next Task

→ Task 009: Deploy to Vercel/Netlify
