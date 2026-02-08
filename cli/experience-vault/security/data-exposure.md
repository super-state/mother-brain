# Data Exposure & Authentication Patterns

## Web Applications Displaying User/Customer Data

**Problem**: Web apps deployed without authentication expose private data to the internet

**Common Scenario**:
- Developer builds "customer dashboard" or "admin panel"
- Data includes PII (names, emails, orders, addresses)
- Deploys to Vercel/Netlify/Firebase
- Realizes too late that ANYONE can access the data

**Gotcha**: 
- Dev mode often doesn't require auth (localhost = trusted)
- Easy to forget auth layer when focused on features
- Environment configs may bypass auth in production accidentally

**Solution Pattern**:

### 1. **Design-Time** (Vision/Planning Phase)
When user describes outcome involving:
- "customer data"
- "user profiles"
- "admin dashboard"
- "order history"
- ANY personal/business data

→ Ask: "Who should be able to see this data?"
→ Document in vision.md under "Access Control"

### 2. **Implementation** (Task Execution)
Before deploying ANY data-displaying feature:
- [ ] Implement authentication layer
- [ ] Test unauthenticated access (should be blocked)
- [ ] Test authenticated access (should work)
- [ ] Verify production environment has auth enabled

### 3. **Common Auth Patterns by Platform**

**Firebase**:
```javascript
// Require auth before data access
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirect to login
  } else {
    // Load protected data
  }
});
```

**Vercel + Supabase**:
```javascript
// Middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}
```

**Express API**:
```javascript
// Middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.get('/api/customers', requireAuth, (req, res) => {
  // Protected route
})
```

### 4. **Verification Checklist**
Before marking "deployment" task complete:
- [ ] Open incognito window
- [ ] Visit production URL
- [ ] Attempt to access protected routes
- [ ] Confirm redirect to login or 401 error
- [ ] Log in and verify access works

## When to Consult This

- **Step 3.3**: Vision Discovery - when user mentions displaying data
- **Step 9**: Task Execution - before deploying data-displaying features  
- **Step 10**: Task Validation - verify auth works before marking complete

## Related Gotchas

See also:
- `platforms/firebase-auth.md` - Firebase Console click-through requirement
- `deployment/environment-variables.md` - Auth tokens in production

## Sources

- [OWASP Top 10: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
