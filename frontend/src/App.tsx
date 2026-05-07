import { ChatWindow } from './components/Chat/ChatWindow'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f7f4' }}>
      <header className="bg-white border-b border-stone-200 px-5 py-3.5 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-lg shadow-sm">
          🔥
        </div>
        <div>
          <h1 className="text-stone-800 font-bold text-base leading-tight">ПарТур</h1>
          <p className="text-stone-400 text-xs">AI-агент по баням России</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden max-w-3xl w-full mx-auto">
        <ChatWindow />
      </main>
    </div>
  )
}
