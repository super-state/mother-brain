import type { GameStatus } from '../types/game'

interface StatusMenuProps {
  currentStatus: GameStatus
  onStatusChange: (status: GameStatus) => void
  onClose: () => void
}

export const StatusMenu = ({ currentStatus, onStatusChange, onClose }: StatusMenuProps) => {
  const statuses: { value: GameStatus; label: string; color: string }[] = [
    { value: 'want', label: 'Want to Play', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'playing', label: 'Currently Playing', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' },
  ]

  const handleSelect = (status: GameStatus) => {
    onStatusChange(status)
    onClose()
  }

  return (
    <div 
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[180px]"
      onClick={(e) => e.stopPropagation()}
    >
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => handleSelect(status.value)}
          className={`
            w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors
            ${currentStatus === status.value ? 'font-semibold bg-gray-50' : ''}
            first:rounded-t-md last:rounded-b-md
          `}
        >
          <span className={`px-2 py-1 text-xs font-medium rounded border ${status.color}`}>
            {status.label}
          </span>
          {currentStatus === status.value && <span className="ml-2">✓</span>}
        </button>
      ))}
    </div>
  )
}
