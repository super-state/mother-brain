# Firebase Authentication Gotchas

## Console Click-Through Requirement

**Problem**: Firebase Auth API calls fail with cryptic errors on first use

**Gotcha**: 
- Firebase requires manual Console UI interaction before Auth works
- Error message doesn't explain this requirement
- First-time project setup WILL fail without this step

**Solution**:

### 1. **Before ANY Auth Implementation**
- Open Firebase Console: https://console.firebase.google.com
- Navigate to: Project → Authentication → Sign-in method
- Enable at least ONE provider (Email/Password is simplest)
- Click "Save"

This one-time action activates Auth service.

### 2. **When Creating Auth Skills**
Skill creator should include:
```markdown
## Prerequisites
Before using this skill:
1. Enable Authentication in Firebase Console
2. Enable desired sign-in provider (Email/Password, Google, etc.)
3. Confirm provider shows as "Enabled" in Console
```

### 3. **Error Detection**
If user reports auth errors like:
- "Firebase: Error (auth/operation-not-allowed)"
- "This operation is not allowed"
- Auth silently fails

→ First response: "Have you enabled Authentication in Firebase Console?"

---

## Environment Variables

**Problem**: Firebase config accidentally committed to Git

**Gotcha**:
- Firebase config includes API keys
- Feels wrong to commit keys (security concern)
- BUT: Firebase client keys are MEANT to be public
- Confusion causes devs to over-protect client config

**Solution**:

### Client Config (Safe to Commit)
```javascript
// ✅ SAFE - This goes in public client code
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "project.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

These are **client keys** - designed to be public.
Security comes from Firebase Security Rules, not hiding keys.

### Admin SDK Keys (MUST PROTECT)
```javascript
// ❌ NEVER COMMIT - Server-side only
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-key.json'); // ← NEVER commit this
```

**Admin SDK keys** give full database access - these go in secrets.

---

## Production vs Development

**Problem**: Auth works in dev, fails in production

**Gotcha**:
- Authorized domains whitelist required for production
- localhost automatically allowed
- Custom domains need manual approval

**Solution**:

### 1. **Add Authorized Domains**
Firebase Console → Authentication → Settings → Authorized domains

Add:
- `your-domain.com`
- `www.your-domain.com`
- Any subdomains used

### 2. **Deployment Checklist**
Before deploying:
- [ ] Production domain added to authorized list
- [ ] OAuth redirect URIs updated (if using Google/GitHub/etc.)
- [ ] Test auth flow in production (incognito window)

---

## Emulator Gotchas

**Problem**: Users created in emulator don't persist

**Gotcha**:
- Firebase emulator doesn't save data between runs
- Users must be recreated on each restart
- Can't use emulator users in production

**Solution**:
- Use seed scripts for emulator test data
- Don't rely on emulator persistence
- Switch to dev project (not emulator) for persistent testing

---

## When to Consult This

- **Step 6**: Skill creation for Firebase projects
- **Step 9**: Task execution involving Firebase Auth
- **Step 10**: Deployment tasks with Firebase

## Related Gotchas

See also:
- `security/data-exposure.md` - Auth patterns for protecting data
- `deployment/firebase-deployment.md` - Firebase hosting gotchas

## Sources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Console](https://console.firebase.google.com)
