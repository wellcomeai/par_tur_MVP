import { nanoid } from '../utils/nanoid'
import { useChatStore } from '../../store/chatStore'
import { streamChat } from '../../services/api'
import { SSEEvent } from '../../types'
import { MessageList } from './MessageList'
import { InputBar } from './InputBar'

const SUGGESTIONS = [
  { icon: '🛁', text: 'Ищу бани в Рязани' },
  { icon: '🗺️', text: 'ПарТур по Москве — 3 бани за день' },
  { icon: '⭐', text: 'Лучшие бани Краснодарского края' },
  { icon: '⚖️', text: 'Сравни 3 бани в Казани' },
]

function EmptyState({ onSuggest }: { onSuggest: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-md"
        style={{ background: 'linear-gradient(135deg, #fb923c, #ef4444)' }}
      >
        🔥
      </div>
      <h2 className="text-stone-800 text-xl font-semibold mb-1.5">Привет! Я ПарТур Агент</h2>
      <p className="text-stone-400 text-sm text-center mb-8 max-w-xs leading-relaxed">
        Найду лучшие бани в вашем регионе, построю маршрут ПарТура и помогу выбрать
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggest(s.text)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-stone-600 transition-all hover:shadow-sm hover:-translate-y-0.5 active:scale-98"
            style={{ background: '#ffffff', border: '1px solid #e7e5e0' }}
          >
            <span className="text-base">{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChatWindow() {
  const {
    messages,
    isLoading,
    addMessage,
    appendToLastMessage,
    setLastMessageToolUse,
    setLastMessageToolResult,
    setLastMessageStreaming,
    setLoading,
  } = useChatStore()

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
