import { useState, useRef, useEffect } from 'react'
import type { GameStatus } from '../types/game'
import { StatusMenu } from './StatusMenu'

interface StatusPillProps {
  status: GameStatus
  onStatusChange: (status: GameStatus) => void
}

export const StatusPill = ({ status, onStatusChange }: StatusPillProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)

  const getStatusColor = (s: GameStatus) => {
    switch (s) {
      case 'want':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'playing':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (s: GameStatus) => {
    switch (s) {
      case 'want':
        return 'Want to Play'
      case 'playing':
        return 'Playing'
      case 'completed':
        return 'Completed'
      default:
        return s
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={pillRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          px-2 py-1 text-xs font-medium rounded border cursor-pointer
          hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500
          ${getStatusColor(status)}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {getStatusLabel(status)} ▼
      </button>

      {isOpen && (
        <StatusMenu
          currentStatus={status}
          onStatusChange={onStatusChange}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
