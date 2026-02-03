import type { GameStatus } from '../types/game'

export interface StatusTransition {
  dateStarted?: string
  dateCompleted?: string
}

export const getStatusTransition = (
  currentStatus: GameStatus,
  newStatus: GameStatus,
  existingStarted?: string,
  existingCompleted?: string
): StatusTransition => {
  const transition: StatusTransition = {}

  // Want → Playing: Set dateStarted
  if (currentStatus === 'want' && newStatus === 'playing') {
    transition.dateStarted = new Date().toISOString()
  }

  // Want → Completed: Set both dates
  if (currentStatus === 'want' && newStatus === 'completed') {
    transition.dateStarted = existingStarted || new Date().toISOString()
    transition.dateCompleted = new Date().toISOString()
  }

  // Playing → Completed: Set dateCompleted
  if (currentStatus === 'playing' && newStatus === 'completed') {
    transition.dateCompleted = new Date().toISOString()
  }

  // Any → Playing: Ensure dateStarted exists
  if (newStatus === 'playing' && !existingStarted) {
    transition.dateStarted = new Date().toISOString()
  }

  // Any → Completed: Ensure both dates exist
  if (newStatus === 'completed') {
    if (!existingStarted) {
      transition.dateStarted = new Date().toISOString()
    }
    if (!existingCompleted) {
      transition.dateCompleted = new Date().toISOString()
    }
  }

  return transition
}
