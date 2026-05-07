import { useState, KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export function InputBar({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-700 px-4 py-3 bg-gray-900">
      <div className="flex gap-2 items-end max-w-4xl mx-auto">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Спросите про бани... (Enter для отправки)"
          rows={1}
          className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none outline-none border border-gray-700 focus:border-orange-500 transition-colors disabled:opacity-50"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors flex-shrink-0"
        >
          ↑
        </button>
      </div>
      <p className="text-gray-600 text-xs text-center mt-1.5 max-w-4xl mx-auto">
        Shift+Enter для новой строки
      </p>
    </div>
  )
}
