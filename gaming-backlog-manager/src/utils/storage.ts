import type { BacklogData, Game, GameStatus, Platform } from '../types/game'

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
