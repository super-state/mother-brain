import { AddGameForm } from './components/AddGameForm'
import { GameList } from './components/GameList'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">
            🎮 Gaming Backlog Manager
          </h1>
          <p className="text-center text-gray-600">
            Track, prioritize, and manage your video game backlog
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <AddGameForm />
          <GameList />
        </div>
      </div>
    </div>
  )
}

export default App
