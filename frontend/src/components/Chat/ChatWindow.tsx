import { nanoid } from '../utils/nanoid'
import { useChatStore } from '../../store/chatStore'
import { streamChat } from '../../services/api'
import { SSEEvent } from '../../types'
import { MessageList } from './MessageList'
import { InputBar } from './InputBar'

const SUGGESTIONS = [
  'Ищу бани в Рязани',
  'ПарТур по Москве — 3 бани за день',
  'Лучшие бани Краснодарского края',
  'Сравни 3 бани в Казани',
]

function EmptyState({ onSuggest }: { onSuggest: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-6xl mb-4">🔥</div>
      <h2 className="text-white text-xl font-semibold mb-2">Привет! Я ПарТур Агент</h2>
      <p className="text-gray-400 text-sm text-center mb-8 max-w-sm">
        Помогу найти лучшие бани в вашем регионе, построю маршрут ПарТура и сравню варианты
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500 text-gray-300 text-sm rounded-xl px-4 py-3 text-left transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChatWindow() {
  const { messages, isLoading, addMessage, appendToLastMessage, setLastMessageToolUse, setLastMessageToolResult, setLastMessageStreaming, setLoading } = useChatStore()

  const handleSend = async (text: string) => {
    if (isLoading) return

    addMessage({ id: nanoid(), role: 'user', content: text })
    addMessage({ id: nanoid(), role: 'assistant', content: '', isStreaming: true })
    setLoading(true)

    const history = messages
      .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content))
      .map((m) => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: text })

    await streamChat(
      history,
      (event: SSEEvent) => {
        if (event.type === 'text_delta' && event.content) {
          appendToLastMessage(event.content)
        } else if (event.type === 'tool_use' && event.tool) {
          setLastMessageToolUse(event.tool, event.input ?? {})
        } else if (event.type === 'tool_result') {
          setLastMessageToolResult(event.data)
        } else if (event.type === 'done') {
          setLastMessageStreaming(false)
          setLoading(false)
        }
      },
      (error) => {
        appendToLastMessage(`Ошибка: ${error.message}`)
        setLastMessageStreaming(false)
        setLoading(false)
      }
    )
  }

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <EmptyState onSuggest={handleSend} />
      ) : (
        <MessageList messages={messages} />
      )}
      <InputBar onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
