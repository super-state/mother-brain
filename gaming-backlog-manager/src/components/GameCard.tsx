import { useState } from 'react'
import type { Game, GameStatus } from '../types/game'
import { useBacklog } from '../context/BacklogContext'
import { StatusPill } from './StatusPill'
import { getStatusTransition } from '../utils/statusTransitions'

interface GameCardProps {
  game: Game
}

export const GameCard = ({ game }: GameCardProps) => {
  const { deleteGame, updateGame } = useBacklog()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleStatusChange = (newStatus: GameStatus) => {
    const transitions = getStatusTransition(
      game.status,
      newStatus,
      game.dateStarted,
      game.dateCompleted
    )
    
    updateGame(game.id, {
      status: newStatus,
      ...transitions,
    })
  }

  const handleDelete = () => {
    deleteGame(game.id)
    setShowDeleteConfirm(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{game.title}</h3>
        <StatusPill status={game.status} onStatusChange={handleStatusChange} />
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <span className="font-medium">Platform:</span> {game.platform}
      </div>

      {game.notes && (
        <p className="text-sm text-gray-600 mb-3">{game.notes}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-sm"
        >
          Delete
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "<strong>{game.title}</strong>"?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
