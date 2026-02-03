import { useState } from 'react'
import { useBacklog } from '../context/BacklogContext'
import { GameCard } from './GameCard'
import type { GameStatus, Platform } from '../types/game'

export const GameList = () => {
  const { games, getByStatus } = useBacklog()
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')

  const getFilteredGames = () => {
    let filtered = games

    if (statusFilter !== 'all') {
      filtered = getByStatus(statusFilter)
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(game => game.platform === platformFilter)
    }

    return filtered
  }

  const filteredGames = getFilteredGames()

  const groupByStatus = () => {
    const grouped = {
      want: filteredGames.filter(g => g.status === 'want'),
      playing: filteredGames.filter(g => g.status === 'playing'),
      completed: filteredGames.filter(g => g.status === 'completed'),
    }
    return grouped
  }

  const grouped = groupByStatus()

  const clearFilters = () => {
    setStatusFilter('all')
    setPlatformFilter('all')
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GameStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="want">Want to Play</option>
              <option value="playing">Playing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="platformFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              id="platformFilter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Platforms</option>
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
              <option value="Nintendo">Nintendo</option>
              <option value="Mobile">Mobile</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing <strong>{filteredGames.length}</strong> game{filteredGames.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Empty State */}
      {filteredGames.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No games yet! Add your first game to get started.</p>
        </div>
      )}

      {/* Grouped Game Lists */}
      {filteredGames.length > 0 && (
        <div className="space-y-6">
          {grouped.want.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-3 text-yellow-700">
                📋 Want to Play ({grouped.want.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped.want.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {grouped.playing.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">
                🎮 Currently Playing ({grouped.playing.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped.playing.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {grouped.completed.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-3 text-green-700">
                ✅ Completed ({grouped.completed.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped.completed.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
