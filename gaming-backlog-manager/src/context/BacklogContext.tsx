import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Game, GameStatus, Platform } from '../types/game'
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
