import { useState } from 'react'
import type { FormEvent } from 'react'
import { useBacklog } from '../context/BacklogContext'
import type { Platform, GameStatus } from '../types/game'

export const AddGameForm = () => {
  const { addGame } = useBacklog()
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<Platform>('PC')
  const [status, setStatus] = useState<GameStatus>('want')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (title.trim().length < 2) {
      alert('Game title must be at least 2 characters')
      return
    }

    addGame({
      title: title.trim(),
      platform,
      status,
      priority: 'medium',
      notes: '',
    })

    setTitle('')
    setPlatform('PC')
    setStatus('want')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Add New Game</h2>
      
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✓ Game added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Game Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter game title"
            required
            minLength={2}
          />
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PC">PC</option>
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox">Xbox</option>
            <option value="Nintendo">Nintendo</option>
            <option value="Mobile">Mobile</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GameStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="want">Want to Play</option>
            <option value="playing">Currently Playing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add Game
        </button>
      </form>
    </div>
  )
}
