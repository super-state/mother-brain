# Example: Verification Request

## Scenario
Daemon completed task "Add user login endpoint" which modified:
- `src/auth/login.ts` (new file)
- `src/auth/middleware.ts` (modified)

## Assessment
1. Project type: Node.js (package.json exists)
2. Build command: `npm run build` (scripts.build found)
3. Test command: `npm test` (scripts.test found, not default "echo error")
4. Functional gate: Skipped (MVP mode)
