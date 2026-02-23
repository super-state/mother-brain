# Example: Running Verification Pipeline

## Input
Daemon has completed a task that modified `src/auth/login.ts` and `src/auth/middleware.ts`.

## Verification Run

### Gate 1: Build
```
$ npm run build
> tsc --noEmit

✅ Build passed (1.2s)
Evidence: "Build passed in 1200ms, 0 errors"
```

### Gate 2: Test
```
$ npm test
> vitest run

 ✓ src/auth/login.test.ts (3 tests)
 ✓ src/auth/middleware.test.ts (5 tests)

Test Files  2 passed (2)
Tests       8 passed (8)

✅ Tests passed (3.4s)
Evidence: "8/8 tests passed in 3400ms"
```

### Gate 3: Functional (Post-MVP)
```
Skipped — functional gate not enabled in MVP
```

### Confidence Classification
- Build: ✅ Pass
- Tests: ✅ Pass  
- Functional: ⬜ Skip (MVP)
- **Result: HIGH confidence**

### Action
- Auto-commit to main branch
- Commit message: `feat: add login endpoint and auth middleware`
- Notify via Telegram: "✅ Task complete: Add login endpoint"
