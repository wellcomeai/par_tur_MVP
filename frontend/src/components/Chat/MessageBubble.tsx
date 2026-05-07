import { ChatMessage, BanyaInfo, RouteInfo, CompareInfo } from '../../types'
import { BanyaCard } from '../BanyaCard'
import { RouteCard } from '../RouteCard'
import { CompareTable } from '../CompareTable'

interface Props {
  message: ChatMessage
}

const TOOL_LABELS: Record<string, string> = {
  search_banyas: 'Ищу бани...',
  get_banya_details: 'Получаю детали...',
  build_route: 'Строю маршрут...',
  compare_banyas: 'Сравниваю бани...',
}

function ToolResultBlock({ tool, data }: { tool?: string; data: unknown }) {
  if (!tool || !data) return null

  if (tool === 'search_banyas' && Array.isArray(data)) {
    return (
      <div className="mt-2">
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
      <div className="flex justify-end mb-4">
        <div className="bg-orange-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-sm">
        🔥
      </div>
      <div className="flex-1 max-w-[85%]">
        {message.toolUse && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="animate-pulse">⚙️</span>
            <span>{TOOL_LABELS[message.toolUse.tool] || 'Обрабатываю...'}</span>
          </div>
        )}

        {message.toolResult && (
          <ToolResultBlock tool={message.toolUse?.tool} data={message.toolResult} />
        )}

        {message.content && (
          <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-100 whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 bg-orange-400 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        )}

        {!message.content && message.isStreaming && (
          <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  )
}
