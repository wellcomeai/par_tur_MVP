import { ChatMessage, BanyaInfo, RouteInfo, CompareInfo } from '../../types'
import { BanyaCard } from '../BanyaCard'
import { RouteCard } from '../RouteCard'
import { CompareTable } from '../CompareTable'

interface Props {
  message: ChatMessage
}

const TOOL_LABELS: Record<string, string> = {
  search_banyas: '🔍 Ищу бани...',
  get_banya_details: '📋 Получаю детали...',
  build_route: '🗺️ Строю маршрут...',
  compare_banyas: '⚖️ Сравниваю бани...',
}

function ToolResultBlock({ tool, data }: { tool?: string; data: unknown }) {
  if (!tool || !data) return null
  if (tool === 'search_banyas' && Array.isArray(data)) {
    return (
      <div className="mt-2 space-y-2">
        {(data as BanyaInfo[]).slice(0, 5).map((b, i) => (
          <BanyaCard key={b.id || i} banya={b} />
        ))}
      </div>
    )
  }
  if (tool === 'get_banya_details' && typeof data === 'object' && data !== null) {
    return <BanyaCard banya={data as BanyaInfo} />
  }
  if (tool === 'build_route' && typeof data === 'object' && data !== null) {
    return <RouteCard route={data as RouteInfo} />
  }
  if (tool === 'compare_banyas' && typeof data === 'object' && data !== null) {
    return <CompareTable data={data as CompareInfo} />
  }
  return null
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[78%] text-sm leading-relaxed shadow-sm"
          style={{ background: '#f97316', color: '#fff' }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 mb-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-sm shadow-sm mt-0.5">
        🔥
      </div>
      <div className="flex-1 max-w-[85%]">
        {message.toolUse && (
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-2 mt-1">
            <span className="animate-spin inline-block">⚙️</span>
            <span>{TOOL_LABELS[message.toolUse.tool] ?? 'Обрабатываю...'}</span>
          </div>
        )}

        {message.toolResult && (
          <ToolResultBlock tool={message.toolUse?.tool} data={message.toolResult} />
        )}

        {message.content && (
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed shadow-sm text-stone-700 whitespace-pre-wrap"
            style={{ background: '#ffffff', border: '1px solid #e7e5e0' }}
          >
            {message.content}
            {message.isStreaming && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
                style={{ background: '#f97316' }}
              />
            )}
          </div>
        )}

        {!message.content && message.isStreaming && (
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 shadow-sm"
            style={{ background: '#ffffff', border: '1px solid #e7e5e0' }}
          >
            <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  )
}
