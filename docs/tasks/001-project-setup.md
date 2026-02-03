# Task 001: Project Setup - React + TypeScript + Tailwind

**Phase**: 1 - Core PWA Foundation  
**Status**: TODO  
**Priority**: HIGH (Blocking)  
**Estimated Time**: 30-45 minutes

---

## Objective

Set up the foundational React + TypeScript + Tailwind CSS project structure with proper configuration and tooling.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Code editor (VS Code recommended)

## Steps

1. **Create React + TypeScript project**
   ```bash
   npm create vite@latest gaming-backlog-manager -- --template react-ts
   cd gaming-backlog-manager
   npm install
   ```

2. **Install Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure Tailwind**
   - Update `tailwind.config.js`:
   ```javascript
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```
   
   - Update `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Clean up starter files**
   - Remove default Vite boilerplate
   - Create clean App.tsx
   - Set up basic folder structure:
     ```
     src/
       components/
       types/
       utils/
       styles/
       App.tsx
       main.tsx
     ```

5. **Add PWA-specific dependencies**
   ```bash
   npm install workbox-window
   npm install -D vite-plugin-pwa
   ```

6. **Configure Vite for PWA**
   - Update `vite.config.ts` with PWA plugin
   - Set up service worker generation

7. **Test development server**
   ```bash
   npm run dev
   ```
   - Verify app loads at http://localhost:5173
   - Check Tailwind classes work

## Acceptance Criteria

- ✅ React + TypeScript project created
- ✅ Tailwind CSS installed and configured
- ✅ Development server runs without errors
- ✅ Hot reload works
- ✅ Tailwind styles apply correctly
- ✅ PWA dependencies installed
- ✅ Clean folder structure in place

## Deliverables

- `gaming-backlog-manager/` project folder
- `package.json` with all dependencies
- `vite.config.ts` configured for PWA
- `tailwind.config.js` configured
- Working dev server

## Notes

- Use Vite (not Create React App) for faster builds
- Tailwind v3 has JIT mode enabled by default
- Vite has built-in TypeScript support
- PWA plugin will generate service worker automatically

## Next Task

→ Task 002: Implement PWA Service Worker + Manifest
