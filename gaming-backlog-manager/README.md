# 🎮 Gaming Backlog Manager

A Progressive Web App (PWA) to track, prioritize, and manage your video game backlog. Built with React, TypeScript, Vite, and Tailwind CSS.

## ✨ Features

- ✅ **Add & Track Games** - Easily add games to your backlog with platform and status
- 🎯 **Status Workflow** - Want to Play → Playing → Completed
- 💾 **Offline-First** - Works completely offline with localStorage
- 📱 **PWA Support** - Install on mobile and desktop
- 🎨 **Responsive Design** - Mobile-first UI that works everywhere
- ⚡ **Fast & Lightweight** - ~215KB total bundle size

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS v4** - Styling
- **VitePWA** - Service worker & manifest generation
- **localStorage** - Data persistence

## 📦 Project Structure

```
src/
├── components/       # React components
│   ├── AddGameForm.tsx
│   ├── GameCard.tsx
│   ├── GameList.tsx
│   ├── StatusPill.tsx
│   └── StatusMenu.tsx
├── context/         # React context providers
│   └── BacklogContext.tsx
├── types/           # TypeScript interfaces
│   └── game.ts
├── utils/           # Utility functions
│   ├── storage.ts
│   └── statusTransitions.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🎮 Usage

1. **Add a game**: Fill out the form with game title, platform, and status
2. **Change status**: Click the status badge on any game card to update
3. **Filter games**: Use the filter dropdowns to view specific platforms or statuses
4. **Delete games**: Click delete and confirm to remove a game

## 📱 Install as PWA

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Follow the installation prompts
3. App will open in standalone window

### Mobile (iOS/Android)
1. Open in Safari (iOS) or Chrome (Android)
2. Tap Share → Add to Home Screen
3. App will launch like a native app

## 🔌 Offline Functionality

The app works completely offline thanks to:
- **Service Worker** - Caches app shell and assets
- **localStorage** - Persists game data locally
- **PWA Manifest** - Enables installation

All CRUD operations (Create, Read, Update, Delete) work without an internet connection.

## 🏗️ Development Roadmap

**Phase 1: Core PWA Foundation** ✅ COMPLETE
- [x] Project setup with React + TypeScript + Vite
- [x] PWA service worker & manifest
- [x] localStorage data layer
- [x] Game list with CRUD operations
- [x] Status workflow (Want → Playing → Completed)
- [x] Mobile-responsive UI
- [x] Offline functionality
- [x] Deployment

**Phase 2: Prioritization & Tracking** (Coming Next)
- [ ] Priority system (Low, Medium, High)
- [ ] Play time tracking
- [ ] Notes & tags
- [ ] Search functionality
- [ ] Sort & advanced filters

**Phase 3: Social & Sync** (Future)
- [ ] Supabase backend
- [ ] User authentication
- [ ] Cloud sync
- [ ] Share lists with friends

## 📄 License

MIT

## 🙏 Acknowledgments

Built with ❤️ using:
- [Vite](https://vitejs.dev)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [VitePWA](https://vite-pwa-org.netlify.app)

---

**Built with Mother Brain framework** 🧠👽

