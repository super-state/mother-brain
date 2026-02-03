# Task 009: Deploy to Vercel/Netlify

**Phase**: 1 - Core PWA Foundation  
**Status**: TODO  
**Priority**: HIGH  
**Estimated Time**: 30 minutes  
**Depends On**: Task 008

---

## Objective

Deploy the Gaming Backlog Manager PWA to production on Vercel or Netlify with HTTPS and automatic deployments.

## Steps

1. **Prepare for deployment**
   - Run production build locally:
     ```bash
     npm run build
     npm run preview
     ```
   - Verify build succeeds
   - Check dist/ folder generated
   - Test production build works

2. **Choose hosting platform**
   **Option A: Vercel (Recommended)**
   - Best for React/Vite projects
   - Automatic HTTPS
   - Edge network (fast globally)
   - Free tier: Unlimited projects
   
   **Option B: Netlify**
   - Great PWA support
   - Automatic HTTPS
   - Form handling (future)
   - Free tier: Generous

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   
   # Follow prompts:
   # - Link to existing project? No
   # - Project name: gaming-backlog-manager
   # - Directory: ./ (current)
   # - Override build: No
   
   # Production deployment
   vercel --prod
   ```

4. **Deploy to Netlify (Alternative)**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy
   
   # Build command: npm run build
   # Publish directory: dist
   
   # Production deployment
   netlify deploy --prod
   ```

5. **Configure custom domain (Optional)**
   - Vercel: Settings → Domains → Add
   - Netlify: Domain settings → Add domain
   - Configure DNS (CNAME to platform)

6. **Set up automatic deployments**
   - Push code to GitHub
   - Connect repo to Vercel/Netlify
   - Auto-deploy on push to main branch

7. **Verify production deployment**
   - Visit deployed URL
   - Test app works
   - Check HTTPS certificate
   - Verify service worker registers
   - Test offline functionality
   - Test install prompt
   - Check Lighthouse scores

8. **Test on real devices**
   - Share URL via QR code
   - Test on iPhone
   - Test on Android
   - Verify install works
   - Confirm offline works

## Acceptance Criteria

- ✅ App deployed to production
- ✅ HTTPS enabled
- ✅ Custom domain (optional)
- ✅ Service worker registers on production
- ✅ Offline functionality works
- ✅ Install prompt appears
- ✅ Automatic deployments configured
- ✅ Works on real devices

## Testing Checklist

### Production Environment
- [ ] App loads at production URL
- [ ] HTTPS certificate valid
- [ ] No console errors
- [ ] Service worker registered
- [ ] Manifest detected

### PWA Features
- [ ] Offline mode works
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Standalone mode works

### Performance
- [ ] Load time <3s (3G)
- [ ] Lighthouse scores >90
- [ ] No broken images
- [ ] CSS/JS loads correctly

### Real Devices
- [ ] iPhone - works and installs
- [ ] Android - works and installs
- [ ] iPad - works
- [ ] Desktop - works and installs

## Deployment URLs

**Vercel**:
- Production: `https://gaming-backlog-manager.vercel.app`
- Preview: `https://gaming-backlog-manager-[hash].vercel.app`

**Netlify**:
- Production: `https://gaming-backlog-manager.netlify.app`
- Preview: `https://[branch]--gaming-backlog-manager.netlify.app`

## Environment Variables

None required for Phase 1 (localStorage only).

For Phase 2 (with backend):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deliverables

- Deployed production app
- Production URL
- Deployment configuration
- Automatic deployments enabled
- Real device test results

## Notes

- Vercel is recommended for Vite projects
- Both platforms offer generous free tiers
- HTTPS is automatic (required for PWAs)
- Preview deployments help with testing
- Consider custom domain for professional look

## Success Metrics

- ✅ **Phase 1 Complete!**
- ✅ App deployed and accessible
- ✅ PWA features working in production
- ✅ Users can install and use offline
- ✅ Foundation ready for Phase 2 features

## Next Phase

→ Phase 2: Prioritization & Tracking (docs/roadmap.md)
