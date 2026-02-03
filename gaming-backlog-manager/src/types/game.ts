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
