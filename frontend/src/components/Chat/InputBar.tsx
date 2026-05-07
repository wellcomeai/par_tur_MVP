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
    <div className="px-4 pb-4 pt-2" style={{ background: '#f8f7f4' }}>
      <div
        className="flex gap-2 items-end rounded-2xl px-3 py-2 shadow-sm"
        style={{ background: '#ffffff', border: '1px solid #e7e5e0' }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Спросите про бани... (Enter — отправить)"
          rows={1}
          className="flex-1 bg-transparent text-stone-700 placeholder-stone-400 text-sm resize-none outline-none py-1.5 leading-relaxed disabled:opacity-50"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{ background: '#f97316' }}
        >
          ↑
        </button>
      </div>
      <p className="text-stone-400 text-xs text-center mt-1.5">
        Shift+Enter для новой строки
      </p>
    </div>
  )
}
