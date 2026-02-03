# Task 003: localStorage Data Layer

**Phase**: 1 - Core PWA Foundation  
**Status**: TODO  
**Priority**: HIGH  
**Estimated Time**: 45 minutes  
**Depends On**: Task 001

---

## Objective

Create a robust localStorage-based data layer for persisting game backlog data offline-first.

## Prerequisites

- Task 001 completed
- TypeScript types defined
- Understanding of localStorage API

## Steps

1. **Define TypeScript types**
   Create `src/types/game.ts`:
   ```typescript
   export type GameStatus = 'want' | 'playing' | 'completed' | 'abandoned'
   export type GamePriority = 'high' | 'medium' | 'low'
   export type Platform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile' | 'Other'
   
   export interface Game {
     id: string
     title: string
     platform: Platform
     status: GameStatus
     priority?: GamePriority
     playtime?: number // minutes
     progress?: number // 0-100
     rating?: number // 1-5
     notes?: string
     coverUrl?: string
     tags?: string[]
     dateAdded: string // ISO date
     dateStarted?: string
     dateCompleted?: string
   }
   
   export interface BacklogData {
     games: Game[]
     lastSync: string
     version: string
   }
   ```

2. **Create storage utility**
   Create `src/utils/storage.ts`:
   ```typescript
   import { BacklogData, Game } from '../types/game'
   
   const STORAGE_KEY = 'gaming-backlog-data'
   const STORAGE_VERSION = '1.0'
   
   export const storage = {
     // Initialize with empty data
     init(): void {
       const existing = localStorage.getItem(STORAGE_KEY)
       if (!existing) {
         this.save({ games: [], lastSync: new Date().toISOString(), version: STORAGE_VERSION })
       }
     },
     
     // Load all data
     load(): BacklogData {
       const data = localStorage.getItem(STORAGE_KEY)
       if (!data) {
         return { games: [], lastSync: new Date().toISOString(), version: STORAGE_VERSION }
       }
       return JSON.parse(data)
     },
     
     // Save all data
     save(data: BacklogData): void {
       data.lastSync = new Date().toISOString()
       localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
     },
     
     // Get all games
     getGames(): Game[] {
       return this.load().games
     },
     
     // Add new game
     addGame(game: Omit<Game, 'id' | 'dateAdded'>): Game {
       const data = this.load()
       const newGame: Game = {
         ...game,
         id: crypto.randomUUID(),
         dateAdded: new Date().toISOString()
       }
       data.games.push(newGame)
       this.save(data)
       return newGame
     },
     
     // Update game
     updateGame(id: string, updates: Partial<Game>): Game | null {
       const data = this.load()
       const index = data.games.findIndex(g => g.id === id)
       if (index === -1) return null
       
       data.games[index] = { ...data.games[index], ...updates }
       this.save(data)
       return data.games[index]
     },
     
     // Delete game
     deleteGame(id: string): boolean {
       const data = this.load()
       const filtered = data.games.filter(g => g.id !== id)
       if (filtered.length === data.games.length) return false
       
       data.games = filtered
       this.save(data)
       return true
     },
     
     // Get by status
     getByStatus(status: GameStatus): Game[] {
       return this.getGames().filter(g => g.status === status)
     },
     
     // Get by platform
     getByPlatform(platform: Platform): Game[] {
       return this.getGames().filter(g => g.platform === platform)
     },
     
     // Clear all data
     clear(): void {
       localStorage.removeItem(STORAGE_KEY)
       this.init()
     },
     
     // Export data (for backup)
     export(): string {
       return JSON.stringify(this.load(), null, 2)
     },
     
     // Import data (from backup)
     import(jsonData: string): boolean {
       try {
         const data = JSON.parse(jsonData) as BacklogData
         this.save(data)
         return true
       } catch {
         return false
       }
     }
   }
   ```

3. **Create React context for state management**
   Create `src/context/BacklogContext.tsx`:
   ```typescript
   import React, { createContext, useContext, useState, useEffect } from 'react'
   import { Game, GameStatus, Platform } from '../types/game'
   import { storage } from '../utils/storage'
   
   interface BacklogContextType {
     games: Game[]
     addGame: (game: Omit<Game, 'id' | 'dateAdded'>) => void
     updateGame: (id: string, updates: Partial<Game>) => void
     deleteGame: (id: string) => void
     getByStatus: (status: GameStatus) => Game[]
     getByPlatform: (platform: Platform) => Game[]
     refresh: () => void
   }
   
   const BacklogContext = createContext<BacklogContextType | null>(null)
   
   export const BacklogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [games, setGames] = useState<Game[]>([])
     
     useEffect(() => {
       storage.init()
       setGames(storage.getGames())
     }, [])
     
     const refresh = () => setGames(storage.getGames())
     
     const addGame = (game: Omit<Game, 'id' | 'dateAdded'>) => {
       storage.addGame(game)
       refresh()
     }
     
     const updateGame = (id: string, updates: Partial<Game>) => {
       storage.updateGame(id, updates)
       refresh()
     }
     
     const deleteGame = (id: string) => {
       storage.deleteGame(id)
       refresh()
     }
     
     const getByStatus = (status: GameStatus) => storage.getByStatus(status)
     const getByPlatform = (platform: Platform) => storage.getByPlatform(platform)
     
     return (
       <BacklogContext.Provider value={{ games, addGame, updateGame, deleteGame, getByStatus, getByPlatform, refresh }}>
         {children}
       </BacklogContext.Provider>
     )
   }
   
   export const useBacklog = () => {
     const context = useContext(BacklogContext)
     if (!context) throw new Error('useBacklog must be used within BacklogProvider')
     return context
   }
   ```

4. **Wrap app with provider**
   Update `src/main.tsx`:
   ```typescript
   import { BacklogProvider } from './context/BacklogContext'
   
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <BacklogProvider>
         <App />
       </BacklogProvider>
     </React.StrictMode>
   )
   ```

5. **Test storage layer**
   Create test component to verify CRUD operations work

## Acceptance Criteria

- ✅ TypeScript types defined for all data models
- ✅ Storage utility with CRUD operations
- ✅ Data persists across page refreshes
- ✅ React context provides state management
- ✅ Add/update/delete operations work
- ✅ Filter by status and platform work
- ✅ Export/import functionality works
- ✅ localStorage size limits respected (<5MB)

## Testing Checklist

1. **Storage Operations**
   - [ ] Add game → persists in localStorage
   - [ ] Update game → changes persist
   - [ ] Delete game → removed from storage
   - [ ] Refresh page → data still there

2. **Data Integrity**
   - [ ] IDs are unique (UUID)
   - [ ] Timestamps auto-populate
   - [ ] JSON structure valid

3. **Edge Cases**
   - [ ] Handle empty storage
   - [ ] Handle corrupted data
   - [ ] Handle storage quota exceeded

## Deliverables

- `src/types/game.ts` - Type definitions
- `src/utils/storage.ts` - Storage utility
- `src/context/BacklogContext.tsx` - React context
- Updated `src/main.tsx` with provider

## Notes

- localStorage limit: ~5-10MB (sufficient for thousands of games)
- crypto.randomUUID() requires HTTPS (or localhost)
- Consider IndexedDB for Phase 2 if more storage needed
- Data versioning allows future migrations

## Next Task

→ Task 004: Build Game List Component
