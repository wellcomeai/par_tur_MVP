import { ChatMessage, BanyaInfo, RouteInfo, CompareInfo, ToolStep } from '../../types'
import { BanyaCard } from '../BanyaCard'
import { RouteCard } from '../RouteCard'
import { CompareTable } from '../CompareTable'

interface Props {
  message: ChatMessage
}

const TOOL_LABELS: Record<string, string> = {
  search_banyas: '🔍 Ищу бани...',
  get_banya_details: '📋 Изучаю баню...',
  build_route: '🗺️ Строю маршрут...',
  compare_banyas: '⚖️ Сравниваю бани...',
}

function stepDoneLabel(step: ToolStep): string {
  if (step.tool === 'search_banyas') {
    const count = Array.isArray(step.result)
      ? (step.result as BanyaInfo[]).filter((b) => !b.error).length
      : 0
    const region = (step.input.region as string) ?? ''
    return `🔍 Нашла ${count} вариантов в ${region}`
  }
  if (step.tool === 'get_banya_details') {
    const name = (step.result as BanyaInfo)?.name ?? 'объект'
    return `📋 Изучила: ${name}`
  }
  if (step.tool === 'build_route') return '🗺️ Маршрут построен'
  if (step.tool === 'compare_banyas') return '⚖️ Сравнение готово'
  return step.tool
}

function ToolStepBlock({
  step,
  isLast,
  isStreaming,
}: {
  step: ToolStep
  isLast: boolean
  isStreaming?: boolean
}) {
  const pending = step.result === undefined
  const spinning = pending && isLast && isStreaming

  // search_banyas: only a status line, no full list
  if (step.tool === 'search_banyas') {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400 py-0.5">
        {spinning ? (
          <span className="inline-block animate-spin">⚙️</span>
        ) : (
          <span className="text-green-500 font-medium">✓</span>
        )}
        <span>{pending ? (TOOL_LABELS[step.tool] ?? '⚙️ Обрабатываю...') : stepDoneLabel(step)}</span>
      </div>
    )
  }

  // Pending state for any other tool
  if (pending) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400 py-0.5">
        {spinning ? (
          <span className="inline-block animate-spin">⚙️</span>
        ) : (
          <span className="text-green-500 font-medium">✓</span>
        )}
        <span>{TOOL_LABELS[step.tool] ?? '⚙️ Обрабатываю...'}</span>
      </div>
    )
  }

  // get_banya_details → full BanyaCard
  if (step.tool === 'get_banya_details') {
    const banya = step.result as BanyaInfo
    if (banya?.error) return null
    return (
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-1 py-0.5">
          <span className="text-green-500 font-medium">✓</span>
          <span>{stepDoneLabel(step)}</span>
        </div>
        <BanyaCard banya={banya} />
      </div>
    )
  }

  // build_route → RouteCard
  if (step.tool === 'build_route') {
    return (
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-1 py-0.5">
          <span className="text-green-500 font-medium">✓</span>
          <span>{stepDoneLabel(step)}</span>
        </div>
        <RouteCard route={step.result as RouteInfo} />
      </div>
    )
  }

  // compare_banyas → CompareTable
  if (step.tool === 'compare_banyas') {
    return (
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-1 py-0.5">
          <span className="text-green-500 font-medium">✓</span>
          <span>{stepDoneLabel(step)}</span>
        </div>
        <CompareTable data={step.result as CompareInfo} />
      </div>
    )
  }

  return null
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 underline hover:text-orange-600 break-all"
        >
          {linkMatch[1]}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function AssistantText({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  return (
    <div
      className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed shadow-sm text-stone-700"
      style={{ background: '#ffffff', border: '1px solid #e7e5e0' }}
    >
      {content.split('\n').map((line, i) => (
        <p key={i} className={line === '' ? 'h-2' : undefined}>
          {renderMarkdown(line)}
        </p>
      ))}
      {isStreaming && (
        <span
          className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
          style={{ background: '#f97316' }}
        />
      )}
    </div>
  )
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

  const steps = message.toolSteps ?? []
  const hasSteps = steps.length > 0

  return (
    <div className="flex gap-2.5 mb-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-sm shadow-sm mt-0.5">
        🔥
      </div>
      <div className="flex-1 max-w-[85%] space-y-2">
        {hasSteps && (
          <div
            className="rounded-xl px-3 py-2.5 space-y-2"
            style={{ background: '#fafaf9', border: '1px solid #e7e5e0' }}
          >
            {steps.map((step, i) => (
              <ToolStepBlock
                key={i}
                step={step}
                isLast={i === steps.length - 1}
                isStreaming={message.isStreaming}
              />
            ))}
          </div>
        )}

        {message.content && (
          <AssistantText content={message.content} isStreaming={message.isStreaming} />
        )}

        {!message.content && message.isStreaming && !hasSteps && (
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
