import { ChatWindow } from './components/Chat/ChatWindow'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <span className="text-2xl">🔥</span>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">ПарТур</h1>
          <p className="text-gray-400 text-xs">AI-агент по баням России</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto">
        <ChatWindow />
      </main>
    </div>
  )
}
